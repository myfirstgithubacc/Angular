import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { CommonService } from '@xrm-shared/services/common.service';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, forkJoin, map, of, switchMap, take, takeUntil } from 'rxjs';
import { CandidatePoolService } from 'src/app/services/masters/candidate-pool.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DatePipe } from '@angular/common';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { backgroundChcekIdEnum, drugScreenIdEnum, drugScreenResultIdEnum } from '@xrm-shared/services/common-constants/static-data.enum';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { CandidatePoolAddEdit } from '@xrm-core/models/candidate-pool/add-edit/candidate-pool-add-edit.model';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { BasicDetails } from '@xrm-core/models/Configure-client/basic-details.model';
import { CandidatePoolPreferableSector } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-sector.model';
import { CandidatePoolPreferableLocation } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-location.model';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { DropdownModel, IDropdownItem, IDropdownWithExtras } from '@xrm-shared/models/common.model';
@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit {

	@ViewChild('dms', { static: false })
		dmsImplementation: DmsImplementationComponent;
	public AddEditCandidatePoolForm: FormGroup;
	public magicNumber = magicNumber;
	public isEditMode: boolean = false;
	public countryId: string;
	private ukey: string;
	public isradioDrugScreenId: boolean = false;
	public isSwitchExpressLaborCategory: boolean = false;
	public isradioBackgroundCheckId: boolean = false;
	public isSwitchPreviouslyPlacedAtThisClient: boolean = false;
	private candidatePoolDetails: CandidatePoolAddEdit;
	public candidatePoolDrugScreenResultData: DropdownModel[];
	public candidatePoolDrugScreenIdData: IDropdownItem[];
	public candidatePoolBackgroundCheckIdData: IDropdownItem[];
	public candidatePoolDrugScreenResultAssignmentData: IDropdownWithExtras[] = [];
	public candidatePoolDrugScreenResultSectorData: DropdownModel[];
	public UIDlabel: string;
	public UIDlength: number;
	public isUIDNumeric: boolean;
	public isUID: boolean = false;
	private candidatePoolObj: CandidatePoolAddEdit;
	public multiSelectLocation: CandidatePoolPreferableLocation[];
	public selectedLocations: CandidatePoolPreferableLocation[];
	public backupLocationData: CandidatePoolPreferableLocation[];
	public drugScreen: number = drugScreenIdEnum.Initiated;
	public candidatePoolId: number;
	public isActiveAssignment: boolean;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private candidatePoolLabelTextParams: DynamicParam[] = [{ Value: 'Candidate', IsLocalizeKey: true }];
	private selectedPreferredSectors: DropdownModel[];
	private selectedPreferredAssignmentTypes: DropdownModel[];
	private selectedPreferredLocations: DropdownModel[];
	public isUsedInAssignment: boolean = false;
	public entityId: number = XrmEntities.CandidatePool;
	public entityLiPool: number = XrmEntities.ProfessionalCandidate;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.Add;
	private udfData: IPreparedUdfPayloadData[];
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = magicNumber.ninetyFive;
	public dmsGridChangeDetected: boolean = false;
	private errorToasterEnable: boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private customValidators: CustomValidators,
		private commonService: CommonService,
		private fb: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private gridConfiguration: GridConfiguration,
		private toasterService: ToasterService,
		public sector: SectorService,
		private candidatePoolService: CandidatePoolService,
		private route: Router,
		private local: LocalizationService,
		private datePipe: DatePipe,
		private eventLogService: EventLogService,
		public udfCommonMethods: UdfCommonMethods,
		private configureClientService: ConfigureClientService,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditCandidatePoolForm = this.fb.group({
			'CandidateLastName': [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'LastName', IsLocalizeKey: true }])]],
			'CandidateFirstName': [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'FirstName', IsLocalizeKey: true }])]],
			'CandidateMiddleInitial': [null],
			'EmailAddress': [null, [this.customValidators.EmailValidator()]],
			'ContactNumber': [null, this.customValidators.FormatValidator('PleaseEnterValidContactNumber')],
			'UId': [null, [this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'UID', IsLocalizeKey: true }])]],
			'PhoneNumberExt': [null],
			'PreviouslyPlacedAtThisClient': [false],
			'WorkDetails': [null],
			'PreferredSectors': [[]],
			'PreferredAssignmentTypes': [[]],
			'PreferredLocations': [[]],
			'PreferredShift': [null],
			'DrugScreenResultId': [null],
			'DrugScreenId': [drugScreenIdEnum.None.toString()],
			'BackgroundCheckId': [backgroundChcekIdEnum.None.toString()],
			'BackgroundResultDate': [new Date()],
			'DrugResultDate': [new Date()],
			'IsCandidateEligibleForSecurityClearance': [false],
			'CurrentSecurityClearanceLevel': [null],
			'ReasonForChange': null
		});
		this.countryId = local.GetCulture(CultureFormat.CountryId);
	}

	ngOnInit(): void {
		forkJoin({
			'DrugResultRes': this.candidatePoolService.getDrugScreenResultData('DrugScreenResult'),
			'DrugIdRes': this.candidatePoolService.getDrugScreenResultData('DrugScreen'),
			'BackgroundCheckIdRes': this.candidatePoolService.getDrugScreenResultData('BackGroundCheck'),
			'DrugResultDataRes': this.candidatePoolService.getPreferredAssignmentType('assignmenttype'),
			'DrugScreenResultDataRes': this.candidatePoolService.getExistingSectorsWithLocationDropdownList(),
			'BasicDetailsRes': this.configureClientService.getBasicDetails(),
			'RouteRes': this.activatedRoute.params.pipe(map((res) => { return res['id']; }), take(magicNumber.one))
		}).pipe(switchMap((data: {
			DrugResultRes: GenericResponseBase<IDropdownItem[]>, DrugIdRes: GenericResponseBase<IDropdownItem[]>,
			BackgroundCheckIdRes: GenericResponseBase<IDropdownItem[]>,
			DrugResultDataRes: GenericResponseBase<IDropdownItem[]>, DrugScreenResultDataRes: {
				ddlSector: GenericResponseBase<DropdownModel[]>,
				ddlSectorLocation: GenericResponseBase<CandidatePoolPreferableLocation[]>
			},
			BasicDetailsRes: GenericResponseBase<BasicDetails>, RouteRes: string
		}) => {
			this.getDrugScreenResultData(data.DrugResultRes);
			if (isSuccessfulResponse(data.DrugIdRes))
				this.candidatePoolDrugScreenIdData = data.DrugIdRes.Data;
			if (isSuccessfulResponse(data.BackgroundCheckIdRes))
				this.candidatePoolBackgroundCheckIdData = data.BackgroundCheckIdRes.Data;
			this.getPreferredAssignmentType(data.DrugResultDataRes);
			this.getExistingSectorsWithLocationDropdownList(data.DrugScreenResultDataRes);
			this.fetchUIDBasicDetails(data.BasicDetailsRes);
			if (data.RouteRes) {
				this.isEditMode = true;
				this.ukey = data.RouteRes;
			}
			else {
				this.isUID = true;
			}
			if (this.ukey)
				return this.candidatePoolService.getAllCandidatePoolByUkey(this.ukey);
			else
				return of(null);
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<CandidatePoolAddEdit> | null) => {
			if (res && isSuccessfulResponse(res))
				this.getDataByUkey(res);
			this.cdr.markForCheck();
		});

	}

	private getDrugScreenResultData(res: GenericResponseBase<IDropdownItem[]>): void {
		if (isSuccessfulResponse(res)) {
			res.Data.forEach((row: IDropdownItem, index: number) => {
				if (row.Value == drugScreenResultIdEnum.Pending.toString()) {
					res.Data.splice(index, magicNumber.one);
				}
			});
			this.candidatePoolDrugScreenResultData = res.Data;
		}

	}

	private getPreferredAssignmentType(res: GenericResponseBase<IDropdownItem[]>): void {
		if (isSuccessfulResponse(res)) {
			res.Data.forEach((e) => {
				this.candidatePoolDrugScreenResultAssignmentData.push({
					Text: this.local.GetLocalizeMessage(e.Text),
					Value: e.Value
				});
			});
		}

	}

	private getExistingSectorsWithLocationDropdownList(res: {
		ddlSector: GenericResponseBase<DropdownModel[]>,
		ddlSectorLocation: GenericResponseBase<CandidatePoolPreferableLocation[]>
	}): void {
		if (isSuccessfulResponse(res.ddlSector))
			this.candidatePoolDrugScreenResultSectorData = res.ddlSector.Data;
		if (isSuccessfulResponse(res.ddlSectorLocation))
			this.multiSelectLocation = res.ddlSectorLocation.Data;
		this.multiSelectLocation.map((row) => {
			row.Value = row.LocationId;
			row.Text = row.LocationName;
		});

		this.backupLocationData = this.multiSelectLocation;
	}

	private fetchUIDBasicDetails(res: GenericResponseBase<BasicDetails>): void {
		if (isSuccessfulResponse(res)) {
			const { UidLabelLocalizedKey, UidLength, IsUidNumeric } = res.Data;
			this.UIDlabel = UidLabelLocalizedKey;
			this.UIDlength = UidLength;
			this.isUIDNumeric = IsUidNumeric;
		}

	}

	public checkAlphaNumeric(event: KeyboardEvent): void {
		if (this.UIDlength === Number(magicNumber.zero)) return;
		const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
		if (!controlKeys.includes(event.key) || isNaN(Number(event.key)) || event.key === ' ') {
			let currentValue: string = this.AddEditCandidatePoolForm.controls['UId'].value;
			if (this.isUIDNumeric)
				currentValue = currentValue.replace(/\D/g, '');
			else
				currentValue = currentValue.replace(/\s/g, '');
			this.AddEditCandidatePoolForm.controls['UId'].setValue(currentValue);
			this.AddEditCandidatePoolForm.controls['UId'].addValidators([
				this.customValidators.MinLengthValidator(this.UIDlength, this.isUIDNumeric
					? 'UIDFixedCharacter'
					: 'UidLenghtValidation', [{ Value: this.UIDlabel, IsLocalizeKey: true }, { Value: this.UIDlength.toString(), IsLocalizeKey: false }])
			]);
			this.AddEditCandidatePoolForm.controls['UId'].updateValueAndValidity();
		}
	}

	public submitForm(): void {
		this.AddEditCandidatePoolForm.markAllAsTouched();
		if (this.AddEditCandidatePoolForm.valid) {
			const allDocumentsUploaded =
				this.dmsImplementation.validateDocumentsAndUpload();
			if (!allDocumentsUploaded) {
				return;
			} else if (this.isEditMode) {
				this.processDialogResponse({ value: 3 });
			} else {
				this.processDialogResponse({ value: 1 });
			}
		}
	}

	private save(): void {
		this.candidatePoolObj = this.parseKeyValuePairToId(this.AddEditCandidatePoolForm);
		if (this.isEditMode) {
			this.editCandidatePool();
		} else {
			this.addNewCandidatePool();
		}
	}

	private editCandidatePool(): void {
		this.candidatePoolObj = this.AddEditCandidatePoolForm.getRawValue();
		this.populateCandidatePoolObject();
		this.candidatePoolService.updateCandidatePool(this.candidatePoolObj).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<CandidatePoolAddEdit>) => {
				const localizeTextParams = this.local.getLocalizationMessageInLowerCase(this.candidatePoolLabelTextParams);
				if (isSuccessfulResponse(response)) {
					this.commonService.resetAdvDropdown(this.entityId);
					this.commonService.resetAdvDropdown(this.entityLiPool);
					this.gridConfiguration.refreshGrid();
					this.showToaster(ToastOptions.Success, 'SavedSuccesfully', localizeTextParams);
					this.AddEditCandidatePoolForm.markAsPristine();
					this.dmsGridChangeDetected = false;
					this.eventLogService.isUpdated.next(true);
				}
				else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.local);
					this.AddEditCandidatePoolForm.markAsDirty();
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.showToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
					this.AddEditCandidatePoolForm.markAsDirty();
				} else {
					this.showToaster(ToastOptions.Error, response.Message);
					this.AddEditCandidatePoolForm.markAsDirty();
				}
				this.cdr.markForCheck();
			});
	}

	private populateCandidatePoolObject(): void{
		this.candidatePoolObj.UKey = this.ukey;
		this.candidatePoolObj.ReasonForChange = '';
		this.candidatePoolObj.CountryId = this.countryId;
		this.candidatePoolObj.candidatePoolId = this.candidatePoolId;
		this.candidatePoolObj.BackgroundResultDate = (this.AddEditCandidatePoolForm.controls['BackgroundCheckId'].value == backgroundChcekIdEnum.Completed)
			? this.datePipe.transform(this.candidatePoolObj.BackgroundResultDate, 'MM/dd/YYYY')
			: null;
		this.candidatePoolObj.DrugResultDate = (this.AddEditCandidatePoolForm.controls['DrugScreenId'].value == drugScreenIdEnum.Completed)
			? this.datePipe.transform(this.candidatePoolObj.DrugResultDate, 'MM/dd/YYYY')
			: null;
		this.candidatePoolObj.UdfFieldRecords = this.udfData;
		this.candidatePoolObj.dmsFieldRecords =
			this.dmsImplementation.prepareAndEmitFormData();
		if (this.AddEditCandidatePoolForm.controls['DrugScreenId'].value == drugScreenIdEnum.Initiated)
			this.candidatePoolObj.DrugScreenResultId = drugScreenResultIdEnum.Pending;
		else if (this.AddEditCandidatePoolForm.controls['DrugScreenId'].value == drugScreenIdEnum.None)
			this.candidatePoolObj.DrugScreenResultId = null;
		this.candidatePoolObj.WorkDetails = (this.candidatePoolObj.PreviouslyPlacedAtThisClient)
			? this.candidatePoolObj.WorkDetails
			: null;
		this.candidatePoolObj.CurrentSecurityClearanceLevel = (this.candidatePoolObj.IsCandidateEligibleForSecurityClearance)
			? this.candidatePoolObj.CurrentSecurityClearanceLevel
			: null;
	}

	private showToaster(toasterOptions: ToastOptions, message: string, params: DynamicParam[] = []): void {
		if (toasterOptions === ToastOptions.Error) {
			this.toasterService.showToaster(ToastOptions.Error, message, params);
			this.errorToasterEnable = true;
		} else if (toasterOptions === ToastOptions.Success) {
			this.toasterService.showToaster(ToastOptions.Success, message, params);
			this.errorToasterEnable = false;
		}
	}

	private parseKeyValuePairToId(formData: FormGroup): CandidatePoolAddEdit {
		const data = formData.getRawValue();
		try {
			Object.keys(data).forEach((key: string) => {
				if (key === 'PreferredSectors') {
					Object.keys(data[key]).forEach((keyValue: string, i: number) => {
						data.PreferredSectors[i] = {
							'Text': data[key][keyValue].Text,
							'Value': data[key][keyValue].Value,
							'sectorId': parseInt(data[key][keyValue].Value)
						};
					});
				}
				if (key === 'PreferredAssignmentTypes') {
					Object.keys(data[key]).forEach((keyValue: string, i: number) => {
						data.PreferredAssignmentTypes[i] = {
							'Text': data[key][keyValue].Text,
							'Value': data[key][keyValue].Value,
							'assignmentTypeId': parseInt(data[key][keyValue].Value)
						};
					});
				}
				if (key === 'PreferredLocations') {
					Object.keys(data[key]).forEach((keyValue: string, i: number) => {
						data.PreferredLocations[i] = {
							'Text': data[key][keyValue].Text,
							'Value': data[key][keyValue].Value,
							'locationId': parseInt(data[key][keyValue].Value)
						};
					});
				}
			});
		} catch (ex) {
			this.showToaster(ToastOptions.Error, 'Somethingwentwrong');
		}
		return data;
	}
	private addNewCandidatePool(): void {
		const candidatePoolSave = this.AddEditCandidatePoolForm.value;
		candidatePoolSave.CountryId = this.countryId;
		candidatePoolSave.DrugResultDate = (candidatePoolSave.DrugScreenId == drugScreenIdEnum.Completed)
			? this.datePipe.transform(candidatePoolSave.DrugResultDate, 'MM/dd/YYYY')
			: null;
		candidatePoolSave.BackgroundResultDate = (candidatePoolSave.BackgroundCheckId == backgroundChcekIdEnum.Completed)
			? this.datePipe.transform(candidatePoolSave.BackgroundResultDate, 'MM/dd/YYYY')
			: null;
		candidatePoolSave.UdfFieldRecords = this.udfData;
		candidatePoolSave.dmsFieldRecords =
			this.dmsImplementation.prepareAndEmitFormData();
		if (this.AddEditCandidatePoolForm.controls['DrugScreenId'].value == drugScreenIdEnum.Initiated)
			candidatePoolSave.DrugScreenResultId = drugScreenResultIdEnum.Pending;
		else if (this.AddEditCandidatePoolForm.controls['DrugScreenId'].value == drugScreenIdEnum.None)
			candidatePoolSave.DrugScreenResultId = null;
		candidatePoolSave.WorkDetails = candidatePoolSave.PreviouslyPlacedAtThisClient
			? candidatePoolSave.WorkDetails
			: null;
		candidatePoolSave.CurrentSecurityClearanceLevel = candidatePoolSave.IsCandidateEligibleForSecurityClearance
			? candidatePoolSave.CurrentSecurityClearanceLevel
			: null;
		this.candidatePoolService.addCandidatePool(candidatePoolSave)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<CandidatePoolAddEdit>) => {
				if (isSuccessfulResponse(data)) {
					this.commonService.resetAdvDropdown(this.entityId);
					this.commonService.resetAdvDropdown(this.entityLiPool);
					this.gridConfiguration.refreshGrid();
					this.showToaster(ToastOptions.Success, 'CandidatePoolAddedSuccessfully');
					this.route.navigate(['/xrm/job-order/candidate-pool/list']);
				}
				else if (hasValidationMessages(data)) {
					ShowApiResponseMessage.showMessage(data, this.toasterService, this.local);
				}
				else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.showToaster(ToastOptions.Error, 'CandidatePoolAlreadyExists');
				}
				else {
					this.showToaster(ToastOptions.Error, data.Message);
				}
				this.cdr.markForCheck();
			});
	}


	private getDataByUkey(res: GenericResponseBase<CandidatePoolAddEdit>): void {
		if (isSuccessfulResponse(res)) {
			this.candidatePoolDetails = res.Data;
			this.candidatePoolId = res.Data.Id;
			this.isActiveAssignment = res.Data.IsUsedInActiveAssignment;
			this.isUsedInAssignment = res.Data.IsUsedInAssignment;
			this.candidatePoolService.holdData.next({ 'Disabled': this.candidatePoolDetails.Disabled, 'Code': this.candidatePoolDetails.Code, 'Id': this.candidatePoolDetails.Id });
			this.selectedPreferredSectors = this.candidatePoolDetails.PreferredSectors.map((item: CandidatePoolPreferableSector) => {
				return { 'Text': item.SectorName, 'Value': item.SectorId.toString() };
			});
			this.selectedPreferredAssignmentTypes =
				this.candidatePoolDetails.PreferredAssignmentTypes.map((item) => {
					return { Text: item.AssignmentName, Value: item.AssignmentTypeId.toString() };
				});
			this.selectedPreferredLocations = this.candidatePoolDetails.PreferredLocations.map((item) => {
				return { 'Text': item.LocationName, 'Value': item.LocationId.toString(), 'SectorId': item.SectorId };
			});
			this.patchCandidatePool();
		}
	}

	private patchCandidatePool(): void {
		this.AddEditCandidatePoolForm.patchValue({
			'CandidateFirstName': this.candidatePoolDetails.CandidateFirstName,
			'CandidateLastName': this.candidatePoolDetails.CandidateLastName,
			'CandidateMiddleInitial': this.candidatePoolDetails.CandidateMiddleInitial,
			'CandidateName': this.candidatePoolDetails.CandidateName,
			'EmailAddress': this.candidatePoolDetails.EmailAddress,
			'ContactNumber': this.candidatePoolDetails.ContactNumber,
			'UId': this.candidatePoolDetails.UId,
			'PreviouslyPlacedAtThisClient': this.candidatePoolDetails.PreviouslyPlacedAtThisClient,
			'WorkDetails': this.candidatePoolDetails.WorkDetails,
			'PreferredSectors': this.selectedPreferredSectors,
			'PreferredAssignmentTypes': this.selectedPreferredAssignmentTypes,
			'PreferredLocations': this.selectedPreferredLocations,
			'PreferredShift': this.candidatePoolDetails.PreferredShift,
			'PhoneNumberExt': this.candidatePoolDetails.PhoneNumberExt,
			'DrugScreenId': (this.candidatePoolDetails.DrugScreenId
				? this.candidatePoolDetails.DrugScreenId.toString()
				: this.candidatePoolDetails.DrugScreenId),
			'BackgroundCheckId': (this.candidatePoolDetails.BackgroundCheckId
				? this.candidatePoolDetails.BackgroundCheckId.toString()
				: this.candidatePoolDetails.BackgroundCheckId),
			'DrugResultDate': this.candidatePoolDetails.DrugResultDate !== null
				? new Date(this.candidatePoolDetails.DrugResultDate)
				: new Date(),
			'DrugScreenResultId': (this.candidatePoolDetails.DrugScreenResultId
				? this.candidatePoolDetails.DrugScreenResultId.toString()
				: this.candidatePoolDetails.DrugScreenResultId),
			'BackgroundResultDate': this.candidatePoolDetails.BackgroundResultDate !== null
				? new Date(this.candidatePoolDetails.BackgroundResultDate)
				: new Date(),
			'IsCandidateEligibleForSecurityClearance': this.candidatePoolDetails.IsCandidateEligibleForSecurityClearance,
			'CurrentSecurityClearanceLevel': this.candidatePoolDetails.CurrentSecurityClearanceLevel
		});
		this.actionTypeId = ActionType.Edit;
		this.recordUKey = this.ukey;
		this.switchPreviouslyPlacedAtThisClient(this.candidatePoolDetails.PreviouslyPlacedAtThisClient);
		this.switchExpressLaborCategory(this.candidatePoolDetails.IsCandidateEligibleForSecurityClearance);
		this.radioBackgroundCheckId(this.candidatePoolDetails.BackgroundCheckId);
		this.radioDrugScreenId(this.candidatePoolDetails.DrugScreenId);
		this.isUID = true;
	}

	public sectorChange(selectedSectors: DropdownModel[]): void {
		if (selectedSectors.length) {
			const sectors = selectedSectors.map((item: DropdownModel) =>
				Number(item.Value));
			this.multiSelectLocation = this.backupLocationData.filter((item: CandidatePoolPreferableLocation) => {
				return sectors.includes(item.SectorId);
			});
			this.selectedLocations = this.AddEditCandidatePoolForm.get('PreferredLocations')?.value.filter((item: CandidatePoolPreferableLocation) => {
				return sectors.includes(item.SectorId);
			});
			this.AddEditCandidatePoolForm.patchValue({ PreferredLocations: this.selectedLocations });
		} else {
			this.multiSelectLocation = this.backupLocationData;
			this.selectedLocations = [];
			this.AddEditCandidatePoolForm.patchValue({ PreferredLocations: [] });
		}
	}

	public getUdfData(data: { data: IPreparedUdfPayloadData[], formGroup: FormGroup }): void {
		this.udfData = data.data;
		this.AddEditCandidatePoolForm.addControl('udf', data.formGroup);
		this.cdr.detectChanges();
	}

	public onGridChange(): void {
		this.dmsGridChangeDetected = true;
	}

	private processDialogResponse(data: { value: number }): void {
		this.toasterService.resetToaster();
		if (data.value === Number(magicNumber.one) || data.value === Number(magicNumber.three)) {
			this.save();
		}
	}

	public radioDrugScreenId(e: number): void {
		if (e == Number(drugScreenIdEnum.Completed)) {
			if (this.AddEditCandidatePoolForm.controls['DrugScreenResultId'].value == drugScreenResultIdEnum.Pending)
				this.AddEditCandidatePoolForm.controls['DrugScreenResultId'].setValue(null);
			this.isradioDrugScreenId = true;
			this.AddEditCandidatePoolForm.controls['DrugScreenResultId'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'DrugScreenResult', IsLocalizeKey: true }]));
			this.AddEditCandidatePoolForm.controls['DrugResultDate'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'DrugResultDate', IsLocalizeKey: true }]));
		} else {
			this.isradioDrugScreenId = false;
			this.AddEditCandidatePoolForm.controls['DrugScreenResultId'].clearValidators();
			this.AddEditCandidatePoolForm.controls['DrugResultDate'].clearValidators();
		}
		this.AddEditCandidatePoolForm.controls['DrugScreenResultId'].updateValueAndValidity();
		this.AddEditCandidatePoolForm.controls['DrugResultDate'].updateValueAndValidity();
	}

	public radioBackgroundCheckId(e: number): void {
		if (e == Number(backgroundChcekIdEnum.Completed)) {
			this.isradioBackgroundCheckId = true;
			this.AddEditCandidatePoolForm.controls['BackgroundResultDate'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'BackgroundResultDate', IsLocalizeKey: true }]));
		} else {
			this.isradioBackgroundCheckId = false;
			this.AddEditCandidatePoolForm.controls['BackgroundResultDate'].clearValidators();
		}
		this.AddEditCandidatePoolForm.controls['BackgroundResultDate'].updateValueAndValidity();
	}

	switchPreviouslyPlacedAtThisClient(toggle: boolean) {
		this.isSwitchPreviouslyPlacedAtThisClient = toggle;
	}

	switchExpressLaborCategory(toggle: boolean) {
		this.isSwitchExpressLaborCategory = toggle;
		if (toggle) {
			this.AddEditCandidatePoolForm.controls['CurrentSecurityClearanceLevel'].markAsUntouched();
			this.AddEditCandidatePoolForm.controls['CurrentSecurityClearanceLevel'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'CurrentSecurityClearanceLevel', IsLocalizeKey: true }]));
		} else {
			this.AddEditCandidatePoolForm.controls['CurrentSecurityClearanceLevel'].clearValidators();
		}
		this.AddEditCandidatePoolForm.controls['CurrentSecurityClearanceLevel'].updateValueAndValidity();
	}

	navigateToList() {
		if (this.route.url.includes('global-search')) {
			this.route.navigate(['/xrm/landing/global-search']);
		}
		else {
			this.route.navigate(['/xrm/job-order/candidate-pool/list']);
		}
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.errorToasterEnable)
			this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}

