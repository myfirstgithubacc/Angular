import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { HDRMockSreenService } from './hdr-mock-service.service';
import { PreDefinedSchedules } from '@xrm-shared/services/common-constants/static-data.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';

@Component({selector: 'app-hdr-mock-screen',
	templateUrl: './hdr-mock-screen.component.html',
	styleUrls: ['./hdr-mock-screen.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class HdrMockScreenComponent implements OnInit, OnDestroy {
	public hrdMockForm: FormGroup;
	public arr1: any;
	public hoursDistributionRuleData: any;
	public previousDays: any[] = [];
	public holidayListofWeek: any;
	public calculatedGrandTotal: any;
	public calculatedSTTotal: any;
	public calculatedOTTotal: any;
	public calculatedDTTotal: any;
	public weeklyHoursFormArray: FormArray;
	public isActive = false;
	public isLoading = false;
	defaultColumns = [
		{
			columnWidth: '100px',
			columnName: 'Saturday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Saturday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false,
					placeholder: ''
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'Sunday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Sunday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false,
					placeholder: ''
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'Monday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Monday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'Tuesday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Tuesday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'Wednesday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Wednesday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'Thursday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Thursday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'Friday',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'Friday',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'ST Hours',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'STHour',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'OT Hours',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'OTHour',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		},
		{
			columnWidth: '100px',
			columnName: 'DT Hours',
			asterik: false,
			controls: [
				{
					controlType: 'number',
					controlId: 'DTHour',
					decimals: '2',
					format: 'n2',
					defaultValue: null,
					isEditMode: true,
					isDisable: false
				}
			]
		}
	];

	public columns: any[] = this.defaultColumns;
	public isShowWeekOneDate: boolean = false;

	public predefinedFilledData: any = [
		{
			RowNo: 0, Sunday: null,
			Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null,
			STHour: null, OTHour: null, DTHour: null, PreFriday: null
		},
		{
			RowNo: 1, Sunday: null,
			Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null,
			STHour: null, OTHour: null, DTHour: null, PreFriday: null
		}
	];

	public ColumnConfigs = {
		isShowfirstColumn: true,
		isShowLastColumn: false,
		changeStatus: false,
		rowNo: true,
		firstColumnName: 'Cost Accounting Code',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: 0,
		itemSr: true,
		itemLabelName: 'Cost Center',
		isAddMoreValidation: false
	};

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private hourDistributionRuleService: HourDistributionRuleService,
		private datePipe: DatePipe,
		private hdrMockSreenService: HDRMockSreenService,
		private customeValidator: CustomValidators,
		private toasterService: ToasterService
	) {
		this.hrdMockForm = this.formBuilder.group({
			'WeekendingDate': [null, [this.customeValidator.RequiredValidator('Please enter Weekending Date')]],
			'WeekHolidayDates': [null],
			'RuleId': [null, [this.customeValidator.RequiredValidator('Please select Hour Distribution Rule')]],
			'AdditionalHour': [null],
			'assignmentStartDate': [null, [this.customeValidator.RequiredValidator('Please enter Assignment Start Date')]],
			'assignedEndDate': [null, [this.customeValidator.RequiredValidator('Please enter Assignment End Date')]],
			'WeekOneDate': [null],
			'WeekNonWorkingDates': [null],
			'IsOtEligible': [true],
			'IsHolidayWorkAllowed': [false],
			'WeeklyHours': this.formBuilder.array([])
		});
	}

	ngOnInit(): void {
		this.hourDistributionRuleService.getHourDistributionRuleCopyDropdown().subscribe((res: any) => {
			this.hoursDistributionRuleData = res.Data;
		});
		this.weeklyHoursFormArray = this.hrdMockForm.controls['WeeklyHours'] as FormArray;

	}
	newColum(event: any) {
		this.isShowWeekOneDate = false;
		this.hourDistributionRuleService.getHourDistributionRuleById(event.Value).subscribe((res: any) => {
			if (res.Data.PreDefinedWorkScheduleId === PreDefinedSchedules['9/80']) {
				this.isShowWeekOneDate = true;
				const newcolum = {
					columnWidth: '100px',
					columnName: 'Pre Friday',
					asterik: false,
					controls: [
						{
							controlType: 'number',
							controlId: 'PreFriday',
							decimals: '2',
							format: 'n2',
							defaultValue: null,
							isEditMode: true,
							isDisable: false
						}
					]
				};
				this.defaultColumns.unshift(newcolum);
				// this.columns.unshift(newcolum);
			}
			else if (res.Data.PreDefinedWorkScheduleId !== PreDefinedSchedules['9/80'] && this.columns[0].columnName === 'Pre Friday') {
				this.isShowWeekOneDate = false;
				this.defaultColumns.shift();
				// this.columns.shift();
			}
			this.columns = [...this.defaultColumns];
		});

	}
	getFormStatus(formArray: FormArray) {
		this.arr1 = formArray.value;
		this.onAddWeeklyHours(this.arr1);

	}

	onAddWeeklyHours(list: any) {
		this.weeklyHoursFormArray.clear();
		list.forEach((row: any, index: number) => {
			this.weeklyHoursFormArray.push(this.formBuilder.group({
				'RowNo': [
					(list[index].rowNo == magicNumber.zero || list[index].rowNo == null) ?
						magicNumber.one
						: list[index].rowNo
				],
				'Sunday': [row.Sunday ?? magicNumber.zero],
				'Monday': [row.Monday ?? magicNumber.zero],
				'Tuesday': [row.Tuesday ?? magicNumber.zero],
				'Wednesday': [row.Wednesday ?? magicNumber.zero],
				'Thursday': [row.Thursday ?? magicNumber.zero],
				'Friday': [row.Friday ?? magicNumber.zero],
				'Saturday': [row.Saturday ?? magicNumber.zero],
				'STHour': [row.STHour ?? magicNumber.zero],
				'OTHour': [row.OTHour ?? magicNumber.zero],
				'DTHour': [row.DTHour ?? magicNumber.zero],
				'PreFriday': [row.PreFriday ?? magicNumber.zero]
			}));
		});
	}
	onDateChange(event: any) {
		this.previousDays = [];
		const selectedDate = event,
			dayBefore = new Date(selectedDate);
		this.hrdMockForm.controls['assignedEndDate'].setValue(selectedDate);
		this.hrdMockForm.controls['assignmentStartDate'].setValue(new Date(dayBefore.setDate(selectedDate.getDate() - magicNumber.eight)));
		this.getPreviousSevenDays(selectedDate);
		this.holidayListofWeek = this.previousDays;
	}


	getHours() {
		this.hrdMockForm.markAllAsTouched();
		if (this.hrdMockForm.valid) {
			this.isActive=true;
			const payload = this.hrdMockForm.getRawValue();
			payload.WeekendingDate = this.datePipe.transform(payload.WeekendingDate, 'MM/dd/yyyy');
			payload.RuleId = payload.RuleId.Value;
			payload.assignmentStartDate = this.datePipe.transform(payload.assignmentStartDate, 'MM/dd/yyyy');
			payload.assignedEndDate = this.datePipe.transform(payload.assignedEndDate, 'MM/dd/yyyy');
			payload.WeekOneDate = this.datePipe.transform(payload.WeekOneDate, 'MM/dd/yyyy');
			payload.WeekHolidayDates = payload.WeekHolidayDates?.map((obj: any) =>
				obj.Text);
			payload.WeekNonWorkingDates = payload.WeekNonWorkingDates?.map((obj: any) =>
				obj.Text);
			payload.AdditionalHour = payload.AdditionalHour===""
				? magicNumber.zero
				:payload.AdditionalHour;
			this.hdrMockSreenService.postTotalHours(payload).subscribe((res: any) => {
				if (res.Data.ErrorMessage !== "") {
					let errorMessages = '';
					for (const key in res.Data.ErrorMessages) {
						if (res.Data.ErrorMessages.hasOwnProperty(key)) {
							const value = res.Data.ErrorMessages[key];
							errorMessages += `${value}</br>`;
						}
					}
					this.toasterService.showToaster(ToastOptions.Error, errorMessages, [], true);
				} else {
					this.toasterService.resetToaster();
					// this.toasterService.showToaster(ToastOptions.Success, res.Message);
				}
				this.calculatedGrandTotal = res.Data.GrandTotal.toFixed(magicNumber.two);
				this.calculatedDTTotal = res.Data.DTTotal.toFixed(magicNumber.two);
				this.calculatedSTTotal = res.Data.STTotal.toFixed(magicNumber.two);
				this.calculatedOTTotal = res.Data.OTTotal.toFixed(magicNumber.two);
				this.isActive=false;
			});
		}
	}

	weekendingOnChange(event: any) {

	}

	getPreviousSevenDays(inputDate: Date): Date[] {
		for (let i = magicNumber.zero; i < magicNumber.seven; i++) {
			const dayBefore = new Date(inputDate);
			dayBefore.setDate(inputDate.getDate() - i);
			this.previousDays.push({ Text: this.datePipe.transform(dayBefore, 'MM/dd/yyyy'), Value: dayBefore });
		}
		return this.previousDays;
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
	}
}
