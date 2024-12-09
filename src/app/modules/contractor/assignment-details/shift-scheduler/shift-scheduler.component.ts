
import { ChangeDetectorRef, Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ShiftScedulerService } from "../shift-scheduler/shift-scheduler.service";
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpStatusCode } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssingmentDetailsService } from '../service/assingmentDetails.service';
import { SlotRange } from "@progress/kendo-angular-scheduler";
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DatePipe } from '@angular/common';
import { EventInput, IEventResponse, INavigation, PreventEvent, ResourceItem, ScheduleData, ScheduleDate, SelectedData, SelectedEvent, SlotClassArgs } from './my-event.interface';
import { IAssignmentDetails } from '../interfaces/interface';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import "@progress/kendo-date-math/tz/all";
@Component({selector: 'app-shift-scheduler',
	templateUrl: './shift-scheduler.component.html',
	styleUrls: ['./shift-scheduler.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ShiftSchedulerComponent {
	@Input() assignmentId: number | string;
    @Input() isTab: boolean = false;
    public value: Date;
    public entityID = XrmEntities.Assingments;
    public isSlotClick: boolean = false;
    public eventEntered: string = '';
    public selectedEventDate: Date | null | undefined;
    public currentMonth:number;
    public currentYear:number;
    public isLength: boolean = false;
    public clickedEventCreatedMonth: number | null = null;
    public statusData: any = {

    	items: []
    };
    public selectedEvent: SelectedEvent | null;
    public scheduledData: ScheduleData;
    public events: ScheduleDate[];
    public truncatedComment: string| undefined = '';
    public showFullComment: boolean = false;
    public statusForm: FormGroup;
    public dayOfEvent: string | null;
    public AddEditEventReasonForm: FormGroup;
    public assignmentDetails: IAssignmentDetails;
    public resources: ResourceItem[] = [];
    public selectedData: SelectedData;
    public toolbarWidth: number;
    public selection: SlotRange = {
    	start: new Date(new Date().setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero)),
    	end: new Date(new Date().setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero)),
    	isAllDay: false
    };

    public timeRange = {
    	labelLocalizeParam1: [],
    	labelLocalizeParam2: [],
    	label1: 'StartTime',
    	label2: 'EndTime',
    	DefaultInterval: magicNumber.zero,
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
    public day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    public selectedDate: Date = new Date();
    private ngUnsubscribe$ = new Subject<void>();
    private scheduleDate: Date;
    private scheduleId1: number;

    // eslint-disable-next-line max-params
    constructor(
    public commonHeaderIcon: CommonHeaderActionService,
    private toasterServc: ToasterService,
    public shiftScedulerSer: ShiftScedulerService,
    private assignmentService: AssingmentDetailsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
	private cd: ChangeDetectorRef,
	private router: Router
    ) {
    	this.AddEditEventReasonForm = new FormGroup({
    		startTimeControlName: new FormControl(''),
    		endTimeControlName: new FormControl('')
    	});
    	if (!this.isTab) {
    		this.assignmentId = this.activatedRoute.snapshot.params['id'];
    	}
    	this.getAssignmentDetails(this.assignmentId);
    	this.statusForm = this.formBuilder.group({
    		status: [null]
    	});
    	this.cd.markForCheck();
    }

    ngOnInit() {
    	const date = this.selectedDate;
    	this.initializeDateRelatedFields(date);
    	this.fetchDataForMonthYear(date);


    	this.cd.markForCheck();
	  }

	  private initializeDateRelatedFields(date: Date): void {
    	this.currentMonth = date.getMonth();
    	this.currentYear = date.getFullYear();
    	this.dayOfEvent = this.getDayDisplay(date);
    	this.selectedEventDate = this.getDateToDisplay(date);
	  }

	  private fetchDataForMonthYear(date: Date): void {
    	const year = date.getFullYear(),
			 month = date.getMonth() + magicNumber.one;
    	this.getData(this.assignmentId, year, month);
	  }

	  private handleScheduledEvents(currentDate: Date): void {
    	const scheduleDates = this.scheduledData.ScheduleDates;
    	this.scheduleDate = currentDate;
    	this.clickedEventCreatedMonth = currentDate.getMonth() + magicNumber.one;

    	if (this.scheduleId1) {
		  const matchingEvent = scheduleDates.find((event) =>
    			this.isSameDate(new Date(event.ScheduleDate), currentDate));
		  if (matchingEvent) {
    			this.scheduleId1 = matchingEvent.RecordId;
    			this.onEventClick(this.scheduleId1);
		  }
    	} else {
		  this.isSlotClick = true;
		  this.getMessageForNotScheduledEvent(this.selectedDate);
    	}
    	this.cd.markForCheck();
	  }

	  private isSameDate(date1: Date, date2: Date): boolean {
    	return date1.getDate() === date2.getDate() &&
		  date1.getMonth() === date2.getMonth() &&
		  date1.getFullYear() === date2.getFullYear();
	  }


    ngAfterViewInit() {
    	this.resourcesData();
    	this.cd.markForCheck();
    }


    private resourcesData() {
    	this.resources = [
    		{
    			data: this.scheduledData.ScheduleDates.map((date) =>
    				({
    					value: date.RecordId,
    					text: date.Name,
    					color: date.ColorCode
    				})),
    			field: 'roomId',
    			valueField: 'value',
    			textField: 'text',
    			colorField: 'color'

    		}
    	];
    	this.cd.markForCheck();
    }


    public onEventClick(event: EventInput): void {
    	const scheduleId = this.getSchuleId(event);
    	this.shiftScedulerSer.getEventByRecordId(scheduleId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: ApiResponse) => {
    		if (res.StatusCode == HttpStatusCode.Ok) {
    			this.selectedEvent = res.Data;
    			this.isSlotClick = true;
    			this.showFullComment = false;
    			this.truncateComment(this.selectedEvent?.Comment);
    			if (typeof event != 'number') {
    				this.selectedData = event;
    			this.dayOfEvent = this.getDayDisplay(new Date(this.selectedData.dataItem.start));
    			this.selectedEventDate = this.getDateToDisplay(new Date(this.selectedData.dataItem.start));
    			this.scheduleDate = new Date(this.selectedData.dataItem.ScheduleDate);
    			}
    			const monthNumber = this.scheduleDate.getMonth() + magicNumber.one;
    			this.clickedEventCreatedMonth = monthNumber;
    			this.cd.markForCheck();
    		}
    	});

    	this.cd.markForCheck();
    }

    private getSchuleId(event: EventInput): number {
    	if (typeof event === 'number') {
    		return event;
    	} else {
    		return event.id;
    	}
    }

    public isDateInCurrentMonth(date: Date, month: number, year: number): boolean {
    	return this.isSameMonth(month, year, date);
    }

    public isSameMonth(month: number, year: number, date: Date): boolean {
    	return (
    		date.getFullYear() === year &&
            date.getMonth() === month
    	);
    }

    public getSlotClass = (args: SlotClassArgs) => {
    	const { start } = args;
    	if (!start) return '';
    	// eslint-disable-next-line one-var
    	const currentDate = new Date().setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero),
    		slotDate = new Date(start).setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero),
    		eventScheduled = this.scheduledData.ScheduleDates.some((event: ScheduleDate) => {
    			return new Date(event.ScheduleDate).setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero) === slotDate && event.ScheduleStatus !== "None";
    		}),
    		assignmentStartDate = new Date(this.scheduledData.AssignmentStartDate),
    		currentDateObj = new Date(start),
    		firstDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth, magicNumber.one).getTime(),
    		lastDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth + magicNumber.one, magicNumber.zero).getTime();


    	assignmentStartDate.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
    	currentDateObj.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);

    	// eslint-disable-next-line one-var
    	const dayOfWeek = currentDateObj.getDay(),
    		weeklyOffDaysId = this.scheduledData.WeeklyOffDaysId.map(Number);
    	if (eventScheduled && currentDate === slotDate && this.isDateInCurrentMonth(new Date(currentDate), this.currentMonth, this.currentYear)) {
    		return 'current-date event-scheduled';
    	}
    	else if (eventScheduled) {
    		return 'event-scheduled';
    	}
    	else if (currentDate === slotDate && weeklyOffDaysId.includes(dayOfWeek)
            && this.isDateInCurrentMonth(new Date(currentDate), this.currentMonth, this.currentYear)) {
    		return 'current-date event-scheduled';
    	}
    	else if (currentDate === slotDate && !weeklyOffDaysId.includes(dayOfWeek)
            && this.isDateInCurrentMonth(new Date(currentDate), this.currentMonth, this.currentYear)) {
    		return 'current-date';
    	}

    	if (slotDate < firstDayOfCurrentMonth || slotDate > lastDayOfCurrentMonth) {
    		return 'disabled-slot';
    	}
    	// eslint-disable-next-line one-var
    	if (dayOfWeek !== undefined && weeklyOffDaysId.includes(dayOfWeek)) {
    		return {
    			hightlightDate: true,
    			disableDate: true
    		};
    	}
    	this.cd.markForCheck();
    	return '';
    };

    private getDateToDisplay(date?: Date | null | undefined) {
    	this.selectedEventDate = null;
    	return date;
    }

    private getDayDisplay(date: Date) {
    	this.dayOfEvent = null;
    	const dayNumber = date.getDay(),
    		returnday: string = `${this.day[dayNumber]},`;
    	return returnday;

    }

    private getData(assignmentId: number|string, year: number, month: number) {
    	this.shiftScedulerSer.getSchedulerBasedOnAssignemnt(assignmentId, year, month).pipe(takeUntil(this.ngUnsubscribe$)).
    		subscribe((res: ApiResponse) => {
    		if (res.StatusCode == HttpStatusCode.Ok) {
    			this.scheduledData = res.Data;
    			const even=this.scheduledData.ScheduleDates,
    			 currentDate = new Date();
    			for (const event of even) {
    				const eventDate = new Date(event.ScheduleDate);
    				if (eventDate.getDate() === currentDate.getDate() &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()) {
    					this.scheduleId1 = event.RecordId;
    					break;
    				}
    			}
    				this.AddEditEventReasonForm.patchValue({
    						startTimeControlName: this.scheduledData.ShiftDetailsGetDto.StartTime,
    						endTimeControlName: this.scheduledData.ShiftDetailsGetDto.EndTime
    					});
    				this.resourcesData();
    					setTimeout(() => {
    						this.handleScheduledEvents(new Date());
				  }, magicNumber.threeHundred);
    			if(this.scheduledData.ScheduleDates.length > Number(magicNumber.zero)){
    				this.events = this.scheduledData.ScheduleDates?.map((e: ScheduleDate) => {
    					e.start = new Date(e.ScheduleDate);
    					e.end = new Date(e.ScheduleDate);
    					e.title = e.Name;
    					e.id = e.RecordId;
    					e.roomId = e.RecordId;
    					return e;
    				});

    				this.cd.markForCheck();


    			}
    		}
    			this.cd.markForCheck();
    	});
    }

    private getAssignmentDetails(assignmentId: number | string) {
    	this.assignmentService.getAssingmentDetailsByUkey(assignmentId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: ApiResponse) => {
    		if (res.StatusCode === HttpStatusCode.Ok) {
    			this.assignmentDetails = res.Data;
    			this.statusData.items = this.createDetailItems([
    				{ key: 'ContractorName', value: this.assignmentDetails.ContractorName, cssClass: ['basic-title'] },
    				{ key: 'AssignmentID', value: this.assignmentDetails.AssignmentCode },
    				{ key: 'JobCategory', value: this.assignmentDetails.JobCategoryName },
    				{ key: 'StaffingAgency', value: this.assignmentDetails.StaffingAgencyName },
    				{ key: 'Status', value: this.assignmentDetails.StatusName }
    			]);
    		}
    	});
    	this.cd.markForCheck();
    }

    private createDetailItems(details: { key: string, value: any, cssClass?: string[] }[]): any[] {
    	return details.map((detail: any) =>
    		({
    			title: detail.key,
    			titleDynamicParam: [],
    			item: detail.value,
    			itemDynamicParam: [],
    			cssClass: detail.cssClass || [],
    			isLinkable: false,
    			link: '',
    			linkParams: ''
    		}));
    }

    public headerCalendar() {
    	const navigationElements = document.querySelectorAll('.k-calendar');
    	// eslint-disable-next-line one-var
    	const element1 = navigationElements[magicNumber.zero] as HTMLElement;
    	element1.classList.add('k-custom-height');
    	// eslint-disable-next-line one-var
    	const elements = document.getElementsByTagName('kendo-calendar-viewlist'),

    		elements2 = elements[magicNumber.zero] as HTMLElement;
    	elements2.classList.add('k-custom-height2');
    }

    public onSchedulerNavigate(event: INavigation): void {
    	event.sender.dateChange.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: IEventResponse) => {
    		const selectedDate = new Date(res.selectedDate),
    			month = selectedDate.getMonth() + magicNumber.one,
		 year = selectedDate.getFullYear(),
    			isSameMonthAsClickedEvent = this.clickedEventCreatedMonth == month;
    		if (isSameMonthAsClickedEvent) {
    			this.isSlotClick = true;
    		} else {
    			this.isSlotClick = false;
    		}

    		this.currentMonth = selectedDate.getMonth();
    		this.currentYear = selectedDate.getFullYear();
    		this.getData(this.assignmentId, year, month);
    	});
    	this.cd.markForCheck();
    }

    public toggleReadMore(): void {
    	this.showFullComment = !this.showFullComment;
    	this.truncateComment(this.selectedEvent?.Comment);
    }

    private truncateComment(comment: string | undefined): void {
    	const maxLength = magicNumber.threeHundred;
    	if (comment && comment.length > Number(maxLength) && !this.showFullComment) {
    		this.truncatedComment = `${comment.substring(magicNumber.zero, maxLength)}...`;
    		this.isLength = true;
    	} else {
    		this.truncatedComment = comment;
    		this.isLength = false;
    	}
    }

    public onSelectionChange(event: PreventEvent): void {
    	try {
			const monthNumber = event.start.getMonth() + magicNumber.one;
    	this.clickedEventCreatedMonth = monthNumber;
    	if (this.isSlotDisabled(event.start)){
    		event.preventDefault?.();
    	}
    	if (!this.isDateInCurrentMonth(event.start, this.currentMonth, this.currentYear)){
    		event.preventDefault?.();
    	}
    	else {
    		this.isSlotClick = true;
    		this.selectedEvent = null;
    		this.dayOfEvent = this.getDayDisplay(event.start);
    		this.selectedEventDate = this.getDateToDisplay(event.start);
    		this.getMessageForNotScheduledEvent(event.start);
    	}
    	this.cd.markForCheck();
		} catch (error) {
			console.log(error);
		}

    }


    public getMessageForNotScheduledEvent(date:Date){
    	const day:number = date.getDay(),
    		weekleyDays = this.scheduledData.WeeklyOffDaysId.map(Number);
    	if(weekleyDays.includes(day)){
    		this.eventEntered = 'NoEventEnteredNoScheduleDay';
    	}

    	else{
    		this.eventEntered = 'NoEventHaveBeenEntered';
    	}
    }

    public navigate(){
    	if(this.router.url.includes('global-search')){
    		this.router.navigate(['/xrm/landing/global-search/list']);
    	}
    	else{
    		this.router.navigate(['/xrm/contractor/assignment-details/list']);
    	}
    }

    public isSlotDisabled(date:Date){
    	const value = this.events?.some((d:ScheduleDate) => {
    		return this.datePipe.transform(d.start, 'MM/dd/YYYY') == this.datePipe.transform(date, 'MM/dd/YYYY');
    	});
    	return value;
    }

    ngOnDestroy(): void {
    	this.toasterServc.resetToaster();
    	this.toasterServc.resetToaster();
    	this.ngUnsubscribe$.next();
    	this.ngUnsubscribe$.complete();
    }

}

