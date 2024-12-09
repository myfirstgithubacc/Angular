import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import getSubractedDate from '../../../expense/utils/CommonEntryMethods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DatePipe } from '@angular/common';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ScreenId, TimeEntryStatus } from '../../enum-constants/enum-constants';
import { NavigationPaths } from '../route-constants/route-constants';
import { TimeEntryAddEdit } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-add-edit';
import { TooltipDirective } from "@progress/kendo-angular-tooltip";
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { timeSheetStatusIds, TIMEANDEXPENTRYSELECTION } from '../../../expense/expense/enum-constants/enum-constants';
import { ApproveDecline } from '@xrm-core/models/acrotrac/expense-entry/view-review/approve-decline';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { DropdownChangeEvent } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-config-details';
import { TimeEntryDetailGrid } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid';
import { WeeklyHours, WeeklyHoursTotal } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekly-hours';
import { AssignmentDetailsData } from '@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details';
import { HourDetails, TimeAdjustmentStatus } from '../adjustment-manual/enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { TimeConfigDetails } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-config-details';
import { ScrollOnErrorService } from '@xrm-shared/directives/services/scoll-on-error.service';
import { AssignmentDetail } from '../../../common/view-review/approve-decline.model';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { WeeklyDates } from '@xrm-core/models/acrotrac/time-entry/common-interface/weekly-dates';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { TimeEntryUkeyResponse } from '@xrm-core/models/acrotrac/time-entry/common-interface/common-time-entry-details';
import { GetMealBreakData } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	@ViewChild(TooltipDirective)
	private tooltipDir: TooltipDirective;
	@Input() isReview: boolean = false;
	isContractorRequired: boolean = false;
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

	public entityId: number = XrmEntities.Time;
	public getByUkeyData: TimeEntryAddEdit;
	public assignmentId: string;
	public ukey: string;
	public statusId: number;
	private actionName: string;
	public magicNumber = magicNumber;
	public isInOutEnable:boolean = false;
	public recordId: number;
	public periodHeading: string = '';
	public dateFormat: string;
	public manualOTDtEnabled: boolean = false;
	public headerValue: WeeklyDates = {
		'Sunday': '',
		'Monday': '',
		'Tuesday': '',
		'Wednesday': '',
		'Thursday': '',
		'Friday': '',
		'Saturday': ''
	};
	private customDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	public days: WeeklyHoursTotal = this.initializeWeeklyHours();
	public daysForAnotherApproverLine: WeeklyHoursTotal = this.initializeWeeklyHours();

	private initializeWeeklyHours() {
		const initialWeeklyHours: WeeklyHoursTotal = {
			Sunday: magicNumber.zero,
			Monday: magicNumber.zero,
			Tuesday: magicNumber.zero,
			Wednesday: magicNumber.zero,
			Thursday: magicNumber.zero,
			Friday: magicNumber.zero,
			Saturday: magicNumber.zero,
			TotalHour: magicNumber.zero
		};
		return this.customDays.reduce((acc, day) => {
			acc[day] = magicNumber.zero;
			return acc;
		}, initialWeeklyHours);
	}

	public successFullySaved: boolean = false;
	public currencyCode: string;
	public weekendingDate:string;
	public timeEntryForm: FormGroup;
	public dataWithInlineViewTrue: TimeEntryDetailGrid[] = [];
	public dataWithInlineViewFalse: TimeEntryDetailGrid[] = [];
	public draftId = TimeEntryStatus.Draft;
	public submittedId = TimeEntryStatus.Submitted;
	public hourDistributionRuleName: string;
	public OtEligibility: boolean;
	public isExpandedDetails: boolean = false;
	public dayOrder: string[] = [];
	private currRoute: string = NavigationPaths.addEdit;
	private destroyAllSubscribtion$ = new Subject<void>();
	private currAssgmntDetails: AssignmentDetailsData;
	public isClickBox:boolean = false;
	public selectedDate:string ='';
	public mealBreakData: GetMealBreakData;
	public penaltyApplied: boolean = false;
	public screenId = ScreenId.View;
	public IsPendingApproval: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private datePipe: DatePipe,
		private timeEntryService: TimeEntryService,
		private localizationService: LocalizationService,
		private sessionStore: SessionStorageService,
		private router: Router,
		private customvalidators: CustomValidators,
		private toasterServc: ToasterService,
		private route: Router,
		private cdr: ChangeDetectorRef,
		private scrollOnErrorService: ScrollOnErrorService
	) {
		this.timeEntryForm = this.formBuilder.group({
			'WeekendingDate': [null],
			'ApproverComment': [null]
		});
	}

	// eslint-disable-next-line max-lines-per-function
	ngOnInit(): void {
		this.days.TotalHour = magicNumber.zero;
		this.daysForAnotherApproverLine.TotalHour = magicNumber.zero;
		this.activatedRoute.params.pipe(switchMap((param) => {
			this.currRoute = this.route.url;
			return this.timeEntryService.getTimeSheetByUkey(param['id']);
		})).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: TimeEntryUkeyResponse) => {
			if (res.getTimeByUkey.Data) {
				this.getByUkeyData = res.getTimeByUkey.Data;
				this.mealBreakData = res.getMealBreak.Data;
				this.isInOutEnable = res.getMealBreak.Data.AllowInOutTimeSheet;
				this.IsPendingApproval = res.getTimeByUkey.Data.IsPendingApproval;
				this.statusId = this.getByUkeyData.StatusId;
				this.assignmentId = this.getByUkeyData.AssignmentId ?? '';
				this.timeEntryService.updateHoldData({ 'TimeEntryCode': this.getByUkeyData.TimeEntryCode, 'ContractorName': this.getByUkeyData.ContractorName, 'StatusName': this.getByUkeyData.StatusName, 'StatusId': this.getByUkeyData.StatusId, 'Id': this.getByUkeyData.Id, 'Screen': 'edit', 'EntityId': this.entityId });
				this.ukey = this.getByUkeyData.UKey;
				this.dataWithInlineViewTrue = this.getByUkeyData.TimeEntryDetails.filter((item: TimeEntryDetailGrid) =>
					item.InlineViewDisabled);
				this.dataWithInlineViewFalse = this.getByUkeyData.TimeEntryDetails.filter((item: TimeEntryDetailGrid) =>
					!item.InlineViewDisabled);
				if(this.isInOutEnable){
					if(this.dataWithInlineViewFalse.length>Number(magicNumber.zero)){
						this.changeMethod(this.dataWithInlineViewFalse);

						if(this.mealBreakData.MealBreakPenalty || this.mealBreakData.RestBreakPenalty){
							this.addpenaltyRow(this.dataWithInlineViewFalse);
							this.penaltyApplied = true;
						}
					}
				}
				this.recordId = this.getByUkeyData.Id;
				Object.keys(this.days).forEach((day) => {
					let data = this.dataWithInlineViewFalse;
					if(this.isInOutEnable){
						data = data.slice(magicNumber.one);
					}
					this.days[day] = this.calculateDayAmount(data, day);
				});
				Object.keys(this.daysForAnotherApproverLine).forEach((day) => {
					let data = this.dataWithInlineViewTrue;
					if(this.isInOutEnable){
						data = data.slice(magicNumber.one);
					}
					this.daysForAnotherApproverLine[day] = this.calculateDayAmount(data, day);
				});
				const localizeValue = this.datePipe.transform(this.getByUkeyData.WeekendingDate as string, 'MM/dd/YYYY') ?? '';
				this.weekendingDate = localizeValue;

				this.getTimesheetConfigDetails(parseInt(this.assignmentId), localizeValue);
				this.timeEntryForm.controls['WeekendingDate'].patchValue({ 'Value': localizeValue });
				this.changeTimeSheetGridHeading(this.timeEntryForm.get('WeekendingDate')?.value);
			}
			this.isRouteFromReviewLink();
			this.cdr.markForCheck();
		});
		this.dateFormat = this.sessionStore.get('DateFormat') ?? '';
	}

	private calculateDayAmount = (timeEntry: TimeEntryDetailGrid[], day: string): number => {
		return this.calculateAmount(timeEntry, (entry) =>
			Number(entry[day]));
	};

	private getTimesheetConfigDetails(assignmentId: number, weekendingDate: string): void {
		this.timeEntryService.getTimesheetConfigDetails(assignmentId, weekendingDate)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<TimeConfigDetails>) => {
				if(isSuccessfulResponse(res)){
					this.hourDistributionRuleName=res.Data.HourDistributionRuleName;
					this.OtEligibility= res.Data.IsOtEligible;
					this.manualOTDtEnabled=res.Data.ManualOtDtEntry;
					this.cdr.markForCheck();
				}
			});
	}

	private calculateAmount(ExpenseEntryDetails: TimeEntryDetailGrid[], getAmountElement: (entry: TimeEntryDetailGrid) => number): number {
		let totalAmount = magicNumber.zero;
		ExpenseEntryDetails.forEach((element: TimeEntryDetailGrid) => {
			totalAmount += getAmountElement(element);
		});
		return totalAmount;
	}


	public bindingTimeSheetDetails(assignmentMoreDetails: AssignmentDetailsData): void {
		this.currAssgmntDetails = assignmentMoreDetails;
		this.timeEntryService.updateHoldData({ 'AssignmentCode': assignmentMoreDetails.AssignmentCode });
		this.currencyCode = assignmentMoreDetails.CurrencyCode;
	}

	public condition(): boolean {
		return (
			this.getByUkeyData.StatusName === TimeAdjustmentStatus.PartiallyAppproved ||
			this.getByUkeyData.StatusName === TimeAdjustmentStatus.ResUbmit ||
			this.getByUkeyData.StatusName === TimeAdjustmentStatus.Submitted) && this.getByUkeyData.IsPendingApproval;
	}

	public onWeekendingDropdownChange = ({ selectedWeekending, path }: DropdownChangeEvent): void => {
		this.dayOrder = [];
		if (path === this.currRoute) {
			this.changeTimeSheetGridHeading(selectedWeekending);
		} else {
			this.dataWithInlineViewFalse = [];
			this.dataWithInlineViewTrue = [];
			this.headerValue = {
				'Sunday': '',
				'Monday': '',
				'Tuesday': '',
				'Wednesday': '',
				'Thursday': '',
				'Friday': '',
				'Saturday': ''
			};

			window.history.replaceState(null, '', NavigationPaths.list);
			window.history.pushState(null, '', NavigationPaths.list);
			sessionStorage.setItem(TIMEANDEXPENTRYSELECTION, JSON.stringify({
				'AssignmentDetails': this.currAssgmntDetails,
				'WeekendingDate': selectedWeekending
			}));

			this.route.navigate([path]);
		}
	};

	private changeTimeSheetGridHeading = (selectedDate: DropdownModel): void => {
		this.periodHeading = this.createEntryPeriodHeading(selectedDate.Value, 'TimesheetPeriod');
	};

	private createEntryPeriodHeading = (endDate: string, preffix: string): string => {
		const subtractedDate = getSubractedDate(endDate, magicNumber.six),
			transformedDate: string | null = this.datePipe.transform(subtractedDate, 'MM/dd/YYYY'),
			startDateMessage = `${this.localizationService.GetLocalizeMessage(preffix)}: ${this.localizationService.TransformDate(transformedDate)}`,
			endDateMessage = this.localizationService.TransformDate(new Date(endDate));
		this.setAllHeader(transformedDate);
		return `${startDateMessage} - ${endDateMessage}`;
	};

	private setAllHeader(transformedDate: string | null) {
		const initialDate: Date = new Date(transformedDate ?? '');
		this.getNextSevenDates(initialDate);
	}

	private getNextSevenDates(initialDate: Date) {
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

	public openExpandedTimesheet(): void {
		this.isExpandedDetails = true;
	}

	public closeDialog(): void {
		this.successFullySaved = false;
	}

	public openDialog(): void {
		if (this.actionName == 'Decline') {
			this.submitForm(timeSheetStatusIds.Declined, 'TimeSheetDeclined');
			this.closeDialog();
		}
		else {
			this.submitForm(timeSheetStatusIds.Approved, 'TimeSheetApproved');
			this.closeDialog();
		}
	}

	private submitForm(statusId: number, message: string): void {
		const payload: ApproveDecline = new ApproveDecline();
		payload.UKey = this.ukey;
		payload.StatusId = statusId;
		payload.approverComment = this.timeEntryForm.get('ApproverComment')?.value;
		if (this.timeEntryForm.valid) {
			const arrPayload: ApproveDecline[] = [];
			arrPayload.push(payload);
			this.timeEntryService.submitApproveDecline(arrPayload).pipe(takeUntil(this.destroyAllSubscribtion$)).
				subscribe((response: GenericResponseBase<AssignmentDetail[]>) => {
					if (response.Succeeded) {
						this.toasterServc.displayToaster(ToastOptions.Success, this.localizationService.GetLocalizeMessage(message));
						this.backToList();
					}
					else if ('ValidationMessages' in response && response.ValidationMessages?.length) {
						ShowApiResponseMessage.showMessage(response, this.toasterServc, this.localizationService);
					}
					else {
						this.toasterServc.displayToaster(ToastOptions.Error, response.Message);
					}
					this.cdr.markForCheck();
				});
		}
	}

	public backToList() {
		return this.router.navigate([`${NavigationPaths.list}`]);
	}

	public successStaff(action: string): void {
		this.actionName = action;
		const approverCommentControl = this.timeEntryForm.controls['ApproverComment'];
		if (this.actionName == 'Decline') {
			this.timeEntryForm.markAllAsTouched();
			this.isContractorRequired = true;
			approverCommentControl.addValidators(this.customvalidators.RequiredValidator('PleaseEnterData', [{ Value: 'Worker Comment', IsLocalizeKey: true }]));
		}
		else {
			this.isContractorRequired = false;
			approverCommentControl.clearValidators();
		}
		approverCommentControl.updateValueAndValidity();
		setTimeout(() => {
			this.scrollOnErrorService.makeScreenScrollOnError();
		}, magicNumber.fifty);
		this.successFullySaved = this.timeEntryForm.valid;
	}
	public changeIsExpandedDetails(): void {
		this.isExpandedDetails = false;
	}

	changeMethod(data:TimeEntryDetailGrid[]){
		const billableHour = this.getByUkeyData.InOutDetails.BillableHour;

		if (billableHour) {
			const billableHourWithDefaults = billableHour;
			data.unshift(this.mapDataWithTimeEntry(billableHourWithDefaults));
		}
	}

	addpenaltyRow(data: TimeEntryDetailGrid[]){
		const penaltyHours = this.getByUkeyData.InOutDetails.PenaltyHour;
		if(penaltyHours){
			const billableHourWithDefaults = penaltyHours;
			data.push(this.mapDataWithTimeEntry(billableHourWithDefaults, 'PT'));
		}
	}

	mapDataWithTimeEntry(data:WeeklyHours, type?:string) {
		return {
			"Id": 0,
			"CostAccountingCodeId": "",
			"CostAccountingCodeName": "",
			"ShiftId": "",
			"ShiftName": "",
			"JobTitle": "",
			"StatusId": 0,
			"StatusName": "",
			"Sunday": data.Sunday,
			"SundayDisable": false,
			"Monday": data.Monday,
			"MondayDisable": false,
			"Tuesday": data.Tuesday,
			"TuesdayDisable": false,
			"Wednesday": data.Wednesday,
			"WednesdayDisable": false,
			"Thursday": data.Thursday,
			"ThursdayDisable": false,
			"Friday": data.Friday,
			"FridayDisable": false,
			"Saturday": data.Saturday,
			"SaturdayDisable": false,
			"PreFriday": 0,
			"PreFridayDisable": false,
			"HoursTypeId": "",
			"HoursTypeName": "",
			"TotalHour": type == 'PT'
				? this.calculateTotalHours(data)
				: null,
			"InlineViewDisabled": false,
			"ApproverName": null
		};
	}

	calculateTotalHours(data: WeeklyHours) {
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

	public rowCallback = (context: RowClassArgs) => {
		const rowIndex = context.index;
		if (this.isInOutEnable && rowIndex === Number(magicNumber.zero)) {
			return { gold: true };
		} else {
			return { green: true };
		}
	};
	ngOnDestroy() {
		this.timeEntryService.updateHoldData(null);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		if (this.toasterServc.isRemovableToaster)
			this.toasterServc.resetToaster();
		localStorage.removeItem('isReviewLink');
	}

	clickForAdjustIcon(Date:string){
		this.isClickBox = !this.isClickBox;
		this.selectedDate = Date;
	}

	private isRouteFromReviewLink(): void {
		if(!this.condition() && localStorage.getItem('isReviewLink') == 'true' && this.isReview && !this.IsPendingApproval)
		{
			this.toasterServc.displayToaster(ToastOptions.Warning, this.localizationService.GetLocalizeMessage('AlreadyProcessedRecord'));
		}
	}
}
