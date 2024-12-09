import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { ProfessionalRequestService } from '../../services/professional-request.service';
import { StepperID } from '../../constant/stepper';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LightIndustrialService } from '../../../light-industrial/services/light-industrial.service';
import { LocationDetails, SectorDetails, SectorOrgLevelConfigDto, TimeRange } from '../../../light-industrial/interface/li-request.interface';
import { SharedVariablesService } from '../../../light-industrial/services/shared-variables.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { LightIndustrialUtilsService } from '../../../light-industrial/services/light-industrial-utils.service';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IApprovePayload, ILaborCategoryDetails, IPermissionsForProfessional, IProfRequest, IProfRequestAssignment, IProfRequestData, IProfRequestFinancial, IRequestComment } from '../../interface/shared-data.interface';
import { ApprovalReq } from '@xrm-master/approval-configuration/constant/enum';
import { OrgTypeData } from '../../../common-models/org-type.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { LocationService } from '@xrm-master/location/services/location.service';
import { StatusID } from '../../constant/request-status';
import { ActivatedRoute, Router } from '@angular/router';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CostEstimationTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { NavigationPaths } from '../../constant/routes-constant';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { ReviewComments } from '../../../review-candidates/interface/review-candidate.interface';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';


@Component({
	selector: 'app-review',
	templateUrl: './review.component.html',
	styleUrls: ['./review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class ReviewComponent implements OnInit, OnDestroy{
	public weekDayForm: FormGroup;
	public statusId: number = magicNumber.zero;
	public entityId: number = XrmEntities.ProfessionalRequest;
	public actionTypeId: number = ActionType.View;
	public userGroupId: number = magicNumber.three;
	public uploadStageId: number = DocumentUploadStage.Request_Creation;
	public processingId: number = magicNumber.five;
	public sectorDetails: SectorDetails;
	private locationDetails: LocationDetails | null;
	private labourCatData: ILaborCategoryDetails;
	public profRequest: IProfRequest;
	public profRequestAssignment: IProfRequestAssignment;
	public profRequestFinancial: IProfRequestFinancial;
	public profRequestOtherDetail: IRequestComment;
	public daysInfo: IDayInfo[] = [];
	public isBudgetedHour: boolean = false;
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public showAllSectionSwitch: boolean = true;
	public hasUDFLength: boolean;
	public hasDMSLength: boolean;
	public hasBenefitAdderLength: boolean;
	public resetStep = true;
	public isDraft = false;
	public isOTHousBilledAtShow: boolean = true;
	public isSecurityClearanceRequired: boolean = false;
	public hasApproverDataLength: boolean = true;
	private approverDataLength: ApprovalReq;
	public approverLength: boolean = false;
	public currentStep = magicNumber.four;
	private countryId: number;
	private currencyVal: string = '';
	public steps = [
		{ label: "JobDetails", icon: "check", id: StepperID.JobDetails },
		{ label: "AssignmentDetails", icon: "check", id: StepperID.AssignmentDetails },
		{ label: "Financial Details", icon: "check", id: StepperID.FinancialDetails },
		{ label: "Approver & Other Details", icon: "check", id: StepperID.OtherDetails }
	];
	public reviewComments: ReviewComments[];
	public permissionData: IPermissionsForProfessional;

	// eslint-disable-next-line max-params
	constructor(
      private formBuilder: FormBuilder,
      private sectorService: SectorService,
      private activatedRoute: ActivatedRoute,
      private eventLog: EventLogService,
	  private route: Router,
	  private toasterService: ToasterService,
	  private customValidators: CustomValidators,
      private professionalRequestService: ProfessionalRequestService,
      private lightIndustrialServices: LightIndustrialService,
      private sharedVariablesService: SharedVariablesService,
      private lightIndustrialUtilsService: LightIndustrialUtilsService,
      private localizationService: LocalizationService,
      private locationService: LocationService,
      private cdr: ChangeDetectorRef
	) {
		this.initializeForm();
		this.getCultureType();
	}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			this.checkReviewPermission(param['uKey']);
			this.getLiRequestDetails(param['uKey'], StepperID.GetByUkey);
		});
	}

	private initializeForm(): void {
		this.weekDayForm = this.formBuilder.group({
			startTimeControlName: [null],
			endTimeControlName: [null],
			approverComment: [null]
		});
	}

	private getLiRequestDetails(uKey: string, stepperId: number): void {
		this.professionalRequestService.getReqViewById(uKey, stepperId).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IProfRequestData>) => {
				if (res.Succeeded && res.Data) {
					this.reviewComments = res.Data.ReviewerComments;
					this.profRequest = res.Data.ProfRequest;
					this.isDraft = this.profRequest.RequestDetail.StatusId == Number(StatusID.Draft);
					this.getDataById();
					this.profRequestAssignment = this.transformDates(res.Data.ProfRequestAssignment);
					this.profRequestFinancial = res.Data.ProfRequestFinancial;
					this.profRequestOtherDetail = res.Data.ProfRequestComment;
					this.setSiftDetails(this.profRequestAssignment);
					this.isRouteFromReviewLink();
				} else if(res.StatusCode == Number(HttpStatusCode.Unauthorized)){
					this.route.navigate(['unauthorized']);
				}
				this.cdr.markForCheck();
			});
	}

	private checkReviewPermission(ukey: string){
		this.professionalRequestService.getPermissionsbyUkey(ukey).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IPermissionsForProfessional>) => {
				if(res.Succeeded && res.Data){
					this.permissionData = res.Data;
				}
			});
	}

	private isRouteFromReviewLink(): void {
		if (!this.permissionData.IsReviewActionRequired && localStorage.getItem('isReviewLink') == 'true') {
			this.toasterService.displayToaster(ToastOptions.Warning, this.localizationService.GetLocalizeMessage('AlreadyProcessedRecord'));
		}
	}

	private getDataById() {
		const { SectorId, WorkLocationId } = this.profRequest.RequestDetail,
			{ LaborCategoryId } = this.profRequest.PositionDetail;

		forkJoin({
			sectorData: this.getSectorDataById(SectorId),
			locationData: this.getLocationData(WorkLocationId),
			labourCatData: this.getLabourCatData(LaborCategoryId)
		}).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(({ sectorData, locationData, labourCatData }) => {
			this.handleSectorData(sectorData);
			this.locationDetails = locationData.Data ?? null;
			this.handleLabourCatData(labourCatData);
			this.cdr.markForCheck();
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

	private handleSectorData(sectorData: GenericResponseBase<SectorDetails>) {
		if (sectorData.Succeeded && sectorData.Data) {
			this.sectorDetails = sectorData.Data;
			this.overTimeHoursBilledAtShow();
			this.checkSecurityClearance(this.profRequest.PositionDetail.SecurityClearanceId, this.sectorDetails.IsSecurityClearance);

			const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
			orgTypes.forEach((orgType) => {
				const org = sectorData.Data?.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
					orgData.OrgType === Number(orgType));
				if (org) {
					this.assignOrgTypeData(orgType, org);
				}
			});
		}
	}

	private handleLabourCatData(labourCatData: GenericResponseBase<ILaborCategoryDetails>) {
		if (labourCatData.Succeeded && labourCatData.Data) {
			this.labourCatData = labourCatData.Data;
			this.isBudgetedHour = labourCatData.Data.CostEstimationTypeId === Number(CostEstimationTypes['Budgeted Hours']);
		}
	}

	public getNteBillRateLabel(): string {
		const { BillRateValidationId } = this.labourCatData;
		if (!BillRateValidationId) {
			return this.localizationService.GetLocalizeMessage('NteTargetRate');
		}
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

	private setSiftDetails(data: IProfRequestAssignment){
		this.daysInfo = this.lightIndustrialServices.generateDaysInfo(data.ShiftRequirement);
		this.weekDayForm.controls['startTimeControlName'].patchValue(data.ShiftRequirement.StartTime);
		this.weekDayForm.controls['endTimeControlName'].patchValue(data.ShiftRequirement.EndTime);
		this.eventLog.recordId.next(this.profRequest.RequestDetail.RequestId);
		this.eventLog.entityId.next(this.entityId);
	}

	private checkSecurityClearance(securityClearanceId: number, isSecurityClearance: boolean): void {
		this.isSecurityClearanceRequired = (securityClearanceId != Number(magicNumber.one) && isSecurityClearance);
	}

	public getCultureType() {
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyVal = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
	}

	public getDayHourLocalizationValue(key: string) {
		let unitType = this.profRequestFinancial.RateUniteName ?? '';
		unitType = unitType !== ''
			? unitType
			: 'Hour';
		const dynamicParam: DynamicParam[] = [
			{ Value: this.currencyVal, IsLocalizeKey: false },
			{ Value: unitType, IsLocalizeKey: true }
		];
		return this.localizationService.GetLocalizeMessage(key, dynamicParam);
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

	private transformDates(data: IProfRequestAssignment) {
		const { AssignmentRequirement } = data,
			transformDate = (date: string) =>
				this.localizationService.TransformDate(date);
		AssignmentRequirement.TargetStartDate = transformDate(AssignmentRequirement.TargetStartDate);
		AssignmentRequirement.TargetEndDate = transformDate(AssignmentRequirement.TargetEndDate);
		return data;
	}

	public onApproverSubmit(data: ApprovalReq): void {
		this.approverDataLength = data;
		this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(this.approverDataLength.data));
		this.hasApproverDataLength = this.approverDataLength.data.length === Number(magicNumber.zero);
		this.statusId = this.profRequest.RequestDetail.StatusId;
	}

	public next(): void {
		this.currentStep += 1;
	}

	public prev(): void {
		this.currentStep -= 1;
	}

	onSwitchChange(event: boolean) {
		if (event) {
			this.showAllSectionSwitch = true;
			this.resetStep = true;
		} else {
			this.resetStep = false;
			this.currentStep = magicNumber.zero;
			this.showAllSectionSwitch = false;
		}
	}

	public getUDFLength(isUDFLength: boolean): void {
		this.hasUDFLength = isUDFLength;
	}

	public getDMSLength(isDMSLength: boolean): void {
		this.hasDMSLength = isDMSLength;
	}

	public scroollToTop() {
		window.scrollTo(magicNumber.zero, magicNumber.zero);
	}

	public getBenefitAdderData(data: IBenefitData[]): void {
		this.hasBenefitAdderLength = data.length > Number(magicNumber.zero);
	}

	public selectForm(): void {
		const payload = this.approverData();
		this.processFormRequest(this.professionalRequestService.approveRequest(payload), 'LiRequestApprovedSuccessfully');
	}

	public declineForm(): void {
		this.approvalCommentValidation();
		this.weekDayForm.markAllAsTouched();
		if (this.weekDayForm.valid) {
			const payload = this.approverData();
			this.processFormRequest(this.professionalRequestService.declineRequest(payload), 'LiRequestDeclinedSuccessfully');
		}
	}

	private processFormRequest(requestObservable: Observable<GenericResponseBase<string>>, successMessage: string) {
		requestObservable.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: GenericResponseBase<string>) => {
			if (!data.Succeeded) {
				this.toasterService.showToaster(ToastOptions.Error, data.Message);
			} else {
				this.toasterService.showToaster(
					ToastOptions.Success, successMessage,
					[{ Value: this.profRequest.RequestDetail.RequestCode, IsLocalizeKey: false }]
				);
				this.route.navigate([NavigationPaths.list]);
			}
		});
	}

	private approvalCommentValidation(): void {
		this.weekDayForm.controls['approverComment'].addValidators(this.customValidators.RequiredValidator('PleaseEnterApproverComment'));
		this.weekDayForm.controls['approverComment'].updateValueAndValidity();
	}

	private approverData(): IApprovePayload {
		return {
			"recordId": this.profRequest.RequestDetail.RequestId,
			"entityId": this.entityId,
			"approverComment": this.weekDayForm.controls['approverComment'].value
		};
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		localStorage.removeItem('isReviewLink');
	}

}
