import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { dropdownWithExtras } from '@xrm-core/models/dropdown.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { Subject, Subscription, takeUntil } from 'rxjs';
import {
	ICostAccountingCodeDetails, ICostAccountingFuncParams, ICostAccountingListWithIdPayload, IDialogButton, IJobCategoryListPayload,
	IJobCategoryListWithIdPayload, ILabourCategoryListPayload, ILabourCategoryListWithIdPayload, IReqLibraryDetails,
	IReqLibraryDetailsPayload, IReqLibraryDetailsWithIdPayload, ISectorDetailsAggrLocOrgDropdown, IUserDetails,
	LocationDetails, OrgTypeData, SectorDetails, SectorOrgLevelConfigDto
} from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { LightIndustrialService } from 'src/app/modules/job-order/light-industrial/services/light-industrial.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { RequisitionLibraryGatewayService } from 'src/app/services/masters/requisition-library-gateway.service';
import { ReasonForRequestService } from '@xrm-master/reason-for-request/services/reason-for-request.service';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { UserPermissions } from '@xrm-master/user/interface/user';
import { UsersService } from '@xrm-master/user/service/users.service';
import { DataAccessRights } from '@xrm-shared/enums/data-Access-Rights';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';
import { SharedVariablesService } from 'src/app/modules/job-order/light-industrial/services/shared-variables.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { AssignmentTypesEnum } from '@xrm-shared/services/common-constants/static-data.enum';
import { ProfessionalRequestService } from '../../../services/professional-request.service';
import { LocationService } from '@xrm-master/location/services/location.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { IJobCategoryDetails, ILaborCategoryDetails, IMinimumClearanceToStartList, IRequestLibraryItemResponse } from '../../../interface/shared-data.interface';
import { AssingmentDetailsService } from 'src/app/modules/contractor/assignment-details/service/assingmentDetails.service';
import { ILoadMoreColumnOptions } from '@xrm-shared/models/load-more.interface';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { flattenObject, replaceNestedValueObjects, transformResKeysClientPrimaryDetails, transformResponseKeys } from '../../../constant/helper-functions';
import { EntityActionID } from '../../../constant/entity-action';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { UserRole } from '@xrm-master/user/enum/enums';
import { DEFAULT_SECTOR_DETAILS } from 'src/app/modules/job-order/light-industrial/constant/li-request.constant';
import { StatusID } from '../../../constant/request-status';
import { assignmentRequirementModel } from '../../../models/assignment-requirement.model';
import { rateDetailsModel } from '../../../models/rate-details.model';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';

@Component({
	selector: 'app-job-details',
	templateUrl: './job-details.component.html',
	styleUrl: './job-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobDetailsComponent implements OnInit {
	@Input() childFormGroup: FormGroup;
	public requestDetailsFrom: FormGroup;
	public positionDetailsFrom: FormGroup;
	public candidateDetailsFrom: FormGroup;
	@Input() isEditMode: boolean = false;
	@Input() public profRequestDetails: any;
	@Input() public statusId: number;
	public magicNumber = magicNumber;
	public countryId: string;
	private requestDetails: any;
	public entityId: number = XrmEntities.ProfessionalRequest;
	public recordId: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.Add;
	public userType: number;

	public sectorList: dropdownWithExtras[] = [];
	public locationList: DropdownItem[] = [];
	public requestingManagerList: DropdownItem[] = [];
	public laborCategoryList: DropdownItem[] = [];
	public jobCategoryList: DropdownItem[] = [];
	public orgLevel1List: DropdownItem[] = [];
	public orgLevel2List: DropdownItem[] = [];
	public orgLevel3List: DropdownItem[] = [];
	public orgLevel4List: DropdownItem[] = [];
	public costAccountingCodeList: DropdownItem[] = [];
	public reasonForRequestList: DropdownItem[] = [];
	public assignmentTypeList: DropdownItem[] = [];
	public minimumClearanceToStartList: DropdownItem[] = [];
	public securityClearanceList: DropdownItem[] = [];

	private sectorDetails: any
	public locationDetails: any;
	private costAccountingCodeDetails: ICostAccountingCodeDetails[] = [];
	public costAccountingCodeHelpText: string = '';

	public sectorId: number = magicNumber.zero;
	public locationId: number = magicNumber.zero;
	private laborCategoryId: number = magicNumber.zero;
	private jobCategoryId: number = magicNumber.zero;
	public orgLevel1Id: number = magicNumber.zero;
	private orgLevel2Id: number = magicNumber.zero;
	private orgLevel3Id: number = magicNumber.zero;
	private orgLevel4Id: number = magicNumber.zero;
	private primaryManager: number = magicNumber.zero;
	private reasonForRequestId: number = magicNumber.zero;
	public reqLibraryId: number;
	public nonEditableField: boolean = false;
	private startDate: Date;
	public userDetails: IUserDetails | null = null;
	private reqLibraryDetails: any;
	private laborCategoryDetails: ILaborCategoryDetails | null;
	private JobCategoryDetails: IJobCategoryDetails | null;
	public isMinimumClearanceToStartVisible: boolean = false;
	public isCostAccountingCodeVisible: boolean = false;
	public isAllowStaffingToContactVisible: boolean = false;
	public isSecurityClrFieldEditable: boolean = false;
	private isPersistFormData: boolean = false;
	public isCandidateSectionVisible: boolean = false;
	public isFieldReadonlyForPSR: boolean = false;
	public steps = [
		{ label: "JobDetails", icon: "check", id: 'JobDetails' },
		{ label: "AssignmentDetails", icon: "check", id: 'AssignmentDetails' },
		{ label: "FinancialDetails", icon: "check", id: 'FinancialDetails' },
		{ label: "ApproverAndOtherDetails", icon: "check", id: 'ApproverOtherDetails' }
	];

	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;

	public reqLibDetailsToCopy: any;
	public loadMoreDataSource: any = [];
	public pageSize: number = magicNumber.ten;
	public startIndex: number = magicNumber.zero;
	private smartSearchText: string = '';
	public loadMoreTotal: number = magicNumber.zero;
	public isSearchLoadMore: boolean = false;
	private loadMorePopupOpenFrom: string;
	public loadMoreColumnOptions: ILoadMoreColumnOptions[] = this.sharedDataService.loadMoreColumnOptions;
	private dialogButtonSubLabCatChange: Subscription = new Subscription();
	private dialogButtonSubJobCatChange: Subscription = new Subscription();
	@Input() public destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	@Output() sectorChange: EventEmitter<number | null> = new EventEmitter<number | null>();
	@Output() locationChange: EventEmitter<number | null> = new EventEmitter<number | null>();
	@Output() reqLibraryChange: EventEmitter<number | null> = new EventEmitter<number | null>();
	@Output() copyPrevReq: EventEmitter<any> = new EventEmitter<any>();

	// eslint-disable-next-line max-params
	constructor(
		private sectorService: SectorService,
		private locationService: LocationService,
		public lightIndustrialService: LightIndustrialService,
		public localizationService: LocalizationService,
		private customValidators: CustomValidators,
		private reqLibraryService: RequisitionLibraryGatewayService,
		private reasonForRequestService: ReasonForRequestService,
		private costService: CostAccountingCodeService,
		private userService: UsersService,
		private laborCategoryService: LaborCategoryService,
		private sharedVariablesService: SharedVariablesService,
		private sharedDataService: SharedDataService,
		private professionalRequestService: ProfessionalRequestService,
		private toasterService: ToasterService,
		private assingmentDetailsService: AssingmentDetailsService,
		private scrollToTop: WindowScrollTopService,
		private cdr: ChangeDetectorRef,
		private dialogPopupService: DialogPopupService
	) { }

	ngOnInit() {
		this.requestDetailsFrom = this.childFormGroup.get('requestDetails') as FormGroup;
		this.positionDetailsFrom = this.childFormGroup.get('positionDetails') as FormGroup;
		this.candidateDetailsFrom = this.childFormGroup.get('candidateDetails') as FormGroup;
		this.startDate = new Date(this.sharedDataService.setDefaultStartDate());
		this.getUserType();
		this.getCultureType();
		this.persistFormValue();
	}

	public getUserType() {
		this.userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
	}

	private getCultureType() {
		this.countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
	}

	private getLoggedInUserDetails(): Promise<IUserDetails | null> {
		return new Promise((resolve) => {
			this.userService.getLoggedinUser().pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((data: GenericResponseBase<IUserDetails>) => {
					if (data.Succeeded) {
						this.userDetails = data.Data ?? null;
						resolve(this.userDetails);
					}
				});
		});
	}

	private getSectorList(): Promise<dropdownWithExtras[]> {
		return new Promise((resolve) => {
			this.sectorService.getSectorDropDownList().pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((data: GenericResponseBase<dropdownWithExtras[]>) => {
					if (data.Succeeded) {
						this.sectorList = data.Data ?? [];
						resolve(this.sectorList);
					}
				});
		});
	}

	private async persistFormValue() {
		await this.getSectorList();
		if (this.sharedDataService.jobDetailsFormPersist) {
			this.persistFormData();
		} else if (this.isEditMode) {
			this.getProfRequestDetails();
		} else {
			await this.handleNewFormData();
		}
	}

	private persistFormData() {
		this.isPersistFormData = true;
		const previousFormData = this.getFlattenedFormData();
		if (this.isClientWithMultipleSectors()) {
			this.getLoggedInUserDetails();
		}
		this.patchPreviousReqData(previousFormData);
		this.patchPreviousCandidate(previousFormData);
	}

	private getProfRequestDetails(retryDelay: number = magicNumber.hundred, maxDelay: number = magicNumber.tenThousand) {
		if (this.profRequestDetails) {
			this.requestDetails = flattenObject(this.profRequestDetails);
			this.patchProfRequestDetails(this.requestDetails);
			this.cdr.markForCheck();
		} else {
			const nextDelay = Math.min(retryDelay * magicNumber.two, maxDelay);
			setTimeout(() => {
				this.getProfRequestDetails(nextDelay, maxDelay);
			}, retryDelay);
		}
	}

	private async handleNewFormData() {
		if (this.isClientWithMultipleSectors()) {
			await this.patchClientPrimaryDetails();
		} else if (this.isSingleSector()) {
			this.patchSingleDDItemSector();
		}
	}

	public getRequestCode() {
		return this.profRequestDetails?.ProfRequest?.RequestDetail?.RequestCode;
	}

	private getFlattenedFormData() {
		return flattenObject(replaceNestedValueObjects(this.childFormGroup.getRawValue()));
	}

	private isClientWithMultipleSectors() {
		return this.userType == Number(UserRole.Client);
	}

	private isSingleSector() {
		return this.sectorList.length === Number(magicNumber.one);
	}

	private async patchClientPrimaryDetails() {
		await this.getLoggedInUserDetails();
		const reqData = this.userDetails
			? transformResKeysClientPrimaryDetails(this.userDetails)
			: null;
		if (reqData) {
			this.patchPreviousReqData(reqData);
		}
	}

	public onSectorChange(val: { Value: string } | null): void {
		if (!val) {
			this.resetOtherFieldsListOnSectorDeSelect();
			this.sectorChange.emit(null);
			this.copyPrevReq.emit(null);
			return;
		}
		const newSectorId = parseInt(val.Value);
		if (newSectorId !== this.sectorId) {
			this.resetOtherFieldsListOnSectorDeSelect();
			this.sectorId = newSectorId;
			this.getOtherFieldsListOnSectorSelect(newSectorId);
			this.onSelectionChange();
			this.sectorChange.emit(newSectorId);
			this.copyPrevReq.emit(null);
		}
	}

	private getOtherFieldsListOnSectorSelect(sectorId: number): void {
		this.getSectorDetailsAggrLocOrgCostCodeDropdown(sectorId);
		this.getRequestingManagerList(sectorId);
		this.getLaborCategoryList(sectorId);
		this.getCostAccountingCodeList(sectorId, this.startDate);
		this.getReasonForRequestList(sectorId);
		this.getMinimumClearanceToStartList(sectorId);
		this.getSecurityClearanceList();
	}

	private resetOtherFieldsListOnSectorDeSelect(): void {
		this.sectorId = magicNumber.zero;
		this.sectorDetails = null;
		this.resetLocationData(true);
		this.resetRequestingPrimaryManagerData(true);
		this.resetOrgLevelData();
		this.resetLabourCategoryData(true);
		this.resetJobCategoryData();
		this.resetReqLibrary();
		this.resetCostAccountingCodeList();
		this.resetReasonForRequestData(true);
		this.resetMinimumClearanceToStartList(false);
		this.resetAssignmentTypeList();
		this.resetSecurityClearanceData(false);
		this.reqLibraryId = magicNumber.zero;
		this.isAllowStaffingToContactVisible = false;
		this.isSecurityClrFieldEditable = false;
		this.positionDetailsFrom.get('PositionTitle')?.reset();
		this.resetSubmittalAllowed();
		this.isPersistFormData = false;
		this.sharedDataService.jobDetailsFormPersist = false;
		this.resetOtherStepperFormFields();
		this.onSelectionChange();
		this.shareFieldDetails();
	}

	private resetLocationData(isListReset: boolean): void {
		if (isListReset) {
			this.locationList = [];
		}
		this.locationId = magicNumber.zero;
		this.locationDetails = null;
		this.requestDetailsFrom.controls['WorkLocationId'].reset();
	}

	private resetRequestingPrimaryManagerData(isListReset: boolean): void {
		if (isListReset) {
			this.requestingManagerList = [];
		}
		// in case of reporting clp view no need to reset requesting primary manager
		if (this.userDetails?.DataAccessRight != magicNumber.twoHundredEighteen) {
			if (this.requestingManagerList.length != Number(magicNumber.one)) {
				this.primaryManager = magicNumber.zero;
				this.requestDetailsFrom.controls['RequestingManagerId'].reset();
			}
		}
	}

	private resetOrgLevelData(): void {
		this.orgLevel1Id = magicNumber.zero;
		this.orgLevel2Id = magicNumber.zero;
		this.orgLevel3Id = magicNumber.zero;
		this.orgLevel4Id = magicNumber.zero;
		this.orgLevel1List = [];
		this.orgLevel2List = [];
		this.orgLevel3List = [];
		this.orgLevel4List = [];
		this.requestDetailsFrom.controls['OrgLevel1Id'].reset();
		this.requestDetailsFrom.controls['OrgLevel2Id'].reset();
		this.requestDetailsFrom.controls['OrgLevel2Id'].clearValidators();
		this.requestDetailsFrom.controls['OrgLevel3Id'].reset();
		this.requestDetailsFrom.controls['OrgLevel3Id'].clearValidators();
		this.requestDetailsFrom.controls['OrgLevel4Id'].reset();
		this.requestDetailsFrom.controls['OrgLevel4Id'].clearValidators();

		this.orgType1Data = this.sharedVariablesService.orgType1Data;
		this.orgType2Data = this.sharedVariablesService.orgType2Data;
		this.orgType3Data = this.sharedVariablesService.orgType3Data;
		this.orgType4Data = this.sharedVariablesService.orgType4Data;
	}

	private resetLabourCategoryData(isListReset: boolean): void {
		if (isListReset) {
			this.laborCategoryList = [];
		}
		this.laborCategoryId = magicNumber.zero;
		this.positionDetailsFrom.controls['LaborCategoryId'].reset();
	}

	private resetJobCategoryData(): void {
		this.jobCategoryList = [];
		this.jobCategoryId = magicNumber.zero;
		this.positionDetailsFrom.controls['JobCategoryId'].reset();
		this.isPersistFormData = false;
	}

	private resetReqLibrary(): void {
		this.positionDetailsFrom.controls['ReqLibraryId'].reset();
	}

	private resetCostAccountingCodeList(): void {
		this.costAccountingCodeList = [];
		this.requestDetailsFrom.controls['CostAccountingId'].reset();
		this.costAccountingCodeDetails = [];
		this.costAccountingCodeHelpText = '';
	}

	private resetReasonForRequestData(isListReset: boolean): void {
		if (isListReset) {
			this.reasonForRequestList = [];
		}
		this.reasonForRequestId = magicNumber.zero;
		this.requestDetailsFrom.controls['ReasonForRequestId'].reset();
	}

	private resetMinimumClearanceToStartList(isListReset: boolean): void {
		if (isListReset) {
			this.minimumClearanceToStartList = [];
		}
		this.isMinimumClearanceToStartVisible = false;
		this.positionDetailsFrom.controls['MinimumClearanceToStartId'].reset();
	}

	private resetAssignmentTypeList(): void {
		this.assignmentTypeList = [];
		this.positionDetailsFrom.controls['AssignmentTypeId'].reset();
	}

	private resetSecurityClearanceData(isListReset: boolean): void {
		if (isListReset) {
			this.securityClearanceList = [];
		}
		this.positionDetailsFrom.controls['SecurityClearanceId'].reset();
	}

	private resetSubmittalAllowed() {
		if (!this.requestDetailsFrom.get('IsPreIdentifiedRequest')?.value) {
			this.requestDetailsFrom.get('SubmittalAllowedPerStaffing')?.reset();
			this.requestDetailsFrom.get('SubmittalAllowedForThisRequest')?.reset();
		}
	}

	private resetOtherStepperFormFields() {
		this.resetAssignmentDetailsForm();
		this.resetRateDetailsForm();
		this.childFormGroup.get('UKey')?.reset();
		(this.childFormGroup.get('requestComments') as FormGroup).reset();
		this.sharedDataService.approverOtherDetailsFormPersist = false;
	}
	private resetAssignmentDetailsForm() {
		const initialAssignmentRequirementValues = assignmentRequirementModel(this.customValidators).getRawValue();
		(this.childFormGroup.get('assignmentRequirement') as FormGroup).reset(initialAssignmentRequirementValues);
		this.sharedDataService.assignmentDetailsFormPersist = false;
	}
	private resetRateDetailsForm() {
		const initialRateDetailsValues = rateDetailsModel(this.customValidators).getRawValue();
		(this.childFormGroup.get('rateDetails') as FormGroup).reset(initialRateDetailsValues);
		this.sharedDataService.financeDetailsFormPersist = false;
		this.resetBenefitAdder();
	}
	private resetBenefitAdder() {
		this.childFormGroup.get('BenefitAddDto')?.reset();
	}

	private getSectorDetailsAggrLocOrgCostCodeDropdown(sectorId: number, optionalCallback?: () => void): void {
		this.lightIndustrialService.getDropdownValueBasedOnSector(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: ISectorDetailsAggrLocOrgDropdown) => {
				if (data.ddlLocation.Data ||
					data.ddlOrg1Sector.Data ||
					data.ddlOrg2Sector.Data ||
					data.ddlOrg3Sector.Data ||
					data.ddlOrg4Sector.Data ||
					data.ddlsectordetail.Data) {
					this.locationList = data.ddlLocation.Data ?? [];
					this.orgLevel1List = data.ddlOrg1Sector.Data ?? [];
					this.orgLevel2List = data.ddlOrg2Sector.Data ?? [];
					this.orgLevel3List = data.ddlOrg3Sector.Data ?? [];
					this.orgLevel4List = data.ddlOrg4Sector.Data ?? [];
					this.sectorDetails = data.ddlsectordetail.Data;
					this.setOrgLevelConfig(this.sectorDetails);
					this.otherFieldsConfigBySectorDetails(this.sectorDetails);
					this.shareFieldDetails();
				} else {
					this.resetOtherFieldsListOnSectorDeSelect();
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemLocation();
					this.patchSingleDDItemOrgLevel1();
					this.patchSingleDDItemOrgLevel2();
					this.patchSingleDDItemOrgLevel3();
					this.patchSingleDDItemOrgLevel4();
					this.patchSingleDDItemLaborCategory();
					this.patchSingleDDItemReasonForRequest();
				}
			}
		});
	}

	private patchSingleDDItemLocation(): void {
		if (this.locationList.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				WorkLocationId: {
					Text: this.locationList[magicNumber.zero].Text,
					Value: this.locationList[magicNumber.zero].Value
				}
			});
			this.onLocationChange(this.locationList[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel1(): void {
		if (this.orgLevel1List.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				OrgLevel1Id: {
					Text: this.orgLevel1List[magicNumber.zero].Text,
					Value: this.orgLevel1List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel1Change(this.orgLevel1List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel2(): void {
		if (this.orgLevel2List.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				OrgLevel2Id: {
					Text: this.orgLevel2List[magicNumber.zero].Text,
					Value: this.orgLevel2List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel2Change(this.orgLevel2List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel3(): void {
		if (this.orgLevel3List.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				OrgLevel3Id: {
					Text: this.orgLevel3List[magicNumber.zero].Text,
					Value: this.orgLevel3List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel3Change(this.orgLevel3List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel4(): void {
		if (this.orgLevel4List.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				OrgLevel4Id: {
					Text: this.orgLevel4List[magicNumber.zero].Text,
					Value: this.orgLevel4List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel4Change(this.orgLevel4List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemCostAccountingCode(): void {
		if (this.costAccountingCodeList.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				CostAccountingId: {
					Text: this.costAccountingCodeList[magicNumber.zero]?.Text,
					Value: this.costAccountingCodeList[magicNumber.zero]?.Value
				}
			});
			this.onCostAccountingCodeChange(this.costAccountingCodeList[magicNumber.zero]);
		}
	}

	private patchSingleDDItemReasonForRequest(): void {
		if (this.reasonForRequestList.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				ReasonForRequestId: {
					Text: this.reasonForRequestList[magicNumber.zero].Text,
					Value: this.reasonForRequestList[magicNumber.zero].Value
				}
			});
			this.onReasonForRequestChange(this.reasonForRequestList[magicNumber.zero]);
		}
	}

	private patchSingleDDItemSecurityClearance(): void {
		if (this.securityClearanceList.length === Number(magicNumber.one)) {
			this.positionDetailsFrom.patchValue({
				SecurityClearanceId: {
					Text: this.securityClearanceList[magicNumber.zero].Text,
					Value: this.securityClearanceList[magicNumber.zero].Value
				}
			});
			this.onSecurityClearanceChange(this.securityClearanceList[magicNumber.zero]);
		}
	}

	public onLocationChange(val: { Value: string } | null): void {
		if (!val) {
			this.resetLocationDataAndRelatedFields();
			this.resetLocationData(false);
			this.locationChange.emit(null);
			this.sharedDataService.fieldOnChange.location.isShiftReset = true;
			this.sharedDataService.fieldOnChange.location.isHDRReset = true;
			return;
		}
		const sectorId = this.requestDetailsFrom.value?.SectorId?.Value,
			newLocationId = parseInt(val.Value);
		if (newLocationId !== this.locationId) {
			this.resetLocationDataAndRelatedFields();
			this.locationId = newLocationId;
			this.updateLocationDetailsHDRAndShiftList(sectorId, newLocationId);
			this.onSelectionChange();
			this.locationChange.emit(newLocationId);
			this.sharedDataService.fieldOnChange.location.isShiftReset = true;
			this.sharedDataService.fieldOnChange.location.isHDRReset = true;
		}
	}

	private resetLocationDataAndRelatedFields(): void {
		this.resetLabourCategoryData(false);
		this.resetJobCategoryData();
		// this.resetAssignmentTypeList();
		this.reqLibraryId = magicNumber.zero;
		this.resetRequestingPrimaryManagerData(false);
		this.nonEditableField = false;
		if (!this.isEditMode)
			this.resetReasonForRequestData(false);
		this.reqLibraryChange.emit(null);
		this.locationDetails = null;
		this.laborCategoryDetails = null;
		this.JobCategoryDetails = null;
		this.reqLibraryDetails = null;
		this.shareFieldDetails();

	}
	private updateLocationDetailsHDRAndShiftList(sectorId: number, locationId: number): void {
		this.getLocationDetails(locationId);
		this.getAssignmentTypeList(sectorId, locationId);
		this.reqLibraryId = magicNumber.zero;
	}

	private getLocationDetails(locationId: number, optionalCallback?: () => void): void {
		this.locationService.getLocationData(locationId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<LocationDetails>) => {
				if (data.Succeeded && data.Data) {
					this.locationDetails = data.Data;
					this.cdr.markForCheck();
					this.shareFieldDetails();
				} else {
					this.locationDetails = null;
					this.toasterService.showToaster(ToastOptions.Error, "There is some technical error.");
				}
				if (optionalCallback) {
					optionalCallback();
				}
			}
		});
	}
	private getAssignmentTypeList(sectorId: number, locationId: number, optionalCallback?: () => void): void {
		const reqPayload = { secId: sectorId, locId: locationId };
		this.professionalRequestService.getAssignmentTypeDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.assignmentTypeList = data.Data ?? [];
				} else {
					this.assignmentTypeList = [];
				}
				this.cdr.markForCheck();
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemAssignmentType();
				}

			}
		});
	}
	private patchSingleDDItemAssignmentType(): void {
		if (this.assignmentTypeList.length === Number(magicNumber.one)) {
			this.positionDetailsFrom.patchValue({
				AssignmentTypeId: {
					Text: this.assignmentTypeList[magicNumber.zero].Text,
					Value: this.assignmentTypeList[magicNumber.zero].Value
				}
			});
		}
	}

	private getCostAccountingCodeList(sectorId: number, startDate: Date | string, optionalCallback?: () => void): void {
		const reqPayload: ICostAccountingListWithIdPayload = {
			secId: sectorId,
			startDate: this.localizationService.TransformDate(startDate, 'MM-dd-YYYY')
		};
		this.lightIndustrialService.getCostAccountingCodeDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.costAccountingCodeList = data.Data ?? [];
					if (this.costAccountingCodeList.length === Number(magicNumber.one)) {
						this.patchSingleDDItemCostAccountingCode();
					}
				} else {
					this.costAccountingCodeList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				}
			}
		});
	}

	private getReasonForRequestList(sectorId: number, optionalCallback?: () => void): void {
		this.reasonForRequestService.getReasonForRequestDropdownProff(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.reasonForRequestList = data.Data ?? [];
				} else {
					this.reasonForRequestList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemReasonForRequest();
				}
			}
		});
	}
	// #endregion all dropdown call

	private getMinimumClearanceToStartList(sectorId: number, optionalCallback?: () => void): void {
		const reqPayload: IMinimumClearanceToStartList = {
			"secId": sectorId,
			"isProfessional": true
		};
		this.professionalRequestService.getMinimumClearanceToStartDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.minimumClearanceToStartList = data.Data ?? [];
				} else {
					this.minimumClearanceToStartList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemMinimumClearanceToStart();
				}
			}
		});
	}

	private patchSingleDDItemMinimumClearanceToStart(): void {
		if (this.minimumClearanceToStartList.length === Number(magicNumber.one)) {
			this.positionDetailsFrom.patchValue({
				MinimumClearanceToStartId: {
					Text: this.minimumClearanceToStartList[magicNumber.zero].Text,
					Value: this.minimumClearanceToStartList[magicNumber.zero].Value
				}
			});
		}
	}

	private otherFieldsConfigBySectorDetails(sectorDetails: any): void {
		this.costAccountingCodeShow(sectorDetails.IsChargeInReqPsr);
		this.securityClrFieldEditable(sectorDetails.IsSecurityClearance);
		this.allowStaffingToContact(sectorDetails.DisplayCanSupplierContactQusInReq);
	}

	public costAccountingCodeShow(IsChargeInReqPsr: boolean): void {
		const control = this.requestDetailsFrom.controls['CostAccountingId'];
		if (IsChargeInReqPsr) {
			this.showCostAccountingCode(control);
		} else {
			this.hideCostAccountingCode(control);
		}
	}

	private hideCostAccountingCode(control: AbstractControl): void {
		this.isCostAccountingCodeVisible = false;
		control.reset();
		control.clearValidators();
		control.updateValueAndValidity();
	}

	private showCostAccountingCode(control: AbstractControl): void {
		this.isCostAccountingCodeVisible = true;
		control.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'CostAccountingCode', IsLocalizeKey: true }]));
		control.updateValueAndValidity();
	}

	private allowStaffingToContact(displayCanSupplierContactQusInReq: boolean) {
		const control = this.requestDetailsFrom.controls['IsAllowStaffingToContact'];
		if (displayCanSupplierContactQusInReq) {
			this.showAllowStaffingToContact();
		} else {
			this.hideAllowStaffingToContact(control);
		}
	}

	private hideAllowStaffingToContact(control: AbstractControl): void {
		this.isAllowStaffingToContactVisible = false;
		control.setValue(false);
	}

	private showAllowStaffingToContact(): void {
		this.isAllowStaffingToContactVisible = true;
	}

	private securityClrFieldEditable(isSecurityClearance: boolean) {
		if (!isSecurityClearance) {
			const control = this.positionDetailsFrom.controls['SecurityClearanceId'],
				findIndex = this.securityClearanceList.find((ele: DropdownItem) =>
					ele.Value == String(magicNumber.one));
			if (findIndex) {
				control.setValue(findIndex);
				this.isSecurityClrFieldEditable = true;
			} else {
				this.isSecurityClrFieldEditable = false;
			}
		}
	}

	private setOrgLevelConfig(sectorDetails: any) {
		const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
		orgTypes.forEach((orgType) => {
			const org = sectorDetails.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
				orgData.OrgType === Number(orgType));
			// Assign org type data to corresponding variables
			this.assignOrgTypeData(orgType, org);
		});
		if (sectorDetails.SectorOrgLevelConfigDtos.length) {
			sectorDetails.SectorOrgLevelConfigDtos.forEach((orgData: SectorOrgLevelConfigDto) => {
				if (orgData.OrgType === Number(magicNumber.one) && orgData.IsMandatory) {
					this.requestDetailsFrom.get('OrgLevel1Id')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType1Data.OrgName, IsLocalizeKey: true }]));
					this.requestDetailsFrom.get('OrgLevel1Id')?.updateValueAndValidity();
				}
				else if (orgData.OrgType === Number(magicNumber.two) && orgData.IsMandatory) {
					this.requestDetailsFrom.get('OrgLevel2Id')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType2Data.OrgName, IsLocalizeKey: true }]));
					this.requestDetailsFrom.get('OrgLevel2Id')?.updateValueAndValidity();
				}
				else if (orgData.OrgType === Number(magicNumber.three) && orgData.IsMandatory) {
					this.requestDetailsFrom.get('OrgLevel3Id')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType3Data.OrgName, IsLocalizeKey: true }]));
					this.requestDetailsFrom.get('OrgLevel3Id')?.updateValueAndValidity();
				}
				else if (orgData.OrgType === Number(magicNumber.four) && orgData.IsMandatory) {
					this.requestDetailsFrom.get('OrgLevel4Id')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType4Data.OrgName, IsLocalizeKey: true }]));
					this.requestDetailsFrom.get('OrgLevel4Id')?.updateValueAndValidity();
				}
			});
		}
	}

	private assignOrgTypeData(orgType: number, org: SectorOrgLevelConfigDto): void {
		const orgTypeData = {
			OrgName: org?.LocalizedKey
				? this.localizationService.GetLocalizeMessage(org.LocalizedKey)
				: '',
			IsMandatory: org
				? org.IsMandatory
				: false,
			IsVisible: org
				? org.IsVisible
				: false
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

	public onLaborCategoryChange(val: { Value: string } | null): void {
		if (this.isEditMode && this.laborCategoryId > magicNumber.zero) {
			this.handleEditModeLaborCategoryChange(val);
		} else {
			this.handleNewModeLaborCategoryChange(val);
		}
	}

	private handleEditModeLaborCategoryChange(val: { Value: string } | null): void {
		const laborCategoryId = val ? Number(val.Value) : null;
		if ((laborCategoryId && this.laborCategoryId !== laborCategoryId) || (!laborCategoryId && this.laborCategoryId !== null)) {
			this.showLaborCategoryChangeConfirmation();
			this.subscribeToDialogLabCatChange(val);
		}
	}

	private handleNewModeLaborCategoryChange(val: { Value: string } | null): void {
		if (!val) {
			this.resetLaborCategoryDataAndJobCategory();
			this.resetLabourCategoryData(false);
			return;
		}
		const laborCategoryId = parseInt(val.Value);
		if (laborCategoryId !== this.laborCategoryId) {
			this.resetLaborCategoryDataAndJobCategory();
			this.updateLaborCategoryDetails(laborCategoryId);
		}
	}

	private showLaborCategoryChangeConfirmation(): void {
		this.dialogPopupService.showConfirmation('LaborCategoryChangeConfirmation', PopupDialogButtons.proceedYesNo);
		this.cdr.markForCheck();
	}

	private subscribeToDialogLabCatChange(val: { Value: string } | null): void {
		this.dialogButtonSubLabCatChange.unsubscribe();
		this.dialogButtonSubLabCatChange = this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((button: IDialogButton | string | null) => {
				if (button) {
					this.handleLaborCategoryConfirmation(button, val);
				}
			});
	}

	private async handleLaborCategoryConfirmation(button: IDialogButton | string, val: { Value: string } | null): Promise<void> {
		if (this.isCloseAction(button)) {
			this.resetLaborCategory();
		} else if (this.isProceedAction(button)) {
			this.proceedWithLaborCategoryChange(val);
		} else if (this.isCancelAction(button)) {
			this.resetLaborCategory();
		}
		this.dialogPopupService.resetDialogButton();
	}

	private isCloseAction(button: IDialogButton | string): boolean {
		return typeof button === 'string' && button === 'close';
	}

	private isProceedAction(button: IDialogButton | string): boolean {
		return typeof button === 'object' && button.value === Number(magicNumber.twentyFour);
	}

	private isCancelAction(button: IDialogButton | string): boolean {
		return typeof button === 'object' && button.value === Number(magicNumber.twentyThree);
	}

	private resetLaborCategory(): void {
		this.positionDetailsFrom.controls['LaborCategoryId'].setValue(String(this.laborCategoryId));
	}

	private proceedWithLaborCategoryChange(val: { Value: string } | null): void {
		if (!val) {
			this.resetLaborCategoryDataAndJobCategory();
			this.resetLabourCategoryData(false);
		} else {
			const laborCategoryId = parseInt(val.Value);
			if (laborCategoryId !== this.laborCategoryId) {
				this.resetLaborCategoryDataAndJobCategory();
				this.updateLaborCategoryDetails(laborCategoryId);
			}
		}
	}

	private resetLaborCategoryDataAndJobCategory(): void {
		this.resetJobCategoryData();
		this.reqLibraryId = magicNumber.zero;
		this.reqLibraryChange.emit(null);
		this.laborCategoryDetails = null;
		this.JobCategoryDetails = null;
		this.reqLibraryDetails = null;
		this.shareFieldDetails();
	}

	private updateLaborCategoryDetails(laborCategoryId: number): void {
		this.laborCategoryId = laborCategoryId;
		if (this.locationId) {
			this.onSelectionChange();
			this.getLaborCategoryDetails(laborCategoryId);
			this.getJobCategoryList(laborCategoryId);
		}
	}

	private getJobCategoryList(laborCategoryId: number, optionalCallback?: () => void): void {
		const reqPayload: IJobCategoryListPayload = {
			"locId": parseInt(this.requestDetailsFrom.get('WorkLocationId')?.value?.Value),
			"laborCatId": laborCategoryId
		};
		this.reqLibraryService.getJobCategoryDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.jobCategoryList = data.Data ?? [];
				} else {
					this.jobCategoryList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemJobCategory();
				}
			}
		});
	}

	private patchSingleDDItemJobCategory(): void {
		if (this.jobCategoryList.length === Number(magicNumber.one)) {
			this.positionDetailsFrom.patchValue({
				JobCategoryId: {
					Text: this.jobCategoryList[magicNumber.zero].Text,
					Value: this.jobCategoryList[magicNumber.zero].Value
				}
			});
			this.onJobCategoryChange(this.jobCategoryList[magicNumber.zero]);
		}
	}

	public onOrgLevel1Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel1Id = parseInt(val.Value);
			this.onSelectionChange();
		}
	}

	public onOrgLevel2Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel2Id = parseInt(val.Value);
			this.onSelectionChange();
		}
	}

	public onOrgLevel3Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel3Id = parseInt(val.Value);
			this.onSelectionChange();
		}
	}

	public onOrgLevel4Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel4Id = parseInt(val.Value);
			this.onSelectionChange();
		}
	}

	public onJobCategoryChange(val: { Text: string, Value: string } | null): void {
		if (this.isEditMode && this.jobCategoryId > magicNumber.zero) {
			this.handleEditModeJobCategoryChange(val);
		} else {
			this.handleNewModeJobCategoryChange(val);
		}
		this.resetJobCategoryState();
		this.shareFieldDetails();
	}

	private handleEditModeJobCategoryChange(val: { Text: string, Value: string } | null): void {
		const jobCategoryId = val ? Number(val.Value) : null;

		if ((jobCategoryId && this.jobCategoryId !== jobCategoryId) || (!jobCategoryId && this.jobCategoryId !== null)) {
			this.showJobCategoryChangeConfirmation();
			this.subscribeToJobCategoryDialog(val);
		}
	}

	private handleNewModeJobCategoryChange(val: { Text: string, Value: string } | null): void {
		if (val) {
			this.jobCategoryId = parseInt(val.Value);
			this.getJobCategoryDetails(this.jobCategoryId);
			this.getReqLibrarayDetails(this.jobCategoryId);
		}
	}

	private showJobCategoryChangeConfirmation(): void {
		this.dialogPopupService.showConfirmation('JobCategoryChangeConfirmation', PopupDialogButtons.proceedYesNo);
		this.cdr.markForCheck();
	}

	private subscribeToJobCategoryDialog(val: { Text: string, Value: string } | null): void {
		this.dialogButtonSubJobCatChange.unsubscribe();
		this.dialogButtonSubJobCatChange = this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((button: IDialogButton | string | null) => {
				if (button) {
					this.handleJobCategoryConfirmation(button, val);
				}
			});
	}

	private async handleJobCategoryConfirmation(button: IDialogButton | string, val: { Text: string, Value: string } | null): Promise<void> {
		if (this.isCloseAction(button)) {
			this.resetJobCategory();
		} else if (this.isProceedAction(button)) {
			this.proceedWithJobCategoryChange(val);
		} else if (this.isCancelAction(button)) {
			this.resetJobCategory();
		}
		this.dialogPopupService.resetDialogButton();
	}

	private resetJobCategory(): void {
		this.positionDetailsFrom.controls['JobCategoryId'].setValue(String(this.jobCategoryId));
	}

	private proceedWithJobCategoryChange(val: { Text: string, Value: string } | null): void {
		if (!val) {
			this.jobCategoryId = magicNumber.zero;
			this.resetJobCategory();
			this.resetJobCategoryState();
		} else {
			this.jobCategoryId = parseInt(val.Value);
			this.getJobCategoryDetails(this.jobCategoryId);
			this.getReqLibrarayDetails(this.jobCategoryId);
		}
	}

	private resetJobCategoryState(): void {
		this.reqLibraryId = magicNumber.zero;
		this.reqLibraryChange.emit(null);
		this.sharedDataService.fieldOnChange.jobCategory.description = true;
		this.sharedDataService.fieldOnChange.jobCategory.isWageReset = true;
		this.JobCategoryDetails = null;
		this.reqLibraryDetails = null;
	}

	private getReqLibrarayDetails(jobCategoryId: number): void {
		const reqPayload: IReqLibraryDetailsPayload = {
			secId: parseInt(this.requestDetailsFrom.get('SectorId')?.value.Value),
			locId: parseInt(this.requestDetailsFrom.get('WorkLocationId')?.value.Value),
			laborCatId: parseInt(this.positionDetailsFrom.get('LaborCategoryId')?.value.Value),
			jobCatId: jobCategoryId
		};
		this.reqLibraryService.getReqLibraryDetails(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<IReqLibraryDetails>) => {
				if (data.Succeeded && data.Data) {
					this.reqLibraryDetails = data.Data;
					this.reqLibraryId = this.reqLibraryDetails.Id;
					this.positionDetailsFrom.controls['ReqLibraryId'].setValue(this.reqLibraryId);
					this.reqLibraryChange.emit(this.reqLibraryId);
					this.onSelectionChange();
					this.shareFieldDetails();
				} else {
					this.reqLibraryDetails = null;
					this.reqLibraryChange.emit(null);

				}
			}
		});
	}

	public onReasonForRequestChange(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.reasonForRequestId = parseInt(val.Value);
			this.onSelectionChange();
		} else {
			this.reasonForRequestId = magicNumber.zero;
		}
	}

	public onCostAccountingCodeChange(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			const costId = parseInt(val.Value);
			this.getCostAccountingDetailsById(costId);
		} else {
			this.costAccountingCodeDetails = [];
			this.costAccountingCodeHelpText = '';
		}
	}

	public onRequestingManagerChange(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.primaryManager = parseInt(val.Value);
			this.onSelectionChange();
		} else {
			this.primaryManager = magicNumber.zero;
		}
	}

	private getCostAccountingDetailsById(costAccountingCodeId: number): void {
		this.costService.getCostAccountingDetails(costAccountingCodeId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<ICostAccountingCodeDetails[]>) => {
				if (data.Succeeded && data.Data) {
					this.costAccountingCodeDetails = data.Data;
					this.costAccountingCodeHelpText = this.costAccountingCodeDetails[magicNumber.zero].Description;
					this.cdr.markForCheck();
				} else {
					this.costAccountingCodeDetails = [];
					this.costAccountingCodeHelpText = '';
				}
			}
		});
	}

	private getRequestingManagerList(sectorId: number, optionalCallback?: () => void): void {
		const payload: UserPermissions = {
			"roleGroupIds": [],
			"roleGroupDtos": [{ "roleGroupId": magicNumber.four, "roleNos": [] }],
			"xrmEntityActionIds": [EntityActionID.Create, EntityActionID.Edit],
			"sectorIds": [sectorId],
			"locationIds": [],
			"orgLevel1Ids": []
		};
		this.userService.getUsersWithFilter(payload).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.requestingManagerList = data.Data ?? [];
				} else {
					this.requestingManagerList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemRequestingManager();
				}
			});
	}

	private patchSingleDDItemRequestingManager(): void {
		if (this.requestingManagerList.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				RequestingManagerId: {
					Text: this.requestingManagerList[magicNumber.zero].Text,
					Value: (this.requestingManagerList[magicNumber.zero].Value).toString()
				}
			});
		}
	}


	private getLaborCategoryList(sectorId: number, optionalCallback?: () => void): void {
		const reqPayload: ILabourCategoryListPayload = {
			"secId": sectorId,
			"laborCatTypeId": AssignmentTypesEnum.Prof
		};
		this.laborCategoryService.getLaborCategoryDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.laborCategoryList = data.Data ?? [];
				} else {
					this.laborCategoryList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemLaborCategory();
				}
			}
		});
	}

	private patchSingleDDItemLaborCategory(): void {
		if (this.laborCategoryList.length === Number(magicNumber.one)) {
			this.positionDetailsFrom.patchValue({
				LaborCategoryId: {
					Text: this.laborCategoryList[magicNumber.zero].Text,
					Value: this.laborCategoryList[magicNumber.zero].Value
				}
			});
			this.onLaborCategoryChange(this.laborCategoryList[magicNumber.zero]);
		}
	}

	private getLaborCategoryDetails(laborCategoryId: number): void {
		this.professionalRequestService.getLabourCategoryDetails(laborCategoryId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (res: GenericResponseBase<ILaborCategoryDetails>) => {
				if (res.Succeeded && res.Data) {
					this.laborCategoryDetails = res.Data;
					if (!this.isPersistFormData) {
						this.patchFormField('SubmittalAllowedPerStaffing', res.Data.MaxSubmittalsPerStaffingAgency);
						this.patchFormField('SubmittalAllowedForThisRequest', res.Data.MaxSubmittalsTotalPerPosition);
					}
					this.shareFieldDetails();
				} else {
					this.laborCategoryDetails = null;
				}
			}
		});
	}

	private patchFormField(fieldName: string, value: number): void {
		const control = this.requestDetailsFrom.get(fieldName);
		if (control && !control.value) {
			control.patchValue(value);
		}
	}

	private getJobCategoryDetails(jobCategoryId: number): void {
		this.professionalRequestService.getJobCategoryDetails(jobCategoryId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<IJobCategoryDetails>) => {
				if (data.Succeeded && data.Data) {
					this.JobCategoryDetails = data.Data;
					this.shareFieldDetails();
				} else {
					this.JobCategoryDetails = null;
				}
			}
		});
	}

	private getSecurityClearanceList(optionalCallback?: () => void): void {
		this.assingmentDetailsService.getSecurityClearance().pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data) => {
				if (data.Succeeded) {
					this.securityClearanceList = data.Data ?? [];
				} else {
					this.securityClearanceList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemSecurityClearance();
				}
			}
		});
	}

	private getProfessionalRequestToCopy() {
		const RequestingManagerId = this.requestDetailsFrom.get('RequestingManagerId')?.value
			? this.requestDetailsFrom.get('RequestingManagerId')?.value.Value
			: null,
			data = {
				pageSize: this.pageSize,
				startIndex: this.startIndex * this.pageSize,
				smartSearchText: this.smartSearchText,
				xrmEntityId: this.entityId
			};
		this.professionalRequestService.getPreviousProfessionalRequest(RequestingManagerId, data)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<any>) => {
				if (res.Succeeded && res.Data) {
					if (this.isSearchLoadMore) {
						this.loadMoreDataSource = this.flattenArray(res.Data.Data);
						this.cdr.markForCheck();
						this.isSearchLoadMore = false;
						this.scrollToTop.scrollTop();
					} else {
						this.loadMoreDataSource = this.loadMoreDataSource.concat(this.flattenArray(res.Data.Data));
						this.cdr.markForCheck();
					}
					this.loadMoreTotal = res.Data.Count;
				} else {
					this.loadMoreDataSource = [];
					this.loadMoreTotal = magicNumber.zero;
				}
			});
	}

	flattenObject(obj: Record<string, any>, prefix = ''): any {
		const result: any = {};
		for (const key in obj) {
			if (Object.hasOwn(obj, key)) {
				const value = obj[key],
					newKey = prefix
						? `${prefix}.${key}`
						: key;
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					Object.assign(result, flattenObject(value, newKey));
				} else {
					result[newKey] = value;
				}
			}
		}
		return result;
	}

	flattenArray(data: Record<string, any>[]): any[] {
		return data.map((item) =>
			flattenObject(item));
	}

	public getReqLibDetailsToCopy() {
		const ids = { secId: this.sectorId, locId: this.locationId },
			data = {
				pageSize: this.pageSize,
				startIndex: this.startIndex * this.pageSize,
				smartSearchText: this.smartSearchText,
				xrmEntityId: this.entityId
			};
		this.professionalRequestService.getReqLibDetailsToCopy(ids, data).subscribe((res: GenericResponseBase<IRequestLibraryItemResponse>) => {
			if (res.Succeeded && res.Data) {
				if (this.isSearchLoadMore) {
					this.loadMoreDataSource = transformResponseKeys(res.Data.Data);
					this.isSearchLoadMore = false;
					this.scrollToTop.scrollTop();
				} else {
					this.loadMoreDataSource = this.loadMoreDataSource.concat(transformResponseKeys(res.Data.Data));
					this.cdr.markForCheck();
				}
				this.loadMoreTotal = res.Data.Count;
			} else {
				this.loadMoreDataSource = [];
				this.loadMoreTotal = magicNumber.zero;
			}
		});
	}

	private openPopupLoadMoreDataCall() {
		if (this.loadMorePopupOpenFrom === 'ReqLib') {
			this.loadMoreColumnOptions = this.sharedDataService.loadMoreColumnOptions.filter((option: ILoadMoreColumnOptions) =>
					 option.fieldName !== 'IsPreIdentifiedRequest');
			if (this.checkIfHideNTERate()) {
				this.loadMoreColumnOptions = this.getFilteredColumnOptions();
			}
			this.getReqLibDetailsToCopy();
		} else {
			this.loadMoreColumnOptions = this.sharedDataService.loadMoreColumnOptions;
			this.getProfessionalRequestToCopy();
		}
	}

	private checkIfHideNTERate(): boolean {
		return this.locationDetails.IsAlternateConfigurationForMSPProcess
			? this.locationDetails.HideNteRateFromReqLib
			: this.sectorDetails.HideNteRateFromReqLib;
	}

	private getFilteredColumnOptions(): ILoadMoreColumnOptions[] {
		return this.loadMoreColumnOptions.filter((option: ILoadMoreColumnOptions) =>
			option.fieldName !== "NteBillRate");
	}

	public openPopupLoadMore(popupOpenFrom: string) {
		this.resetLoadMoreCopyData();
		this.loadMorePopupOpenFrom = popupOpenFrom;
		this.openPopupLoadMoreDataCall();
	}

	public searchPreviousData(event: string) {
		this.startIndex = magicNumber.zero;
		this.smartSearchText = event;
		this.isSearchLoadMore = true;
		this.openPopupLoadMoreDataCall();
	}

	public loadMoreData() {
		if (this.loadMoreDataSource.length < this.loadMoreTotal) {
			this.startIndex++;
			this.openPopupLoadMoreDataCall();
		}
	}

	public getCopyData(previousReqData: any) {
		this.isPersistFormData = false;
		this.copyPrevReq.emit(previousReqData);
		this.resetOtherFieldsListBeforeCopyNewData();
		this.patchPreIdentifiedRequest(previousReqData);
		this.patchPreviousReqData(previousReqData);
		this.patchOtherDetails(previousReqData);
	}

	private resetOtherFieldsListBeforeCopyNewData() {
		this.resetOtherFieldsListOnSectorDeSelect();
	}

	private resetLoadMoreCopyData() {
		this.isSearchLoadMore = false;
		this.loadMoreDataSource = [];
		this.startIndex = magicNumber.zero;
		this.smartSearchText = '';
		this.loadMoreTotal = magicNumber.zero;
	}
	// end load more popup

	public onSecurityClearanceChange(val?: { Text: string, Value: string }): void {
		const control = this.positionDetailsFrom.controls['MinimumClearanceToStartId'],
			requiresClearance = val && this.sectorDetails.IsSecurityClearance && Number(val.Value) > Number(magicNumber.one);
		if (requiresClearance) {
			this.getMinimumClearanceToStartList(this.sectorId);
			this.showMinimumClearanceToStart(control);
		} else {
			this.hideMinimumClearanceToStart(control);
		}
	}

	private hideMinimumClearanceToStart(control: AbstractControl): void {
		this.isMinimumClearanceToStartVisible = false;
		control.reset();
		control.clearValidators();
		control.updateValueAndValidity();
	}

	private showMinimumClearanceToStart(control: AbstractControl): void {
		this.isMinimumClearanceToStartVisible = true;
		control.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'MinimumClearanceToStart', IsLocalizeKey: true }]));
		control.updateValueAndValidity();
	}

	private patchSingleDDItemSector(): void {
		if (this.sectorList.length === Number(magicNumber.one)) {
			this.requestDetailsFrom.patchValue({
				SectorId: {
					Text: this.sectorList[magicNumber.zero].Text,
					Value: (this.sectorList[magicNumber.zero].Value).toString()
				}
			});
			this.onSectorChange(this.sectorList[magicNumber.zero]);
		}
	}

	private patchPreviousReqData(previousReqData: any): void {
		const previousSector = this.sectorList.find((sector: dropdownWithExtras) =>
			Number(sector.Value) == previousReqData.SectorId);
		if (previousSector) {
			this.requestDetailsFrom.patchValue({
				SectorId: {
					Text: previousSector.Text,
					Value: (previousSector.Value).toString()
				}
			});
			this.patchPreviousSector(previousReqData);
		} else {
			this.patchSingleDDItemSector();
		}
	}

	private patchPreviousSector(previousReqData: any): void {
		const sectorId = previousReqData.SectorId,
			afterSectorSelectCallback = () => {
				this.patchPreviousLocation(previousReqData);
				this.patchPreviousOrgLevel(previousReqData);
				if (this.isCostAccountingCodeVisible) {
					this.patchPreviousCostAccounting(previousReqData);
				}
				this.patchPreviousReqManager(previousReqData);
				this.patchPreviousLaborCategory(previousReqData);
				this.patchPreviousReasonForRequest(previousReqData);
				this.patchSecurityClearance(previousReqData);
			};
		this.sectorId = sectorId;
		this.onSelectionChange();
		this.getSectorDetailsAggrLocOrgCostCodeDropdown(sectorId, afterSectorSelectCallback);
	}

	private patchPreviousLocation(previousReqData: any): void {
		const locationId = previousReqData.WorkLocationId,
			previousLocation = this.locationList.find((location: DropdownItem) =>
				Number(location.Value) == previousReqData.WorkLocationId);
		if (previousLocation) {
			this.requestDetailsFrom.patchValue({
				WorkLocationId: {
					Text: previousLocation.Text,
					Value: (previousLocation.Value).toString()
				}
			});
			const afterLocationSelectCallback = () => {
				this.nonEditableField = this.sharedDataService.nonEditableField;
			};
			this.getLocationDetails(locationId, afterLocationSelectCallback);
			this.patchPreviousAssignment(previousReqData);
			this.locationId = locationId;
		} else {
			this.patchSingleDDItemLocation();
		}
	}
	private patchPreviousAssignment(previousReqData: any): void {
		const locationId = previousReqData.WorkLocationId,
			sectorId = previousReqData.SectorId,
			assignmentTypeId = previousReqData.AssignmentTypeId,
			afterAssignmentTypeSelectCallback = () => {
				const previousAssignmentType = this.assignmentTypeList.find((hdr: DropdownItem) =>
					Number(hdr.Value) == assignmentTypeId);
				if (previousAssignmentType) {
					this.positionDetailsFrom.patchValue({
						AssignmentTypeId: {
							Text: previousAssignmentType.Text,
							Value: (previousAssignmentType.Value).toString()
						}
					});
				} else {
					this.patchSingleDDItemAssignmentType();
				}
			};
		this.getAssignmentTypeList(sectorId, locationId, afterAssignmentTypeSelectCallback);
	}

	private patchPreviousReqManager(previousReqData: any): void {
		const sectorId = previousReqData.SectorId,
			reqManagerId = previousReqData.RequestingManagerId,
			afterReqManagerSelectCallback = () => {
				if (this.userDetails?.DataAccessRight == DataAccessRights.ReportingCLPView) {
					this.patchCLPViewRequestingManager();
				} else {
					this.setRequestingManagerById(reqManagerId);
				}
			};
		this.getRequestingManagerList(sectorId, afterReqManagerSelectCallback);
	}

	private patchCLPViewRequestingManager(): void {
		if (!this.requestingManagerList.length) return;

		const reqManagerId = this.userDetails?.UserId ?? magicNumber.zero,
			clpViewManager = this.findRequestingManagerById(reqManagerId);

		if (clpViewManager) {
			this.updateRequestingManagerDetails(clpViewManager);
			this.primaryManager = Number(clpViewManager.Value);
			this.onSelectionChange();
		} else {
			this.patchSingleDDItemRequestingManager();
		}
	}

	private setRequestingManagerById(reqManagerId: number): void {
		const previousReqManager = this.findRequestingManagerById(reqManagerId);

		if (previousReqManager) {
			this.updateRequestingManagerDetails(previousReqManager);
			this.primaryManager = reqManagerId;
			this.onSelectionChange();
		} else {
			this.patchSingleDDItemRequestingManager();
		}
	}

	private findRequestingManagerById(reqManagerId: number): DropdownItem | undefined {
		return this.requestingManagerList.find((manager: DropdownItem) =>
			Number(manager.Value) == reqManagerId);
	}

	private updateRequestingManagerDetails(manager: DropdownItem): void {
		this.requestDetailsFrom.patchValue({
			RequestingManagerId: {
				Text: manager.Text,
				Value: manager.Value.toString()
			}
		});
	}

	private patchPreviousOrgLevel(previousReqData: any): void {
		this.patchPreviousOrgLevel1(previousReqData);
		this.patchPreviousOrgLevel2(previousReqData);
		this.patchPreviousOrgLevel3(previousReqData);
		this.patchPreviousOrgLevel4(previousReqData);
	}

	private patchPreviousOrgLevel1(previousReqData: any): void {
		const orgLevel1Id = previousReqData.OrgLevel1Id,
			previousOrgLevel1 = this.orgLevel1List.find((orgLevel1: DropdownItem) =>
				Number(orgLevel1.Value) == orgLevel1Id);
		if (previousOrgLevel1) {
			this.requestDetailsFrom.patchValue({
				OrgLevel1Id: {
					Text: previousOrgLevel1.Text,
					Value: (previousOrgLevel1.Value).toString()
				}
			});
			this.onOrgLevel1Change(this.requestDetailsFrom.get('OrgLevel1Id')?.value);
		} else {
			this.patchSingleDDItemOrgLevel1();
		}
	}

	private patchPreviousOrgLevel2(previousReqData: any): void {
		const orgLevel2Id = previousReqData.OrgLevel2Id,
			previousOrgLevel2 = this.orgLevel2List.find((orgLevel2: DropdownItem) =>
				Number(orgLevel2.Value) == orgLevel2Id);
		if (previousOrgLevel2) {
			this.requestDetailsFrom.patchValue({
				OrgLevel2Id: {
					Text: previousOrgLevel2.Text,
					Value: (previousOrgLevel2.Value).toString()
				}
			});
			this.onOrgLevel2Change(this.requestDetailsFrom.get('orglevel2Id')?.value);
		} else {
			this.patchSingleDDItemOrgLevel2();
		}
	}

	private patchPreviousOrgLevel3(previousReqData: any): void {
		const orgLevel3Id = previousReqData.OrgLevel3Id,
			previousOrgLevel3 = this.orgLevel3List.find((orgLevel3: DropdownItem) =>
				Number(orgLevel3.Value) == orgLevel3Id);
		if (previousOrgLevel3) {
			this.requestDetailsFrom.patchValue({
				OrgLevel3Id: {
					Text: previousOrgLevel3.Text,
					Value: (previousOrgLevel3.Value).toString()
				}
			});
			this.onOrgLevel3Change(this.requestDetailsFrom.get('OrgLevel3Id')?.value);
		} else {
			this.patchSingleDDItemOrgLevel3();
		}
	}

	private patchPreviousOrgLevel4(previousReqData: any): void {
		const orgLevel4Id = previousReqData.OrgLevel4Id,
			previousOrgLevel4 = this.orgLevel4List.find((orgLevel4: DropdownItem) =>
				Number(orgLevel4.Value) == orgLevel4Id);
		if (previousOrgLevel4) {
			this.requestDetailsFrom.patchValue({
				OrgLevel4Id: {
					Text: previousOrgLevel4.Text,
					Value: (previousOrgLevel4.Value).toString()
				}
			});
			this.onOrgLevel4Change(this.requestDetailsFrom.get('OrgLevel4Id')?.value);
		} else {
			this.patchSingleDDItemOrgLevel4();
		}
	}

	private patchPreviousLaborCategory(previousReqData: any): void {
		const sectorId = previousReqData.SectorId,
			laborCategoryId = previousReqData.LaborCategoryId,

			afterLabouCategorySelectCallback = () => {
				const previousLaborCategory = this.laborCategoryList.find((laborCategory: DropdownItem) =>
					Number(laborCategory.Value) == laborCategoryId);
				if (previousLaborCategory) {
					this.positionDetailsFrom.patchValue({
						LaborCategoryId: {
							Text: previousLaborCategory.Text,
							Value: (previousLaborCategory.Value).toString()
						}
					});
					this.laborCategoryId = laborCategoryId;
					this.getLaborCategoryDetails(laborCategoryId);
					this.patchPreviousJobCategory(previousReqData);
				} else {
					this.patchSingleDDItemLaborCategory();
				}
			};
		this.getLaborCategoryList(sectorId, afterLabouCategorySelectCallback);
	}

	private patchPreviousJobCategory(previousReqData: any): void {
		const laborCategoryId = previousReqData.LaborCategoryId,
			jobCategoryId = previousReqData.JobCategoryId,
			afterJobCategorySelectCallback = () => {
				const previousJobCategory = this.jobCategoryList.find((jobCategory: DropdownItem) =>
					Number(jobCategory.Value) == jobCategoryId);
				if (previousJobCategory) {
					this.positionDetailsFrom.patchValue({
						JobCategoryId: {
							Text: previousJobCategory.Text,
							Value: (previousJobCategory.Value).toString()
						}
					});
					this.jobCategoryId = jobCategoryId;
					this.getJobCategoryDetails(jobCategoryId);
					this.getReqLibrarayDetails(jobCategoryId);
				} else {
					this.patchSingleDDItemJobCategory();
				}
			};
		this.getJobCategoryList(laborCategoryId, afterJobCategorySelectCallback);
	}

	private patchPreviousCostAccounting(previousReqData: any): void {
		const costAccountingId = previousReqData.CostAccountingId,
			sectorId = previousReqData.SectorId,
			startDate = this.startDate,
			afterCostAccountingCodeSelectCallback = () => {
				const previousCostAccounting = this.costAccountingCodeList.find((costAccounting: DropdownItem) =>
					Number(costAccounting.Value) == costAccountingId);
				if (previousCostAccounting) {
					this.requestDetailsFrom.patchValue({
						CostAccountingId: {
							Text: previousCostAccounting.Text,
							Value: (previousCostAccounting.Value).toString()
						}
					});
					this.getCostAccountingDetailsById(costAccountingId);
				}
			};
		this.getCostAccountingCodeList(sectorId, startDate, afterCostAccountingCodeSelectCallback);

	}

	private patchPreviousReasonForRequest(previousReqData: any) {
		const sectorId = previousReqData.SectorId,
			reasonForRequestId = previousReqData.ReasonForRequestId,
			afterReasonForRequestSelectCallback = () => {
				const previousReasonForRequest = this.reasonForRequestList.find((reasonForRequest: DropdownItem) =>
					Number(reasonForRequest.Value) == reasonForRequestId);
				if (previousReasonForRequest) {
					this.requestDetailsFrom.patchValue({
						ReasonForRequestId: {
							Text: previousReasonForRequest.Text,
							Value: (previousReasonForRequest.Value).toString()
						}
					});
					this.reasonForRequestId = reasonForRequestId;
				} else {
					this.patchSingleDDItemReasonForRequest();
				}
			};
		this.getReasonForRequestList(sectorId, afterReasonForRequestSelectCallback);
	}

	private patchSecurityClearance(previousReqData: any) {
		const securityClearanceId = previousReqData.SecurityClearanceId,
			afterSecurityClearanceCallback = () => {
				const previousSecurityClearance = this.securityClearanceList.find((securityClearance: DropdownItem) =>
					Number(securityClearance.Value) == securityClearanceId);
				if (previousSecurityClearance) {
					this.positionDetailsFrom.patchValue({
						SecurityClearanceId: {
							Text: previousSecurityClearance.Text,
							Value: (previousSecurityClearance.Value).toString()
						}
					});
					this.patchMinClrToStartBasedOnSSecurityClrConfig(previousReqData, previousSecurityClearance.Value);
				} else {
					this.patchSingleDDItemSecurityClearance();
				}
			};
		this.getSecurityClearanceList(afterSecurityClearanceCallback);
	}

	private patchMinClrToStartBasedOnSSecurityClrConfig(previousReqData: any, SecurityClrId: string) {
		const control = this.positionDetailsFrom.controls['MinimumClearanceToStartId'],
			requiresClearance = SecurityClrId && this.sectorDetails.IsSecurityClearance && Number(SecurityClrId) > Number(magicNumber.one);
		if (requiresClearance) {
			this.patchMinimumClearanceToStart(previousReqData);
			this.showMinimumClearanceToStart(control);
		} else {
			this.hideMinimumClearanceToStart(control);
		}
	}


	private patchMinimumClearanceToStart(previousReqData: any) {
		const sectorId = previousReqData.SectorId,
			minClrToStartId = previousReqData.MinimumClearanceToStartId,
			afterMinClrToStartSelectCallback = () => {
				const previousMinClrToStart = this.minimumClearanceToStartList.find((minClrToStart: DropdownItem) =>
					Number(minClrToStart.Value) == minClrToStartId);
				if (previousMinClrToStart) {
					this.positionDetailsFrom.patchValue({
						MinimumClearanceToStartId: {
							Text: previousMinClrToStart.Text,
							Value: (previousMinClrToStart.Value).toString()
						}
					});
				} else {
					this.patchSingleDDItemMinimumClearanceToStart();
				}

			};
		this.getMinimumClearanceToStartList(sectorId, afterMinClrToStartSelectCallback);
	}

	private patchProfRequestDetails(requestDetails: any): void {
		if (this.isClientWithMultipleSectors()) {
			this.getLoggedInUserDetails();
		}
		this.patchPreIdentifiedRequest(requestDetails);
		this.patchSector(requestDetails);
		this.patchOtherDetails(requestDetails);
	}

	private patchPreIdentifiedRequest(requestDetails: any) {
		this.requestDetailsFrom.controls['IsPreIdentifiedRequest'].setValue(requestDetails.IsPreIdentifiedRequest);
		if (requestDetails.IsPreIdentifiedRequest) {
			this.requestDetailsFrom.controls['SubmittalAllowedPerStaffing'].setValue(magicNumber.one);
			this.requestDetailsFrom.controls['SubmittalAllowedForThisRequest'].setValue(magicNumber.one);
			this.requestDetailsFrom.controls['IsAllowStaffingToContact'].setValue(false);
			this.isCandidateSectionVisible = true;
			this.isFieldReadonlyForPSR = true;
			this.addCandidateSectionValidators();
			this.patchCandidate(requestDetails);
		} else {
			this.requestDetailsFrom.controls['SubmittalAllowedPerStaffing'].patchValue(requestDetails.SubmittalAllowedPerStaffing);
			this.requestDetailsFrom.controls['SubmittalAllowedForThisRequest'].patchValue(requestDetails.SubmittalAllowedForThisRequest);
			this.requestDetailsFrom.controls['IsAllowStaffingToContact'].setValue(requestDetails.IsAllowStaffingToContact);
			this.isCandidateSectionVisible = false;
			this.isFieldReadonlyForPSR = false;
			this.removeCandidateSectionValidators();
		}
	}

	private patchSector(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			sector = this.sectorList.find((sec: dropdownWithExtras) =>
				Number(sec.Value) == sectorId);
		if (sector) {
			this.requestDetailsFrom.patchValue({
				SectorId: {
					Text: sector.Text,
					Value: (sector.Value).toString()
				}
			});
			const afterSectorSelectCallback = () => {
				this.otherFieldsConfigBySectorDetails(this.sectorDetails);
				this.requestDetailsFrom.controls['IsAllowStaffingToContact'].setValue(requestDetails.IsAllowStaffingToContact);
				this.setOrgLevelConfig(this.sectorDetails);
				this.patchLocation(requestDetails);
				this.patchOrgLevel(requestDetails);
				this.patchCostAccounting(requestDetails);
				this.patchReqManager(requestDetails);
				if (!requestDetails.WorkLocationId)
					this.patchLaborCategory(requestDetails);
				this.patchReasonForRequest(requestDetails);
				this.patchSecurityClearance(requestDetails);
				this.sectorId = sectorId;
				this.onSelectionChange();
			};
			this.getSectorDetails(sectorId, afterSectorSelectCallback);
		}
	}

	private getSectorDetails(sectorId: number, callback: () => void): void {
		this.sectorService.getSectorData(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<SectorDetails>) => {
				if (res.Succeeded && res.Data) {
					this.sectorDetails = res.Data;
					callback();
				} else {
					this.sectorDetails = DEFAULT_SECTOR_DETAILS;
				}
			});
	}

	private patchLocation(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			locationId = requestDetails.WorkLocationId,
			afterLocationSelectCallback = () => {
				const location = this.locationList.find((loc: DropdownItem) =>
					Number(loc.Value) == locationId);
				if (location) {
					this.requestDetailsFrom.patchValue({
						WorkLocationId: {
							Text: location.Text,
							Value: (location.Value).toString()
						}
					});
					this.patchLaborCategory(requestDetails);
					this.getLocationDetails(locationId);
					this.patchAssignment(requestDetails);
					this.locationId = locationId;
					if (this.statusId !== Number(StatusID.Draft))
						this.nonEditableField = true;
					this.onSelectionChange();
				}
			};
		this.getLocationListWithLocationId(sectorId, locationId, afterLocationSelectCallback);
	}

	patchAssignment(requestDetails: any) {
		this.patchPreviousAssignment(requestDetails);
	}

	private patchOrgLevel(requestDetails: any): void {
		this.patchOrgLevel1(requestDetails);
		this.patchOrgLevel2(requestDetails);
		this.patchOrgLevel3(requestDetails);
		this.patchOrgLevel4(requestDetails);
	}

	private patchOrgLevel1(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			orgLevel1Id = requestDetails.OrgLevel1Id,
			afterOrgLevel1SelectCallback = () => {
				const orgLevel1 = this.orgLevel1List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel1Id);
				if (orgLevel1) {
					this.requestDetailsFrom.patchValue({
						OrgLevel1Id: {
							Text: orgLevel1.Text,
							Value: (orgLevel1.Value).toString()
						}
					});
					this.orgLevel1Id = Number(orgLevel1.Value);
				}
			};
		this.getOrgLevel1ListWithOrgLevel1Id(sectorId, orgLevel1Id, afterOrgLevel1SelectCallback);
	}

	private patchOrgLevel2(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			orgLevel2Id = requestDetails.OrgLevel2Id,
			afterOrgLevel2SelectCallback = () => {
				const orgLevel2 = this.orgLevel2List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel2Id);
				if (orgLevel2) {
					this.requestDetailsFrom.patchValue({
						OrgLevel2Id: {
							Text: orgLevel2.Text,
							Value: (orgLevel2.Value).toString()
						}
					});
				}
			};
		if (sectorId && orgLevel2Id) {
			this.getOrgLevel2ListWithOrgLevel2Id(sectorId, orgLevel2Id, afterOrgLevel2SelectCallback);
		}
	}

	private patchOrgLevel3(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			orgLevel3Id = requestDetails.OrgLevel3Id,

			afterOrgLevel3SelectCallback = () => {
				const orgLevel3 = this.orgLevel3List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel3Id);
				if (orgLevel3) {
					this.requestDetailsFrom.patchValue({
						OrgLevel3Id: {
							Text: orgLevel3.Text,
							Value: (orgLevel3.Value).toString()
						}
					});
				}
			};
		if (sectorId && orgLevel3Id) {
			this.getOrgLevel3ListWithOrgLevel3Id(sectorId, orgLevel3Id, afterOrgLevel3SelectCallback);
		}
	}

	private patchOrgLevel4(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			orgLevel4Id = requestDetails.OrgLevel4Id,

			afterOrgLevel4SelectCallback = () => {
				const orgLevel4 = this.orgLevel4List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel4Id);
				if (orgLevel4) {
					this.requestDetailsFrom.patchValue({
						OrgLevel4Id: {
							Text: orgLevel4.Text,
							Value: (orgLevel4.Value).toString()
						}
					});
				}
			};
		if (sectorId && orgLevel4Id) {
			this.getOrgLevel4ListWithOrgLevel4Id(sectorId, orgLevel4Id, afterOrgLevel4SelectCallback);
		}
	}

	private patchCostAccounting(requestDetails: any): void {
		const reqIds: ICostAccountingFuncParams = {
			sectorId: requestDetails.SectorId,
			costAccountingId: requestDetails.CostAccountingId,
			startDate: requestDetails.TargetStartDate
				? requestDetails.TargetStartDate
				: this.startDate
		},
			afterCostAccountingSelectCallback = () => {
				const costAccounting = this.costAccountingCodeList.find((costAcc: DropdownItem) =>
					Number(costAcc.Value) == reqIds.costAccountingId);
				if (costAccounting) {
					this.requestDetailsFrom.patchValue({
						CostAccountingId: {
							Text: costAccounting.Text,
							Value: (costAccounting.Value).toString()
						}
					});
					this.getCostAccountingDetailsById(reqIds.costAccountingId);
				}
			};
		this.getCostAccountingListWithCostAccountingId(reqIds, afterCostAccountingSelectCallback);
	}

	private patchReqManager(requestDetails: any) {
		const sectorId = requestDetails.SectorId,
			reqManagerId = requestDetails.RequestingManagerId,
			afterReqManagerSelectCallback = () => {
				this.setRequestingManagerById(reqManagerId);
			};
		this.getRequestingManagerListWithRequestingManagerId(sectorId, reqManagerId, afterReqManagerSelectCallback);
	}

	private patchLaborCategory(requestDetails: any): void {
		const sectorId = requestDetails.SectorId,
			laborCategoryId = requestDetails.LaborCategoryId,

			afterLaborCategorySelectCallback = () => {
				const laborCategory = this.laborCategoryList.find((labCat: DropdownItem) =>
					Number(labCat.Value) == laborCategoryId);
				if (laborCategory) {
					this.positionDetailsFrom.patchValue({
						LaborCategoryId: {
							Text: laborCategory.Text,
							Value: (laborCategory.Value).toString()
						}
					});
					this.laborCategoryId = laborCategoryId;
					this.getLaborCategoryDetails(laborCategoryId);
					this.patchJobCategory(requestDetails);
				}
			};
		this.getLaborCategoryListWithLaborCategoryId(sectorId, laborCategoryId, afterLaborCategorySelectCallback);
	}

	private patchJobCategory(requestDetails: any): void {
		const laborCategoryId = requestDetails.LaborCategoryId,
			jobCategoryId = requestDetails.JobCategoryId,
			reqLibId = requestDetails.ReqLibraryId,

			afterJobCategorySelectCallback = () => {
				const jobCategory = this.jobCategoryList.find((jobCat: DropdownItem) =>
					Number(jobCat.Value) == jobCategoryId);
				if (jobCategory) {
					this.positionDetailsFrom.patchValue({
						JobCategoryId: {
							Text: jobCategory.Text,
							Value: (jobCategory.Value).toString()
						}
					});
					this.jobCategoryId = jobCategoryId;
					this.getJobCategoryDetails(jobCategoryId);
					this.getReqLibrarayDetailsWithReqLibId(jobCategoryId, reqLibId);
				}
			};
		this.getJobCategoryListWithJobCategoryId(laborCategoryId, jobCategoryId, afterJobCategorySelectCallback);
	}

	private patchReasonForRequest(requestDetails: any): void {
		this.patchPreviousReasonForRequest(requestDetails);
	}

	private patchOtherDetails(requestDetails: any): void {
		this.positionDetailsFrom.controls['PositionTitle'].patchValue(requestDetails.PositionTitle);
	}

	private getLocationListWithLocationId(sectorId: number, locationId: number, callback: () => void): void {
		const reqIds: { secId: number, locid: number } = {
			secId: sectorId,
			locid: locationId
		};
		this.lightIndustrialService.getLocationDropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DropdownItem[]>) => {
				if (res.Succeeded) {
					this.locationList = res.Data ?? [];
					callback();
				} else {
					this.locationList = [];
				}
			});
	}

	private getOrgLevel1ListWithOrgLevel1Id(sectorId: number, orgLevel1Id: number, callback: () => void): void {
		const reqIds: { secId: number, orgLevel1Id: number } = {
			secId: sectorId,
			orgLevel1Id: orgLevel1Id
		};
		this.lightIndustrialService.getOrgLevel1DropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DropdownItem[]>) => {
				if (res.Succeeded) {
					this.orgLevel1List = res.Data ?? [];
					callback();
				} else {
					this.orgLevel1List = [];
				}
			});
	}

	private getOrgLevel2ListWithOrgLevel2Id(sectorId: number, orgLevel2Id: number, callback: () => void): void {
		const reqIds: { secId: number, orgLevel2Id: number } = {
			secId: sectorId,
			orgLevel2Id: orgLevel2Id
		};
		this.lightIndustrialService.getOrgLevel2DropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DropdownItem[]>) => {
				if (res.Succeeded) {
					this.orgLevel2List = res.Data ?? [];
					callback();
				} else {
					this.orgLevel2List = [];
				}
			});
	}

	private getOrgLevel3ListWithOrgLevel3Id(sectorId: number, orgLevel3Id: number, callback: () => void): void {
		const reqIds: { secId: number, orgLevel3Id: number } = {
			secId: sectorId,
			orgLevel3Id: orgLevel3Id
		};
		this.lightIndustrialService.getOrgLevel3DropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DropdownItem[]>) => {
				if (res.Succeeded) {
					this.orgLevel3List = res.Data ?? [];
					callback();
				} else {
					this.orgLevel3List = [];
				}
			});
	}

	private getOrgLevel4ListWithOrgLevel4Id(sectorId: number, orgLevel4Id: number, callback: () => void): void {
		const reqIds: { secId: number, orgLevel4Id: number } = {
			secId: sectorId,
			orgLevel4Id: orgLevel4Id
		};
		this.lightIndustrialService.getOrgLevel4DropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DropdownItem[]>) => {
				if (res.Succeeded) {
					this.orgLevel4List = res.Data ?? [];
					callback();
				} else {
					this.orgLevel4List = [];
				}
			});
	}


	private getCostAccountingListWithCostAccountingId(reqId: ICostAccountingFuncParams, callback: () => void): void {
		const reqIds: ICostAccountingListWithIdPayload = {
			secId: reqId.sectorId,
			defaultCostCenterId: reqId.costAccountingId,
			startDate: this.localizationService.TransformDate(reqId.startDate, 'MM-dd-YYYY')
		};
		this.lightIndustrialService.getCostAccountingCodeDropdown(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<DropdownItem[]>) => {
				if (res.Succeeded) {
					this.costAccountingCodeList = res.Data ?? [];
				} else {
					this.costAccountingCodeList = [];
				}
				callback();
			});
	}

	private getRequestingManagerListWithRequestingManagerId(sectorId: number, reqManagerId: number, callback: () => void): void {
		const payload: UserPermissions = {
			"roleGroupIds": [],
			"roleGroupDtos": [{ "roleGroupId": magicNumber.four, "roleNos": [] }],
			"xrmEntityActionIds": [EntityActionID.Create, EntityActionID.Edit],
			"sectorIds": [sectorId],
			"locationIds": [],
			"orgLevel1Ids": []
		};
		this.lightIndustrialService.getRequestingManagerDropdownEdit(reqManagerId, payload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.requestingManagerList = data.Data ?? [];
					callback();
				} else {
					this.requestingManagerList = [];
				}
			}
		});
	}

	private getLaborCategoryListWithLaborCategoryId(sectorId: number, laborCategoryId: number, callback: () => void): void {
		const reqIds: ILabourCategoryListWithIdPayload = {
			secId: sectorId,
			laborCatTypeId: AssignmentTypesEnum.Prof,
			laborCatId: laborCategoryId
		};
		this.lightIndustrialService.getLaborCategoryDropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.laborCategoryList = data.Data ?? [];
					callback();
				} else {
					this.laborCategoryList = [];
				}
			}
		});
	}

	private getJobCategoryListWithJobCategoryId(laborCategoryId: number, jobCategoryId: number, callback: () => void): void {
		const reqIds: IJobCategoryListWithIdPayload = {
			locId: parseInt(this.requestDetailsFrom.get('WorkLocationId')?.value?.Value),
			laborCatId: laborCategoryId,
			jobCatId: jobCategoryId
		};
		this.lightIndustrialService.getJobCategoryDropdown(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.jobCategoryList = data.Data ?? [];
					callback();
				} else {
					this.jobCategoryList = [];
				}
			}
		});
	}

	private getReqLibrarayDetailsWithReqLibId(jobCategoryId: number, reqLibId: number): void {
		const reqPayload: IReqLibraryDetailsWithIdPayload = {
			secId: parseInt(this.requestDetailsFrom.get('SectorId')?.value.Value),
			locId: parseInt(this.requestDetailsFrom.get('WorkLocationId')?.value.Value),
			laborCatId: parseInt(this.positionDetailsFrom.get('LaborCategoryId')?.value.Value),
			jobCatId: jobCategoryId,
			reqLibId: reqLibId
		};
		this.lightIndustrialService.getReqLibraryDetailsEdit(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<IReqLibraryDetails>) => {
				if (data.Succeeded && data.Data) {
					this.reqLibraryDetails = data.Data;
					this.reqLibraryId = this.reqLibraryDetails.Id;
					this.positionDetailsFrom.controls['ReqLibraryId'].setValue(this.reqLibraryId);
					this.cdr.markForCheck();
					this.onSelectionChange();
					this.shareFieldDetails();
				} else {
					this.reqLibraryDetails = null;
				}
			}
		});
	}

	public onPreIdentifiedRequestChange(event: boolean) {
		if (event) {
			this.requestDetailsFrom.controls['SubmittalAllowedPerStaffing'].setValue(magicNumber.one);
			this.requestDetailsFrom.controls['SubmittalAllowedForThisRequest'].setValue(magicNumber.one);
			this.requestDetailsFrom.controls['IsAllowStaffingToContact'].setValue(false);
			this.isFieldReadonlyForPSR = true;
			this.addCandidateSectionValidators();
		} else {
			this.isFieldReadonlyForPSR = false;
			this.removeCandidateSectionValidators();
		}
		this.isCandidateSectionVisible = event;
	}

	private addCandidateSectionValidators(): void {
		this.candidateDetailsFrom.get('FirstName')?.setValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'FirstName', IsLocalizeKey: true }]));
		this.candidateDetailsFrom.get('LastName')?.setValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'LastName', IsLocalizeKey: true }]));
		this.candidateDetailsFrom.get('Email')?.setValidators(this.customValidators.EmailValidator());
		this.candidateDetailsFrom.get('PhoneNumber')?.setValidators([this.customValidators.RequiredValidator('PleaseEnterContactNumber'), this.customValidators.FormatValidator('PleaseEnterValidContactNumber')]);
		this.candidateDetailsFrom.get('PhoneExt')?.setValidators([this.customValidators.FormatValidator('PleaseEnterValidContactNumberExtension')]);
		this.updateFormValidity(['FirstName', 'LastName', 'Email', 'PhoneNumber', 'PhoneExt']);
	}

	private removeCandidateSectionValidators(): void {
		this.candidateDetailsFrom.reset();
		this.candidateDetailsFrom.get('FirstName')?.clearValidators();
		this.candidateDetailsFrom.get('LastName')?.clearValidators();
		this.candidateDetailsFrom.get('Email')?.clearValidators();
		this.candidateDetailsFrom.get('PhoneNumber')?.clearValidators();
		this.candidateDetailsFrom.get('PhoneExt')?.clearValidators();
		this.updateFormValidity(['FirstName', 'LastName', 'Email', 'PhoneNumber', 'PhoneExt']);
	}

	private updateFormValidity(controls: string[]): void {
		controls.forEach(controlName => {
			this.candidateDetailsFrom.get(controlName)?.updateValueAndValidity();
		});
	}

	private patchPreviousCandidate(previousFormData: any) {
		if (previousFormData.IsPreIdentifiedRequest) {
			this.isFieldReadonlyForPSR = true;
			this.addCandidateSectionValidators();
		} else {
			this.removeCandidateSectionValidators();
		}
		this.isCandidateSectionVisible = previousFormData.IsPreIdentifiedRequest;
	}

	private patchCandidate(requestDetails: any) {
		this.candidateDetailsFrom.patchValue({
			'FirstName': requestDetails.FirstName,
			'MiddleName': requestDetails.MiddleName,
			'LastName': requestDetails.LastName,
			'Email': requestDetails.Email,
			'PhoneNumber': requestDetails.PhoneNumber,
			'PhoneExt': requestDetails.PhoneExt
		})
	}

	private onSelectionChange() {
		const ids = {
			sectorId: this.sectorId,
			locationId: this.locationId,
			laborCategoryId: this.laborCategoryId,
			jobCategoryId: this.jobCategoryId,
			reqLibraryId: this.reqLibraryId,
			orgLevel1Id: this.orgLevel1Id,
			orgLevel2Id: this.orgLevel2Id,
			orgLevel3Id: this.orgLevel3Id,
			orgLevel4Id: this.orgLevel4Id,
			primaryManager: this.primaryManager,
			reasonForRequestId: this.reasonForRequestId
		};
		this.sharedDataService.updateIds(ids);
	}

	private shareFieldDetails(): void {
		const fieldDetails = {
			sectorDetails: this.sectorDetails,
			locationDetails: this.locationDetails,
			laborCategoryDetails: this.laborCategoryDetails,
			jobCategoryDetails: this.JobCategoryDetails,
			reqLibraryDetails: this.reqLibraryDetails
		};
		this.sharedDataService.updateFieldDetailsData(fieldDetails);
	}

	ngOnDestroy() {
		this.sharedDataService.jobDetailsFormPersist = true;
		this.sharedDataService.nonEditableField = this.nonEditableField;
	}

}
