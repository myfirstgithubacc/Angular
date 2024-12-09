import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ValidationErrors,
	Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';
import { CustomValidators } from 'src/app/shared/services/custom-validators.service';
import { NotifierService } from 'src/app/shared/services/notifier.service';
import { Day } from "@progress/kendo-date-math";
@Component({selector: 'app-ad-edit',
	templateUrl: './ad-edit.component.html',
	styleUrls: ['./ad-edit.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdEditComponent implements OnInit {
	public SectorList: any[];
	public JobCategoryList: any[];
	public LaborCategoryList: any[];

	public multiselectdropdown = ['a', 'b', 'c'];
	public OtEligibilityRadio = ['Yes', 'No'];
	public othoursbills = ['Straight Time (Exempt)', 'Overtime (Non-Exempt)'];
	public RadioGroupBillRateValidation = ['NTE', 'Target'];
	// public RadioGroup = ["Direct","Indirect"];
	public disabledDates: Day[] = [Day.Saturday, Day.Sunday];
	public disabledDate1:Date[]=[
		new Date("5/1/2024"),
		new Date("5/2/2024"),
		new Date("5/3/2024"),
		new Date("5/4/2024"),
		new Date("5/5/2024"),
		new Date("5/6/2024"),
		new Date("5/7/2024")
	];

	public mindate="5/1/2024";
	public maxdate="5/30/2024";
	isEdit: boolean = false;
	isFormSubmitted: boolean = false;
	email1: FormControl;
	AddEditFormForm: FormGroup;
	public RadioGroup = ['MSP', 'Hiring Manager'];
	public RadioGroupPricing = ['Bill Rate Base', 'Markup Based'];
	public RadioGroupMarkup = ['Staffing Agency Std. Mark Up %', 'Rate Card'];
	RadioGroupCosEstimatingType = ['Period of Performance', 'Budgeted Hours'];

	PunchReportingDaySetting: any = [
		{ text: 'Punch In', value: '1' },
		{ text: 'Punch Out', value: '2' }
	];
	constructor(
    private fb: FormBuilder,
    private _Router: Router,
    private _NotifierService: NotifierService,
    private _LaborCategoryService:LaborCategoryService,
    private _CustomValidators: CustomValidators
	) {
		this.email1 = new FormControl('');

		this.AddEditFormForm = this.fb.group({
			startdt:[''],
			business_unit: [null, [this._CustomValidators.RequiredValidator]],
			labor_category: [null, [this._CustomValidators.RequiredValidator]],
			radiobtn: [],
			laborcategory_code: [null, [this._CustomValidators.RequiredValidator]],
			mspprogram_manager: [null, [this._CustomValidators.RequiredValidator]],
			maxprofile_perstaffingagency: [
				null,
				[this._CustomValidators.RequiredValidator]
			],
			Maximum_Profiles_Total_Per_Position: [
				null,
				[this._CustomValidators.RequiredValidator]
			],
			Payroll_Mark_Up: [null, [this._CustomValidators.RequiredValidator]],
			Labor_Category_Expressed: [
				null,
				[this._CustomValidators.RequiredValidator]
			],
			is_li_laborCategory: [null, [this._CustomValidators.RequiredValidator]],
			is_alternatepricing_conf: [
				false,
				[this._CustomValidators.RequiredValidator]
			],
			is_ManagerSelection_Required: [
				null,
				[this._CustomValidators.RequiredValidator]
			],

			Candidate_tobe_selected_By: [
				null,
				[this._CustomValidators.RequiredValidator]
			],
			Pricing_Model: [null, [this._CustomValidators.RequiredValidator]],
			markup_define: [null, [this._CustomValidators.RequiredValidator]],
			Bill_Rate_Validation: [null, [this._CustomValidators.RequiredValidator]],
			Cost_Estimating_Type: [null, [this._CustomValidators.RequiredValidator]],
			Define_OT_Rate_Type: [null, [this._CustomValidators.RequiredValidator]]
		});

		this.SectorList = [{ text: 'Pitney Bowes Inc.', id: '1' }];
		this.JobCategoryList = [
			{ text: 'Accounting Assistant', id: '1' },
			{ text: 'Administrative Assistant', id: '2' },
			{ text: 'Accountant 2', id: '2' }
		];
		this.LaborCategoryList = [
			{ text: 'Call Center', id: '1' },
			{ text: 'Administrative', id: '2' },
			{ text: 'Spokane Call Center', id: '2' }
		];
	}

	public disabledDatesFunction = (date: Date): boolean => {
		return this.disabledDate1.some((dt) => {
  		return (
    			date.getFullYear() === dt.getFullYear() &&
          date.getMonth() === dt.getMonth() &&
          date.getDate() === dt.getDate()
  	);
  	});
	};
	ngOnInit(): void {}

	onChange(val: any) {
		const currentDt=new Date(val);
		console.log("Current Date ", currentDt);
		console.log("TimezoneOffset ", currentDt.getTimezoneOffset);
		
	}
	OnInput(event: any) {
		console.log(event);
	}

	save() {
		this.AddEditFormForm.markAllAsTouched();
		if (this.AddEditFormForm.valid) {
			this._LaborCategoryService
				.addLaborCategory(this.AddEditFormForm.value)
				.subscribe((data: any) => {
					if (data) {
						/* let data:LaborCategory=
               data.markUpFlag="" */
						this._NotifierService.success('Data added successfully');
						localStorage.setItem(
							'data',
							JSON.stringify(this.AddEditFormForm.value)
						);
						this._Router.navigate([`/xrm/temp/listing`]);
					}
				});
		}
	}

}
