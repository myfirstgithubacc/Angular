import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import getSubractedDate from '../../../expense/utils/CommonEntryMethods';
import { DatePipe } from '@angular/common';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { NavigationPaths } from '../route-constants/route-constants';
import { AdjustmentObj, NavigationPathMap, OriginalObj, TimeAdjReviewResponse, TimeAdjustmentChargeShift, TimeAdjustmentDetail, UkeyData, WeeklyHoursObj } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { TimeAdjustmentService } from 'src/app/services/acrotrac/time-adjustment.service';
import { ApproveDecline } from '@xrm-core/models/acrotrac/expense-entry/view-review/approve-decline';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DropdownChangeEvent } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-config-details';
import { GetMealBreakData, HourDetails, timeAdjustConst, TimeAdjustmentStatus } from '../adjustment-manual/enum';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { RowClassArgs } from '@progress/kendo-angular-grid';
@Component({selector: 'app-adjustment-review',
	templateUrl: './adjustment-review.component.html',
	styleUrls: ['./adjustment-review.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdjustmentReviewComponent implements OnInit, OnDestroy {

	private dayWiseTotalOriginal: OriginalObj;
	private originalObjList: OriginalObj[] = [];
	private destroyAllSubscribtion$ = new Subject<void>();
	private dateFormat: string;
	public ukey: string;
	private actionName: string;
	public TimeAdjustmentForm: FormGroup;
	public isOpenExpandeded: boolean = false;
	public hasInlineViewDisabledTrue: boolean = false;
	public navigationPaths: NavigationPathMap = NavigationPaths;
	public currentStep = magicNumber.zero;
	public entityId: number = XrmEntities.TimeAdjustment;
	public getByUkeyData: UkeyData;
	public weekendingDate:string;
	public assignmentId: string;
	public recordId: number;
	public periodHeading: string = '';
	public dayOrder: (keyof OriginalObj)[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	public headerValue: Record<string, string> = {};
	public currRoute: string;
	public weekendingList: DropdownModel[];
	public isAdjustmentReview:boolean = false;
	public ajustmentObjList:AdjustmentObj[] = [];
	public dayWiseFooterTotal: OriginalObj;
	public IsTimeAdjustOn:boolean = false;
	public isAdjustEntry:boolean = false;
	public isMSPUser:boolean = false;
	public currencyCode: string;
	public isInOutEnable:boolean=false;
	public successFullySaved: boolean = false;
	public isClickBox:boolean = false;
	public selectedDate:string ='';
	public mealBreakData: GetMealBreakData;
	public penaltyEnabled: boolean = false;
	isContractorRequired: boolean = false;
	public IsPendingApproval: boolean = false;


	constructor(
    private route: Router,
    public commonHeaderIcon: CommonHeaderActionService,
    private toasterServ: ToasterService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private localizationService: LocalizationService,
    private sessionStore: SessionStorageService,
    private activatedRoute: ActivatedRoute,
    private timeAdjustService: TimeAdjustmentService,
    private eventLog: EventLogService,
	private customValidators: CustomValidators,
	private timeEntryService: TimeEntryService,
	private cdr: ChangeDetectorRef,
	private renderer: Renderer2
	) {

		this.TimeAdjustmentForm = this.formBuilder.group({
			ApproverComments: [null],
			ManuallyAdjust: true,
			WeekendingDate: [null]
		});
	}

	ngOnInit(): void {
		this.isAdjustmentReview = this.activatedRoute.routeConfig?.data?.['isReviewModeActive'];
		this.activatedRoute.params
			.pipe(
				takeUntil(this.destroyAllSubscribtion$),
				switchMap((param) => {
					this.ukey = param['id'];
					return this.timeAdjustService.getTimeAdjustmentDataByUkey(this.ukey).pipe(takeUntil(this.destroyAllSubscribtion$));
				})
			)
			.subscribe((res: TimeAdjReviewResponse) => {
				if (res.getTadjReviewUkey.Data) {
					this.getByUkeyData = res.getTadjReviewUkey.Data;
					this.weekendingDate = this.datePipe.transform(this.getByUkeyData.WeekendingDate as string, 'MM/dd/YYYY') ?? '';
					this.mealBreakData = res.getMealBreak.Data;
					this.IsPendingApproval = res.getTadjReviewUkey.Data.IsPendingApproval;
					if(this.mealBreakData.RestBreakPenalty || this.mealBreakData.MealBreakPenalty){
						this.penaltyEnabled = true;
					}
					this.isInOutEnable = this.mealBreakData.AllowInOutTimeSheet;
					this.getAdjustTimeData(this.getByUkeyData);
					this.timeEntryService.updateHoldData({ 'TimeEntryCode': this.getByUkeyData.TimeEntryCode, 'ContractorName': this.getByUkeyData.ContractorName, 'StatusName': this.getByUkeyData.StatusName, 'StatusId': this.getByUkeyData.StatusId, 'Id': this.getByUkeyData.Id, 'Screen': 'edit', 'EntityId': this.entityId });
					this.assignmentId = String(this.getByUkeyData.AssignmentId);
					this.recordId = this.getByUkeyData.Id;
					this.getAllWeekendingDates();
					const localizeValue = this.datePipe.transform(this.getByUkeyData.WeekendingDate, 'MM/dd/YYYY');
					this.TimeAdjustmentForm.controls['WeekendingDate'].patchValue({'Value': localizeValue});
					this.changeTimeSheetGridHeading(this.TimeAdjustmentForm.get('WeekendingDate')?.value);
					this.eventLog.entityId.next(this.entityId);
					this.eventLog.recordId.next(this.recordId);
				}
				this.isRouteFromReviewLink();
			});

		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
		this.getUserType();
	}


	private getUserType(): void {
		const userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
		if (userType == magicNumber.two) {
			this.isMSPUser = true;
		}
	}


	public getAdjustTimeData(ukeyData: UkeyData): void {
		this.ajustmentObjList = [] as AdjustmentObj[];
		this.originalObjList = [] as OriginalObj[];
		this.IsTimeAdjustOn = this.TimeAdjustmentForm.get('ManuallyAdjust')?.value;

		if (this.isInOutEnable) {
			this.changeMethod(this.ajustmentObjList, this.originalObjList);
			this.cdr.markForCheck();
		}

		ukeyData.TimeAdjustmentChargeShift.forEach((detail: TimeAdjustmentChargeShift) => {
			this.adjustEntryOnToggle(detail);
		});

		if( this.isInOutEnable && (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty)){
			this.changeMethodForPenality(this.ajustmentObjList, this.originalObjList);
		}
		if (!this.IsTimeAdjustOn && this.isInOutEnable) {
			if (this.ajustmentObjList.length > Number(magicNumber.one)) {
				this.ajustmentObjList = this.ajustmentObjList.slice(magicNumber.one);
			}

			const billableHourOriginal = this.getByUkeyData.TimeInOutDetails
				.find((billable) =>
					 billable.EntryType === 'Original')?.TotalHours.BillableHour;

			if (billableHourOriginal) {
				this.ajustmentObjList.unshift(this.mapDataWithTimeEntry(billableHourOriginal));
			}

			if (this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty) {
				this.ajustmentObjList.pop();

				const penaltyHourOriginal = this.getByUkeyData.TimeInOutDetails
					.find((billable) =>
						 billable.EntryType === 'Original')?.TotalHours.PenaltyHour;

				if (penaltyHourOriginal) {
					this.ajustmentObjList.push(this.mapDataWithTimeEntry(penaltyHourOriginal, 'PT'));
				}
			}
		}


		this.getFooterDayWiseTotalAdjust(this.ajustmentObjList);
		this.getFooterDayWiseTotalOriginal(this.originalObjList);
	}

	private changeMethodForPenality(data:AdjustmentObj[], data2:OriginalObj[]) {
		const PenalityDataOri = this.getByUkeyData.TimeInOutDetails.find((detail) =>
		 detail.EntryType === 'Original'),
			PenaltyAdjust = this.getByUkeyData.TimeInOutDetails.find((detail) =>
				 detail.EntryType === 'Adjustment'),
				 penaltyHourOriginal = PenalityDataOri?.TotalHours.PenaltyHour,
				 penaltyHoursAdjusted = PenaltyAdjust?.TotalHours.PenaltyHour;
				 if(penaltyHoursAdjusted && penaltyHourOriginal){
			data.push(this.mapDataWithTimeEntry(penaltyHoursAdjusted, 'PT'));
			data2.push(this.mapDataWithTimeEntry(penaltyHourOriginal, 'PT'));
				 }
		this.cdr.markForCheck();
	}

	private adjustEntryOnToggle(detail: TimeAdjustmentChargeShift): void{
		let newObj: AdjustmentObj = {
			CostAccountingCodeName: detail.CostAccountingName ?? '', ShiftName: detail.ShiftName ?? '', HourType: detail.HoursTypeName ?? '',
			Sunday: magicNumber.zero, Monday: magicNumber.zero, Tuesday: magicNumber.zero,
			Wednesday: magicNumber.zero, Thursday: magicNumber.zero, Friday: magicNumber.zero,
			Saturday: magicNumber.zero, TotalHours: magicNumber.zero
		},
			originalObj: OriginalObj = {
				Sunday: magicNumber.zero, Monday: magicNumber.zero, Tuesday: magicNumber.zero,
				Wednesday: magicNumber.zero, Thursday: magicNumber.zero, Friday: magicNumber.zero,
				Saturday: magicNumber.zero, TotalHours: magicNumber.zero
			};

		const isInlineFalse = detail.TimeAdjustmentDetails.some((dayDetail: TimeAdjustmentDetail) =>
			!dayDetail.InlineViewDisabled);

		if (this.isMSPUser || isInlineFalse) {
			detail.TimeAdjustmentDetails.forEach((dayDetail: TimeAdjustmentDetail) => {
				if (dayDetail.EntryType === 'Original') {
					originalObj = {
						Sunday: dayDetail.Sunday, Monday: dayDetail.Monday,
						Tuesday: dayDetail.Tuesday, Wednesday: dayDetail.Wednesday,
						Thursday: dayDetail.Thursday, Friday: dayDetail.Friday,
						Saturday: dayDetail.Saturday, TotalHours: dayDetail.TotalHour
					};
					this.originalObjList.push(originalObj);
				}

				const isMatchingEntry = (this.IsTimeAdjustOn && dayDetail.EntryType === 'Adjustment') || (!this.IsTimeAdjustOn && dayDetail.EntryType === 'Original');

				if ((!this.isMSPUser && !dayDetail.InlineViewDisabled && isMatchingEntry) || (this.isMSPUser && isMatchingEntry)) {
					newObj = {
						CostAccountingCodeName: detail.CostAccountingName ?? '',
						ShiftName: detail.ShiftName ?? '', HourType: detail.HoursTypeName ?? '',
						Sunday: dayDetail.Sunday, Monday: dayDetail.Monday,
						Tuesday: dayDetail.Tuesday, Wednesday: dayDetail.Wednesday,
						Thursday: dayDetail.Thursday, Friday: dayDetail.Friday,
						Saturday: dayDetail.Saturday, TotalHours: dayDetail.TotalHour
					};
				}
			});

			this.ajustmentObjList.push(newObj);
		} else {
			this.setApproverLineItemData(detail);
		}
		this.cdr.markForCheck();
	}

	public compareGridObj(indexNumb: number, colName: keyof OriginalObj): string{
		const originalObject = this.originalObjList[indexNumb][colName],
			adjustobject = this.ajustmentObjList[indexNumb][colName];

		if(this.IsTimeAdjustOn){
			return originalObject != adjustobject ?
				'adjustColoumn'
				: 'infogreen';
		}
		return 'infogreen';
	};


	public compareFooterTotal(colName: keyof OriginalObj): string{
		const originalObjTotal = this.dayWiseTotalOriginal[colName],
			 adjustObjTotal = this.dayWiseFooterTotal[colName];

		if(this.IsTimeAdjustOn){
			return originalObjTotal != adjustObjTotal ?
				'adjustColoumn'
				: 'infogreen';
		}
		return 'infogreen';
	}

	private setApproverLineItemData(chargeShiftData: TimeAdjustmentChargeShift): void{
		 this.hasInlineViewDisabledTrue = chargeShiftData.TimeAdjustmentDetails.some((dayDetail: TimeAdjustmentDetail) =>
			dayDetail.InlineViewDisabled);
	}

	private getFooterDayWiseTotalOriginal(list: OriginalObj[]): OriginalObj {
		if(this.isInOutEnable){
			list = list.slice(magicNumber.one);
		}
		this.dayWiseTotalOriginal = list.reduce((acc, curr) => {
		  (Object.keys(acc) as (keyof OriginalObj)[]).forEach((day) => {
				acc[day] += curr[day] || magicNumber.zero;
		  });
		  return acc;
		}, {
		  Sunday: magicNumber.zero, Monday: magicNumber.zero, Tuesday: magicNumber.zero,
		  Wednesday: magicNumber.zero, Thursday: magicNumber.zero, Friday: magicNumber.zero,
		  Saturday: magicNumber.zero, TotalHours: magicNumber.zero
		});
		return this.dayWiseTotalOriginal;
	};


	private getFooterDayWiseTotalAdjust(list: AdjustmentObj[]): void{
		if(this.isInOutEnable){
			list = list.slice(magicNumber.one);
		}
		this.dayWiseFooterTotal = list.reduce((acc: OriginalObj, curr: AdjustmentObj) => {
			(Object.keys(acc) as (keyof OriginalObj)[]).forEach((day) => {
				acc[day] += curr[day] || magicNumber.zero;
			});
			return acc;
		}, { Sunday: magicNumber.zero, Monday: magicNumber.zero, Tuesday: magicNumber.zero,
			Wednesday: magicNumber.zero, Thursday: magicNumber.zero, Friday: magicNumber.zero,
			Saturday: magicNumber.zero, TotalHours: magicNumber.zero });
	}


	public onWeekendingDropdownChange = ({selectedWeekending, path}: DropdownChangeEvent) => {
		this.dayOrder = [];
		if(this.isAdjustmentReview){
			this.currRoute = NavigationPaths.timeAdjustmentReview;
		}else{
			this.currRoute = NavigationPaths.timeAdjustmentView;
		}

		if (selectedWeekending && (path === this.currRoute)) {
			this.changeTimeSheetGridHeading(selectedWeekending);
		}else{
			this.headerValue = {};

			window.history.replaceState(null, '', NavigationPaths.list);
			window.history.pushState(null, '', NavigationPaths.list);

			this.route.navigate([path]);
		}
	};

	public changeTimeSheetGridHeading = (selectedDate: DropdownModel) => {
  		this.periodHeading = this.createEntryPeriodHeading(selectedDate.Value, 'TimesheetPeriod');
	};

	private createEntryPeriodHeading = (endDate:string, preffix:string): string => {
		const subtractedDate = getSubractedDate(endDate, magicNumber.six),
			transformedDate: string | null = this.datePipe.transform(subtractedDate, 'MM/dd/YYYY'),
			startDateMessage=`${this.localizationService.GetLocalizeMessage(preffix)}: ${this.localizationService.TransformDate(transformedDate)}`,
			endDateMessage = this.localizationService.TransformDate(endDate);
		this.setAllHeader(transformedDate);
		return `${startDateMessage} - ${endDateMessage}`;
	};

	private setAllHeader(transformedDate: string | null): void {
		const initialDate: Date = this.localizationService.GetDate(transformedDate ?? '');
		this.getNextSevenDates(initialDate);
	}


	private getNextSevenDates(initialDate: Date): void {
		this.dayOrder = [];
		for (let i = Number(magicNumber.zero); i < Number(magicNumber.seven); i++) {
			const nextDate = new Date(initialDate);
			nextDate.setDate(initialDate.getDate() + i);

			// eslint-disable-next-line one-var
			const formattedDate = this.datePipe.transform(nextDate, 'MM/dd/yyyy') ?? '',
			 curretDay = this.datePipe.transform(nextDate, 'EEEE') as keyof OriginalObj;
			this.headerValue[ curretDay == "Saturday"
				? "Saturday"
				: curretDay] = formattedDate;

			this.dayOrder.push( curretDay == "Saturday"
				? "Saturday"
				: curretDay);
		}
	}

	public getAssigmnetCode(assignmentCode: string) {
		this.timeEntryService.updateHoldData({ 'AssignmentCode': assignmentCode });
	}

	public getCurrencyCode(currencyCode: string): void{
		this.currencyCode = currencyCode;
	}

	public getCurrencyValue(key: string): string {
		const dynamicParam: DynamicParam[] = [{ Value: this.currencyCode, IsLocalizeKey: false }];
		return this.localizationService.GetLocalizeMessage(key, dynamicParam);
	}

	private getAllWeekendingDates(): void {
		const screenId: number = this.isAdjustmentReview ?
			magicNumber.three
			: magicNumber.one;

		this.timeAdjustService.getWeekendingDates(this.entityId, this.assignmentId, screenId)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((WeekendingDate) => {
				const { Data } = WeekendingDate,
			 weekending = Data.map((item: DropdownModel) =>
						({ 'Text': this.datePipe.transform(item.Text, this.dateFormat), 'Value': item.Text }));
				this.weekendingList =this.currWeekLieInWeekending(weekending);
			});
	}

	private currWeekLieInWeekending = (weekendingDates: DropdownModel[]): DropdownModel [] => {
		return	weekendingDates.map((date: DropdownModel) => {
			const dateValue = this.localizationService.GetDate(date.Value),
    		 today = this.localizationService.GetDate();

			if(dateValue >= today && today >= getSubractedDate(date.Value, magicNumber.six)) {
				return ({'Text': this.localizationService.GetLocalizeMessage('ThisWeek'), 'Value': date.Value});
			} else {
				return date;
			}
		});
	};

	private approveDeclineAdjustment(statusId: number, successMessage: string): void {
		const payload: ApproveDecline = new ApproveDecline();
		payload.UKey = this.ukey;
		payload.StatusId = statusId;
		payload.approverComment = this.TimeAdjustmentForm.get('ApproverComments')?.value;
		this.TimeAdjustmentForm.markAllAsTouched();
		if (this.TimeAdjustmentForm.valid) {
			const newPayload: ApproveDecline[] = [payload];
			this.timeAdjustService.approveTimeAdjustment(newPayload)
				.pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((response: ApiResponseBase) => {
					this.cdr.markForCheck();
					if (response.Succeeded) {
						this.toasterServ.displayToaster(ToastOptions.Success, this.localizationService.GetLocalizeMessage(successMessage));
						this.route.navigate([`${NavigationPaths.list}`]);
						this.scroollToTop();
						this.successFullySaved = false;
					} else {
						const responseMessage = response.Message ?? '';
						this.toasterServ.displayToaster(ToastOptions.Error, responseMessage);
						this.scroollToTop();
						this.successFullySaved = false;
					}
				});
		}
	}

	public getConfirmation(action: string){
		this.actionName = action;
		const approverCommentControl = this.TimeAdjustmentForm.controls['ApproverComments'];
		if (action === 'Decline') {
			this.TimeAdjustmentForm.markAllAsTouched();
			this.isContractorRequired = true;
			approverCommentControl.setValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'Worker Comment', IsLocalizeKey: true }]));
		} else {
			this.isContractorRequired = false;
			approverCommentControl.clearValidators();
		}
		approverCommentControl.updateValueAndValidity();
		this.successFullySaved = this.TimeAdjustmentForm.valid;

	}

	public closeDialog() {
		this.successFullySaved = false;
	}

	public openDialog() {
		if (this.actionName == 'Decline') {
			this.approveDeclineAdjustment(
				timeAdjustConst.Declined,
				 'TheTimeAdjustmentRecordhasbeendeclined'
			);
		}
		else {
			this.approveDeclineAdjustment(
				timeAdjustConst.Approved,
				 'The Timesheet Record has been approved.'
			);
		}
	}

	private scroollToTop() {
		window.scrollTo(magicNumber.zero, magicNumber.zero);
	}

	public openExpandedTimeSheet() {
		this.isOpenExpandeded = true;
	}

	public closeDialogBox() {
		this.isOpenExpandeded = false;
	  }

	ngOnDestroy(): void {
		this.timeEntryService.updateHoldData(null);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		console.log("his.toasterServ.isRemovableToaster",this.toasterServ.isRemovableToaster)
		if (this.toasterServ.isRemovableToaster){
			this.toasterServ.resetToaster();
		}
		// this.toasterServ.resetToaster();
		localStorage.removeItem('isReviewLink');
	}
	public rowCallback = (context: RowClassArgs) => {
		const rowIndex = context.index;
		if (this.isInOutEnable && rowIndex === Number(magicNumber.zero)) {
			return { gold: true };
		} else {
			return { green: true };
		}
	};
	public clickForAdjustIcon(Date:string){
		this.isClickBox = !this.isClickBox;
		this.renderer.addClass(document.body, 'scrolling__hidden');
		this.selectedDate = Date;
	}

	private changeMethod(data:AdjustmentObj[], data2:OriginalObj[]){
		const billableDataOri = this.getByUkeyData.TimeInOutDetails.find((detail) =>
				detail.EntryType === 'Original'),
			   billableAdjusted = this.getByUkeyData.TimeInOutDetails.find((detail) =>
				detail.EntryType === 'Adjustment'),
			   billableHourOriginal = billableDataOri?.TotalHours.BillableHour,
			   billableHourAdjustment = billableAdjusted?.TotalHours.BillableHour;
		if(billableHourAdjustment && billableHourOriginal){
			data.unshift(this.mapDataWithTimeEntry(billableHourAdjustment));
			data2.unshift(this.mapDataWithTimeEntry(billableHourOriginal));
			console.log("data", data)
		}
	}

	private mapDataWithTimeEntry(data:WeeklyHoursObj, type?:string) {
		console.log(" this.calculateTotalHours(data)",  this.calculateTotalHours(data))
		return {

			CostAccountingCodeName: "",
			ShiftName: "",
			HourType: type ?? "",
			Sunday: data.Sunday,
			Monday: data.Monday,
			Tuesday: data.Tuesday,
			Wednesday: data.Wednesday,
			Thursday: data.Thursday,
			Friday: data.Friday,
			Saturday: data.Saturday,
			TotalHours: type == 'PT'
				? this.calculateTotalHours(data)
				: null
		};
	}
	calculateTotalHours(data: WeeklyHoursObj) {
		let totalHours = Number(magicNumber.zero);
		totalHours += data.Sunday || Number(magicNumber.zero);
		totalHours += data.Monday || Number(magicNumber.zero);
		totalHours += data.Tuesday || Number(magicNumber.zero);
		totalHours += data.Wednesday || Number(magicNumber.zero);
		totalHours += data.Thursday || Number(magicNumber.zero);
		totalHours += data.Friday || Number(magicNumber.zero);
		totalHours += data.Saturday || Number(magicNumber.zero);
		return totalHours;
	  }

	  private isRouteFromReviewLink(): void {
		if(!this.isApprovalRequired() && localStorage.getItem('isReviewLink') == 'true' && this.isAdjustmentReview && !this.IsPendingApproval)
		{
			this.toasterServ.displayToaster(ToastOptions.Warning, this.localizationService.GetLocalizeMessage('AlreadyProcessedRecord'));
		}
	}

	public isApprovalRequired(): boolean {
		return (
			(this.getByUkeyData.StatusId === timeAdjustConst.PartiallyApproved ||
			this.getByUkeyData.StatusId === timeAdjustConst.ReSubmitted ||
			this.getByUkeyData.StatusId === timeAdjustConst.Submitted) && this.getByUkeyData.IsPendingApproval);
	}
}
