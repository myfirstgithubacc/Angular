/* eslint-disable one-var */
/* eslint-disable no-underscore-dangle */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { AutoprocessConfigurationService } from 'src/app/services/masters/autoprocess-configuration.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { NavigationPaths } from '../constants/routes-constants';
import { catchError, EMPTY, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { dropdownWithExtras } from '@xrm-core/models/job-category.model';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { ReasonType } from '@xrm-core/models/termination-reason';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { DropdownModel, ExecutionDetails, Job, JobData, JobSchedule, JobScheduleMapping, Schedule, ScheduleDisbaled, TriggerDetailsColumnOption } from '@xrm-core/models/auto-process-configuration.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { dropdown } from '@xrm-master/shift/constant/shift-data.model';
import { CommonService } from '@xrm-shared/services/common.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { WeekdayTimePickerComponent } from '@xrm-shared/widgets/form-controls/weekday-time-picker/weekday-time-picker.component';


@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrl: './add-edit.component.scss',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy{
	@ViewChild('weekdayPicker') weekdayPicker!: WeekdayTimePickerComponent;

	AddEditAutoProcessForm: FormGroup;
	BasicDetailsForm: FormGroup;
	executionForm: FormGroup;
	public entityId: XrmEntities.AutoProcess;

	public saveBtnEnable: boolean = false;
	public editListItems:boolean = false;
	public isEmailReq:boolean=false;
	public isEditMode: boolean = false;
	public triggerStartTime:boolean= false;
	public triggerDayInterval:boolean=false;
	public selectWeekDay:boolean=false;
	public triggerMonth:boolean=false;

	public jobDetails: Job;
	public monthdays: DropdownModel[];
	private executionUkey:string;
	private selectedMonthDaysString: string;
	private selectedDaysList: string[] | string;
	public executionHisCO: TriggerDetailsColumnOption[];
	public triggerColumnOptions: TriggerDetailsColumnOption[];
	public triggersDetailsData: Schedule[] = [];
	public executionDetails: ExecutionDetails[] = [];

	public triggerGatewayDrpDwnList: dropdownWithExtras[] = [];
	public pageSize: number = magicNumber.ten;
	private selectedDays: Record<string, boolean>;
	public weekdayUkey : string;

	private jobID: number;
	private schedules: Schedule[];
	private editUkey: string;

	private clientScheduleUkey: string;
	private jobukey: string;
	private destroyAllSubscribtion$ = new Subject<void>();
	public daysInfo: IDayInfo[];

	public schedulingType: ReasonType[] = [
		{
			Text: 'Daily',
			Value: 300
	  },
	  {
			Text: 'Weekly',
			Value: 303
	  },
	  {
			Text: 'Monthly',
			Value: 305
	  }
	];

	constructor(
		public autoProcessServices: AutoprocessConfigurationService,
		private fb: FormBuilder,
		private route: Router,
		public sector: SectorService,
		public commonHeaderIcon: CommonHeaderActionService,
		private customValidator: CustomValidators,
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private eventLogService: EventLogService,
		private scrollToTop : WindowScrollTopService,
		private cdr:ChangeDetectorRef,
		private commonService: CommonService,
		private localizationSrv: LocalizationService,
		private gridConfiguration: GridConfiguration,
		private scrollService: WindowScrollTopService
	) {
		this.scrollService.scrollTop();
		  this.AddEditAutoProcessForm = this.fb.group({
			JobIntervalType: [null, [this.customValidator.RequiredValidator('PleaseSelectData', [{ Value: 'SchedulingType', IsLocalizeKey: true }])]],
			JobEndDate: [null, [this.customValidator.RequiredValidator('PleaseSelectData', [{ Value: 'EndDate', IsLocalizeKey: true }])]],
			JobStartDate: [null, [this.customValidator.RequiredValidator('PleaseSelectData', [{ Value: 'StartDate', IsLocalizeKey: true }])]],
			JobStartTime: [null],
			JobInterval: [null],
			DaysInterval: [null]
		  });

		  this.BasicDetailsForm = this.fb.group({
			SuccessEmail: [null],
			ExceptionEmail: [null],
			isEmailReq: [null]
		  });

		  this.schedules = [];

	  }

	  ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getJobById(param['id']);
					}
					return of(null);
				}),
				catchError((error: Error) => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();

		this.initializeData();
	  }

	  private initializeData(): void {
		this.daysInfo = this.autoProcessServices.daysInfo;
		this.triggerColumnOptions = this.autoProcessServices.triggerDeatilsColumnOption();
		this.executionHisCO = this.autoProcessServices.executionHisColumnOption();
		this.monthdays = this.autoProcessServices.monthDaysDropdown();
		this.triggersDetailsData = [];
	  }


	private getJobById(id: string): void {
		this.autoProcessServices.getJobById(id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<Job>) => {
				this.jobukey = data.Data?.Ukey ?? '';
				if (isSuccessfulResponse(data)) {
					this.jobDetails = data.Data;
					this.executionUkey = data.Data.Ukey;
					this.clientScheduleUkey = data.Data.ClientMappingUkey;
					this.jobID = data.Data.Id;
					this.mapTriggersDetails(data.Data.Schedules);
					this.patchJobDetailsForm(data.Data);
				}
			});
	}

	private mapTriggersDetails(schedules: Schedule[]): void {
		this.triggersDetailsData = schedules.map((schedule: Schedule) => {
			return {
				SchedulingType: schedule.SchedulingType,
				StartDate: schedule.StartDate,
				EndDate: schedule.EndDate,
				ScheduledTime: schedule.ScheduledTime,
				IntervalDay: schedule.ScheduledOn !== ''
					? 'N/A'
					: schedule.DayInterval,
				ScheduledOn: schedule.ScheduledOn === ''
					? 'N/A'
					: schedule.ScheduledOn,
				Status: schedule.Status,
				_Disabled: schedule.Disabled,
				_ClientScheduleUkey: schedule.ClientScheduleUkey
			};
		});
	}

	private patchJobDetailsForm(jobData: Job): void {
		this.BasicDetailsForm.controls['isEmailReq'].patchValue(jobData.IsEmailRequired);
		if (jobData.IsEmailRequired) {
		  this.isEmailReq = true;
		}
		this.BasicDetailsForm.controls['SuccessEmail'].patchValue(jobData.SuccessEmail);
		this.BasicDetailsForm.controls['ExceptionEmail'].patchValue(jobData.ExceptionEmail);
		this.AddEditAutoProcessForm.patchValue(jobData);

		this.autoProcessServices.jobsData.next({
		  'Disabled': jobData.Disabled,
		  'RuleCode': jobData.Code,
		  'Id': jobData.Id
		});
	  }

	private onActiveChange = (dataItem: Schedule) => {
		if (dataItem._ClientScheduleUkey) {
			const a: string[] = [dataItem._ClientScheduleUkey];
			this.ActivateDeactivateEventReason(a, !dataItem._Disabled);
			this.indexTriggerDetailsData(dataItem);
		}
	};

	 private ActivateDeactivateEventReason(dataItem: string[], status: boolean) {

	 	const Id: ScheduleDisbaled[] = dataItem.map((item) =>
	   		({
	   			uKey: item,
	   			disabled: status,
	   			reasonForChange: ''
	   		}));

	 	this.autoProcessServices.enableScheduleStatus(Id).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<null>) => {
	   		if(response.Succeeded){
	   			this.toasterService.showToaster(ToastOptions.Success, `${status
	   				? 'JobScheduleDeactivated' :
	   				'JobScheduleActivated'}`);
	   			this.cdr.detectChanges();

	   		}
	 		this.gridConfiguration.refreshGrid();
	   	});
	   }

	private indexTriggerDetailsData(data:Schedule){
		const index= this.triggersDetailsData.findIndex((i:Schedule) =>
			i._ClientScheduleUkey == data._ClientScheduleUkey);
		if(index> Number(magicNumber.minusOne)){
			const dataItem = this.triggersDetailsData[index];
			dataItem._Disabled = !data._Disabled;
			dataItem.Status = dataItem.Status === 'Active'
				? 'Inactive'
				: 'Active';
		}

	}


	public onEdit = (dataItem: Schedule) => {

		this.editListItems = true;
		this.isEditMode = true;
		this.resetConfigurationForm();
		this.clientScheduleUkey = dataItem._ClientScheduleUkey;

		this.autoProcessServices.getJobSchedulebyUkey(dataItem._ClientScheduleUkey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<JobData>) => {
				if (data.Data?.JobIntervalType === 'Daily') {
					this.onDailySelected(data.Data);
				} else if (data.Data?.JobIntervalType === 'Weekly') {
					this.onWeeklySelected(data.Data);
				} else {
					this.onMonthlySelected(data.Data);
				}
			});

	};

	private setJobScheduleData(data: JobData, schedulingType: string) {

		const startDate = this.parseDate(data.JobStartDate.toString()),
		 endDate = this.parseDate(data.JobEndDate.toString());

		this.AddEditAutoProcessForm.controls['JobStartDate'].patchValue(startDate);
		this.AddEditAutoProcessForm.controls['JobEndDate'].patchValue(endDate);
		this.AddEditAutoProcessForm.controls['JobStartTime'].patchValue(this.setScheduledTime(data.JobStartTime.toString()));
		this.AddEditAutoProcessForm.controls['JobIntervalType'].patchValue(this.getSchedulingType(schedulingType));

	}

	private parseDate(dateString: string): Date {
		const date = new Date(dateString);
		return date;
	}

	private getSchedulingType(schedulingType: string) {
		return this.schedulingType.find((type) =>
			type.Text.toLowerCase() === schedulingType.toLowerCase());
	}

	private onDailySelected(data: JobData) {
		this.triggerDayInterval = true;
		this.triggerStartTime = true;
		this.setJobScheduleData(data, data.JobIntervalType);
		this.editUkey = data.JobClientScheduledUkey;

		this.AddEditAutoProcessForm.controls['DaysInterval'].patchValue(data.DaysInterval);
	}

	private onWeeklySelected(data: any) {

		this.selectWeekDay = true;
		this.triggerStartTime = true;
		this.setJobScheduleData(data, data.JobIntervalType);

		if (data.JobIntervalInfo) {
			const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

			this.daysInfo = validDays.map((day) =>
				({
					day,
					isSelected: data.JobIntervalInfo[day] || false
				}));


			this.selectedDays = this.daysInfo.reduce<Record<string, boolean>>((acc, curr) => {
				acc[curr.day] = curr.isSelected;
				return acc;
			}, {});
			this.editUkey = data.JobClientScheduledUkey;
			this.weekdayUkey = data.JobIntervalInfo.Ukey;
		}
	}

	private onMonthlySelected(data: any) {
		this.triggerMonth = true;
		this.triggerStartTime = true;

		this.setJobScheduleData(data, data.JobIntervalType);

		const scheduledOnArray: { Value: number; Text: string }[] = [];

		for (let day = magicNumber.one; day <= magicNumber.thirtyOne; day++) {
			const dayKey = `Day${day}`;
			if (data.JobIntervalInfo[dayKey]) {
				scheduledOnArray.push({ Value: day, Text: day.toString() });
			}
		}

		this.editUkey = data.JobClientScheduledUkey;
		this.weekdayUkey = data.JobIntervalInfo.Ukey;
		this.AddEditAutoProcessForm.controls['JobInterval'].patchValue(scheduledOnArray);
	}


	public getTabOptionProxyGrid(){
		return {
			bindingField: 'Disabled',
			tabList: [
				{
					tabName: 'All',
					favourableValue: 'All',
					selected: true
				}
			]
		};
	}

	onDelete = (dataItem: Schedule) => {
		const [indexInTriggersDetailsData, indexInSchedules] = this.findIndices(dataItem);

		this.removeFromArrays(indexInTriggersDetailsData, indexInSchedules);

		if (this.schedules.length === 0) {
			this.saveBtnEnable = false;
		}
	};

 	private findIndices(dataItem: Schedule): [number, number] {
		const indexInTriggersDetailsData = this.triggersDetailsData.findIndex((item) =>
			item.SchedulingType === dataItem.SchedulingType &&
			item.JobStartDate === dataItem.JobStartDate &&
			item.JobEndDate === dataItem.JobEndDate &&
			item.ScheduledTime === dataItem.ScheduledTime &&
			item.IntervalDay === dataItem.IntervalDay &&
			item.ScheduledOn === dataItem.ScheduledOn &&
			item._Disabled === 'Delete');

		const indexInSchedules = this.schedules.findIndex((schedule: Schedule) => {
			const jobSchedule = schedule as JobSchedule;
			const isSameDate = dataItem.JobStartDate === jobSchedule.jobStartDate && dataItem.JobEndDate === jobSchedule.jobEndDate;
			const scheduledTimeFormatted = this.convertTimeTo24HourFormat(dataItem.ScheduledTime ?? "");

			return this.isMatchingSchedule(dataItem, jobSchedule, scheduledTimeFormatted, isSameDate);
		});

		return [indexInTriggersDetailsData, indexInSchedules];
	}

	private removeFromArrays(indexInTriggersDetailsData: number, indexInSchedules: number): void {
		if (indexInTriggersDetailsData !== -1) {
			this.triggersDetailsData.splice(indexInTriggersDetailsData, 1);
			this.triggersDetailsData = [...this.triggersDetailsData];
		}

		if (indexInSchedules !== -1) {
			this.schedules.splice(indexInSchedules, 1);
		}
	}

	private isMatchingSchedule(dataItem: Schedule, jobSchedule: JobSchedule, scheduledTimeFormatted: string, isSameDate: boolean): boolean {
		if (jobSchedule.jobIntervalType === dataItem.SchedulingType &&
			jobSchedule.jobStartTime.toString() === scheduledTimeFormatted &&
			isSameDate) {

			if (jobSchedule.jobIntervalType === 'Daily') {
				return jobSchedule.daysInterval === parseInt(dataItem.IntervalDay || '0', 10);
			}

			if (jobSchedule.jobIntervalType === 'Weekly') {
				return this.matchesWeeklySchedule(dataItem, jobSchedule);
			}

			if (jobSchedule.jobIntervalType === 'Monthly') {
				const scheduledOnDay = parseInt(dataItem.ScheduledOn, 10);
				return jobSchedule.jobInterval[`day${scheduledOnDay}`];
			}
		}

		return false;
	}

	private matchesWeeklySchedule(dataItem: Schedule, jobSchedule: JobSchedule): boolean {
		const scheduledOnDays = Array.isArray(dataItem.ScheduledOn)
			? dataItem.ScheduledOn.map((day: string) =>
				day.toLowerCase())
			: [];

		const scheduleDaysInterval = (typeof jobSchedule.jobInterval === 'object')
			? Object.keys(jobSchedule.jobInterval)
				.filter((day) =>
					jobSchedule.jobInterval[day])
				.map((day) =>
					day.toLowerCase())
			: [];

		return scheduledOnDays.every((day) =>
			scheduleDaysInterval.includes(day));
	}


	public executionHistoryData() {
		this.autoProcessServices.getExecutionHisById(this.executionUkey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<ExecutionDetails[]>) => {

				if (response.Succeeded && Array.isArray(response.Data)) {
					this.executionDetails = response.Data.map((detail) =>
						({
							ExecutedOn: detail.ExecutedOn,
							ExecutedTime: detail.ExecutedTime,
							Status: detail.Status
						}));

					this.executionForm.patchValue({ executionDetails: this.executionDetails });
					this.cdr.detectChanges();
				} else {
					this.executionDetails = [];
				}
			});
	}


	public actionSet : IActionSetModel[] = [
		{
			Status: false,
			Items: this.gridConfiguration
				.showEditDeactive(this.onEdit, this.onActiveChange)
		},
		{
			Status: true,
			Items: this.gridConfiguration
				.showEditActive(this.onEdit, this.onActiveChange)
		},
		{
			Status: 'Delete',
			Items: this.gridConfiguration
				.showDeleteIcon(this.onDelete)
		}
	];

	public tabOptions = {
		bindingField: '_Disabled',
		tabList: [
			{
				tabName: dropdown.All,
				favourableValue: "All",
				selected: true
			}
		]
	};

	checkEndDateValidity(selectedDate: Date): void {

		const currentDate = new Date();
		currentDate.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);

		if (!selectedDate) return;

		const endDate = new Date(selectedDate),
			  jobEndDateControl = this.AddEditAutoProcessForm.get('JobEndDate'),
			  jobStartDateControl = this.AddEditAutoProcessForm.get('JobStartDate');

		if (jobStartDateControl) {
			const startDate = new Date(jobStartDateControl.value);
			if (startDate < currentDate) {
				jobStartDateControl.setErrors({ endDateInvalid: true, message: "StartDateCannotLessThanCurrentDate" });
			} else {
				jobStartDateControl.setErrors(null);
			}
		}

		if (jobEndDateControl) {
			const startDate = jobStartDateControl
					? new Date(jobStartDateControl.value)
					: null,
			 newEndDate = new Date(jobEndDateControl.value);
			if (startDate && newEndDate < startDate) {
				jobEndDateControl.setErrors({ endDateInvalid: true, message: "EndDateCannotLessThanStartDate" });
			}
			else if (newEndDate < currentDate) {
				jobEndDateControl.setErrors({ endDateInvalid: true, message: "EndDateCannotLessThanCurrentDate" });
			}
			else {
				jobEndDateControl.setErrors(null);
			}
		}
		this.cdr.markForCheck();
	}


	public isEmailReqSwitch(event: boolean): void {
		if(event){
			this.isEmailReq =true;
		}
		else{
			this.isEmailReq = false;
		}
		this.saveBtnEnable = true;
	}

	addToList() {

		this.AddEditAutoProcessForm.markAllAsTouched();

		if (!this.validateJobIntervalType()) {
			return;
		}

		if (this.editListItems) {
			this.EditList();
			return;
		}

		if(this.AddEditAutoProcessForm.valid){
			this.processWeekDaysSelection();

			const triggerGridData = this.createTriggerGridData();

			this.triggersDetailsData = [triggerGridData, ...this.triggersDetailsData];

			const newSchedules = this.convertTriggerData(triggerGridData);

			if (!Array.isArray(this.schedules)) {
				this.schedules = [];
			}

			this.schedules = [...this.schedules, ...newSchedules];

			if (!this.AddEditAutoProcessForm.valid) {
				return;
			}

			this.saveBtnEnable = true;
			this.selectedDaysList = [];
			this.selectedMonthDaysString = '';
			this.resetConfigurationForm();

			this.cdr.detectChanges();
		}

	}


	private convertTimeTo24HourFormat(time: string): string{

		const [timePart, modifier] = time.split(' ');

		// eslint-disable-next-line prefer-const
		let [hours, minutes] = timePart.split(':').map(Number);

		if (modifier === 'PM' && hours < Number(magicNumber.tweleve)) {
			hours += magicNumber.tweleve;
		}
		if (modifier === 'AM' && hours === Number(magicNumber.tweleve)) {
			hours = magicNumber.zero;
		}

		return `${hours.toString().padStart(magicNumber.two, '0')}:${minutes.toString().padStart(magicNumber.two, '0')}:00.0000000`;
	}


	private convertTriggerData(triggerData: Schedule): Schedule[] {
		const jobInterval = this.initializeJobInterval();

		this.processSchedulingType(triggerData, jobInterval);

		return this.createSchedule(triggerData, jobInterval);
	}

	private initializeJobInterval(): any {
		const jobInterval: any = {
			sun: false,
			mon: false,
			tue: false,
			wed: false,
			thu: false,
			fri: false,
			sat: false,
			lastDayOfMonth: false,
			ukey: null
		};

		for (let i = 1; i <= Number(magicNumber.thirtyOne); i++) {
			jobInterval[`day${i}`] = false;
		}

		return jobInterval;
	}

	private processSchedulingType(triggerData: Schedule, jobInterval: any): void {
		if (triggerData.SchedulingType === "Daily") {
			this.processDailySchedule(triggerData, jobInterval);
		} else if (triggerData.SchedulingType === "Monthly" && triggerData.ScheduledOn !== 'N/A') {
			this.processMonthlySchedule(triggerData, jobInterval);
		} else if (triggerData.ScheduledOn && typeof triggerData.ScheduledOn === 'string' && triggerData.ScheduledOn !== 'N/A') {
			this.processWeeklySchedule(triggerData, jobInterval);
		}
	}

	private processDailySchedule(triggerData: Schedule, jobInterval: any): void {
		jobInterval.jobIntervalType = triggerData.SchedulingType;
		jobInterval.daysInterval = triggerData.IntervalDay === "N/A"
			? 0
			: parseInt(triggerData.IntervalDay, 10);
		jobInterval.jobInterval = null;
	}

	private processMonthlySchedule(triggerData: Schedule, jobInterval: any): void {
		for (let i = Number(magicNumber.one); i <= Number(magicNumber.thirtyOne); i++) {
		  jobInterval[`day${i}`] = false;
		}

		const scheduledDays = Array.isArray(triggerData.ScheduledOn)
		  ? triggerData.ScheduledOn
		  : triggerData.ScheduledOn
			  .split(/[\s,]+and[\s,]+|[\s,]+/);

		scheduledDays.forEach((day: string) => {
		  const dayNum = parseInt(day.trim(), 10);

		  if (dayNum >= Number(magicNumber.one) && dayNum <= Number(magicNumber.thirtyOne)) {
				jobInterval[`day${dayNum}`] = true;
		  }
		});

		jobInterval.ukey = this.weekdayUkey;
	  }


	private processWeeklySchedule(triggerData: Schedule, jobInterval: any): void {

		const sanitizedScheduledOn = triggerData.ScheduledOn.replace(/\band\b/g, ',').replace(/\s+/g, ' ').trim();
		const scheduledDays = sanitizedScheduledOn.split(',').map((day: string) =>
			day.trim());

		const dayMap: Record<string, string> = {
			Sun: "sun",
			Mon: "mon",
			Tue: "tue",
			Wed: "wed",
			Thu: "thu",
			Fri: "fri",
			Sat: "sat"
		};

		scheduledDays.forEach((day: string) => {
			if (dayMap[day]) {
				jobInterval[dayMap[day]] = true;
			} else if (!isNaN(parseInt(day, 10))) {
				const dayNumber = parseInt(day, 10);
				if (dayNumber >= 1 && dayNumber <= 31) {
					jobInterval[`day${dayNumber}`] = true;
				}
			}
			jobInterval.ukey = this.weekdayUkey;
		});
	}

	private createSchedule(triggerData: Schedule, jobInterval: any): Schedule[] {
		return [
			{
				jobScheduleUKey: this.isEditMode
					? this.editUkey
					: null,
				jobStartDate: triggerData.JobStartDate,
				jobEndDate: triggerData.JobEndDate,
				jobStartTime: this.convertTimeTo24HourFormat(triggerData.ScheduledTime ?? '00:00'),
				jobIntervalType: triggerData.SchedulingType,
				daysInterval: triggerData.IntervalDay === "N/A"
					? 0
					: parseInt(triggerData.IntervalDay, 10),
				jobInterval
			} as Schedule
		];
	}


	private validateJobIntervalType(): boolean {
		const jobIntervalType = this.AddEditAutoProcessForm.get('JobIntervalType')?.value.Text;

		if (jobIntervalType === 'Weekly') {
			this.weekdayPicker.showValidationErrors();
			return this.weekdayPicker.isDaySelectionValid;
		}

		return true;
	}

	private processWeekDaysSelection(): void {

		const formValues = this.AddEditAutoProcessForm.value;
		this.selectedDaysList = [];

		if (formValues.JobIntervalType?.Text === 'Weekly') {
			const selectedDays = Object.keys(this.selectedDays)
				.filter((day) =>
					this.selectedDays[day])
				.map((day) =>
					day.charAt(magicNumber.zero).toUpperCase() + day.slice(magicNumber.one));

			if (selectedDays.length > Number(magicNumber.zero)) {
				this.selectedDaysList = selectedDays;
			} else {
				this.selectedDaysList = [];
			}
		}

		if (formValues.JobIntervalType?.Text === 'Monthly') {
			const selectedMonthDays = formValues.JobInterval?.map((day: DropdownModel) =>
				day.Text) || [];

			if (selectedMonthDays.length > magicNumber.zero) {
				const lastDay = selectedMonthDays.pop();
				this.selectedMonthDaysString = selectedMonthDays.length > magicNumber.zero
					? `${selectedMonthDays.join(', ')} and ${lastDay}`
					: lastDay;
			} else {
				this.selectedMonthDaysString = '';
			}
		}

		if (this.selectedDaysList.length > Number(magicNumber.one)) {
			const lastDay = this.selectedDaysList.pop();
			this.selectedDaysList = `${this.selectedDaysList.join(', ')} and ${lastDay}`;
		} else if (this.selectedDaysList.length === Number(magicNumber.one)) {
			this.selectedDaysList = this.selectedDaysList[magicNumber.zero];
		}

	}


	private createTriggerGridData(): Schedule {
		const formValues = this.AddEditAutoProcessForm.value,
			intervalDay = formValues.DaysInterval ?? 'N/A',
			scheduledOn = intervalDay === 'N/A'
				? this.selectedMonthDaysString || this.selectedDaysList || 'N/A'
				: 'N/A';

		return {
			SchedulingType: formValues.JobIntervalType?.Text || 'N/A',
			JobStartDate: formValues.JobStartDate,
			JobEndDate: formValues.JobEndDate,
			StartDate: this.localizationSrv.TransformDate(formValues.JobStartDate),
			EndDate: this.localizationSrv.TransformDate(formValues.JobEndDate),
			ScheduledTime: this.formatTime(formValues.JobStartTime),
			IntervalDay: intervalDay,
			ScheduledOn: scheduledOn,
			Status: 'Active',
			_Disabled: 'Delete'
		};
	}


	EditList() {
		this.isEditMode = true;
		this.AddEditAutoProcessForm.markAllAsTouched();

		const intervalType = this.AddEditAutoProcessForm.get('JobIntervalType')?.value.Text;
		this.setValidatorsBasedOnIntervalType(intervalType);

		this.AddEditAutoProcessForm.updateValueAndValidity();

		if (!this.validateJobIntervalType()) {
			return;
		}

		if (!this.AddEditAutoProcessForm.valid) {
			return;
		}
		else if(this.AddEditAutoProcessForm.valid){
			if (this.editListItems) {
				this.processWeekDaysSelection();

				const updatedItem: Schedule = {
					...this.createUpdateTriggerGridData(),
					ClientScheduleUkey: this.clientScheduleUkey
				};

				this.updateGridItem(updatedItem);
				const newSchedules = this.convertTriggerData(updatedItem);
				this.schedules = [...this.schedules, ...newSchedules];


				this.resetConfigurationForm();
				this.isEditMode = false;
				this.editListItems = false;
				this.cdr.detectChanges();

			}
		}
		this.cdr.detectChanges();

	}


	private createUpdateTriggerGridData(): Schedule {
		const formValues = this.AddEditAutoProcessForm.value,
		 jobStartDate = this.AddEditAutoProcessForm.get('JobStartDate')?.value,
		 jobEndDate = this.AddEditAutoProcessForm.get('JobEndDate')?.value,

		 scheduledOn1 = formValues.DaysInterval !== null
				? 'N/A'
				: this.selectedMonthDaysString || this.selectedDaysList || 'N/A';

		return {
			SchedulingType: formValues.JobIntervalType?.Text || 'N/A',
			JobStartDate: jobStartDate,
			JobEndDate: jobEndDate,
			StartDate: this.localizationSrv.TransformDate(jobStartDate),
			EndDate: this.localizationSrv.TransformDate(jobEndDate),
			ScheduledTime: this.formatTime(formValues.JobStartTime),
			IntervalDay: formValues.DaysInterval || 'N/A',
			ScheduledOn: scheduledOn1
		};
	}


	private updateGridItem(updatedItem: Schedule): void {

		if (!this.AddEditAutoProcessForm.valid) {
			return;
		}

		const index = this.triggersDetailsData.findIndex((item: Schedule) =>
			item._ClientScheduleUkey === updatedItem.ClientScheduleUkey);

		this.saveBtnEnable = true;

		if (index !== Number(magicNumber.minusOne)) {
			this.triggersDetailsData = [
				...this.triggersDetailsData.slice(magicNumber.zero, index),
				{ ...this.triggersDetailsData[index], ...updatedItem },
				...this.triggersDetailsData.slice(index + magicNumber.one)
			];
		} else {
			this.triggersDetailsData = [...this.triggersDetailsData, updatedItem];
		}
	}


	private formatTime(date: Date | null): string {
		if (date) {
			const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
			return timeString.replace('am', 'AM').replace('pm', 'PM');
		}
		return '';
	}

	triggerRequired(e: DropdownModel) {
		this.resetAndClearValidators();

		const textValue = String(e.Text);
		this.setValidatorsBasedOnIntervalType(textValue);

		this.selectWeekDay = e.Text === "Weekly";
		this.triggerStartTime = e.Text !== "None";
		this.triggerDayInterval = e.Text === "Daily";
		this.triggerMonth = e.Text === "Monthly";
	}

	private resetAndClearValidators() {
		const formControls = this.AddEditAutoProcessForm.controls;

		formControls['JobStartDate'].reset();
		formControls['JobEndDate'].reset();
		formControls['DaysInterval'].reset();
		formControls['JobInterval'].reset();
		formControls['JobStartTime'].reset();

		formControls['JobStartDate'].clearValidators();
		formControls['JobEndDate'].clearValidators();
		formControls['DaysInterval'].clearValidators();
		formControls['JobInterval'].clearValidators();
		formControls['JobStartTime'].clearValidators();
	}

	private setValidatorsBasedOnIntervalType(intervalType: string) {
		const formControls = this.AddEditAutoProcessForm.controls;
		const { RequiredValidator } = this.customValidator;

		Object.keys(formControls).forEach((control) => {
			formControls[control].clearValidators();
		});

		const commonRequiredValidator = (fieldName: string) =>
			RequiredValidator('PleaseSelectData', [{ Value: fieldName, IsLocalizeKey: true }]);

		formControls['JobStartDate'].setValidators([commonRequiredValidator('StartDate')]);
		formControls['JobEndDate'].setValidators([commonRequiredValidator('EndDate')]);
		formControls['JobStartTime'].setValidators([commonRequiredValidator('ScheduledTime')]);

		if (intervalType === "Daily") {
			formControls['DaysInterval'].setValidators([commonRequiredValidator('DayIntervalRecurEvery')]);
		} else if (intervalType === "Monthly") {
			formControls['JobInterval'].setValidators([commonRequiredValidator('ScheduledOn')]);
		}

		Object.keys(formControls).forEach((control) => {
			formControls[control].updateValueAndValidity();
		});
	}


	public handleDaySelectionChange(dayInfo: IDayInfo[]) {
		this.selectedDays = dayInfo.reduce<Record<string, boolean>>((acc, curr) => {
			acc[curr.day.toLowerCase()] = curr.isSelected;
			return acc;
		}, {});

		this.AddEditAutoProcessForm.markAsDirty();
	}

	private setScheduledTime(timeString: string): Date {
		const currentDate = new Date(),
		 [time, modifier] = timeString.split(' ');
		// eslint-disable-next-line prefer-const
		let [hoursPart, minutes] = time.split(':').map(Number);

		if (modifier === 'PM' && hoursPart < Number(magicNumber.tweleve)) {
			hoursPart += magicNumber.tweleve;
		} else if (modifier === 'AM' && hoursPart === Number(magicNumber.tweleve)) {
			hoursPart = magicNumber.zero;
		}

		const scheduledDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			hoursPart,
			minutes
		);

		return scheduledDate;
	}

	submitForm() {

		const formValues = this.BasicDetailsForm.value,

		 isEmailRequired = formValues.isEmailReq;
		let successEmailIds = isEmailRequired
				? formValues.SuccessEmail
				: null,
		 exceptionEmailIds = isEmailRequired
				? formValues.ExceptionEmail
				: null;

		const trimEmailIds = (emailIds: string | null): string | null => {
			if (emailIds) {
				return emailIds.trim().endsWith(',')
					? emailIds.trim().slice(0, -1)
					: emailIds.trim();
			}
			return null;
		};
		successEmailIds = trimEmailIds(successEmailIds);
		exceptionEmailIds = trimEmailIds(exceptionEmailIds);

		const payload = {
			jobId: this.jobID,
			clientMappingUkey: this.clientScheduleUkey
				? this.clientScheduleUkey
				: null,
			isEmailRequired: isEmailRequired,
			successEmailIds: successEmailIds,
			exceptionEmailIds: exceptionEmailIds,
			jobMappingAndSchedule: this.schedules
		} as JobScheduleMapping;
		this.AddEditAutoProcessForm.markAsPristine();
		this.BasicDetailsForm.markAsPristine();
		if(this.BasicDetailsForm.valid){
			this.submitJobData(payload);
		}

	}

	private submitJobData(jobData: JobScheduleMapping) {
		if (this.isEmailReq && this.isEmailFieldsInvalid()) {
			this.toasterService.showToaster(ToastOptions.Error, 'OneEmailReqValidation');
			return;
		}

		this.autoProcessServices.addJob(jobData)
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe({
				next: (data: ApiResponse) => {
					if (data.Succeeded) {
						this.toasterService.showToaster(ToastOptions.Success, 'JobSavedSuccessfully');
						this.commonService.resetAdvDropdown(this.entityId);
						this.AddEditAutoProcessForm.markAsPristine();
						this.AddEditAutoProcessForm.updateValueAndValidity();
						this.BasicDetailsForm.markAsPristine();
						this.BasicDetailsForm.updateValueAndValidity();
						this.eventLogService.isUpdated.next(true);
						this.scrollToTop.scrollTop();
						this.resetConfigurationForm();
						this.getJobById(this.jobukey);
						this.saveBtnEnable=false;
					}
					else{
						this.toasterService.showToaster(ToastOptions.Error, data.Message??'');
					}
				}
			});
	}

	private isEmailFieldsInvalid(): boolean {
		const successEmail = this.BasicDetailsForm.controls['SuccessEmail'].value,
		 exceptionEmail = this.BasicDetailsForm.controls['ExceptionEmail'].value;
		return !successEmail && !exceptionEmail;
	}

	onChangeTextBox(controlName: string) {
		this.saveBtnEnable = true;
		const control = this.BasicDetailsForm.get(controlName);

		if (control) {
			control.markAsTouched();

			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const emails = control.value
				? control.value.split(',')
				: [];

			const invalidEmails: string[] = [];
			emails.forEach((email:string) => {
				const trimmedEmail = email.trim();

				if (trimmedEmail === '' && (email.includes(',') || email.includes(' '))) {
					invalidEmails.push('Invalid email');
				} else if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
					invalidEmails.push(trimmedEmail);
				}
			});

			const hasConsecutiveCommas = control.value.includes(',,') || control.value.includes(', ,');
			if (hasConsecutiveCommas) {
				control.setErrors({ email: true, message: 'MultipleEmailValidationMessage' });
			} else if (invalidEmails.length > 0) {
				if (control.value.includes(',')) {
					control.setErrors({ email: true, message: 'MultipleEmailValidationMessage' });
				} else {
					control.setErrors({ email: true, message: 'PleaseEnterAValidEmailAddress' });
				}
			} else {
				control.setErrors(null);
			}
		}
	}

	savebtnEnable(){
		this.saveBtnEnable = true;
	}

	public generateFileName(){
		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Schedule_${uniqueDateCode}`;

		return fileName;
	}

	public calculateDate(date: number): string {
		return date < Number(magicNumber.ten)
			? `0${date}`
			: date.toString();
	}

	onCancelClick() {
		this.route.navigate([NavigationPaths.list]);
	}

	private resetConfigurationForm(){
		this.AddEditAutoProcessForm.reset();
		this.selectedDaysList = [];
		this.selectedMonthDaysString = '';
		this.daysInfo.forEach((x) =>
			x.isSelected = false);
		this.triggerStartTime = false;
		this.selectWeekDay = false;
		this.triggerMonth = false;
		this.triggerDayInterval = false;
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
