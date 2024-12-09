import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { LightIndustrialService } from '../../services/light-industrial.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ContractorDetailsComponent } from './contractor-details/contractor-details.component';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ContractorDetailsService } from '../../services/contractor-details.service';
import { DataAccessRights } from '@xrm-shared/enums/data-Access-Rights';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { EntityActionID } from '../../constant/entity-action';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { ReasonForRequestService } from '@xrm-master/reason-for-request/services/reason-for-request.service';
import { RequisitionLibraryGatewayService } from 'src/app/services/masters/requisition-library-gateway.service';
import { LocationService } from '@xrm-master/location/services/location.service';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { UsersService } from '@xrm-master/user/service/users.service';
import { NavigationPaths } from '../../constant/routes-constant';
import { LightIndustrialPopupService } from '../../services/light-industrial-popup.service';
import { AssignmentTypesEnum, PricingModels, TenureLimitTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import {
	BenefitAddUpdateDto, IUdfData, ILiRequestAddPayload, ILiRequestUpdatePayload, OrgTypeData, IPreviousRequestItem,
	TimeRange, SectorDetails, LocationDetails, SectorOrgLevelConfigDto, RequestDetails, ICostAccountingCodeDetails,
	ShiftDetails, RequestPositionDetailGetAllDto, IReqLibraryDetailsPayload, IReqLibraryDetails, ISectorDetailsAggrLocOrgDropdown,
	IUserDetails, IShiftListPayload, IReqLibraryDetailsWithIdPayload, IJobCategoryListPayload, ILabourCategoryListPayload,
	IPreviousLiRequestPayload, IPreviousRequestItemResponse, ICostAccountingListWithIdPayload, IShiftListWithIdPayload,
	ILabourCategoryListWithIdPayload, IJobCategoryListWithIdPayload, IApprovalConfigWidgetPayload, IRequestAdditionalDetail,
	ILiRequestSucessResponse, IStaffingAgencyGetPayload, IRequestPositionDetail, IApprovalConfigWidget, IDialogButton,
	ICostAccountingFuncParams, ILiRequestPayload, ILaborCategoryDetails
} from '../../interface/li-request.interface';
import { LightIndustrialUtilsService } from '../../services/light-industrial-utils.service';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { SharedVariablesService } from '../../services/shared-variables.service';
import { SharedMethodsService } from '../../services/shared-methods.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { AccordionService } from '../../services/accordion.service';
import { SectionNames } from '../../constant/accordion.interface';
import { SECTION_NAMES } from '../../constant/accordion-constant';
import { IPreparedUdfPayloadData, IUdfConfig } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ILoadMoreColumnOptions } from '@xrm-shared/models/load-more.interface';
import { DEFAULT_SECTOR_DETAILS, DEFAULT_SHIFT_DETAILS } from '../../constant/li-request.constant';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { dropdownWithExtras } from '@xrm-core/models/dropdown.model';
import { UserPermissions } from '@xrm-master/user/interface/user';
import { IPermissionInfo } from '@xrm-shared/models/common.model';
import { UserRole } from '@xrm-master/user/enum/enums';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { StatusID } from '../../constant/request-status';
import { approvalStage } from '@xrm-shared/widgets/approval-widget-v2/enum';
import { WeekDayPicker } from '@xrm-shared/models/list-view.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, OnDestroy {
	public SECTION_NAMES = SECTION_NAMES;
	@ViewChild('dms', { static: false }) dmsImplementation: DmsImplementationComponent;
	@ViewChild('contractor', { static: false }) contractor: ContractorDetailsComponent;
	@ViewChild('jobDetailsSection', { static: true }) jobDetailsSection: ElementRef;
	@ViewChild('approverDetailsSection', { static: true }) approverDetailsSection: ElementRef;
	@ViewChild('otherDetailsSection', { static: true }) otherDetailsSection: ElementRef;
	@ViewChild('commentDetailsSection', { static: true }) commentDetailsSection: ElementRef;
	@ViewChild('documentUploadsSection', { static: true }) documentUploadsSection: ElementRef;

	public liRequestForm: FormGroup;

	public entityId: number = XrmEntities.LightIndustrialRequest;
	public sectorId: number = magicNumber.zero;
	private laborCategoryId: number = magicNumber.zero;
	public recordId: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.Add;
	public udfData: IPreparedUdfPayloadData[] = [];

	public uploadStageId: number = DocumentUploadStage.Request_Creation;

	public sectorList: dropdownWithExtras[] = [];
	public locationList: DropdownItem[] = [];
	public requestingManagerList: DropdownItem[] = [];
	public laborCategoryList: DropdownItem[] = [];
	public orgLevel1List: DropdownItem[] = [];
	public orgLevel2List: DropdownItem[] = [];
	public orgLevel3List: DropdownItem[] = [];
	public orgLevel4List: DropdownItem[] = [];
	public shiftList: DropdownItem[] = [];
	public hdrList: DropdownItem[] = [];
	public costAccountingCodeList: DropdownItem[] = [];
	public reasonForRequestList: DropdownItem[] = [];
	public timeApproverList: DropdownItem[] = [];
	public jobCategoryList: DropdownItem[] = [];
	private previousRequestList: IPreviousRequestItem[] = [];
	private entityActionList: IPermissionInfo[] = [];
	public benefitAdderList: IBenefitData[] = [];

	private sectorDetails: SectorDetails = DEFAULT_SECTOR_DETAILS;
	public locationDetails: LocationDetails | null;
	public shiftDetails: ShiftDetails | null;
	private costAccountingCodeDetails: ICostAccountingCodeDetails[] = [];
	public costAccountingCodeHelpText: string = '';
	public liRequestDetails: RequestDetails;
	private laborCategoryDetails: ILaborCategoryDetails | null;

	public locationId: number = magicNumber.zero;
	public orgLevel1Id: number = magicNumber.zero;
	private orgLevel2Id: number = magicNumber.zero;
	private orgLevel3Id: number = magicNumber.zero;
	private orgLevel4Id: number = magicNumber.zero;
	private jobCategoryId: number = magicNumber.zero;
	private reasonForRequestId: number = magicNumber.zero;
	private primaryManager: number = magicNumber.zero;
	public contractorFilled: number = magicNumber.zero;

	public isMultipleTimeApprover: boolean = false;
	public approverLength: boolean = false;
	public nonEditableField: boolean = false;
	public isEditMode: boolean = false;
	public isBroadcastActionAllowed: boolean = false;
	public widgetChangeDetected: boolean = false;
	public udfControlConfig = new BehaviorSubject([]);
	public dmsControlConfig = new BehaviorSubject([]);
	public tenurePolicyApplicable: boolean = false;
	public requsitionTenure: number;
	public tenureLimitType: number | null = null;
	public wageRate: number;
	public startDate: Date | string | null;
	public startDateNoLaterThan: Date | string | null;
	public hasApproverData: boolean = true;
	public hasUDFLength: boolean = false;
	public hasDMSLength: boolean = false;
	public totalContractors: number = magicNumber.zero;
	public totalEstimatedCost: number = magicNumber.zero;
	public weekDaysArray: boolean[];
	private contractorData: IRequestPositionDetail[];
	public userType: number;
	public targetEndDate: Date;
	public currencyFormat: string;
	public clpReportingCheck: boolean = false;
	public parentData: RequestPositionDetailGetAllDto[] = [];
	public lastTbdSequenceNo: number = magicNumber.zero;
	public contractorFormData: FormGroup;
	public daysInfo: IDayInfo[] = [];
	public userDetails: IUserDetails | null = null;
	private reqLibraryDetails: IReqLibraryDetails | null;
	public approvalConfigWidgetObj: IApprovalConfigWidget;
	public approverWidgetForm: IApprovalConfigWidgetPayload;
	public reqLibraryId: number;
	public requestId: number;
	public statusId: number;

	public showJobDetailsSection: boolean = true;
	public showApproverDetailsSection: boolean = false;
	public showOtherDetailsSection: boolean = false;
	public showCommentDetailsSection: boolean = false;
	public showDocumentUploadsSection: boolean = false;

	public isNeedToReloadLatestApprovers: boolean = false;
	public statusBarChange: boolean = true;
	private approverRequired: boolean = false;
	private isApproverReloadCheck: boolean = false;
	private isApproverEstimatedCostMatchedCheck: boolean = false;

	public orgType1Data: OrgTypeData = this.sharedVariablesService.orgType1Data;
	public orgType2Data: OrgTypeData = this.sharedVariablesService.orgType2Data;
	public orgType3Data: OrgTypeData = this.sharedVariablesService.orgType3Data;
	public orgType4Data: OrgTypeData = this.sharedVariablesService.orgType4Data;

	public timeRange: TimeRange = this.sharedVariablesService.timeRange;

	public loadMoreDataSource: IPreviousRequestItem[] = [];
	public pageSize: number = magicNumber.ten;
	public startIndex: number = magicNumber.zero;
	private smartSearchText: string = '';
	public loadMoreTotal: number = magicNumber.zero;
	public isSearchLoadMore: boolean = false;
	public loadMoreColumnOptions: ILoadMoreColumnOptions[] = this.sharedVariablesService.loadMoreColumnOptions;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	private isSuccessToast: boolean = false;
	private timeoutIds: ReturnType<typeof setTimeout>[] = [];

	chevronUp: string;
	chevronDown: string;
	// eslint-disable-next-line max-params
	constructor(
		private formBilder: FormBuilder,
		private route: Router,
		private activatedRoute: ActivatedRoute,
		private userService: UsersService,
		private sectorService: SectorService,
		private locationService: LocationService,
		private laborCategoryService: LaborCategoryService,
		private shiftService: ShiftGatewayService,
		private reqLibraryService: RequisitionLibraryGatewayService,
		private reasonForRequestService: ReasonForRequestService,
		private costService: CostAccountingCodeService,
		public lightIndustrialService: LightIndustrialService,
		private customValidators: CustomValidators,
		private toasterService: ToasterService,
		public udfCommonMethods: UdfCommonMethods,
		public localizationService: LocalizationService,
		private contractorService: ContractorDetailsService,
		private eventlog: EventLogService,
		private loaderService: LoaderService,
		private scrollToTop: WindowScrollTopService,
		private commonService: CommonService,
		private lightIndustrialPopupService: LightIndustrialPopupService,
		private lightIndustrialUtilsService: LightIndustrialUtilsService,
		private sharedVariablesService: SharedVariablesService,
		private sharedMethodsService: SharedMethodsService,
		private dialogPopupService: DialogPopupService,
		private accordionService: AccordionService,
		private cdr: ChangeDetectorRef
	) {
		this.initializeLiRequestForm();
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param['uKey']) {
				this.isEditMode = true;
				this.recordUKey = param["uKey"];
				this.getLiRequestDetails(this.recordUKey);
			}
		});
		this.getUserType();
		this.getLoggedInUserDetails();
		this.getCurrencyFormat();
	}

	ngOnInit(): void {
		this.checkBroadcastPermission();
		const zero = Number(magicNumber.zero);
		if (!this.isEditMode) {
			const timeoutId = setTimeout(() => {
				const currentDate = new Date();
				currentDate.setHours(zero, zero, zero, zero);
				this.liRequestForm.controls['startDate'].setValue(currentDate);
				this.onChangeStartDate(this.liRequestForm.get('startDate')?.value);
			}, magicNumber.hundred);
			this.timeoutIds.push(timeoutId);
		}
	}

	private initializeLiRequestForm() {
		this.liRequestForm = this.formBilder.group({
			sectorName: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			locationName: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Location', IsLocalizeKey: true }])]],
			primaryManager: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'RequestingPrimaryManagerName', IsLocalizeKey: true }])]],
			orglevel1: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'OrgLevel1', IsLocalizeKey: true }])]],
			orglevel2: [null],
			orglevel3: [null],
			orglevel4: [null],
			laborCategory: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'LaborCategory', IsLocalizeKey: true }])]],
			jobCategory: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'JobCategory', IsLocalizeKey: true }])]],
			shiftName: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Shift', IsLocalizeKey: true }])]],
			hourDistribution: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'HourDistribution', IsLocalizeKey: true }])]],
			costAccountingName: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'CostAccountingCode', IsLocalizeKey: true }])]],
			reasonforRequest: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'ReasonForRequest', IsLocalizeKey: true }])]],
			startDate: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'StartDate', IsLocalizeKey: true }])]],
			startDateNoLaterThan: [null],
			PrimaryTimeApprover: [null],
			AlternateTimeApprover: [null],
			DrugScreen: [false],
			BackgroundChecks: [false],
			NoofContractors: [null],
			BenefitAdder: [[]],
			EstimatedCost: [null],
			ManualBroadcast: [false],
			positionDesc: [null],
			ManagerCommentstoStaffingAgency: [null],
			ManagerComments: [null],
			startTimeControlName: [null, [this.customValidators.RequiredValidator('PleaseEnterStartTime')]],
			endTimeControlName: [null, [this.customValidators.RequiredValidator('PleaseEnterEndTime')]]
		});
	}

	private getUserType() {
		this.userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
	}

	private getLoggedInUserDetails() {
		this.userService.getLoggedinUser().pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe(async (data: GenericResponseBase<IUserDetails>) => {
				this.userDetails = data.Data ?? null;
				if (!this.isEditMode) {
					await this.getSectorList();
					this.getPreviousReq();
				}
			});
	}

	private getCurrencyFormat(): void {
		const countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyFormat = this.localizationService.GetCulture(CultureFormat.CurrencyCode, countryId);
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

	public onSectorChange(val: { Value: string } | null): void {
		if (!val) {
			this.resetOtherFieldsListOnSectorDeSelect();
			return;
		}
		const newSectorId = parseInt(val.Value);
		if (newSectorId !== this.sectorId) {
			this.resetOtherFieldsListOnSectorDeSelect();
			this.sectorId = newSectorId;
			this.getOtherFieldsListOnSectorSelect(newSectorId);
		}
	}

	private getOtherFieldsListOnSectorSelect(sectorId: number): void {
		this.getSectorDetailsAggrLocOrgCostCodeDropdown(sectorId);
		this.getRequestingManagerList(sectorId);
		this.getLaborCategoryList(sectorId);
		this.getShiftList(sectorId, null);
		this.getCostAccountingCodeList(sectorId, this.startDate);
		this.getReasonForRequestList(sectorId);
		this.getApproverList(sectorId);
		this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, sectorId);
		this.getApprovalWidgetData();
	}

	private resetOtherFieldsListOnSectorDeSelect(): void {
		this.sectorId = magicNumber.zero;
		this.sectorDetails = DEFAULT_SECTOR_DETAILS;
		this.resetLocationData(true);
		this.resetRequestingPrimaryManagerData(true);
		this.resetOrgLevelData();
		this.resetLabourCategoryData(true);
		this.resetJobCategoryData();
		this.resetShiftData();
		this.resetHdrDistributionData();
		this.resetCostAccountingCodeList();
		this.resetReasonForRequestData(true);
		this.resetTimeApproverData(true);
		this.resetTimeApproverDetails(true);
		this.hasUDFLength = false;
		this.hasDMSLength = false;
		this.reqLibraryId = magicNumber.zero;
		this.requsitionTenure = magicNumber.zero;
		this.tenureLimitType = null;
		this.resetContractorData();
		this.liRequestForm.controls['ManagerCommentstoStaffingAgency'].reset();
		this.hasApproverData = true;
		this.wageRate = magicNumber.zero;
		this.toasterService.resetToaster();
	}

	private resetLocationData(isListReset: boolean): void {
		if (isListReset) {
			this.locationList = [];
		}
		this.locationId = magicNumber.zero;
		this.locationDetails = null;
		this.liRequestForm.controls['locationName'].reset();
	}

	private resetRequestingPrimaryManagerData(isListReset: boolean): void {
		if (isListReset) {
			this.requestingManagerList = [];
		}
		if (this.userDetails?.DataAccessRight != DataAccessRights.ReportingCLPView) {
			if (this.requestingManagerList.length != Number(magicNumber.one)) {
				this.primaryManager = magicNumber.zero;
				this.liRequestForm.controls['primaryManager'].reset();
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
		this.liRequestForm.controls['orglevel1'].reset();
		this.liRequestForm.controls['orglevel2'].reset();
		this.liRequestForm.controls['orglevel2'].clearValidators();
		this.liRequestForm.controls['orglevel3'].reset();
		this.liRequestForm.controls['orglevel3'].clearValidators();
		this.liRequestForm.controls['orglevel4'].reset();
		this.liRequestForm.controls['orglevel4'].clearValidators();
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
		this.liRequestForm.controls['laborCategory'].reset();
	}

	private resetJobCategoryData(): void {
		this.jobCategoryList = [];
		this.liRequestForm.controls['jobCategory'].reset();
		this.liRequestForm.controls['positionDesc'].reset();
	}

	private resetShiftData(): void {
		this.shiftList = [];
		this.liRequestForm.controls['shiftName'].reset();
		this.resetShiftDetails();
	}

	private resetShiftDetails(): void {
		this.shiftDetails = DEFAULT_SHIFT_DETAILS;
		this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
		this.liRequestForm.controls['startTimeControlName'].reset();
		this.liRequestForm.controls['endTimeControlName'].reset();
	}

	private resetHdrDistributionData(): void {
		this.hdrList = [];
		this.liRequestForm.controls['hourDistribution'].reset();
	}

	private resetCostAccountingCodeList(): void {
		this.costAccountingCodeList = [];
		this.liRequestForm.controls['costAccountingName'].reset();
		this.costAccountingCodeDetails = [];
		this.costAccountingCodeHelpText = '';
	}

	private resetReasonForRequestData(isListReset: boolean): void {
		if (isListReset) {
			this.reasonForRequestList = [];
		}
		this.reasonForRequestId = magicNumber.zero;
		this.liRequestForm.controls['reasonforRequest'].reset();
	}

	private resetTimeApproverData(isListReset: boolean): void {
		if (isListReset) {
			this.timeApproverList = [];
		}
		this.liRequestForm.controls['PrimaryTimeApprover'].reset();
		this.liRequestForm.controls['AlternateTimeApprover'].reset();
	}

	private resetTimeApproverDetails(resetFromSectorChange: boolean): void {
		if (resetFromSectorChange) {
			this.isMultipleTimeApprover = false;
		} else {
			const { CostAccountingCodeHaveSpecificApprovers } = this.sectorDetails;
			this.getTimeApproverDetails(CostAccountingCodeHaveSpecificApprovers);
		}
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
					this.sectorDetails = data.ddlsectordetail.Data ?? DEFAULT_SECTOR_DETAILS;
					this.otherFieldsConfigBySectorDetails(this.sectorDetails);
					const { CostAccountingCodeHaveSpecificApprovers } = this.sectorDetails;
					this.getTimeApproverDetails(CostAccountingCodeHaveSpecificApprovers);
					this.setOrgLevelConfig(this.sectorDetails);
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
			this.liRequestForm.patchValue({
				locationName: {
					Text: this.locationList[magicNumber.zero].Text,
					Value: this.locationList[magicNumber.zero].Value
				}
			});
			this.onLocationChange(this.locationList[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel1(): void {
		if (this.orgLevel1List.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				orglevel1: {
					Text: this.orgLevel1List[magicNumber.zero].Text,
					Value: this.orgLevel1List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel1Change(this.orgLevel1List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel2(): void {
		if (this.orgLevel2List.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				orglevel2: {
					Text: this.orgLevel2List[magicNumber.zero].Text,
					Value: this.orgLevel2List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel2Change(this.orgLevel2List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel3(): void {
		if (this.orgLevel3List.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				orglevel3: {
					Text: this.orgLevel3List[magicNumber.zero].Text,
					Value: this.orgLevel3List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel3Change(this.orgLevel3List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemOrgLevel4(): void {
		if (this.orgLevel4List.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				orglevel4: {
					Text: this.orgLevel4List[magicNumber.zero].Text,
					Value: this.orgLevel4List[magicNumber.zero].Value
				}
			});
			this.onOrgLevel4Change(this.orgLevel4List[magicNumber.zero]);
		}
	}

	private patchSingleDDItemCostAccountingCode(): void {
		if (this.costAccountingCodeList.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				costAccountingName: {
					Text: this.costAccountingCodeList[magicNumber.zero]?.Text,
					Value: this.costAccountingCodeList[magicNumber.zero]?.Value
				}
			});
			this.onCostAccountingCodeChange(this.costAccountingCodeList[magicNumber.zero]);
		}
	}

	private patchSingleDDItemReasonForRequest(): void {
		if (this.reasonForRequestList.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				reasonforRequest: {
					Text: this.reasonForRequestList[magicNumber.zero].Text,
					Value: this.reasonForRequestList[magicNumber.zero].Value
				}
			});
			this.onReasonForRequestChange(this.reasonForRequestList[magicNumber.zero]);
		}
	}

	public onLocationChange(val: { Value: string } | null): void {
		if (!val) {
			this.resetLocationDataAndRelatedFields();
			this.resetLocationData(false);
			this.getShiftList(this.liRequestForm.value.sectorName.Value, null);
			return;
		}
		const sectorId = this.liRequestForm.value?.sectorName?.Value,
			newLocationId = parseInt(val.Value);
		if (newLocationId !== this.locationId) {
			this.resetLocationDataAndRelatedFields();
			this.locationId = newLocationId;
			this.updateLocationDetailsHDRAndShiftList(sectorId, newLocationId);
		}
	}

	private resetLocationDataAndRelatedFields(): void {
		this.resetHdrDistributionData();
		this.resetLabourCategoryData(false);
		this.resetJobCategoryData();
		this.resetShiftData();
		this.reqLibraryId = magicNumber.zero;
		this.repatchSectorOnboardingData();
		this.resetRequestingPrimaryManagerData(false);
		if (!this.isEditMode)
			this.resetReasonForRequestData(false);
		this.resetTimeApproverDetails(false);
		this.nonEditableField = false;
		this.wageRate = magicNumber.zero;
		this.resetContractorData();
	}

	private updateLocationDetailsHDRAndShiftList(sectorId: number, locationId: number): void {
		this.getLocationDetails(locationId);
		this.getHdrList(locationId);
		this.getShiftList(sectorId, locationId);
		this.udfCommonMethods.manageParentsInfo(XrmEntities.Location, this.locationId);
		this.getApprovalWidgetData();
		this.reqLibraryId = magicNumber.zero;
	}

	private repatchSectorOnboardingData(): void {
		if (!this.isEditMode) {
			this.liRequestForm.patchValue({
				DrugScreen: this.sectorDetails.DefaultDrugResultValue,
				BackgroundChecks: this.sectorDetails.DefaultBackGroundCheckValue
			});
		}
	}

	private getShiftList(sectorId: number, locationId: number | null, optionalCallback?: () => void): void {
		const reqPayload: IShiftListPayload = {
			"sectorId": sectorId,
			"locationId": locationId
		};
		this.shiftService.getshiftDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.shiftList = data.Data ?? [];
				} else {
					this.shiftList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemShift();
				}
			}
		});
	}

	private patchSingleDDItemShift(): void {
		if (this.shiftList.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				shiftName: {
					Text: this.shiftList[magicNumber.zero].Text,
					Value: this.shiftList[magicNumber.zero].Value
				}
			});
			this.getShiftDetails(Number(this.shiftList[magicNumber.zero].Value));
		}
	}

	private getHdrList(locationId: number, optionalCallback?: () => void): void {
		this.locationService.getHdrData(locationId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.hdrList = data.Data ?? [];
				} else {
					this.hdrList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemHdr();
				}

			}
		});
	}
	private getCostAccountingCodeList(sectorId: number, startDate: Date | string | null, optionalCallback?: () => void): void {
		const reqPayload: ICostAccountingListWithIdPayload = {
			secId: sectorId,
			startDate: this.localizationService.TransformDate(startDate, 'MM-dd-YYYY')
		};
		this.lightIndustrialService.getCostAccountingCodeDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.costAccountingCodeList = data.Data ?? [];
				} else {
					this.costAccountingCodeList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemCostAccountingCode();
				}
			}
		});
	}

	private patchSingleDDItemHdr(): void {
		if (this.hdrList.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				hourDistribution: {
					Text: this.hdrList[magicNumber.zero].Text,
					Value: this.hdrList[magicNumber.zero].Value
				}
			});
		}
	}

	private getReasonForRequestList(sectorId: number, optionalCallback?: () => void): void {
		this.reasonForRequestService.getReasonForRequestDropdownLi(sectorId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
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

	private otherFieldsConfigBySectorDetails(sectorDetails: SectorDetails): void {
		//  the tenureLimitType property- If sectorDetails.TenureLimitType is falsy as null, it defaults set to 37 which define days.
		this.tenureLimitType = sectorDetails.TenureLimitType ?? TenureLimitTypes['Length of Assignment'];
		this.tenurePolicyApplicable = sectorDetails.TenurePolicyApplicable;
		this.requsitionTenure = this.tenurePolicyApplicable
			? sectorDetails.RequisitionTenureLimit
			: magicNumber.zero;
		if (!this.isEditMode) {
			this.liRequestForm.patchValue({
				DrugScreen: sectorDetails.DefaultDrugResultValue,
				BackgroundChecks: sectorDetails.DefaultBackGroundCheckValue
			});
		}
	}

	private getTimeApproverDetails(costAccountingCodeHaveSpecificApprovers: boolean): void {
		if (costAccountingCodeHaveSpecificApprovers) {
			this.isMultipleTimeApprover = true;
			this.resetTimeApproverData(false);
			this.liRequestForm.get('PrimaryTimeApprover')?.clearValidators();
			this.liRequestForm.controls['PrimaryTimeApprover'].updateValueAndValidity();
		} else {
			this.isMultipleTimeApprover = false;
			this.liRequestForm.controls['PrimaryTimeApprover'].addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PrimaryApprover', IsLocalizeKey: true }]));
			this.liRequestForm.controls['PrimaryTimeApprover'].updateValueAndValidity();
		}
	}

	private setOrgLevelConfig(sectorDetails: SectorDetails) {
		const orgTypes = [magicNumber.one, magicNumber.two, magicNumber.three, magicNumber.four];
		orgTypes.forEach((orgType) => {
			const org = sectorDetails.SectorOrgLevelConfigDtos.find((orgData: SectorOrgLevelConfigDto) =>
				orgData.OrgType === Number(orgType)) ?? null;
			this.assignOrgTypeData(orgType, org);
		});
		if (sectorDetails.SectorOrgLevelConfigDtos.length) {
			sectorDetails.SectorOrgLevelConfigDtos.forEach((orgData: SectorOrgLevelConfigDto) => {
				if (orgData.OrgType === Number(magicNumber.one) && orgData.IsMandatory) {
					this.liRequestForm.get('orglevel1')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType1Data.OrgName, IsLocalizeKey: true }]));
					this.liRequestForm.get('orglevel1')?.updateValueAndValidity();
				}
				else if (orgData.OrgType === Number(magicNumber.two) && orgData.IsMandatory) {
					this.liRequestForm.get('orglevel2')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType2Data.OrgName, IsLocalizeKey: true }]));
					this.liRequestForm.get('orglevel2')?.updateValueAndValidity();
				}
				else if (orgData.OrgType === Number(magicNumber.three) && orgData.IsMandatory) {
					this.liRequestForm.get('orglevel3')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType3Data.OrgName, IsLocalizeKey: true }]));
					this.liRequestForm.get('orglevel3')?.updateValueAndValidity();
				}
				else if (orgData.OrgType === Number(magicNumber.four) && orgData.IsMandatory) {
					this.liRequestForm.get('orglevel4')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: this.orgType4Data.OrgName, IsLocalizeKey: true }]));
					this.liRequestForm.get('orglevel4')?.updateValueAndValidity();
				}
			});
		}
	}

	private assignOrgTypeData(orgType: number, org: SectorOrgLevelConfigDto | null): void {
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

	private getLocationDetails(locationId: number, optionalCallback?: () => void): void {
		this.locationService.getLocationData(locationId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<LocationDetails>) => {
				if (data.Succeeded && data.Data) {
					this.locationDetails = data.Data;
					if (!this.isEditMode && this.locationDetails.IsAltDrugandbackgConfigurations) {
						this.liRequestForm.controls['DrugScreen'].setValue(this.locationDetails.DefaultDrugResultValue);
						this.liRequestForm.controls['BackgroundChecks'].setValue(this.locationDetails.DefaultBackGroundCheckValue);
					}
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

	private getCostAccountingDetailsById(costAccountingCodeId: number): void {
		this.costService.getCostAccountingDetails(costAccountingCodeId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<ICostAccountingCodeDetails[]>) => {
				if (data.Succeeded && data.Data) {
					this.costAccountingCodeDetails = data.Data;
					this.costAccountingCodeHelpText = this.costAccountingCodeDetails[magicNumber.zero].Description;
				} else {
					this.costAccountingCodeDetails = [];
					this.costAccountingCodeHelpText = '';
				}
				this.cdr.markForCheck();
			}
		});
	}

	private getReqLibrarayDetails(jobCategoryId: number, isPositionDescPatch: boolean): void {
		const reqPayload: IReqLibraryDetailsPayload = {
			secId: parseInt(this.liRequestForm.get('sectorName')?.value.Value),
			locId: parseInt(this.liRequestForm.get('locationName')?.value.Value),
			laborCatId: parseInt(this.liRequestForm.get('laborCategory')?.value.Value),
			jobCatId: jobCategoryId
		};
		this.reqLibraryService.getReqLibraryDetails(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<IReqLibraryDetails>) => {
				if (data.Succeeded && data.Data) {
					this.reqLibraryDetails = data.Data;
					this.reqLibraryId = this.reqLibraryDetails.Id;
					this.cdr.markForCheck();
					this.wageRate = this.reqLibraryDetails.WageRate;
					this.udfCommonMethods.manageParentsInfo(XrmEntities.RequisitionLibrary, this.reqLibraryId);
					if (isPositionDescPatch) {
						this.liRequestForm.patchValue({
							'positionDesc': this.reqLibraryDetails.PositionDesc
						});
					}
				} else {
					this.reqLibraryDetails = null;
				}
			}
		});
	}

	private getReqLibrarayDetailsWithReqLibId(jobCategoryId: number, reqLibId: number, isPositionDescPatch: boolean): void {
		const reqPayload: IReqLibraryDetailsWithIdPayload = {
			secId: parseInt(this.liRequestForm.get('sectorName')?.value.Value),
			locId: parseInt(this.liRequestForm.get('locationName')?.value.Value),
			laborCatId: parseInt(this.liRequestForm.get('laborCategory')?.value.Value),
			jobCatId: jobCategoryId,
			reqLibId: reqLibId
		};
		this.lightIndustrialService.getReqLibraryDetailsEdit(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<IReqLibraryDetails>) => {
				if (data.Succeeded && data.Data) {
					this.reqLibraryDetails = data.Data;
					this.reqLibraryId = this.reqLibraryDetails.Id;
					this.cdr.markForCheck();
					this.checkWageRateChange(this.reqLibraryDetails.WageRate);
					this.udfCommonMethods.manageParentsInfo(XrmEntities.RequisitionLibrary, this.reqLibraryId);
					if (isPositionDescPatch) {
						this.liRequestForm.patchValue({
							'positionDesc': this.reqLibraryDetails.PositionDesc
						});
					}
				} else {
					this.reqLibraryDetails = null;
				}
			}
		});
	}

	private checkWageRateChange(reqLibWageRate: number): void {
		const parentDataItem: RequestPositionDetailGetAllDto | undefined = this.parentData.find((item: RequestPositionDetailGetAllDto) =>
			item.Ukey === "");
		if (parentDataItem && parentDataItem.BaseWageRate !== reqLibWageRate) {
			this.wageRate = parentDataItem.BaseWageRate;
			this.sharedMethodsService.getRevisionFieldsUpdate();
			this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((button: IDialogButton) => {
				this.wageRateChangeConfirmationPopUp(button, reqLibWageRate);
			});
		} else {
			this.wageRate = reqLibWageRate;
		}
	}

	private wageRateChangeConfirmationPopUp(button: IDialogButton, reqLibWageRate: number) {
		if (button.value == Number(magicNumber.sixteen)) {
			this.wageRate = reqLibWageRate;
			this.dialogPopupService.resetDialogButton();
			this.widgetChangeDetected = true;
			return;
		} else if (button.value == Number(magicNumber.seventeen)) {
			this.dialogPopupService.resetDialogButton();
		}
	}

	private getShiftDetails(shiftId: number): void {
		this.shiftService.getshiftDetailsData(shiftId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<ShiftDetails>) => {
				if (data.Succeeded && data.Data) {
					const shiftDetailsResponse = data.Data;
					if (this.shiftDetails?.ShiftId) {
						const { ShiftDifferentialMethod, AdderOrMultiplierValue } = shiftDetailsResponse;
						this.checkShiftDifferentialChange(ShiftDifferentialMethod, AdderOrMultiplierValue);
					} else {
						this.shiftDetails = data.Data;
						const date = new Date(),
							startTime = new Date(`${date.toDateString()} ${this.shiftDetails.StartTime}`),
							endTime = new Date(`${date.toDateString()} ${this.shiftDetails.EndTime}`);
						this.liRequestForm.controls['startTimeControlName'].patchValue(startTime);
						this.liRequestForm.controls['endTimeControlName'].patchValue(endTime);
						this.daysInfo = this.lightIndustrialService.generateDaysInfo(this.shiftDetails);
					}
					this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
				} else {
					this.resetShiftDetails();
				}
				this.cdr.markForCheck();
			}
		});
	}

	private checkShiftDifferentialChange(ShiftDifferentialMethod: string, NewAdderOrMultiplierValue: number) {
		const parentDataItem: RequestPositionDetailGetAllDto | undefined = this.parentData.find((item: RequestPositionDetailGetAllDto) =>
			item.Ukey === "");
		if (parentDataItem && parentDataItem.ShiftMultiplier !== NewAdderOrMultiplierValue) {
			if (this.shiftDetails?.ShiftId) {
				const AdderOrMultiplierValue = parentDataItem.ShiftMultiplier;
				this.shiftDetails = { ...this.shiftDetails, ShiftDifferentialMethod, AdderOrMultiplierValue };
			}
			this.sharedMethodsService.getRevisionFieldsUpdate();
			this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((button: IDialogButton) => {
				this.shiftDifferentialChangeConfirmationPopUp(button, ShiftDifferentialMethod, NewAdderOrMultiplierValue);
			});
		} else if (this.shiftDetails?.ShiftId) {
			const AdderOrMultiplierValue = NewAdderOrMultiplierValue;
			this.shiftDetails = { ...this.shiftDetails, ShiftDifferentialMethod, AdderOrMultiplierValue };
		}

	}

	private shiftDifferentialChangeConfirmationPopUp(button: IDialogButton, ShiftDifferentialMethod: string, AdderOrMultiplierValue: number) {
		if (button.value == Number(magicNumber.sixteen)) {
			if (this.shiftDetails?.ShiftId) {
				this.shiftDetails = { ...this.shiftDetails, ShiftDifferentialMethod, AdderOrMultiplierValue };
			}
			this.dialogPopupService.resetDialogButton();
			this.widgetChangeDetected = true;
			return;
		} else if (button.value == Number(magicNumber.seventeen)) {
			this.dialogPopupService.resetDialogButton();
		}
	}

	public onLaborCategoryChange(val: { Value: string } | null): void {
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

	private resetLaborCategoryDataAndJobCategory(): void {
		this.resetJobCategoryData();
		this.reqLibraryId = magicNumber.zero;
		this.wageRate = magicNumber.zero;
		this.resetContractorData();
	}

	private updateLaborCategoryDetails(laborCategoryId: number): void {
		this.laborCategoryId = laborCategoryId;
		if (this.locationId) {
			this.getLaborCategoryDetails(laborCategoryId);
			this.getJobCategoryList(laborCategoryId);
		}
		this.udfCommonMethods.manageParentsInfo(XrmEntities.LaborCategory, laborCategoryId);
		this.getApprovalWidgetData();
	}

	private getLaborCategoryDetails(laborCategoryId: number): void {
		this.laborCategoryService.getLabourCategoryDetails(laborCategoryId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (res: GenericResponseBase<ILaborCategoryDetails>) => {
				if (res.Succeeded && res.Data) {
					this.laborCategoryDetails = res.Data;
				} else {
					this.laborCategoryDetails = null;
				}
			}
		});
	}

	private getJobCategoryList(laborCategoryId: number, optionalCallback?: () => void): void {
		const reqPayload: IJobCategoryListPayload = {
			"locId": parseInt(this.liRequestForm.get('locationName')?.value?.Value),
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
			this.liRequestForm.patchValue({
				jobCategory: {
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
			this.getApprovalWidgetData();
			this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel1, this.orgLevel1Id);
		}
	}

	public onOrgLevel2Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel2Id = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel2, this.orgLevel2Id);
		}
	}

	public onOrgLevel3Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel3Id = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel3, this.orgLevel3Id);
		}
	}

	public onOrgLevel4Change(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.orgLevel4Id = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel4, this.orgLevel4Id);
		}
	}

	public onJobCategoryChange(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.jobCategoryId = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.JobCategory, this.jobCategoryId);
			const isPositionDescPatch = true;
			this.getReqLibrarayDetails(this.jobCategoryId, isPositionDescPatch);
		} else {
			this.liRequestForm.controls['positionDesc'].reset();
		}
		this.wageRate = magicNumber.zero;
		this.resetContractorData();
		this.reqLibraryId = magicNumber.zero;
	}

	public onShiftChange(val: { Value: string } | null): void {
		this.resetShiftDetails();
		if (!val) {
			this.resetContractorData();
			return;
		}
		const shiftId = parseInt(val.Value);
		this.getShiftDetails(shiftId);
	}

	public onReasonForRequestChange(val: { Text: string, Value: string } | undefined): void {
		if (val) {
			this.reasonForRequestId = parseInt(val.Value);
			this.getApprovalWidgetData();
			this.callApproverConfiguration('reason');
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
			this.getRequestingManagerDetails(this.primaryManager);
			this.callApproverConfiguration('manager');
		} else {
			this.primaryManager = magicNumber.zero;
			this.getApprovalWidgetData();
		}
	}

	private getRequestingManagerDetails(requestingManagerId: number): void {
		this.getApprovalWidgetData();

		if (!this.isMultipleTimeApprover) {
			const selectedPrimaryManager = this.timeApproverList.find((approver: DropdownItem) =>
				Number(approver.Value) == requestingManagerId);
			if (selectedPrimaryManager) {
				this.liRequestForm.patchValue({
					PrimaryTimeApprover: {
						Text: selectedPrimaryManager.Text,
						Value: (selectedPrimaryManager.Value).toString()
					}
				});
			}
		}
	}

	private getRequestingManagerList(sectorId: number, optionalCallback?: () => void): void {
		const payload: UserPermissions = {
			"roleGroupIds": [],
			"roleGroupDtos": [{ "roleGroupId": UserRole.Client, "roleNos": [] }],
			"xrmEntityActionIds": [EntityActionID.Create, EntityActionID.Edit],
			"sectorIds": [sectorId],
			"locationIds": [],
			"orgLevel1Ids": []
		};
		this.userService.getUsersWithFilter(payload).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.requestingManagerList = data.Data ?? [];
					if (this.requestingManagerList.length === Number(magicNumber.one)) {
						this.patchSingleDDItemRequestingManager();
					}
					if (this.userDetails?.DataAccessRight == DataAccessRights.ReportingCLPView) {
						this.patchRepostingCLPViewRequestingManager();
					}
				} else {
					this.requestingManagerList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				}
			});
	}

	private patchSingleDDItemRequestingManager(): void {
		this.liRequestForm.patchValue({
			primaryManager: {
				Text: this.requestingManagerList[magicNumber.zero].Text,
				Value: (this.requestingManagerList[magicNumber.zero].Value).toString()
			}
		});
	}

	private patchRepostingCLPViewRequestingManager(): void {
		if (this.requestingManagerList.length) {
			const reqManagerId = this.userDetails?.UserId,
				reqManager = this.requestingManagerList.find((reqMngr: DropdownItem) =>
					Number(reqMngr.Value) == reqManagerId);
			if (reqManager) {
				this.liRequestForm.patchValue({
					primaryManager: {
						Text: reqManager.Text,
						Value: (reqManager.Value).toString()
					}
				});
			}
		}
	}

	private getLaborCategoryList(sectorId: number, optionalCallback?: () => void): void {
		const reqPayload: ILabourCategoryListPayload = {
			"secId": sectorId,
			"laborCatTypeId": AssignmentTypesEnum.LI
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
			this.liRequestForm.patchValue({
				laborCategory: {
					Text: this.laborCategoryList[magicNumber.zero].Text,
					Value: this.laborCategoryList[magicNumber.zero].Value
				}
			});
			this.onLaborCategoryChange(this.laborCategoryList[magicNumber.zero]);
		}
	}

	private getUserIdBasedOnRole() {
		return this.userType === Number(UserRole.Client)
			? this.userDetails?.UserId
			: null;
	}

	private previousLiRequestPayload(): IPreviousLiRequestPayload {
		return {
			pageSize: magicNumber.ten,
			startIndex: magicNumber.zero,
			smartSearchText: '',
			xrmEntityId: this.entityId
		};
	}

	public getPreviousReq(): void {
		const userId = this.getUserIdBasedOnRole(),
			payload: IPreviousLiRequestPayload = this.previousLiRequestPayload();
		this.lightIndustrialService.getPreviousLIRequest(userId, payload).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IPreviousRequestItemResponse>) => {
				this.previousRequestList = res.Data?.Data ?? [];
				if (this.previousRequestList.length) {
					this.patchPreviousReqData(this.previousRequestList[magicNumber.zero]);
				} else if (!this.previousRequestList.length &&
					this.userType == Number(UserRole.Client) &&
					this.userDetails &&
					this.userDetails.DataAccessRight != DataAccessRights.GlobalView) {
					this.patchClientPrimaryData(this.userDetails);
				} else {
					this.patchSingleDDItemSector();
				}
			});
	}

	private patchSingleDDItemSector(): void {
		if (this.sectorList.length === Number(magicNumber.one)) {
			this.liRequestForm.patchValue({
				sectorName: {
					Text: this.sectorList[magicNumber.zero].Text,
					Value: (this.sectorList[magicNumber.zero].Value).toString()
				}
			});
			this.onSectorChange(this.sectorList[magicNumber.zero]);
		}
	}

	private patchPreviousReqData(previousReqData: IPreviousRequestItem): void {
		const previousSector = this.sectorList.find((sector: dropdownWithExtras) =>
			Number(sector.Value) == previousReqData.SectorId);
		if (previousSector) {
			this.liRequestForm.patchValue({
				sectorName: {
					Text: previousReqData.SectorName,
					Value: previousReqData.SectorId.toString()
				}
			});
			this.patchPreviousSector(previousReqData);
			this.patchPreviousOtherData(previousReqData.PositionDescription);
		} else {
			this.patchSingleDDItemSector();
		}
	}

	private patchPreviousSector(previousReqData: IPreviousRequestItem): void {
		const sectorId = previousReqData.SectorId,
			afterSectorSelectCallback = () => {
				this.patchPreviousLocation(previousReqData);
				this.patchPreviousOrgLevel(previousReqData);
				this.patchPreviousCostAccounting(previousReqData);
				this.patchPreviousReqManager(previousReqData);
				this.patchPreviousLaborCategory(previousReqData);
				this.patchPreviousReasonForRequest(previousReqData);
				this.patchPreviousTimeApprover(previousReqData);
				this.sectorId = sectorId;
				this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, sectorId);
				this.getApprovalWidgetData();
			};
		this.getSectorDetailsAggrLocOrgCostCodeDropdown(sectorId, afterSectorSelectCallback);
	}

	private patchPreviousLocation(previousReqData: IPreviousRequestItem): void {
		const locationId = previousReqData.WorkLocationId,
			previousLocation = this.locationList.find((location: DropdownItem) =>
				Number(location.Value) == previousReqData.WorkLocationId);
		if (previousLocation) {
			this.liRequestForm.patchValue({
				locationName: {
					Text: previousLocation.Text,
					Value: (previousLocation.Value).toString()
				}
			});
			const afterLocationSelectCallback = () => {
				this.patchPreviousTimeApprover(previousReqData);
			};
			this.getLocationDetails(locationId, afterLocationSelectCallback);
			this.patchPreviousHdr(previousReqData);
			this.patchPreviousShift(previousReqData);
			this.locationId = locationId;
			this.udfCommonMethods.manageParentsInfo(XrmEntities.Location, locationId);
			this.getApprovalWidgetData();
		} else {
			this.patchSingleDDItemLocation();
		}
	}

	private patchPreviousReqManager(previousReqData: IPreviousRequestItem): void {
		const sectorId = previousReqData.SectorId,
			reqManagerId = previousReqData.RequestingManagerId,
			afterReqManagerSelectCallback = () => {
				this.afterReqManagerSelectSetValue(reqManagerId);
			};
		this.getRequestingManagerList(sectorId, afterReqManagerSelectCallback);
	}

	private afterReqManagerSelectSetValue(reqManagerId: number): void {
		const previousReqManager = this.requestingManagerList.find((reqManager: DropdownItem) =>
			Number(reqManager.Value) == reqManagerId);
		if (previousReqManager) {
			this.liRequestForm.patchValue({
				primaryManager: {
					Text: previousReqManager.Text,
					Value: (previousReqManager.Value).toString()
				}
			});
			this.primaryManager = reqManagerId;
			this.getApprovalWidgetData();
		}
	}

	private patchPreviousOrgLevel(previousReqData: IPreviousRequestItem): void {
		this.patchPreviousOrgLevel1(previousReqData);
		this.patchPreviousOrgLevel2(previousReqData);
		this.patchPreviousOrgLevel3(previousReqData);
		this.patchPreviousOrgLevel4(previousReqData);
	}

	private patchPreviousOrgLevel1(previousReqData: IPreviousRequestItem): void {
		const orgLevel1Id = previousReqData.OrgLevel1Id,
			previousOrgLevel1 = this.orgLevel1List.find((orgLevel1: DropdownItem) =>
				Number(orgLevel1.Value) == orgLevel1Id);
		if (previousOrgLevel1) {
			this.liRequestForm.patchValue({
				orglevel1: {
					Text: previousOrgLevel1.Text,
					Value: (previousOrgLevel1.Value).toString()
				}
			});
			this.onOrgLevel1Change(this.liRequestForm.get('orglevel1')?.value);
		} else {
			this.patchSingleDDItemOrgLevel1();
		}
	}

	private patchPreviousOrgLevel2(previousReqData: IPreviousRequestItem): void {
		const orgLevel2Id = previousReqData.OrgLevel2Id,
			previousOrgLevel2 = this.orgLevel2List.find((orgLevel2: DropdownItem) =>
				Number(orgLevel2.Value) == orgLevel2Id);
		if (previousOrgLevel2) {
			this.liRequestForm.patchValue({
				orglevel2: {
					Text: previousOrgLevel2.Text,
					Value: (previousOrgLevel2.Value).toString()
				}
			});
			this.onOrgLevel2Change(this.liRequestForm.get('orglevel2')?.value);
		} else {
			this.patchSingleDDItemOrgLevel2();
		}
	}

	private patchPreviousOrgLevel3(previousReqData: IPreviousRequestItem): void {
		const orgLevel3Id = previousReqData.OrgLevel3Id,
			previousOrgLevel3 = this.orgLevel3List.find((orgLevel3: DropdownItem) =>
				Number(orgLevel3.Value) == orgLevel3Id);
		if (previousOrgLevel3) {
			this.liRequestForm.patchValue({
				orglevel3: {
					Text: previousOrgLevel3.Text,
					Value: (previousOrgLevel3.Value).toString()
				}
			});
			this.onOrgLevel3Change(this.liRequestForm.get('orglevel3')?.value);
		} else {
			this.patchSingleDDItemOrgLevel3();
		}
	}

	private patchPreviousOrgLevel4(previousReqData: IPreviousRequestItem): void {
		const orgLevel4Id = previousReqData.OrgLevel4Id,
			previousOrgLevel4 = this.orgLevel4List.find((orgLevel4: DropdownItem) =>
				Number(orgLevel4.Value) == orgLevel4Id);
		if (previousOrgLevel4) {
			this.liRequestForm.patchValue({
				orglevel4: {
					Text: previousOrgLevel4.Text,
					Value: (previousOrgLevel4.Value).toString()
				}
			});
			this.onOrgLevel4Change(this.liRequestForm.get('orglevel4')?.value);
		} else {
			this.patchSingleDDItemOrgLevel4();
		}
	}

	private patchPreviousLaborCategory(previousReqData: IPreviousRequestItem): void {
		const sectorId = previousReqData.SectorId,
			laborCategoryId = previousReqData.LaborCategoryId,
			afterLabouCategorySelectCallback = () => {
				const previousLaborCategory = this.laborCategoryList.find((laborCategory: DropdownItem) =>
					Number(laborCategory.Value) == laborCategoryId);
				if (previousLaborCategory) {
					this.liRequestForm.patchValue({
						laborCategory: {
							Text: previousLaborCategory.Text,
							Value: (previousLaborCategory.Value).toString()
						}
					});
					this.laborCategoryId = laborCategoryId;
					this.udfCommonMethods.manageParentsInfo(XrmEntities.LaborCategory, laborCategoryId);
					this.getApprovalWidgetData();
					this.getLaborCategoryDetails(laborCategoryId);
					this.patchPreviousJobCategory(previousReqData);
				} else {
					this.patchSingleDDItemLaborCategory();
				}
			};
		this.getLaborCategoryList(sectorId, afterLabouCategorySelectCallback);
	}

	private patchPreviousJobCategory(previousReqData: IPreviousRequestItem): void {
		const laborCategoryId = previousReqData.LaborCategoryId,
			jobCategoryId = previousReqData.JobCategoryId,
			isPositionDescPatch = false,
			afterJobCategorySelectCallback = () => {
				const previousJobCategory = this.jobCategoryList.find((jobCategory: DropdownItem) =>
					Number(jobCategory.Value) == jobCategoryId);
				if (previousJobCategory) {
					this.liRequestForm.patchValue({
						jobCategory: {
							Text: previousJobCategory.Text,
							Value: (previousJobCategory.Value).toString()
						}
					});
					this.jobCategoryId = jobCategoryId;
					this.udfCommonMethods.manageParentsInfo(XrmEntities.JobCategory, jobCategoryId);
					this.getReqLibrarayDetails(jobCategoryId, isPositionDescPatch);
				} else {
					this.patchSingleDDItemJobCategory();
				}
			};
		this.getJobCategoryList(laborCategoryId, afterJobCategorySelectCallback);
	}

	private patchPreviousShift(previousReqData: IPreviousRequestItem): void {
		const sectorId = previousReqData.SectorId,
			locationId = previousReqData.WorkLocationId,
			shiftId = previousReqData.RequestShiftDetailGetAllDto.ShiftId,
			afterShiftSelectCallback = () => {
				const previousShift = this.shiftList.find((shift: DropdownItem) =>
					Number(shift.Value) == shiftId);
				if (previousShift) {
					this.liRequestForm.patchValue({
						shiftName: {
							Text: previousShift.Text,
							Value: (previousShift.Value).toString()
						}
					});
					this.getShiftDetails(shiftId);
				} else {
					this.patchSingleDDItemShift();
				}
			};
		this.getShiftList(sectorId, locationId, afterShiftSelectCallback);
	}

	private patchPreviousHdr(previousReqData: IPreviousRequestItem): void {
		const locationId = previousReqData.WorkLocationId,
			hdrId = previousReqData.HourDistributionRuleId,
			afterHdrSelectCallback = () => {
				const previousHdr = this.hdrList.find((hdr: DropdownItem) =>
					Number(hdr.Value) == hdrId);
				if (previousHdr) {
					this.liRequestForm.patchValue({
						hourDistribution: {
							Text: previousHdr.Text,
							Value: (previousHdr.Value).toString()
						}
					});
				} else {
					this.patchSingleDDItemHdr();
				}
			};
		this.getHdrList(locationId, afterHdrSelectCallback);
	}

	private patchPreviousCostAccounting(previousReqData: IPreviousRequestItem): void {
		const costAccountingId = previousReqData.DefaultCostCenterId,
			sectorId = previousReqData.SectorId,
			startDate = this.startDate,
			afterCostAccountingCodeSelectCallback = () => {
				const previousCostAccounting = this.costAccountingCodeList.find((costAccounting: DropdownItem) =>
					Number(costAccounting.Value) == costAccountingId);
				if (previousCostAccounting) {
					this.liRequestForm.patchValue({
						costAccountingName: {
							Text: previousCostAccounting.Text,
							Value: (previousCostAccounting.Value).toString()
						}
					});
					this.getCostAccountingDetailsById(costAccountingId);
				} else {
					this.patchSingleDDItemCostAccountingCode();
				}
			};
		this.getCostAccountingCodeList(sectorId, startDate, afterCostAccountingCodeSelectCallback);

	}

	private patchPreviousReasonForRequest(previousReqData: RequestDetails | IPreviousRequestItem) {
		const sectorId = previousReqData.SectorId,
			reasonForRequestId = previousReqData.ReasonForRequestId,
			afterReasonForRequestSelectCallback = () => {
				const previousReasonForRequest = this.reasonForRequestList.find((reasonForRequest: DropdownItem) =>
					Number(reasonForRequest.Value) == reasonForRequestId);
				if (previousReasonForRequest) {
					this.liRequestForm.patchValue({
						reasonforRequest: {
							Text: previousReasonForRequest.Text,
							Value: (previousReasonForRequest.Value).toString()
						}
					});
					this.reasonForRequestId = reasonForRequestId;
					this.getApprovalWidgetData();
				} else {
					this.patchSingleDDItemReasonForRequest();
				}
			};
		this.getReasonForRequestList(sectorId, afterReasonForRequestSelectCallback);
	}

	private patchPreviousTimeApprover(previousReqData: IPreviousRequestItem | RequestDetails): void {
		const sectorId = previousReqData.SectorId,
			afterTimeApproverSelectCallback = () => {
				if (!this.isMultipleTimeApprover) {
					this.patchPreviousPrimaryTimeApprover(previousReqData.PrimaryTimeApproverId);
					this.patchAlternateTimeApprover(previousReqData.AlternateTimeApproverId);
				}
			};
		this.getApproverList(sectorId, afterTimeApproverSelectCallback);
	}

	private patchPreviousPrimaryTimeApprover(primaryTimeApproverId: number | null): void {
		const previousPrimaryTimeApprover = this.timeApproverList.find((approver: DropdownItem) =>
			Number(approver.Value) == primaryTimeApproverId);
		if (previousPrimaryTimeApprover) {
			this.liRequestForm.patchValue({
				PrimaryTimeApprover: {
					Text: previousPrimaryTimeApprover.Text,
					Value: (previousPrimaryTimeApprover.Value).toString()
				}
			});
		}
	}

	private patchAlternateTimeApprover(alternateTimeApproverId: number | null): void {
		const previousAlternateTimeApprover = this.timeApproverList.find((approver: DropdownItem) =>
			Number(approver.Value) == alternateTimeApproverId);
		if (previousAlternateTimeApprover) {
			this.liRequestForm.patchValue({
				AlternateTimeApprover: {
					Text: previousAlternateTimeApprover.Text,
					Value: (previousAlternateTimeApprover.Value).toString()
				}
			});
		}
	}

	private patchPreviousOtherData(positionDescription: string): void {
		if (positionDescription != '') {
			this.liRequestForm.patchValue({
				positionDesc: positionDescription
			});
		}
	}

	private patchClientPrimaryData(userDetails: IUserDetails): void {
		if (this.userType == Number(UserRole.Client) && this.userDetails && this.sectorList.length) {
			const primarySector = this.sectorList.find((sector: dropdownWithExtras) =>
				Number(sector.Value) == userDetails.PrimarySectorId);
			if (primarySector) {
				this.liRequestForm.patchValue({
					sectorName: {
						Text: primarySector.Text,
						Value: (primarySector.Value).toString()
					}
				});
				this.patchClientPrimarySector(userDetails);
			}
		}
	}

	private patchClientPrimarySector(userDetails: IUserDetails): void {
		const sectorId = userDetails.PrimarySectorId,
			afterSectorSelectCallback = () => {
				this.patchClientPrimaryLocation(userDetails);
				this.patchClientPrimaryOrgLevel(userDetails);
				this.patchClientPrimaryCostAccounting(userDetails);
				this.patchClientPrimaryReqManager(userDetails);
				this.patchClientPrimaryLaborCategory(userDetails);
				this.patchClientPrimaryReasonForRequest(userDetails);
				this.sectorId = sectorId;
				this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, sectorId);
				this.getApprovalWidgetData();
			};
		this.getSectorDetailsAggrLocOrgCostCodeDropdown(sectorId, afterSectorSelectCallback);
	}

	private patchClientPrimaryLocation(userDetails: IUserDetails): void {
		const locationId = userDetails.PrimaryLocationId,
			primaryLocation = this.locationList.find((location: DropdownItem) =>
				Number(location.Value) == locationId);
		if (primaryLocation) {
			this.liRequestForm.patchValue({
				locationName: {
					Text: primaryLocation.Text,
					Value: (primaryLocation.Value).toString()
				}
			});
			const afterLocationSelectCallback = () => {
			};
			this.getLocationDetails(locationId, afterLocationSelectCallback);
			this.patchClientPrimaryHdr(userDetails);
			this.patchClientPrimaryShift(userDetails);
			this.locationId = locationId;
			this.udfCommonMethods.manageParentsInfo(XrmEntities.Location, locationId);
			this.getApprovalWidgetData();
		}
	}

	private patchClientPrimaryOrgLevel(userDetails: IUserDetails): void {
		this.patchClientPrimaryOrgLevel1(userDetails);
		this.patchClientPrimaryOrgLevel2(userDetails);
		this.patchClientPrimaryOrgLevel3(userDetails);
		this.patchClientPrimaryOrgLevel4(userDetails);
	}

	private patchClientPrimaryOrgLevel1(userDetails: IUserDetails): void {
		const orgLevel1Id = userDetails.PrimaryOrgLevels1Id,
			primaryOrgLevel1 = this.orgLevel1List.find((orgLevel1: DropdownItem) =>
				Number(orgLevel1.Value) == orgLevel1Id);
		if (primaryOrgLevel1) {
			this.liRequestForm.patchValue({
				orglevel1: {
					Text: primaryOrgLevel1.Text,
					Value: (primaryOrgLevel1.Value).toString()
				}
			});
			this.onOrgLevel1Change(primaryOrgLevel1);
		}
	}

	private patchClientPrimaryOrgLevel2(userDetails: IUserDetails): void {
		const orgLevel2Id = userDetails.PrimaryOrgLevels2Id,
			primaryOrgLevel2 = this.orgLevel2List.find((orgLevel2: DropdownItem) =>
				Number(orgLevel2.Value) == orgLevel2Id);
		if (primaryOrgLevel2) {
			this.liRequestForm.patchValue({
				orglevel2: {
					Text: primaryOrgLevel2.Text,
					Value: (primaryOrgLevel2.Value).toString()
				}
			});
			this.onOrgLevel2Change(primaryOrgLevel2);
		}
	}

	private patchClientPrimaryOrgLevel3(userDetails: IUserDetails): void {
		const orgLevel3Id = userDetails.PrimaryOrgLevels3Id,
			primaryOrgLevel3 = this.orgLevel3List.find((orgLevel3: DropdownItem) =>
				Number(orgLevel3.Value) == orgLevel3Id);
		if (primaryOrgLevel3) {
			this.liRequestForm.patchValue({
				orglevel3: {
					Text: primaryOrgLevel3.Text,
					Value: (primaryOrgLevel3.Value).toString()
				}
			});
			this.onOrgLevel3Change(primaryOrgLevel3);
		}
	}

	private patchClientPrimaryOrgLevel4(userDetails: IUserDetails): void {
		const orgLevel4Id = userDetails.PrimaryOrgLevels4Id,
			primaryOrgLevel4 = this.orgLevel4List.find((orgLevel4: DropdownItem) =>
				Number(orgLevel4.Value) == orgLevel4Id);
		if (primaryOrgLevel4) {
			this.liRequestForm.patchValue({
				orglevel4: {
					Text: primaryOrgLevel4.Text,
					Value: (primaryOrgLevel4.Value).toString()
				}
			});
			this.onOrgLevel4Change(primaryOrgLevel4);
		}
	}

	private patchClientPrimaryReqManager(userDetails: IUserDetails): void {
		const sectorId = userDetails.PrimarySectorId,
			reqManagerId = userDetails.UserId,
			afterReqManagerSelectCallback = () => {
				const primaryReqManager = this.requestingManagerList.find((reqManager: DropdownItem) =>
						Number(reqManager.Value) == reqManagerId),
					afterTimeApproverSelectCallback = () => {
						if (!this.isMultipleTimeApprover) {
							const selectedPrimaryManager = this.timeApproverList.find((approver: DropdownItem) =>
								Number(approver.Value) == this.primaryManager);
							if (selectedPrimaryManager) {
								this.liRequestForm.patchValue({
									PrimaryTimeApprover: {
										Text: selectedPrimaryManager.Text,
										Value: (selectedPrimaryManager.Value).toString()
									}
								});
							}
						}
					};
				if (primaryReqManager) {
					if (this.userDetails?.DataAccessRight == DataAccessRights.ReportingCLPView ||
						this.userDetails?.DataAccessRight == DataAccessRights.SectorView ||
						this.userDetails?.DataAccessRight == DataAccessRights.LocationView ||
						this.userDetails?.DataAccessRight == DataAccessRights.OrgLevel1View ||
						this.userDetails?.DataAccessRight == DataAccessRights.NextLevelManagerView
					) {
						this.liRequestForm.patchValue({
							primaryManager: {
								Text: primaryReqManager.Text,
								Value: (primaryReqManager.Value).toString()
							}
						});
					}
					this.primaryManager = reqManagerId;
					this.getApprovalWidgetData();
				}
				this.getApproverList(sectorId, afterTimeApproverSelectCallback);
			};
		this.getRequestingManagerList(sectorId, afterReqManagerSelectCallback);
	}

	private patchClientPrimaryCostAccounting(userDetails: IUserDetails): void {
		const costAccountingId = userDetails.DefaultCostAccountingsCode,
			sectorId = userDetails.PrimarySectorId,
			startDate = this.startDate,
			afterCostAccountingCodeSelectCallback = () => {
				const primaryCostAccounting = this.costAccountingCodeList.find((costAccounting: DropdownItem) =>
					Number(costAccounting.Value) == costAccountingId);
				if (primaryCostAccounting) {
					this.liRequestForm.patchValue({
						costAccountingName: {
							Text: primaryCostAccounting.Text,
							Value: (primaryCostAccounting.Value).toString()
						}
					});
					this.getCostAccountingDetailsById(costAccountingId);
				}
			};
		this.getCostAccountingCodeList(sectorId, startDate, afterCostAccountingCodeSelectCallback);
	}

	private patchClientPrimaryLaborCategory(userDetails: IUserDetails): void {
		const sectorId = userDetails.PrimarySectorId,
			afterLabouCategorySelectCallback = () => {
				this.patchSingleDDItemLaborCategory();
			};
		this.getLaborCategoryList(sectorId, afterLabouCategorySelectCallback);
	}

	private patchClientPrimaryReasonForRequest(userDetails: IUserDetails): void {
		const sectorId = userDetails.PrimarySectorId,
			afterReasonForRequestSelectCallback = () => {
				this.patchSingleDDItemReasonForRequest();
			};
		this.getReasonForRequestList(sectorId, afterReasonForRequestSelectCallback);
	}

	private patchClientPrimaryHdr(userDetails: IUserDetails): void {
		const locationId = userDetails.PrimaryLocationId,
			afterHdrSelectCallback = () => {
				this.patchSingleDDItemHdr();
			};
		this.getHdrList(locationId, afterHdrSelectCallback);
	}

	private patchClientPrimaryShift(userDetails: IUserDetails): void {
		const sectorId = userDetails.PrimarySectorId,
			locationId = userDetails.PrimaryLocationId,
			afterShiftSelectCallback = () => {
				this.patchSingleDDItemShift();
			};
		this.getShiftList(sectorId, locationId, afterShiftSelectCallback);
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

	private getHdrListWithHdrId(locationId: number, hdrId: number, callback: () => void): void {
		const reqIds = {
			locId: locationId,
			hourDistributionRuleId: hdrId
		};
		this.lightIndustrialService.getHDRDropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.hdrList = data.Data ?? [];
				} else {
					this.hdrList = [];
				}
				callback();
			}
		});
	}

	private getShiftListWithShiftId(reqPayload: IShiftListWithIdPayload, callback: () => void): void {
		this.lightIndustrialService.getShiftDropdownEdit(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.shiftList = data.Data ?? [];
					callback();
				} else {
					this.shiftList = [];
				}
			}
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
			laborCatTypeId: AssignmentTypesEnum.LI,
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
			locId: parseInt(this.liRequestForm.get('locationName')?.value?.Value),
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

	private getReasonForRequestWithId(sectorId: number, reasonforRequestId: number, callback: () => void): void {
		this.lightIndustrialService.getReasonForRequestDropdown(sectorId, reasonforRequestId)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
				next: (data: GenericResponseBase<DropdownItem[]>) => {
					if (data.Succeeded) {
						this.reasonForRequestList = data.Data ?? [];
						callback();
					} else {
						this.reasonForRequestList = [];
					}
				}
			});
	}

	private getLiRequestDetails(uKey: string): void {
		this.isNeedToReloadLatestApprovers = true;
		this.lightIndustrialService.getLIReqViewById(uKey).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe(async (res: GenericResponseBase<RequestDetails>) => {
				if (res.Succeeded && res.Data) {
					this.liRequestDetails = res.Data;
					await this.getSectorList();
					this.patchLiRequestDetails(this.liRequestDetails);
				} else if(res.StatusCode == Number(HttpStatusCode.Unauthorized)) {
					this.route.navigate(['unauthorized']);
				}
			});
	}

	private patchLiRequestDetails(liRequestDetails: RequestDetails): void {
		this.patchSector(liRequestDetails);
		this.patchOtherDetails(liRequestDetails);
	}

	private patchSector(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			sector = this.sectorList.find((sec: dropdownWithExtras) =>
				Number(sec.Value) == sectorId);
		if (sector) {
			this.liRequestForm.patchValue({
				sectorName: {
					Text: sector.Text,
					Value: (sector.Value).toString()
				}
			});
			const afterSectorSelectCallback = () => {
				this.otherFieldsConfigBySectorDetails(this.sectorDetails);
				const { CostAccountingCodeHaveSpecificApprovers } = this.sectorDetails;
				this.getTimeApproverDetails(CostAccountingCodeHaveSpecificApprovers);
				this.setOrgLevelConfig(this.sectorDetails);
				this.patchLocation(liRequestDetails);
				this.patchOrgLevel(liRequestDetails);
				this.patchCostAccounting(liRequestDetails);
				this.patchReqManager(liRequestDetails);
				this.patchReasonForRequest(liRequestDetails);
				this.patchTimeApprover(liRequestDetails);
				this.sectorId = sectorId;
				this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, sectorId);
				this.getApprovalWidgetData();
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

	private patchLocation(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			locationId = liRequestDetails.WorkLocationId,
			afterLocationSelectCallback = () => {
				const location = this.locationList.find((loc: DropdownItem) =>
					Number(loc.Value) == locationId);
				if (location) {
					this.liRequestForm.patchValue({
						locationName: {
							Text: location.Text,
							Value: (location.Value).toString()
						}
					});
					this.patchLaborCategory(liRequestDetails);
					this.getLocationDetails(locationId);
					this.patchHdr(liRequestDetails);
					this.patchShift(liRequestDetails);
					this.locationId = locationId;
					this.udfCommonMethods.manageParentsInfo(XrmEntities.Location, locationId);
					this.getApprovalWidgetData();
					this.nonEditableField = true;
				}
			};
		this.getLocationListWithLocationId(sectorId, locationId, afterLocationSelectCallback);
	}

	private patchHdr(liRequestDetails: RequestDetails) {
		const locationId = liRequestDetails.WorkLocationId,
			hdrId = liRequestDetails.HourDistributionRuleId,
			afterHdrSelectCallback = () => {
				const hdr = this.hdrList.find((ele: DropdownItem) =>
					Number(ele.Value) == hdrId);
				if (hdr) {
					this.liRequestForm.patchValue({
						hourDistribution: {
							Text: hdr.Text,
							Value: (hdr.Value).toString()
						}
					});
				}
			};
		this.getHdrListWithHdrId(locationId, hdrId, afterHdrSelectCallback);
	}

	private patchShift(liRequestDetails: RequestDetails): void {
		const reqIds = {
				secId: liRequestDetails.SectorId,
				locId: liRequestDetails.WorkLocationId,
				shiftId: liRequestDetails.RequestShiftDetailGetAllDto.ShiftId
			},
			afterShiftSelectCallback = () => {
				const shift = this.shiftList.find((sft: DropdownItem) =>
					Number(sft.Value) == reqIds.shiftId);
				if (shift) {
					this.liRequestForm.patchValue({
						shiftName: {
							Text: shift.Text,
							Value: (shift.Value).toString()
						}
					});
					this.getShiftDetails(reqIds.shiftId);
				}
			};
		this.getShiftListWithShiftId(reqIds, afterShiftSelectCallback);
	}

	private patchOrgLevel(liRequestDetails: RequestDetails): void {
		this.patchOrgLevel1(liRequestDetails);
		this.patchOrgLevel2(liRequestDetails);
		this.patchOrgLevel3(liRequestDetails);
		this.patchOrgLevel4(liRequestDetails);
	}

	private patchOrgLevel1(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			orgLevel1Id = liRequestDetails.OrgLevel1Id,
			afterOrgLevel1SelectCallback = () => {
				const orgLevel1 = this.orgLevel1List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel1Id);
				if (orgLevel1) {
					this.liRequestForm.patchValue({
						orglevel1: {
							Text: orgLevel1.Text,
							Value: (orgLevel1.Value).toString()
						}
					});
				}
			};
		this.getOrgLevel1ListWithOrgLevel1Id(sectorId, orgLevel1Id, afterOrgLevel1SelectCallback);
	}

	private patchOrgLevel2(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			orgLevel2Id = liRequestDetails.OrgLevel2Id,
			afterOrgLevel2SelectCallback = () => {
				const orgLevel2 = this.orgLevel2List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel2Id);
				if (orgLevel2) {
					this.liRequestForm.patchValue({
						orglevel2: {
							Text: orgLevel2.Text,
							Value: (orgLevel2.Value).toString()
						}
					});
				}
			};
		if (sectorId && this.orgType2Data.IsVisible) {
			this.getOrgLevel2ListWithOrgLevel2Id(sectorId, orgLevel2Id
				? orgLevel2Id
				: magicNumber.zero, afterOrgLevel2SelectCallback);
		}
	}

	private patchOrgLevel3(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			orgLevel3Id = liRequestDetails.OrgLevel3Id,

			afterOrgLevel3SelectCallback = () => {
				const orgLevel3 = this.orgLevel3List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel3Id);
				if (orgLevel3) {
					this.liRequestForm.patchValue({
						orglevel3: {
							Text: orgLevel3.Text,
							Value: (orgLevel3.Value).toString()
						}
					});
				}
			};
		if (sectorId && this.orgType3Data.IsVisible) {
			this.getOrgLevel3ListWithOrgLevel3Id(sectorId, orgLevel3Id
				? orgLevel3Id
				: magicNumber.zero, afterOrgLevel3SelectCallback);
		}
	}

	private patchOrgLevel4(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			orgLevel4Id = liRequestDetails.OrgLevel4Id,

			afterOrgLevel4SelectCallback = () => {
				const orgLevel4 = this.orgLevel4List.find((org: DropdownItem) =>
					Number(org.Value) == orgLevel4Id);
				if (orgLevel4) {
					this.liRequestForm.patchValue({
						orglevel4: {
							Text: orgLevel4.Text,
							Value: (orgLevel4.Value).toString()
						}
					});
				}
			};
		if (sectorId && this.orgType4Data.IsVisible) {
			this.getOrgLevel4ListWithOrgLevel4Id(sectorId, orgLevel4Id
				? orgLevel4Id
				: magicNumber.zero, afterOrgLevel4SelectCallback);
		}
	}

	private patchCostAccounting(liRequestDetails: RequestDetails): void {
		const reqIds: ICostAccountingFuncParams = {
			sectorId: liRequestDetails.SectorId,
			costAccountingId: liRequestDetails.DefaultCostCenterId,
			startDate: liRequestDetails.StartDate
		},
			afterCostAccountingSelectCallback = () => {
				const costAccounting = this.costAccountingCodeList.find((costAcc: DropdownItem) =>
					Number(costAcc.Value) == reqIds.costAccountingId);
				if (costAccounting) {
					this.liRequestForm.patchValue({
						costAccountingName: {
							Text: costAccounting.Text,
							Value: (costAccounting.Value).toString()
						}
					});
					this.getCostAccountingDetailsById(reqIds.costAccountingId);
				}
			};
		this.getCostAccountingListWithCostAccountingId(reqIds, afterCostAccountingSelectCallback);
	}

	private patchReqManager(liRequestDetails: RequestDetails) {
		const sectorId = liRequestDetails.SectorId,
			reqManagerId = liRequestDetails.RequestingManagerId,
			afterReqManagerSelectCallback = () => {
				this.afterReqManagerSelectSetValue(reqManagerId);
			};
		this.getRequestingManagerListWithRequestingManagerId(sectorId, reqManagerId, afterReqManagerSelectCallback);
	}

	private patchLaborCategory(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			laborCategoryId = liRequestDetails.LaborCategoryId,

			afterLaborCategorySelectCallback = () => {
				const laborCategory = this.laborCategoryList.find((labCat: DropdownItem) =>
					Number(labCat.Value) == laborCategoryId);
				if (laborCategory) {
					this.liRequestForm.patchValue({
						laborCategory: {
							Text: laborCategory.Text,
							Value: (laborCategory.Value).toString()
						}
					});
					this.laborCategoryId = laborCategoryId;
					this.udfCommonMethods.manageParentsInfo(XrmEntities.LaborCategory, laborCategoryId);
					this.getApprovalWidgetData();
					this.getLaborCategoryDetails(laborCategoryId);
					this.patchJobCategory(liRequestDetails);
				}
			};
		this.getLaborCategoryListWithLaborCategoryId(sectorId, laborCategoryId, afterLaborCategorySelectCallback);
	}

	private patchJobCategory(liRequestDetails: RequestDetails): void {
		const laborCategoryId = liRequestDetails.LaborCategoryId,
			jobCategoryId = liRequestDetails.JobCategoryId,
			reqLibId = liRequestDetails.ReqLibraryId,
			isPositionDescPatch = false,

			afterJobCategorySelectCallback = () => {
				const jobCategory = this.jobCategoryList.find((jobCat: DropdownItem) =>
					Number(jobCat.Value) == jobCategoryId);
				if (jobCategory) {
					this.liRequestForm.patchValue({
						jobCategory: {
							Text: jobCategory.Text,
							Value: (jobCategory.Value).toString()
						}
					});
					this.jobCategoryId = jobCategoryId;
					this.udfCommonMethods.manageParentsInfo(XrmEntities.JobCategory, jobCategoryId);
					this.getReqLibrarayDetailsWithReqLibId(jobCategoryId, reqLibId, isPositionDescPatch);
				}
			};
		this.getJobCategoryListWithJobCategoryId(laborCategoryId, jobCategoryId, afterJobCategorySelectCallback);
	}

	private patchReasonForRequest(liRequestDetails: RequestDetails): void {
		const sectorId = liRequestDetails.SectorId,
			reasonForRequestId = liRequestDetails.ReasonForRequestId,
			afterReasonForRequestSelectCallback = () => {
				const previousReasonForRequest = this.reasonForRequestList.find((reasonForRequest: DropdownItem) =>
					Number(reasonForRequest.Value) == reasonForRequestId);
				if (previousReasonForRequest) {
					this.liRequestForm.patchValue({
						reasonforRequest: {
							Text: previousReasonForRequest.Text,
							Value: (previousReasonForRequest.Value).toString()
						}
					});
					this.reasonForRequestId = reasonForRequestId;
					this.getApprovalWidgetData();
				} else {
					this.patchSingleDDItemReasonForRequest();
				}
			};
		this.getReasonForRequestWithId(sectorId, reasonForRequestId, afterReasonForRequestSelectCallback);
	}

	private patchTimeApprover(liRequestDetails: RequestDetails): void {
		this.patchPreviousTimeApprover(liRequestDetails);
	}

	private patchOtherDetails(liRequestDetails: RequestDetails): void {
		this.requestId = liRequestDetails.RequestId;
		this.contractorFilled = liRequestDetails.NoOfContractorFilled;
		this.actionTypeId = ActionType.Edit;
		this.sectorId = liRequestDetails.SectorId;
		this.recordUKey = liRequestDetails.Ukey;
		this.recordId = liRequestDetails.RequestId;
		this.patchWeekdayDaysInfoWidget(liRequestDetails);
		this.eventlog.recordId.next(liRequestDetails.RequestId);
		this.eventlog.entityId.next(this.entityId);
		this.patchStartDateAndNoLaterThenDate(liRequestDetails);
		this.liRequestForm.controls['DrugScreen'].patchValue(liRequestDetails.IsDrugTestRequired);
		this.liRequestForm.controls['BackgroundChecks'].patchValue(liRequestDetails.IsBackgrounCheckRequired);
		this.patchContractorDetails(liRequestDetails);
		this.liRequestForm.controls['positionDesc'].patchValue(liRequestDetails.PositionDescription);
		this.patchManagerComment(liRequestDetails);
	}

	private patchWeekdayDaysInfoWidget(liRequestDetails: RequestDetails): void {
		const date = new Date(),
			startTime = new Date(`${date.toDateString()} ${liRequestDetails.RequestShiftDetailGetAllDto.StartTime}`),
			endTime = new Date(`${date.toDateString()} ${liRequestDetails.RequestShiftDetailGetAllDto.EndTime}`);
		this.liRequestForm.controls['startTimeControlName'].patchValue(startTime);
		this.liRequestForm.controls['endTimeControlName'].patchValue(endTime);
		this.daysInfo = this.lightIndustrialService.generateDaysInfo(liRequestDetails.RequestShiftDetailGetAllDto);
	}

	private patchContractorDetails(liRequestDetails: RequestDetails): void {
		this.startDate = liRequestDetails.StartDate;
		this.startDateNoLaterThan = liRequestDetails.StartDateNoLaterThan;
		const timeoutId = setTimeout(() => {
			this.lastTbdSequenceNo = liRequestDetails.LastTbdSequenceNo;
		}, magicNumber.hundred);
		this.timeoutIds.push(timeoutId);
		this.shiftDetails = liRequestDetails.RequestShiftDetailGetAllDto;
		this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
		this.parentData = liRequestDetails.RequestPositionDetailGetAllDtos;
	}

	private patchStartDateAndNoLaterThenDate(liRequestDetails: RequestDetails): void {
		this.liRequestForm.controls['startDate'].patchValue(liRequestDetails.StartDate);
		const startDate = liRequestDetails.StartDateNoLaterThan
			? new Date(liRequestDetails.StartDateNoLaterThan)
			: null;
		if (startDate !== null) {
			this.liRequestForm.controls['startDateNoLaterThan'].patchValue(startDate);
		}
	}

	private patchManagerComment(liRequestDetails: RequestDetails) {
		this.liRequestForm.patchValue({
			ManagerCommentstoStaffingAgency: liRequestDetails.ManagerCommentsToStaffingAgency,
			ManagerComments: liRequestDetails.ManagerComments
		});
	}

	private checkBroadcastPermission(): void {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((action: Params) => {
				this.entityActionList = action['permission'];
				this.isBroadcastActionAllowed = this.entityActionList.length
					? this.entityActionList.some((permission: IPermissionInfo) =>
						permission.ActionId === Number(Permission.PROCESS_AND_BROADCAST))
					: false;
			});
	}

	private loadData() {
		const primaryManagerId = this.liRequestForm.get('primaryManager')?.value
				? this.liRequestForm.get('primaryManager')?.value.Value
				: null,
			data = {
				pageSize: this.pageSize,
				startIndex: this.startIndex * this.pageSize,
				smartSearchText: this.smartSearchText,
				xrmEntityId: this.entityId
			};
		this.loaderService.setState(false);
		this.lightIndustrialService.getPreviousLIRequest(primaryManagerId, data)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<IPreviousRequestItemResponse>) => {
				if (res.Succeeded && res.Data) {
					if (this.isSearchLoadMore) {
						this.loadMoreDataSource = res.Data.Data;
						this.isSearchLoadMore = false;
						this.scrollToTop.scrollTop();
					} else {
						this.loadMoreDataSource = this.loadMoreDataSource.concat(res.Data.Data);
						this.cdr.markForCheck();
					}
					this.loadMoreTotal = res.Data.Count;
				} else {
					this.loadMoreDataSource = [];
					this.loadMoreTotal = magicNumber.zero;
				}
			});
	}

	public openPopupLoadMore() {
		this.resetLoadMoreCopyData();
		this.loadData();
	}

	public searchPreviousData(event: string) {
		this.startIndex = magicNumber.zero;
		this.smartSearchText = event;
		this.isSearchLoadMore = true;
		this.loadData();
	}

	public loadMoreData() {
		if (this.loadMoreDataSource.length < this.loadMoreTotal) {
			this.startIndex++;
			this.loadData();
		}
	}

	public getCopyData(previousReqData: IPreviousRequestItem) {
		this.resetOtherFieldsListBeforeCopyNewData();
		this.patchPreviousReqData(previousReqData);
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

	public getWeekData(weekData: WeekDayPicker) {
		const data = weekData,
			startTime = this.formatTime(weekData.time.startTime),
			endTime = this.formatTime(weekData.time.endTime);
		data.day.forEach((dayData: IDayInfo) => {
			const dayInfo = this.daysInfo.find((info: IDayInfo) =>
				info.day === dayData.day);
			if (dayInfo) {
				dayInfo.isSelected = dayData.isSelected;
			}
		});
		if (this.shiftDetails) {
			this.shiftDetails = {
				...this.shiftDetails,
				"StartTime": startTime,
				"EndTime": endTime,
				"Sun": weekData.day[0].isSelected,
				"Mon": weekData.day[1].isSelected,
				"Tue": weekData.day[2].isSelected,
				"Wed": weekData.day[3].isSelected,
				"Thu": weekData.day[4].isSelected,
				"Fri": weekData.day[5].isSelected,
				"Sat": weekData.day[6].isSelected
			};
		}
		this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
		this.widgetChangeDetected = true;
	}

	public getStatus(daysInfo: IDayInfo[]) {
		if (daysInfo.length) {
			if (this.isEditMode) {
				this.daysInfo = this.lightIndustrialService.generateDaysInfo(this.liRequestDetails.RequestShiftDetailGetAllDto);
			} else {
				this.daysInfo = this.lightIndustrialService.generateDaysInfo(this.shiftDetails);
			}
			const date = new Date(),
				startTime = new Date(`${date.toDateString()} ${this.shiftDetails?.StartTime}`),
				endTime = new Date(`${date.toDateString()} ${this.shiftDetails?.EndTime}`);
			this.liRequestForm.controls['startTimeControlName'].patchValue(startTime);
			this.liRequestForm.controls['endTimeControlName'].patchValue(endTime);
		}
	}

	private getApprovalWidgetData() {
		this.approvalConfigWidgetObj = {
			"actionId": approvalStage.LiCreation,
			"entityId": this.entityId,
			"sectorId": this.sectorId,
			"locationId": this.locationId,
			"orgLevel1Id": this.liRequestForm.value.orglevel1
				? parseInt(this.liRequestForm.controls['orglevel1'].value?.Value)
				: this.orgLevel1Id,
			"laborCategoryId": this.laborCategoryId,
			"reasonsForRequestId": this.reasonForRequestId,
			"estimatedcost": this.totalEstimatedCost,
			"nextLevelManagerId": this.liRequestForm.value.primaryManager
				? parseInt(this.liRequestForm.controls['primaryManager'].value?.Value)
				: this.primaryManager
		};
	}

	public onApproverSubmit(e: IApprovalConfigWidgetPayload) {
		this.approverWidgetForm = e;
		this.liRequestForm.setControl('approvalForm', this.approverWidgetForm.approvalForm);
		if (this.approverWidgetForm.data.length > Number(magicNumber.zero)) {
			this.hasApproverData = false;
		} else {
			this.hasApproverData = true;
		}
		this.approverRequired = this.lightIndustrialUtilsService.isAllValuesZero(this.approverWidgetForm.data);

		// to get approver data length for status bar
		if (this.statusBarChange)
			this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(this.approverWidgetForm.data));
		if (this.isEditMode)
			this.statusId = this.liRequestDetails.StatusId;
	}


	private getApproverList(sectorId: number, optionalCallback?: () => void): void {
		const payload: UserPermissions = {
			"roleGroupIds": [],
			"roleGroupDtos": [{ "roleGroupId": UserRole.Client, "roleNos": [] }],
			"xrmEntityActionIds": [EntityActionID.TimeAndExpenseReview],
			"sectorIds": [sectorId],
			"locationIds": [],
			"orgLevel1Ids": []
		};
		this.userService.getUsersWithFilter(payload).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.timeApproverList = data.Data ?? [];
				} else {
					this.timeApproverList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				}
			});
	}

	public shouldShowControl(): boolean {
		const locationConfig = Boolean(this.locationDetails?.IsAlternateConfigurationForMSPProcess),
			shouldSkipLIRequestProcess = locationConfig
				? Boolean(this.locationDetails?.SkipLIRequestProcessbyMSP)
				: this.sectorDetails.SkipLIRequestProcessByMsp,
			shouldAutoBroadcast = locationConfig
				? Boolean(this.locationDetails?.AutoBroadcastForLIRequest)
				: this.sectorDetails.AutoBroadcastForLiRequest;
		return shouldSkipLIRequestProcess && shouldAutoBroadcast;
	}

	private populateUdfFieldRecords(payload: IPreparedUdfPayloadData[] | undefined): void {
		if (payload == undefined) {
			const buildUdf: IPreparedUdfPayloadData[] = [];
			this.udfControlConfig.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: IUdfConfig[]) => {
				data.map((val) => {
					buildUdf.push({
						recordId: magicNumber.zero,
						recordUKey: '',
						sectorId: magicNumber.zero,
						udfConfigId: val.UdfConfigId,
						udfDateValue: val.UdfDateValue,
						udfId: magicNumber.zero,
						udfIntegerValue: val.IsNumeric
							? Number(val.DefaultValue)
							: magicNumber.zero,
						udfNumericValue: magicNumber.zero,
						udfTextValue: val.IsNumeric
							? ''
							: val.DefaultValue,
						xrmEntityId: this.entityId,
						udfFieldTypeId: val.FieldTypeId
					});
				});
			});
			this.udfData = buildUdf;
		}
	}

	private getTargetEndDate() {
		const startDate = this.liRequestForm.get('startDate')?.value;
		this.targetEndDate = this.contractorService.addMonthsOrDays(startDate, this.requsitionTenure, this.tenureLimitType);
	}

	private getIsMspProcessRequired(): boolean {
		return this.locationDetails?.IsAlternateConfigurationForMSPProcess
			? !this.locationDetails.SkipLIRequestProcessbyMSP
			: !this.sectorDetails.SkipLIRequestProcessByMsp;
	}

	private getIsManualBroadcastRequired(): boolean {
		return this.locationDetails?.IsAlternateConfigurationForMSPProcess
			? !this.locationDetails.AutoBroadcastForLIRequest
			: !this.sectorDetails.AutoBroadcastForLiRequest;
	}

	public showDrugField() {
		if ((this.locationDetails?.IsAltDrugandbackgConfigurations && this.locationDetails.IsDrugResultVisible) ||
			(!this.locationDetails?.IsAltDrugandbackgConfigurations && this.sectorDetails.IsDrugResultVisible)) {
			return true;
		}
		return false;
	}

	public showaBackgroundField() {
		if ((this.locationDetails?.IsAltDrugandbackgConfigurations && this.locationDetails.IsBackGroundCheckVisible) ||
			(!this.locationDetails?.IsAltDrugandbackgConfigurations && this.sectorDetails.IsBackGroundCheckVisible)) {
			return true;
		}
		return false;
	}

	public editableDrugField(): boolean {
		return this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsDrugScreenItemEditable
			: this.sectorDetails.IsDrugScreenItemEditable;
	}

	public editableBackgroundField(): boolean {
		return this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.IsBackGroundItemEditable
			: this.sectorDetails.IsBackGroundItemEditable;
	}

	checkDrugValue() {
		const value = this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.DefaultDrugResultValue
			: this.sectorDetails.DefaultDrugResultValue;
		return value
			? 'Yes'
			: 'No';
	}

	checkBackgroundValue() {
		const value = this.locationDetails?.IsAltDrugandbackgConfigurations
			? this.locationDetails.DefaultBackGroundCheckValue
			: this.sectorDetails.DefaultBackGroundCheckValue;
		return value
			? 'Yes'
			: 'No';
	}

	private getRequestShiftDetail() {
		if (!this.shiftDetails) {
			return null;
		}
		const shiftName = this.liRequestForm.controls['shiftName'].value?.Value,
			dayProperties = {
				"sun": this.shiftDetails.Sun,
				"mon": this.shiftDetails.Mon,
				"tue": this.shiftDetails.Tue,
				"wed": this.shiftDetails.Wed,
				"thu": this.shiftDetails.Thu,
				"fri": this.shiftDetails.Fri,
				"sat": this.shiftDetails.Sat
			},
			startTime = this.shiftDetails.StartTime,
			endTime = this.shiftDetails.EndTime;
		return {
			"shiftId": parseInt(shiftName),
			...dayProperties,
			"startTime": startTime,
			"endTime": endTime
		};
	}

	private formatTime(timeValue: string): string {
		const timeDate = new Date(timeValue),
			hours = timeDate.getHours().toString().padStart(magicNumber.two, '0'),
			minutes = timeDate.getMinutes().toString().padStart(magicNumber.two, '0'),
			seconds = timeDate.getSeconds().toString().padStart(magicNumber.two, '0');
		return `${hours}:${minutes}:${seconds}`;
	}

	private getRequestAdditionalDetail(): IRequestAdditionalDetail {
		return {
			"positionDescription": this.liRequestForm.controls['positionDesc'].value,
			"clientComments": this.liRequestForm.controls['ManagerComments'].value,
			"clientCommentsToStaffingAgency": this.liRequestForm.controls['ManagerCommentstoStaffingAgency'].value
		};
	}

	private createLiRequestPayload(): ILiRequestAddPayload {
		this.populateUdfFieldRecords(this.udfData);
		this.getTargetEndDate();
		const requestData: ILiRequestAddPayload = {
			"sectorId": parseInt(this.liRequestForm.controls['sectorName'].value.Value),
			"requestingManagerId": parseInt(this.liRequestForm.controls['primaryManager'].value.Value),
			"primaryTimeApproverId": this.parseNullableInt(this.liRequestForm.controls['PrimaryTimeApprover'].value?.Value),
			"alternateTimeApproverId": this.parseNullableInt(this.liRequestForm.controls['AlternateTimeApprover'].value?.Value),
			"orgLevel1Id": this.parseNullableInt(this.liRequestForm.controls['orglevel1'].value?.Value ?? '0'),
			"orgLevel2Id": this.parseNullableInt(this.liRequestForm.controls['orglevel2'].value?.Value),
			"orgLevel3Id": this.parseNullableInt(this.liRequestForm.controls['orglevel3'].value?.Value),
			"orgLevel4Id": this.parseNullableInt(this.liRequestForm.controls['orglevel4'].value?.Value),
			"managerLocationId": parseInt(this.liRequestForm.controls['locationName'].value.Value),
			"workLocationId": parseInt(this.liRequestForm.controls['locationName'].value.Value),
			"hourDistributionRuleId": parseInt(this.liRequestForm.controls['hourDistribution'].value.Value),
			"laborCategoryId": parseInt(this.liRequestForm.controls['laborCategory'].value.Value),
			"jobCategoryId": parseInt(this.liRequestForm.controls['jobCategory'].value.Value),
			"reasonForRequestId": parseInt(this.liRequestForm.controls['reasonforRequest'].value.Value),
			"reqLibraryId": this.reqLibraryId,
			"defaultCostCenterId": parseInt(this.liRequestForm.controls['costAccountingName'].value.Value),
			"StartDate": this.liRequestForm.get('startDate')?.value,
			"startDateNoLaterThan": this.liRequestForm.get('startDateNoLaterThan')?.value,
			"EndDate": this.localizationService.TransformDate(this.targetEndDate, 'MM/dd/YYYY'),
			"positionNeeded": Number(this.totalContractors),
			"estimatedCost": Number(this.totalEstimatedCost),
			"isMspProcessRequired": this.getIsMspProcessRequired(),
			"isManualBroadcastRequired": this.getIsMspProcessRequired() && this.getIsManualBroadcastRequired()
				? false
				: this.getIsManualBroadcastRequired(),
			"isManualBroadcast": this.liRequestForm.controls['ManualBroadcast'].value,
			"isDrugTestRequired": this.liRequestForm.controls['DrugScreen'].value,
			"isBackgrounCheckRequired": this.liRequestForm.controls['BackgroundChecks'].value,
			"requestShiftDetailAddDto": this.getRequestShiftDetail(),
			"udfFieldRecords": this.udfData,
			"dmsFieldRecords": this.showDocumentUploadsSection
				? this.dmsImplementation.prepareAndEmitFormData()
				: [],
			"requestAdditionalDetailAddDto": this.getRequestAdditionalDetail(),
			"approvalDetails": this.approverWidgetForm?.data,
			"requestPositionDetailAddDtos": this.contractorData,
			"benefitAddDto": this.liRequestForm.get('BenefitAdder')?.value
		};

		return requestData;
	}

	private updateLiRequestPayload(): ILiRequestUpdatePayload {
		this.getTargetEndDate();
		const requestData: ILiRequestUpdatePayload = {
			"requestingManagerId": parseInt(this.liRequestForm.controls['primaryManager'].value.Value),
			"primaryTimeApproverId": this.parseNullableInt(this.liRequestForm.controls['PrimaryTimeApprover'].value?.Value),
			"alternateTimeApproverId": this.parseNullableInt(this.liRequestForm.controls['AlternateTimeApprover'].value?.Value),
			"laborCategoryId": parseInt(this.liRequestForm.controls['laborCategory'].value.Value),
			"jobCategoryId": parseInt(this.liRequestForm.controls['jobCategory'].value.Value),
			"orgLevel1Id": this.parseNullableInt(this.liRequestForm.controls['orglevel1'].value?.Value ?? '0'),
			"orgLevel2Id": this.parseNullableInt(this.liRequestForm.controls['orglevel2'].value?.Value),
			"orgLevel3Id": this.parseNullableInt(this.liRequestForm.controls['orglevel3'].value?.Value),
			"orgLevel4Id": this.parseNullableInt(this.liRequestForm.controls['orglevel4'].value?.Value),
			"managerLocationId": parseInt(this.liRequestForm.controls['locationName'].value.Value),
			"workLocationId": parseInt(this.liRequestForm.controls['locationName'].value.Value),
			"hourDistributionRuleId": parseInt(this.liRequestForm.controls['hourDistribution'].value.Value),
			"reqLibraryId": this.reqLibraryId,
			"positionNeeded": Number(this.totalContractors),
			"defaultCostCenterId": parseInt(this.liRequestForm.controls['costAccountingName'].value.Value),
			"StartDate": this.liRequestForm.get('startDate')?.value,
			"EndDate": this.localizationService.TransformDate(this.targetEndDate, 'MM/dd/YYYY'),
			"startDateNoLaterThan": this.liRequestForm.get('startDateNoLaterThan')?.value,
			"estimatedCost": Number(this.totalEstimatedCost),
			"isManualBroadcast": this.liRequestDetails.IsManualBroadcast,
			"isMspProcessRequired": this.liRequestDetails.IsMspProcessRequired,
			"isManualBroadcastRequired": this.liRequestDetails.IsManualBroadcastRequired,
			"requestAdditionalDetailUpdateDto": this.getRequestAdditionalDetail(),
			"requestShiftDetailUpdateDto": this.getRequestShiftDetail(),
			"requestPositionDetailUpdateDtos": this.contractorData,
			"dmsFieldRecords": this.showDocumentUploadsSection
				? this.dmsImplementation.prepareAndEmitFormData()
				: [],
			"approvalDetails": this.approverWidgetForm?.data,
			"udfFieldRecords": this.udfData,
			"isDrugTestRequired": this.liRequestForm.controls['DrugScreen'].value,
			"isBackgrounCheckRequired": this.liRequestForm.controls['BackgroundChecks'].value,
			"benefitUpdateDto": this.liRequestForm.controls['BenefitAdder'].value ?? [],
			"UKey": this.recordUKey
		};
		return requestData;
	}

	public hasIncorrectError(): boolean {
		const formControls = this.contractorFormData.get('gridData') as FormArray;
		for (const control of formControls.controls as FormGroup[]) {
			const startDateControl = control.get('startDateControl');
			if (startDateControl?.errors?.['incorrect']) {
				return true;
			}
		}
		return false;
	}

	public hasErrors(): boolean {
		let hasError = false;
		const controls = this.liRequestForm.controls;
		Object.keys(controls).forEach((key) => {
			const controlErrors = controls[key].errors?.['error'];
			if (controlErrors != null) {
				hasError = true;
			}
		});
		return hasError;
	}

	public async submitForm(): Promise<void> {
		this.liRequestForm.markAllAsTouched();
		if (this.hasDMSLength) {
			this.dmsImplementation?.validateDocumentsAndUploadForm();
		}
		const timeoutId = setTimeout(() => {
			this.accordionValidation();
		}, magicNumber.hundred);
		this.timeoutIds.push(timeoutId);
		if (!this.isFormValid()) {
			return;
		}

		const requestData: ILiRequestPayload = this.isEditMode
			? this.updateLiRequestPayload()
			: this.createLiRequestPayload();

		if (!await this.validateAll(requestData)) {
			return;
		}
		if (this.isEditMode) {
			this.updateLiRequest(requestData as ILiRequestUpdatePayload);
			this.liRequestForm.markAsPristine();
			this.widgetChangeDetected = false;
		} else {
			this.saveLiRequest(requestData as ILiRequestAddPayload);
		}
	}

	private isFormValid(): boolean {
		return this.liRequestForm.valid ||
			(!this.hasErrors() && this.liRequestForm.controls['startDate'].errors?.['incorrect']) ||
			(!this.hasErrors() && this.liRequestForm.controls['startDateNoLaterThan'].errors?.['incorrect']) ||
			(!this.hasErrors() && this.liRequestForm.controls['AlternateTimeApprover'].errors?.['incorrect']) ||
			(!this.hasErrors() && this.hasIncorrectError());
	}

	private async validateAll(requestData: ILiRequestPayload): Promise<boolean> {
		return this.startDateValidation() &&
			this.startDateNoLaterThanValidation() &&
			this.primaryAlternateTimeApproversAreValid(requestData) &&
			this.baseWageRateIsValid() &&
			this.allShiftDaysAreSelected() &&
			this.startAndEndTimeAreDifferent() &&
			this.childFormIsValid() &&
			this.contractorLimitIsValid() &&
			this.dmsFormIsValid() &&
			this.estimationCostIsNonZero(requestData) &&
			this.pricingModelIsBillRateBased() &&
			await this.staffingAgencyListIsValid(requestData);
	}

	private startDateValidation(): boolean {
		const validationErrors = this.comparisonStartAndInitialDate(this.liRequestForm);
		if (validationErrors) {
			this.liRequestForm.get('startDate')?.setErrors(validationErrors);
			return false;
		} else {
			this.liRequestForm.get('startDate')?.setErrors(null);
			return true;
		}
	}

	private comparisonStartAndInitialDate(formGroup: AbstractControl): ValidationErrors | null {
		const startDate = formGroup.get('startDate')?.value,
			initialGoLiveDate = this.sectorDetails.InitialGoLiveDate;
		if (startDate && initialGoLiveDate && new Date(startDate) < new Date(initialGoLiveDate)) {
			this.toasterService.showToaster(ToastOptions.Error, 'StartDatevalidation', [{ Value: 'StartDate', IsLocalizeKey: true }, { Value: 'InitialGoLiveDate', IsLocalizeKey: true }]);
			return { incorrect: true };
		}
		return null;
	}

	private validateDateComparison(formGroup: AbstractControl): ValidationErrors | null {
		const startDateNoLaterThanControl = formGroup.get('startDateNoLaterThan'),
			startDateNoLaterThan = startDateNoLaterThanControl?.value,
			startDate = formGroup.get('startDate')?.value,
			targetEndDate = new Date(this.targetEndDate);
		if (!startDateNoLaterThan || isNaN(new Date(startDateNoLaterThan).getTime())) {
			return null;
		}
		const startDateNoLaterThanDate = new Date(startDateNoLaterThan);
		if (startDate && startDateNoLaterThanDate < new Date(startDate)) {
			this.toasterService.showToaster(ToastOptions.Error, 'TargetDateValidation', [{ Value: this.getStartDateNoLaterThanParam(), IsLocalizeKey: true }, { Value: 'StartDate', IsLocalizeKey: true }]);
			return { incorrect: true };
		}
		if (startDateNoLaterThanDate > targetEndDate) {
			this.toasterService.showToaster(ToastOptions.Error, 'StartDatevalidationinitailDate', [{ Value: this.getStartDateNoLaterThanParam(), IsLocalizeKey: true }]);
			return { incorrect: true };
		}
		return null;
	}

	private getStartDateNoLaterThanParam(): string {
		return this.localizationService.GetLocalizeMessage('StartDateNoLaterThan').replace(/No Later Than/, "no later than");
	}

	private startDateNoLaterThanValidation(): boolean {
		const startDateNoLaterThanControl = this.liRequestForm.get('startDateNoLaterThan');
		if (!startDateNoLaterThanControl) {
			return true;
		}
		const validationErrors = this.validateDateComparison(this.liRequestForm);
		if (validationErrors) {
			startDateNoLaterThanControl.setErrors(validationErrors);
			return false;
		} else {
			startDateNoLaterThanControl.setErrors(null);
			return true;
		}
	}

	private startAndEndTimeAreDifferent(): boolean {
		const startTime = this.formatTime(this.liRequestForm.controls['startTimeControlName'].value),
			endTime = this.formatTime(this.liRequestForm.controls['endTimeControlName'].value);

		if (startTime === endTime) {
			this.toasterService.showToaster(ToastOptions.Error, 'ShiftTimeValidation');
			return false;
		}
		return true;
	}

	private childFormIsValid(): boolean {
		const childFormIsValid = this.contractor.triggerValidation().errors;
		return !childFormIsValid;
	}

	private primaryAlternateTimeApproversAreValid(requestData: ILiRequestPayload): boolean {
		const { primaryTimeApproverId, alternateTimeApproverId } = requestData,
			isValidPrimaryApprover = this.isNonEmptyTimeApprover(primaryTimeApproverId),
			isValidAlternateApprover = this.isNonEmptyTimeApprover(alternateTimeApproverId);
		if (isValidPrimaryApprover && isValidAlternateApprover) {
			if (primaryTimeApproverId === alternateTimeApproverId) {
				this.liRequestForm.controls['AlternateTimeApprover'].setErrors({ incorrect: true });
				this.toasterService.showToaster(ToastOptions.Error, 'PrimaryAndAlternateCannotBeSame');
				return false;
			} else {
				this.liRequestForm.controls['AlternateTimeApprover'].setErrors(null);
				this.toasterService.resetToaster();
				return true;
			}
		}
		return true;
	}

	private isNonEmptyTimeApprover(approverId: number | null | undefined): boolean {
		return approverId !== null && approverId !== undefined && approverId !== Number(magicNumber.zero);
	}

	private baseWageRateIsValid(): boolean {
		if (this.reqLibraryDetails?.WageRate == null || this.reqLibraryDetails.WageRate == Number(magicNumber.zero)) {
			this.toasterService.showToaster(ToastOptions.Error, 'BaseWageRateValidation');
			return false;
		}
		return true;
	}

	private allShiftDaysAreSelected(): boolean {
		if (this.daysInfo.every((day: { isSelected: boolean; }) =>
			!day.isSelected)) {
			this.toasterService.showToaster(ToastOptions.Error, 'ShiftDayValidationMsg');
			return false;
		}
		return true;
	}

	private contractorLimitIsValid(): boolean {
		if (this.totalContractors > Number(magicNumber.nineHundrednintyNine)) {
			this.toasterService.showToaster(ToastOptions.Error, 'ContractorLimitValidation');
			return false;
		}
		return true;
	}

	private dmsFormIsValid(): boolean {
		if (this.hasDMSLength) {
			if (this.dmsImplementation && !this.dmsImplementation.validateDocumentsAndUpload()) {
				return false;
			}
		}
		return true;
	}

	private estimationCostIsNonZero(requestData: ILiRequestPayload): boolean {
		if (requestData.estimatedCost == Number(magicNumber.zero)) {
			this.toasterService.showToaster(ToastOptions.Error, 'EstimationCostZeroValidation');
			return false;
		}
		return true;
	}

	private pricingModelIsBillRateBased(): boolean {
		if (this.laborCategoryDetails?.PricingModelId === PricingModels['Bill Rate Based']) {
			this.toasterService.showToaster(ToastOptions.Error, 'LIRequestBillRateValidation');
			return false;
		}
		return true;
	}

	private async staffingAgencyListIsValid(requestData: ILiRequestPayload): Promise<boolean> {
		if (!await this.checkStaffingAgencyList() &&
			!requestData.isMspProcessRequired &&
			!requestData.isManualBroadcastRequired &&
			!requestData.isManualBroadcast) {
			this.toasterService.showToaster(ToastOptions.Error, 'LiRequestDontHaveConfiguredStaffingAgencies');
			return false;
		}
		return true;
	}

	private saveLiRequest(liData: ILiRequestAddPayload) {
		this.lightIndustrialService.addLiRequest(liData).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<ILiRequestSucessResponse>) => {
				this.commonService.resetAdvDropdown(this.entityId);
				this.toasterService.resetToaster();
				const timeoutId = setTimeout(() => {
					this.toasterService.resetToaster();
				}, magicNumber.thirtyThousand);
				this.timeoutIds.push(timeoutId);
				if (!data.Succeeded) {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				} else if (data.StatusCode === Number(HttpStatusCode.Ok) && data.Data) {
					const requestCode = data.Data.RequestCode;
					this.localizationService.Refresh();
					this.isSuccessToast = true;
					if (liData.isManualBroadcast && (this.approverWidgetForm.data.length === Number(magicNumber.zero) ||
						this.approverRequired || data.Data.LastActionStatusId == Number(StatusID.Approved))) {
						this.route.navigate([`${NavigationPaths.broadcast}/${data.Data.Ukey}`]);
						this.toasterService.showToaster(ToastOptions.Success, 'LiRequestCreateSuccessfulPendingForBroadcast', [{ Value: requestCode, IsLocalizeKey: false }]);
					} else if (!liData.isManualBroadcast && data.Data.LastActionStatusId == Number(StatusID.Open)) {
						this.route.navigate(["/xrm/job-order/light-industrial/list"]);
						this.toasterService.showToaster(ToastOptions.Success, 'TheRequestcreatedbroadcasted', [{ Value: requestCode, IsLocalizeKey: false }]);
					} else if (data.Data.LastActionStatusId == Number(StatusID.Approved)) {
						this.route.navigate(["/xrm/job-order/light-industrial/list"]);
						this.toasterService.showToaster(ToastOptions.Success, 'LiRequestAddApprovedSuccessConfirmation', [{ Value: requestCode, IsLocalizeKey: false }]);
					} else {
						this.route.navigate(["/xrm/job-order/light-industrial/list"]);
						this.toasterService.showToaster(ToastOptions.Success, 'SubmitLIValidation', [{ Value: requestCode, IsLocalizeKey: false }]);
					}
				}
			});
	}

	private updateLiRequest(liData: ILiRequestUpdatePayload) {
		this.lightIndustrialService.updateLiRequest(this.recordUKey, liData)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((data: GenericResponseBase<ILiRequestSucessResponse>) => {
				if (!data.Succeeded) {
					this.toasterService.resetToaster();
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				} else if (data.StatusCode == Number(HttpStatusCode.Ok) && data.Data) {
					this.commonService.resetAdvDropdown(this.entityId);
					this.toasterService.resetToaster();
					this.toasterService.showToaster(ToastOptions.Success, 'RequestUpdateSuccessfulMessage', [{ Value: data.Data.RequestCode, IsLocalizeKey: false }]);
					this.statusBarChange = true;
					this.patchContractorDataFromUkey();
					this.cdr.markForCheck();
				}
			});
	}

	private parseNullableInt(value: string): number | null {
		return value
			? parseInt(value)
			: null;
	}

	private patchContractorDataFromUkey() {
		this.lightIndustrialService.getLIReqViewById(this.recordUKey).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<RequestDetails>) => {
				if (res.Succeeded && res.Data) {
					this.liRequestDetails = res.Data;
					this.statusId = this.liRequestDetails.StatusId;
					this.contractorFilled = this.liRequestDetails.NoOfContractorFilled;
					this.eventlog.isUpdated.next(true);
					this.isNeedToReloadLatestApprovers = true;
					this.isApproverReloadCheck = false;
					this.isApproverEstimatedCostMatchedCheck = false;
					this.parentData = this.liRequestDetails.RequestPositionDetailGetAllDtos;
					this.lastTbdSequenceNo = this.liRequestDetails.LastTbdSequenceNo;
				}
			});
	}

	private checkStaffingAgencyList(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			const reqIds: IStaffingAgencyGetPayload = {
				secId: this.sectorId,
				locid: this.locationId,
				laborcatid: this.laborCategoryId
			};
			this.lightIndustrialService.checkStaffingAgenciesList(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
				next: (data: GenericResponseBase<true>) => {
					if (data.Succeeded && data.Data) {
						resolve(data.Data);
					} else {
						resolve(false);
					}
				}
			});
		});
	}

	public onSectionAction(section: SectionNames): void {
		this.accordionService.toggleSectionVisibility(this, section);
	}

	public getCardClass(section: SectionNames): string {
		return this.accordionService.getCardClass(this, section);
	}

	private accordionValidation() {
		this.accordionService.isSectionContainInvalidControls(this, this, SECTION_NAMES.jobDetails);
		this.accordionService.isSectionContainInvalidControls(this, this, SECTION_NAMES.approverDetails);
		this.accordionService.isSectionContainInvalidControls(this, this, SECTION_NAMES.otherDetails);
		this.accordionService.isSectionContainInvalidControls(this, this, SECTION_NAMES.commentDetails);
		this.accordionService.isSectionContainInvalidControls(this, this, SECTION_NAMES.documentUploads);
		this.cdr.markForCheck();
	}

	public onChangeStartDate(value: Date | null) {
		if (value) {
			this.startDate = new Date(value);
		} else {
			this.startDate = value;
		}
		const sectorId = this.liRequestForm.value.sectorName
			? parseInt(this.liRequestForm.controls['sectorName'].value?.Value)
			: this.sectorId;
		if (sectorId && this.sectorDetails.IsChargeHasEffectiveDate) {
			this.resetCostAccountingCodeList();
			this.getCostAccountingCodeList(sectorId, this.startDate);
		}
	}

	public onChangeStartDateNoLaterThan(value: Date | null) {
		if (value) {
			this.startDateNoLaterThan = new Date(value);
		} else {
			this.startDateNoLaterThan = value;
		}
	}

	public handleTotalContractors(total: number) {
		this.totalContractors = total;
	}

	public handleTotalEstimatedCostContractors(total: number) {
		this.totalEstimatedCost = Number(total.toFixed(magicNumber.two));
		const shouldReload = this.isEditMode && (this.needToReloadApprover()
			|| (this.liRequestDetails.StatusId === Number(StatusID.Declined)));
		if (shouldReload) {
			this.isNeedToReloadLatestApprovers = false;
			this.statusBarChange = false;
		}
		this.getApprovalWidgetData();
	}

	private needToReloadApprover(): boolean {
		if (!this.isApproverReloadCheck) {
			const costMatches = this.totalEstimatedCost == this.liRequestDetails.EstimatedCost;
			if (costMatches || this.isApproverEstimatedCostMatchedCheck) {
				this.isApproverEstimatedCostMatchedCheck = true;
				if (!costMatches) {
					this.isApproverReloadCheck = true;
					return true;
				}
				return false;
			}
			return false;
		}
		return true;
	}

	// to handle approver in edit case on change of requesting manager & reason for request
	private callApproverConfiguration(fieldToCheck: string) {
		if (this.isEditMode && !this.nonEditableField) {
			let ukeyValue, controlValue;
			switch (fieldToCheck) {
				case 'manager':
					ukeyValue = this.liRequestDetails.RequestingManagerId;
					controlValue = parseInt(this.liRequestForm.controls['primaryManager'].value?.Value);
					break;
				case 'reason':
					ukeyValue = this.liRequestDetails.ReasonForRequestId;
					controlValue = parseInt(this.liRequestForm.controls['reasonforRequest'].value?.Value);
					break;
				default:
					return;
			}

			if (ukeyValue !== controlValue) {
				this.isNeedToReloadLatestApprovers = false;
			}
		}
	}

	public getContractorFormData(formData: FormGroup) {
		this.contractorFormData = formData;
		this.liRequestForm.addControl('contractor', formData);
	}

	public getContractorData(data: IRequestPositionDetail[]) {
		this.contractorData = data;
	}

	public onContractorGridChange() {
		this.widgetChangeDetected = true;
	}

	private resetContractorData() {
		if (!this.isEditMode) {
			this.contractorData = [];
			this.contractor.resetGrid();
		}
	}

	public getUdfData(data: IUdfData) {
		this.udfData = data.data;
		const udfFormGroup: FormGroup = data.formGroup;
		this.liRequestForm.setControl('udf', udfFormGroup);
	}

	public getUDFLength(isUDFLength: boolean) {
		this.hasUDFLength = isUDFLength;
	}

	public onGridChange() {
		this.widgetChangeDetected = true;
	}

	public getDMSLength(isDMSLength: boolean) {
		this.hasDMSLength = isDMSLength;
	}

	public getBenefitAdderData(data: IBenefitData[]) {
		this.benefitAdderList = data;
		const benefitAdderUpdateDto: BenefitAddUpdateDto[] = data.map((item: IBenefitData) =>
			({
				ReqLibraryBenefitAdderId: item.ReqLibraryBenefitAdderId,
				Value: item.Value
			}));
		this.liRequestForm.get('BenefitAdder')?.setValue(benefitAdderUpdateDto);
	}

	public cancelForm() {
		this.toasterService.resetToaster();
		if (this.route.url.includes('global-search')) {
			this.route.navigate(['/xrm/landing/global-search/list']);
		} else {
			this.route.navigate(['/xrm/job-order/light-industrial/list']);
		}
	}

	private clearAllTimeouts() {
		if (this.timeoutIds.length > Number(magicNumber.zero)) {
			this.timeoutIds.forEach((timeoutId) => {
				clearTimeout(timeoutId);
			});
			this.timeoutIds = [];
		}
	}

	ngOnDestroy(): void {
		this.lightIndustrialPopupService.resetErrorToaster();
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.clearAllTimeouts();
		if (!this.isSuccessToast)
			this.toasterService.resetToaster();
	}

}

