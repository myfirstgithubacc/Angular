/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable one-var */
/* eslint-disable max-lines-per-function */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { of, Subject, takeUntil } from "rxjs";
import { ReportDataService } from 'src/app/services/report/report.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ReportNavigationPaths } from '../../constants/route-path';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ReportFolderList } from '@xrm-core/models/report/report-folder-list';
import { IDropdown, IDropdownModel } from '@xrm-shared/models/common.model';
import { Day, Month, OutputType, ReportType, Scheduled } from '../../constants/enum-constants';
import { DatePipe } from '@angular/common';
import { NavigationService } from '../../common/utils/common-method';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ReportDetails, Schedule } from '@xrm-core/models/report/report-payload';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { hasPermissions } from 'src/app/modules/acrotrac/expense/utils/userDependentList';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { StatusData } from '@xrm-shared/models/common-header.model';


@Component({
	selector: 'app-format-and-save',
	templateUrl: './format-and-save.component.html',
	styleUrls: ['./format-and-save.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatAndSaveComponent implements OnInit, OnDestroy {
	public scheduled = Scheduled;
	public magicNumber = magicNumber;
	public isScheduledReport:boolean;
	public openDialog:boolean;
	public AddEditReportForm: FormGroup;
	public userName:string;
	public isEditMode: boolean = false;
	public selectedOption:string | null | undefined;
	public createPermission:boolean = false;
	public isDisabled = false;
	private activeItem: number = OutputType.List;
	public currentStep = magicNumber.two;
	public isCustomReport: boolean = false;
	private reportLabelTextParams: DynamicParam[];
	private reporNametLabelTextParams: DynamicParam[];
	public userPayload:any = {
		RoleGroupId: 2,
		AllStaffingUsers: false
	};
	public DaysList: IDropdown[] = [
		{ Text: Day.Sun, Value: Day.Sun },
		{ Text: Day.Mon, Value: Day.Mon },
		{ Text: Day.Tue, Value: Day.Tue },
		{ Text: Day.Wed, Value: Day.Wed },
		{ Text: Day.Thu, Value: Day.Thu },
		{ Text: Day.Fri, Value: Day.Fri },
		{ Text: Day.Sat, Value: Day.Sat }
	  ];

	  public MonthList: IDropdown[] = [
		{ Text: Month.January, Value: Month.JanuaryValue },
		{ Text: Month.February, Value: Month.FebruaryValue },
		{ Text: Month.March, Value: Month.MarchValue },
		{ Text: Month.April, Value: Month.AprilValue },
		{ Text: Month.May, Value: Month.May },
		{ Text: Month.June, Value: Month.JuneValue },
		{ Text: Month.July, Value: Month.JulyValue },
		{ Text: Month.August, Value: Month.AugustValue },
		{ Text: Month.September, Value: Month.SeptemberValue },
		{ Text: Month.October, Value: Month.OctoberValue },
		{ Text: Month.November, Value: Month.NovemberValue },
		{ Text: Month.December, Value: Month.DecemberValue }
	];

	public SchedulingList: IDropdown[] = [
		{ Text: Scheduled.Daily, Value: Scheduled.DailyValue },
		{ Text: Scheduled.Weekly, Value: Scheduled.WeeklyValue },
		{ Text: Scheduled.Monthly, Value: Scheduled.MonthlyValue },
		{ Text: Scheduled.Yearly, Value: Scheduled.YearlyValue },
		{ Text: Scheduled.Once, Value: Scheduled.Once }
	];

	public DatesList: IDropdownModel[] = [
		{ Text: "1", Value: magicNumber.one },
		{ Text: "2", Value: magicNumber.two },
		{ Text: "3", Value: magicNumber.three },
		{ Text: "4", Value: magicNumber.four },
		{ Text: "5", Value: magicNumber.five },
		{ Text: "6", Value: magicNumber.six },
		{ Text: "7", Value: magicNumber.seven },
		{ Text: "8", Value: magicNumber.eight },
		{ Text: "9", Value: magicNumber.nine },
		{ Text: "10", Value: magicNumber.ten },
		{ Text: "11", Value: magicNumber.eleven },
		{ Text: "12", Value: magicNumber.tweleve },
		{ Text: "13", Value: magicNumber.thirteen },
		{ Text: "14", Value: magicNumber.fourteen },
		{ Text: "15", Value: magicNumber.fifteen },
		{ Text: "16", Value: magicNumber.sixteen },
		{ Text: "17", Value: magicNumber.seventeen },
		{ Text: "18", Value: magicNumber.eighteen },
		{ Text: "19", Value: magicNumber.nineteen },
		{ Text: "20", Value: magicNumber.twenty },
		{ Text: "21", Value: magicNumber.twentyOne },
		{ Text: "22", Value: magicNumber.twentyTwo },
		{ Text: "23", Value: magicNumber.twentyThree },
		{ Text: "24", Value: magicNumber.twentyFour },
		{ Text: "25", Value: magicNumber.twentyFive },
		{ Text: "26", Value: magicNumber.twentySix },
		{ Text: "27", Value: magicNumber.twentySeven },
		{ Text: "28", Value: magicNumber.twentyEight },
		{ Text: "29", Value: magicNumber.twentyNine },
		{ Text: "30", Value: magicNumber.thirty },
		{ Text: "31", Value: magicNumber.thirtyOne }
	];
	public folderListData:IDropdown[] = [];
	private thresholdDate: Date;
	private destroyAllSubscribtion$ = new Subject<void>();
	public outputTypeId:number = OutputType.List;
	public reportDetails: ReportDetails;
	public entityId = XrmEntities.Report;
	public commonHeader:FormGroup;
	public statusData: StatusData = {
		items: [
			{
				title: 'Report Name',
				titleDynamicParam: [],
				item: '',
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: ''
			}
		]
	};
	// eslint-disable-next-line max-params, max-lines-per-function
	constructor(
    private route: Router,
    private fb: FormBuilder,
    public sector: SectorService,
	private reportDataService:ReportDataService,
	private localizationService:LocalizationService,
	private activatedRoute: ActivatedRoute,
	private customValidators: CustomValidators,
	private toasterServc:ToasterService,
	private datePipe: DatePipe,
	private cdr : ChangeDetectorRef,
	private navigationService: NavigationService,
	private dialogService: DialogPopupService,
	private sessionStorage: SessionStorageService
	) {
		const report = [{ Value: 'Report', IsLocalizeKey: true }],
			reportName= [{ Value: 'ReportName', IsLocalizeKey: true }];
		this.reportLabelTextParams = this.localizationService.getLocalizationMessageInLowerCase(report);
		this.reporNametLabelTextParams = this.localizationService.getLocalizationMessageInLowerCase(reportName);
		this.reportDetails = JSON.parse(window.sessionStorage.getItem('reportData') ?? '{}');
		this.AddEditReportForm = this.fb.group({
			ReportName: ['', [this.customValidators.requiredValidationsWithMessage('Please enter Report Name.')]],
			ReportDescription: [null],
			saveUbderlibrary: [null],
			adminreport: [null],
			sendViaEmail: [false],
			share: [null],
			scheduledReport: [false],
			recipient: [null],
			emailRecipients: [null, [this.customValidators.MultiEmailValidator('PleaseEnterAValidEmailAddress')]],
			emailSubject: [null],
			viewOnly: [null],
			viewEdit: [null],
			editAccessibleToOthers: [false],
			// scheduling: [null],
			DaysList: [null],
			subject: [null],
			dayOfWeek: [null],
			time: [null],
			MonthList: [null],
			owner: [null, [this.customValidators.requiredValidationsWithMessage('Please select Owner.')]],
			othersAccess: [false],
			folderId: [null],
			schedule: this.fb.group({
				savedReportId: 0,
				userId: null,
				emailTo: [null, [this.customValidators.MultiEmailValidator('PleaseEnterAValidEmailAddress')]],
				selectedOption: null,
				selectedDays: [null],
				selectedMonths: [null],
				selectedDates: [null],
				selectedHour: null,
				selectedMinute: null,
				selectedAmPm: null,
				format: null,
				schedule: null,
				lastRunResult: null,
				lastRun: null,
				nextRun: null,
				scheduleStart: null,
				scheduleEnd: null,
				dataFilters: null,
				timezone: null
			})
		});
	}

	ngOnInit(): void {
		this.setThresholdDate();
		const roleGroupId = this.sessionStorage.get('roleGroupId') ?? '',
			obj = this.sessionStorage.get('permission');
		if(obj){
			const permission =JSON.parse(obj) ?? [];
			this.createPermission = this.checkPermission( permission[0].EntityActions, Permission.ManageFolder);
		}
		if(roleGroupId)
			this.userPayload.RoleGroupId = roleGroupId === '2'
				?'0'
				:roleGroupId;
		this.activatedRoute.data.subscribe((data: any) => {
			this.isCustomReport = data.isCustomReport;
			if(this.isCustomReport){
				this.reportDataService.setStepperData.next({currentStep: 2});
			}
			else{
				this.reportDataService.setStepperData.next({currentStep: 3});
			}
		});
		this.reportDataService.isStepperClickedObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
		  if (!data) return;
		  const targetStep = this.isCustomReport
				? magicNumber.one
				: magicNumber.two;
		  switch (data.index) {
				case targetStep:
			  this.handleStep();
			  break;
				case magicNumber.one:
			  if (!this.isCustomReport) {
						this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.parameterSelection]);
			  }
			  break;
				default:
			  break;
		  }
		});
		const reportData = window.sessionStorage.getItem('reportData');
		if(reportData){
			const data = JSON.parse(reportData);
			this.reportDetails = data;
			if(this.reportDetails.ReportId === Number(magicNumber.zero)){
				this.userName = window.sessionStorage.getItem('UserFullName') ?? '';
				this.AddEditReportForm.get('owner')?.setValue({Text: this.userName, Value: this.reportDetails.UserId.toString()});
			}
			else{
				this.userName = this.reportDetails.OwnerName;
			}
			this.activeItem = this.reportDetails.OutputTypeId;
			this.outputTypeId = this.activeItem;
			this.statusData.items[0].item = this.reportDetails.ReportName;
			if(this.reportDetails.UKey != '') {
				this.AddEditReportForm.patchValue({
					ReportName: this.reportDetails.ReportName,
					ReportDescription: this.reportDetails.Json.ReportDescription,
					owner: {Text: this.reportDetails.OwnerName, Value: this.reportDetails.OwnerId.toString()},
					othersAccess: this.reportDetails.RunAccessibleToOthers,
					editAccessibleToOthers: this.reportDetails.EditAccessibleToOthers,
					scheduledReport: this.reportDetails.ScheduledReport,
					sendViaEmail: this.reportDetails.SendViaEmail,
					emailRecipients: this.reportDetails.EmailRecipients,
					emailSubject: this.reportDetails.EmailSubject
			   });
			   if(this.reportDetails.RunAccessibleToOthers){
					this.getFolderList(this.reportDetails.FolderId);
			   }
			   if(this.reportDetails.ScheduledReport){
					this.isScheduledReport = true;
					this.AddEditReportForm.get('schedule')?.get('emailTo')?.setValue(this.reportDetails.Json.Schedule?.EmailTo);
					this.AddEditReportForm.get('subject')?.setValue(this.reportDetails.Subject);
					const index = this.SchedulingList.findIndex((a:any) =>
							a.Value == this.reportDetails.Json.Schedule?.SelectedOption),
						scheduleEnd = this.reportDetails.Json.Schedule?.ScheduleEnd,
						scheduleEndDate = scheduleEnd
							? new Date(scheduleEnd)
							: null,
						scheduleStart = this.reportDetails.Json.Schedule?.ScheduleStart,
						scheduleStartDate = scheduleStart
							? new Date(scheduleStart)
							: null,
						selectedHour= this.reportDetails.Json.Schedule?.SelectedHour,
						selectedMinute= this.reportDetails.Json.Schedule?.SelectedMinute,

						selectedTime = new Date(`09/09/2024 ${selectedHour}:${selectedMinute}`),
						 selectedMonths = this.reportDetails.Json.Schedule?.SelectedMonths
							?this.reportDetails.Json.Schedule.SelectedMonths.split(',').map((a:string) => {
								const indexMonths = this.MonthList.findIndex((month:IDropdown) =>
									month.Value == a);
								return {Text: this.MonthList[indexMonths].Text, Value: this.MonthList[indexMonths].Value};
							})
							: null,
						selectedDays = this.reportDetails.Json.Schedule?.SelectedDays
							?this.reportDetails.Json.Schedule.SelectedDays.split(',').map((a:string) => {
								const indexDate = this.DaysList.findIndex((days:any) =>
									days.Text == a);
								return {Text: a, Value: this.DaysList[indexDate].Value};
							})
							: null;
					let selectedDates;
					if (this.reportDetails.Json.Schedule?.SelectedDates) {
						if (this.reportDetails.Json.Schedule.SelectedOption === String(Scheduled.Once)) {
							selectedDates = new Date(this.reportDetails.Json.Schedule.SelectedDates);
							this.thresholdDate = selectedDates;
						} else {
							selectedDates = this.reportDetails.Json.Schedule.SelectedDates.split(',').map((a: string) => {
								const indexDate = this.DatesList.findIndex((month: any) =>
									month.Text === a);
								return { Text: a, Value: this.DatesList[indexDate]?.Value };
							});
							this.thresholdDate = scheduleStartDate ?? new Date();
						}
					} else {
						selectedDates = null;
					}

					this.AddEditReportForm.get('schedule')?.get('selectedMonths')?.setValue(selectedMonths);
					this.AddEditReportForm.get('schedule')?.get('selectedDates')?.setValue(selectedDates);
					this.AddEditReportForm.get('schedule')?.get('selectedDays')?.setValue(selectedDays);
					 if(index > Number(magicNumber.minusOne)){
						this.selectedOption = this.reportDetails.Json.Schedule?.SelectedOption;
						this.AddEditReportForm.get('schedule')?.get('selectedOption')?.setValue(this.SchedulingList[index]);
					 }
					 this.AddEditReportForm.get('schedule')?.get('scheduleEnd')?.setValue(scheduleEndDate);
					 this.AddEditReportForm.get('schedule')?.get('scheduleStart')?.setValue(scheduleStartDate);
					 this.AddEditReportForm.get('schedule')?.get('selectedHour')?.setValue(selectedTime);
					 this.changeofScheduling({Text: '', Value: this.reportDetails.Json.Schedule?.SelectedOption?? ''}, false);
			    }
			}
			if(this.reportDetails.IsCopyOfPredefined || this.reportDetails.CopyMode){
				this.AddEditReportForm.get('ReportDescription')?.setValue(this.reportDetails.Json.ReportDescription);
			}
			if(this.reportDetails.CopyMode || this.reportDetails.IsCopyOfPredefined){
				this.AddEditReportForm.get('ReportName')?.setValue(null);
				this.reportDetails.ReportId = magicNumber.zero;
			}
		}
	}

	disabledDates = (date: Date): boolean => {return date < this.thresholdDate; }// Disable any date before the threshold };

	public onChangeStartDate(){
		const startDate = this.AddEditReportForm.get('schedule')?.get('scheduleStart'),
			endDate = this.AddEditReportForm.get('schedule')?.get('scheduleEnd');
		if(startDate?.value && endDate?.value){
			if(startDate.value > endDate.value){
				startDate.setErrors({
					error: true,
					message: 'Start date cannot be less than end date.'
				});
			}
			else{
				startDate.setErrors(null);
				endDate.setErrors(null);
				endDate.markAsTouched();
				endDate.updateValueAndValidity();
			}
		}
	}
	public onChangeEndDate(){
		const startDate = this.AddEditReportForm.get('schedule')?.get('scheduleStart'),
			endDate = this.AddEditReportForm.get('schedule')?.get('scheduleEnd');
		if(startDate?.value && endDate?.value){
			if(endDate.value < startDate.value){
				endDate.setErrors({
					error: true,
					message: 'End date cannot be less than start date.'
				});
			}
			else{
				endDate.setErrors(null);
				startDate.setErrors(null);
				startDate.markAsTouched();
				startDate.updateValueAndValidity();
				this.cdr.detectChanges();
			}
		}
	}
	private checkPermission(entityActions: {EntityTypeId: number, EntityType: string, ActionId: number,
		ActionName: string}[], permission: Permission): boolean {
		return hasPermissions(entityActions, permission);
	}

	private handleStep(): void {
		const stepperData = {
			currentStep: this.isCustomReport
				? magicNumber.one
				: magicNumber.two
		};
		let path: string;
		if (this.isCustomReport) {
			if (this.reportDetails.UKey) {
				path = `${ReportNavigationPaths.addEdit.customReport.build}/${this.reportDetails.UKey}`;
			} else {
				path = ReportNavigationPaths.addEdit.customReport.build;
			}
		} else {
			path = ReportNavigationPaths.addEdit.predefinedReport.copyModify;
		}
		this.reportDataService.setStepperData.next(stepperData);
		this.route.navigate([path]);
	}

	public next(): void {
		this.currentStep += 1;
	}
	onCopyAccept(){

	}
	public folderAdd() {
		this.toasterServc.resetToaster();
		this.openDialog = true;
	}

	changeofScheduling(event: IDropdown, isResetControl:boolean = true) {
		this.selectedOption = this.AddEditReportForm.get('schedule.selectedOption')?.value?.Value;
		const typeofScheduling = this.AddEditReportForm.get('schedule') as FormGroup,
			controlsToManage = ['selectedHour', 'selectedDays', 'selectedMonths', 'selectedDates', 'scheduleEnd', 'scheduleStart'];
		if(isResetControl){
			this.resetControls(controlsToManage, typeofScheduling);
			this.setThresholdDate();
		}
		this.clearValidatorsFromControls(controlsToManage, typeofScheduling);
		switch (event.Value) {
			case Scheduled.DailyValue:
				this.addSchedulingValidators(typeofScheduling, {
					'selectedHour': ['PleaseEnterData', 'HourFormat'],
					'scheduleEnd': ['PleaseEnterData', 'EndDate'],
					'scheduleStart': ['PleaseEnterData', 'StartDate']
				});
				break;
			case Scheduled.MonthlyValue:
				this.addSchedulingValidators(typeofScheduling, {
					'selectedHour': ['PleaseEnterData', 'HourFormat'],
					'scheduleEnd': ['PleaseEnterData', 'EndDate'],
					'scheduleStart': ['PleaseEnterData', 'StartDate'],
					'selectedDates': ['PleaseSelectData', 'DayOfMonth']
				});
				break;
			case Scheduled.Once:
				this.addSchedulingValidators(typeofScheduling, {
					'selectedHour': ['PleaseEnterData', 'HourFormat'],
					'selectedDates': ['PleaseEnterData', 'Date']
				});
				break;
			case Scheduled.WeeklyValue:
				this.addSchedulingValidators(typeofScheduling, {
					'selectedHour': ['PleaseEnterData', 'HourFormat'],
					'scheduleEnd': ['PleaseEnterData', 'EndDate'],
					'scheduleStart': ['PleaseEnterData', 'StartDate'],
					'selectedDays': ['PleaseSelectData', 'Days_s']
				});
				break;
			case Scheduled.YearlyValue:
				this.addSchedulingValidators(typeofScheduling, {
					'selectedMonths': ['PleaseSelectData', 'Month'],
					'selectedDates': ['PleaseSelectData', 'DayOfMonth'],
					'selectedHour': ['PleaseEnterData', 'HourFormat'],
					'scheduleEnd': ['PleaseEnterData', 'EndDate'],
					'scheduleStart': ['PleaseEnterData', 'StartDate']
				});
				break;
		}
		controlsToManage.forEach((control) =>
			typeofScheduling.controls[control].updateValueAndValidity());
		this.cdr.markForCheck();
	}

	private addValidators(formGroup: FormGroup, validators: Record<string, [string, string]>) {
		for (const controlName in validators) {
			if (Object.prototype.hasOwnProperty.call(validators, controlName)) {
				formGroup.controls[controlName].addValidators([
					this.customValidators.requiredValidationsWithMessage(
						validators[controlName][0],
						validators[controlName][1]
					)
				]);
			}
		}
	}
	getFolderListAgain(event:string){
		if(event){
			this.getFolderList();
		}
	}

	getFolderList(folderId?:number){
		this.reportDataService.getFolderList().pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<ReportFolderList[]>) => {
				if(isSuccessfulResponse(res)) {
					let isFolder = false;
					res.Data.forEach((item) => {
						const data = { 'Text': item.FolderName, 'Value': item.Id.toString() };
						this.folderListData.push(data);
						if (folderId && item.Id === folderId) {
							isFolder = true;
						}
					});
					if(folderId){
						const folderIdControl = this.AddEditReportForm.get('folderId');
						folderIdControl?.setValidators([this.customValidators.RequiredValidator('Please select Save Under Library Folder.')]);
						folderIdControl?.updateValueAndValidity();
						if (isFolder) {
							folderIdControl?.setValue({
								Text: this.reportDetails.FolderName,
								Value: this.reportDetails.FolderId.toString()
							});
						} else {

							folderIdControl?.reset();
							folderIdControl?.updateValueAndValidity();
						}
					}
				}
			});
	}

	toggleDiv(event: any): void {
		if(!this.folderListData.length){
			this.getFolderList();
			this.AddEditReportForm.get('folderId')?.setValidators([this.customValidators.RequiredValidator('Please select Save Under Library Folder.')]);
			this.AddEditReportForm.get('folderId')?.updateValueAndValidity();
		}
		else{
			this.AddEditReportForm.get('folderId')?.clearValidators();
			this.AddEditReportForm.get('folderId')?.updateValueAndValidity();
		}
	}

	prepareReportPayload(){
		this.reportDetails.ReportName = this.AddEditReportForm.get('ReportName')?.value;
		this.reportDetails.OutputTypeId = this.outputTypeId;
		this.reportDetails.OwnerId = this.AddEditReportForm.get('owner')?.value?.Value;
		this.reportDetails.SendViaEmail = this.AddEditReportForm.get('sendViaEmail')?.value;
		this.reportDetails.ScheduledReport = this.AddEditReportForm.get('scheduledReport')?.value;
		this.reportDetails.Json.ReportName = this.AddEditReportForm.get('ReportName')?.value;
		this.reportDetails.Json.ReportDescription = this.AddEditReportForm.get('ReportDescription')?.value;
		this.reportDetails.RunAccessibleToOthers = this.AddEditReportForm.get('othersAccess')?.value;
		this.reportDetails.EditAccessibleToOthers = this.AddEditReportForm.get('editAccessibleToOthers')?.value;
		if(this.AddEditReportForm.get('othersAccess')?.value){
			this.reportDetails.Json.FolderID = Number(this.AddEditReportForm.get('folderId')?.value?.Value);
		}
		this.reportDetails.EmailRecipients = this.AddEditReportForm.get('emailRecipients')?.value;
		this.reportDetails.EmailSubject = this.AddEditReportForm.get('emailSubject')?.value;
		this.reportDetails.Subject = this.AddEditReportForm.get('subject')?.value;
		if(this.isScheduledReport){
			this.reportDetails.ScheduledReport = true;
			const payload = this.AddEditReportForm.getRawValue(),
				date: Date = payload.schedule?.selectedHour,
				hours = date.getHours(),
				minutes = date.getMinutes(),
				amPm = hours >= Number(magicNumber.tweleve)
					? 'PM'
					: 'AM',
				hour = hours % magicNumber.tweleve || magicNumber.tweleve,
				minute = minutes < Number(magicNumber.ten)
					? `0${minutes}`
					: minutes,
				selectedDays = payload.schedule?.selectedDays,
				selectedMonths = payload.schedule?.selectedMonths,
				selectedDates = payload.schedule?.selectedDates,
			 schedule = new Schedule();
			schedule.SelectedDays = selectedDays?.map((item: IDropdown) =>
				item.Value).join();
			schedule.SelectedMonths = selectedMonths?.map((item: IDropdown) =>
				item.Value).join();
			schedule.SelectedDates = payload.schedule?.selectedOption?.Value === Scheduled.Once?
				this.datePipe.transform(selectedDates, 'MM/dd/YYYY'):
				selectedDates?.map((item: IDropdown) =>
					item.Value).join();
			schedule.SelectedHour = hour.toString();
			schedule.SelectedMinute = minute.toString();
			schedule.SelectedAmPm = amPm;
			schedule.SelectedOption = payload.schedule?.selectedOption?.Value;
			schedule.ScheduleEnd = this.datePipe.transform(payload?.schedule?.scheduleEnd, 'MM/dd/YYYY');
			schedule.ScheduleStart = this.datePipe.transform(payload?.schedule?.scheduleStart, 'MM/dd/YYYY');
			// schedule.TimeZone = "Eastern Standard Time";
			schedule.EmailTo = payload.schedule.emailTo;
			this.reportDetails.Json.Schedule = schedule;
		}
		else{
			this.reportDetails.Json.Schedule = null;
		}
	}
	runReport(){
		this.prepareReportPayload();
		if(this.reportDetails.CopyMode || this.reportDetails.IsCopyOfPredefined){
			this.reportDetails.UKey = '';
		}
		this.reportDetails.SaveReport = false;
		this.reportDetails.RunMode = true;
		if(this.reportDetails.OutputTypeId != 295 && this.reportDetails.OutputTypeId != 296){
			this.reportDetails.RunReportCallNeeded = true;
		}
		window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
		if(this.isCustomReport){
			this.route.navigate([ReportNavigationPaths.addEdit.customReport.listView]);
			this.reportDataService.setStepperData.next({currentStep: 3});
		}
		else{
			this.route.navigate([`/xrm/report/report-library/pre-defined-report/list-view`]);
			this.reportDataService.setStepperData.next({currentStep: 4});
		}
	}
	savenRunReport() {
		if(this.AddEditReportForm.valid){
			this.prepareReportPayload();
			if (this.reportDetails.UKey != '' && !this.reportDetails.CopyMode && !this.reportDetails.IsCopyOfPredefined) {
				this.reportDataService.updateReport(this.reportDetails).subscribe((data: any) => {
					if (data.Succeeded) {
						this.toasterServc.displayToaster(ToastOptions.Success, 'SaveExecutionSuccess', this.reportLabelTextParams);
						this.reportDetails.SaveReport = true;
						this.reportDetails.SavenRunMode = true;
						this.reportDetails.ExecuteMode = false;
						this.reportDetails.RunMode = false;
						if(this.reportDetails.OutputTypeId != 295 && this.reportDetails.OutputTypeId != 296){
							this.reportDetails.RunReportCallNeeded = true;
						}
						window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
						if (this.isCustomReport) {
							this.route.navigate([ReportNavigationPaths.addEdit.customReport.listView]);
							this.reportDataService.setStepperData.next({ currentStep: 3 });
						}
						else {
							this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.listView]);
							this.reportDataService.setStepperData.next({ currentStep: 4 });
						}
					} else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.toasterServc.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', this.reporNametLabelTextParams);
					}
				});
			}
			else {
				const { PaginationDto, ...reportData } = this.reportDetails;
				reportData.Json.ReportId = magicNumber.zero;
				this.reportDataService.addReport(reportData).subscribe((data: any) => {
					if (data.Succeeded) {
						this.reportDetails.UKey = data.Data;
						this.toasterServc.displayToaster(ToastOptions.Success, 'SavedSuccesfully', this.reportLabelTextParams);
						this.reportDetails.SaveReport = true;
						this.reportDetails.SavenRunMode = true;
						this.reportDetails.ExecuteMode = false;
						this.reportDetails.RunMode = false;
						this.reportDetails.IsCopyOfPredefined = false;
						this.reportDetails.CopyMode = false;
						if(this.reportDetails.OutputTypeId != 295 && this.reportDetails.OutputTypeId != 296){
							this.reportDetails.RunReportCallNeeded = true;
						}
						window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
						if (this.isCustomReport) {
							this.route.navigate([ReportNavigationPaths.addEdit.customReport.listView]);
							this.reportDataService.setStepperData.next({ currentStep: 3 });
						}
						else {
							this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.listView]);
							this.reportDataService.setStepperData.next({ currentStep: 4 });
						}
					} else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.toasterServc.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', this.reporNametLabelTextParams);
					}
				});
			}
		}
		else{
			this.AddEditReportForm.markAllAsTouched();
		}
	}
	saveReport() {
		if (this.AddEditReportForm.valid) {
			this.prepareReportPayload();
			this.reportDetails.SaveReport = true;
			const { PaginationDto, ...rest } = this.reportDetails;
			if(this.reportDetails.CopyMode){
				rest.ReportId = 0;
				rest.Id = 0;
				rest.UKey = '';
				rest.SaveReport = true;
				this.reportDataService.addReport(rest).subscribe((data: any) => {
					if (data.Succeeded) {
						this.toasterServc.displayToaster(ToastOptions.Success, 'SavedSuccesfully', this.reportLabelTextParams);
						this.route.navigate([ReportNavigationPaths.list]);
					}
					else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.toasterServc.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', this.reporNametLabelTextParams);
					}
				});
			}
			else if (this.reportDetails.ReportId > Number(magicNumber.zero)) {
				this.reportDataService.updateReport(rest).subscribe((res: any) => {
					if (res.Succeeded) {
						this.toasterServc.displayToaster(ToastOptions.Success, 'SavedSuccesfully', this.reportLabelTextParams);
						this.route.navigate([ReportNavigationPaths.list]);
					}
					else if (res.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.toasterServc.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', this.reporNametLabelTextParams);
					}
				});
			}
			else {
				rest.Json.ReportId = magicNumber.zero;
				this.reportDataService.addReport(rest).subscribe((data: any) => {
					if (data.Succeeded) {
						this.toasterServc.displayToaster(ToastOptions.Success, 'SavedSuccesfully', this.reportLabelTextParams);
						this.route.navigate([ReportNavigationPaths.list]);
					}
					else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
						this.toasterServc.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', this.reporNametLabelTextParams);
					}
				});
			}
		}
		else{
			this.AddEditReportForm.markAllAsTouched();
		}
	}
	cancel(){
		/* if(this.isCustomReport){
		   	this.route.navigate([ReportNavigationPaths.addEdit.customReport.baseData]);
		   }
		   else{
		   	this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.baseData]);
		   } */
		this.route.navigate([ReportNavigationPaths.list]);
	}
	toggleActive(item: number): void {
		this.AddEditReportForm.markAsDirty();
		if(item === Number(OutputType.List)){
			this.reportDetails.ScheduledReport = false;
			const value =this.AddEditReportForm.get('scheduledReport')?.setValue(false) ?? false,
				sendViaEmail = this.AddEditReportForm.get('sendViaEmail')?.setValue(false) ?? false;
			this.resetControl(sendViaEmail);
			this.checkValidation(value);
			this.AddEditReportForm.markAsDirty();
		}
		this.outputTypeId = item;
		this.reportDetails.OutputTypeId = item;
		if (this.isActive(item)) {
			this.activeItem = 295;
		} else {
			this.activeItem = item;
		}
	}
	private resetControls(controlNames: string[], formGroup: FormGroup) {
		controlNames.forEach((control) =>
			formGroup.controls[control].reset());
	}

	private clearValidatorsFromControls(controlNames: string[], formGroup: FormGroup) {
		controlNames.forEach((control) =>
			formGroup.controls[control].clearValidators());
		controlNames.forEach((control) =>
			formGroup.controls[control].updateValueAndValidity());
	}

	private addSchedulingValidators(typeOfScheduling: FormGroup, validationConfig: Record<string, [string, string]>) {
		this.addValidators(typeOfScheduling, validationConfig);
	}

	checkValidation(event: boolean) {
		this.selectedOption = this.AddEditReportForm.get('schedule.selectedOption')?.value?.Value;
		this.isScheduledReport = this.AddEditReportForm.get('scheduledReport')?.value;
		const isSchedule = this.AddEditReportForm.get('schedule.selectedOption') as FormControl,
			subject = this.AddEditReportForm.get('subject') as FormControl;
		isSchedule.reset();
		subject.reset();
		if (event) {
			isSchedule.addValidators([this.customValidators.requiredValidationsWithMessage('PleaseSelectData', 'Scheduling')]);
			subject.addValidators([this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'Subject')]);
			subject.setValue(this.AddEditReportForm.get('ReportName')?.value);
		} else {
			isSchedule.clearValidators();
			subject.clearValidators();
			const controlsToManage = ['selectedHour', 'selectedDays', 'selectedMonths', 'selectedDates', 'scheduleEnd', 'scheduleStart'],
				typeofScheduling = this.AddEditReportForm.get('schedule') as FormGroup;
			this.resetControls(controlsToManage, typeofScheduling);
			this.clearValidatorsFromControls(controlsToManage, typeofScheduling);
			this.AddEditReportForm.get('schedule.emailTo')?.reset();
		}
		isSchedule.updateValueAndValidity();
		subject.updateValueAndValidity();
	}

	public resetControl(event:boolean){
		if(event){
			this.AddEditReportForm.get('emailSubject')?.setValidators([this.customValidators.requiredValidationsWithMessage('PleaseEnterData', 'Email Subject Line')]);
			this.AddEditReportForm.get('emailSubject')?.setValue(this.AddEditReportForm.get('ReportName')?.value);
		}
		else{
			this.AddEditReportForm.get('emailSubject')?.clearValidators();
			this.AddEditReportForm.get('emailRecipients')?.reset();
			this.AddEditReportForm.get('emailSubject')?.reset();
		}
		this.AddEditReportForm.get('emailSubject')?.updateValueAndValidity();

	}

	isActive(item: number): boolean {
		return this.activeItem === item;
	}

	private setThresholdDate() {
		this.thresholdDate = new Date();
		this.thresholdDate.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
	}

	back(){
		if(this.isCustomReport){
			this.reportDataService.setStepperData.next({currentStep: 1});
			if(this.reportDetails.IsCopyOfPredefined){
				this.route.navigate([`${ReportNavigationPaths.addEdit.customReport.build}`]);
			}
			else if(this.reportDetails.UKey && !this.reportDetails.CopyMode){
				this.route.navigate([`${ReportNavigationPaths.addEdit.customReport.build}/${this.reportDetails.UKey}`]);
			}
			else{
				this.route.navigate([ReportNavigationPaths.addEdit.customReport.build]);
			}
		}
		else{
			this.reportDataService.setStepperData.next({currentStep: 2});
			this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.copyModify]);
		}
	}

	public fetchChildren = (item: any) =>
		of(item.items);
	public hasChildren = (item: any) =>
		item.items && item.items.length > 0;
	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.dialogService.resetDialogButton();
		this.reportDataService.isStepperClicked.next(null);
		if (this.toasterServc.isRemovableToaster) {
			this.toasterServc.resetToaster();
		}
	}
}

