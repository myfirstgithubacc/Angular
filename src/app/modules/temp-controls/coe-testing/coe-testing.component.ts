import { Component, ElementRef, EventEmitter, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, RequiredValidator } from '@angular/forms';
import { Dropdown, TagVisibility } from '@xrm-shared/enums/dropdown.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { KendoTemplateDropdown } from '@xrm-shared/widgets/form-controls/kendo-template-dropdown/kendo-template-interface';
import { TimerangeWidget } from '@xrm-shared/widgets/form-controls/kendo-timerange/kendo-timerange.interface';
import { ShiftDetails } from '../../job-order/light-industrial/interface/li-request.interface';
import { LightIndustrialService } from '../../job-order/light-industrial/services/light-industrial.service';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { HttpClient } from '@angular/common/http';
import { DateTimeService } from '@xrm-shared/services/date-time.service';


@Component({
	selector: 'app-coe-testing',
	templateUrl: './coe-testing.component.html',
	styleUrls: ['./coe-testing.component.scss']
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class COETestingComponent extends HttpMethodService implements OnInit {
	// @ViewChild('editor', { static: true }) editor: ElementRef;
	formGroup!: FormGroup;
	treedropdownformgroup: FormGroup;
	dataItems: any[] = [];

	public daysInfo: IDayInfo[] = [];

	formData: any = {
		timePicker: '',
		dtTime: '',
		checkIn: '',
		startTimeControlName: '',
		endTimeControlName: ''
	};
	PayloadData: any = {
		timePicker: '',
		dtTime: '',
		checkIn: '',
		startTimeControlName: '',
		endTimeControlName: ''
	};
	public ddlData: any;
	copydialogdata = [
		{
			type: "dropdown",
			labels: { drpLabel: "FromSector" },
			drpData: [
				{ Text: "Presort", Value: "1" },
				{ Text: "Honeywells", Value: "2" },
				{ Text: "PBA", Value: "3" },
				{ Text: "BlueMoon", Value: "4" }
			],
			controlName: "sourcesector"
		},
		{
			type: "treeDropdown",
			labels: { drpLabel: "FromLocation", treeLabel: "SelectItems" },
			drpData: [
				{ Text: "Presort", Value: "1" },
				{ Text: "Honeywells", Value: "2" },
				{ Text: "PBA", Value: "3" },
				{ Text: "BlueMoon", Value: "4" }
			],
			treeData: [
				{
					text: "All",
					items: [
						{
							text: "One",
							value: "1"
						},
						{
							text: "Two",
							value: "2"
						},
						{
							text: "Three",
							value: "3"
						}
					]
				}
			],
			controlName: "SourceLocation"
		},
		{
			type: "dropdown",
			labels: { drpLabel: "ToSector" },
			drpData: [
				{ Text: "Presort", Value: "1" },
				{ Text: "Honeywells", Value: "2" },
				{ Text: "PBA", Value: "3" },
				{ Text: "BlueMoon", Value: "4" }
			],
			controlName: "DestinationSector"
		},
		{
			type: "dropdown",
			labels: { drpLabel: "ToLocation" },
			drpData: [
				{ Text: "Presort", Value: "1" },
				{ Text: "Honeywells", Value: "2" },
				{ Text: "PBA", Value: "3" },
				{ Text: "BlueMoon", Value: "4" }
			],
			controlName: "DestinationLocation"
		}
	];
	public defaultItem: { Text: string; Value: any, IsDeactivated: boolean } = {
		Text: 'Miami',
		Value: 5,
		IsDeactivated: false
	};
	public genders: string[] = ["Male", "Female", "Other"];

	public datamultiselect = [
		{ Text: 'Small', value: 1 },
		{ Text: 'Medium', value: 2 },
		{ Text: 'Large', value: 3 }
	];
	public timeRange: TimerangeWidget = {
		startTime: new Date(),
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		endTime: new Date(),
		label1: 'Start Time',
		label2: 'End Time',
		isAllowPopup: true,
		RenderMode: false,
		DefaultInterval: 60,
		AllowAI: false,
		isEditMode: true,
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
	public listItems: { Text: string; Value: any, IsDeactivated: boolean, TagEnabled: boolean, isDisabledItem: boolean }[] = [

		{ Text: "11 - Phoenix", Value: 11, IsDeactivated: false, TagEnabled: false, isDisabledItem: false },
		{ Text: "12 - Dallas", Value: 12, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "13 - Las Vegas", Value: 13, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "14 - San Diego", Value: 14, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "15 - Atlanta", Value: 15, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "16 - Portland", Value: 16, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "17 - Minneapolis", Value: 17, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "18 - Austin", Value: 18, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "19 - San Antonio", Value: 19, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "20 - Nashville", Value: 20, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "21 - New Orleans", Value: 21, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "22 - Orlando", Value: 22, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "23 - Detroit", Value: 23, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "24 - Salt Lake City", Value: 24, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "25 - Raleigh", Value: 25, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "26 - Indianapolis", Value: 26, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "27 - Columbus", Value: 27, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "28 - Denver", Value: 28, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "29 - Phoenix", Value: 29, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "30 - Seattle", Value: 30, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "31 - Las Vegas", Value: 31, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "32 - Portland", Value: 32, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "33 - San Diego", Value: 33, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "34 - Chicago", Value: 34, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "35 - New York", Value: 35, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "36 - Boston", Value: 36, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "37 - Washington, D.C.", Value: 37, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "38 - Philadelphia", Value: 38, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "39 - Miami", Value: 39, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "40 - Atlanta", Value: 40, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "41 - Dallas", Value: 41, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "42 - Houston", Value: 42, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "43 - San Francisco", Value: 43, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "44 - Los Angeles", Value: 44, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "45 - San Jose", Value: 45, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "46 - Sacramento", Value: 46, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "47 - Phoenix", Value: 47, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "48 - Austin", Value: 48, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "49 - Denver", Value: 49, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "50 - Las Vegas", Value: 50, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "51 - Orlando", Value: 51, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "52 - New Orleans", Value: 52, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "53 - Detroit", Value: 53, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "54 - Salt Lake City", Value: 54, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "55 - Raleigh", Value: 55, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "56 - Indianapolis", Value: 56, IsDeactivated: false, TagEnabled: true, isDisabledItem: false },
		{ Text: "57 - Columbus", Value: 57, IsDeactivated: false, TagEnabled: true, isDisabledItem: false }
	];
	public defaultItems: { Text: string; Value: any }[] =
		[{ Text: "Please select City", Value: null }];
	public ddlSource: KendoTemplateDropdown = {
		isEditMode: false,
		list: this.listItems,
		listControlName: null,
		isRequired: true,
		label: 'Dropdown Template',
		placeholder: "Please select City",
		filterable: false,
		isDisabled: false,
		isValuePrimitiveAllowed: false,
		tooltipTitle: 'ExpressLaborCategoryTooltipMessage',
		tooltipTitleLocalizeParam: [],
		tooltipVisible: true,
		dropDownList: null,
		entityType: '',
		fieldName: '',
		isHtmlContent: false,
		isItemTemplate: false,
		isRendered: false,
		isValueTemplate: false,
		itemTemplate: false,
		KendoTemplateDropdown: '',
		labelLocalizeParam: [],
		valueTemplate: '',
		xrmEntityId: 0,
		tagName: '*',
		tagAlign: Dropdown.left,
		TagVisibility: TagVisibility.All
	};

	form1: FormGroup;
	form2: FormGroup;
	dateForm: FormGroup;
	timeZoneForm2: FormGroup;
	tooltipVisible: boolean;
	tooltipTitle: any;
	ClockBufferForReportingDatelabel: any;
	isRequired: boolean;
	timeFormat: any;
 	numbericBoxIsReadonly: boolean =false;

	constructor(
		private customValidator: CustomValidators,
		private fb: FormBuilder,
		private http: HttpClient,
		private dateService: DateTimeService,
		public lightindustrialService: LightIndustrialService,
		private localization: LocalizationService
		// private popup: DialogPopupService
	) {
		super(http);
		this.formGroup = this.fb.group({});
		this.form1 = this.fb.group({
			editor: ['']
		});
		this.form2 = this.fb.group({
			ddlCity: [this.defaultItem],
			datamultiselect: [this.defaultItem],
			datamultiselect1: [this.defaultItem],
			ddlusaCity: [null, customValidator.RequiredValidator()],
			autocmplate: [''],
			clockBufferToSetReportingDate: [''],
			clockBufferLavel: [],
			startdt: [''],
			enddt: [''],
			ManuallyAdjust: [null, customValidator.RequiredValidator()]
		});
		/* this.createDynamicForm();
			 this.ddlSource.isEditMode=true; */
		this.timeZoneForm2 = this.fb.group({
			timePicker: [],
			dtTime: [null],
			checkIn: [null],
			shiftName: [null],
			startTimeControlName: [null],
			endTimeControlName: [null]
		});
		this.dateForm = this.fb.group({
			clockBufferToSetReportingDate: [new Date('2024-08-10')],
			rdbuttonfor: [''],
			quantity: [24.70]
		});
	}
	timezoneDate: string;
	clockBufferChange($event: any) {
		// this.timezoneDate=new Date().getxrmDateWithTime($event.toLocaleTimeString()).toLocaleTimeString();
		this.timezoneDate = $event;

	}
	getEvent(event: any) {
		console.log("event", event);
	}

	ngOnInit(): void {

		this.tooltipVisible = true;
		this.tooltipTitle = "ClockBufferToSetReportingDateToolTip";
		this.ClockBufferForReportingDatelabel = "ClockBufferForReportingDate";
		this.timeFormat = "HH:mm";


		/* this.ddlSource.list=this.listItems;
			 this.ddlSource.label="Country"; */

		/*  this.ddlSource.isRequired=true;
					this.ddlSource.listControlName=this.form2.value.ddlusaCity; */
	}
	postDll() {
		if (this.form2.invalid) {
			this.form2.markAllAsTouched();
			return;
		}

	}
	createDynamicForm() {
		try {
			this.copydialogdata.forEach((data: any) => {
				if (data.type == "dropdown") {
					const fc = new FormControl("");
					this.formGroup.addControl(data.controlName, new FormControl());
				}
				else {
					const fg = this.fb.group({
						Dropdown: [null, [this.customValidator.RequiredValidator]],
						TreeValue: [null]
					});
					this.formGroup.addControl(data.controlName, fg);
				}
			});
		}
		catch (e) {
			// console.log(e);
		}

	}
	getData() {
		console.log("Form data: ", this.formGroup);
	}

	public localizeParam: DynamicParam[] = [
		{ Value: 'LaborCategory', IsLocalizeKey: true },
		{ Value: 'lsingh', IsLocalizeKey: false },
		{ Value: 'Welcome@1', IsLocalizeKey: false }
	];
	public labelLocalizeParam: DynamicParam[] = [
		{
			Value: 'Sector',
			IsLocalizeKey: true
		}
	];

	showPopup1() {
		const buttons = [{ text: "EntityId", value: 1, btnLocalizaedParam: this.labelLocalizeParam }];

		//	this.popup.showConfirmation('IsRfxSowRequired', buttons, this.localizeParam);

	}

	changeEditor(e: any) {
		//	console.log("data eventttttttt", e);
	}


	blurEditor(e: any) {
		console.log("blurrr eventttttttt", e);
		console.log("blurrr eventttttttt", this.submit());

	}
	pasteEditor(e: any) {
		// console.log("pasteEditor eventttttttt", e);
	}
	focusEditor(e: any) {
		//	console.log("focusEditor eventttttttt", e);
	}
	public val: string = 'kendo editor';


	public list = [
		"[ACRO/MSP Logo Alternate Name]",
		"[Candiate Accepted By]",
		"[Client #]",
		"[Client Email]"
	];

	// Kendo Editor test function

	draggedItem: any;

	onDragStart(event: DragEvent, item: any) {
		event.dataTransfer?.setData('text/plain', item);
		this.draggedItem = item;
	}


	submit() {
		/* 	console.log("value", this.form1.value);
			 let a = JSON.stringify(this.form1.value);;
			 console.log("json", a); */
	}

	ddlOnChange(item: any) {
	}
	lastSelectedDays: any;
	public shiftDetails: ShiftDetails;
	public weekDaysArray: boolean[];
	public getWeekData(e: any) {
		this.lastSelectedDays = e.day;
		const data = e;
		// Iterate through the 'day' array in the data and update this.daysInfo
		data.day.forEach((dayData: IDayInfo) => {
			const dayInfo = this.daysInfo.find((info: IDayInfo) =>
				info.day === dayData.day);
			if (dayInfo) {
				dayInfo.isSelected = dayData.isSelected;
			}
		});
		// contractor
		// eslint-disable-next-line one-var
		const startTime = this.formatTime(e.time.startTime),
			endTime = this.formatTime(e.time.endTime);
		this.shiftDetails = {
			...this.shiftDetails,
			"StartTime": startTime,
			"EndTime": endTime,
			"Sun": e.day[0].isSelected,
			"Mon": e.day[1].isSelected,
			"Tue": e.day[2].isSelected,
			"Wed": e.day[3].isSelected,
			"Thu": e.day[4].isSelected,
			"Fri": e.day[5].isSelected,
			"Sat": e.day[6].isSelected
		};
		this.weekDaysArray = this.lightindustrialService.formatWeekData(this.shiftDetails);
	}
	private formatTime(timeValue: string): string {
		const timeDate = new Date(timeValue),
			hours = timeDate.getHours().toString().padStart(2, '0'),
			minutes = timeDate.getMinutes().toString().padStart(2, '0'),
			seconds = timeDate.getSeconds().toString().padStart(2, '0');
		return `${hours}:${minutes}:${seconds}`;
	}
	timezoneValue: any;
	timezoneChange(event: any) {
		const dt = new Date(`02/24/2015 ${'10:00 AM'}`);
		console.log("Rajiv", new Date(event).toTimeString());
		this.timezoneValue = new Date(dt).getxrmDatetime();
	}

	dateTimePost() {
		const formValues = this.timeZoneForm2.value,
			tm = this.dateService.ConvertUtcToTime(formValues.timePicker),
			dt = this.dateService.ConvertUtcToDate(formValues.dtTime),
			dttm = this.dateService.ConvertUtcToDate(formValues.checkIn),
			startTime = this.dateService.ConvertUtcToTime(formValues.startTimeControlName),
			endTime = this.dateService.ConvertUtcToTime(formValues.endTimeControlName),
			tm1 = this.dateService.ConvertUtcToTime(formValues.timePicker),
			dttm1 = this.dateService.ConvertUtcToDate(formValues.checkIn),
			startTime1 = this.dateService.ConvertUtcToTime(formValues.startTimeControlName),
			endTime1 = this.dateService.ConvertUtcToTime(formValues.endTimeControlName);
		this.formData = {
			timePicker: this.localization.TransformTime(tm1),
			dtTime: formValues.dtTime,
			checkIn: this.localization.TransformDateTime(dttm1),
			startTimeControlName: this.localization.TransformTime(startTime1),
			endTimeControlName: this.localization.TransformTime(endTime1)
		};
		this.PayloadData = {
			timePicker: this.localization.TransformTime(tm),
			dtTime: dt,
			checkIn: this.localization.TransformDateTime(dttm),
			startTimeControlName: this.localization.TransformTime(startTime),
			endTimeControlName: this.localization.TransformTime(endTime)
		};
		this.timeZoneForm2.reset();
	}
	editItem() {
		const tm = this.localization.convertTime(this.formData.timePicker),
			startTime = this.localization.convertTime(this.formData.startTimeControlName),
			endTime = this.localization.convertTime(this.formData.endTimeControlName);
		this.timeZoneForm2.get('timePicker')?.patchValue(tm);
		this.timeZoneForm2.get('dtTime')?.patchValue(this.formData.dtTime);
		this.timeZoneForm2.get('checkIn')?.patchValue(new Date(this.formData.checkIn));
		this.timeZoneForm2.controls['startTimeControlName'].patchValue(startTime);
		this.timeZoneForm2.controls['endTimeControlName'].patchValue(endTime);
	}
	isView: boolean = false;
	viewItem() {
		this.isView = true;
	}
	datePickerValue: any;
	onDatePicker() {
		console.log("GetCurrentUtcDate", this.dateService.GetCurrentUtcDate());
		console.log("GetCurrentDate", this.dateService.GetCurrentDate());

		console.log("ConvertDateToUtc ", this.dateService.ConvertDateToUtc("8/7/2024 1:06 PM"));
		console.log("ConvertTimeToUtc ", this.dateService.ConvertTimeToUtc("1:06 PM"));


		// const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
		// 	dt = this.dateForm.get('clockBufferToSetReportingDate')?.value;
		// this.datePickerValue = this.localization.convertToUTC(dt);
		// console.log("current Date", this.localization.GetDate());
		// console.log('timezone name', systemTimeZone);
		// this.Post('/biscl/save', this.datePickerValue).subscribe((data: any) => {
		// 	console.log('data', data);
		// });

	}
	onrdbtnChange(IsReadOnly: boolean)
	{
		this.numbericBoxIsReadonly=IsReadOnly;
	}
}


