import { OTRateTypeValue, OTRateValue } from './../../../master/rate-configuration/constant/rate-configuration.enum';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Renderer2, ViewChild, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { AssingmentDetailsService } from '../service/assingmentDetails.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, ReplaySubject, Subject, Subscription, debounceTime, forkJoin, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DayInfo } from '../service/dayInfo';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UsersService } from '@xrm-master/user/service/users.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { AssignmentDetailsDataService } from '../service/assingmentDetailsData.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { navigationUrls } from '../constants/const-routes';
import { AssignmentRevision, assignmentSchedulePayload, AssignmentShiftDetail, BenefitAdder, ComplianceDetail, IAssignmentDetails, IAssignmentPONumber, IBooleanOptionField, ICommonHeaderForm, IDay, IDropdownItems, IDynamicLabel, IExpenseEntry, INumberOptionField, IPatchedFormValue, onboardingData, ratePayload, reqChanges, RequestDetail, SegmentData, shiftPopup, StatusData, udfAssignmentData, UdfData, weekDays, WorkAttributes, workLocationConfiguration } from '../interfaces/interface';
import { ApproverEnum, ApproverValueEnum, OrganizationLevelEnum, OrganizationLevelValueEnum, RevisionStatus } from '../constants/enum';
import { DatePipe } from '@angular/common';
import { OnboardingRequirementsComponent } from '@xrm-shared/common-components/onboarding-requirements/onboarding-requirements.component';
import { ActionRequest, ApprovalFormEvent } from '@xrm-master/role/Generictype.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AssignmentPoNumber, IControlDates, ISchedule, ITerminationReason, IValidationMessages, SectorCostCenterConfigData, selectedDropdownItem } from '../interfaces/editAssignmentInterface';
import { ShiftDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { OrganizationDetail } from '@xrm-master/user/interface/user';
import { assignmentCostAccountingCode } from '../model/assignment.model';
import { SelectEvent } from '@progress/kendo-angular-layout/tabstrip/events/select-event';
import { RoleGroup } from '@xrm-master/user/enum/enums';
import { timeAndExpenseEffectiveDateControl, validateAndSyncStartDate } from './assignment_validation_file';
import { DateConversationService } from '../service/date_conversation.service';
@Component({
	selector: 'app-edit',
	templateUrl: './edit.component.html',
	styleUrls: ['./edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {

  @ViewChild('dms', { static: false }) dmsImplementation: DmsImplementationComponent;
  @ViewChild('mainWindow') elementRef: ElementRef;
  @ViewChild('onboarding', { static: false }) onboardingRequirements: OnboardingRequirementsComponent;
  public EditAssingmentForm: FormGroup;
  public commonHeaderForm: FormGroup;
  public isEditMode: boolean = true;
  public entityID = XrmEntities.Assingments;
  public userGroupId: number = magicNumber.three;
  public uploadStageId: number;
  public actionTypeId: number = ActionType.Edit;
  public processingId: number = magicNumber.five;
  public isRevisionMode: boolean = false;
  public isRevisionVisible: boolean = false;
  public showApproverWidget: boolean = true;
  private assignmentUkey: string;
  public assignmentRevisionFields: IDropdownItems[];
  public approvalConfigWidgetObj: ActionRequest;
  public assignmentDetails: IAssignmentDetails;
  public daysInfo: DayInfo[] = [];
  private shiftDataById: any = [];
  private weekDaysArray: boolean[] | undefined;
  private lastSelectedDays: IDay[];
  public hasDMSLength: boolean = false;
  public locationAdress: string = '';
  public orgLevel1List: IDropdownItems[] = [];
  public orgLevel2List: IDropdownItems[] = [];
  public orgLevel3List: IDropdownItems[] = [];
  public orgLevel4List: IDropdownItems[] = [];
  public workLocationList: IDropdownItems[] = [];
  public hireCodeList: IDropdownItems[] = [];
  public laborCategoryList: IDropdownItems[] = [];
  public jobCategoryList: IDropdownItems[] = [];
  public securityClearanceList: IDropdownItems[] = [];
  public shiftList: IDropdownItems[] = [];
  public terminationReasonList: IDropdownItems[] = [];
  private staffingAgencyList: string;
  public requestingManagerList: IDropdownItems[] = [];
  public poOwnerList: IDropdownItems[] = [];
  public hourDistributionList: IDropdownItems[] = [];
  public restMealBreakList: IDropdownItems[] = [];
  public dynamicLabelName: IDynamicLabel[] = [
  	{ Text: 'Sector', Value: 'Sector', isVisible: true, IsMandatory: true },
  	{ Text: OrganizationLevelEnum.One, Value: OrganizationLevelValueEnum.One, isVisible: true, IsMandatory: true },
  	{ Text: OrganizationLevelEnum.Two, Value: OrganizationLevelValueEnum.Two, isVisible: true, IsMandatory: true },
  	{ Text: OrganizationLevelEnum.Three, Value: OrganizationLevelValueEnum.Three, isVisible: true, IsMandatory: true },
  	{ Text: OrganizationLevelEnum.Four, Value: OrganizationLevelValueEnum.Four, isVisible: true, IsMandatory: true },
  	{ Text: ApproverEnum.One, Value: ApproverValueEnum.One, isVisible: true, IsMandatory: true },
  	{ Text: ApproverEnum.Two, Value: ApproverValueEnum.Two, isVisible: true, IsMandatory: true }
  ];
  public poGrid: IAssignmentPONumber[] = [];
  public costCenterConfiguration: SegmentData[] | SectorCostCenterConfigData;
  public benefitAdderGrid: BenefitAdder[] = [];
  public costCenterGrid: SegmentData[] = [];
  public onboardingData: ComplianceDetail;
  public isPendingResultSection: boolean = false;
  public isDrugScreen: boolean = true;
  public isAssignmentTerminated: boolean = false;
  public isBackgroundCheck: boolean = true;
  public udfData: UdfData[] = [];
  public modifyPO: IBooleanOptionField[] = [
  	{ Text: 'Yes', Value: true },
  	{ Text: 'No', Value: false }
  ];

  public levelDNR: INumberOptionField[] = [
  	{ Text: 'Client', Value: magicNumber.twoHundredSeventySeven },
  	{ Text: 'Sector', Value: magicNumber.twoHundredSeventyEight }
  ];

  public terminationAssignment: IBooleanOptionField[] = [
  	{ Text: 'Yes', Value: true },
  	{ Text: 'No', Value: false }
  ];

  public currentStaffingAgency: INumberOptionField = { Text: 'CurrentStaffingAgencyWithName', Value: magicNumber.twoHundredEightyTwo };

  public choosestaffing: INumberOptionField[] = [
  	this.currentStaffingAgency,
  	{ Text: 'AllPrefStaffAgencies', Value: magicNumber.twoHundredEightyThree },
  	{ Text: 'SelectedStaffAgencies', Value: magicNumber.twoHundredEightyFour }
  ];

  public choosestaffingClient: INumberOptionField[] = [
  	this.currentStaffingAgency,
  	{ Text: 'AllPrefStaffAgencies', Value: magicNumber.twoHundredEightyThree }
  ];

  public modifyPORadioGroup: IBooleanOptionField[] = [
  	{ Text: 'Yes', Value: true },
  	{ Text: 'No', Value: false }
  ];

  public poRadioGroup: INumberOptionField[] = [
  	{ Text: 'CurrentPO', Value: magicNumber.twoHundredSeventyNine },
  	{ Text: 'NewPO', Value: magicNumber.twoHundredEighty },
  	{ Text: 'DoNotAdjust', Value: magicNumber.twoHundredEightyOne }
  ];

  public otHoursBilledAtRadioGroup: IDropdownItems[] = [];
  public currencyCode: string | null;
  public countryId: string | null;
  public startDateVal: number;
  private endDateVal: number;
  public endDateChanged: boolean = false;
  public statusData: StatusData = {
  	items: []
  };

  public unitType: string;
  public isControlRevision: WorkAttributes = {
  	WorkLocationId: false,
  	LaborCategoryId: false,
  	JobCategoryId: false,
  	AssignmentStartDate: false,
  	AssignmentEndDate: false,
  	ShiftId: false,
  	ModifyPOEndDate: false,
  	BaseWageRate: false,
  	ActualSTWageRate: false,
  	OTWageRate: false,
  	DTWageRate: false,
  	StaffingAgencyMarkup: false,
  	OTRateTypeId: false,
  	STBillRate: false,
  	OTBillRate: false,
  	StaffingAgencySTBillRate: false,
  	StaffingAgencyOTBillRate: false,
  	StaffingAgencyDTBillRate: false,
  	ModifyPObasedOnRevisedRates: false,
  	TerminateAssignment: false,
  	AddedToDNR: false,
  	BackFillRequested: false,
  	BackFillStartDate: false,
  	BackFillEndDate: false,
  	NotifyToStaffingAgency: false,
  	DTBillRate: false,
  	NewPOFundAmount: false,
  	NewPONumber: false,
  	PoEffectiveFromDate: false,
  	TerminateReasonId: false,
  	restMealBreak: false,
  	poFundAmount: '',
  	shiftWorkingDays: false
  };
  public isRevision: boolean;
  private clpDays: string[] = [];
  public estimatedCostChange: number;
  private currencySymbol: string | null;
  private locationVal: IDropdownItems | string;
  private lcValue: IDropdownItems;
  public terminationVisibleField: ITerminationReason;
  public hourDistributionEffectiveDateList: IDropdownItems[];
  public restBreakEffectiveDateList: IDropdownItems[];
  public patchedFormValue: IPatchedFormValue = {};
  private myFormValues: FormGroup;
  public expenseStartDate: Date | string;
  public expenseEndDate: Date | string;
  private expenseEntryData: IExpenseEntry;
  private isSelectedYes: boolean = false;
  public IsRevisionPending: boolean = false;
  public roleGroupId: string | null;
  public tenureEndDate: Date | string;
  public startDateChanged: boolean = false;
  public showRevisionRateDate: boolean = false;
  private approverWidgetForm: ApprovalFormEvent;
  public revisionFields: string[] = [];
  private formControlFielsList: string[];
  private allRateControls: string[] = ["BaseWageRate", "OTRateTypeId", "ActualSTWageRate", "StaffingAgencyMarkup", "STBillRate", "OTWageRate", "DTWageRate", "OTBillRate", "DTBillRate", "StaffingAgencySTBillRate", "StaffingAgencyOTBillRate", "StaffingAgencyDTBillRate"];
  private isRevisionSucceeded: boolean = false;
  private revisionObject: AssignmentRevision = { index: 0, assignmentId: '', revisionId: '' };
  private shiftWorkingDaysChanged: boolean = false;
  private lastPoEffectiveDate: string;
  private ukey: string;
  public LIRequestData: RequestDetail;
  private timeEntryDate: Date | null;
  private estimatedCostApprover: string | number | null;
  public poEffectiveFromDateList: IDropdownItems[];
  private destroyAllSubscribtion$ = new Subject<void>();
  private navigationUrlCancel: string = navigationUrls.list;
  private magicNumber = magicNumber;
  public timeRange = {
  	labelLocalizeParam1: [],
  	labelLocalizeParam2: [],
  	label1: 'Start Time',
  	label2: 'End Time',
  	DefaultInterval: 0,
  	AllowAI: false,
  	startisRequired: true,
  	endisRequired: true,
  	starttooltipVisible: true,
  	starttooltipTitle: 'string',
  	starttooltipPosition: 'string',
  	starttooltipTitleLocalizeParam: [],
  	startlabelLocalizeParam: [],
  	startisHtmlContent: true,
  	endtooltipVisible: true,
  	endtooltipTitle: 'string',
  	endtooltipPosition: 'string',
  	endtooltipTitleLocalizeParam: [],
  	endlabelLocalizeParam: [],
  	endisHtmlContent: true
  };
  public isInitialStartDatePresent: boolean = false;
  private isfutureRevisedRateEffectiveDateExist: boolean = false;
  public showBackfill: boolean = true;
  private tenureValidationMessage: string;
  public isTenureValid: boolean;


  // eslint-disable-next-line max-lines-per-function, max-params
  constructor(
    private assingmentDetailsService: AssingmentDetailsService, private fb: FormBuilder, private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UsersService,
    public toasterService: ToasterService,
    public localizationService: LocalizationService, public customValidators: CustomValidators,
    private shiftService: ShiftGatewayService, private cd: ChangeDetectorRef,
    public assignmentDetailsDataService: AssignmentDetailsDataService,
    private eventlog: EventLogService,
    public udfCommonMethods: UdfCommonMethods,
    private renderer: Renderer2,
    private dialogPopupService: DialogPopupService,
    private dateConvert: DateConversationService,
    private menuService: MenuService,
    private datePipe: DatePipe
  ) {
  	this.initializedDataOnConstructor();
  }

  ngOnInit(): void {
  	this.toasterService.resetToaster();
  	this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.AssignmentRevision);
  	this.authListener();
  	this.assingmentDetailsService.resetRevisionPageIndex();
  	this.assingmentDetailsService.navigationUrlRevision.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: AssignmentRevision) => {
  		this.revisionObject = data;
  	});
  	this.assingmentDetailsService.navigationUrlCancel.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
  		if (data?.url?.length > magicNumber.zero) {
  			this.navigationUrlCancel = data?.url;
  		}
  	});

  	this.getRevisionFields();
  	this.onAdjustPOAmountChange();
  	this.ukey = this.activatedRoute.snapshot.params['id'];
  	this.assignmentUkey = this.ukey;
  	this.getAssignmentDetails(this.ukey);
  	this.checkRevisionUpdate('WorkLocationId');
  	this.getPoFundAmountValueChange();
  	this.assignmentDetailsDataService.isRevision.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((dt: boolean) => {
  		this.isRevision = dt;
  	});
  }

  private authListener() {
  	this.menuService.authorizedActions.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((authorizedActions) => {
  		if (authorizedActions) {
  			const revisionAction = authorizedActions.find((data) =>
  				data.EntityId === Number(XrmEntities.AssignmentRevision));
  			if (revisionAction) {
  				this.isRevisionVisible = revisionAction.EntityActions.length > Number(magicNumber.zero);
  			}
  		}
  	});
  }

  private initializedDataOnConstructor() {
  	this.countryId = sessionStorage.getItem('CountryId');
  	this.currencySymbol = sessionStorage.getItem('Country');
  	this.currencySymbol = JSON.parse(String(this.currencySymbol))[0].CurrencySymbol;
  	this.currencyCode = this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId);
  	this.commonHeaderForm = this.fb.group<ICommonHeaderForm>({
  		status: [null]
  	});
  	this.roleGroupId = sessionStorage.getItem('RoleGroupId');
  	if (this.roleGroupId == RoleGroup.MSP || this.roleGroupId == RoleGroup.StaffingAgency) {
  		this.uploadStageId = Number(magicNumber.zero);
  	} else {
  		this.uploadStageId = DocumentUploadStage.CLP;
  	}

  	this.EditAssingmentForm = this.assignmentDetailsDataService.editAssignmentFormControl();
  	if (this.roleGroupId == RoleGroup.StaffingAgency) {
  		this.removeValidators(['requestingManager', 'primaryManager', 'hourDistributionEffectiveDate', 'restBreakEffectiveDate']);
  	}
  	this.getUserType();
  }

  private removeValidators(controls: string[]) {
  	for (const control of controls) {
  		const formControl = this.EditAssingmentForm.get(control);
  		if (formControl) {
  			formControl.setValidators(null);
  			formControl.updateValueAndValidity();
  		}
  	}
  }

  private getUserType() {
  	this.userGroupId = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
  }


  public revisionProcess(revisionStatus: string) {
  	if (this.getRevisionStatus(revisionStatus)) {
  		this.getAssignmentDetails(this.ukey);
  	}
  }

  private getRevisionStatus(revisionStatus: string) {
  	if (revisionStatus == String(RevisionStatus.One) || revisionStatus == String(RevisionStatus.Two) ||
      revisionStatus == String(RevisionStatus.Three) || revisionStatus == String(RevisionStatus.Four)) {
  		return true;
  	} else {
  		return false;
  	}
  }

  public getRevisionTab() {
  	return this.revisionObject;
  }

  private checkRevisionUpdate(controlName: string) {
  	this.EditAssingmentForm.controls[controlName].valueChanges.
  		pipe(debounceTime(magicNumber.oneThousandTwentyFour), takeUntil(this.destroyAllSubscribtion$)).subscribe((dt: selectedDropdownItem) => {
  			if (dt && dt.Value && controlName == 'WorkLocationId') {
  				this.onWorkLocationChange(String(dt.Value));
  			}
  		});
  }

  public getTenureLimit(controlName: string) {
  	const startDate = this.EditAssingmentForm.get('AssignmentStartDate')?.value,
  		endDate = this.EditAssingmentForm.get('AssignmentEndDate')?.value,
  		tenureValidation = this.getTenureValidation(startDate, endDate, controlName);

  	this.assingmentDetailsService.getTenureValidation(tenureValidation, controlName)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((res: GenericResponseBase<null>) => {
  			this.isTenureValid = res.Succeeded;

  			if (!res.Succeeded) {
  				this.handleError(controlName, res.Message);
  			}
  		});
  }

  private handleError(controlName: string, message: string) {
  	const control = this.EditAssingmentForm.get(controlName),
  		errorMessage = this.getErrorMessage(controlName, message);

  	if (control) {
  		control.setErrors({
  			error: true,
  			message: errorMessage
  		});

  		control.markAsDirty();
  		control.markAsTouched();
  		this.cd.markForCheck();
  		this.emitClick();
  		this.cd.detectChanges();
  	}
  }

  private getErrorMessage(controlName: string, message: string): string {
  	const dynamicParams: DynamicParam[] = [];

  	if (controlName === 'AssignmentStartDate') {
  		if (this.assignmentDetails.PreviousAssignmentEndDate) {
  			dynamicParams.push({
  				Value: this.dateConvert.convertDateToSpecificFormat(this.assignmentDetails.PreviousAssignmentEndDate, 'YYYY-MM-DD') ?? '',
  				IsLocalizeKey: false
  			});
  		}
  	} else if (controlName === 'AssignmentEndDate') {
  		if (this.assignmentDetails.NextAssignmentStartDate) {
  			dynamicParams.push({
  				Value: this.dateConvert.convertDateToSpecificFormat(this.assignmentDetails.NextAssignmentStartDate, 'YYYY-MM-DD') ?? '',
  				IsLocalizeKey: false
  			});
  		}
  	}

  	return this.localizationService.GetLocalizeMessage(message, dynamicParams);
  }

  private emitClick(): void {
  	if (this.elementRef) {
  		this.elementRef.nativeElement.dispatchEvent(new MouseEvent('click', {
  			bubbles: true,
  			cancelable: true,
  			view: window
  		}));
  	}
  }

  public offcanvasHidden() {
  	this.eventlog.recordId.next(this.assignmentDetails.Id);
  	this.eventlog.entityId.next(XrmEntities.Assingments);
  }

  private getUnitType() {
  	let unitType = this.assignmentDetails.UnitTypeName;
  	unitType = unitType == 'Hour'
  		? 'Hr'
  		: unitType;
  	this.unitType = unitType;
  }

  public hasDMSLengthFn(e: boolean) {
  	this.hasDMSLength = e;
  }

  private getBenefitAdderValue() {
  	this.benefitAdderGrid = this.assignmentDetails.BenefitAdders ?? [];
  	this.benefitAdderGrid = this.benefitAdderGrid.map((benefitAdder: BenefitAdder) => {
  		benefitAdder.Value = Number(benefitAdder.Value).toFixed(magicNumber.two);
  		return benefitAdder;
  	});
  }


  private getAssignmentDetails(ukey: string): void {
  	this.assingmentDetailsService.getAssingmentDetailsByUkey(ukey)
  		.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<IAssignmentDetails>) => {
  			if (data.Data && data.Succeeded) {
  				this.processAssignmentDetails(data.Data);
  			}
  		});
  }

  private processAssignmentDetails(details: IAssignmentDetails): void {
  	this.assignmentDetails = details;
  	const staffingAgencyName: DynamicParam[] = [{ Value: this.assignmentDetails.StaffingAgencyName, IsLocalizeKey: false }];
  	this.currentStaffingAgency.Text = this.localizationService.GetLocalizeMessage('CurrentStaffingAgencyWithName', staffingAgencyName);
  	this.clpDays.push(this.assignmentDetails.AssignmentShiftDetails[0].CLPWorkingDays);
  	this.IsRevisionPending = this.assignmentDetails.IsRevisionPending;
  	this.isBackgroundCheck = this.assignmentDetails.IsBackgroundChecksRequired;
  	this.isDrugScreen = this.assignmentDetails.IsDrugScreenRequired;
  	this.EditAssingmentForm.get('IsDrugScreenRequired')?.setValue(this.isDrugScreen);
  	this.EditAssingmentForm.get('IsBackgroundChecksRequired')?.setValue(this.isBackgroundCheck);
  	this.getUnitType();
  	this.getStatusBarData();
  	this.updateEventLog();
  	this.assignmentDetails.AssignmentCostAccountingCodes.forEach((x: assignmentCostAccountingCode) => {
  		x.isTempSaved = false;
  		x.EffectiveFrom = this.localizationService.TransformDate(x.EffectiveFrom);
  		x.EffectiveTo = this.localizationService.TransformDate(x.EffectiveTo);
  	});
  	this.checkSecurityClearanceValidation();
  	this.getBenefitAdderValue();
  	this.poGrid = this.assignmentDetails.AssignmentPoNumbers ?? [];
  	this.poGrid.forEach((x: AssignmentPoNumber) => {
  		x.PoEffectiveFrom = x.PoEffectiveFrom
  			? this.dateConvert.getFormattedDateIntoString(x.PoEffectiveFrom)
  			: '';
  		x.PoEffectiveTo = x.PoEffectiveTo
  			? this.dateConvert.getFormattedDateIntoString(x.PoEffectiveTo)
  			: '';
  		if (this.poGrid[this.poGrid.length - Number(magicNumber.one)]) {
  			this.lastPoEffectiveDate = x.PoEffectiveFrom;
  		}
  	});
  	this.handleDropdownAndOrgLevelConfigs();
  	if (this.assignmentDetails.TenureCompleted)
  		this.EditAssingmentForm.disable();
  }

  private handleDropdownAndOrgLevelConfigs(): void {
  	if (this.assignmentDetails) {
  		this.fetchAllDropdowns(this.assignmentDetails.SectorId).pipe(
  			switchMap((data1) => {
  				if (data1 !== null) {
  					// ToDo : Delete this if conditon
  					if (this.hourDistributionEffectiveDateList.length == Number(magicNumber.zero)) {
  						this.hourDistributionEffectiveDateList.push({
  							Text: this.localizationService.TransformDate(this.assignmentDetails.HourDistributionRuleEffectiveDate),
  							Value: this.localizationService.TransformDate(this.assignmentDetails.HourDistributionRuleEffectiveDate)
  						});
  					}
  					this.restBreakEffectiveDateList = this.hourDistributionEffectiveDateList;
  					this.getJobCategoryByLabourCategory(this.assignmentDetails.LaborCategoryId, this.assignmentDetails.WorkLocationId);
  					this.patchValueInForm();
  					this.handleTimeExpenseValidation('AssignmentStartDate');
  					this.handleTimeExpenseValidation('AssignmentEndDate');
  					return this.userService.getSectorOrgLevelConfigs(this.assignmentDetails.SectorId);
  				}
  				return [];
  			}),
  			takeUntil(this.destroyAllSubscribtion$)
  		).subscribe((data2) => {
  			if (data2) {
  				this.getDynamicOrgLevelLabel(data2);
  			}
  		});
  	}
  }


  private getDynamicOrgLevelLabel(data: GenericResponseBase<OrganizationDetail[]>) {
  	if (data.Data && data.Data.length > Number(magicNumber.zero)) {
  		data.Data.forEach((element: OrganizationDetail, index: number) => {
  			const dynamicLabel = this.dynamicLabelName.find((x: IDynamicLabel) =>
  				x.Text === `OrganizationLevel${index + this.magicNumber.one}`);

  			if (dynamicLabel) {
  				dynamicLabel.Value = element.LocalizedKey;
  				dynamicLabel.isVisible = element.IsVisible;
  				dynamicLabel.IsMandatory = element.IsMandatory;

  				const messageOrg = `${this.localizationService.GetLocalizeMessage('PleaseSelect')} ${this.localizationService.GetLocalizeMessage(element.LocalizedKey)}.`;

  				if (dynamicLabel.IsMandatory) {
  					const controlName = `orgLevel${index + this.magicNumber.one}`,
  						control = this.EditAssingmentForm.controls[controlName];

  					if (control) {
  						control.setValidators([this.customValidators.RequiredValidator(messageOrg)]);
  						control.updateValueAndValidity();
  					}
  				}
  			}
  		});
  	}
  }


  private getRevisionFields() {
  	this.formControlFielsList = Object.keys(this.EditAssingmentForm.controls);
  	this.assingmentDetailsService.getAssignmentRevisionFields()
  		.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<IDropdownItems[]>) => {
  			if (data.Data && data.Succeeded) {
  				this.assignmentRevisionFields = data.Data;
  				this.assignmentRevisionFields.forEach((dt: IDropdownItems) => {
  					this.revisionFields.push(String(dt.Text));
  					if (dt.Text && dt.IsSelected && this.formControlFielsList.includes(String(dt.Text))) {
  						this.isControlRevision[dt.Text] = dt.IsSelected;
  					}
  				});
  				this.cd.markForCheck();
  			}
  		});
  }

  private getStatusBarData() {
  	const roleGroupId: string | null = window.sessionStorage.getItem('RoleGroupId');
  	this.statusData.items = this.assignmentDetailsDataService.StatusHeader(this.assignmentDetails);

  	if (roleGroupId == String(magicNumber.four)) {
  		this.statusData.items = this.statusData.items.filter((dt) =>
  			dt.title !== 'Staffing Agency');
  	}
  	if (this.assignmentDetails.IsRevisionPending) {
  		this.statusData.items.push({
  			title: 'Revision Status',
  			titleDynamicParam: [],
  			item: 'Revision Under Progress',
  			itemDynamicParam: [],
  			cssClass: [''],
  			isLinkable: false,
  			link: '',
  			linkParams: ''
  		});
  	}
  }

  private updateEventLog() {
  	this.eventlog.recordId.next(this.assignmentDetails.Id);
  	this.eventlog.entityId.next(XrmEntities.Assingments);
  	this.eventlog.isUpdated.next(true);
  }

  private checkSecurityClearanceValidation() {
  	if (this.assignmentDetails.AssignmentTypeId != magicNumber.eightyFour) {
  		this.EditAssingmentForm.controls['securityClerance'].setValidators(this.customValidators.RequiredValidator('PleaseSelectSecurityClearance'));
  		this.EditAssingmentForm.controls['securityClerance'].updateValueAndValidity();
  	}
  }

  private getTransformDate(data: IDropdownItems[]) {
  	data.map((dt: IDropdownItems) => {
  		dt.Text = this.localizationService.TransformDate(dt.Text);
  		dt.Value = dt.Text;
  		return dt;
  	});

  	return data;
  }

  private controlValidationOnLoad(dropdownData: IDropdownItems[], control: string) {

  	const isReadOnly = this.assignmentDetailsDataService.isReadOnly(control, this.assignmentDetails.LoggedInUserRoleGroupID),
  		isFieldVisible = this.assignmentDetailsDataService.isFieldVisible(control, this.assignmentDetails.LoggedInUserRoleGroupID);

  	if (isReadOnly || !isFieldVisible) {
  		this.EditAssingmentForm.controls[control].clearValidators();
  		this.EditAssingmentForm.controls[control].updateValueAndValidity();
  		return;
  	}
  	if (dropdownData.length == magicNumber.zero) {
  		this.EditAssingmentForm.controls[control].setValue(null);
  		return;
  	}
  	// eslint-disable-next-line one-var
  	const optionExist = dropdownData.some((el: IDropdownItems) => {
  		if (el.Value == this.EditAssingmentForm.controls[control].value?.Value) {
  			this.EditAssingmentForm.controls[control].setValue({ Text: el.Text, Value: el.Value?.toString() });
  			return true;
  		}
  		if ((control == 'restBreakEffectiveDate' || control == 'hourDistributionEffectiveDate') &&
        el.Value == this.EditAssingmentForm.controls[control].value?.Value
  		) {
  			return true;
  		}
  		return false;
  	});
  	if (!optionExist) {
  		// if need to remove restBreakEffectiveDate & hourDistributionEffectiveDate date based on start date then remove only below if condition
  		if(control != 'restBreakEffectiveDate' && control != 'hourDistributionEffectiveDate')
  		this.EditAssingmentForm.controls[control].setValue(null);
  	}
  }

  private controlValidationPrimaryMngr(dropdownData: IDropdownItems[], control: string) {
  	if (dropdownData.length == Number(magicNumber.zero)) {
  		this.EditAssingmentForm.controls[control].setValue(null);
  		return;
  	}

  	const optionExist = dropdownData.some((el: IDropdownItems) => {
  		if (this.assignmentDetails.PrimaryManagerId && (el.Value == this.EditAssingmentForm.controls[control].value?.Value)) {
  			return true;
  		}
  		return false;
  	});

  	if (!optionExist || this.assignmentDetails.PrimaryManagerId == null) {
  		this.EditAssingmentForm.controls[control].setValue(null);
  	} else {
  		this.EditAssingmentForm.controls[control].setValue({
  			Text: this.assignmentDetails.PrimaryManagerName,
  			Value: this.assignmentDetails.PrimaryManagerId.toString()
  		});
  	}

  	if (this.assignmentDetails.IsMultipleTimeApprovalNeeded) {
  		this.EditAssingmentForm.controls[control].setValue({ Text: "Multiple", Value: "Multiple" });
  	}

  }

  private patchValueInForm(): void {
  	const date = new Date(),
  		startTime = new Date(`${date.toDateString()} ${this.assignmentDetails.AssignmentShiftDetails[0]?.StartTime ??
        this.assignmentDetails.AssignmentShiftDetails
  		}`),
  		endTime = new Date(`${date.toDateString()} ${this.assignmentDetails.AssignmentShiftDetails[0]?.EndTime ??
        this.assignmentDetails.AssignmentShiftDetails
  		}`);
  	this.EditAssingmentForm.controls['startTimeControlName'].patchValue(startTime);
  	this.EditAssingmentForm.controls['endTimeControlName'].patchValue(endTime);

  	this.daysInfo = this.assingmentDetailsService.generateDaysInfo(this.assignmentDetails.AssignmentShiftDetails[0] ??
      this.assignmentDetails.AssignmentShiftDetails);
  	this.shiftDataById = this.assignmentDetails.AssignmentShiftDetails[0] ?? this.assignmentDetails.AssignmentShiftDetails;
  	this.weekDaysArray = this.formatWeekData(this.shiftDataById);
  	this.EditAssingmentForm.patchValue(this.assignmentDetailsDataService.assignmentFormMapper(this.assignmentDetails));
  	this.EditAssingmentForm.updateValueAndValidity();
  	this.getApprovalWidgetData();
  	this.getApprovalWidgetData();
  	this.patchHourDistribution();
  	this.patchMealBreak();
  	this.myFormValues = this.EditAssingmentForm.value;
  	this.getPatchedTransformedData(this.EditAssingmentForm);
  	this.getTenureLimit('AssignmentStartDate');
  	this.getTenureLimit('AssignmentEndDate');
  	this.controlValidationOnLoad(this.workLocationList, 'WorkLocationId');
  	this.controlValidationOnLoad(this.shiftList, 'ShiftId');
  	this.controlValidationOnLoad(this.laborCategoryList, 'LaborCategoryId');
  	this.controlValidationOnLoad(this.requestingManagerList, 'requestingManager');
  	this.controlValidationPrimaryMngr(this.requestingManagerList, 'primaryManager');
  	this.controlValidationOnLoad(this.hourDistributionEffectiveDateList, 'hourDistributionEffectiveDate');
  	this.controlValidationOnLoad(this.hourDistributionList, 'hourDistribution');
  	this.controlValidationOnLoad(this.restBreakEffectiveDateList, 'restBreakEffectiveDate');
  	this.controlValidationOnLoad(this.requestingManagerList, 'requestingManager');
  	this.controlValidationOnLoad(this.orgLevel1List, 'orgLevel1');
  	this.controlValidationOnLoad(this.orgLevel2List, 'orgLevel2');
  	this.controlValidationOnLoad(this.orgLevel3List, 'orgLevel3');
  	this.controlValidationOnLoad(this.orgLevel4List, 'orgLevel4');

  	if ((!this.IsRevisionPending && !this.EditAssingmentForm.controls['WorkLocationId'].value) || this.assignmentDetails.LoggedInUserRoleGroupID != magicNumber.two) {
  		this.EditAssingmentForm.get('WorkLocationId')?.setValue({ Text: this.assignmentDetails.WorkLocationName, Value: this.assignmentDetails.WorkLocationId.toString() });
  	}

  	this.EditAssingmentForm.get('hourDistributionEffectiveDate')?.disable();
  	this.EditAssingmentForm.get('restBreakEffectiveDate')?.disable();
  }

  private patchMealBreak() {
  	if (this.assignmentDetails.AssignmentMealBreakConfigurations.length > Number(magicNumber.zero))
  		this.EditAssingmentForm.patchValue({
  			restMealBreak: {
  				Text: this.assignmentDetails.AssignmentMealBreakConfigurations[0]?.MealBreakConfigurationName,
  				Value: this.assignmentDetails.AssignmentMealBreakConfigurations[0]?.MealBreakConfigurationId?.toString()
  			}
  		});


  	this.EditAssingmentForm.patchValue({
  		restBreakEffectiveDate: this.assignmentDetails.MealBreakConfigurationEffectiveDate
  			? {
  				Text: this.localizationService.TransformDate(this.assignmentDetails.MealBreakConfigurationEffectiveDate),
  				Value: this.localizationService.TransformDate(this.assignmentDetails.MealBreakConfigurationEffectiveDate)
  			}
  			: null
  	});
  }

  private patchHourDistribution() {
  	if (this.assignmentDetails.AssignmentHourDistributionRules.length > Number(magicNumber.zero))
  		this.EditAssingmentForm.patchValue({
  			hourDistribution: {
  				Text: this.assignmentDetails.AssignmentHourDistributionRules[0]?.HourDistributionRuleName,
  				Value: this.assignmentDetails.AssignmentHourDistributionRules[0]?.HourDistributionRuleId?.toString()
  			}
  		});


  	this.EditAssingmentForm.patchValue({
  		hourDistributionEffectiveDate: this.assignmentDetails.HourDistributionRuleEffectiveDate
  			? {
  				Text: this.localizationService.TransformDate(this.assignmentDetails.HourDistributionRuleEffectiveDate),
  				Value: this.localizationService.TransformDate(this.assignmentDetails.HourDistributionRuleEffectiveDate)
  			}
  			: null
  	});
  }

  private getPatchedTransformedData(form: FormGroup) {
  	Object.keys(form.controls).forEach((controlName: string) => {
  		const control = form.get(controlName);
  		if (control) {
  			this.patchedFormValue[controlName] = control.value;
  		}
  	});
  }


  private getJobCategoryByLabourCategory(labourCategoryId: number, locationId: number): void {
  	this.assingmentDetailsService.getJobCategory(locationId, labourCategoryId)
  		.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<IDropdownItems[]>) => {
  			if (data.Data && data.Succeeded) {
  				this.jobCategoryList = data.Data;
  				this.controlValidationOnLoad(this.jobCategoryList, 'JobCategoryId');
  			}
  		});
  }

  private onWorkLocationChange(data: string | IDropdownItems): void {
  	const locationId = this.EditAssingmentForm.controls['WorkLocationId'].value?.Value;
  	if (data) {

  		this.assingmentDetailsService.getWorkAddress(data).
  			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data1: GenericResponseBase<workLocationConfiguration>) => {
  				if (data1.Data) {
  					this.locationAdress = data1.Data.LocationAddress;
  					this.cd.detectChanges();
  				}
  			});

  		this.assingmentDetailsService.getLaborCategory(locationId)
  			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((dt: GenericResponseBase<IDropdownItems[]>) => {
  				if (dt.Data) {
  					this.laborCategoryList = dt.Data;
  				}
  			});
  	}
  }

  private onAdjustPOAmountChange(): void {
  	this.EditAssingmentForm.get('adjustPoNumber')?.valueChanges.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
  		if (!this.EditAssingmentForm.get('adjustPoNumber')?.value) {
  			this.EditAssingmentForm.get('poAdjustmentType')?.setValue(null);
  			this.EditAssingmentForm.get('NewPONumber')?.setValue(null);
  			this.EditAssingmentForm.get('poEffectiveFromDate')?.setValue(null);
  			this.EditAssingmentForm.get('poEffectiveToDate')?.setValue(null);
  			this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  		}
  	});
  }

  private fetchAllDropdowns(sectorId: number): Observable<void> {
  	const resultSubject = new ReplaySubject(undefined);
  	forkJoin(this.dropdownApiService(sectorId))
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((data) => {
  			this.orgLevel1List = data[0].Data;
  			this.orgLevel2List = data[1].Data;
  			this.orgLevel3List = data[2].Data;
  			this.orgLevel4List = data[3].Data;
  			this.workLocationList = data[4].Data;
  			this.hireCodeList = data[5].Data;
  			this.laborCategoryList = data[6].Data;
  			this.securityClearanceList = data[7].Data;
  			this.shiftList = data[8].Data;
  			this.terminationReasonList = data[9].Data;
  			this.requestingManagerList = data[10].Data;
  			this.poOwnerList = data[11].Data;
  			this.costCenterGrid = data[12].Data;
  			this.hourDistributionList = data[13].Data;
  			this.restMealBreakList = data[14].Data;
  			this.otHoursBilledAtRadioGroup = data[15].Data;
  			this.costCenterConfiguration = data[16].Data;
  			this.hourDistributionEffectiveDateList = this.getTransformDate(data[18]?.Data);
  			this.poEffectiveFromDateList = this.hourDistributionEffectiveDateList;

  			if (data[19].Data.AssignmentStartDateMaxDate || data[19].Data.AssignmentEndDateMinDate) {
  				this.expenseStartDate = this.dateConvert.getFormattedDate(data[19].Data.AssignmentStartDateMaxDate);
  				this.expenseEndDate = this.dateConvert.getFormattedDate(data[19].Data.AssignmentEndDateMinDate);
  			}

  			if (data[19].Data.TimeLatestWeekendingDate) {
  				this.timeEntryDate = this.dateConvert.getFormattedDate(data[19].Data.TimeMaxWeekendingDate);
  			}

  			resultSubject.next(magicNumber.one);
  		});
  	return resultSubject as Observable<void>;
  }

  private dropdownApiService(sectorId: string | number) {
  	return [
  		this.assingmentDetailsService.getOrgLevel1(sectorId),
  		this.assingmentDetailsService.getOrgLevel2(sectorId),
  		this.assingmentDetailsService.getOrgLevel3(sectorId),
  		this.assingmentDetailsService.getOrgLevel4(sectorId),
  		this.assingmentDetailsService.getLocations(sectorId),
  		this.assingmentDetailsService.getHireCode('HireCode'),
  		this.assingmentDetailsService.getLaborCategory(this.assignmentDetails.WorkLocationId),
  		this.assingmentDetailsService.getSecurityClearance(),
  		this.assingmentDetailsService.getShiftByLocation(sectorId, this.assignmentDetails.WorkLocationId),
  		this.assingmentDetailsService.getTerminationReasonAssgnmtType(sectorId, this.assignmentDetails.AssignmentTypeId),
  		this.assingmentDetailsService.getRequestingManager(sectorId),
  		this.assingmentDetailsService.getPOOWner(sectorId),
  		this.assingmentDetailsService.getCostCenterDetails(sectorId),
  		this.assingmentDetailsService.getHourDistribution(this.assignmentDetails.WorkLocationId),
  		this.assingmentDetailsService.getRestMealBreak(this.assignmentDetails.WorkLocationId),
  		this.assingmentDetailsService.getStaticDataType('OvertimeHoursBilledAt'),
  		this.assingmentDetailsService.getGetSectorCostCenterConfigsValue(sectorId),
  		this.assingmentDetailsService.getOnBoardingData(this.entityID, this.assignmentDetails.Id),
  		this.assingmentDetailsService
  			.assignmentWeekendingDaysList(sectorId, this.assignmentDetails.AssignmentStartDate, this.assignmentDetails.AssignmentEndDate),
  		this.assingmentDetailsService.assignmentWeekendingDay(this.assignmentDetails.Id)
  	];

  }


  public gridChangeDocument() {
  	this.EditAssingmentForm.markAsDirty();
  }

  public isReadOnly(controlName: string) {
  	return this.assignmentDetailsDataService.isReadOnly(controlName, this.assignmentDetails?.LoggedInUserRoleGroupID);
  }

  public isFieldVisible(controlName: string) {
  	return this.assignmentDetailsDataService.isFieldVisible(controlName, this.assignmentDetails?.LoggedInUserRoleGroupID);
  }

  public updateCostAccountingCodeManually(data: SegmentData[] | assignmentCostAccountingCode[]) {
  	this.assignmentDetails.AssignmentCostAccountingCodes = (data as assignmentCostAccountingCode[]);
  }

  public getWeekData(e: ISchedule) {
  	this.clpDays = [];
  	this.lastSelectedDays = e.day;
  	const data = e,
  		startTime = this.formatTime(e.time.startTime),
  		endTime = this.formatTime(e.time.endTime);
  	// Iterate through the 'day' array in the data and update this.daysInfo
  	data.day.forEach((dayData) => {
  		const dayInfo = this.daysInfo.find((info) =>
  			info.day === dayData.day);
  		if (dayInfo) {
  			dayInfo.isSelected = dayData.isSelected;
  			if (dayInfo.isSelected) {
  				this.clpDays.push(dayInfo.day.substring(magicNumber.zero, magicNumber.three));
  				this.EditAssingmentForm.controls['ShiftId'].setErrors(null);
  				this.toasterService.resetToaster();
  			};
  		}
  	});

  	this.shiftDataById = [
  		{
  			"ShiftId": this.EditAssingmentForm.get('ShiftId')?.value.Value ?? this.EditAssingmentForm.get('ShiftId')?.value,
  			"CLPWorkingDays": `${this.clpDays.toString()}`,
  			"StartTime": startTime,
  			"EndTime": endTime,
  			"Sun": e.day[0].isSelected,
  			"Mon": e.day[1].isSelected,
  			"Tue": e.day[2].isSelected,
  			"Wed": e.day[3].isSelected,
  			"Thu": e.day[4].isSelected,
  			"Fri": e.day[5].isSelected,
  			"Sat": e.day[6].isSelected
  		}
  	];


  	this.weekDaysArray = this.formatWeekData(this.shiftDataById[0]);
  	if (this.EditAssingmentForm.get('ModifyPOEndDate')?.value) this.getPOApprovedAmount(true);

  	if (JSON.stringify(this.updatedShiftData(e, startTime, endTime)) !== JSON.stringify(this.prevShiftData())) {
  		this.shiftWorkingDaysChanged = true;
  		this.isControlRevision.shiftWorkingDays = true;
  		this.isControlRevision.ShiftId = true;
  	} else {
  		this.isControlRevision.ShiftId = false;
  		this.isControlRevision.shiftWorkingDays = false;
  		this.shiftWorkingDaysChanged = false;
  	}

  }

  private updatedShiftData(days: any, startTime: any, endTime: any) {
  	return {
  		"StartTime": startTime,
  		"EndTime": endTime,
  		"Sun": days.day[0].isSelected,
  		"Mon": days.day[1].isSelected,
  		"Tue": days.day[2].isSelected,
  		"Wed": days.day[3].isSelected,
  		"Thu": days.day[4].isSelected,
  		"Fri": days.day[5].isSelected,
  		"Sat": days.day[6].isSelected
  	};
  }

  private prevShiftData() {
  	return {
  		"StartTime": this.assignmentDetails.AssignmentShiftDetails[0].StartTime,
  		"EndTime": this.assignmentDetails.AssignmentShiftDetails[0].EndTime,
  		"Sun": this.assignmentDetails.AssignmentShiftDetails[0].Sun,
  		"Mon": this.assignmentDetails.AssignmentShiftDetails[0].Mon,
  		"Tue": this.assignmentDetails.AssignmentShiftDetails[0].Tue,
  		"Wed": this.assignmentDetails.AssignmentShiftDetails[0].Wed,
  		"Thu": this.assignmentDetails.AssignmentShiftDetails[0].Thu,
  		"Fri": this.assignmentDetails.AssignmentShiftDetails[0].Fri,
  		"Sat": this.assignmentDetails.AssignmentShiftDetails[0].Sat
  	};
  }

  private formatTime(timeValue: string): string {
  	const timeDate = new Date(timeValue),
  		hours = timeDate.getHours().toString().padStart(magicNumber.two, '0'),
  		minutes = timeDate.getMinutes().toString().padStart(magicNumber.two, '0'),
  		seconds = timeDate.getSeconds().toString().padStart(magicNumber.two, '0');

  	return `${hours}:${minutes}:${seconds}`;
  }

  private formatWeekData(weekDaysArray: weekDays): boolean[] | undefined {
  	if (weekDaysArray) {
  		return [
  			weekDaysArray.Sun,
  			weekDaysArray.Mon,
  			weekDaysArray.Tue,
  			weekDaysArray.Wed,
  			weekDaysArray.Thu,
  			weekDaysArray.Fri,
  			weekDaysArray.Sat
  		];
  	}
  	return undefined;
  }

  public getStatus(e: DayInfo[]) {
  	if (e) {
  		if (this.isEditMode) {
  			this.daysInfo = this.assingmentDetailsService.generateDaysInfo(this.assignmentDetails.AssignmentShiftDetails[0]);
  		} else {
  			this.daysInfo = this.assingmentDetailsService.generateDaysInfo(this.shiftDataById);
  		}
  		const date = new Date(),
  			startTime = new Date(`${date.toDateString()} ${this.shiftDataById[0].StartTime}`),
  			endTime = new Date(`${date.toDateString()} ${this.shiftDataById[0].EndTime}`);
  		this.EditAssingmentForm.controls['startTimeControlName'].patchValue(startTime);
  		this.EditAssingmentForm.controls['endTimeControlName'].patchValue(endTime);
  	}
  }

  private getShiftListByLocation(sectorId: number, location: number | string | IDropdownItems) {
  	this.assingmentDetailsService.getShiftByLocation(sectorId, (location as string | number))
  		.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((dt: GenericResponseBase<IDropdownItems[]>) => {
  			if (dt.Data) {
  				this.shiftList = dt.Data;
  			}
  		});
  }

  private getMealBreakByLocation(location: IDropdownItems): void {
  	this.restMealBreakList = [];

  	if (!location) return;

  	const locationId = location.Value != null
  		? String(location.Value)
  		: String(location);

  	this.assingmentDetailsService.getRestMealBreak(locationId)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((response: GenericResponseBase<IDropdownItems[]>) => {
  			const { Data } = response;
  			if (Data?.length) {
  				this.restMealBreakList = Data;
  				const [firstMealBreak] = this.restMealBreakList;
  				this.EditAssingmentForm.controls['restMealBreak'].setValue({
  					Text: firstMealBreak.Text,
  					Value: firstMealBreak.Value
  				});
  			}
  		});
  }


  private getHourDistributionByLocation(location: IDropdownItems): void {
  	this.hourDistributionList = [];

  	if (!location) return;

  	const locationId = location.Value != null ?
  		String(location.Value) :
  		String(location);

  	this.assingmentDetailsService.getHourDistribution(locationId)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((response: GenericResponseBase<IDropdownItems[]>) => {
  			const { Data } = response;

  			if (Data?.length) {
  				this.hourDistributionList = Data;

  				const currentHDRId = this.assignmentDetails.AssignmentHourDistributionRules[0]?.HourDistributionRuleId?.toString(),
  					hasSameHDR = this.hourDistributionList.some((rule: IDropdownItems) =>
  						rule.Value === currentHDRId);

  				this.EditAssingmentForm.controls['hourDistribution'].setValue(hasSameHDR
  					? {
  						Text: this.assignmentDetails.AssignmentHourDistributionRules[0]?.HourDistributionRuleName,
  						Value: currentHDRId
  					}
  					: null);
  			}
  		});
  }


  public onShiftChange(val: IDropdownItems) {
  	if (val === undefined) {
  		this.shiftDataById = [
  			{
  				"StartTime": "00:00:00",
  				"EndTime": "00:00:00",
  				"Sun": false,
  				"Mon": false,
  				"Tue": false,
  				"Wed": false,
  				"Thu": false,
  				"Fri": false,
  				"Sat": false,
  				"ShiftDifferentialMethod": "Other",
  				"AdderOrMultiplierValue": magicNumber.zero
  			}
  		];
  	}
  	this.getshiftDetailsById(val);
  }

  private getshiftDetailsById(val: IDropdownItems) {
  	if (val.Value == this.assignmentDetails.AssignmentShiftDetails[0].ShiftId) {
  		this.shiftDataById = this.assignmentDetails.AssignmentShiftDetails[0];
  		this.daysInfo = this.assingmentDetailsService.generateDaysInfo(this.assignmentDetails.AssignmentShiftDetails[0]);
  		this.updateTimeControls(
  			this.assignmentDetails.AssignmentShiftDetails[0].StartTime,
  			this.assignmentDetails.AssignmentShiftDetails[0].EndTime
  		);
  	} else {
  		this.clpDays = [];
  		this.shiftService.getshiftDetailsData(Number(val.Value)).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
  			next: (data: GenericResponseBase<ShiftDetails>) => {
  				if (data.Succeeded) {
  					this.shiftDataById = data.Data;
  					this.weekDaysArray = this.formatWeekData(this.shiftDataById);
  					this.updateTimeControls(this.shiftDataById.StartTime, this.shiftDataById.EndTime);
  					this.daysInfo = this.assingmentDetailsService.generateDaysInfo(this.shiftDataById);
  					this.daysInfo.forEach((dt: DayInfo) => {
  						if (dt.isSelected) this.clpDays.push(dt.day.substring(magicNumber.zero, magicNumber.three));
  					});
  					if (this.endDateChanged) this.getPOApprovedAmount(true);
  					if (this.isSelectedYes) this.getRequisitionData();
  				} else {
  					this.shiftDataById = null;
  				}
  				this.cd.markForCheck();
  				this.cd.detectChanges();
  			}
  		});
  	}
  }

  private updateTimeControls(startTime: string, endTime: string) {
  	const date = new Date(),
  		startDateTime = new Date(`${date.toDateString()} ${startTime}`),
  		endDateTime = new Date(`${date.toDateString()} ${endTime}`);
  	this.EditAssingmentForm.controls['startTimeControlName'].patchValue(startDateTime);
  	this.EditAssingmentForm.controls['endTimeControlName'].patchValue(endDateTime);
  }


  public navigate(): void {
  	if (this.router.url.includes('global-search')) {
  		this.router.navigate([navigationUrls.globalSearchList]);
  	}
  	else if (this.navigationUrlCancel) {
  		this.router.navigate([this.navigationUrlCancel]);
  	}
  	else {
  		this.router.navigate([navigationUrls.list]);
  	}
  }

  public getRightPanelConfiguration() {
  	return this.assingmentDetailsService.openRightPanel.value;
  }

  public openRightSidePanel(type: string) {
  	if (type === 'LI') {
  		this.assingmentDetailsService.openRightPanel.next({ status: true, type: type, ukey: this.assignmentDetails.RequestUKey });
  		this.assingmentDetailsService.getLiRequestData(this.assignmentDetails.RequestUKey)
  			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<RequestDetail>) => {
  				if (res.Data && res.Succeeded) {
  					this.LIRequestData = res.Data;
  				}
  				this.cd.markForCheck();
  			});
  	} else if (type === 'Submittal') {
  		this.assingmentDetailsService.openRightPanel.next({ status: true, type: type, ukey: this.assignmentDetails.RequestUKey });
  	}
  }

  public closeOpenPanel() {
  	this.assingmentDetailsService.openRightPanel.next({ status: false, type: '', ukey: '' });
  }


  public moreDetails() {
  	this.assingmentDetailsService.navigateBackUrl.next('');
  	if (this.assingmentDetailsService.openRightPanel.value.type == 'LI') {
  		this.renderer.setStyle(document.body, 'overflow', 'visible');
  		this.renderer.setStyle(document.body, 'padding-right', '0');
  		this.router.navigate([`${navigationUrls.jobOrderView}/${this.assingmentDetailsService.openRightPanel.value.ukey}`]);
  		this.assingmentDetailsService.navigateBackUrl.next(`${navigationUrls.edit}/${this.assignmentDetails.UKey}`);
  	}

  }


  // Rate Details Changes Starts Here.......
  private calCulateRate(controlName: string, baseWageRate: number | null) {
  	const jobCategoryVal = this.EditAssingmentForm.get('JobCategoryId')?.value,
  		shiftVal = this.EditAssingmentForm.get('ShiftId')?.value,
  		submittedMarkup = this.EditAssingmentForm.get('StaffingAgencyMarkup')?.value;
  	if (jobCategoryVal && shiftVal && submittedMarkup) {
  		if (this.EditAssingmentForm.get(controlName)?.valid) {
  			const payLoad: ratePayload = {
  				assignmentId: this.assignmentDetails.Id,
  				laborCategoryId: Number(this.EditAssingmentForm.get('LaborCategoryId')?.value?.Value),
  				jobCategoryId: Number(this.EditAssingmentForm.get('JobCategoryId')?.value?.Value),
  				shiftId: Number(this.EditAssingmentForm.get('ShiftId')?.value?.Value),

  				overtimeHoursBilledAt: Number(this.EditAssingmentForm.get('OTRateTypeId')?.value),
  				submittedMarkup: this.EditAssingmentForm.get('StaffingAgencyMarkup')?.value,
  				baseWageRate: baseWageRate,
  				actualSTWageRate: this.EditAssingmentForm.get('ActualSTWageRate')?.value,
  				stBillRate: this.EditAssingmentForm.get('STBillRate')?.value

  			};
  			if (controlName == 'BaseWageRate') {
  				payLoad.actualSTWageRate = null;
  				payLoad.stBillRate = null;
  				this.changeRateFields(payLoad, controlName);
  			}
  			else if (controlName == 'ActualSTWageRate') {
  				payLoad.baseWageRate = null;
  				payLoad.stBillRate = null;
  				this.changeRateFields(payLoad, controlName);
  			}
  			else if (controlName == 'STBillRate') {
  				payLoad.actualSTWageRate = null;
  				this.changeRateFields(payLoad, controlName);
  			}
  			else if (controlName == 'StaffingAgencyMarkup') {
  				payLoad.stBillRate = null;
  				if (payLoad.baseWageRate) {
  					this.changeRateFields(payLoad, controlName);
  				}
  			}
  			else if (controlName == 'OTRateTypeId') {
  				payLoad.stBillRate = null;
  				if (payLoad.baseWageRate || payLoad.actualSTWageRate) {
  					this.changeRateFields(payLoad, controlName);
  				}
  			}
  		}
  	}
  }

  private updateControlStatusAndValidity(controlName: string, validationMessage: string, showValidation: boolean = true): void {
  	const control = this.EditAssingmentForm.controls[controlName];
  	control.setValidators(this.customValidators.RequiredValidator(validationMessage));
  	control.updateValueAndValidity({ emitEvent: false });
  	control.updateValueAndValidity();
  }


  private changeRateFields(payLoad: ratePayload, controlName: string) {
  	this.assingmentDetailsService.calculateRateByAssignment(payLoad).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
  		if (data.Succeeded) {
  			this.showRevisionRateDate = true;
  			this.getApprovalWidgetData();
  			this.updateControlStatusAndValidity('revisedRatedate', 'PleaseSelectRevisedRateEffectiveDate');
  			this.updateControlStatusAndValidity('ModifyPObasedOnRevisedRates', 'PleaseSelectModifyPOApprovedAmountBasedOnRevisedRates');

  			if (controlName == 'STBillRate' || this.EditAssingmentForm.get('STBillRate')?.value != data.Data?.StBillRate) {
  				this.EditAssingmentForm.get('STBillRate')?.setValue(data.Data?.StBillRate);
  				this.getPOApprovedAmount(false);
  			}
  			this.rateRevisionWarningFields(controlName);
  			this.EditAssingmentForm.patchValue({
  				ActualSTWageRate: data.Data?.ActualStWageRate,
  				BaseWageRate: data.Data?.BaseWageRate,
  				DTBillRate: data.Data?.DtBillRate,
  				DTWageRate: data.Data?.DtWageRate,
  				OTBillRate: data.Data?.OtBillRate,
  				OTWageRate: data.Data?.OtWageRate,
  				STBillRate: data.Data?.StBillRate,
  				StaffingAgencyDTBillRate: data.Data?.StaffingAgencyDtBillRate,
  				StaffingAgencyOTBillRate: data.Data?.StaffingAgencyOtBillRate,
  				StaffingAgencySTBillRate: data.Data?.StaffingAgencyStBillRate,
  				oTMultiper: data.Data?.OtMultiplier,
  				dTMultiper: data.Data?.DtMultiplier
  			});

  			this.allRateControls.forEach((ctrl: string) => {
  				const controlValue = this.EditAssingmentForm.get(ctrl)?.value,
  					assignmentDetailValue = this.assignmentDetails.AssignmentRates[ctrl as keyof typeof this.assignmentDetails.AssignmentRates]
              ?? this.assignmentDetails[ctrl as keyof IAssignmentDetails];

  				if (controlValue == assignmentDetailValue) {
  					this.isControlRevision[ctrl] = false;
  				}
  			});

  			if (this.EditAssingmentForm.get('ShiftId')?.value.Value == this.assignmentDetails.AssignmentShiftDetails[0].ShiftId) {
  				this.isControlRevision.ShiftId = false;
  			}
  			this.toasterService.resetToaster();
  			this.emitClick();
  		} else {
  			this.toasterService.showToaster(ToastOptions.Error, String(data.Message));
  		};
  	});
  }
  // Rate Details Changes Ends Here.......

  public getLocalizationValue(key: string) {
  	return this.localizationService.GetLocalizeMessage(key);
  }

  public getHeaderStatus() {
  	return this.assignmentDetails?.StatusName;
  }

  public getRecordAssignmentCode() {
  	return this.assignmentDetails
  		? this.assignmentDetails.AssignmentCode
  		: '';
  }

  public getAssingmentTitle() {
  	return this.assignmentDetails?.ContractorName;
  }

  public getLocationId() {
  	return this.assignmentDetails?.WorkLocationId;
  }

  public getRecordId() {
  	return this.assignmentDetails?.Id;
  }

  public udfDataGet(data: udfAssignmentData) {
  	this.udfData = data.data;
  	this.assignmentDetails.udfData = this.udfData;
  	this.EditAssingmentForm.addControl('udf', data.formGroup);
  }

  public getOnboardingData(data: onboardingData) {
  	this.onboardingData = data.data;
  	this.assignmentDetails.complianceDetail = data.data;
  	this.EditAssingmentForm.addControl('onboarding', data.formGroup);
  }

  private poAdjustData(): boolean {
  	if ((this.EditAssingmentForm.get('ModifyPObasedOnRevisedRates')?.value || this.EditAssingmentForm.get('ModifyPOEndDate')?.value) || this.EditAssingmentForm.get('NewPOFundAmount')?.value || this.EditAssingmentForm.get('poFundAmount')?.value) {
  		return true;
  	} else {
  		return false;
  	}
  }

  private validateShiftDetailsAndApprover(assignmentDetails: AssignmentShiftDetail,
  	toasterService: ToasterService, approverWidgetForm: ApprovalFormEvent
  ) {
  	const shiftData = assignmentDetails;

  	if (shiftData?.CLPWorkingDays?.length == Number(magicNumber.zero)) {
  		toasterService.showToaster(ToastOptions.Error, 'ShiftDayValidationMsg');
  		this.EditAssingmentForm.controls['ShiftId'].setErrors({ incorrect: true });
  		return false;
  	} else {
  		this.EditAssingmentForm.controls['ShiftId'].setErrors(null);
  		this.addValidation("ShiftId", "SelectShift");
  	}

  	if (approverWidgetForm && !approverWidgetForm.approvalForm.valid) {
  		approverWidgetForm.approvalForm.markAllAsTouched();
  		return false;
  	}
  	return true;
  }

  private isDropdownValid(control: string): boolean {
  	if (this.EditAssingmentForm.get(control)?.value?.Text == null && !this.assignmentDetails.IsMultipleTimeApprovalNeeded) {
  		this.EditAssingmentForm.controls[control].setValue(null);
  		this.EditAssingmentForm.markAllAsTouched();
  		return true;
  	} else {
  		return false;
  	}
  }

  private handleInactiveRecord() {
  	const workLocationControl = this.EditAssingmentForm.get('WorkLocationId')?.value,
  		laborCategoryControl = this.EditAssingmentForm.get('LaborCategoryId')?.value,
  		jobCategoryControl = this.EditAssingmentForm.get('JobCategoryId')?.value;
  	if (!workLocationControl) {
  		this.EditAssingmentForm.get('WorkLocationId')?.setValue({ Text: this.assignmentDetails.WorkLocationName, Value: this.assignmentDetails.WorkLocationId });
  	}

  	if (!laborCategoryControl) {
  		this.EditAssingmentForm.get('LaborCategoryId')?.setValue({ Text: this.assignmentDetails.LaborCategoryName, Value: this.assignmentDetails.LaborCategoryId });
  	}

  	if (!jobCategoryControl) {
  		this.EditAssingmentForm.get('JobCategoryId')?.setValue({ Text: this.assignmentDetails.JobCategoryName, Value: this.assignmentDetails.JobCategoryId });
  	}

  	if (!this.shiftDataById.assignmentShiftDetailId) {
  		this.shiftDataById.assignmentShiftDetailId = this.assignmentDetails.AssignmentShiftDetails[0]?.ShiftId;
  	}
  }

  private handleChangeRateEffectiveDate() {
  	const revisedRateControl = new Date(this.EditAssingmentForm.get('revisedRatedate')?.value ?? this.assignmentDetails.AssignmentRates?.RateEffectiveDateFrom),
  		futureRevisedRateEffectiveDate = new Date(this.assignmentDetails.RevisedRateEffectiveDate);
  	if (revisedRateControl.getTime() < futureRevisedRateEffectiveDate.getTime()) {
  		this.isfutureRevisedRateEffectiveDateExist = true;
  	}
  	else
  		this.isfutureRevisedRateEffectiveDateExist = false;
  }

  private updateFormValidation(): void {
  	Object.keys(this.EditAssingmentForm.controls).forEach((controlName) => {
  		const control = this.EditAssingmentForm.get(controlName);
  		if (control) {
  			control.markAsTouched();
  			control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  		}
  	});
  	this.EditAssingmentForm.markAllAsTouched();
  	this.EditAssingmentForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  	this.cd.markForCheck();
  	this.cd.detectChanges();
  	this.emitClick();
  }

  private initializeShiftData(): void {
  	this.shiftDataById.assignmentShiftDetailId = this.EditAssingmentForm.get('ShiftId')?.value?.Value
      ?? this.EditAssingmentForm.get('ShiftId')?.value;
  	this.assignmentDetails.shiftDataById = this.shiftDataById[0] ?? this.shiftDataById.assignmentShiftDetailId;
  }

  private checkRevisionPending(): void {
  	const isRevisionPending = this.assignmentDetails.IsRevisionPending ||
      this.assignmentDetails.LoggedInUserRoleGroupID !== magicNumber.two;
  	if (isRevisionPending) {
  		this.handleInactiveRecord();
  	}
  }

  private validateShiftApprover(): boolean {
  	const isValidShiftApprover = this.validateShiftDetailsAndApprover(
  		this.assignmentDetails.shiftDataById,
  		this.toasterService,
  		this.approverWidgetForm
  	);
  	return isValidShiftApprover;
  }

  private validateBackgroundChecks(): boolean {
  	const bgItemToastValidationMsg = 'BackgroundChecksRequiredValidationMessageAssignment';
  	if (this.onboardingRequirements) {
  		return this.onboardingRequirements.validateBackgroundCheckItemsRequired(bgItemToastValidationMsg);
  	}
  	return true;
  }

  private applyRevisedRateDateValidation(): void {
  	const control = this.EditAssingmentForm.get('revisedRatedate');
  	if (control) {
  		control.setValidators(this.customValidators.RequiredValidator('PleaseSelectRevisedRateEffectiveDate'));
  		control.updateValueAndValidity();
  	}
  }

  private processAssignmentUpdate(): void {
  	const assignmentData = this.assignmentDetailsDataService.prepareDataForAssignmentUpdate(this.EditAssingmentForm, this.assignmentDetails);
  	this.assignmentDataForUpdate(assignmentData);

  	if (this.isfutureRevisedRateEffectiveDateExist) {
  		this.showFutureRevisedRateError();
  		return;
  	}

  	this.assingmentDetailsService.updateAssignmentDetails(assignmentData)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((data: GenericResponseBase<string>) => {
  			if (data.Succeeded) {
  				this.handleAssignmentSuccess(data);
  			} else {
  				this.toasterService.showToaster(
  					ToastOptions.Error,
  					this.localizationService.GetLocalizeMessage(data.Message)
  				);
  			}
  		});
  }

  private showFutureRevisedRateError(): void {
  	const futureRevisedRateEffectiveDate = new Date(this.assignmentDetails.RevisedRateEffectiveDate),
  	 transformDate = this.localizationService.TransformDate(futureRevisedRateEffectiveDate),
  	 dynamicParam = [{ Value: transformDate, IsLocalizeKey: true }];
  	this.toasterService.showToaster(ToastOptions.Error, `SubmissionRevisionRequest`, dynamicParam);
  }

  private handleAssignmentSuccess(data: GenericResponseBase<string>): void {
  	const dynamicParam1 = [{ Value: this.assignmentDetails.AssignmentCode, IsLocalizeKey: true }],
  	 successMessage = data.Data
  		? { messageKey: 'RevisionCreatedSuccessfully', params: [{ Value: data.Data, IsLocalizeKey: true }, ...dynamicParam1] }
  		: { messageKey: 'AssignmentDetailsSavedSuccessfully', params: dynamicParam1 };

  	// eslint-disable-next-line no-implicit-coercion
  	this.isRevisionSucceeded = !!data.Data;
  	this.router.navigate([navigationUrls.list]);
  	this.toasterService.showToaster(ToastOptions.Success, successMessage.messageKey, successMessage.params);
  }

  public isRateModified(): boolean {
  	const rateFields = [
  		'ActualSTWageRate',
  		'BaseWageRate',
  		'OTWageRate',
  		'DTWageRate',
  		'StaffingAgencyMarkup',
  		'OTBillRate',
  		'STBillRate',
  		'DTBillRate',
  		'StaffingAgencySTBillRate',
  		'StaffingAgencyOTBillRate',
  		'StaffingAgencyDTBillRate',
  		'OTRateValue'
  	];

  	return rateFields.some((field) =>
  		this.assignmentDetails.AssignmentRates?.[field] !== this.EditAssingmentForm.get(field)?.value
  	);
  }


  private assignmentDataForUpdate(assignmentData: any) {
  	assignmentData.dmsFieldRecords = this.dmsImplementation.prepareAndEmitFormData();
  	assignmentData.udfFieldRecords = this.udfData;
  	assignmentData.shiftChanged = this.isControlRevision.ShiftId || this.isControlRevision.shiftWorkingDays;
  	assignmentData.poAdjust = this.poAdjustData();
  	assignmentData.approvalDetails = this.approverWidgetForm?.data ?? [];
  	assignmentData.rateModified = this.isRateModified();
  	assignmentData.revisedEndDate = this.isControlRevision.AssignmentEndDate;
  	if (this.staffingAgencyList) {
  		assignmentData.staffingAgencyList = this.staffingAgencyList;
  	}
  	assignmentData.assignmentShiftDetail = this.shiftDataById[0] ?? this.shiftDataById;
  }

  public submitForm(): void {
  	this.updateFormValidation();
  	if (this.EditAssingmentForm.invalid)
  		return;

  	this.initializeShiftData();
  	this.checkRevisionPending();
  	if (!this.validateShiftApprover() || !this.validateBackgroundChecks()) return;

  	if (this.showRevisionRateDate) {
  		this.applyRevisedRateDateValidation();
  	}

  	if (this.EditAssingmentForm.valid) {
  		this.processAssignmentUpdate();
  	} else {
  		this.updateFormValidation();
  	}
  }


  public startDateChange(e: { date: Date; control: IControlDates; key: IValidationMessages }): void {
  	validateAndSyncStartDate(this, e);
  }


  public checkInitialGoLiveStartDateFormat(): boolean {
  	const initialGoLiveDate = this.assignmentDetails.InitialGoLiveDate;
  	if (!initialGoLiveDate) {
  		return false;
  	}
  	// eslint-disable-next-line one-var
  	const initialStartDate = new Date(initialGoLiveDate),
  		assignmentStartDate = new Date(this.EditAssingmentForm.controls['AssignmentStartDate'].value);

  	if (assignmentStartDate.getTime() < initialStartDate.getTime()) {
  		const dynamicParam: DynamicParam[] = [{ Value: this.localizationService.TransformDate(initialStartDate), IsLocalizeKey: true }],
  			errorMessage = this.localizationService.GetLocalizeMessage('DateSelectedEarlierThanInitialGoLiveDate', dynamicParam);
  		this.EditAssingmentForm.controls['AssignmentStartDate'].setErrors({ message: errorMessage });
  		this.isInitialStartDatePresent = true;
  		return true;
  	}
  	return false;
  }

  private handleTimeExpenseValidation(controlName: string) {
  	if (controlName === 'AssignmentStartDate' || controlName === 'AssignmentEndDate') {
  		const controlVal = new Date(this.EditAssingmentForm.get(controlName)?.value).getTime();

  		let compareDate: Date,
  			dynamicParam: DynamicParam[],
  			validationMessage: string;

  		if (controlName === 'AssignmentStartDate') {
  			compareDate = this.expenseStartDate as Date;
  			dynamicParam = [{ Value: this.localizationService.TransformDate(this.expenseStartDate), IsLocalizeKey: true }];
  			validationMessage = 'StartDateTimeExpenseValidation';
  		} else {
  			compareDate = this.expenseEndDate as Date;
  			dynamicParam = [{ Value: this.localizationService.TransformDate(this.expenseEndDate), IsLocalizeKey: true }];
  			validationMessage = 'EndDateTimeExpenseValidation';
  		}

  		if (controlName === 'AssignmentStartDate' && controlVal > compareDate?.getTime()) {
  			this.EditAssingmentForm.controls[controlName].
  				setValidators(this.assignmentDetailsDataService.
  					DateStringValidator(
  						controlVal, compareDate.getTime(),
  						this.localizationService.GetLocalizeMessage(validationMessage, dynamicParam)
  					));
  			this.EditAssingmentForm.controls[controlName].updateValueAndValidity();
  		}
  		if (controlName === 'AssignmentEndDate' && controlVal < compareDate?.getTime()) {
  			this.EditAssingmentForm.controls[controlName].
  				setValidators(this.assignmentDetailsDataService.
  					DateStringValidator(
  						controlVal, compareDate.getTime(),
  						this.localizationService.GetLocalizeMessage(validationMessage, dynamicParam)
  					));
  			this.EditAssingmentForm.controls[controlName].updateValueAndValidity();
  		}
  	}
  }


  public backfillStartDateChange(e: { e: Date, control: IControlDates, key: IValidationMessages }) {
  	const control1Val = new Date(this.EditAssingmentForm.get(e.control.control1)?.value).getTime(),
  		control2Val = new Date(this.EditAssingmentForm.get(e.control.control2)?.value).getTime(),
  		AssgnmtEndDate = new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).getTime(),
  		transformAssgnmtEndDate = this.localizationService.TransformDate(this.EditAssingmentForm.get('AssignmentEndDate')?.value),
  		transformBackfillStartDate = this.localizationService.TransformDate(this.EditAssingmentForm.get(e.control.control1)?.value);

  	this.startDateVal = control1Val;
  	if (e == null || e == undefined) {
  		this.EditAssingmentForm.controls[e['control']['control1']]
  			.setValidators(this.customValidators.RequiredValidator(e['key']['key1']));
  		this.EditAssingmentForm.controls[e['control']['control1']].updateValueAndValidity();
  		return;
  	}

  	if (control1Val > control2Val) {
  		this.EditAssingmentForm.controls[e.control.control1].
  			setValidators(this.assignmentDetailsDataService.DateStringValidator(control1Val, control2Val, e.key.key2));
  		this.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
  	}
  	else if ((control1Val < AssgnmtEndDate) || (transformAssgnmtEndDate == transformBackfillStartDate)) {
  		this.EditAssingmentForm.controls[e.control.control1].setErrors({
  			message: 'BackfillStartDateShouldLessThanEqualToAssignmentTerminatedEndDate'
  		});
  	}
  	else {
  		this.EditAssingmentForm.controls[e.control.control2].clearValidators();
  		this.EditAssingmentForm.controls[e.control.control2].updateValueAndValidity();
  		this.EditAssingmentForm.controls[e.control.control1].clearValidators();
  		this.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
  	}


  }

  public endDateChange(e: { e: Date, control: IControlDates, key: IValidationMessages }): void {
  	const controlValues = this.getControlValues(e),
  		revisedRateControl = new Date(this.EditAssingmentForm.get('revisedRatedate')?.value),
  		dynamicParam: DynamicParam[] = [{ Value: this.localizationService.TransformDate(this.expenseEndDate), IsLocalizeKey: true }];

  	if (!e) {
  		this.setRequiredValidator(e);
  		return;
  	}

  	if (this.isAssignmentEndDateUnchanged()) {
  		this.resetAssignmentEndDateFields();
  		return;
  	}

  	this.handleAssignmentEndDateChange(e, controlValues);

  	this.handleTenureValidation();

  	this.handleEndDateValidation(controlValues, dynamicParam, e);

  	this.handleRevisedRateDateValidation(controlValues.control1Val, revisedRateControl);

  	this.isEndDateGreaterAssignmentEndDate();
  	this.addAdditionalValidations();
  	this.revisedRateDate(this.EditAssingmentForm.get(e.control.control1)?.value);
  }

  private getControlValues(e: { e: Date, control: IControlDates, key: IValidationMessages }) {
  	const control1Val = new Date(this.EditAssingmentForm.get(e.control.control1)?.value).getTime(),
  		control2Val = new Date(this.EditAssingmentForm.get(e.control.control2)?.value).getTime();
  	this.endDateVal = control1Val;
  	return { control1Val, control2Val };
  }

  private setRequiredValidator(e: { e: Date, control: IControlDates, key: IValidationMessages }): void {
  	this.EditAssingmentForm.controls[e.control.control1].setValidators(this.customValidators.RequiredValidator(e.key.key1));
  	this.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
  }

  private isAssignmentEndDateUnchanged(): boolean {
  	return this.localizationService.TransformDate(this.patchedFormValue['AssignmentEndDate']) ===
      this.localizationService.TransformDate(this.EditAssingmentForm.get('AssignmentEndDate')?.value);
  }

  private resetAssignmentEndDateFields(): void {
  	this.endDateChanged = false;
  	this.isControlRevision.AssignmentEndDate = false;
  	this.EditAssingmentForm.controls['ModifyPOEndDate'].setValue(null);
  	this.EditAssingmentForm.controls['TerminateAssignment'].setValue(null);
  	this.removeValidation('AssignmentEndDate');
  	this.removeValidation('ModifyPOEndDate');
  	this.removeValidation('TerminateAssignment');
  }

  private handleAssignmentEndDateChange(
  	e: { e: Date, control: IControlDates, key: IValidationMessages },
  	controlValues: { control1Val: number, control2Val: number }
  ): void {
  	if (e.control.control1 === 'AssignmentEndDate' &&
      controlValues.control1Val > controlValues.control2Val &&
      !this.isAssignmentEndDateUnchanged()) {

  		this.endDateChanged = true;
  		this.isControlRevision[e.control.control1] = true;

  		if (this.EditAssingmentForm.get('ModifyPOEndDate')?.value &&
        new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).getTime() >
        new Date(this.assignmentDetails.AssignmentEndDate).getTime()) {

  			this.getPOApprovedAmount(true);
  		} else {
  			this.getApprovalWidgetData();
  		}
  	}
  }

  private handleTenureValidation(): void {
  	if (!this.isTenureValid) {
  		this.isAssignmentTerminated = true;
  		this.EditAssingmentForm.get('BackFillRequested')?.setValue(false);
  		this.EditAssingmentForm.get('BackFillStartDate')?.setValue(null);
  		this.EditAssingmentForm.get('BackFillEndDate')?.setValue(null);
  	} else {
  		this.isAssignmentTerminated = false;
  	}
  }

  private handleRevisedRateDateValidation(control1Val: number, revisedRateControl: Date): void {
  	if (revisedRateControl.getTime() < control1Val) {
  		this.EditAssingmentForm.controls['revisedRatedate'].clearValidators();
  		this.EditAssingmentForm.controls['revisedRatedate'].updateValueAndValidity();
  	}
  }

  private addAdditionalValidations(): void {
  	this.validatePoEffectiveFromDate('PoEffectiveFromDate', 'EffectiveFromDate');
  	this.addValidationHourDistributionEffectiveDate('hourDistributionEffectiveDate', 'HourDistributionEffectiveDate');
  	this.addValidationRestMealEffectiveDate('restBreakEffectiveDate', 'RestMealEffectiveDate');
  }


  private isEndDateGreaterAssignmentEndDate() {
  	const control1Val = new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).getTime(),
  		assignmentEndDate = new Date(this.assignmentDetails.AssignmentEndDate).getTime();
  	if (control1Val > assignmentEndDate) {
  		this.showBackfill = false;
  	} else {
  		this.showBackfill = true;
  	}
  }

  public handleEndDateValidation(
  	controlVal: { control1Val: number, control2Val: number },
  	dynamicParam: DynamicParam[],
  	event: { e: Date, control: IControlDates, key: IValidationMessages }
  ) {
  	const { control1Val: endControl, control2Val: startControl } = controlVal,
  		expenseTime = (this.expenseEndDate as Date)?.getTime(),
  		controlField = this.EditAssingmentForm.controls[event.control.control1];

  	if (this.endDateChanged && endControl > startControl) {
  		this.addValidation('ModifyPOEndDate', 'PleaseSelectModifyPOApprovedAmountBasedOnNewEndDate');
  		this.addValidation('TerminateAssignment', 'PleaseSelectTerminateAssignment');
  	} else {
  		this.removeValidation('ModifyPOEndDate');
  	}

  	if (startControl > endControl) {
  		controlField.setValidators(this.assignmentDetailsDataService.DateStringValidator(startControl, endControl, event.key.key2));
  		controlField.updateValueAndValidity();
  	}
  	else if (this.expenseEndDate && endControl < expenseTime) {
  		controlField.setValidators(this.assignmentDetailsDataService.DateStringValidator(
  			expenseTime, endControl, this.localizationService.GetLocalizeMessage('EndDateTimeExpenseValidation', dynamicParam)));
  		controlField.updateValueAndValidity();
  	}
  	else {
  		controlField.clearValidators();
  		controlField.updateValueAndValidity();
  		this.getHourDistributionEffectiveDate();
  	}

  	if (this.EditAssingmentForm.controls['AssignmentEndDate'].valid) {
  		this.checkInitialGoLiveStartDateFormat();
  		this.getTenureLimit('AssignmentEndDate');
  	}
  }


  public getHourDistributionEffectiveDate() {
  	const startDate = new Date(this.EditAssingmentForm.get('AssignmentStartDate')?.value).toISOString(),
  		endDate = new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).toISOString();
  	this.assingmentDetailsService.assignmentWeekendingDaysList(this.assignmentDetails.SectorId, startDate, endDate).
  		pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((dt: GenericResponseBase<IDropdownItems[]>) => {
  			if (dt.Data) {
  				this.hourDistributionEffectiveDateList = this.getTransformDate(dt.Data);
  				this.restBreakEffectiveDateList = this.hourDistributionEffectiveDateList;
  				this.poEffectiveFromDateList = this.hourDistributionEffectiveDateList;
  				this.cd.markForCheck();
  			}
  		});
  }

  public backFillEndDateChange(e: { e: Date, control: IControlDates, key: IValidationMessages }) {
  	const control1Val = new Date(this.EditAssingmentForm.get(e.control.control1)?.value).getTime(),
  		control2Val = new Date(this.EditAssingmentForm.get(e.control.control2)?.value).getTime();
  	this.endDateVal = control1Val;


  	// Handle null or undefined case for e
  	if (e == null || e == undefined) {
  		this.EditAssingmentForm.controls[e['control']['control1']]
  			.setValidators(this.customValidators.RequiredValidator(e['key']['key1']));
  		this.EditAssingmentForm.controls[e['control']['control1']].updateValueAndValidity();
  		return;
  	}

  	if (control2Val > control1Val) {
  		this.EditAssingmentForm.controls[e.control.control1].
  			setValidators(this.customValidators.RangeValidator(control2Val, control1Val, e.key.key2));
  		this.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
  	} else {
  		this.EditAssingmentForm.controls[e.control.control2].clearValidators();
  		this.EditAssingmentForm.controls[e.control.control2].updateValueAndValidity();
  		this.EditAssingmentForm.controls[e.control.control1].clearValidators();
  		this.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
  	}

  }

  private resetPoApprovedAmount() {
  	if (!this.EditAssingmentForm.get('ModifyPObasedOnRevisedRates')?.value && !this.EditAssingmentForm.get('ModifyPOEndDate')?.value) {
  		this.EditAssingmentForm.get('poAdjustmentType')?.enable();
  		if (this.EditAssingmentForm.get('poAdjustmentType')?.value != magicNumber.twoHundredEighty) {
  			this.EditAssingmentForm.get('poAdjustmentType')?.setValue(magicNumber.twoHundredEightyOne);
  			this.changePoRadioAddFunds(magicNumber.twoHundredEightyOne);
  		}

  		this.EditAssingmentForm.get('revisedFundByEndDateChange')?.setValue(magicNumber.zero);
  		this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  		this.EditAssingmentForm.get('revisedFundByRateChange')?.setValue(magicNumber.zero);
  		this.EditAssingmentForm.get('revisedFundByEndDateChange')?.setValue(magicNumber.zero);
  	}
  	else if (this.EditAssingmentForm.get('ModifyPObasedOnRevisedRates')?.value) {
  		const amount = (Number(this.EditAssingmentForm.get('revisedFundByRateChange')?.value)).toFixed(magicNumber.two);
  		if (Number(amount) > Number(magicNumber.zero)) {
  			this.EditAssingmentForm.get('poFundAmount')?.setValue(Number(amount));
  		}
  		else {
  			this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  		}
  	}
  	else {
  		const amount = (Number(this.EditAssingmentForm.get('revisedFundByEndDateChange')?.value)).toFixed(magicNumber.two);
  		if (Number(amount) > Number(magicNumber.zero)) {
  			this.EditAssingmentForm.get('poFundAmount')?.setValue(Number(amount));
  		}
  		else {
  			this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  		}
  	}
  }

  public onChangePO(e: boolean) {
  	if (e) {
  		this.getPOApprovedAmount(true);
  		this.getApprovalWidgetData();
  		this.EditAssingmentForm.get('poAdjustmentType')?.setValue(magicNumber.twoHundredSeventyNine);
  		this.changePoRadioAddFunds(magicNumber.twoHundredSeventyNine);
  		this.isControlRevision.ModifyPOEndDate = true;
  	}
  	else {
  		this.isControlRevision.ModifyPOEndDate = false;
  		this.resetPoApprovedAmount();
  		this.getApprovalWidgetData();
  	}
  }

  public poAmountRevisedRate(isPoAmountRevisedRate: boolean) {
  	if (isPoAmountRevisedRate) {
  		this.getPOApprovedAmount(false);
  		this.EditAssingmentForm.get('poAdjustmentType')?.setValue(magicNumber.twoHundredSeventyNine);
  		this.changePoRadioAddFunds(magicNumber.twoHundredSeventyNine);
  		this.getApprovalWidgetData();
  	}
  	else {
  		this.resetPoApprovedAmount();
  	}
  }

  public revisedRateDate(data: Date | string) {
  	this.EditAssingmentForm.get('revisedRatedate')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectRevisedRateEffectiveDate'));
  	const revisedRateControl = new Date(this.EditAssingmentForm.get('revisedRatedate')?.value),
  		startDateControl = new Date(this.EditAssingmentForm.get('AssignmentStartDate')?.value),
  		endDateControl = new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value),
  		effectiveDateCurrentRate = new Date(this.assignmentDetails.AssignmentRates.RateEffectiveDateFrom),
  		futureRevisedRateEffectiveDate = new Date(this.assignmentDetails.RevisedRateEffectiveDate),
  		transformDateEffectiveDateCurrentRate = this.localizationService.TransformDate(revisedRateControl),
  		transformDateRevisedRateControl = this.localizationService.TransformDate(effectiveDateCurrentRate),
  		transformDatefutureRevisedRateEffectiveDate = this.localizationService.TransformDate(futureRevisedRateEffectiveDate),
  		transformDateTimeEntry = this.localizationService.TransformDate(this.timeEntryDate),
  		dynamicParam1: DynamicParam[] = [{ Value: transformDateTimeEntry, IsLocalizeKey: true }],
  		dynamicParam2: DynamicParam[] = [{ Value: transformDatefutureRevisedRateEffectiveDate, IsLocalizeKey: true }];

  	// if(this.showRevisionRateDate){
  	if (revisedRateControl.getTime() < startDateControl.getTime()) {
  		this.EditAssingmentForm.controls['revisedRatedate'].setValidators(this.assignmentDetailsDataService.DateStringValidator(startDateControl.getTime(), revisedRateControl.getTime(), 'RevisedRateEffectiveDateGreaterThanStartDate'));
  		this.EditAssingmentForm.controls['revisedRatedate'].updateValueAndValidity();
  	} else if (revisedRateControl.getTime() > endDateControl.getTime()) {
  		this.EditAssingmentForm.controls['revisedRatedate'].setValidators(this.assignmentDetailsDataService.DateStringValidator(revisedRateControl.getTime(), endDateControl.getTime(), 'RevisedRateEffectiveDateLessThanEndDate'));
  		this.EditAssingmentForm.controls['revisedRatedate'].updateValueAndValidity();
  	} else if (
  		(revisedRateControl.getTime() < effectiveDateCurrentRate.getTime())
      || (transformDateEffectiveDateCurrentRate == transformDateRevisedRateControl)) {
  		this.EditAssingmentForm.controls['revisedRatedate'].setErrors({
  			message: 'RevisedRateEffectiveDateGreaterThanEffectiveDateCurrentRate'
  		});
  	} else if (this.timeEntryDate && (revisedRateControl.getTime() < this.timeEntryDate.getTime())
      || (transformDateTimeEntry && (transformDateTimeEntry == transformDateRevisedRateControl))) {
  		this.EditAssingmentForm.controls['revisedRatedate'].setErrors({
  			message: this.localizationService.GetLocalizeMessage('SubmittedTimeRecordFoundAfterSelectedRevisedRateEffectiveDate', dynamicParam1)
  		});
  	} else if ((revisedRateControl.getTime() < futureRevisedRateEffectiveDate.getTime())
      || (transformDatefutureRevisedRateEffectiveDate == transformDateEffectiveDateCurrentRate)) {
  		this.EditAssingmentForm.controls['revisedRatedate'].setErrors({
  			message: this.localizationService.GetLocalizeMessage('RevisionAlreadyExistsForFutureDate', dynamicParam2)
  		});
  	}
  	else {
  		this.EditAssingmentForm.controls['revisedRatedate'].clearValidators();
  		this.EditAssingmentForm.controls['revisedRatedate'].updateValueAndValidity();
  	}
  	// }


  	if (data && this.EditAssingmentForm.get('ModifyPObasedOnRevisedRates')?.value) {
  		this.getPOApprovedAmount(false);
  	}


  }

  public changePoRevisedButton(dt: boolean) {
  	this.revisedRateDate(new Date());
  }


  private getPOApprovedAmount(isEndDateChange: boolean) {
  	const oldDateAssignment = new Date(this.assignmentDetails.AssignmentEndDate),
  		payload = {
  			"startTime": this.shiftDataById[0]?.StartTime ?? this.shiftDataById?.StartTime,
  			"endTime": this.shiftDataById[0]?.EndTime ?? this.shiftDataById?.EndTime,
  			"assignmentStartDate": this.EditAssingmentForm.get('AssignmentStartDate')?.value,
  			"assignmentEndDate": this.EditAssingmentForm.get('AssignmentEndDate')?.value,
  			"oldAssgnmtEndDate": this.assignmentDetails.AssignmentEndDate,
  			"shiftDays": this.EditAssingmentForm.get('ShiftId')?.value
  				? this.clpDays.toString()
  				: null,
  			"StBillRate": this.EditAssingmentForm.get('STBillRate')?.value
  		};
  	if (isEndDateChange && new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).getTime() > oldDateAssignment.getTime()) {
  		this.assingmentDetailsService.poApprovedAmountOnEndDateChange(payload).
  			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<assignmentSchedulePayload>) => {
  				if (res.Succeeded) {
  					this.getPoAmountOnEndDateChange(res);
  				}
  				this.cd.markForCheck();
  			});
  	}
  	else if (!isEndDateChange && this.EditAssingmentForm.get('ModifyPObasedOnRevisedRates')?.value && this.EditAssingmentForm.get('revisedRatedate')?.value) {
  		const stBillRate = this.EditAssingmentForm.get('STBillRate')?.value - this.assignmentDetails.AssignmentRates.STBillRate;
  		payload.oldAssgnmtEndDate = this.EditAssingmentForm.get('revisedRatedate')?.value;
  		payload.StBillRate = stBillRate;
  		if (stBillRate > Number(magicNumber.zero)) {
  			this.assingmentDetailsService.poApprovedAmountOnEndDateChange(payload).
  				pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<assignmentSchedulePayload>) => {
  					if (res.Succeeded) {
  						this.getPoAmountOnRevisedRate(res);
  					}
  					this.cd.markForCheck();
  				});
  		}
  		else {
  			this.EditAssingmentForm.get('revisedFundByRateChange')?.setValue(magicNumber.zero);
  			this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  		}

  	}
  	else {
  		this.estimatedCostChange = 0;
  	}
  }

  private getPoAmountOnEndDateChange(response: GenericResponseBase<string | number | assignmentSchedulePayload>) {
  	this.EditAssingmentForm.controls['revisedFundByEndDateChange'].setValue(response.Data);
  	this.EditAssingmentForm.controls['poAdjustmentType'].disable();
  	const amount = (this.EditAssingmentForm.get('revisedFundByRateChange')?.value + this.EditAssingmentForm.get('revisedFundByEndDateChange')?.value).toFixed(magicNumber.two);
  	if (amount > magicNumber.zero) {
  		this.EditAssingmentForm.controls['poFundAmount'].setValue(Number(amount));
  	}
  	else {
  		this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  	}
  	this.getApprovalWidgetData();
  	this.EditAssingmentForm.controls['poAdjustmentType'].updateValueAndValidity();
  	this.EditAssingmentForm.controls['revisedFundByEndDateChange'].updateValueAndValidity();
  	this.EditAssingmentForm.controls['poAdjustmentType'].updateValueAndValidity();
  	this.EditAssingmentForm.controls['poFundAmount'].updateValueAndValidity();
  }

  private getPoAmountOnRevisedRate(response: GenericResponseBase<assignmentSchedulePayload>) {
  	this.EditAssingmentForm.controls['revisedFundByRateChange'].setValue(response.Data);
  	this.EditAssingmentForm.controls['revisedFundByRateChange'].updateValueAndValidity();
  	this.EditAssingmentForm.get('poAdjustmentType')?.disable();
  	const amount = (this.EditAssingmentForm.get('revisedFundByRateChange')?.value + this.EditAssingmentForm.get('revisedFundByEndDateChange')?.value).toFixed(magicNumber.two);
  	if (amount > magicNumber.zero) {
  		this.EditAssingmentForm.get('poFundAmount')?.setValue(Number(amount));
  	}
  	else {
  		this.EditAssingmentForm.get('poFundAmount')?.setValue(null);
  	}
  	this.getApprovalWidgetData();
  }

  public onApproverSubmit(event: ApprovalFormEvent) {
  	this.showApproverWidget = false;
  	this.approverWidgetForm = event;
  	if (event.data.length > Number(magicNumber.zero)) {
  		this.showApproverWidget = true;
  	}

  }

  private getApprovalWidgetData() {
  	this.approvalConfigWidgetObj = {
  		"actionId": 533,
  		"entityId": XrmEntities.AssignmentRevision,
  		"sectorId": this.assignmentDetails.SectorId,
  		"locationId": parseInt(this.EditAssingmentForm.get('WorkLocationId')?.value?.Value),
  		"orgLevel1Id": parseInt(this.EditAssingmentForm.get('orgLevel1')?.value?.Value),
  		"laborCategoryId": parseInt(this.EditAssingmentForm.get('LaborCategoryId')?.value?.Value),
  		"reasonsForRequestId": 0,
  		"estimatedcost": this.estimatedCostApprover ?? this.EditAssingmentForm.get('NewPOFundAmount')?.value ?? magicNumber.zero,
  		"nextLevelManagerId": parseInt(this.EditAssingmentForm.get('requestingManager')?.value?.Value)
  	};
  }

  private getPoFundAmountValueChange() {
  	this.EditAssingmentForm.controls['poFundAmount'].valueChanges.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((dt: string | number | null) => {
  		this.estimatedCostApprover = dt;
  	});
  }


  public requestingManagerChange(data: IDropdownItems) {
  	if (this.hasRevisionField()) {
  		this.getApprovalWidgetData();
  	}
  }

  public revisionFieldUpdate(control: string) {
  	const rateCalculationControl = ['BaseWageRate', 'ActualSTWageRate', 'StaffingAgencyMarkup', 'OTRateTypeId', 'STBillRate'],
  		calculateControl = ['BaseWageRate', 'ActualSTWageRate', 'StaffingAgencyMarkup', 'OTRateTypeId', 'STBillRate', 'JobCategoryId', 'ShiftId'],
  		allRateControls = ["BaseWageRate", "OTRateTypeId", "ActualSTWageRate", "StaffingAgencyMarkup", "STBillRate", "OTWageRate", "DTWageRate", "OTBillRate", "DTBillRate", "StaffingAgencySTBillRate", "StaffingAgencyOTBillRate", "StaffingAgencyDTBillRate"],
  		jobCategoryVal = this.EditAssingmentForm.get('JobCategoryId')?.value,
  		shiftVal = this.EditAssingmentForm.get('ShiftId')?.value;

  	if (control) {
  		this.dialogPopupService.resetDialogButton();
  		this.resetLaborCategoryJobCategory(control);
  		this.methodsOnRevisionControls(control);

  		if (this.EditAssingmentForm.controls[control].valid) {
  			this.isControlRevision[control] = true;
  			if (!this.isRevision && calculateControl.includes(control) && shiftVal && jobCategoryVal && !this.isPreviousValueSelected(control)) {
  				this.assignmentDetailsDataService.getRevisionFieldsUpdate(control);
  				this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((button: shiftPopup | string) => {
  					this.checkConfirmationOnRateCalculationPopUp(button, control);
  				});
  			}
  			if (this.isRevision && this.isSelectedYes) {
  				if (rateCalculationControl.includes(control)) {
  					this.calCulateRate(control, this.EditAssingmentForm.get('BaseWageRate')?.value);
  				} else if ((control == 'JobCategoryId' || control == 'ShiftId')) {
  					this.getRequisitionData();
  				}
  			}
  			if (control == 'STBillRate') {
  				this.getPOApprovedAmount(false);
  				this.getPOApprovedAmount(true);
  			}
  			if (allRateControls.includes(control) && this.EditAssingmentForm.get(control)?.value ==
          this.assignmentDetails.AssignmentRates[control]) {
  				this.isControlRevision[control] = false;
  			}

  			if ((control == "JobCategoryId" || control == "LaborCategoryId" || control == "WorkLocationId") && (this.EditAssingmentForm.get(control)?.value.Value == this.assignmentDetails[control])) {
  				this.isControlRevision[control] = false;

  			} else if (control == "ShiftId" && (this.EditAssingmentForm.get(control)?.value.Value == this.assignmentDetails.AssignmentShiftDetails[0][control].toString())) {
  				this.isControlRevision[control] = false;
  			}
  		}
  		timeAndExpenseEffectiveDateControl(this);
  	}
  }

  private methodsOnRevisionControls(control: string) {
  	if (control == 'ModifyPObasedOnRevisedRates') {
  		this.getPOApprovedAmount(false);
  	}
  	if (control == 'PoEffectiveFromDate') {
  		this.validatePoEffectiveFromDate('PoEffectiveFromDate', 'EffectiveFromDate');
  	}

  	if (control == 'NewPOFundAmount' || control == 'poFundAmount' || control == 'WorkLocationId' || control == 'LaborCategoryId') {
  		this.getApprovalWidgetData();
  	}

  	if (control == 'NewPONumber') {
  		this.checkNewPONumber();
  	}
  }

  private checkConfirmationOnRateCalculationPopUp(button: shiftPopup | string, control: string) {
  	if (button == 'close') {
  		this.isSelectedYes = false;
  		this.isControlRevision[control] = true;
  		if (control == 'STBillRate') {
  			this.getPOApprovedAmount(false);
  		}
  		return;
  	} else if ((button as shiftPopup).value == Number(magicNumber.sixteen)) {
  		this.assignmentDetailsDataService.isRevision.next(true);
  		this.isSelectedYes = true;
  		if (control == 'JobCategoryId' || control == 'ShiftId') {
  			this.getRequisitionData();
  		} else {
  			this.calCulateRate(control, this.EditAssingmentForm.get('BaseWageRate')?.value);
  		}
  		this.handleChangeRateEffectiveDate();
  		this.dialogPopupService.resetDialogButton();
  	} else if ((button as shiftPopup).value == Number(magicNumber.seventeen)) {
  		this.isSelectedYes = false;
  		this.showRevisionRateDate = true;
  		if (control == 'STBillRate') {
  			this.getPOApprovedAmount(false);
  		}
  		this.assignmentDetailsDataService.isRevision.next(true);
  		this.dialogPopupService.resetDialogButton();
  	}
  }

  private checkNewPONumber() {
  	const newPONumber = this.EditAssingmentForm.get('NewPONumber')?.value.trim(),
  		isPONumberSame = this.poGrid.some((dt: IAssignmentPONumber) =>
  			dt.PoNumber == newPONumber);
  	if (isPONumberSame) {
  		this.EditAssingmentForm.controls['NewPONumber'].setErrors({
  			message: 'NewPONumberCannotBeSameAsExistingOne'
  		});
  	}
  }

  private resetFieldsOnLocationChange() {
  	this.EditAssingmentForm.controls['LaborCategoryId'].setValue(null);
  	this.EditAssingmentForm.controls['JobCategoryId'].setValue(null);
  	this.EditAssingmentForm.controls['hourDistribution'].setValue(null);
  	this.EditAssingmentForm.controls['restMealBreak'].setValue(null);
  	/* this.EditAssingmentForm.controls['hourDistributionEffectiveDate'].setValue(null);
       this.EditAssingmentForm.controls['restBreakEffectiveDate'].setValue(null); */
  	this.EditAssingmentForm.controls['ShiftId'].setValue(null);
  	this.jobCategoryList = [];
  	this.onWorkLocationChange(this.locationVal);
  	this.getMealBreakByLocation(this.locationVal as IDropdownItems);
  	this.getHourDistributionByLocation(this.locationVal as IDropdownItems);
  }

  private resetLaborCategoryJobCategory(control: string) {
  	if (control == 'WorkLocationId') {
  		this.locationVal = this.EditAssingmentForm.get('WorkLocationId')?.value.Value;
  		if (this.locationVal == undefined) {
  			this.resetFieldsOnLocationChange();
  			this.shiftList = [];
  		} else {
  			// this.locationVal = this.locationVal.Value
  			this.getShiftListByLocation(this.assignmentDetails.SectorId, ((this.locationVal) as string | number));
  			this.resetFieldsOnLocationChange();
  		}

  	}
  	if (control == 'LaborCategoryId') {
  		this.lcValue = this.EditAssingmentForm.get('LaborCategoryId')?.value;
  		if (this.lcValue) {
  			const locationId = this.EditAssingmentForm.controls['WorkLocationId'].value?.Value;
  			this.getJobCategoryByLabourCategory(Number(this.lcValue.Value) ?? Number(this.lcValue), locationId);
  			this.EditAssingmentForm.controls['JobCategoryId'].setValue(null);
  			this.jobCategoryList = [];
  		}
  		if (this.lcValue == undefined) {
  			this.EditAssingmentForm.controls['JobCategoryId'].setValue(null);
  			this.jobCategoryList = [];
  		}
  	}
  }

  public hasRevisionField() {
  	return Object.keys(this.isControlRevision).some((controlName: string) =>
  		this.isControlRevision[controlName]);
  }

  private rateRevisionWarningFields(control: string) {
  	const controls = ["BaseWageRate", "OTRateTypeId", "ActualSTWageRate", "JobCategoryId", "ShiftId"],
  		submitMarkupDependingField = ["OTRateTypeId", "STBillRate", "OTBillRate", "DTBillRate", "StaffingAgencySTBillRate", "StaffingAgencyOTBillRate", "StaffingAgencyDTBillRate"],
  		stBillControlFields = ["OTBillRate", "DTBillRate", "StaffingAgencySTBillRate", "StaffingAgencyOTBillRate", "StaffingAgencyDTBillRate"];
  	if (control == 'BaseWageRate' || control == 'ActualSTWageRate') {
  		this.allRateControls.forEach((ctrl: string) => {
  			this.isControlRevision[ctrl] = true;
  		});

  	} else if (control == "StaffingAgencyMarkup") {
  		submitMarkupDependingField.forEach((ctrl: string) => {
  			this.isControlRevision[ctrl] = true;
  		});
  	}
  	else if (control == "STBillRate") {
  		stBillControlFields.forEach((ctrl: string) => {
  			this.isControlRevision[ctrl] = true;
  		});
  	}
  	else if (control == "OTRateTypeId") {
  		this.allRateControls.forEach((ctrl: string) => {
  			if (ctrl != 'BaseWageRate' && ctrl != 'ActualSTWageRate') {
  				this.isControlRevision[ctrl] = true;
  			}
  		});
  	}

  }

  private isPreviousValueSelected(control: string): boolean {
  	const workLocation = this.EditAssingmentForm.get('WorkLocationId')?.value,
  		laborCategory = this.EditAssingmentForm.get('LaborCategoryId')?.value,
  		jobCategory = this.EditAssingmentForm.get('JobCategoryId')?.value,
  		shift = this.EditAssingmentForm.get('ShiftId')?.value;
  	if (this.assignmentDetails.WorkLocationId != workLocation?.Value
      || this.assignmentDetails.LaborCategoryId != laborCategory?.Value
      || this.assignmentDetails.JobCategoryId != jobCategory?.Value
      || (this.assignmentDetails.AssignmentShiftDetails[0].ShiftId != shift?.Value)
      || (this.assignmentDetails.AssignmentRates[control] != this.EditAssingmentForm.get(control)?.value)
  	) {
  		return false;
  	} else {
  		return true;
  	}

  }

  // eslint-disable-next-line max-lines-per-function
  public validatePoEffectiveFromDate(controlName: string, dynamicKey: string): void {
  	const formValues = {
  		assignmentStartDate: this.EditAssingmentForm.get('AssignmentStartDate')?.value,
  		assignmentEndDate: this.EditAssingmentForm.get('AssignmentEndDate')?.value,
  		poEffectiveDateText: this.EditAssingmentForm.get(controlName)?.value?.Text,
  		poAdjustmentType: this.EditAssingmentForm.get('poAdjustmentType')?.value
  	},

  	assignmentStartDate = new Date(formValues.assignmentStartDate).getTime(),
  	assignmentEndDate = new Date(formValues.assignmentEndDate).getTime(),
  	poEffectiveDate = this.dateConvert.getFormattedDate(formValues.poEffectiveDateText).getTime(),

  	poEffectiveDateString = this.dateConvert.getFormattedDateIntoString(formValues.poEffectiveDateText),
  	formattedAssignmentStartDate = this.dateConvert.convertDate(formValues.assignmentStartDate),
  	formattedAssignmentEndDate = this.dateConvert.convertDate(formValues.assignmentEndDate),
  	lastPoEffectiveDateString = this.dateConvert.getFormattedDateIntoString(this.lastPoEffectiveDate),

  	 dynamicParams: DynamicParam[] = [
  		{ Value: dynamicKey, IsLocalizeKey: true },
  		{ Value: this.dateConvert.getFormattedDateIntoString(this.expenseEndDate.toString()), IsLocalizeKey: true }
  	],
  	 singleDynamicParam: DynamicParam[] = [{ Value: dynamicKey, IsLocalizeKey: true }],

  	// Read-only and visibility check for early exit
  	 isFieldReadOnly = this.assignmentDetailsDataService.isReadOnly(controlName, this.assignmentDetails.LoggedInUserRoleGroupID),
  	 isFieldVisible = this.assignmentDetailsDataService.isFieldVisible(controlName, this.assignmentDetails.LoggedInUserRoleGroupID);
  	if (isFieldReadOnly || !isFieldVisible) {
  		this.removeValidation(controlName);
  		return;
  	}

  	// Check if validation is needed based on PO adjustment type
  	if (!formValues.poEffectiveDateText && formValues.poAdjustmentType === magicNumber.twoHundredEighty) {
  		this.addValidation('PoEffectiveFromDate', 'PleaseSelectPoEffectiveFromDate');
  		return;
  	}

  	// eslint-disable-next-line one-var
  	const isStartDateMismatch = poEffectiveDate < assignmentStartDate,
  	isEndDateMismatch = poEffectiveDate > assignmentEndDate,
  	isEffectiveStartDateConflict = poEffectiveDateString === formattedAssignmentStartDate,
  	isEffectiveEndDateConflict = poEffectiveDateString === formattedAssignmentEndDate,
  	isLastPoEffectiveDateConflict =
        poEffectiveDate < new Date(lastPoEffectiveDateString).getTime() ||
        poEffectiveDateString === lastPoEffectiveDateString,
  	isExpenseDateMismatch = this.expenseEndDate && poEffectiveDate < (this.expenseEndDate as Date).getTime();

  	// Set validations based on conditions
  	if (isStartDateMismatch) {
  		this.setErrorValidation(controlName, 'EffectiveFromDateGreaterThanStartDate', singleDynamicParam);
  	} else if (isEndDateMismatch) {
  		this.setErrorValidation(controlName, 'EffectiveFromDateLessThanEndDate', singleDynamicParam);
  	} else if (isEffectiveStartDateConflict && controlName === 'PoEffectiveFromDate') {
  		this.setErrorValidation(controlName, 'EffectiveFromDateGreaterThanPOEffectiveFromDate');
  	} else if (isEffectiveEndDateConflict && controlName === 'PoEffectiveFromDate') {
  		this.setErrorValidation(controlName, 'EffectiveFromDateLessThanEndDate', singleDynamicParam);
  	} else if (isLastPoEffectiveDateConflict && controlName === 'PoEffectiveFromDate') {
  		this.setErrorValidation(controlName, 'EffectiveFromDateGreaterThanPOEffectiveFromDate');
  	} else if (isExpenseDateMismatch) {
  		this.setErrorValidation(controlName, 'EffectiveFromDateTimeExpenseValidation', dynamicParams);
  	} else {
  		this.EditAssingmentForm.controls[controlName].clearValidators();
  		this.EditAssingmentForm.controls[controlName].updateValueAndValidity();
  	}
  }

  private setErrorValidation(control: string, validationKey: string, dynamicParam?: DynamicParam[]) {
  	this.EditAssingmentForm.controls[control].setErrors({
  		message: this.localizationService.GetLocalizeMessage(validationKey, dynamicParam)
  	});
  	this.emitClick();
  }

  public hourDistributionRuleChanged(event: any) {
  	timeAndExpenseEffectiveDateControl(this);
  }

  public restMealBreakRuleChanged(event: any) {
  	timeAndExpenseEffectiveDateControl(this);
  }

  // eslint-disable-next-line max-lines-per-function
  public addValidationHourDistributionEffectiveDate(control: string, dynamicKey: string) {
  	const startDate = new Date(this.EditAssingmentForm.get('AssignmentStartDate')?.value).getTime(),
  		endDate = new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).getTime(),
  		poEffectiveFormatedDate = this.EditAssingmentForm.get(control)?.value?.Text,
  		poEffectiveFromDate = this.dateConvert.getFormattedDate(poEffectiveFormatedDate).getTime(),
  		hourDistributionEffectiveDate = this.dateConvert.getFormattedDate(
  			this.localizationService.TransformDate(this.assignmentDetails.HourDistributionRuleEffectiveDate))
  			.getTime(),
  		dynamicParam: DynamicParam[] = [
  			{ Value: dynamicKey, IsLocalizeKey: true },
  			{ Value: this.localizationService.TransformDate(this.expenseEndDate), IsLocalizeKey: true }
  		],
  		dynamicParam2: DynamicParam[] = [{ Value: dynamicKey, IsLocalizeKey: true }],
  		isReadOnly = this.assignmentDetailsDataService.isReadOnly(control, this.assignmentDetails.LoggedInUserRoleGroupID),
  		isFieldVisible = this.assignmentDetailsDataService.isFieldVisible(control, this.assignmentDetails.LoggedInUserRoleGroupID);

  	if (isReadOnly || !isFieldVisible) {
  		this.removeValidation(control);
  		return;
  	}
  	if (!this.EditAssingmentForm.get(control)?.value) {
  		this.addValidation('hourDistributionEffectiveDate', 'PleaseSelectHourDistributionRuleEffectiveDate');
  		return;
  	}
  	if (control === 'hourDistributionEffectiveDate') {
  		if (poEffectiveFromDate <= hourDistributionEffectiveDate) {
  			this.setErrorValidation(control, 'Effective From Date should be greater than previous Hour Distribution Effective Date.');
  			return;
  		}
  	}
  	if (startDate && endDate && poEffectiveFromDate && (poEffectiveFromDate > endDate || startDate > poEffectiveFromDate)) {
  		if (startDate && poEffectiveFromDate < startDate) {
  			this.setErrorValidation(control, 'EffectiveFromDateGreaterThanStartDate', dynamicParam2);
  			return;
  		}
  	}
  	if (this.expenseEndDate && (poEffectiveFromDate < (this.expenseEndDate as Date).getTime()) ||
      (poEffectiveFormatedDate == this.localizationService.TransformDate(this.expenseEndDate))) {
  		this.setErrorValidation(control, 'EffectiveFromDateTimeExpenseValidation', dynamicParam);
  		return;
  	}

  	this.EditAssingmentForm.controls[control].clearValidators();
  	this.EditAssingmentForm.controls[control].updateValueAndValidity();
  	this.isControlRevision[control] = true;
  	timeAndExpenseEffectiveDateControl(this);
  	this.cd.detectChanges();
  }


  // eslint-disable-next-line max-lines-per-function
  public addValidationRestMealEffectiveDate(control: string, dynamicKey: string) {
  	const startDate = new Date(this.EditAssingmentForm.get('AssignmentStartDate')?.value).getTime(),
  		endDate = new Date(this.EditAssingmentForm.get('AssignmentEndDate')?.value).getTime(),
  		poEffectiveFormatedDate = this.EditAssingmentForm.get(control)?.value?.Text,
  		poEffectiveFromDate = this.dateConvert.getFormattedDate(poEffectiveFormatedDate).getTime(),
  		restMealBreakEffectiveDate = this.dateConvert.getFormattedDate(
  			this.localizationService.TransformDate(this.assignmentDetails.MealBreakConfigurationEffectiveDate))
  			.getTime(),
  		oldEffectiveDate = new Date(this.assignmentDetails[control as keyof IAssignmentDetails]).getTime(),
  		dynamicParam: DynamicParam[] = [
  			{ Value: dynamicKey, IsLocalizeKey: true },
  			{ Value: this.localizationService.TransformDate(this.expenseEndDate), IsLocalizeKey: true }
  		],
  		dynamicParam2: DynamicParam[] = [{ Value: dynamicKey, IsLocalizeKey: true }],
  		isReadOnly = this.assignmentDetailsDataService.isReadOnly(control, this.assignmentDetails.LoggedInUserRoleGroupID),
  		isFieldVisible = this.assignmentDetailsDataService.isFieldVisible(control, this.assignmentDetails.LoggedInUserRoleGroupID);

  	if (isReadOnly || !isFieldVisible) {
  		this.removeValidation(control);
  		return;
  	}

  	if (!this.EditAssingmentForm.get(control)?.value) {
  		this.addValidation('restBreakEffectiveDate', 'PleaseSelectRestBreakEffectiveDate');
  		return;
  	}

  	if (control === 'restBreakEffectiveDate') {
  		if (poEffectiveFromDate <= restMealBreakEffectiveDate) {
  			this.setErrorValidation(control, 'Effective From Date should be greater than previous Rest Meal Break Effective Date.');
  			return;
  		}
  	}

  	if (startDate && endDate && poEffectiveFromDate && (poEffectiveFromDate > endDate || startDate > poEffectiveFromDate)) {
  		if (startDate && poEffectiveFromDate < startDate) {
  			this.setErrorValidation(control, 'EffectiveFromDateGreaterThanStartDate', dynamicParam2);
  			return;
  		}
  	}
  	if (this.expenseEndDate && (poEffectiveFromDate < (this.expenseEndDate as Date).getTime()) ||
      (poEffectiveFormatedDate == this.localizationService.TransformDate(this.expenseEndDate))) {
  		this.setErrorValidation(control, 'EffectiveFromDateTimeExpenseValidation', dynamicParam);
  		return;
  	}

  	this.EditAssingmentForm.controls[control].clearValidators();
  	this.EditAssingmentForm.controls[control].updateValueAndValidity();


  	if (this.isControlRevision['workLocationId'] && (poEffectiveFromDate != oldEffectiveDate)) {
  		this.isControlRevision['control'] = true;
  	} else {
  		this.isControlRevision['control'] = false;
  	}

  	if (this.isControlRevision.WorkLocationId) {
  		this.isControlRevision[control] = true;
  	} else {
  		this.isControlRevision[control] = false;
  	}
  }


  private getRequisitionData() {
  	const workLocationId = this.EditAssingmentForm.get('WorkLocationId')?.value.Value,
  		laborCategoryId = this.EditAssingmentForm.get('LaborCategoryId')?.value.Value,
  		jobCategoryId = this.EditAssingmentForm.get('JobCategoryId')?.value.Value,
  		baseWage = this.EditAssingmentForm.get('BaseWageRate')?.value,
  		jobCategoryVal = this.EditAssingmentForm.get('JobCategoryId')?.value,
  		shiftVal = this.EditAssingmentForm.get('ShiftId')?.value;

  	if (jobCategoryVal && shiftVal) {
  		this.assingmentDetailsService.assignmentRequistionData(workLocationId, laborCategoryId, jobCategoryId).
  			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<reqChanges>) => {
  				if (res.Data && res.Succeeded) {
  					this.assignmentDetails.UnitTypeName = res.Data.RateUnitType;
  					this.EditAssingmentForm.controls['BaseWageRate'].patchValue(res.Data.WageRate);
  					this.EditAssingmentForm.controls['OTRateTypeId'].patchValue(res.Data.OvertimeHoursBilledAtId.toString());
  					this.calCulateRate('BaseWageRate', res.Data.WageRate);

  					this.toasterService.resetToaster();
  					this.assignmentDetailsDataService.isRateRevision.next(true);

  				} else {
  					this.toasterService.showToaster(ToastOptions.Error, "RequisitionLibraryDoesNotExistForThisSelection");
  					this.assignmentDetailsDataService.isRateRevision.next(false);
  				}
  			});

  	}
  }

  public onChangeTerminationRadio(terminationRadiobtn: boolean) {
  	if (terminationRadiobtn) {
  		this.isControlRevision.TerminateAssignment = true;
  		this.EditAssingmentForm.controls['TerminateReasonId'].setValidators(this.customValidators.RequiredValidator('PleaseSelectTerminationReason'));
  		this.EditAssingmentForm.controls['TerminateReasonId'].updateValueAndValidity();
  	} else {
  		this.isControlRevision.TerminateAssignment = false;
  		this.EditAssingmentForm.controls['AddedToDNR'].setValue(false);
  		this.EditAssingmentForm.controls['TerminateReasonId'].setValue(null);
  		this.EditAssingmentForm.controls['TerminateReasonId'].markAsUntouched();
  		this.EditAssingmentForm.controls['TerminateReasonId'].markAsPristine();
  		this.EditAssingmentForm.controls['TerminateReasonId'].clearValidators();
  		this.EditAssingmentForm.controls['TerminateReasonId'].updateValueAndValidity();
  	}
  }

  public onChangeTerminationAssignment(dropdownData: IDropdownItems) {
  	if (dropdownData) {
  		const terminationId = this.EditAssingmentForm.get('TerminateReasonId')?.value.Value;
  		this.assingmentDetailsService.terminationReasonSelection(terminationId).
  			pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<ITerminationReason>) => {
  				if (res.Data && res.Succeeded) {
  	this.terminationVisibleField = res.Data;

  	// Reset control revision status
  	this.isControlRevision.AddedToDNR = false;
  	this.isControlRevision.BackFillRequested = false;

  	// Set values
  	this.EditAssingmentForm.controls['BackFillRequested'].setValue(false);
  	this.EditAssingmentForm.controls['AddedToDNR'].setValue(false);

  	// Update validity
  	this.EditAssingmentForm.controls['BackFillRequested'].updateValueAndValidity();
  	this.EditAssingmentForm.controls['AddedToDNR'].updateValueAndValidity();

  	// Mark as pristine and untouched
  	this.EditAssingmentForm.controls['BackFillRequested'].markAsPristine();
  	this.EditAssingmentForm.controls['BackFillRequested'].markAsUntouched();
  	this.EditAssingmentForm.controls['AddedToDNR'].markAsPristine();
  	this.EditAssingmentForm.controls['AddedToDNR'].markAsUntouched();
}

  				this.cd.markForCheck();
  				this.cd.detectChanges();
  			});
  	}
  	this.isControlRevision.TerminateReasonId = true;
  }

  public onChangeDnrSwitch(switchBtn: boolean) {
  	if (switchBtn) {
  		this.isControlRevision.AddedToDNR = true;
  		this.EditAssingmentForm.controls['dnrOptions'].setValue(magicNumber.twoHundredSeventyEight);
  		this.EditAssingmentForm.controls['dnrOptions'].updateValueAndValidity();
  	} else {
  		this.isControlRevision.AddedToDNR = false;
  	}
  	this.cd.markForCheck();
  	this.cd.detectChanges();
  }

  public onChangeBackfillSwitch(switchBtn: boolean) {
  	if (switchBtn) {
  		this.isControlRevision.BackFillRequested = true;
  	} else {
  		this.isControlRevision.BackFillRequested = false;
  	}
  }


  public changeNotifyStaffing(staffingList: any) {
  	this.staffingAgencyList = staffingList.toString();
  }


  private addValidation(control: string, key: string) {
  	this.EditAssingmentForm.controls[control]
  		.setValidators(this.customValidators.RequiredValidator(key));
  	this.EditAssingmentForm.controls[control].updateValueAndValidity();
  }

  private removeValidation(control: string) {
  	this.EditAssingmentForm.controls[control].markAsUntouched();
  	this.EditAssingmentForm.controls[control].clearValidators();
  	this.EditAssingmentForm.controls[control].updateValueAndValidity();
  }

  private removePreviousData(controlName: string) {
  	this.EditAssingmentForm.controls[controlName].setValue(null);
  	this.EditAssingmentForm.controls[controlName].markAsPristine();
  	this.EditAssingmentForm.controls[controlName].markAsUntouched();
  	this.isControlRevision[controlName] = false;
  }

  public changePoRadioAddFunds(e: number) {
  	if (e == Number(magicNumber.twoHundredEighty)) {
  		this.addValidation('NewPOFundAmount', 'PleaseEnterNewPOFundAmount');
  		this.addValidation('NewPONumber', 'PleaseEnterNewPONumber');
  		this.addValidation('PoEffectiveFromDate', 'PleaseSelectPoEffectiveFromDate');
  		this.removePreviousData('poFundAmount');
  	} else if (e == Number(magicNumber.twoHundredSeventyNine)) {
  		this.isControlRevision['poAdjustmentType'] = true;
  		this.removeValidation('NewPOFundAmount');
  		this.removeValidation('NewPONumber');
  		this.removeValidation('PoEffectiveFromDate');
  		this.removePreviousData('NewPOFundAmount');
  		this.removePreviousData('NewPONumber');
  		this.removePreviousData('PoEffectiveFromDate');
  	} else {
  		this.isControlRevision['poAdjustmentType'] = false;
  		this.removeValidation('NewPOFundAmount');
  		this.removeValidation('NewPONumber');
  		this.removeValidation('PoEffectiveFromDate');
  		this.removePreviousData('NewPOFundAmount');
  		this.removePreviousData('NewPONumber');
  		this.removePreviousData('PoEffectiveFromDate');
  		this.removePreviousData('poFundAmount');
  	}
  }

  public changePoFundAmount(e: number | string | boolean) {
  	const isPoFundChanged: boolean = this.EditAssingmentForm.get('ModifyPOEndDate')?.value || (this.EditAssingmentForm.get('ModifyPObasedOnRevisedRates')?.value && this.EditAssingmentForm.get('revisedRatedate')?.value);
  	if (e && isPoFundChanged) {
  		const amount = (this.EditAssingmentForm.get('revisedFundByRateChange')?.value + this.EditAssingmentForm.get('revisedFundByEndDateChange')?.value).toFixed(magicNumber.two);
  		if (e < amount) {
  			this.EditAssingmentForm.get('poFundAmount')?.setValidators(this.customValidators.RangeValidator(amount, magicNumber.oneLakh, `Funds must be greater than ${amount}.`));
  			this.EditAssingmentForm.get('poFundAmount')?.updateValueAndValidity();
  		}
  		else {
  			this.EditAssingmentForm.get('poFundAmount')?.clearValidators();
  			this.EditAssingmentForm.get('poFundAmount')?.updateValueAndValidity();
  		}
  	}
  	else {
  		this.EditAssingmentForm.get('poFundAmount')?.clearValidators();
  		this.EditAssingmentForm.get('poFundAmount')?.updateValueAndValidity();
  	}
  	this.getApprovalWidgetData();
  }

  public onClickRevisionTab(tabName: SelectEvent) {

  	if (tabName.title == 'Revisions') {
  		this.assingmentDetailsService.resetRevisionPageIndex(magicNumber.one, false);
  		this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.AssignmentRevision);
  	}
  	else {
  		this.assingmentDetailsService.resetRevisionPageIndex(magicNumber.zero, false);
  		this.datePipe.transform(this.EditAssingmentForm.controls['AssignmentStartDate'].value, 'yyyy-MM-ddTHH:mm:ss');
  		this.EditAssingmentForm.controls['AssignmentStartDate'].patchValue(new Date(this.EditAssingmentForm.controls['AssignmentStartDate'].value));
  		this.assingmentDetailsService.resetRevisionPageIndex(magicNumber.zero, false);
  		this.datePipe.transform(this.EditAssingmentForm.controls['AssignmentEndDate'].value, 'yyyy-MM-ddTHH:mm:ss');
  		this.EditAssingmentForm.controls['AssignmentEndDate'].patchValue(new Date(this.EditAssingmentForm.controls['AssignmentEndDate'].value));

  		this.updateEventLog();
  	}
  }

  private getTenureValidation(assignmentStartDate: string, assignmentEndDate: string, controlName: string) {
  	const payload = {
  		"assignmentId": this.assignmentDetails.Id,
  		"contractorId": this.assignmentDetails.ContractorId,
  		"sectorId": this.assignmentDetails.SectorId,
  		"assignmentStartDate": assignmentStartDate,
  		"assignmentEndDate": assignmentEndDate,
  		"IsStartDateValidation": controlName == "AssignmentStartDate"
  	};
  	return payload;
  }


  ngOnDestroy(): void {
  	this.assignmentDetailsDataService.isRevision.next(false);
  	const lastToaster = this.toasterService.data[this.toasterService.data.length - magicNumber.one];
  	if (lastToaster && (lastToaster.cssClass === 'alert__danger')) {
  		this.toasterService.resetToaster();
  	}

  	// this.toasterService.resetToaster();
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();

  	this.renderer.removeStyle(document.body, 'overflow');
  	this.renderer.removeStyle(document.body, 'padding-right');
  }

}
