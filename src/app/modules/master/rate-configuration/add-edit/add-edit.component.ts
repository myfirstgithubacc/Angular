import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RateCalculator } from '@xrm-core/models/rate-config.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { EventConfigurationService } from 'src/app/services/masters/event-configuration.service';
import { RateConfigurationService } from 'src/app/services/masters/rate-configuration.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { OTRateText, OTRateTypeText, OTRateTypeValue, OTRateValue } from '../constant/rate-configuration.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public allowCustom = true;
	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public showEditSuccessAlert:boolean = false;
	public rateCalculatedValue:any;
	public AddEditRateCalculatorForm:FormGroup;
	public SectorList:any;
	public mspFeeValue:any;
	public pricingModelValue:any;
	public FeeDropDownList:any;
	public ModelDropDownList:any;
	public OTRateTypeDropDownList:any =[];
	public OTRateDropDownList:any;
	public MspFeeType: any = 'MSPFeeType';
	public PricingModel: any = 'PricingModel';
	public OTRateType: any = 'OTRateType';
	public OtRate: any = 'OvertimeHoursBilledAt';
	private ngUnsubscribe$ = new Subject<void>();
	public OTRateTypeDrpDwnList = [
		{ Text: OTRateTypeText.BillRateBased, Value: OTRateTypeValue.BillRateBased },
		{ Text: OTRateTypeText.BillRateWageBased, Value: OTRateTypeValue.BillRateWageBased },
		{ Text: OTRateTypeText.WageBased, Value: OTRateTypeValue.WageBased }
	];


	// eslint-disable-next-line max-params
	constructor(
	  private fb:FormBuilder,
    private route: Router,
    public sector: SectorService,
	  public rateService: RateConfigurationService,
		private toasterServc: ToasterService,
		private customValidator:CustomValidators,
		private eventConfigServc:EventConfigurationService
	) {
		this.AddEditRateCalculatorForm = this.fb.group({
			"otRateTypeId": [null, this.customValidator.RequiredValidator("PleaseSelectData", [{ Value: 'OtRateType', IsLocalizeKey: true }])],
			"mspFeeTypeId": [null, this.customValidator.RequiredValidator("PleaseSelectData", [{ Value: 'MspFeeType', IsLocalizeKey: true }])],
		  "pricingModelId": [null, this.customValidator.RequiredValidator("PleaseSelectData", [{ Value: 'PricingModel', IsLocalizeKey: true }])],
			"mspFeePercent": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'MspFeePercentage', IsLocalizeKey: true }])],
			"submittedMarkup": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'StaffingAgencyMarkup', IsLocalizeKey: true }])],
			"isShiftMultiplier": [null, this.customValidator.RequiredValidator("PleaseSelectData", [{ Value: 'ShiftDifferentialMethod', IsLocalizeKey: true }])],
			"shiftDifferentialValue": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'ShiftDifferentialValue', IsLocalizeKey: true }])],
			"jobType": [null, this.customValidator.RequiredValidator("PleaseSelectData", [{ Value: 'OtRate', IsLocalizeKey: true }])],
			"otBillMultiplier": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'OtBillMultiplier', IsLocalizeKey: true }])],
			"dtBillMultiplier": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'DtBillMultiplier', IsLocalizeKey: true }])],
			"otWageMultiplier": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'OtWageMultiplier', IsLocalizeKey: true }])],
			"dtWageMultiplier": [magicNumber.zero, this.customValidator.RequiredValidator("PleaseEnterData", [{ Value: 'DtWageMultiplier', IsLocalizeKey: true }])],
			"baseWageRate": [null],
			"stBill": [magicNumber.zero]

		});
	}

	closeAlertToast() {
		this.showEditSuccessAlert = false;
	}

	scroollToTop() {
		window.scrollTo(magicNumber.zero, magicNumber.zero);
	}

	ngOnInit(): void {
		if(this.route.url == '/administration/rate-calculator/add-edit/mode-edit'){
			this.isEditMode = true;
		}else{
			this.isEditMode = false;
		}
		this.getStaticDataMSPFeeType();
	}

	ShiftDifferentialDropDownList: any = [
		{ Text: 'Adder', Value: false},
		{ Text: 'Multiplier', Value: true}
	];

	private getStaticDataMSPFeeType() {
		this.rateService.GetDataListforMSPFeeType().pipe(takeUntil(this.ngUnsubscribe$)).
			subscribe((data: any) => {
				if (data.Succeeded) {
					this.FeeDropDownList = data.Data;
				}
			});
	}

	private getStaticPricingModel() {
		this.rateService.GetDataTypeListForPricingModel().pipe(takeUntil(this.ngUnsubscribe$)).
			subscribe((data: any) => {
				if (data.Succeeded) {
					this.ModelDropDownList = data.Data;
				}
			});
	}

	 public getStaticOtRateType() {
	   	this.rateService.GetDataForOtRateType().pipe(takeUntil(this.ngUnsubscribe$)).
	   		subscribe((data: any) => {
	   			if (data.Succeeded) {
	   				this.OTRateTypeDropDownList = data.Data;
	   			}
	   		});
	   }

	public getStaticOtRate() {
		this.rateService.GetDataTypeListForOtRate().pipe(takeUntil(this.ngUnsubscribe$)).
			subscribe((data: any) => {
				if (data.Succeeded) {
					this.OTRateDropDownList = data.Data;
				}
			});
	}

	onChangeMspFeeType(val:any){
		if (val != '' && val != undefined) {
			this.mspFeeValue = val.Value;
			this.getStaticPricingModel();
		}
		else{
			this.AddEditRateCalculatorForm.controls['pricingModelId'].setValue('');
			this.AddEditRateCalculatorForm.controls['otRateTypeId'].setValue('');
			this.AddEditRateCalculatorForm.controls['jobType'].setValue('');
			this.ModelDropDownList =[];
			this.OTRateTypeDropDownList =[];
			this.OTRateDropDownList=[];

		}
	}


	onChangePricingModel(val:any){
	  	this.OTRateDropDownList = null;
		this.OTRateTypeDropDownList = null;
		this.AddEditRateCalculatorForm.controls['otRateTypeId'].setValue('');
		this.AddEditRateCalculatorForm.controls['jobType'].setValue('');
		if (val != '' && val != undefined){
			this.updateOTRateTypeDropDownList(val.Value, this.mspFeeValue);
		}else{
			this.AddEditRateCalculatorForm.controls['otRateTypeId'].setValue('');
			this.AddEditRateCalculatorForm.controls['jobType'].setValue('');
			this.OTRateDropDownList = [];
			this.OTRateTypeDropDownList =[];
		}
	}

	updateOTRateTypeDropDownList(value:any, mspFeeValue:any) {
	      	this.OTRateTypeDropDownList = [];

	      	if (value == magicNumber.eight && mspFeeValue == magicNumber.twenty) {
	      		this.OTRateTypeDropDownList = [
	      			{ Text: OTRateTypeText.BillRateBased, Value: OTRateTypeValue.BillRateBased },
	      			{ Text: OTRateTypeText.WageBased, Value: OTRateTypeValue.WageBased }
	      		];
	      	} else if (value == magicNumber.seven && mspFeeValue == magicNumber.twenty) {
	      		this.OTRateTypeDropDownList = [{ Text: OTRateTypeText.BillRateBased, Value: OTRateTypeValue.BillRateBased }];
	      	} else if (value == magicNumber.eight && mspFeeValue == magicNumber.twentyOne) {
	      		this.OTRateTypeDropDownList = this.OTRateTypeDrpDwnList;
	      	} else if (value == magicNumber.seven && mspFeeValue == magicNumber.twentyOne) {
	      		this.OTRateTypeDropDownList = [{ Text: OTRateTypeText.BillRateBased, Value: OTRateTypeValue.BillRateBased }];
	      	}
	      	else if(value == magicNumber.seven ||value == magicNumber.eight && this.mspFeeValue == magicNumber.nineteen){
	      		this.OTRateTypeDropDownList = [{ Text: OTRateTypeText.BillRateBased, Value: OTRateTypeValue.BillRateBased }];
	      	 }else {
	      		this.OTRateTypeDropDownList = this.OTRateTypeDrpDwnList;
	      	}
	      }

	onChangeOtRateType(val:any){
		this.AddEditRateCalculatorForm.controls['jobType'].setValue('');
		this.OTRateDropDownList = [];
		if (val != '' && val != undefined){
			this.OTRateDropDownList = [];
				 this.OTRateDropDownList = [
				   	{ Text: OTRateText.StraightTime, Value: OTRateValue.StraightTime},
				   	{ Text: OTRateText.Overtime, Value: OTRateValue.Overtime}
				   ];

		}else{
			this.AddEditRateCalculatorForm.controls['jobType'].setValue('');
			this.OTRateDropDownList = [];
		}
	}

	submitForm() {
		// show popup when save or update action is performed
		this.AddEditRateCalculatorForm.markAllAsTouched();
		if (this.AddEditRateCalculatorForm.valid) {
			const RateCalculate = new RateCalculator(this.AddEditRateCalculatorForm.value);
			RateCalculate.mspFeeTypeId = this.AddEditRateCalculatorForm.controls['mspFeeTypeId'].value.Value;
			RateCalculate.pricingModelId = this.AddEditRateCalculatorForm.controls['pricingModelId'].value.Value;
			RateCalculate.otRateTypeId = this.AddEditRateCalculatorForm.controls['otRateTypeId'].value.Value;
			RateCalculate.jobType = this.AddEditRateCalculatorForm.controls['jobType'].value.Value;
			RateCalculate.isShiftMultiplier = this.AddEditRateCalculatorForm.controls['isShiftMultiplier'].value.Value;
			this.rateService.calculateRequisation(RateCalculate).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: any) => {
				if(res.Succeeded){
					this.rateCalculatedValue = res.Data;
					this.toasterServc.showToaster(
						ToastOptions.Success,
						res.Message
					);
				}else{
					this.toasterServc.showToaster(
						ToastOptions.Error,
						res.Message
					);
				}

			});
			if (!this.isEditMode) {
				this.showEditSuccessAlert=true;
				this.scroollToTop();
			}
		}

	}

	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}


}
