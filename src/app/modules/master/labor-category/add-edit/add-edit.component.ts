import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { InewPricingModel, LabCategory, magicNumLab } from '../enum/enums';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { CustomValidators } from 'src/app/shared/services/custom-validators.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LaborCategory } from 'src/app/core/models/labor-category.model';
import { LaborCategoryService } from '../../../../services/masters/labor-category.service';
import { NavigationPaths } from '../constant/routes-constant';
import { TranslateService } from '@ngx-translate/core';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { dropdown } from '../constant/dropdown-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { UdfData } from '@xrm-master/requisition-library/constant/rate-enum';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdown, IDropdownOption, IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, OnDestroy {
	private ngUnsubscribe = new Subject<void>();
	public isSelected: boolean;
	public sectorList: IDropdownOption;
	public laborCategoryDetails: LabCategory;
	public isEditMode: boolean = false;
	public hideMarkUp: boolean = true;
	public isEdit: boolean = false;
	public addEditForm: FormGroup;
	public oTtypes: IDropdown[] = [];
	public managerList: IDropdownOption;
	public lcCode: string;
	public secName: string;
	public addEditSection: boolean = false;
	public editModeSectorId: number;
	public pricingModelSubject = new Subject();
	public entityID = XrmEntities.LaborCategory;
	public ukey: string;
	public otRateType: string = dropdown.OTRateType;
	public pricingModelStatus: boolean = true;
	public reasonForChange: string;
	public laborCatTypeList: IDropdownOption[];
	public laborCatTypeData: IDropdown[] = [];
	public showProfData:boolean;
	public statusError: boolean = true;
	public sectorId: number = magicNumber.zero;
	public actionTypeId: number = ActionType.Add;
	public udfRecordId: number = magicNumber.zero;
	public recordUKey: string = '';
	public udfData: IPreparedUdfPayloadData[];
	public pricingModelData: InewPricingModel;
	public recordname: boolean = false;
	public isAdded: boolean = false;
	public sectorConfigData: InewPricingModel;
	public isReqLib :boolean = false;
	public isRfx: boolean;
	public conflictData: boolean = false;
	public IsLiCreated: boolean = false;
	public isBillBasedValue:boolean = false;
	public radioGroupPricing: IDropdown[] = [];
	public radioGroupBillRateValidation = [
		{ Text: dropdown.NTE, Value: dropdown.NTEValue },
		{ Text: dropdown.Target, Value: dropdown.TargetValue }
	];
	public radioGroup = [
		{ Text: dropdown.MSP, Value: dropdown.MSP },
		{ Text: dropdown.HiringManager, Value: dropdown.HiringManagerValue }
	];
	public radioGroupCosEstimatingType = [
		{ Text: dropdown.PeriodofPerformance, Value: dropdown.PeriodofPerformanceValue },
		{ Text: dropdown.BudgetedHours, Value: dropdown.BudgetedHoursValue }
	];


	// eslint-disable-next-line max-params
	constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private laborCategoryServc: LaborCategoryService,
    private customValidators: CustomValidators,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    public udfCommonMethods: UdfCommonMethods,
    private toasterServc: ToasterService,
	private commonService :CommonService,
	public localizationServ: LocalizationService,
	private cdr: ChangeDetectorRef
	) {
		this.formInitialization();
	}

	ngOnInit(): void {
		this.getStaticDataTypeListDropdownAsync();
	}

	updateRadioGroupPricing(newLabel: string) {
		this.radioGroupPricing = [
			{
				Text: newLabel,
				Value: dropdown.BillRateBasedValue
			},
			{
				Text: dropdown.MarkupBased,
				Value: dropdown.MarkupBasedValue
			}
		];
	}


	formInitialization() {
		this.addEditForm = this.formBuilder.group({
			SectorId: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			LaborCategoryName: [
				null,
				[
					this.customValidators.RequiredValidator('PleaseEnterLaborCategory'),
					this.customValidators.MaxLengthValidator(magicNumber.fifty)
				]
			],
			LaborCategoryCode: [null],
			MspProgramManagerId: [null, [this.customValidators.RequiredValidator('PleaseSelectMspProgramManager')]],
			LaborCatType: [null, [this.customValidators.RequiredValidator('PleaseSelectLaborCategoryType')]],
			PayrollMarkUp: [null, [this.customValidators.RequiredValidator('PleaseEnterPayrollMarkUpPercentage'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.hundred, 'PleaseSelectValueFromZeroToHundred')]],
			MaxProfilesPerStaffing: [null, [this.customValidators.RangeValidator(magicNumber.one, magicNumLab.FourNine), this.customValidators.NoSpecialCharacterValidator(), this.customValidators.RequiredValidator('PleaseEnterMaxProfilesPerStaffing')]],
			MaxProfileTotal: [null, [this.customValidators.RangeValidator(magicNumber.one, magicNumLab.FourNine), this.customValidators.NoSpecialCharacterValidator(), this.customValidators.RequiredValidator('PleaseEnterMaxProfilesTotal')]],
			PricingModel: [null],
			BillRateValidation: [null],
			CostEstimationType: [null],
			OtRateTypes: [null],
			IsExpressLaborCategory: [false],
			IsAlternatePricingModel: [false],
			CandidateHiredBy: [null]
		});
		this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
	}

	private getIdFromRoute() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe),
			switchMap((param) => {
				if (param['id']) {
					this.isEditMode = true;
					this.ukey = param['id'];
					return this.laborCategoryServc.getLaborCategoryById(param['id']).pipe(takeUntil(this.ngUnsubscribe));
				} else {
					return EMPTY;
				}
			}),
			takeUntil(this.ngUnsubscribe)
		).subscribe((dt: GenericResponseBase<LabCategory>) => {
			if (isSuccessfulResponse(dt)) {
				this.laborCategoryDetails = dt.Data;
				this.IsLiCreated = this.laborCategoryDetails.IsLiCreated;
				this.laborCategoryServc.laborDataSubject.next({
					'Disabled': this.laborCategoryDetails.Disabled,
					'LaborCategoryCode': this.laborCategoryDetails.LaborCategoryCode,
					'LaborCategoryID': this.laborCategoryDetails.Id
				});
				this.getById();
				this.getLaborCatType();
				this.isReqLibCreated(this.laborCategoryDetails.IsReqLibCreated);
				if (this.laborCategoryDetails.LaborCatType == Number(dropdown.Professional)) {
					this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
				} else {
					this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
				}
			}
		});
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
	}


	 private isReqLibCreated(val:boolean){
	   	if(val){
			this.isReqLib = true;
	   	}else{
			this.isReqLib = false;
	   	}
	   }

	private getMspProgramManager() {
		this.laborCategoryServc.getMspProgramManager().pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((data: GenericResponseBase<IDropdownOption>) => {
				if (isSuccessfulResponse(data)) {
					this.managerList = data.Data;
				}
			});
	}

	private getSector() {
		this.laborCategoryServc.getSector().pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((data: GenericResponseBase<IDropdownOption>) => {
				if (isSuccessfulResponse(data)) {
					this.sectorList = data.Data;
				}
			});
	}


	private getSectorById(id: number) {
		this.laborCategoryServc
			.newgetpricingmodelBySector(id)
			.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: GenericResponseBase<InewPricingModel>) => {
				if (isSuccessfulResponse(res)) {
					this.pricingModelData = res.Data;
					this.defineId(res.Data);
					this.setPricingModelConfig(res.Data);
					this.getLaborCatType();
				}
			});

	}

	private getLaborCatType() {
		this.laborCategoryServc.getLaborCategoryType().pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((data: GenericResponseBase<IDropdownOption[]>) => {
				if (isSuccessfulResponse(data)) {
					this.cdr.markForCheck();
					this.laborCatTypeList = data.Data;
					this.laborCatTypeData = [];
					this.processLaborCatTypeList();
				}
			});
	}

	private processLaborCatTypeList() {
		this.laborCatTypeList.forEach((dt: IDropdownOption) => {
			this.translate.stream(String(dt.TextLocalizedKey)).pipe(takeUntil(this.ngUnsubscribe))
				.subscribe((res: string) => {
					const datastatustype = res;
					if(!this.isEditMode){
						this.handleLaborCatTypeData(dt, datastatustype);
					}
					else if (!this.laborCategoryDetails.IsRfxSowRequired) {
						if (dt.Value != Number(dropdown.Icsow)) {
							this.laborCatTypeData.push({ Text: datastatustype, Value: String(dt.Value) });
						}
					}
					else {
						this.laborCatTypeData.push({ Text: datastatustype, Value: String(dt.Value) });
					}
				});
		});
	}

	private handleLaborCatTypeData(dt: IDropdownOption, datastatustype: string){
		if (!this.pricingModelData.IsRfxSowRequired) {
			if (dt.Value != Number(dropdown.Icsow)) {
				this.laborCatTypeData.push({ Text: datastatustype, Value: String(dt.Value)});
			}
		} else {
			this.laborCatTypeData.push({ Text: datastatustype, Value: String(dt.Value) });
		}
	}

	private getStaticDataTypeListDropdownAsync() {
	      		this.laborCategoryServc
	      			.GetStaticDataTypesDropdownWithId(this.otRateType)
	      			.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: GenericResponseBase<IDropdownOption[]>) => {
	      				if (isSuccessfulResponse(data)) {
	      					const otList = data.Data;
	      					otList.forEach((dt: IDropdownOption) => {
	      						let dataOttype = null;
	      						this.translate.stream(dt.Text).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: string) => {
	      							dataOttype = res;
	      							this.oTtypes.push({ Text: dataOttype, Value: String(dt.Value) });
	      						});
	      					});
					this.getIdFromRoute();
					this.getMspProgramManager();
					this.getSector();

	      				}
	      			});
	}

	defineId(data: InewPricingModel) {
		if (data.BillRateValidation == dropdown.
			NTEValue) data.BillRateValidation = dropdown.NTEValue;
		else data.BillRateValidation = dropdown.TargetValue;
		if (data.CostEstimationType == dropdown.PeriodofPerformanceValue)
			data.CostEstimationType = dropdown.PeriodofPerformanceValue;
		else data.CostEstimationType = dropdown.BudgetedHoursValue;
		if (data.MarkUpType == dropdown.StaffingAgencyStandardMarkUpPercentageValue)
			data.MarkUpType = dropdown.StaffingAgencyStandardMarkUpPercentageValue;
		else data.MarkUpType = dropdown.RateCardValue;
		if (data.PricingModel ==
      dropdown.MarkupBasedValue) data.PricingModel = dropdown.MarkupBasedValue;
		else data.PricingModel = dropdown.BillRateBasedValue;
		if (data.OtRateType ==
      dropdown.WageBasedOt) data.OtRateType = dropdown.WageBasedOt;
		else if (data.OtRateType ==
      dropdown.BillRateBasedOt) data.OtRateType = dropdown.BillRateBasedOt;
		else if (data.OtRateType == dropdown.BillRateWageBasedOt)
			data.OtRateType = dropdown.BillRateWageBasedOt;
		else data.OtRateType = dropdown.STWageBasedOTMarkup;
	}

	setConditionPricingModelConfig(Data: InewPricingModel) {
		if (Data.PricingModel == dropdown.BillRateBasedValue) {
			this.isBillBasedValue = true;
			this.addEditForm.controls['OtRateTypes'].setValue({ Value: String(magicNumber.four) });
			this.addEditForm.controls['PricingModel'].setValue(dropdown.BillRateBasedValue);
			this.hideMarkUp = true;
		} else {
			this.hideMarkUp = false;
			this.isBillBasedValue = false;
			this.addEditForm.controls['OtRateTypes'].setValue({
				Value: String(this.sectorConfigData.OtRateType)
			});
			this.addEditForm.controls['PricingModel'].setValue(String(Data.PricingModel));
			this.hideMarkUp = false;
		}
	}

	public onPricingChangeRadio(e: number) {
		const pricingModel = e;
		if (pricingModel == Number(dropdown.MarkupBasedValue)) {
			this.hideMarkUp = false;
			this.isBillBasedValue = false;
			this.addEditForm.controls['OtRateTypes'].setValidators(this.customValidators.RequiredValidator('PleaseSelectOtDtRatesCalculationMethod'));
			this.addEditForm.controls['OtRateTypes'].updateValueAndValidity();
		} else {
			this.hideMarkUp = true;
			this.isBillBasedValue = true;
			this.addEditForm.controls['OtRateTypes'].setValue({ Value: String(magicNumber.four),
				Text: this.localizationServ.GetLocalizeMessage(dropdown.BillRateBased)
			 });
		}
	}

	public switchPricingModel(e: boolean) {
		if (this.addEditForm.get('IsAlternatePricingModel')?.value) {
			this.addEditForm.controls['OtRateTypes'].setValidators(this.customValidators.RequiredValidator('PleaseSelectOtDtRatesCalculationMethod'));
			this.addEditForm.controls['OtRateTypes'].updateValueAndValidity();
		} else {
			this.addEditForm.controls['OtRateTypes'].clearValidators();
			this.addEditForm.controls['OtRateTypes'].updateValueAndValidity();
		}
		const sector = this.addEditForm.get('SectorId'),
			isAlternatePricingModelControl = this.addEditForm.get('IsAlternatePricingModel');
		if (!sector?.value && e) {
			isAlternatePricingModelControl?.setValue(false);
			this.toasterServc.showToaster(ToastOptions.Error, 'PleaseSelectSectorFirst', [{ Value: 'Sector', IsLocalizeKey: true }]);
			isAlternatePricingModelControl?.markAsTouched();
		} else {
			if(this.isEditMode && this.addEditForm.get('IsAlternatePricingModel')?.value){
				this.laborCategoryServc
					.newgetpricingmodelBySector(sector?.value)
					.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: GenericResponseBase<InewPricingModel>) => {
						if (res.Data) {
							this.setPricingModelConfig(res.Data);
						}
					});
			}else{
				this.setPricingModelConfig(this.pricingModelData);
			}
			isAlternatePricingModelControl?.setErrors(null);
			isAlternatePricingModelControl?.setValue(e);
		}

	}

	private setPricingModelConfig(Data:InewPricingModel) {
		this.sectorConfigData = Data;
		this.setConditionPricingModelConfig(Data);
		this.addEditForm.controls['BillRateValidation'].setValue(String(Data.BillRateValidation));
		this.addEditForm.controls['CostEstimationType'].setValue(String(Data.CostEstimationType));
		this.addEditForm.controls['OtRateTypes'].setValue({Value: String(Data.OtRateType), Text: String(Data.OtRateTypeName)});
		this.addEditForm.controls['PricingModel'].setValue(String(Data.PricingModel));
	}

	private getById() {
		this.isEditMode = true;
		this.patchedValueIsEditMode();
		if (this.laborCategoryDetails.IsAlternatePricingModel &&
			this.laborCategoryDetails.PricingModel != Number(dropdown.BillRateBasedValue)) {
			this.isBillBasedValue = false;
			this.hideMarkUp = false;
			this.addEditForm.controls['OtRateTypes'].setValue({
				Value: String(this.laborCategoryDetails.OtRateType),
				Text: this.localizationServ.GetLocalizeMessage(this.laborCategoryDetails.OtRateTypeLocalizedKey)
			});
			this.addEditForm.controls['OtRateTypes'].setValidators(this.customValidators.RequiredValidator('PleaseSelectOtDtRatesCalculationMethod'));
		} else {
			this.isBillBasedValue = true;
			this.hideMarkUp = true;
			this.addEditForm.controls['OtRateTypes'].setValue({ Value: String(magicNumber.four),
				Text: this.localizationServ.GetLocalizeMessage(dropdown.BillRateBased) });
		}

		this.dataInitializationGetById();
	}

	dataInitializationGetById() {
		this.secName = this.laborCategoryDetails.SectorName;
		this.lcCode = this.laborCategoryDetails.LaborCategoryCode;
		this.isRfx = this.laborCategoryDetails.IsRfxSowRequired;
		this.editModeSectorId = this.laborCategoryDetails.SectorId;
		this.actionTypeId = ActionType.Edit;
		this.udfRecordId = this.laborCategoryDetails.Id;
		this.recordUKey = this.laborCategoryDetails.UKey;
		this.sectorId = this.laborCategoryDetails.SectorId;
	}

	patchedValueIsEditMode() {
		this.addEditForm.patchValue({
			LaborCategoryName: this.laborCategoryDetails.LaborCategoryName.trim(),
			SectorId: this.laborCategoryDetails.SectorId,
			MspProgramManagerId: {
				Value: this.laborCategoryDetails.MspProgramManagerId.toString(),
				Text: this.laborCategoryDetails.MspUserName
			},
			LaborCatType: {
				Value: this.laborCategoryDetails.LaborCatType.toString(),
				Text: this.laborCategoryDetails.LaborCategoryTypeLocalizedKey
			},

			CandidateHiredBy: this.laborCategoryDetails.CandidateHiredBy,
			IsAlternatePricingModel:
								this.laborCategoryDetails.IsAlternatePricingModel,
			PricingModel:
								this.laborCategoryDetails.IsAlternatePricingModel
									? String(this.laborCategoryDetails.PricingModel)
									: dropdown.BillRateBasedValue,
			BillRateValidation:
								this.laborCategoryDetails.IsAlternatePricingModel
									? String(this.laborCategoryDetails.BillRateValidation)
									: dropdown.NTEValue,
			CostEstimationType:
								this.laborCategoryDetails.IsAlternatePricingModel
									? String(this.laborCategoryDetails.CostEstimationType)
									: dropdown.PeriodofPerformanceValue,
			 OtRateTypes: this.laborCategoryDetails.IsAlternatePricingModel
				   	?{Value: this.laborCategoryDetails.OtRateType?.toString(),
					Text: this.localizationServ.GetLocalizeMessage(this.laborCategoryDetails.OtRateTypeLocalizedKey)}
				   	:dropdown.PeriodofPerformanceValue
		});
		this.updateBasedOnLabCatType();

	}


	public updateBasedOnLabCatType(){
		if(this.laborCategoryDetails.LaborCatType == Number(dropdown.Professional)){
			this.addEditForm.patchValue({
				MaxProfilesPerStaffing: this.laborCategoryDetails.MaxProfilesPerStaffing,
				MaxProfileTotal: this.laborCategoryDetails.MaxProfileTotal,
				PayrollMarkUp: this.laborCategoryDetails.PayrollMarkUp,
				IsExpressLaborCategory: this.laborCategoryDetails.IsExpressLaborCategory
			});
			this.showProfData = true;
		}else if(this.laborCategoryDetails.LaborCatType == Number(dropdown.LightIndustrial)){
			this.clearValidatorsForControls([
				'MaxProfilesPerStaffing', 'MaxProfileTotal',
				'PayrollMarkUp'
			]);
		}else{
			this.clearValidatorsForControls([
				'MaxProfilesPerStaffing', 'MaxProfileTotal',
				'PayrollMarkUp'
			]);
			this.showProfData = false;
		}

	}


	public onChangeSectorDropdown(val: IDropdownWithExtras | undefined) {
		if(val == undefined){
			this.addEditForm.controls['IsAlternatePricingModel'].setValue(false);
			this.addEditForm.controls['LaborCatType'].setValue(null);
			this.laborCatTypeData = [];
			return;
		}
		this.sectorId = parseInt(val.Value);
		this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
		const id = Number(val.Value),
			isAlternatePricingModelControl = this.addEditForm.get('IsAlternatePricingModel');
		if (val == undefined) {
			isAlternatePricingModelControl?.patchValue(false);
			isAlternatePricingModelControl?.setErrors({ error: true, message: 'PleaseSelectSectorFirst' });
			isAlternatePricingModelControl?.markAsTouched();
		} else if (!isAlternatePricingModelControl?.value) {
			isAlternatePricingModelControl?.setErrors(null);
		}
		this.getSectorById(id);
	}

	public setDefaultValue(){
		this.showProfData = false;
		this.addEditForm.controls['PayrollMarkUp'].setValue(null);
		this.addEditForm.controls['MaxProfilesPerStaffing'].setValue(null);
		this.addEditForm.controls['MaxProfileTotal'].setValue(null);
		this.addEditForm.controls['IsExpressLaborCategory'].setValue(false);
	}

	public setDefaultProfFields(){
		this.addEditForm.controls['MaxProfilesPerStaffing'].markAsUntouched();
		this.addEditForm.controls['MaxProfilesPerStaffing'].markAsPristine();
		this.addEditForm.controls['MaxProfileTotal'].markAsUntouched();
		this.addEditForm.controls['MaxProfileTotal'].markAsPristine();
		this.addEditForm.controls['PayrollMarkUp'].markAsUntouched();
		this.addEditForm.controls['PayrollMarkUp'].markAsPristine();
	}


	public onChangeLaborCatTypeDdl(val:IDropdown | undefined){
		if(val == undefined){
			this.setDefaultValue();
			this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
		}
		else if(val.Value == String(dropdown.Professional)){
			this.showProfData = true;
			this.setDefaultProfFields();
			this.addEditForm.controls['PayrollMarkUp'].setValidators([
				this.customValidators.RequiredValidator('PleaseEnterPayrollMarkUpPercentage'),
				this.customValidators.RangeValidator(magicNumber.zero, magicNumber.hundred, 'PleaseSelectValueFromZeroToHundred')
			]);
			this.addEditForm.controls['MaxProfilesPerStaffing'].setValidators([
				this.customValidators.RangeValidator(magicNumber.one, magicNumLab.FourNine),
			 this.customValidators.RequiredValidator('PleaseEnterMaxProfilesPerStaffing'), this.customValidators.NoSpecialCharacterValidator() as ValidatorFn
			] );
			this.addEditForm.controls['MaxProfileTotal'].setValidators([
				this.customValidators.RangeValidator(magicNumber.one, magicNumLab.FourNine),
			 this.customValidators.RequiredValidator('PleaseEnterMaxProfilesTotal'), this.customValidators.NoSpecialCharacterValidator() as ValidatorFn
			] );
			this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
		}
		else if(val.Value == dropdown.LightIndustrial){
			this.showProfData =false;
			this.clearValidatorsForControls([
				'MaxProfilesPerStaffing', 'MaxProfileTotal',
				'PayrollMarkUp'
			]);
			this.addEditForm.controls['PayrollMarkUp'].setValue(null);
			this.addEditForm.controls['MaxProfilesPerStaffing'].setValue(null);
			this.addEditForm.controls['MaxProfileTotal'].setValue(null);
			this.addEditForm.controls['IsExpressLaborCategory'].setValue(false);
			this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
		}
		else {
			this.setDefaultValue();
			this.clearValidatorsForControls([
				'MaxProfilesPerStaffing', 'MaxProfileTotal',
				'PayrollMarkUp'
			]);
			this.updateRadioGroupPricing(dropdown.BillRateBasedPro);
		}
	}

	private clearValidatorsForControls(controlNames: string | string[]) {
		const controlNamesArray = Array.isArray(controlNames)
			? controlNames
			: [controlNames];
		Object.keys(this.addEditForm.controls).forEach((controlName) => {
			if (controlNamesArray.includes(controlName)) {
				const control = this.addEditForm.controls[controlName];
				control.clearValidators();
				control.updateValueAndValidity();
			}
		});
	}


	getUdfData(data: UdfData) {
		this.udfData = data.data;
		this.addEditForm.addControl('udf', data.formGroup);
	}
	public checkLIRequest(): boolean{
		if(this.isEditMode && this.IsLiCreated){
			return true;
		}
		return false;
	}

	private save() {
		this.addEditForm.markAllAsTouched();
		const laborData: LaborCategory = new LaborCategory(this.addEditForm.value);
		laborData.SectorId = this.addEditForm.controls['SectorId'].value?.Value;
		laborData.MspProgramManagerId =
      this.addEditForm.controls['MspProgramManagerId'].value.Value;
		laborData.LaborCatType= this.addEditForm.controls['LaborCatType'].value?.Value;
		laborData.OtRateType =
      this.addEditForm.controls['OtRateTypes'].value.Value;
	  	laborData.PayrollMarkUp = this.addEditForm.controls['PayrollMarkUp'].value?.toFixed(magicNumber.three);
		laborData.UdfFieldRecords = this.udfData;
		laborData.IsAlternatePricingModel = this.addEditForm.controls['IsAlternatePricingModel'].value;
		if(!this.addEditForm.get('IsAlternatePricingModel')?.value){
			laborData.PricingModel = '';
			laborData.MarkUpFlag = '';
			laborData.BillRateValidation = '';
			laborData.CostEstimationType = '';
			laborData.OtRateType = '';
		}
		if (this.isEditMode) {
			this.saveEditMode(laborData);
		} else {
			this.saveAddMode(laborData);
		}
	}

	saveEditMode(laborData: LaborCategory) {
		laborData.ReasonForChange = this.reasonForChange;
		delete laborData.SectorId;
		laborData.UKey = this.laborCategoryDetails.UKey;
		laborData.PayrollMarkUp= this.addEditForm.controls['PayrollMarkUp'].value?.toFixed(magicNumber.three);
		this.laborCategoryServc.updateLaborCategory(laborData).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
			next: (data: GenericResponseBaseWithValidationMessage<null>) => {
				this.commonService.resetAdvDropdown(this.entityID);
				this.toasterServc.resetToaster();
				if (data.StatusCode === parseInt(HttpStatusCode.Ok.toString())) {
					this.toasterServc.showToaster(ToastOptions.Success, 'LaborCategorySavedSuccessfully');
					this.statusError = false;
					this.addEditForm.markAsPristine();
					this.recordname = true;
					this.cdr.markForCheck();
				}
				else {
					if(data.ValidationMessages && data.ValidationMessages.length > parseInt(magicNumber.zero.toString())) {
						this.toasterServc.showToaster(
							ToastOptions.Error,
							data.ValidationMessages[0].ErrorMessage
						);
					}
					else {
						this.toasterServc.showToaster(
							ToastOptions.Error,
							data.Message
						);
					}
					this.recordname = false;
				}
			}
		});
	}

	saveAddMode(laborData: LaborCategory) {
		delete laborData.LaborCategoryCode;
	 this.laborCategoryServc.addLaborCategory(laborData).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
			next: (data: GenericResponseBaseWithValidationMessage<null>) => {
				if (data.StatusCode === parseInt(HttpStatusCode.Ok.toString())) {
					this.isAdded = true;
					this.conflictData=false;
					this.toasterServc.resetToaster();
					this.route.navigate([NavigationPaths.list]);
					setTimeout(() => {
						this.toasterServc.showToaster(ToastOptions.Success, 'LaborCategorySavedSuccessfully');
					});
					this.statusError = false;
					this.addEditForm.reset();
					this.setDefaultResetControl();
				}
				else {
					this.conflictData=true;
					this.toasterServc.resetToaster();
					if(data.ValidationMessages && data.ValidationMessages.length > parseInt(magicNumber.zero.toString())) {
						this.toasterServc.showToaster(
							ToastOptions.Error,
							data.ValidationMessages[0].ErrorMessage
						);
					}
					else {
						this.toasterServc.showToaster(
							ToastOptions.Error,
							data.Message
						);
					}
					this.statusError = true;
				}
			}
		});
	}


	private setDefaultResetControl() {
		this.addEditForm.controls['IsExpressLaborCategory'].setValue(false);
		this.addEditForm.controls['IsAlternatePricingModel'].setValue(false);
	}

	public submitForm() {
		this.addEditForm.markAllAsTouched();
		if (this.addEditForm.valid) {
			this.save();
		}
	}


	public switchExpressLaborCategory(e: boolean) {
		if (e) {
			this.addEditForm.controls['CandidateHiredBy'].setValidators(this.customValidators.RequiredValidator);
			this.addEditForm.controls['CandidateHiredBy'].updateValueAndValidity();
			this.addEditForm.controls['CandidateHiredBy'].setValue(dropdown.MSP);
		}
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.conflictData) {
			this.toasterServc.resetToaster();
		}
		if(!this.isAdded){
		   	this.toasterServc.resetToaster();
		}
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
		this.addEditForm.reset();
		this.addEditSection = false;
		this.conflictData = false;
	}
}


