import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { SharedVariablesService } from 'src/app/modules/job-order/light-industrial/services/shared-variables.service';
import { ICostAccountingCodeDetails, LocationDetails, OrgTypeData, SectorDetails, SectorOrgLevelConfigDto, TimeRange } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LightIndustrialService } from 'src/app/modules/job-order/light-industrial/services/light-industrial.service';
import { IUdfConfig } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { UdfImplementationService } from '@xrm-shared/common-components/udf-implementation/service/udf-implementation.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ICandidateDetails, IdmsPreview, IRootObject, IudfPreview } from '../../../interface/preview.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { LocationService } from '@xrm-master/location/services/location.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { forkJoin, of, Subject, takeUntil } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { mapFormToApiPayload } from '../../../models/prof.payload.model';
import { ProfessionalRequestService } from '../../../services/professional-request.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { RateUnitValue } from '@xrm-master/requisition-library/constant/rate-enum';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { DMSApiRequestPayload, DocumentControlConfig, IUploadedDocumentGridList } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';
import { BYTES_IN_GIGABYTE, BYTES_IN_KILOBYTE, BYTES_IN_MEGABYTE, FileSizeUnit } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.constant';
import { IProfReqSuccessResponse, ILaborCategoryDetails } from '../../../interface/shared-data.interface';
import { CostEstimationTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { IDropdown } from '@xrm-shared/models/common.model';
import { TransactionDataModel } from '@xrm-master/approval-configuration/constant/enum';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';

@Component({
	selector: 'app-preview',
	templateUrl: './preview.component.html',
	styleUrl: './preview.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class PreviewComponent implements OnInit, OnDestroy {
	@Input() isEditMode: boolean = false;
	@Input() uKey: string;
	@Input() statusId: number;
	public weekDayForm: FormGroup;
	public priviewRequestData: IRootObject;
	public costAccountingCodeDetails: ICostAccountingCodeDetails[] | null = [];
	private udfControlConfig: IUdfConfig[] = [];
	private dmsControlConfig: DocumentControlConfig[] = [];
	private savedDocument: IUploadedDocumentGridList[] = [];
	public dmsExtractedData: IdmsPreview[] = [];
	public udfExtractedData: IudfPreview[] = [];
	public approverExtractedData: IDropdown[] = [];
	public isSecurityClearanceRequired: boolean = false;
	public hasBenefitAdderLength: boolean;
	public resetStep = true;
	public currentStep = magicNumber.four;
	public steps = [
		{ label: this.localizationService.GetLocalizeMessage('JobDetails'), icon: "check", id: 'JobDetails' },
		{ label: this.localizationService.GetLocalizeMessage('AssignmentDetails'), icon: "check", id: 'AssignmentDetails' },
		{ label: "Financial Details", icon: "check", id: 'FinancialDetails' },
		{ label: "Approver & Other Details", icon: "check", id: 'ApproverOtherDetails' }
	];
	public daysInfo: IDayInfo[] = [];
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	public sectorDetails: SectorDetails;
	public locationDetails: LocationDetails | null;
	private labourCatData: ILaborCategoryDetails;
	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;
	private countryId: number;
	private userFullName: string;
	private currencyVal: string = '';
	public candidateFullName: string = '';
	private isSuccessToast: boolean = false;
	public isBudgetedHour: boolean = false;
	public isOTHousBilledAtShow: boolean = true;
	public isPhoneNumberExtension: boolean = false;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	@Output() backClicked = new EventEmitter<void>();

	// eslint-disable-next-line max-params
	constructor(
		private route: Router,
		private formBuilder: FormBuilder,
		private sectorService: SectorService,
		private toasterService: ToasterService,
		private sharedDataService: SharedDataService,
		private sharedVariablesService: SharedVariablesService,
		private lightIndustrialServices: LightIndustrialService,
		private localizationService: LocalizationService,
		private locationService: LocationService,
		private udfImplementationService: UdfImplementationService,
		private dmsImplementationService: DmsImplementationService,
		private costService: CostAccountingCodeService,
		private cdr: ChangeDetectorRef,
		public professionalRequestService: ProfessionalRequestService
	) {
		this.getCultureType();
		this.userFullName = this.localizationService.GetCulture(CultureFormat.UserFullName);
	}

	ngOnInit(): void {
		this.initializeForm();
		this.getDmsResponse();
		this.getUdfResponse();
		if(this.isEditMode){
			this.getSavedDocument();
		}
		this.getRequestData();
	}

	private initializeForm(): void {
		this.weekDayForm = this.formBuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null],
			PhoneNumber: [null],
			PhoneExt: [null]
		});
	}

	private getUdfResponse() {
		this.udfImplementationService.udfData$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data) => {
			this.udfControlConfig = data;
		});
	}

	private getDmsResponse() {
		this.dmsImplementationService.dmsData$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data) => {
			this.dmsControlConfig = data;
		});
	}

	private getSavedDocument(){
		this.dmsImplementationService.uploadedRecords$.subscribe((records: IUploadedDocumentGridList[]) => {
			this.savedDocument = records;
		});
	}

	private getRequestData() {
		this.priviewRequestData = this.transformDates(this.sharedDataService.getFormData());
		this.getDataById();
		this.setCandidateDetails(this.priviewRequestData);
		this.setSiftDetails(this.priviewRequestData);
		this.approverExtractedData = this.extractApproverDetails();
		this.udfExtractedData = this.extractUdfData();
		this.extractDmsData();
	}

	private getDataById() {
		const { SectorId, WorkLocationId, CostAccountingId } = this.priviewRequestData.requestDetails,
			{ LaborCategoryId } = this.priviewRequestData.positionDetails;

		forkJoin({
			sectorData: this.getSectorDataById(SectorId.Value),
			locationData: this.getLocationData(WorkLocationId.Value),
			labourCatData: this.getLabourCatData(LaborCategoryId.Value),
			costAccountingData: CostAccountingId
				? this.getCostAccountingDetailsById(CostAccountingId.Value)
				: of(null)
		}).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(({ sectorData, locationData, labourCatData, costAccountingData }) => {
			this.handleSectorData(sectorData);
			this.locationDetails = locationData.Data ?? null;
			this.handleLabourCatData(labourCatData);
			this.costAccountingCodeDetails = costAccountingData?.Data ?? null;

			this.cdr.detectChanges();
		});
	}

	private getSectorDataById(sectorId: number) {
		return this.sectorService.getSectorData(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$));
	}

	private getLocationData(locationId: number) {
		return this.locationService.getLocationData(locationId).pipe(takeUntil(this.destroyAllSubscriptions$));
	}

	private getLabourCatData(labCatId: number) {
		return this.professionalRequestService.getLabourCategoryDetails(labCatId).pipe(takeUntil(this.destroyAllSubscriptions$));
	}

	private getCostAccountingDetailsById(costAccountingCodeId: number) {
		return this.costService.getCostAccountingDetails(costAccountingCodeId).pipe(takeUntil(this.destroyAllSubscriptions$));
	}

	private handleSectorData(sectorData: GenericResponseBase<SectorDetails>) {
		if (!sectorData.Succeeded || !sectorData.Data) return;

		this.sectorDetails = sectorData.Data;
		this.overTimeHoursBilledAtShow();
		this.checkSecurityClearance(
			this.priviewRequestData.positionDetails.SecurityClearanceId.Value,
			this.sectorDetails.IsSecurityClearance
		);

		[magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four].forEach((orgType) => {
			const org = this.sectorDetails.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
				orgData.OrgType === Number(orgType));
			if (org) this.assignOrgTypeData(orgType, org);
		});
	}

	private handleLabourCatData(labourCatData: GenericResponseBase<ILaborCategoryDetails>) {
		if (!labourCatData.Succeeded || !labourCatData.Data) return;
		this.labourCatData = labourCatData.Data;
		this.isBudgetedHour = labourCatData.Data.CostEstimationTypeId === Number(CostEstimationTypes['Budgeted Hours']);
	}

	public getNteBillRateLabel(): string {
		if (!this.labourCatData.BillRateValidationId) {
			return this.localizationService.GetLocalizeMessage('NteTargetRate');
		}

		const { BillRateValidationId } = this.labourCatData;
		let value: string | null = null;

		if (BillRateValidationId === Number(dropdown.NTEValue)) {
			value = "NTE";
		} else if (BillRateValidationId === Number(dropdown.TargetValue)) {
			value = "Target";
		}

		return value
			? this.localizationService.GetLocalizeMessage('BillRateCurr', [{ Value: value, IsLocalizeKey: false }])
			: this.localizationService.GetLocalizeMessage('NteTargetRate');
	}

	private setCandidateDetails(data: IRootObject) {
		if(data.requestDetails.IsPreIdentifiedRequest){
		    this.weekDayForm.controls['PhoneNumber'].patchValue(data.candidateDetails.PhoneNumber);
		    this.weekDayForm.controls['PhoneExt'].patchValue(data.candidateDetails.PhoneExt);
		    this.isPhoneNumberExtension = data.candidateDetails.PhoneExt 
		        ? data.candidateDetails.PhoneExt.length > 0 
		        : false;
			this.candidateFullName = this.getCandidateFullName(data.candidateDetails);
		}
	}

	private getCandidateFullName(data: ICandidateDetails){
		const { FirstName, MiddleName = '', LastName } = data;
		let fullName = `${LastName}, ${FirstName}`;
		if (MiddleName.trim()) {
			fullName += ` ${MiddleName}`;
		}
		return fullName.trim();
	}

	private setSiftDetails(data: IRootObject) {
		this.daysInfo = this.lightIndustrialServices.generateDaysInfo(data.assignmentRequirement);
		this.weekDayForm.controls['startTimeControlName'].patchValue(data.assignmentRequirement.StartTime);
		this.weekDayForm.controls['endTimeControlName'].patchValue(data.assignmentRequirement.EndTime);
	}

	private checkSecurityClearance(securityClearanceId: number, isSecurityClearance: boolean): void {
		this.isSecurityClearanceRequired = (securityClearanceId != Number(magicNumber.one) && isSecurityClearance);
	}

	private extractUdfData() {
		const extractedData = this.udfControlConfig.map((udfConfig) => {
			const fieldName = udfConfig.StandardFieldName,
				fieldLabelLocalizedKey = udfConfig.FieldLabelLocalizedKey,
				udfValue = (this.priviewRequestData.udf as Record<string, any>)[fieldName];
			if (udfConfig.FieldType === 'Dropdown' && udfValue && typeof udfValue === 'object') {
				return {
					Text: udfValue.Text,
					Value: udfValue.Value,
					FieldLabelLocalizedKey: fieldLabelLocalizedKey
				};
			}
			return {
				Text: udfValue,
				Value: udfValue,
				FieldLabelLocalizedKey: fieldLabelLocalizedKey
			};
		}).filter((item) =>
			item.Text !== undefined && item.Value !== undefined);
		return extractedData;
	}

	private extractDmsData() {
		if (this.isEditMode) {
			const recordsFromPayload = this.getRecordsFromPayload(),
				updatedRecordsFromSavedDocument = this.getUpdatedRecordsFromSavedDocument();
			this.dmsExtractedData = [...recordsFromPayload, ...updatedRecordsFromSavedDocument] as IdmsPreview[];
		} else {
			this.dmsExtractedData = this.getPreviewFromPayload() as IdmsPreview[];
		}
		this.cdr.detectChanges();
	}

	private mapRecordToPreview(record: DMSApiRequestPayload, matchingConfig: DocumentControlConfig | undefined): IdmsPreview | null {
		return matchingConfig
			? {
				documentTitle: matchingConfig.DocumentTitle || '',
				extension: record.documentAddDto.fileExtension || '',
				fileNameWithExtension: record.documentAddDto.fileNameWithExtension || '',
				size: String(record.documentAddDto.fileSize) || '',
				file: record.documentAddDto.encryptedFileName || '',
				uploadedBy: this.userFullName,
				uploadedOn: this.localizationService.TransformData(new Date(), CultureFormat.DateFormat),
				actions: ''
			}
			: null;
	}

	private mapSavedDocumentToPreview(document: IUploadedDocumentGridList): IdmsPreview {
		return {
			documentTitle: document.DocumentTitle || '',
			extension: document.FileExtension || '',
			fileNameWithExtension: document.DocumentName || '',
			size: String(document.DocumentSize) || '',
			file: document.EncryptedFileName || '',
			uploadedBy: document.UploadedBy || '',
			uploadedOn: this.localizationService.TransformData(document.UploadedOn, CultureFormat.DateFormat),
			actions: ''
		};
	}

	private getRecordsFromPayload(): IdmsPreview[] {
		return this.priviewRequestData.dmsFieldRecords
			.filter((record) =>
				record.statusId > Number(magicNumber.zero))
			.map((record) => {
				const matchingConfig = this.dmsControlConfig.find((config) =>
					config.DocumentConfigId === record.documentAddDto.documentConfigurationId);
				return this.mapRecordToPreview(record, matchingConfig);
			}) as IdmsPreview[];
	}

	private getFilesToRemove(): string[] {
		return this.priviewRequestData.dmsFieldRecords
			.filter((record) =>
				record.statusId === Number(magicNumber.zero))
			.map((record) =>
				record.documentAddDto.fileNameWithExtension);
	}

	private getUpdatedRecordsFromSavedDocument(): IdmsPreview[] {
		const filesToRemove = this.getFilesToRemove();
		return this.savedDocument
			.map((document) =>
				this.mapSavedDocumentToPreview(document))
			.filter((savedDocument) =>
				!filesToRemove.includes(savedDocument.fileNameWithExtension));
	}

	private getPreviewFromPayload(): IdmsPreview[] {
		return this.priviewRequestData.dmsFieldRecords.map((record) => {
			const matchingConfig = this.dmsControlConfig.find((config) =>
				config.DocumentConfigId === record.documentAddDto.documentConfigurationId);
			return this.mapRecordToPreview(record, matchingConfig);
		}) as IdmsPreview[];
	}

	private extractApproverDetails() {
		const result: IDropdown[] = [];
		this.priviewRequestData.approvalDetails.forEach((detail: TransactionDataModel) => {
			const approverLabel = detail.ApproverLabel,
				items = detail.Items;
			if (approverLabel && items.length > Number(magicNumber.zero)) {
				const firstItem = items[magicNumber.zero],
					textValue = firstItem.Text;
				if (textValue) {
					result.push({
						Text: approverLabel,
						Value: textValue
					});
				}
			}
		});
		return result;
	}

	public getFileSizeWithUnit(fileSizeInBytes: number): string {
		if (fileSizeInBytes >= BYTES_IN_MEGABYTE) {
			return this.manipulateFileSize(fileSizeInBytes, FileSizeUnit.MB);
		} else {
			return this.manipulateFileSize(fileSizeInBytes, FileSizeUnit.KB);
		}
	}

	private manipulateFileSize(fileSizeInBytes: number, manipulationType: FileSizeUnit): string {
		let sizeInBytes = fileSizeInBytes;
		switch (manipulationType) {
			case FileSizeUnit.KB:
				sizeInBytes = sizeInBytes / BYTES_IN_KILOBYTE;
				break;
			case FileSizeUnit.MB:
				sizeInBytes /= BYTES_IN_MEGABYTE;
				break;
			case FileSizeUnit.GB:
				sizeInBytes /= BYTES_IN_GIGABYTE;
				break;
			default:
				throw new Error('Invalid manipulation type. Supported types are KB, MB, and GB.');
		}
		return `${sizeInBytes.toFixed(Number(magicNumber.two))} ${manipulationType}`;
	}

	public downloadFile(file: IdmsPreview) {
		if (!file.file) {
			return;
		}
		const filePath = (file.file).split('.')[0],
			fileExtension = file.extension;
		this.dmsImplementationService.downloadFile(filePath, fileExtension).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((blob: Blob) => {
			const url = window.URL.createObjectURL(blob),
				a = document.createElement('a');
			a.href = url;
			a.download = this.constructFileName(file.fileNameWithExtension, fileExtension);
			a.click();
			window.URL.revokeObjectURL(url);
		});
	}

	private constructFileName(fileName: string, fileExtension: string): string {
		return fileName.endsWith(`.${fileExtension}`)
			? fileName
			: `${fileName}.${fileExtension}`;
	}

	private assignOrgTypeData(orgType: number, org: SectorOrgLevelConfigDto) {
		const orgTypeData = {
			OrgName: this.localizationService.GetLocalizeMessage(org.LocalizedKey),
			IsVisible: org.IsVisible,
			IsMandatory: org.IsMandatory
		};
		switch (orgType) {
			case magicNumber.one:
				this.orgType1Data = orgTypeData;
				break;
			case magicNumber.two:
				this.orgType2Data = orgTypeData;
				break;
			case magicNumber.three:
				this.orgType3Data = orgTypeData;
				break;
			case magicNumber.four:
				this.orgType4Data = orgTypeData;
				break;
			default:
				break;
		}
	}

	private overTimeHoursBilledAtShow() {
		this.isOTHousBilledAtShow = !this.sectorDetails.MaskOtFieldsInSystem;
	}

	public showDrugField(): boolean {
		return this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsDrugResultVisible
			: this.sectorDetails.IsDrugResultVisible;
	}

	public showaBackgroundField(): boolean {
		return this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsBackGroundCheckVisible
			: this.sectorDetails.IsBackGroundCheckVisible;
	}

	private transformDates(data: IRootObject) {
		this.returnToAdd(data);
		const { assignmentRequirement } = data,
			transformDate = (date: string) =>
				this.localizationService.TransformDate(date);
		assignmentRequirement.TargetStartDate = transformDate(assignmentRequirement.TargetStartDate);
		assignmentRequirement.TargetEndDate = transformDate(assignmentRequirement.TargetEndDate);
		return data;
	}

	private returnToAdd(data: IRootObject | undefined) {
		if (data == undefined) {
			this.route.navigate([`/xrm/job-order/professional/add-edit`]);
		}
	}

	public getBenefitAdderData(data: IBenefitData[]): void {
		this.hasBenefitAdderLength = data.length > Number(magicNumber.zero);
	}

	public getCultureType() {
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyVal = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
	}

	public getRateUnitText(rateUnitId: number): string {
		switch (rateUnitId) {
			case RateUnitValue.Hour:
				return 'Hour';
			case RateUnitValue.Day:
				return 'Day';
			case RateUnitValue.Week:
				return 'Week';
			case RateUnitValue.Month:
				return 'Month';
			default:
				return 'Hour';
		}
	}

	public getDayHourLocalizationValue(key: string) {
		const unitTypeId = Number(this.priviewRequestData.rateDetails.RateUnitId),
			unitType = this.getRateUnitText(unitTypeId);
		return this.localizationService.GetLocalizeMessage(key, this.createDynamicParam(this.currencyVal, unitType));
	}

	private createDynamicParam(currencyVal: string, unitType: string): DynamicParam[] {
		return [
			{ Value: currencyVal, IsLocalizeKey: false },
			{ Value: unitType, IsLocalizeKey: true }
		];
	}

	public submitForm() {
		const payload = mapFormToApiPayload(this.sharedDataService.getFormData());
		this.professionalRequestService.saveProfRequest(payload).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IProfReqSuccessResponse>) => {
				if (res.Succeeded && res.Data) {
					this.isSuccessToast = true;
					const requestCode = res.Data.RequestCode;
					this.toasterService.showToaster(ToastOptions.Success, 'ProfRequestCreatedNotification', [{ Value: requestCode, IsLocalizeKey: false }]);
					this.route.navigate([`/xrm/job-order/professional/list`]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);

				}
			});
	}

	public submitFormEdit() {
		const payload = mapFormToApiPayload(this.sharedDataService.getFormData());
		this.professionalRequestService.updateProfRequest(payload).subscribe((res: any) => {
			if (res.Succeeded) {
				this.isSuccessToast = true;
				const requestCode = res.Data.RequestCode;
				this.toasterService.showToaster(ToastOptions.Success, 'ProfRequestResubmittedNotification', [{ Value: requestCode, IsLocalizeKey: false }]);
				this.route.navigate([`/xrm/job-order/professional/list`]);
			} else {
				this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	public backform() {
		this.backClicked.emit();
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		if (!this.isSuccessToast)
			this.toasterService.resetToaster();
	}

}

