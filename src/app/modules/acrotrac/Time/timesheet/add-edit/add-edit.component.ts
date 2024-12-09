/* eslint-disable max-lines-per-function */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, WritableSignal, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { TIMEANDEXPENTRYSELECTION, timeSheetStatusIds } from '../../../expense/expense/enum-constants/enum-constants';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import getSubractedDate, { checkReadOnly, createToasterTable } from '../../../expense/utils/CommonEntryMethods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DatePipe } from '@angular/common';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { TimeEntryDetailGrid } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid';
import { NavigationPaths } from '../route-constants/route-constants';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { HoursType } from '../../../common/enum-constants/enum-constants';
import { TimeEntryAddEdit } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-add-edit';
import { CommonService } from '@xrm-shared/services/common.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { TooltipDirective } from "@progress/kendo-angular-tooltip";
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { TimeEntryStatus } from '../../enum-constants/enum-constants';
import { TimesheetConfigDetails } from '@xrm-core/models/acrotrac/expense-entry/add-edit/time-entry-config';
import { SafeHtml } from '@angular/platform-browser';
import { CostAccountingDetailsMap } from '@xrm-core/models/acrotrac/time-entry/common-interface/cost-accounting-details-map';
import { WeeklyDates } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekly-dates';
import { WeeklyHours, WeeklyHoursFullTotal } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekly-hours';
import { getDefaultWeekDetails, WeekDetails, WeekDetailsMap } from '@xrm-core/models/acrotrac/time-entry/common-interface/day-details';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { PreDefinedSchedules } from '@xrm-shared/services/common-constants/static-data.enum';
import { FilterSideBar } from '@xrm-core/models/acrotrac/common/filterSideBar';
import { AssignmentDetailsData } from '@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details';
import { getAddEditTimeEntryFormModel, IAddEditTimeFormModel } from './utils/formModel';
import { DropdownChangeEvent } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-config-details';
import { TimeConfigDetails } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-config-details';
import { ExpandedTimeSheetDetails } from '@xrm-core/models/acrotrac/time-entry/expanded-time-sheet-model';
import { TimeEntryDetail } from '@xrm-core/models/acrotrac/time-entry/common-interface/common-time-entry-details';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { TranslateService } from '@ngx-translate/core';
import { BillableHour, DayData, DaysOfWeek, FormItem, getDefaultDayData, GetMealBreakData, GetMealBreakResponse, mapDataWithTimeEntry, MealBreak, MealBreakDetail, mealBreakSubmitData, PenaltyHour } from '../adjustment-manual/enum';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { TimeAdjustmentService } from 'src/app/services/acrotrac/time-adjustment.service';
import { convertDateFormat, convertMealBreakSubmitDataMethod, convertTimeToDateTime } from '../../../common/time-in-out/time-in-out-function';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
	@ViewChild('container') containerRef: ElementRef | undefined;
	billableHour: WeeklyHours;
	initialData: TimeEntryAddEdit;
	public isDeleted: boolean = false;
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === "TD" || element.className === "k-column-title") &&
			element.offsetWidth < element.scrollWidth
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}
	public approvalId: number = magicNumber.zero;
	private recordId: number = magicNumber.zero;
	public assignmentDetailsFromSession: AssignmentDetailsData;
	public draftId = TimeEntryStatus.Draft;
	public submittedId = TimeEntryStatus.Submitted;
	public AddEditTimeEntryForm: FormGroup<IAddEditTimeFormModel>;
	public AddNewLineForm: FormGroup;
	public isEditMode: boolean = false;
	public dateFormat: string;
	public periodHeading: string = '';
	public isAddNewPopupOpen: boolean = false;
	public entityId: number = XrmEntities.Time;
	public manualOTDtEnabled: boolean = false;
	public hourDistributionRuleName: string;
	public OtEligibility: boolean;
	public currAssignmentId: number = magicNumber.zero;
	public currencyCode: string;
	public currTimesheetStatus: number;
	public timesheetDialogDisplay: boolean = false;
	public isCopyVisible: boolean = false;
	public ShiftList: DropdownModel[] = [];
	public HoursTypeList: { Text: string, Value: HoursType }[] = [
		{ Text: "ST", Value: HoursType.ST },
		{ Text: "OT", Value: HoursType.OT },
		{ Text: "DT", Value: HoursType.DT }
	];
	public dayOrder: string[] = [];
	public expendedApiRes: ExpandedTimeSheetDetails[];
	public isExpandedDetails: boolean = false;
	public CostAccountingCodeList: DropdownModel[] = [];
	public magicNumber = magicNumber;
	public tempcolumnWiseTotal: WeeklyHoursFullTotal = {
		Sunday: magicNumber.zero,
		Monday: magicNumber.zero,
		Tuesday: magicNumber.zero,
		Wednesday: magicNumber.zero,
		Thursday: magicNumber.zero,
		Friday: magicNumber.zero,
		Saturday: magicNumber.zero,
		TotalHour: magicNumber.zero,
		Total: magicNumber.zero
	};
	public columnWiseTotal: WeeklyHoursFullTotal = {
		'Sunday': magicNumber.zero,
		'Monday': magicNumber.zero,
		'Tuesday': magicNumber.zero,
		'Wednesday': magicNumber.zero,
		'Thursday': magicNumber.zero,
		'Friday': magicNumber.zero,
		'Saturday': magicNumber.zero,
		'TotalHour': magicNumber.zero,
		'Total': magicNumber.zero
	};
	public headerValue: WeeklyDates = {
		'Sunday': '',
		'Monday': '',
		'Tuesday': '',
		'Wednesday': '',
		'Thursday': '',
		'Friday': '',
		'Saturday': ''
	};
	public formArray: FormArray;
	public mealBreakId = [magicNumber.oneEightyOne, magicNumber.oneEightyTwo, magicNumber.oneEightyThree];
	public timesheetGridFooterMsg: SafeHtml = '';
	public timesheetConfigDetails: TimesheetConfigDetails | undefined;
	private currRoute: string = NavigationPaths.addEdit;
	private clearSession: boolean = true;
	private addMoreLocalizedMsg: WritableSignal<string> = signal('AddRow');
	public currWeekendingDate: string = '';
	private disabledConfigData: WeekDetailsMap = {};
	private uKey: string = '';
	private otEligibilityAllowed: boolean = false;
	private assignmentCostData: CostAccountingDetailsMap = {};
	private hdrMaxHoursData: Record<string, number> = {
		'Monday': magicNumber.zero,
		'Tuesday': magicNumber.zero,
		'Wednesday': magicNumber.zero,
		'Thursday': magicNumber.zero,
		'Friday': magicNumber.zero,
		'Saturday': magicNumber.zero,
		'Sunday': magicNumber.zero
	};
	private sectorId: number = magicNumber.zero;
	private workLocationId: number = magicNumber.zero;
	private customDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	private destroyAllSubscribtion$ = new Subject<void>();
	private timeLabelTextParams: DynamicParam[] = [{ Value: 'Timesheet', IsLocalizeKey: true }];
	private draftToasterMessage: string = 'ThisInformationHasBeenSuccessfullySavedAsADraft';
	private addToasterMessage: string = 'TheTimeRecordSuccessfullySubmittedAndMailSentToApprover';
	private editToasterMessage: string = 'TheTimesheetRecordHasBeenResubmitted';
	private uniqueRow;
	private currAssgmntDetails: AssignmentDetailsData;
	public isInOutEnable:boolean = false;
	public penaltyApplied: boolean = false;
	public mealBreakData:GetMealBreakData;
	public weekday: DaysOfWeek;
	public selectedDate: string;
	public isClickBox: boolean = false;
	public formData:any = [];
	public daysData: Record<DaysOfWeek, DayData> = {
		Sunday: getDefaultDayData(),
		Monday: getDefaultDayData(),
		Tuesday: getDefaultDayData(),
		Wednesday: getDefaultDayData(),
		Thursday: getDefaultDayData(),
		Friday: getDefaultDayData(),
		Saturday: getDefaultDayData()
	};
	@ViewChild('scrollTo') scrollTo!: ElementRef;
	public removedInOutData: AbstractControl | null = null;
	public removedPenaltyData: AbstractControl | null = null;

	// eslint-disable-next-line max-params
	constructor(
		private route: Router,
		private localizationService: LocalizationService,
		private toasterServ: ToasterService,
		private datePipe: DatePipe,
		private hourDistributionRuleService: HourDistributionRuleService,
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private sessionStore: SessionStorageService,
		private customValidations: CustomValidators,
		private expEntryService: ExpenseEntryService,
		private timeEntryService: TimeEntryService,
		private commonGridViewService: CommonService,
		private shiftService: ShiftGatewayService,
		private cdr: ChangeDetectorRef,
		private eventLog: EventLogService,
		private translateService: TranslateService,
		private renderer: Renderer2,
		private timeAdjustmentService: TimeAdjustmentService
	) {
		this.uniqueRow = this.memoization();
		this.AddNewLineForm = this.formBuilder.group({
			'CostAccountingCodeId': [null, this.customValidations.requiredValidationsWithMessage('PleaseSelectData', 'CostAccountingCode')],
			'ShiftId': [null, this.customValidations.requiredValidationsWithMessage('PleaseSelectData', 'Shift')],
			'HoursTypeId': [null]
		});
		this.AddEditTimeEntryForm = getAddEditTimeEntryFormModel(this.customValidations);
	}

	ngOnInit(): void {
		this.formArray = this.AddEditTimeEntryForm.get('TimeEntryDetails') as FormArray;
		this.timeAdjustmentService.clearInOutData();
		this.activatedRoute.params.pipe(switchMap((param) => {
			this.currRoute = this.route.url;
			this.uKey = param['id'] ?? '';
			this.isEditMode = (this.uKey.length > Number(magicNumber.zero));
			this.timeEntryService.dataHold.next({
				'Screen': (this.isEditMode)
					? 'edit'
					: 'add'
			});
			if (this.isEditMode) {
				return this.timeEntryService.getTimeSheetByUkey(this.uKey);
			} else {
				return of(null);
			}
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (res) {
				this.mealBreakData = res.getMealBreak.Data;
				this.isInOutEnable = this.mealBreakData.AllowInOutTimeSheet;
				this.timeEditMode(res.getTimeByUkey);
			} else {
				this.timeAddMode();
			}
			this.cdr.markForCheck();
		});
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}

	private getMealInOutConfig(assignmentId:number, weekendingdate:string){
		this.timeEntryService.getMealBreakDataBasedOnAssigId(assignmentId, weekendingdate).subscribe((res:GetMealBreakResponse) => {
			if(res.Data){
				this.mealBreakData = res.Data;
				this.cdr.markForCheck();
				this.isInOutEnable = this.mealBreakData.AllowInOutTimeSheet;
				if(this.isInOutEnable && (this.mealBreakData.RestBreakPenalty || this.mealBreakData.MealBreakPenalty)){
					this.penaltyApplied = true;
				}
			}

		});
	}

	private changeMethod() {
		this.billableHour = {...BillableHour};
		const mapData = mapDataWithTimeEntry(this.billableHour);
		this.formArray.push(this.formBuilder.group(mapData));
	}

	private changeMethodForPenality() {
		const PenalityData = mapDataWithTimeEntry(PenaltyHour, 'PT');
		this.formArray.push(this.formBuilder.group(PenalityData));
	}

	ngAfterViewInit(): void {
		this.translateService.stream('AddRow').pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: string) => {
				this.addMoreLocalizedMsg.set(res);
				this.localizeGridFooterLinkWithSafety();
				this.cdr.markForCheck();
				// Add click event listener to the container element
				this.containerRef?.nativeElement.addEventListener('click', this.handleClick.bind(this));
			});
	}

	private localizeGridFooterLinkWithSafety() {
		const rawHtml: string = `<a style="color: #4158D0; cursor: pointer;">+ ${this.addMoreLocalizedMsg()} </a>`;
		this.timesheetGridFooterMsg = rawHtml;
	}

	public handleClick(event: Event) {
		const target = event.target as HTMLElement;
		if (target.innerHTML === `+ ${this.addMoreLocalizedMsg()} `) {
			this.dialogPopupOperations().openDialog();
		}
	}

	private timeAddMode() {
		this.currTimesheetStatus = this.submittedId;

		const TimeEntrySelection = this.sessionStore.get(TIMEANDEXPENTRYSELECTION);
		if (!TimeEntrySelection) {
			// Redirect user to list page if no data in session storage
			this.backToList();
			return;
		}

		// eslint-disable-next-line one-var
		const { AssignmentDetails, WeekendingDate } = JSON.parse(TimeEntrySelection) as FilterSideBar;

		this.bindingTimeSheetDetails(AssignmentDetails);

		// for + Add More Dropdown API...
		this.currAssignmentId = AssignmentDetails.AssignmentId;
		this.currWeekendingDate = WeekendingDate.Value;
		this.getMealInOutConfig(this.currAssignmentId, this.currWeekendingDate);
		// get timesheet config details...
		this.getTimesheetConfigDetails(this.currAssignmentId, this.currWeekendingDate);

		this.setCurrencyCode(AssignmentDetails.CurrencyCode);

		this.AddEditTimeEntryForm.controls.AssignmentId.patchValue(AssignmentDetails.AssignmentId);
		/* Only Single Value of Weekending will Come from List so patch here... */
		this.AddEditTimeEntryForm.controls.WeekendingDate.patchValue({ 'Text': WeekendingDate.Text, 'Value': WeekendingDate.Value });

		// Header Strip

		// Assignment-mode-details...
		this.assignmentDetailsFromSession = AssignmentDetails;

		this.changeTimeSheetGridHeading(WeekendingDate);
	}

	private getTimesheetConfigDetails(assignmentId: number, weekendingDate: string, isData?: TimeEntryAddEdit) {
		this.timeEntryService.getTimesheetConfigDetails(assignmentId, weekendingDate)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
				this.handleTimeEntryConfigDetails(res, isData);
			});
	}

	private handleTimeEntryConfigDetails(res: GenericResponseBase<TimeConfigDetails>, isData?: TimeEntryAddEdit) {
		if (isSuccessfulResponse(res)) {
			const { HourDistributionRuleName, IsOtEligible, IsPreviousTimeSheetAvailable, ManualOtDtEntry,
				CostAccountingDetails, PreDefinedWorkScheduleId, HourDistributionRuleId, RestMealBreakRuleId } = res.Data;
			this.timesheetConfigDetails = res.Data;
			this.hourDistributionRuleName = HourDistributionRuleName;
			this.OtEligibility = IsOtEligible;
			this.isCopyVisible = IsPreviousTimeSheetAvailable;
			this.manualOTDtEnabled = ManualOtDtEntry;

			CostAccountingDetails.forEach((element) => {
				this.assignmentCostData[element.CostAccountingCodeId] = element;
			});

			if (HourDistributionRuleId !== null && HourDistributionRuleId !== Number(magicNumber.zero) &&
				RestMealBreakRuleId !== null && RestMealBreakRuleId !== Number(magicNumber.zero)) {
				// Auto
				if (!ManualOtDtEntry) {
					// 4/40 and none...
					if (PreDefinedWorkScheduleId === Number(PreDefinedSchedules['4/40']) || PreDefinedWorkScheduleId === Number(PreDefinedSchedules.None)) {
						this.getMaxHoursRuleFromHDR(HourDistributionRuleId);
					}
					// 9/80
					else if (PreDefinedWorkScheduleId === Number(PreDefinedSchedules['9/80'])) {
						this.toasterServ.displayToaster(ToastOptions.Error, '9/80 workschedule is not Implemented.');
					}
					else {
						this.toasterServ.displayToaster(ToastOptions.Error, 'HdrNotSet');
						this.timesheetConfigDetails.PreDefinedWorkScheduleId = Number(magicNumber.zero);
					}
					this.AddNewLineForm.controls['HoursTypeId'].patchValue(null);
					this.AddNewLineForm.controls['HoursTypeId'].clearValidators();
					isData?.TimeEntryDetails.forEach((row) => {
						row.HoursTypeId = String(magicNumber.zero);
						row.HoursTypeName = null;
					});
				}
				// Manual
				else {
					this.AddNewLineForm.controls['HoursTypeId'].patchValue({ Text: "ST", Value: HoursType.ST });
					this.AddNewLineForm.controls['HoursTypeId'].addValidators(this.customValidations.requiredValidationsWithMessage('PleaseSelectData', 'Hour Type'));
				}
			} else {
				this.toasterServ.displayToaster(ToastOptions.Error, 'RmbcNotSet');
				this.timesheetConfigDetails.PreDefinedWorkScheduleId = Number(magicNumber.zero);
			}
			this.AddNewLineForm.controls['HoursTypeId'].updateValueAndValidity();
			if (this.manualOTDtEnabled) this.cdr.markForCheck();
			if (isData) {
				// Patch Data
				this.patchDataFromGetByUkey(isData);
			}
			this.cdr.markForCheck();
		}
	}

	private getMaxHoursRuleFromHDR(id: number) {
		this.hourDistributionRuleService.getHourDistributionRuleById(id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			if (isSuccessfulResponse(res)) {
				res.Data.WeekDayRule.forEach((row) =>
					this.hdrMaxHoursData[row.WeekDayName ?? ''] = row.MaxHoursAllowed ?? magicNumber.twentyFour);
				this.cdr.markForCheck();
			}
		});
	}

	private timeEditMode(res: GenericResponseBase<TimeEntryAddEdit>) {
		if (isSuccessfulResponse(res)) {

			// if status is not draft or declined then we will not allow user to edit the record...
			if (res.Data.StatusId !== Number(timeSheetStatusIds.Draft) && res.Data.StatusId !== Number(timeSheetStatusIds.Declined)) {
				this.route.navigate([`/xrm/time-and-expense/timesheet/view/${this.uKey}`]);
				return;
			}
			this.initialData = res.Data;

			const { Data } = res,
				localizeValue = this.datePipe.transform(Data.WeekendingDate as string, 'MM/dd/YYYY');
			// Save as Draft button and Review comment will show or hide based on the status of the timesheet...
			this.currTimesheetStatus = Data.StatusId;

			Data.WeekendingDate = localizeValue;
			// Update UI
			this.updateUIWithTimeSheetData(Data);

			// Patch HoursTypeId
			this.AddNewLineForm.controls['HoursTypeId'].patchValue({ Text: "ST", Value: HoursType.ST });

			// Fetch Timesheet Config Details
			this.getTimesheetConfigDetails(this.currAssignmentId, this.currWeekendingDate, Data);
			this.getMealInOutConfig(this.currAssignmentId, this.currWeekendingDate);
			if((this.mealBreakData.AllowInOutTimeSheet ||this.mealBreakData.AllowInOutMealBreak)
				&& Data.TimeInOutDetails.length > Number(magicNumber.zero)){
				 this.updateDataInDataArray(Data.TimeInOutDetails);
			 }
		}
	}

	public updateDataInDataArray(data: MealBreak[]) {
		const convertedData = data.map((mealBreakData: MealBreak) => {
			const newData = { ...mealBreakData };
			newData.Id = this.isEditMode
				? newData.Id
				: Number(magicNumber.zero);
			newData.EntryDate = convertDateFormat(newData.EntryDate);
			newData.EntryTimeIn = convertTimeToDateTime(newData.EntryTimeIn, newData.EntryDate);
			newData.EntryTimeOut = convertTimeToDateTime(newData.EntryTimeOut, newData.EntryDate, newData.EntryTimeIn);
			newData.TotalMealBreakHours = newData.TotalMealBreakHours * Number(magicNumber.sixty);
			newData.MealBreakDetails = newData.MealBreakDetails && newData.MealBreakDetails.length > Number(magicNumber.zero)
				? newData.MealBreakDetails.map((d: MealBreakDetail) => {
					const newDetail = { ...d };
					newDetail.Id = this.isEditMode
						? newDetail.Id
						: Number(magicNumber.zero);
					if (newDetail.MealIn) {
						newDetail.MealIn = convertTimeToDateTime(newDetail.MealIn, newData.EntryDate);
					}
					if (newDetail.MealOut) {
						newDetail.MealOut = convertTimeToDateTime(newDetail.MealOut, newData.EntryDate, newDetail.MealIn);
					}

					return newDetail;
				})
				: [];

			// eslint-disable-next-line one-var
			const day = this.datePipe.transform(newData.EntryDate, 'EEEE') as DaysOfWeek;
			this.daysData[day] = newData;
			this.cdr.markForCheck();

			return newData;
		});

		this.formData = convertMealBreakSubmitDataMethod(convertedData, this.mealBreakData, this.mealBreakId);
		this.timeAdjustmentService.entriesArray = this.formData;
	}

	private updateUIWithTimeSheetData({ AssignmentId, Id, StatusName, TimeEntryCode, StatusId, WeekendingDate }: TimeEntryAddEdit) {
		this.timeEntryService.updateHoldData({ 'TimeEntryCode': TimeEntryCode, 'StatusName': StatusName, 'StatusId': StatusId, 'Id': Id, 'Screen': 'edit', 'EntityId': this.entityId });
		this.currTimesheetStatus = StatusId;
		this.currAssignmentId = parseInt(AssignmentId ?? '0');
		this.currWeekendingDate = WeekendingDate as string;
		this.recordId = Id;
	}

	private patchDataFromGetByUkey({ StatusId, ContractorComments, AssignmentId, WeekendingDate, ReviewerComment,
		UnitTypeId, TimeEntryDetails }: TimeEntryAddEdit) {
		this.AddEditTimeEntryForm.patchValue({
			'AssignmentId': parseInt(AssignmentId ?? '0'),
			'WeekendingDate': WeekendingDate,
			'StatusId': StatusId,
			'ContractorComments': ContractorComments,
			'ReviewerComment': ReviewerComment,
			'UnitTypeId': UnitTypeId
		});
		if (this.isInOutEnable) {
			this.changeMethodForEdit(TimeEntryDetails);
		}
		if (
			this.mealBreakData.MealBreakPenalty ||
		this.mealBreakData.RestBreakPenalty
		) {
			this.changeMethodForPenalityForEdit(TimeEntryDetails);
		}
		this.changeTimeSheetGridHeading({ 'Value': WeekendingDate } as DropdownModel);
		this.populateDataInGrid(TimeEntryDetails);
	}

	private changeMethodForEdit(data: TimeEntryDetailGrid[]) {
		this.billableHour = this.initialData.InOutDetails.BillableHour;
		const mapData = mapDataWithTimeEntry(this.billableHour),
	   exists = data.some((item) =>
				item.Id === mapData.Id);

		if (!exists) {
			data.unshift(mapData);
		}
	}

	private changeMethodForPenalityForEdit(data: TimeEntryDetailGrid[]) {
		const PenalityData = mapDataWithTimeEntry(this.initialData.InOutDetails.PenaltyHour, 'PT'),
	   exists = data.some((item) =>
				item.Id === PenalityData.Id);

		if (!exists) {
			data.push(PenalityData);
		}
	}


	private populateDataInGrid(timeEntryDetails: TimeEntryDetailGrid[]) {
		timeEntryDetails.forEach((item) => {
			this.uniqueRow.duplicateLine([item.CostAccountingCodeName, item.ShiftName, item.HoursTypeName], item);
		});
	}

	public setCurrencyCode(currencyCode: string | undefined | null) {
		this.currencyCode = currencyCode ?? 'USD';
	}

	public bindingTimeSheetDetails(assignmentMoreDetails: AssignmentDetailsData) {
		this.currAssgmntDetails = assignmentMoreDetails;
		this.timeEntryService.updateHoldData({ 'AssignmentCode': assignmentMoreDetails.AssignmentCode, 'ContractorName': assignmentMoreDetails.ContractorName });

		// Shift Api parameters
		this.sectorId = parseInt(assignmentMoreDetails.SectorId);
		this.workLocationId = parseInt(assignmentMoreDetails.WorkLocationId);
		// IsManualOtDt flag 'false' Auto else Manual...
		this.otEligibilityAllowed = assignmentMoreDetails.OtEligibility;
	}


	private singleRecordDropdownPatch = (data: DropdownModel[], formGroup: FormGroup, controlName: string) => {
		if (data.length === Number(magicNumber.one)) {
			formGroup.controls[controlName].patchValue(data[0]);
		}
	};

	private changeTimeSheetGridHeading = (selectedDate: DropdownModel) => {
		// Timesheet Period
		this.periodHeading = this.createEntryPeriodHeading(selectedDate.Value, 'Timesheet Period');
		this.setAllValidation(true);
	};

	public onWeekendingDropdownChange = ({ selectedWeekending, path }: DropdownChangeEvent) => {
		this.currWeekendingDate = selectedWeekending.Value;
		// Add Mode No routing Only Grid Heading Change...
		if (path === this.currRoute) {
			this.timeEntryService.getTimesheetConfigDetails(this.currAssignmentId, selectedWeekending.Value)
				.pipe(switchMap((res) => {
					this.handleTimeEntryConfigDetails(res);
					return of(null);
				}), takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
					this.changeTimeSheetGridHeading(selectedWeekending);
					this.emptyDropdownListData();
				});
		} else {
			this.uniqueRow.clearCache();
			this.formArray.clear();
			this.clearSession = false;
			window.history.replaceState(null, '', NavigationPaths.list);
			window.history.pushState(null, '', NavigationPaths.list);
			if (this.isEditMode) {
				// Holding the assignment data and will use it in Expense/Timesheet add-edit Component...
				sessionStorage.setItem(TIMEANDEXPENTRYSELECTION, JSON.stringify({
					'AssignmentDetails': this.currAssgmntDetails,
					'WeekendingDate': this.AddEditTimeEntryForm.controls.WeekendingDate.value
				}));
			}
			this.route.navigate([path]);
		}
	};

	private createEntryPeriodHeading = (endDate: string, preffix: string): string => {
		// Date and time
		const subtractedDate = getSubractedDate(endDate, magicNumber.six),
			// Always Convert the coming DateSTRING into MM/DD/YYYY format or else it will give Invalid Date...
			transformedDate: string | null = this.datePipe.transform(subtractedDate, 'MM/dd/YYYY'),
			startDate = transformedDate
				? new Date(transformedDate)
				: new Date(subtractedDate);
		this.setAllHeader(transformedDate);
		// We will only show the Dates in the User Preffered Format...
		return `${preffix}: ${this.localizationService.TransformDate(startDate)} - ${this.localizationService.TransformDate(new Date(endDate))}`;
	};

	private setAllHeader(transformedDate: string | null) {
		const initialDate: Date = new Date(transformedDate ?? '');
		this.getNextSevenDates(initialDate);
	}

	private emptyDropdownListData = () => {
		this.ShiftList = [];
		this.CostAccountingCodeList = [];
	};

	private getNextSevenDates(initialDate: Date) {
		this.dayOrder = [];
		for (let i = magicNumber.zero; i < magicNumber.seven; i++) {
			const nextDate = new Date(initialDate);
			nextDate.setDate(initialDate.getDate() + i);
			// eslint-disable-next-line one-var
			const formattedDate = this.datePipe.transform(nextDate, 'MM/dd/YYYY'),
				curretDay = this.datePipe.transform(formattedDate, 'EEEE') ?? '';
			this.headerValue[curretDay == "Saturday"
				? "Saturday"
				: curretDay] = formattedDate ?? '';

			this.dayOrder.push(curretDay == "Saturday"
				? "Saturday"
				: curretDay);
		}
	}

	public onDecline = () =>
		this.dialogPopupOperations().closeDialog();

	public dialogPopupOperations = () => {
		return {
			'openDialog': () => {
				this.toasterServ.resetToaster();
				this.isAddNewPopupOpen = true;
				this.getDropdownData();
				// if this flag is false then we have to show only ST hours...
				if (!this.otEligibilityAllowed && this.manualOTDtEnabled)
					this.HoursTypeList = [{ Text: "ST", Value: HoursType.ST }];
			},
			'closeDialog': () => {
				this.isAddNewPopupOpen = false;
				// in 'Manual' HoursType will be in 'ST' but in 'Auto' We don't require Hours Type Dropdown...
				this.AddNewLineForm.reset(this.manualOTDtEnabled
					? { 'HoursTypeId': { Text: "ST", Value: HoursType.ST } }
					: undefined);
			}
		};
	};

	public timesheetDialogOperations = () => {
		return {
			'openDialog': () => {
				this.toasterServ.resetToaster();
				this.timesheetDialogDisplay = true;
			},
			'closeDialog': () => {
				this.timesheetDialogDisplay = false;
			},
			'submitNewForm': (operation: string) => {
				const caseOperation = { toasterMsg: '' };
				this.caseHandling(caseOperation, operation);
				if (this.isEditMode)
					this.updateExistingRecord(caseOperation.toasterMsg);
				else
					this.submitForm(caseOperation.toasterMsg);
				this.timesheetDialogOperations().closeDialog();
			}
		};
	};

	private updateExistingRecord = (toasterMessage: string) => {
		this.removeFromForm();
		const payload = new TimeEntryAddEdit({
			...this.AddEditTimeEntryForm.getRawValue(),
			timeInOutDetails: this.formData
		});
		payload.hourTypeIdNull(payload.TimeEntryDetails, this.manualOTDtEnabled, this.recordId);
		payload.UKey = this.uKey;
		this.addForm();
		if (this.AddEditTimeEntryForm.valid) {
			this.timeEntryService.updateTimeEntry(payload).pipe(
				catchError((error) => {
					this.toasterServ.displayToaster(ToastOptions.Error, error);
					throw error;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			).subscribe((response) => {
				this.cdr.markForCheck();
				if (isSuccessfulResponse(response)) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					// on Susccessfully updating the record we have to reset the event log...
					this.eventLog.isUpdated.next(true);
					this.toasterServ.displayToaster(ToastOptions.Success, toasterMessage);
					this.AddEditTimeEntryForm.markAsPristine();

					if (this.AddEditTimeEntryForm.controls.StatusId.value === Number(timeSheetStatusIds.Submitted) ||
						this.AddEditTimeEntryForm.controls.StatusId.value === Number(timeSheetStatusIds.ReSubmitted)) {
						this.backToList();
					}
				} else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterServ, this.localizationService);
					this.rollBackStatusId();
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterServ.displayToaster(ToastOptions.Error, 'TimeSheetAlreadyExists', this.timeLabelTextParams);
					this.rollBackStatusId();
				}
				else if ('Data' in response && response.Data?.length) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(response.Message);
					this.toasterServ.displayToaster(
						ToastOptions.Error, `${localizedErrorMsg} ${createToasterTable(response.Data, this.localizationService)}`,
						[], true
					);
					this.rollBackStatusId();
				}
				else {
					const formattedResponse = this.formatedText(response.Message);
					this.toasterServ.displayToaster(ToastOptions.Error, formattedResponse.Text, [], formattedResponse.isHtmlContent);
					this.rollBackStatusId();
				}
				this.cdr.markForCheck();
			});
		}
	};

	private caseHandling = (operation: { toasterMsg: string }, scenario?: string) => {
		const addMsg = (this.columnWiseTotal.Total > Number(magicNumber.zero))
			? this.addToasterMessage
			: 'TimesheetSubmittedForZeroHour';
		switch (scenario) {
			case 'Draft':
				this.changeStatusId(timeSheetStatusIds.Draft);
				operation.toasterMsg = this.draftToasterMessage;
				this.gridValidation().hoursValidation();
				break;

			case 'Add':
				this.changeStatusId(timeSheetStatusIds.Submitted);
				operation.toasterMsg = addMsg;
				break;

			case 'Edit':
				this.changeStatusId((this.AddEditTimeEntryForm.controls.StatusId.value === Number(timeSheetStatusIds.Draft))
					? timeSheetStatusIds.Submitted
					: timeSheetStatusIds.ReSubmitted);
				operation.toasterMsg = (this.AddEditTimeEntryForm.controls.StatusId.value === Number(timeSheetStatusIds.Submitted))
					? addMsg
					: this.editToasterMessage;
				this.gridValidation().hoursValidation();
				break;

			default:
			// "Invalid"
		}
	};

	public onClickAddNewLineItem = () => {
		try {
			this.AddNewLineForm.markAllAsTouched();
			if (this.AddNewLineForm.valid) {
				const newLineItem = new TimeEntryDetailGrid(this.AddNewLineForm.getRawValue()),
					isDuplicate =
					this.uniqueRow.duplicateLine([
						newLineItem.CostAccountingCodeName,
						newLineItem.ShiftName, newLineItem.HoursTypeName
					], newLineItem); ;
				this.dialogPopupOperations().closeDialog();
				if (!isDuplicate)
					this.formArray.markAsDirty();
				this.scrollToGrid();
			}
		} catch (error) {
			console.log("error", error);
		}
	};

	private memoization = () => {
		const cache: string[] = [],
			uniqueRow = {
				"duplicateLine": (args: any[], newLine: TimeEntryDetailGrid) => {
					const key = JSON.stringify(args);
					if (cache.includes(key)) {
						this.toasterServ.displayToaster(ToastOptions.Error, (this.manualOTDtEnabled)
							? 'TimesheetDuplicateLineErrorMsg'
							: 'TimesheetDuplicateLineErrorMsgForAuto');
						return true;
					} else {
						cache.push(key);
						this.gridOperations().add(new TimeEntryDetailGrid(newLine));
						return false;
					}
				},
				"removeElement": (index: number) => {
					cache.splice(index, magicNumber.one);
				},
				"clearCache": () => {
					cache.length = magicNumber.zero;
				}
			};
		// uniqueRow()...
		return uniqueRow;
	};

	public deleteLineItem = (rowIndex: number) => {
		this.toasterServ.resetToaster();
		this.gridOperations().delete(rowIndex);
		if((this.isInOutEnable || (this.mealBreakData && (this.mealBreakData.MealBreakPenalty ||
			this.mealBreakData.RestBreakPenalty))) && (this.formArray.value.length == Number(magicNumber.one)
			 || this.formArray.value.length == Number(magicNumber.two))){
			this.uniqueRow.clearCache();
			this.isDeleted = true;
			this.timeAdjustmentService.clearInOutData();
			this.getInitialDaysData();
			this.formArray.clear();
			 }
		if (!this.formArray.length) {
			// Bug Fix => While removing all line items +Add ROW Link is not hitiing the function...
			this.containerRef?.nativeElement.addEventListener('click', this.handleClick.bind(this));
			this.isDeleted = true;
			this.timeAdjustmentService.clearInOutData();
			this.getInitialDaysData();
		}
	};

	getInitialDaysData(){
		this.daysData = {
			Sunday: getDefaultDayData(),
			Monday: getDefaultDayData(),
			Tuesday: getDefaultDayData(),
			Wednesday: getDefaultDayData(),
			Thursday: getDefaultDayData(),
			Friday: getDefaultDayData(),
			Saturday: getDefaultDayData()
		};
	}
	// eslint-disable-next-line max-lines-per-function
	public gridOperations = () => {
		return {
			"add": (addNewLineItem: TimeEntryDetailGrid) => {
				addNewLineItem.SundayDisable = true;
				if((!this.isEditMode || this.isDeleted) && this.formArray.length == Number(magicNumber.zero)){
					if (this.isInOutEnable) {
						this.changeMethod();
					}
					if (this.mealBreakData &&(
					   	this.mealBreakData.MealBreakPenalty ||
					   	this.mealBreakData.RestBreakPenalty)
					   ) {
					   	this.changeMethodForPenality();
					   }
				}
				if(this.formArray.length > Number(magicNumber.zero)){
					this.isDeleted = false;
				}
				this.formArray.push(this.formBuilder.group(addNewLineItem));
				if(this.mealBreakData && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)){
					this.ensurePTRowIsLast();
				}
				this.setAllValidation();
			},
			"delete": (rowIndex: number) => {
				this.uniqueRow.removeElement(rowIndex);
				this.formArray.removeAt(rowIndex);
				this.formArray.markAsDirty();
			},

			"columnWiseTotal": (day: string) => {
				let columnwiseData = this.formArray.value,
  				columnWiseDataIfPenalty = this.formArray.value;
			 if (this.isInOutEnable && (this.mealBreakData && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty))) {
  				columnwiseData = this.formArray.value.slice(magicNumber.one);
  				columnWiseDataIfPenalty = this.formArray.value.slice(magicNumber.one, this.formArray.value.length - magicNumber.one);
  			}
  			 else if (this.isInOutEnable) {
  				columnwiseData = this.formArray.value.slice(magicNumber.one);
				  columnWiseDataIfPenalty = this.formArray.value.slice(magicNumber.one);
  			}
  			else if (this.mealBreakData && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)) {
  				columnWiseDataIfPenalty = this.formArray.value.slice(magicNumber.zero, this.formArray.value.length - magicNumber.one);
  			}
  			const count = columnwiseData.reduce((acc: number, curr: FormItem) => {
			  return acc + curr[day];
  			}, magicNumber.zero);

  			this.columnWiseTotal[day] = count;

  			// eslint-disable-next-line one-var
  			const count2 = columnWiseDataIfPenalty.reduce((acc: number, curr: FormItem) => {
  				return acc + curr[day];
  			}, magicNumber.zero);
			  this.tempcolumnWiseTotal[day] = count2;
  			return count;

			},
			"rowWiseTotal": (rowIndex: number) => {
				const row = this.formArray.value[rowIndex];

				// Updating the Total Hours row Wise in Payload...
				this.formArray.value[rowIndex].TotalHour = this.customDays.reduce((acc, curr) => {
					return acc + row[curr];
				}, magicNumber.zero);

				// updating rowwise total hours in payload...S
				this.formArray.at(rowIndex).get('TotalHour')?.setValue(this.formArray.value[rowIndex].TotalHour);
				return this.formArray.value[rowIndex].TotalHour;
			},
			"updateArrayStatusId": (statusId: number) => {
				this.formArray.value.forEach((row: number, index: number) => {
					this.formArray.at(index).get('StatusId')?.setValue(statusId);
				});
			},
			'clearValidations': () => {
				this.dayOrder.forEach((day: string) => {
					this.formArray.controls.forEach((control) => {
						control.get(day)?.setErrors(null);
						control.get(day)?.updateValueAndValidity();
					});
				});
			}
		};
	};

	private setAllValidation(isWeekendingChange: boolean = false) {
		this.formArray.controls.forEach((element) => {
			const formObject: WeekDetails = getDefaultWeekDetails();

			/*  if cost-code is not present then run the loop and add in it... */
			if (!(element.value.CostAccountingCodeId in this.disabledConfigData) || isWeekendingChange) {
				this.dayOrder.forEach((value: string) => {
					formObject[value] = checkReadOnly(
						this.headerValue[value], element.value.CostAccountingCodeId,
						this.timesheetConfigDetails, this.assignmentCostData
					);
				});

				this.disabledConfigData[element.value.CostAccountingCodeId] = formObject;
			}
		});
		this.cdr.markForCheck();
	}

	public checkReadOnlyValidation(CostAccountingCodeId: number, day: string, index: number): boolean {
		if (this.disabledConfigData[CostAccountingCodeId][day].isDisabled)
			(this.formArray.at(index) as FormGroup).controls[day].setValue(magicNumber.zero);

		return this.disabledConfigData[CostAccountingCodeId][day].isDisabled;
	}

	// Calculate the total hours...
	public calculateTotalHours() {
		let data = this.formArray.value;
		 if (this.isInOutEnable) {
			data = this.formArray.value.slice(magicNumber.one);
		}
		const count = data.reduce((acc: number, curr: TimeEntryDetail) => {
			let sum = magicNumber.zero;
			this.customDays.forEach((day: string) => {
				const value = curr[day as keyof TimeEntryDetail];
				if (typeof value === 'number') {
					sum += value;
				}
			});
			return acc + sum;
		}, magicNumber.zero);
		this.columnWiseTotal.Total = count;
		return count;
	}

	public getFormControl(headerValue: string, rowIndex: number): FormControl {
		// return the FormControl for the respective column editor
		return (
			this.formArray.controls.find((i, index) =>
				index === rowIndex)?.get(headerValue)
		) as FormControl;
	}

	private getDropdownData = () => {
		if (!this.CostAccountingCodeList.length) {
			this.expEntryService.getCostAccCodeAgainstAssingment(this.currAssignmentId, this.currWeekendingDate)
				.pipe(
					takeUntil(this.destroyAllSubscribtion$),
					catchError((error) => {
						// Handle error here
						this.toasterServ.displayToaster(ToastOptions.Error, 'Somethingwentwrong');
						// Optionally re-throw the error
						throw error;
					})
				).subscribe((response) => {
					if (isSuccessfulResponse(response)) {
						const { Data } = response;
						this.CostAccountingCodeList = Data;
						this.singleRecordDropdownPatch(this.CostAccountingCodeList, this.AddNewLineForm, 'CostAccountingCodeId');
						this.cdr.markForCheck();
					}
				});
		} else {
			// we are resetting the drodpowns on close of dialog box so we have to patch it when user opens it again ...
			this.singleRecordDropdownPatch(this.CostAccountingCodeList, this.AddNewLineForm, 'CostAccountingCodeId');
		}

		if (!this.ShiftList.length) {
			this.shiftService.getshiftDropdown({ sectorId: this.sectorId, locationId: this.workLocationId })
				.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((response) => {
					this.ShiftList = response.Data;
					this.singleRecordDropdownPatch(this.ShiftList, this.AddNewLineForm, 'ShiftId');
					this.cdr.markForCheck();
				});
		} else {
			this.singleRecordDropdownPatch(this.ShiftList, this.AddNewLineForm, 'ShiftId');
		}

	};

	private gridValidation = () => {
		return {
			'hoursValidation': () => {
				const { TimeEntryDetails } = this.AddEditTimeEntryForm.getRawValue() as TimeEntryAddEdit;
				// Remove previous column errors
				this.gridOperations().clearValidations();
				// column wise validation
				for (let i = Number(magicNumber.zero); i < this.dayOrder.length; i++) {
					const currentDay = this.dayOrder[i],
						totalHours = this.tempcolumnWiseTotal[currentDay].toFixed(Number(magicNumber.two));
					let maxHours = magicNumber.twentyFour;
					if (!this.manualOTDtEnabled) {
						maxHours = this.hdrMaxHoursData[currentDay] === Number(magicNumber.zero)
							? magicNumber.twentyFour
							: this.hdrMaxHoursData[currentDay];
					}
					if (this.isInOutEnable) {
						this.validateBillableHours(TimeEntryDetails, currentDay, Number(totalHours));
					}

					if (Number(totalHours) > Number(maxHours)) {
						this.toasterServ.displayToaster(ToastOptions.Error, 'RestrictTotalHours', [{ Value: this.dayOrder[i], IsLocalizeKey: false }, { Value: maxHours.toFixed(magicNumber.two), IsLocalizeKey: false }]);
						this.markErrorOnCells(TimeEntryDetails, currentDay, maxHours);

						// Break the loop if validation errors occur
						if (!this.formArray.valid) {
							break;
						}
					}
				}
				// Row wise validation if column wise valid
				if (this.formArray.valid) {
					let startRow = Number(magicNumber.zero),
						endRow = TimeEntryDetails.length;
					 if (this.isInOutEnable && (this.mealBreakData &&(this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty))) {
					 startRow = Number(magicNumber.zero);
					 endRow = TimeEntryDetails.length - Number(magicNumber.one);
					 } else if (this.isInOutEnable) {
					 startRow = Number(magicNumber.one);
					 } else if (this.mealBreakData && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)) {
					 endRow = TimeEntryDetails.length - Number(magicNumber.one);
					 }
					for (let row = Number(startRow); row < endRow; row++) {
						TimeEntryDetails.forEach((_: TimeEntryDetailGrid, rowIndex: number) => {
							if (rowIndex < startRow || rowIndex >= endRow) {
								return;
							}
							const hoursInCell = this.gridOperations().rowWiseTotal(row);
							if (hoursInCell > magicNumber.oneHundredSixtyEight) {
								this.toasterServ.displayToaster(ToastOptions.Error, 'CannotEnterMoreThan168Week');
								for (let i = Number(magicNumber.zero); i < this.dayOrder.length; i++) {
									this.formArray.at(row).get(this.dayOrder[i])?.setErrors({ 'errorOnCell': true });
								}
							}
						});
						break;
						// Only mark the first row with error
					}
				}
			}
		};

	};

	private validateBillableHours(TimeAdjustmentDetails: TimeEntryDetailGrid[], currentDay: string, totalHours: number) {
		const billableHour = this.billableHour[currentDay].toFixed(Number(magicNumber.two));
		if (totalHours !== Number(billableHour)) {
			this.displayError('EnteredHoursDoNoMatchBillableHoursSubmit');
			this.markErrorOnCells(TimeAdjustmentDetails, currentDay, Number(billableHour));
			if (!this.formArray.valid) return;
		}

	}

	private displayError(messageKey: string, currentDay?: string, maxHours?: number) {
		const toastMessage = currentDay && maxHours
			? [{ Value: currentDay, IsLocalizeKey: false }, { Value: maxHours.toFixed(2), IsLocalizeKey: false }]
			: undefined;

		this.toasterServ.displayToaster(ToastOptions.Error, messageKey, toastMessage);
	}


	private markErrorOnCells = (TimeEntryDetails: TimeEntryDetailGrid[], currentDay: string, maxHours: number) => {
		// Check if cell exceeds 24 hours and mark it as error
		for (let row = Number(magicNumber.zero); row < TimeEntryDetails.length; row++) {
			const hoursInCell = TimeEntryDetails[row][currentDay];
			if (typeof hoursInCell === 'number' && hoursInCell > maxHours) {
				this.formArray.at(row).get(currentDay)?.setErrors({ 'errorOnCell': true });
				break;
				// Only mark the first cell with error
			}
		}

		// Mark the entire column as error if no cell-level errors exist
		if (this.formArray.valid) {
			this.formArray.controls.forEach((control) => {
				control.get(currentDay)?.setErrors({ 'errorOnColumn': true });
			});
		}
	};

	public onCopyClick() {
		this.AddEditTimeEntryForm.markAsDirty();
		this.scrollToGrid();
		this.timeEntryService.getRecentTimesheetEntry(this.currAssignmentId, this.currWeekendingDate)
			.pipe(
				takeUntil(this.destroyAllSubscribtion$),
				catchError((error) => {
					// Handle error here
					this.toasterServ.displayToaster(ToastOptions.Error, 'Somethingwentwrong');
					// Optionally re-throw the error
					throw error;
				})
			).subscribe((response) => {
				if (isSuccessfulResponse(response)) {
					if (!this.manualOTDtEnabled)
						response.Data.TimeEntryDetails.forEach((element) => {
							element.HoursTypeId = null;
							element.HoursTypeName = null;
						});
					this.uniqueRow.clearCache();
					this.formArray.clear();
					this.populateDataInGrid(response.Data.TimeEntryDetails);

					this.cdr.markForCheck();
				}
				else {
					this.toasterServ.displayToaster(ToastOptions.Error, response.Message);
				}
			});
	};

	public onSubmitClick = () => {
		this.AddEditTimeEntryForm.markAllAsTouched();
		this.gridValidation().hoursValidation();
		if (this.AddEditTimeEntryForm.valid) {
			this.timesheetDialogOperations().openDialog();
		}
	};

	private removeFromForm(){
		if (this.isInOutEnable) {
			this.removedInOutData = this.formArray.at(magicNumber.zero);
			this.formArray.removeAt(magicNumber.zero);
		}

		// Check if MealBreakPenalty or RestBreakPenalty exists and backup last element before removing
		if (this.mealBreakData && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)) {
			this.removedPenaltyData = this.formArray.at(this.formArray.length - magicNumber.one);
			this.formArray.removeAt(this.formArray.length - magicNumber.one);
		}
	}

	private addForm(){
		if (this.removedInOutData) {
			this.formArray.insert(magicNumber.zero, this.removedInOutData);
		}
		if (this.removedPenaltyData) {
			this.formArray.insert(this.formArray.length, this.removedPenaltyData);
		}
	}
	private submitForm(toasterMessage: string) {
		this.removeFromForm();
		const payload = new TimeEntryAddEdit({
			...this.AddEditTimeEntryForm.getRawValue(),
			timeInOutDetails: this.formData
		});
		this.addForm();
		this.cdr.markForCheck();
		if (this.AddEditTimeEntryForm.valid) {
			this.timeEntryService.submitTimeEntry(payload).pipe(
				takeUntil(this.destroyAllSubscribtion$),
				catchError((error) => {
					// Handle error here
					this.toasterServ.displayToaster(ToastOptions.Error, error);
					throw error;
				})
			).subscribe((response) => {
				this.cdr.markForCheck();
				if (isSuccessfulResponse(response)) {
					this.commonGridViewService.resetAdvDropdown(this.entityId);
					this.toasterServ.displayToaster(ToastOptions.Success, toasterMessage);
					this.backToList();
					this.cdr.markForCheck();
				} else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterServ, this.localizationService);
					this.rollBackStatusId();
				}
				else if (response.StatusCode === Number(HttpStatusCode.Conflict)) {
					this.toasterServ.displayToaster(ToastOptions.Error, 'TimeSheetAlreadyExists', this.timeLabelTextParams);
					this.rollBackStatusId();
				}
				else if ('Data' in response && response.Data?.length) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(response.Message);
					this.toasterServ.displayToaster(
						ToastOptions.Error, `${localizedErrorMsg} ${createToasterTable(response.Data, this.localizationService)}`,
						[], true
					);
					this.rollBackStatusId();
				}
				else {
					const formattedResponse = this.formatedText(response.Message);
					this.toasterServ.displayToaster(ToastOptions.Error, formattedResponse.Text, [], formattedResponse.isHtmlContent);
					this.rollBackStatusId();
				}
			});
		}
	}

	private formatedText(input: string): { Text: string, isHtmlContent: boolean } {
		const delimiter = ';',
			parts = input.split(delimiter),
			formattedParts = parts.map((part) =>
				part.trim()),
			formattedText = formattedParts.join(`<br>`);
		return { Text: formattedText, isHtmlContent: formattedParts.length > Number(magicNumber.one) };
	}

	openExpandedTimesheet() {
		this.removeFromForm();
		const payload = new TimeEntryAddEdit(this.AddEditTimeEntryForm.getRawValue());
		if (!this.manualOTDtEnabled) {
			payload.TimeEntryDetails.forEach((detail) => {
				detail.HoursTypeId = null;
			});
		}
		if (this.manualOTDtEnabled) {
			payload.TimeEntryDetails = payload.TimeEntryDetails.filter((detail) =>
				detail.HoursTypeId !== null && detail.HoursTypeId !== '');
		}
		payload.TimeInOutDetails = this.formData;
		this.AddEditTimeEntryForm.markAllAsTouched();
		this.gridValidation().hoursValidation();
		if (this.AddEditTimeEntryForm.valid) {
			this.toasterServ.resetToaster();
			this.fetchCalculatedTimeEntryDetails(payload);
		}
		if (this.removedInOutData) {
			this.formArray.insert(magicNumber.zero, this.removedInOutData);
		}
		if (this.removedPenaltyData) {
			this.formArray.insert(this.formArray.length, this.removedPenaltyData);
		}
	}

	public getFormArrayData() {
		if (this.isInOutEnable) {
			this.removedInOutData = this.formArray.at(magicNumber.zero);
			this.formArray.removeAt(magicNumber.zero);
		}
		if (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty) {
			this.removedPenaltyData = this.formArray.at(this.formArray.length - magicNumber.one);
			this.formArray.removeAt(this.formArray.length - magicNumber.one);
		}
	}


	private fetchCalculatedTimeEntryDetails = (payload: TimeEntryAddEdit): void => {
		this.timeEntryService.getCalculatedTimeEntryDetails(payload).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ExpandedTimeSheetDetails[]>) => {
				if (isSuccessfulResponse(res)) {
					this.isExpandedDetails = true;
					this.expendedApiRes = res.Data;
				}
				else if (hasValidationMessages(res)) {
					this.isExpandedDetails = false;
					ShowApiResponseMessage.showMessage(res, this.toasterServ, this.localizationService);
				}
				else{
					const formattedResponse = this.formatedText(res.Message);
					this.toasterServ.displayToaster(ToastOptions.Error, formattedResponse.Text, [], formattedResponse.isHtmlContent);
					this.rollBackStatusId();
				}
				this.cdr.markForCheck();
			});
	};

	private rollBackStatusId = () => {
		if (this.isEditMode)
			this.changeStatusId(timeSheetStatusIds.Draft);
	};

	private changeStatusId = (statusId: number) => {
		this.AddEditTimeEntryForm.controls.StatusId.setValue(statusId);
		this.gridOperations().updateArrayStatusId(statusId);
	};

	private scrollToGrid() {
		this.scrollTo.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' });
	}

	public backToList = () => {
		this.clearSession = true;
		this.route.navigate([NavigationPaths.list]);
	};

	public changeIsExpandedDetails = () => {
		this.isExpandedDetails = false;
	};

	ngOnDestroy(): void {
		this.timeEntryService.updateHoldData(null);
		this.timeAdjustmentService.entriesArray = [];
		if ((this.isEditMode && this.AddEditTimeEntryForm.controls.StatusId.value !== Number(timeSheetStatusIds.Submitted))
			|| this.toasterServ.isRemovableToaster) {
			if (this.AddEditTimeEntryForm.controls.StatusId.value !== Number(timeSheetStatusIds.ReSubmitted))
				this.toasterServ.resetToaster();
		}

		if (this.clearSession)
			this.sessionStore.remove(TIMEANDEXPENTRYSELECTION);

		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		if (this.containerRef)
			this.containerRef.nativeElement.removeEventListener('click', this.handleClick.bind(this));
	}
	public clickForAdjustIcon(value: number, data: string) {
		const day = this.datePipe.transform(data, 'EEEE') as DaysOfWeek;
		this.weekday = day;
		if (value > Number(magicNumber.zero)) {
			this.selectedDate = data;
			this.isClickBox = !this.isClickBox;
		}
		this.renderer.addClass(document.body, 'scrolling__hidden');
	}

	public rowCallback = (context: RowClassArgs) => {
		const rowIndex = context.index;
		if (this.isInOutEnable && rowIndex === Number(magicNumber.zero)) {
			return { headerRow: true };
		} else {
			return { green: true };
		}
	};

	private ensurePTRowIsLast(): void {
		const formArrayValue = this.formArray.value,
	   ptRowIndex = formArrayValue.findIndex((item:{HoursTypeName:string}) =>
				item.HoursTypeName === 'PT');

		if (ptRowIndex !== Number(magicNumber.minusOne) && ptRowIndex !== formArrayValue.length - Number(magicNumber.minusOne)) {
			const ptRow = this.formArray.at(ptRowIndex);
			this.formArray.removeAt(ptRowIndex);
			this.formArray.push(ptRow);
		}
	}

	public onApply(newData: {data:[], obj:mealBreakSubmitData}){
		this.AddEditTimeEntryForm.markAsDirty();
		this.formData = [];
		this.formData = newData.data;
		this.updateBillableData(newData.obj);
		this.updateData(newData);
		   if (this.mealBreakData && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)) {
			 this.updatePenalityData(newData.obj);
		   }
	}

	private updateData(newData: {data:[], obj:mealBreakSubmitData}){
		const day = this.datePipe.transform(newData.obj.EntryDate, 'EEEE') as DaysOfWeek;
		this.daysData[day] = newData.obj;
		this.cdr.markForCheck();
	}
	private updateBillableData(newData: mealBreakSubmitData) {
		const date = new Date(newData.EntryDate),
	   day = date.getDay(),
	   dayName = this.customDays[day];
		this.billableHour[dayName] = Number(newData.TotalBillableHours);

		if (this.isInOutEnable) {
			const controlAtIndex0 = this.formArray.at(Number(magicNumber.zero)) as FormGroup,
		 control = controlAtIndex0.get(dayName);
			if (control) {
				control.setValue(Number(newData.TotalBillableHours));
			}
		}
	}
	private updatePenalityData(newData: mealBreakSubmitData) {
		const date = new Date(newData.EntryDate),
	   day = date.getDay(),
	   dayName = this.customDays[day],
	   controlAtIndex0 = this.formArray.at(this.formArray.length - Number(magicNumber.one)) as FormGroup,
	   control = controlAtIndex0.get(dayName);
	   if (control) {
			control.setValue(Number(newData.PenaltyHours));
		}
	}

	public clickOnBox(event: Event, value: number, Date: string) {
		const day = this.datePipe.transform(Date, 'EEEE') as DaysOfWeek;
		this.weekday = day;
		if (value > Number(magicNumber.zero)) {
			this.isClickBox = false;
			event.preventDefault();
		} else {
			this.isClickBox = !this.isClickBox;
			this.selectedDate = Date;
		}
		this.cdr.detectChanges();
	}
	public onClose(event:boolean){
		this.isClickBox = event;
	}
	public checkCondition(dataItem:any, isManual:boolean, rowIndex:number){
		let value :boolean = false;

		if(isManual){
			if(dataItem.get('HoursTypeName').value != 'PT' && (this.isInOutEnable
				? rowIndex > 0
				: true)
			){
				value = true;
			  }
		}
		if(!isManual){
			if( (this.isInOutEnable
				? rowIndex > 0
				: true)){
				value = true;
			}
		}
		return value;
	}

}

