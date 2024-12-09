/* eslint-disable max-lines-per-function */
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	Renderer2,
	signal,
	ViewChild,
	WritableSignal
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import getSubractedDate, {
	checkReadOnly,
	createToasterTable
} from '../../../expense/utils/CommonEntryMethods';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DatePipe, Location } from '@angular/common';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import {
	Observable,
	Subject,
	catchError,
	concatMap,
	of,
	switchMap,
	takeUntil,
	tap
} from 'rxjs';
import { TimeEntryDetailGrid } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid';
import { NavigationPaths } from '../route-constants/route-constants';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import {
	EntrySource,
	HoursType,
	UnitType,
	TIMEANDEXPENTRYSELECTION
} from '../../../common/enum-constants/enum-constants';
import { TimeAdjustmentAddEdit } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-add-edit';
import { CommonService } from '@xrm-shared/services/common.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { ScreenId, TimeEntryStatus } from '../../enum-constants/enum-constants';
import { TimeAdjustmentService } from 'src/app/services/acrotrac/time-adjustment.service';
import {
	AssignmentDetails,
	TimeAdjData,
	DayHours,
	FormItem,
	NavigationState,
	timeAdjustConst,
	DuplicateLineArgs,
	CostAccounting,
	ValidateExpandData,
	TimeAdjResponse,
	GetMealBreakData,
	DaysOfWeek,
	DayData,
	getDefaultDayData,
	mealBreakSubmitData,
	mapDataWithTimeEntry,
	MealBreak,
	MealBreakDetail,
	TimeSheetData,
	TimeAdjDetail

} from './enum';
import {
	WeeklyHours,
	WeeklyHoursFullTotal
} from '@xrm-core/models/acrotrac/time-entry/common-interface/weekly-hours';
import { WeeklyDates } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekly-dates';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { WeekDetailsMap } from '@xrm-core/models/acrotrac/time-entry/common-interface/day-details';
import { CostAccountingDetailsMap } from '@xrm-core/models/acrotrac/time-entry/common-interface/cost-accounting-details-map';
import { DropdownChangeEvent } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-config-details';
import {
	GenericResponseBase,
	isSuccessfulResponse
} from '@xrm-core/models/responseTypes/generic-response.interface';
import { AssignmentDetailsData } from '@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details';
import { SafeHtml } from '@angular/platform-browser';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { WeeklyHoursObj } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { convertDateFormat, convertMealBreakSubmitDataMethod, convertTimeToDateTime } from '../../../common/time-in-out/time-in-out-function';
import { TranslateService } from '@ngx-translate/core';


@Component({
	selector: 'app-adjustment-manual',
	templateUrl: './adjustment-manual.component.html',
	styleUrls: ['./adjustment-manual.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentManualComponent
implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  @ViewChild('container') containerRef: ElementRef;
  public showTooltip(e: MouseEvent): void {
  	const element = e.target as HTMLElement;
  	if (
  		(element.nodeName === 'TD' || element.className === 'k-column-title') &&
      element.offsetWidth < element.scrollWidth
  	) {
  		this.tooltipDir.toggle(element);
  	} else {
  		this.tooltipDir.hide();
  	}
  }
  public recordId: number = magicNumber.zero;
  public timeOrAdjustmentEntryId: number = magicNumber.zero;
  public submittedId = TimeEntryStatus.Submitted;
  public AddEditTimeEntryForm: FormGroup;
  public AddNewLineForm: FormGroup;
  public isEditMode: boolean = false;
  public currentStep = magicNumber.zero;
  public periodHeading: string = '';
  public isAddNewPopupOpen: boolean = false;
  public entityId: number = XrmEntities.TimeAdjustment;
  public hourDistributionRuleName: string;
  public OtEligibility: boolean;
  public currAssignmentId: number = magicNumber.zero;
  public currencyCode: string;
  public currTimesheetStatus: number;
  public initialData: TimeAdjData;
  private otEligibilityAllowed: boolean = false;
  public adjustmentType = [];
  public statusId: number;
  public timesheetDialogDisplay: boolean = false;
  public isCopyVisible: boolean = false;
  public isInOutEnable: boolean = true;
  public isClickBox: boolean = false;
  public ShiftList: DropdownModel[] = [];
  public weekendList: DropdownModel[] = [];
  public billableHour: WeeklyHours;
  public mealBreakData: GetMealBreakData;
  public HoursTypeList = [
  	{ Text: 'ST', Value: HoursType.ST },
  	{ Text: 'OT', Value: HoursType.OT },
  	{ Text: 'DT', Value: HoursType.DT }
  ];
  public dayOrder: string[] = [];
  public formPayload: TimeAdjustmentAddEdit;
  public penaltyObject: WeeklyHoursObj;
  public isExpandedDetails: boolean = false;
  public CostAccountingCodeList: DropdownModel[] = [];
  public columnWiseTotal: WeeklyHoursFullTotal = {
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
  public headerValue: WeeklyDates = {
  	Sunday: '',
  	Monday: '',
  	Tuesday: '',
  	Wednesday: '',
  	Thursday: '',
  	Friday: '',
  	Saturday: ''
  };
  public formArray: FormArray;
  public selectedDate: string;
  public timesheetGridFooterMsg: SafeHtml = '';
  public uKey: string = '';
  private currRoute: string = NavigationPaths.addEdit;
  private clearSession: boolean = true;
  private addMoreLocalizedMsg: WritableSignal<string> = signal('AddRow');
  private timesheetConfigDetails: AssignmentDetails;
  private dateFormat: string;
  public currWeekendingDate: string = '';
  private disabledConfigData: WeekDetailsMap = {};
  private assignmentCostData: CostAccountingDetailsMap = {};
  private sectorId: number = magicNumber.zero;
  private workLocationId: number = magicNumber.zero;
  private customDays: string[] = [
  	'Sunday',
  	'Monday',
  	'Tuesday',
  	'Wednesday',
  	'Thursday',
  	'Friday',
  	'Saturday'
  ];
  private destroyAllSubscribtion$ = new Subject<void>();
  private timeLabelTextParams: DynamicParam[] = [{ Value: 'Timesheet', IsLocalizeKey: true }];
  private addToasterMessage: string =
  	'TheTimeRecordSuccessfullySubmittedAndMailSentToApprover';
  private editToasterMessage: string = 'TheTimesheetRecordHasBeenResubmitted';
  private uniqueRow;
  public daysData: Record<DaysOfWeek, DayData> = {
       	Sunday: getDefaultDayData(),
       	Monday: getDefaultDayData(),
       	Tuesday: getDefaultDayData(),
       	Wednesday: getDefaultDayData(),
       	Thursday: getDefaultDayData(),
       	Friday: getDefaultDayData(),
       	Saturday: getDefaultDayData()
  };
  public daysData2: Record<DaysOfWeek, DayData> = {
  	Sunday: getDefaultDayData(),
  	Monday: getDefaultDayData(),
  	Tuesday: getDefaultDayData(),
  	Wednesday: getDefaultDayData(),
  	Thursday: getDefaultDayData(),
  	Friday: getDefaultDayData(),
  	Saturday: getDefaultDayData()
  };
  public formData:any = [];
  public weekday: DaysOfWeek;
  private currAssgmntDetails: AssignmentDetailsData;
  public penaltyEnabled: boolean = false;

  public inOutWeekendingDate:string;
  public removedInOutData: AbstractControl | null = null;
  public removedPenaltyData: AbstractControl | null = null;
  public mealBreakId = [magicNumber.oneEightyOne, magicNumber.oneEightyTwo, magicNumber.oneEightyThree];

  @ViewChild('scrollTo') scrollTo!: ElementRef;

  // eslint-disable-next-line max-params
  constructor(
    private route: Router,
    private localizationService: LocalizationService,
    private toasterServ: ToasterService,
    private datePipe: DatePipe,
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
	private renderer: Renderer2,
    private location: Location,
    private timeAdjustmentService: TimeAdjustmentService,
	private translateService: TranslateService
  ) {
  	this.uniqueRow = this.memoization();
  	this.AddNewLineForm = this.formBuilder.group({
  		CostAccountingCodeId: [
  			null,
  			this.customValidations.requiredValidationsWithMessage(
  				'PleaseSelectData',
  				'CostAccountingCode'
  			)
  		],
  		ShiftId: [
  			null,
  			this.customValidations.requiredValidationsWithMessage(
  				'PleaseSelectData',
  				'Shift'
  			)
  		],
  		HoursTypeId: [null]
  	});
  	this.formInitialization();
  }

  private formInitialization() {
  	this.AddEditTimeEntryForm = this.formBuilder.group({
  		WeekendingDate: [
  			null,
  			this.customValidations.requiredValidationsWithMessage(
  				'PleaseSelectData',
  				'WeekendingDate'
  			)
  		],
  		StatusId: [timeAdjustConst.Submitted],
  		AssignmentId: [magicNumber.zero],
  		EntrySourceId: [EntrySource.Web],
  		UnitTypeId: [UnitType.Hour],
  		ContractorComments: [null],
  		TimeOrAdjustmentEntryId: [null],
  		TimeAdjustmentDetails: this.formBuilder.array([]),
  		isValidate: [false],
  		ReviewerComment: [],
  		AdjustmentType: [
  			null,
  			this.customValidations.requiredValidationsWithMessage(
  				'PleaseSelectData',
  				'AdjustmentType'
  			)
  		]
  	});
  }
  ngOnInit(): void {
  	try {
  		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
  		let state: NavigationState | null = null;
  		this.formArray = this.AddEditTimeEntryForm.get('TimeAdjustmentDetails') as FormArray;
  		this.activatedRoute.params
  			.pipe(
  				takeUntil(this.destroyAllSubscribtion$),
  				switchMap((param) => {
  					this.currRoute = this.route.url;
  					this.uKey = param['id'] ?? '';
  					state = this.location.getState() as NavigationState | null;
  					this.isEditMode =
		  state?.status === timeAdjustConst.declined
			  ? true
			  : this.isEditMode;
  					return this.getTimeAdjustType().pipe(switchMap(() =>
  						this.timeAdjustmentMode(timeAdjustConst.adjustUkey, this.uKey)));
  				})
  			)
  			.subscribe({
  				next: () => {
  					this.cdr.detectChanges();
  				}
  			});
  	} catch (error) {
  		console.log("error", error);
  	}
  }

  public getTimeAdjustType() {
  	return this.timeAdjustmentService.getTimeAdjustmentType().pipe(
  		takeUntil(this.destroyAllSubscribtion$),
  		tap((res: ApiResponse) => {
  			if (res.StatusCode === HttpStatusCode.Ok) {
  				this.adjustmentType = res.Data;
  			}
  		})
  	);
  }

  private timeAdjustmentMode(url: string, ukey: string) {
  	return this.timeEntryService.getTimeAdjustBasedUkey(url, ukey).pipe(
  		takeUntil(this.destroyAllSubscribtion$),
  		switchMap((res: TimeAdjResponse) => {
  			if (!res.getTadjUkey.Data) return [];

  			const { Data } = res.getTadjUkey,
  				localizeValue = this.datePipe.transform(
  					Data.WeekendingDate,
  					'MM/dd/YYYY'
  				);
  			this.timeAdjustmentService.clearInOutData();
  			this.inOutWeekendingDate = Data.WeekendingDate;
  			this.currTimesheetStatus = Data.StatusId;
  			this.initialData = Data;
  			this.mealBreakData = res.getMealBreak.Data;
  			if((this.mealBreakData.AllowInOutTimeSheet ||this.mealBreakData.AllowInOutMealBreak)
				 && Data.TimeInOutDetails.length > Number(magicNumber.zero)){
  				this.updateDataInDataArray(Data.TimeInOutDetails);
  			}
  			if(this.mealBreakData.RestBreakPenalty || this.mealBreakData.MealBreakPenalty){
  				this.penaltyEnabled = true;
  			}
  			this.isInOutEnable = this.mealBreakData.AllowInOutTimeSheet;
  			Data.WeekendingDate = String(localizeValue);
  			this.updateUIWithTimeSheetData(Data);
  			this.AddNewLineForm.controls['HoursTypeId'].patchValue({
  				Text: 'ST',
  				Value: HoursType.ST
  			});
  			return this.getTimesheetConfigDetails(
  				this.currAssignmentId,
  				this.currWeekendingDate,
  				Data
  			);
  		}),
  		takeUntil(this.destroyAllSubscribtion$)
  	);
  }

  public isNavigationState(obj: NavigationState): obj is NavigationState {
  	return (
  		obj &&
      typeof obj.type === 'string' &&
      typeof obj.navigationId === 'number'
  	);
  }

  ngAfterViewInit(): void {
  	this.translateService.stream('AddRow').pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((res: string) => {
  			this.addMoreLocalizedMsg.set(res);
  			this.localizeFooterLink();
  			this.cdr.markForCheck();
  			this.containerRef.nativeElement.addEventListener('click', this.handleClick.bind(this));
  		});

  }

  private localizeFooterLink() {
  	const rawHtml: string = `<a style="color: #4158D0; cursor: pointer;">+ ${this.addMoreLocalizedMsg()} </a>`;
  	this.timesheetGridFooterMsg = rawHtml;
  }

  public handleClick(event: Event) {
  	const target = event.target as HTMLElement;
  	if (target.innerHTML === `+ ${this.addMoreLocalizedMsg()} `) {
  		this.dialogPopupOperations().openDialog();
  	}
  }

  private getTimesheetConfigDetails(
  	assignmentId: number,
  	weekendingDate: string,
  	isData?: TimeAdjData
  ) {
  	return new Observable((observer) => {
  		this.timeEntryService
  			.getTimesheetConfigDetails(assignmentId, weekendingDate)
  			.pipe(takeUntil(this.destroyAllSubscribtion$))
  			.subscribe((res: ApiResponse) => {
  				if (res.Data) {
  					this.bindTimeSheetConfigDetails(res.Data, isData);
  					if (isData) {
  						this.fetchWeekendingDates(isData.AssignmentId);
  					}
  					this.cdr.detectChanges();
  				}
  				observer.next();
  				observer.complete();
  			});
  	});
  }

  private bindTimeSheetConfigDetails(data: AssignmentDetails, isData?: TimeAdjData) {
  	this.timesheetConfigDetails = data;
  	this.hourDistributionRuleName = data.HourDistributionRuleName;
  	this.OtEligibility = data.IsOtEligible;
  	data.CostAccountingDetails.forEach((element: CostAccounting) => {
  		this.assignmentCostData[element.CostAccountingCodeId] = element;
  	});
  	this.AddNewLineForm.controls['HoursTypeId'].patchValue({
  		Text: 'ST',
  		Value: HoursType.ST
  	});
  	this.AddNewLineForm.controls['HoursTypeId'].addValidators(this.customValidations.requiredValidationsWithMessage(
  			'PleaseSelectData',
  			'HourType'
  		));
  	this.AddNewLineForm.controls['HoursTypeId'].updateValueAndValidity();
  	this.cdr.detectChanges();
	  if (isData) {
  		this.patchDataFromGetByUkey(isData);
  	}
  }

  private updateUIWithTimeSheetData(data: TimeAdjData) {
  	const {
  			AssignmentId,
  			Id,
  			StatusName,
  			TimeEntryCode,
  			StatusId,
  			WeekendingDate,
  			AdjustmentTypeId,
  			ContractorComment
  		} = data,
  		screen = this.isEditMode
  			? 'edit'
  			: 'add';
  	this.timeEntryService.updateHoldData({
  		TimeEntryCode: TimeEntryCode,
  		StatusName: StatusName,
  		StatusId: StatusId,
  		Id: Id,
  		Screen: screen,
  		EntityId: this.entityId
  	});
  	this.currTimesheetStatus = StatusId;
  	this.currAssignmentId = AssignmentId;
  	this.currWeekendingDate = WeekendingDate;
  	this.timeOrAdjustmentEntryId = Id;

  	this.AddEditTimeEntryForm.patchValue({
  		AdjustmentType: AdjustmentTypeId
  			? String(AdjustmentTypeId)
  			: null,
  		contractorComments: ContractorComment
  	});
  	if (this.isEditMode) {
  		this.recordId = magicNumber.zero;
  	}
  }

  private fetchWeekendingDates(assignmentId: number) {
  	try {
  		this.expEntryService
  			.getAllWeekendingDatesForEntry(
  				this.entityId,
  				assignmentId,
  				ScreenId.AddEdit,
  				this.dateFormat
  			)
  			.pipe(takeUntil(this.destroyAllSubscribtion$))
  			.subscribe((result) => {
  				this.weekendList = result;
  			});
  	} catch (error) {
  		console.log('fetchWeekendingDates', error);
  	}
  }

  public logEvent(entity: number, recordId: number) {
  	this.eventLog.entityId.next(entity);
  	this.eventLog.recordId.next(recordId);
  	this.cdr.detectChanges();
  }

  private patchDataFromGetByUkey(data: TimeAdjData) {
  	const {
  		StatusId,
  		ContractorComment,
  		AssignmentId,
  		WeekendingDate,
  		ReviewerComment,
  		UnitTypeId,
  		TimeEntryDetails
  	} = data;
  	this.AddEditTimeEntryForm.patchValue({
  		AssignmentId: AssignmentId,
  		WeekendingDate: WeekendingDate,
  		StatusId: StatusId,
  		ContractorComments: ContractorComment,
  		ReviewerComment: ReviewerComment,
  		UnitTypeId: UnitTypeId
  	});
  	if (this.isInOutEnable) {
  		this.changeMethod(TimeEntryDetails);
  	}
  	if (
  		this.mealBreakData.MealBreakPenalty ||
      this.mealBreakData.RestBreakPenalty
  	) {
  		this.changeMethodForPenality(TimeEntryDetails);
  	}

  	this.changeTimeSheetGridHeading({ Value: WeekendingDate } as DropdownModel);
  	this.populateDataInGrid(TimeEntryDetails);
  }

  private changeMethod(data: TimeEntryDetailGrid[]) {
  	this.billableHour = this.initialData.InOutDetails.BillableHour;
  	const mapData = mapDataWithTimeEntry(this.billableHour),
	 exists = data.some((item) =>
  		item.Id === mapData.Id);

  	if (!exists) {
	  data.unshift(mapData);
  	}
  }

  private changeMethodForPenality(data: TimeEntryDetailGrid[]) {
  	const PenalityData = mapDataWithTimeEntry(this.initialData.InOutDetails.PenaltyHour, 'PT'),
	 exists = data.some((item) =>
  			item.Id === PenalityData.Id);

  	if (!exists) {
	  data.push(PenalityData);
  	}
  }

  private populateDataInGrid(timeEntryDetails: TimeEntryDetailGrid[]) {
  	timeEntryDetails.forEach((item: TimeEntryDetailGrid) => {
  		const args: DuplicateLineArgs = {
  			CostAccountingCodeName: item.CostAccountingCodeName,
  			ShiftName: item.ShiftName,
  			HoursTypeName: item.HoursTypeName
  		};
  		this.uniqueRow.duplicateLine(args, item);
  	});
  	this.cdr.detectChanges();
  }

  public setCurrencyCode(currencyCode: string | undefined | null) {
  	this.currencyCode = currencyCode ?? 'USD';
  }

  public bindingTimeSheetDetails(assignmentMoreDetails: AssignmentDetailsData) {
  	this.currAssgmntDetails = assignmentMoreDetails;
  	this.timeEntryService.updateHoldData({
  		AssignmentCode: assignmentMoreDetails.AssignmentCode,
  		ContractorName: assignmentMoreDetails.ContractorName
  	});
  	this.sectorId = Number(assignmentMoreDetails.SectorId);
  	this.otEligibilityAllowed = assignmentMoreDetails.OtEligibility;
  	this.workLocationId = Number(assignmentMoreDetails.WorkLocationId);
  }

  private singleRecordDropdownPatch = (
  	data: DropdownModel[],
  	formGroup: FormGroup,
  	controlName: string
  ) => {
  	if (data.length === Number(magicNumber.one)) {
  		formGroup.controls[controlName].patchValue(data[magicNumber.zero]);
  	}
  };

  public changeTimeSheetGridHeading = (selectedDate: DropdownModel) => {
  	this.periodHeading = this.createEntryPeriodHeading(
  		selectedDate.Value,
  		'TimesheetPeriod'
  	);
  	this.setAllValidation(true);
  };

  public onWeekendingDropdownChange = ({
  	selectedWeekending,
  	path
  }: DropdownChangeEvent) => {
  	if (selectedWeekending.Value && path === this.currRoute) {
  		of({
  			assignmentId: this.currAssignmentId,
  			weekendingDate: selectedWeekending.Value
  		})
  			.pipe(
  				concatMap(({ assignmentId, weekendingDate }) =>
  					this.getTimesheetConfigDetails(assignmentId, weekendingDate)),
  				takeUntil(this.destroyAllSubscribtion$)
  			)
  			.subscribe({
  				next: () => {
  					this.changeTimeSheetGridHeading(selectedWeekending);
  				}
  			});
  	} else {
  		this.uniqueRow.clearCache();
  		this.formArray.clear();
  		this.clearSession = false;
  		window.history.replaceState(null, '', NavigationPaths.list);
  		window.history.pushState(null, '', NavigationPaths.list);
  		if (this.isEditMode) {
  			sessionStorage.setItem(
  				TIMEANDEXPENTRYSELECTION,
  				JSON.stringify({
  					AssignmentDetails: this.currAssgmntDetails,
  					WeekendingDate:
              this.AddEditTimeEntryForm.controls['WeekendingDate'].value
  				})
  			);
  		}
  		this.route.navigate([path]);
  	}
  };

  private createEntryPeriodHeading = (
  	endDate: string,
  	preffix: string
  ): string => {
  	const subtractedDate = getSubractedDate(endDate, magicNumber.six),
  		transformedDate: string | null = this.datePipe.transform(
  			subtractedDate,
  			'MM/dd/YYYY'
  		);
  	this.setAllHeader(transformedDate);
  	return `${this.localizationService.GetLocalizeMessage(preffix)}: 
		${this.localizationService.TransformDate(transformedDate)} - ${this.localizationService.TransformDate(endDate)}`;
  };

  private setAllHeader(transformedDate: string | null) {
  	const initialDate: Date = this.localizationService.GetDate(transformedDate ?? '');
  	this.getNextSevenDates(initialDate);
  }

  private getNextSevenDates(initialDate: Date) {
  	this.dayOrder = [];
  	for (let i = Number(magicNumber.zero); i < Number(magicNumber.seven); i++) {
  		const nextDate = this.localizationService.GetDate(initialDate);
  		nextDate.setDate(initialDate.getDate() + i);
  		// eslint-disable-next-line one-var
  		const formattedDate = this.datePipe.transform(nextDate, 'MM/dd/YYYY'),
  			curretDay = this.datePipe.transform(formattedDate, 'EEEE') ?? '';
  		this.headerValue[curretDay == 'Saturday'
  			? 'Saturday'
  			: curretDay] =
        formattedDate ?? '';

  		this.dayOrder.push(curretDay == 'Saturday'
  			? 'Saturday'
  			: curretDay);
  	}
  }

  public giveControlName(date: Date): string {
  	return this.datePipe.transform(date, 'EEEE') ?? '';
  }

  public onDecline = () =>
  	this.dialogPopupOperations().closeDialog();

  public dialogPopupOperations = () => {
  	return {
  		openDialog: () => {
  			this.toasterServ.resetToaster();
  			this.isAddNewPopupOpen = true;
  			this.getDropdownData();
  			if (!this.otEligibilityAllowed)
  				this.HoursTypeList = [{ Text: 'ST', Value: HoursType.ST }];
  		},
  		closeDialog: () => {
  			this.isAddNewPopupOpen = false;
  			this.AddNewLineForm.reset({
  				HoursTypeId: { Text: 'ST', Value: HoursType.ST }
  			});
  		}
  	};
  };

  public timesheetDialogOperations = () => {
  	return {
  		submitNewForm: (operation: string) => {
  			const caseOperation = { toasterMsg: '' };
  			this.caseHandling(operation, caseOperation);
  			this.updateExistingRecord();
  		}
  	};
  };

  public getControlValue(controlName: string) {
  	return this.AddEditTimeEntryForm.get(controlName)?.value;
  }

  private updateExistingRecord = () => {
  	this.AddEditTimeEntryForm.get('TimeOrAdjustmentEntryId')?.setValue(this.timeOrAdjustmentEntryId);
  	if (this.getControlValue('AdjustmentType')?.Value) {
  		this.AddEditTimeEntryForm.get('AdjustmentType')?.setValue(parseInt(this.getControlValue('AdjustmentType')?.Value));
  	} else {
  		this.AddEditTimeEntryForm.get('AdjustmentType')?.setValue(parseInt(this.getControlValue('AdjustmentType')));
  	}

  	const updatedFormArray = this.getFormArrayData(),
  		payload = new TimeAdjustmentAddEdit({
  			...this.AddEditTimeEntryForm.getRawValue(),
  			TimeAdjustmentDetails: updatedFormArray,
  			timeInOutDetails: this.formData
  		});
  	this.submitData(payload);
  };

  public getFormArrayData() {
  	if (this.isInOutEnable) {
  		this.removedInOutData = this.formArray.at(magicNumber.zero);
  		this.formArray.removeAt(magicNumber.zero);
  	}

  	// Check if MealBreakPenalty or RestBreakPenalty exists and backup last element before removing
  	if (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty) {
  		this.removedPenaltyData = this.formArray.at(this.formArray.length - magicNumber.one);
  		this.formArray.removeAt(this.formArray.length - magicNumber.one);
  	}
  	const rawValues = this.formArray.getRawValue();

  	return rawValues.map((item: TimeEntryDetailGrid) => {
	  return {
  			id: this.isEditMode
  				? item.Id
  				: magicNumber.zero,
  			costAccountingCodeId: Number(item.CostAccountingCodeId as string),
  			shiftId: Number(item.ShiftId as string),
  			jobTitle: item.JobTitle,
  			statusId: this.isEditMode
  				? timeAdjustConst.ReSubmitted
  				: timeAdjustConst.Submitted,
  			sunday: this.returnZeroIfNull(item.Sunday),
  			monday: this.returnZeroIfNull(item.Monday),
  			tuesday: this.returnZeroIfNull(item.Tuesday),
  			wednesday: this.returnZeroIfNull(item.Wednesday),
  			thursday: this.returnZeroIfNull(item.Thursday),
  			friday: this.returnZeroIfNull(item.Friday),
  			saturday: this.returnZeroIfNull(item.Saturday),
  			preFriday: null,
  			hoursTypeId: Number(item.HoursTypeId as string)
	  };
  	});
  }

  private returnZeroIfNull(value: number | null | undefined) {
  	return value ?? magicNumber.zero;
  }

  private submitValidateData(payload: ValidateExpandData) {
  	this.timeAdjustmentService
  		.submitValidateData(payload)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((response: GenericResponseBase<[]>) => {
  			this.handleExpandedDetails(response);
  		});
  }

  private submitData(payload: TimeAdjustmentAddEdit) {
  	if (this.AddEditTimeEntryForm.valid) {
  		if (this.isEditMode) {
  			payload.UKey = this.uKey;
  			this.updateApi(payload);
  		} else {
  			this.addApi(payload);
  		}
  	}
  }

  private addApi(payload: TimeAdjustmentAddEdit) {
  	this.addForm();
  	this.timeAdjustmentService
  		.submitAdjustmentData(payload)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((response: GenericResponseBase<[]>) => {

  			this.handleStandardResponse(response);
  			this.cdr.detectChanges();
  		});
  }

  public handleExpandedDetails(response: GenericResponseBase<[]>) {
  	if (isSuccessfulResponse(response)) {
  		this.isExpandedDetails = true;
  	} else {
  		if (this.removedInOutData) {
  			this.formArray.insert(magicNumber.zero, this.removedInOutData);
  		}
  		if (this.removedPenaltyData) {
  			this.formArray.insert(this.formArray.length, this.removedPenaltyData);
  		}
  		this.isExpandedDetails = false;
  		this.toasterServ.displayToaster(ToastOptions.Error, response.Message);
  	}
  }

  public handleStandardResponse(response: GenericResponseBase<[]>) {
  	if (isSuccessfulResponse(response)) {
  		this.handleSuccessResponse();
  	} else {
  		this.handleErrorResponse(response);
  	}
  }

  public handleSuccessResponse() {
  	this.commonGridViewService.resetAdvDropdown(this.entityId);
  	this.eventLog.isUpdated.next(true);
  	const msg = this.isEditMode
  			? this.editToasterMessage
  			: this.addToasterMessage,
  		statusId = this.AddEditTimeEntryForm.controls['StatusId'].value;

  	this.toasterServ.displayToaster(ToastOptions.Success, msg);
  	this.AddEditTimeEntryForm.markAsPristine();

  	if (
  		statusId === timeAdjustConst.Submitted ||
      statusId === timeAdjustConst.ReSubmitted
  	) {
  		this.backToList();
  	}
  }

  public handleErrorResponse(response: GenericResponseBase<[]>) {
  	if (
  		response.ValidationMessages != undefined &&
      response.ValidationMessages.length > Number(magicNumber.zero)
  	) {
  		ShowApiResponseMessage.showMessage(
  			response,
  			this.toasterServ,
  			this.localizationService
  		);
  	} else if (response.StatusCode === Number(HttpStatusCode.Conflict)) {
  		this.toasterServ.displayToaster(
  			ToastOptions.Error,
  			'EnitityAlreadyExists',
  			this.timeLabelTextParams
  		);
  	} else if (
  		'Data' in response &&
      response.Data != undefined &&
      response.Data.length > Number(magicNumber.zero)
  	) {
  		const localizedErrorMsg = this.localizationService.GetLocalizeMessage(response.Message.trim());
  		this.toasterServ.displayToaster(
  			ToastOptions.Error,
  			`${localizedErrorMsg} ${createToasterTable(
  				response.Data,
  				this.localizationService
  			)}`,
  			[],
  			true
  		);
  	} else if (response.StatusCode === Number(HttpStatusCode.BadRequest)) {
  		this.toasterServ.displayToaster(
  			ToastOptions.Error,
  			response.Message,
  			[],
  			true
  		);
  	} else {
  		this.toasterServ.displayToaster(ToastOptions.Error, response.Message);
  	}
  }

  private updateApi(payload: TimeAdjustmentAddEdit) {
  	this.addForm();
  	this.timeAdjustmentService
  		.updateAdjustmentData(payload, this.uKey)
  		.pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((response: GenericResponseBase<[]>) => {

  			this.handleStandardResponse(response);
  			this.cdr.detectChanges();
  		});
  }

  public addForm(){
  	if (this.removedInOutData) {
  		this.formArray.insert(magicNumber.zero, this.removedInOutData);
  	}
  	if (this.removedPenaltyData) {
  		this.formArray.insert(this.formArray.length, this.removedPenaltyData);
  	}
  }
  private caseHandling = (
  	scenario?: string,
  	operation?: { toasterMsg: string }
  ) => {
  	try {
  		const addMsg =
        this.columnWiseTotal.Total > parseInt(`${magicNumber.zero}`)
        	? this.addToasterMessage
        	: 'TimesheetSubmittedForZeroHour';
  		this.addToasterMessage=addMsg;

  		switch (scenario) {
  			case 'Add':
  				this.changeStatusId(timeAdjustConst.Submitted);
  				if (operation) {
  					operation.toasterMsg = addMsg;
  				}
  				break;
  			case 'Edit':
  				this.changeStatusId(timeAdjustConst.ReSubmitted);
  				if (operation) {
  					operation.toasterMsg = this.editToasterMessage;
  				}
  				this.gridValidation().hoursValidation();
  				break;
  			default:
  		}
  	} catch (error) {
  		console.log('caseHandling', error);
  	}
  };


  public onClickAddNewLineItem = () => {
  	this.AddNewLineForm.markAllAsTouched();
  	if (this.AddNewLineForm.valid) {

  		const newLineItem = new TimeEntryDetailGrid(this.AddNewLineForm.getRawValue()),
  			args: DuplicateLineArgs = {
  				CostAccountingCodeName: newLineItem.CostAccountingCodeName,
  				ShiftName: newLineItem.ShiftName,
  				HoursTypeName: newLineItem.HoursTypeName
  			},
  			isDuplicate = this.uniqueRow.duplicateLine(args, newLineItem);
  		this.dialogPopupOperations().closeDialog();
  		if (!isDuplicate) this.formArray.markAsDirty();
  		this.scrollToGrid();
  	}
  };

  private memoization = () => {
  	const cache: string[] = [],
	 uniqueRow = {
	  duplicateLine: (args: DuplicateLineArgs, newLine: TimeEntryDetailGrid) => {
  			const key = JSON.stringify(args);
  			if (cache.includes(key)) {
		  this.toasterServ.displayToaster(
  					ToastOptions.Error,
  					'TimesheetDuplicateLineErrorMsg'
		  );
		  return true;
  			} else {
		  cache.push(key);
		  this.gridOperations().add(new TimeEntryDetailGrid(newLine));
		  return false;
  			}
	  },
	  removeElement: (index: number) => {
  			cache.splice(index, Number(magicNumber.one));
	  },
	  clearCache: () => {
  			cache.length = Number(magicNumber.zero);
	  }
  	};
  	return uniqueRow;
  };

  public deleteLineItem = (rowIndex: number) => {
  	this.toasterServ.resetToaster();
  	this.gridOperations().delete(rowIndex);
  	if (!this.formArray.length) {
  		this.containerRef.nativeElement.addEventListener(
  			'click',
  			this.handleClick.bind(this)
  		);
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

  // eslint-disable-next-line max-lines-per-function
  public gridOperations = () => {
  	return {
  		add: (addNewLineItem: TimeEntryDetailGrid) => {
  			addNewLineItem.SundayDisable = true;
  			this.formArray.push(this.formBuilder.group(addNewLineItem));
  			if(this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty){
  				this.ensurePTRowIsLast();
  			}
  			this.setAllValidation();
  		},
  		delete: (rowIndex: number) => {
  			this.uniqueRow.removeElement(rowIndex);
  			this.formArray.removeAt(rowIndex);
  			this.formArray.markAsDirty();
  		},
  		columnWiseTotal: (day: string) => {
  			let columnwiseData = this.formArray.value,
  				columnWiseDataIfPenalty = this.formArray.value;
			 if (this.isInOutEnable && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)) {
  				columnwiseData = this.formArray.value.slice(magicNumber.one);
  				columnWiseDataIfPenalty = this.formArray.value.slice(magicNumber.one, this.formArray.value.length - magicNumber.one);
  			}
  			 else if (this.isInOutEnable) {
  				columnwiseData = this.formArray.value.slice(magicNumber.one);
				  columnWiseDataIfPenalty = this.formArray.value.slice(magicNumber.one);
  			}
  			else if (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty) {
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
  		rowWiseTotal: (rowIndex: number) => {
  			const row = this.formArray.value[rowIndex];
  			this.formArray.value[rowIndex].TotalHour = this.customDays.reduce(
  				(acc, curr) => {
  					return acc + row[curr];
  				},
  				magicNumber.zero
  			);

  			this.formArray
  				.at(rowIndex)
  				.get('TotalHour')
  				?.setValue(this.formArray.value[rowIndex].TotalHour);
  			return this.formArray.value[rowIndex].TotalHour;
  		},
  		updateArrayStatusId: (statusId: number) => {
  			this.formArray.value.forEach((control: FormControl, index: number) => {
  				this.formArray.at(index).get('StatusId')?.setValue(statusId);
  			});
  		},
  		clearValidations: () => {
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
  		const formObject: any = {};
  		if (
  			!(element.value.CostAccountingCodeId in this.disabledConfigData) ||
        isWeekendingChange
  		) {
  			this.dayOrder.forEach((value: string) => {
  				formObject[value] = checkReadOnly(
  					this.headerValue[value],
  					element.value.CostAccountingCodeId,
  					this.timesheetConfigDetails,
  					this.assignmentCostData
  				);
  			});
  			this.disabledConfigData[element.value.CostAccountingCodeId] =
          formObject;
  		}
  	});
  }

  public checkReadOnlyValidation(
  	CostAccountingCodeId: number,
  	day: string,
  	index: number
  ): boolean {
  	if (this.disabledConfigData[CostAccountingCodeId][day].isDisabled)
  		(this.formArray.at(index) as FormGroup).controls[day].setValue(magicNumber.zero);

  	return this.disabledConfigData[CostAccountingCodeId][day].isDisabled;
  }

  public getFormControl(headerValue: string, rowIndex: number): FormControl {
  	const control = this.formArray.at(rowIndex).get(headerValue) as FormControl;

  	return control;
  }

  // eslint-disable-next-line max-lines-per-function
  private getDropdownData = () => {
  		this.timeAdjustmentService
  			.getCostAccountingCodeDrp(
  				this.currAssignmentId,
  				this.currWeekendingDate,
  				this.initialData.Id
  			)
  			.pipe(
  				takeUntil(this.destroyAllSubscribtion$),
  				catchError((error) => {
  					this.toasterServ.displayToaster(
  						ToastOptions.Error,
  						'Somethingwentwrong'
  					);
  					throw error;
  				})
  			)
  			.subscribe((response) => {
  				if (isSuccessfulResponse(response)) {
  					const { Data } = response;
  					this.CostAccountingCodeList = Data;
  					this.singleRecordDropdownPatch(
  						this.CostAccountingCodeList,
  						this.AddNewLineForm,
  						'CostAccountingCodeId'
  					);
  					this.cdr.detectChanges();
  				}
  			});


  		this.timeAdjustmentService
  			.getshiftDropdown({
  				sectorId: this.sectorId,
  				recordId: this.initialData.Id,
  				locationId: this.workLocationId
  			})
  			.pipe(takeUntil(this.destroyAllSubscribtion$))
  			.subscribe((response) => {
  				this.ShiftList = response.Data;
  				this.singleRecordDropdownPatch(
  					this.ShiftList,
  					this.AddNewLineForm,
  					'ShiftId'
  				);
  				this.cdr.detectChanges();
  			});
  };

  public gridValidation = () => {
  	return {
	  hoursValidation: (mesageKey?:string) => {
  			const { TimeAdjustmentDetails } = this.AddEditTimeEntryForm.getRawValue() as TimeAdjustmentAddEdit,
		 maxDailyHours = magicNumber.twentyFour,
		 maxWeeklyHours = magicNumber.oneHundredSixtyEight;
  			this.gridOperations().clearValidations();
  			this.validateDailyHours(TimeAdjustmentDetails, maxDailyHours, mesageKey);
  			this.validateWeeklyHours(TimeAdjustmentDetails, maxWeeklyHours);
	  }
  	};
  };

  // Function to validate daily hours for each day
  private validateDailyHours(TimeAdjustmentDetails: TimeEntryDetailGrid[], maxHours: number, mesageKey:string | undefined) {
  	this.dayOrder.forEach((currentDay: string) => {
	  const totalHours = this.tempcolumnWiseTotal[currentDay].toFixed(Number(magicNumber.two));
	  if (this.isInOutEnable) {
  			this.validateBillableHours(TimeAdjustmentDetails, currentDay, Number(totalHours), mesageKey);
	  }

	  if (Number(totalHours) > maxHours) {
  			this.displayError('RestrictTotalHours', currentDay, maxHours);
  			this.markErrorOnCells(TimeAdjustmentDetails, currentDay, maxHours);
  			if (!this.formArray.valid) return;
	  }
  	});
  }


  // eslint-disable-next-line max-params
  private validateBillableHours(TimeAdjustmentDetails: TimeEntryDetailGrid[], currentDay: string, totalHours: number, mesageKey:string | undefined) {
  	const billableHour = this.billableHour[currentDay];
  	if (totalHours !== billableHour) {
  		const message = mesageKey
  			? this.displayError(mesageKey) :
  			this.displayError('EnteredHoursDoNoMatchBillableHoursSubmit');
	  this.markErrorOnCells(TimeAdjustmentDetails, currentDay, billableHour);
	  if (!this.formArray.valid) return;
  	}
  }

  private validateWeeklyHours(TimeAdjustmentDetails: TimeEntryDetailGrid[], maxHours: number) {
  	let startRow = Number(magicNumber.zero),
	 endRow = TimeAdjustmentDetails.length;
  	if (this.isInOutEnable && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)) {
	  startRow = Number(magicNumber.zero);
	  endRow = TimeAdjustmentDetails.length - Number(magicNumber.one);
  	} else if (this.isInOutEnable) {
	  startRow = Number(magicNumber.one);
  	} else if (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty) {
	  endRow = TimeAdjustmentDetails.length - Number(magicNumber.one);
  	}

  	TimeAdjustmentDetails.forEach((_: TimeEntryDetailGrid, rowIndex: number) => {
	  if (rowIndex < startRow || rowIndex >= endRow) {
  			return;
	  }

	  const totalHoursInRow = this.gridOperations().rowWiseTotal(rowIndex);

	  if (totalHoursInRow > maxHours) {
  			this.displayError('CannotEnterMoreThan168Week');
  			this.markErrorsOnRow(rowIndex);
	  }
  	});
  }

  private markErrorsOnRow(rowIndex: number) {
  	this.dayOrder.forEach((currentDay: string) => {
	  this.formArray.at(rowIndex).get(currentDay)?.setErrors({ errorOnCell: true });
  	});
  }

  public displayError(messageKey: string, currentDay?: string, maxHours?: number) {
  	const toastMessage = currentDay && maxHours
	  ? [{ Value: currentDay, IsLocalizeKey: false }, { Value: maxHours.toFixed(2), IsLocalizeKey: false }]
	  : undefined;

  	this.toasterServ.displayToaster(ToastOptions.Error, messageKey, toastMessage);
  }

  private markErrorOnCells = (
  	TimeEntryDetails: TimeEntryDetailGrid[],
  	currentDay: string,
  	maxHours: number
  ) => {
  	for (
  		let row = Number(magicNumber.zero);
  		row < TimeEntryDetails.length;
  		row++
  	) {
  		const hoursInCell = TimeEntryDetails[row][currentDay];
  		if (
  			this.isInOutEnable &&
        typeof hoursInCell === 'number' &&
        hoursInCell > maxHours
  		) {
  			this.formArray
  				.at(row)
  				.get(currentDay)
  				?.setErrors({ errorOnCell: true });
  		} else if (typeof hoursInCell === 'number' && hoursInCell > maxHours) {
  			this.formArray
  				.at(row)
  				.get(currentDay)
  				?.setErrors({ errorOnCell: true });
  			break;
  		}
  	}

  	if (this.formArray.valid) {
  		this.formArray.controls.forEach((control) => {
  			control.get(currentDay)?.setErrors({ errorOnColumn: true });
  		});
  	}
  };

  public onSubmitClick = () => {
  	this.AddEditTimeEntryForm.markAllAsTouched();
  	this.gridValidation().hoursValidation();
  	if (this.AddEditTimeEntryForm.valid) {
  		if (this.isEditMode) {
  			this.timesheetDialogOperations().submitNewForm('Edit');
  		} else {
  			this.timesheetDialogOperations().submitNewForm('Add');
  		}
  	}
  };

  public openExpandedTimesheet() {
  	this.AddEditTimeEntryForm.get('isValidate')?.setValue(true);
  	this.formPayload = this.AddEditTimeEntryForm.getRawValue();
	  this.gridValidation().hoursValidation('EnteredHoursDoNoMatchBillableHoursExpanded');
  	if(this.formArray.valid){
  		const payload = new ValidateExpandData({
  			AssignmentId: Number(this.currAssignmentId),
  			TimeAdjustmentDetails: this.getFormArrayData()
  		});

  		if (this.removedInOutData) {
  			this.formArray.insert(magicNumber.zero, this.removedInOutData);
  		}
  		if (this.removedPenaltyData) {
  			this.formArray.insert(this.formArray.length, this.removedPenaltyData);
  			this.penaltyObject = this.returnPenaltyHours(this.removedPenaltyData.value) ?? null;
  		}
  		this.submitValidateData(payload);
  	}
  }


  public returnPenaltyHours(penalty:TimeAdjDetail){
  	return {
  		Sunday: penalty.Sunday,
  		Monday: penalty.Monday,
  		Tuesday: penalty.Tuesday,
  		Wednesday: penalty.Wednesday,
  		Thursday: penalty.Thursday,
  		Friday: penalty.Friday,
  		Saturday: penalty.Saturday,
  		PreFriday: penalty.PreFriday
  	};
  }
  public closeDialogBox() {
  	this.isExpandedDetails = false;
  }

  private changeStatusId = (statusId: number) => {
  	this.AddEditTimeEntryForm.controls['StatusId'].setValue(statusId);
  	this.gridOperations().updateArrayStatusId(statusId);
  };

  public scrollToGrid() {
  	this.scrollTo.nativeElement.scrollIntoView({
  		behavior: 'auto',
  		block: 'end'
  	});
  }

  public backToList = () => {
  	this.clearSession = true;
  	this.route.navigate([NavigationPaths.list]);
  };

  public changeIsExpandedDetails() {
  	this.isExpandedDetails = false;
  }

  public resetForm() {
  	this.AddEditTimeEntryForm.reset();
  	this.formArray = this.AddEditTimeEntryForm.get('TimeAdjustmentDetails') as FormArray;
  	this.uniqueRow.clearCache();
  	this.AddEditTimeEntryForm.controls['EntrySourceId'].patchValue(EntrySource.Web);
  	this.formArray.clear();
  	this.formArray = this.AddEditTimeEntryForm.get('TimeAdjustmentDetails') as FormArray;
  	this.bindTimeSheetConfigDetails(
	   this.timesheetConfigDetails,
	   this.initialData
  	);
  	this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
  	this.timeEntryService.updateHoldData(null);
  	this.timeAdjustmentService.entriesArray = [];
  	if (
  		this.AddEditTimeEntryForm.controls['StatusId'].value !=
        timeAdjustConst.Submitted ||
      this.toasterServ.isRemovableToaster
  	) {
  		if (
  			this.AddEditTimeEntryForm.controls['StatusId'].value !=
        timeAdjustConst.ReSubmitted
  		)
  			this.toasterServ.resetToaster();
  	}

  	if (this.clearSession) this.sessionStore.remove(TIMEANDEXPENTRYSELECTION);

  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	if (this.containerRef)
  		this.containerRef.nativeElement.removeEventListener(
  			'click',
  			this.handleClick.bind(this)
  		);
  }

  public rowCallback = (context: RowClassArgs) => {
  	const rowIndex = context.index;
  	if (this.isInOutEnable && rowIndex === Number(magicNumber.zero)) {
  		return { headerRow: true };
  	} else {
  		return { green: true };
  	}
  };

  public clickOnBox(event: Event, value: number, Date: string) {
  	const day = this.datePipe.transform(Date, 'EEEE') as DaysOfWeek;
  	this.weekday = day;
  	if (value > Number(magicNumber.zero)) {
  		this.isClickBox = false;
  		event.preventDefault();
  	} else {
  		this.selectedDate = Date;
  		this.isClickBox = !this.isClickBox;
  	}
  }
  public onClose(event:boolean){
  	this.isClickBox = event;
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

  public calculateTotalHours() {
  	let data = this.formArray.value;
	 if (this.isInOutEnable) {
  		data = this.formArray.value.slice(magicNumber.one);
  	}
  	const count = data.reduce((acc: number, curr: DayHours) => {
  		let sum = magicNumber.zero;
  		this.customDays.forEach((day: string) => {
  			sum = sum + curr[day];
  		});
  		return acc + sum;
  	}, magicNumber.zero);
  	this.columnWiseTotal.Total = count;
  	return count;
  }


  private updateDataInDataArray(data: MealBreak[]) {
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
	  return newData;
  	});

  	this.formData = convertMealBreakSubmitDataMethod(convertedData, this.mealBreakData, this.mealBreakId);
  	this.timeAdjustmentService.entriesArray = this.formData;
  }

  public onApply(newData: {data:[], obj:mealBreakSubmitData}) {
  	const day = this.datePipe.transform(newData.obj.EntryDate, 'EEEE') as DaysOfWeek;
  	this.daysData[day] = {...newData.obj};
  	this.cdr.detectChanges();
  	this.AddEditTimeEntryForm.markAsDirty();
  	this.formData = [];
  	this.formData = newData.data;
	  this.updateBillableData(newData.obj);
	  this.updateData(newData);
  	   if (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty) {
  	     this.updatePenalityData(newData.obj);
  	   }
  }

  private updateData(newData: {data:[], obj:mealBreakSubmitData}) {
  	this.daysData[this.weekday] = { ...newData.obj };
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
}
