
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BenefitAdderForView, BenefitAddersToPost, CostEstimationDetail, DropdownAggregateResponse, JobDetails, RateUnit, RateUnitValue, ReqLibraryBenefitAdder, RequisitionDataAddEdit, RequisitionLibraryAddPayload, RequisitionLibraryUpdatePayload, UdfData, dropdownLaborCatType } from '../constant/rate-enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { RequisitionLibraryGatewayService } from 'src/app/services/masters/requisition-library-gateway.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { NavPathsType } from '@xrm-master/event configuration/constant/event-configuration.enum';
import { IDropdownItem, IDropdownOption } from '@xrm-shared/models/common.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBenefitAdderData, IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { EventLogService } from '@xrm-shared/services/event-log.service';

@Component({selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	public AddEditRequisitionLibrary: FormGroup;
	public sectorData: IDropdownItem[] = [];
	public laborCategoryData: IDropdownItem[] = [];
	public uId: string;
	public wagerate: boolean;
	public jobCategoryData: IDropdownItem[] = [];
	public workLocationData: IDropdownOption[] = [];
	public benefitAdderData: IBenefitAdderData[] = [];
	public requisitionLibrary: RequisitionDataAddEdit;
	public isWagerateAdjustment: boolean;
	public reasonForChange: string;
	public navigationPaths: NavPathsType = NavigationPaths;
	public countryVal: number;
	public sectorDetails: CostEstimationDetail;
	public billRateLabel: string = 'BillRateNteTarget';
	public labCatTypeData: number;
	public RateUnitList: { Text: RateUnit; Value: RateUnitValue }[] = [
		{ Text: RateUnit.Hour, Value: RateUnitValue.Hour },
		{ Text: RateUnit.Week, Value: RateUnitValue.Week },
		{ Text: RateUnit.Month, Value: RateUnitValue.Month }
	];

	public entityId: number = XrmEntities.RequisitionLibrary;
	public sectorId: number = magicNumber.zero;
	public laborCategoryId: number = magicNumber.zero;
	public jobCategoryId: number = magicNumber.zero;
	public locationId: number = magicNumber.zero;
	public recordUKey: string = '';
	public udfRecordId: number = magicNumber.zero;
	public actionTypeId: number = ActionType.Add;
	public udfData: IPreparedUdfPayloadData[];
	public conflictData: boolean = false;
	public slResponse: IBenefitAdderData[];
	public hideNtePreLaunchRate:boolean= false;
	private ngUnsubscribe$ = new Subject<void>();


	// eslint-disable-next-line max-params
	constructor(
		private form: FormBuilder,
		private customValidators: CustomValidators,
		private requisition: RequisitionLibraryGatewayService,
		private activatedRoute: ActivatedRoute,
		public router: Router,
		public udfCommonMethods: UdfCommonMethods,
		private toasterServc: ToasterService,
		private commonService: CommonService,
		private lcServc:LocalizationService,
		private eventLog: EventLogService,
		private cdr: ChangeDetectorRef
	) {
		this.formDataInitialization();
	}

	ngOnInit(): void {
		if (this.router.url.includes('add-edit/mode-jc')) {
			this.loadJobCategoryData();
		} else {
			this.loadRequisitionLibraryData();
		}
	}

	public formDataInitialization() {
		this.AddEditRequisitionLibrary = this.form.group({
			sectorName: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])]],
			laborCategoryName: [null, [this.customValidators.RequiredValidator('PleaseSelectLabor')]],
			jobCategoryName: [null, [this.customValidators.RequiredValidator('PleaseSelectJobCategory')]],
			workLocation: [null, [this.customValidators.RequiredValidator('PleaseSelectWorkLocation')]],
			nte: [
				null,
				[
				  this.customValidators.RequiredValidator("PleaseEnterData", [{ Value: this.billRateLabel, IsLocalizeKey: true }]),
					this.customValidators.DecimalValidator(magicNumber.two),
					this.customValidators.MaxLengthValidator(magicNumber.seven),
					this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand),
					this.greaterThanZeroAndLessThanTenThousand()
				]
			],
			preLaunchRate: [
				null,
				[
					this.customValidators.DecimalValidator(magicNumber.two),
					this.customValidators.MaxLengthValidator(magicNumber.seven),
					this.greaterThanZeroAndLessThanTenThousand()
				]
			],
			wageRate: [
				null,
				[
					this.customValidators.DecimalValidator(magicNumber.two),
					this.customValidators.MaxLengthValidator(magicNumber.seven),
					this.wageRateLessThanOrEqualToNte(),
					this.customValidators.RangeValidator(magicNumber.one, magicNumber.tenThousand),
					this.greaterThanZeroAndLessThanTenThousand()

				]
			],
			rateUnit: [{ Value: RateUnitValue.Hour }, this.customValidators.RequiredValidator('PleaseSelectRateUnitCode')],
			positionDesc: [
				null, [
					this.customValidators.
						MaxLengthValidator(magicNumber.eightThousand)
				]
			],
			rateType: [],
			skillReq: [null, [this.customValidators.MaxLengthValidator(magicNumber.eightThousand)]],
			EducationReq:
				[null, [this.customValidators.MaxLengthValidator(magicNumber.eightThousand)]],
			ExperienceReq:
				[null, [this.customValidators.MaxLengthValidator(magicNumber.eightThousand)]]
		});
	}

	private wageRateLessThanOrEqualToNte(): ValidationErrors | null {
		return () => {
			if (!this.AddEditRequisitionLibrary) {
				return null;
			}
			const nte = parseFloat(this.AddEditRequisitionLibrary.controls['nte'].value),
				wageRate = parseFloat(this.AddEditRequisitionLibrary.controls['wageRate'].value);
			if (wageRate > nte) {
				 return {
				   	error: true,
					message: `${this.lcServc.GetLocalizeMessage('WageRateLessThanOrEqualToBillRate', [{Value: this.billRateLabel, IsLocalizeKey: true}])}`
				   };
			}
			return null;
		};
	}


	public nteGreaterThanEqualToWageRate() {
		if (this.AddEditRequisitionLibrary.touched) {
			const nte = parseFloat(this.AddEditRequisitionLibrary.controls['nte'].value),
				wageRate = parseFloat(this.AddEditRequisitionLibrary.controls['wageRate'].value);
			if (wageRate > nte) {
				this.handleWageRateGreaterThanNTE();
			} else if (wageRate <= nte) {
				this.handleWageRateLessThanOrEqualToNTE();
			}
		}
	}

	private handleWageRateGreaterThanNTE(): void {
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsTouched();
		this.AddEditRequisitionLibrary.controls['wageRate'].updateValueAndValidity();
	}

	private handleWageRateLessThanOrEqualToNTE(): void {
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsPristine();
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsUntouched();
		this.AddEditRequisitionLibrary.controls['wageRate'].updateValueAndValidity();
	}


	private greaterThanZeroAndLessThanTenThousand(): ValidationErrors | null {
		return (control: AbstractControl): Record<string, string | boolean> | null => {
			const value = control.value;
			if (value == null || value == undefined || value === ''){
				return null;
			}

			if (value !== null && (isNaN(value) || value <= magicNumber.zero)) {
				return {
					error: true,
					message: 'ValueGreaterThanZero'
				};
			}
			if (value !== null && (isNaN(value) || value >= magicNumber.tenThousand)) {
				return {
					error: true,
					message: 'MaxLengthValidationMessage'
				};
			}
			return null;
		};
	}

	private loadRequisitionLibraryData() {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.isEditMode = true;
				this.requisition.getRequisitionLibraryById(param['id']).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
					next: (res: GenericResponseBase<RequisitionDataAddEdit>) => {
						if (isSuccessfulResponse(res)) {
							this.requisitionLibrary = res.Data;
							this.requisition.laborDataSubject.next({
								'Disabled': this.requisitionLibrary.Disabled,
								'ReqLibraryCode': this.requisitionLibrary.RequisitionLibraryCode,
								'ReqLibraryID': this.requisitionLibrary.Id
							});
							this.getLaborCategoryTypeDetails(this.requisitionLibrary.LaborCategoryId);
							this.getRequisitionLibraryById();

						}
					}
				});
			}
		});
		this.getSectorListData();
	}

	private getSectorListData() {
		this.requisition.getSectorDropDownList().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<IDropdownItem[]>) => {
				if (isSuccessfulResponse(res)) {
					this.sectorData = res.Data;
				}
			}
		});
	}

	private loadJobCategoryData() {
		let sectorId: number,
			lcId: number,
			jcId: number;
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			this.uId = param['id'];
			this.requisition.getJobCategory(param['id']).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (res: GenericResponseBase<JobDetails>) => {
					if(isSuccessfulResponse(res)){
						sectorId = parseInt(res.Data.SectorId);
						lcId = parseInt(res.Data.LaborCategoryId);
						jcId = parseInt(res.Data.JobCategoryId);
						this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, sectorId);
						this.wagerate = res.Data.IsWageRate === 'True';
						this.sectorId = sectorId;
						this.getSectorDropDownList(sectorId);
						this.getWorkLocationDropdown(sectorId);
						this.getLaborCategoryDropdown(sectorId, lcId);
						this.getJobcategoryDropdown(lcId, jcId);
						if (this.wagerate) {
							const jobCategoryId = { Value: String(jcId), Text: '', TextLocalizedKey: null, IsSelected: true};
							this.onJobCategoryChange(jobCategoryId);
						}
						this.getLaborCatTypeForJc(res.Data);
					}
				}
			});
		});
	}


	public getLaborCatTypeForJc(data: JobDetails){
		this.requisition.getLaborCategoryType(Number(data.LaborCategoryId)).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: GenericResponseBase<number>) => {
				if(isSuccessfulResponse(res)){
					this.labCatTypeData = res.Data;
					if(this.labCatTypeData == Number(dropdownLaborCatType.LightIndustrial)){
						this.handleLightIndustrial();
					 }
					 if(this.labCatTypeData != Number(dropdownLaborCatType.LightIndustrial)){
						 this.getIsWagerateAdjustmentJobCategory(Number(data.JobCategoryId));
							 this.getCountryIdBySector(Number(data.SectorId));
					 }
					 if(this.labCatTypeData == Number(dropdownLaborCatType.LightIndustrial) ||
					 this.labCatTypeData == Number(dropdownLaborCatType.Professional)){
						 this.RateUnitList = [];
						 this.RateUnitList.push({ Text: RateUnit.Hour, Value: RateUnitValue.Hour });
						 this.AddEditRequisitionLibrary.controls['rateUnit'].clearValidators();
					 }
					if(this.labCatTypeData == Number(dropdownLaborCatType.Icsow)){
						this.AddEditRequisitionLibrary.controls['rateUnit'].addValidators(this.customValidators.RequiredValidator('PleaseSelectRateUnitCode'));
					}
				}
			});

	}

	public getSectorDropDownList(sectorId: number) {
		this.requisition.getSectorDropDownList().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<IDropdownItem[]>) => {
				if (isSuccessfulResponse(res)) {
					this.sectorData = res.Data;
					const sector = this.sectorData.filter((data: IDropdownItem) => {
						return data.Value == String(sectorId);
					});
					this.AddEditRequisitionLibrary.patchValue({
						sectorName: sector[magicNumber.zero]
					});
					this.getBenefitAdder(sectorId, magicNumber.zero);
				}
			}
		});
	}

	public getWorkLocationDropdown(sectorId: number) {
		this.requisition.getWorkLocationDropdown(sectorId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<IDropdownOption[]>) => {
				if (isSuccessfulResponse(res)) {
					this.workLocationData = res.Data;
				}
			}
		});
	}

	public getLaborCategoryDropdown(sectorId: number, lcId: number) {
		this.requisition.getLaborCategoryDropdown(sectorId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<IDropdownItem[]>) => {
				if (isSuccessfulResponse(res)) {
					this.laborCategoryData = res.Data;
					const lcData = res.Data.filter((data: IDropdownItem) => {
						return data.Value == String(lcId);
					});
					this.AddEditRequisitionLibrary.patchValue({
						laborCategoryName: lcData[magicNumber.zero]
					});
				}
			}
		});
	}

	public getJobcategoryDropdown(lcId: number, jcId: number) {
		this.requisition.getJobcategoryDropdown(lcId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: GenericResponseBase<IDropdownItem[]>) => {
				if (isSuccessfulResponse(res)) {
					this.jobCategoryData = res.Data;
					const jobData = res.Data.filter((data: IDropdownItem) => {
						return data.Value == String(jcId);
					});
					this.AddEditRequisitionLibrary.patchValue({
						jobCategoryName: jobData[magicNumber.zero]
					});
				}
			}
		});
	}


	public navigate() {
		if (this.router.url.includes('add-edit/mode-jc')) {
			this.router.navigate([NavigationPaths.jcList + this.uId]);
		}
		else {
			this.router.navigate([NavigationPaths.list]);
		}
	}


	public onSectorChange(val: IDropdownItem | undefined) {
		this.AddEditRequisitionLibrary.patchValue({
			laborCategoryName: null, workLocation: null, jobCategoryName: null
		});
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsPristine();
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsUntouched();
		this.benefitAdderData = [];
		if (val != undefined) {
			this.requisition.GetDropdownDataBySectorId(Number(val.Value)).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (res: DropdownAggregateResponse) => {
					if (res.ddlLcat.Succeeded && res.ddlLcat.Data) {
						this.laborCategoryData = res.ddlLcat.Data;
					}else{
						this.getNullData();
					}
					if (res.ddlLocation.Succeeded && res.ddlLocation.Data) {
						this.workLocationData = res.ddlLocation.Data;
						this.getBenefitAdder(Number(val.Value), magicNumber.zeroDecimalZero);
					}else{
						this.getNullData();
					}
					if(res.ddlsectconfig.Succeeded && res.ddlsectconfig.Data)
						this.countryVal = res.ddlsectconfig.Data.CountryId;
				}
			});

			this.sectorId = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
			this.getCountryIdBySector(Number(val.Value));
		}else {
			this.wagerate = false;
			this.laborCategoryData = [];
			this.workLocationData = [];
			this.jobCategoryData = [];
			this.AddEditRequisitionLibrary.patchValue({
				laborCategoryName: null,
				workLocation: null,
				jobCategoryName: null,
				LabelLocalizedKey: null,
				sectorName: null
			});
			this.billRateLabel ='BillRateNteTarget';
			this.AddEditRequisitionLibrary.controls['nte'].addValidators(this.customValidators.RequiredValidator(
				"PleaseEnterData",
				 [{ Value: this.billRateLabel, IsLocalizeKey: true }]
			));
			this.AddEditRequisitionLibrary.controls['nte'].updateValueAndValidity();
		}
	}

	getNullData(){
		this.laborCategoryData = [];
		this.jobCategoryData = [];
		this.workLocationData = [];
	}

	private getCountryIdBySector(id: number) {
		this.requisition.getCountryIdBySector(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: GenericResponseBase<CostEstimationDetail>) => {
				if(isSuccessfulResponse(res)){
					this.countryVal = res.Data.CountryId;
					this.sectorDetails = res.Data;
					if(this.sectorDetails.BillRateValidation == Number(magicNumber.sixteen)){
						this.billRateLabel = 'BillRateNte';
						this.AddEditRequisitionLibrary.controls['nte'].addValidators(this.customValidators.RequiredValidator(
							"PleaseEnterData",
							[{ Value: this.billRateLabel, IsLocalizeKey: true }]
						));
					}
					else if(this.sectorDetails.BillRateValidation == Number(magicNumber.seventeen)){
						this.billRateLabel = 'BillRateTarget';
						this.AddEditRequisitionLibrary.controls['nte'].addValidators(this.customValidators.RequiredValidator(
							"PleaseEnterData",
							[{ Value: this.billRateLabel, IsLocalizeKey: true }]
						));
					}else{
						this.billRateLabel ='BillRateNteTarget';
						this.AddEditRequisitionLibrary.controls['nte'].addValidators(this.customValidators.RequiredValidator(
							"PleaseEnterData",
							[{ Value: this.billRateLabel, IsLocalizeKey: true }]
						));
					}
					this.AddEditRequisitionLibrary.controls['nte'].updateValueAndValidity();
				}
			});
	}


	public getLaborCategoryTypeDetails(id:number){
	 	this.requisition.getLaborCategoryType(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: GenericResponseBase<number>) => {
				if(isSuccessfulResponse(res)){
					this.labCatTypeData = res.Data;
					this.cdr.markForCheck();
				   if(this.labCatTypeData == Number(dropdownLaborCatType.LightIndustrial)){
						this.handleLightIndustrial();
				   }else if(this.labCatTypeData == Number(dropdownLaborCatType.Professional) ||
				   		this.labCatTypeData == Number(dropdownLaborCatType.Icsow)){
						this.handleProfessional();
					}else if(this.isEditMode){
					   this.getCountryIdBySector(this.requisitionLibrary.SectorId);
				   	}
				 	if(this.isEditMode && this.labCatTypeData != Number(dropdownLaborCatType.LightIndustrial) ){
					   this.getIsWagerateAdjustmentJobCategory(this.requisitionLibrary.
						   JobCategoryId);
				   	}
				   if(this.labCatTypeData == Number(dropdownLaborCatType.LightIndustrial) ||
					this.labCatTypeData == Number(dropdownLaborCatType.Professional)){
					   this.RateUnitList = [];
					   this.RateUnitList.push({ Text: RateUnit.Hour, Value: RateUnitValue.Hour });
						 this.AddEditRequisitionLibrary.controls['rateUnit'].clearValidators();
				   	}
					if(this.labCatTypeData == Number(dropdownLaborCatType.Icsow)){
						this.AddEditRequisitionLibrary.controls['rateUnit'].addValidators(this.customValidators.RequiredValidator('PleaseSelectRateUnitCode'));
					}
				}
	   	});
	}


	private handleLightIndustrial() {
		this.wagerate = true;
		this.hideNtePreLaunchRate = true;
		this.AddEditRequisitionLibrary.controls['nte'].setValue(null);
		this.AddEditRequisitionLibrary.controls['preLaunchRate'].setValue(null);
		this.AddEditRequisitionLibrary.controls['wageRate'].setValidators([
			this.customValidators.RequiredValidator('PleaseEnterWageRate'),
			this.greaterThanZeroAndLessThanTenThousand()
		] as ValidatorFn[]);
		this.AddEditRequisitionLibrary.controls['nte'].clearValidators();
		this.AddEditRequisitionLibrary.controls['preLaunchRate'].updateValueAndValidity();
		this.AddEditRequisitionLibrary.controls['nte'].updateValueAndValidity();
		this.AddEditRequisitionLibrary.controls['wageRate'].updateValueAndValidity();
	}


	private handleProfessional() {
		this.wagerate = false;
		this.hideNtePreLaunchRate = false;
		this.AddEditRequisitionLibrary.controls['nte'].addValidators([
			this.customValidators.RequiredValidator("PleaseEnterData", [{ Value: this.billRateLabel, IsLocalizeKey: true }]),
			this.greaterThanZeroAndLessThanTenThousand()
		] as ValidatorFn[]);
		this.AddEditRequisitionLibrary.controls['nte'].updateValueAndValidity();
		this.AddEditRequisitionLibrary.controls['preLaunchRate'].updateValueAndValidity();
	}


	public onWorkLocationChange(event: IDropdownItem | undefined) {
		const sectorId = this.AddEditRequisitionLibrary.controls['sectorName'].value.Value;
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsPristine();
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsUntouched();
		if ( event != undefined) {
			this.getBenefitAdder(sectorId, Number(event.Value));
			this.locationId = parseInt(event.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.Location, this.locationId);
		} else {
			this.getBenefitAdder(sectorId, magicNumber.zero);
		}
	}


	public onLaborChange(val: IDropdownItem | undefined) {
		this.jobCategoryData = [];
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsPristine();
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsUntouched();
		this.AddEditRequisitionLibrary.patchValue({ jobCategoryName: null });
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsPristine();
		if ( val != undefined) {
			this.requisition.getJobcategoryDropdown(Number(val.Value)).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (res: GenericResponseBase<IDropdownItem[]>) => {
					if (isSuccessfulResponse(res)) {
						this.jobCategoryData = res.Data;
					}
					else{
						this.jobCategoryData = [];
					}
				}
			});
			this.getLaborCategoryTypeDetails(Number(val.Value));
		}
		else {
			this.jobCategoryData = [];
			this.wagerate = false;
			this.hideNtePreLaunchRate = false;
			this.AddEditRequisitionLibrary.patchValue({
				jobCategoryName: null
			});
			this.AddEditRequisitionLibrary.controls['wageRate'].clearValidators();
			this.AddEditRequisitionLibrary.controls['rateUnit'].setValue('');
			this.RateUnitList = [
				{ Text: RateUnit.Hour, Value: RateUnitValue.Hour },
				{ Text: RateUnit.Week, Value: RateUnitValue.Week },
				{ Text: RateUnit.Month, Value: RateUnitValue.Month }
			];
			this.AddEditRequisitionLibrary.controls['nte'].addValidators([
				this.customValidators.RequiredValidator("PleaseEnterData", [{ Value: this.billRateLabel, IsLocalizeKey: true }]),
				this.greaterThanZeroAndLessThanTenThousand()
			] as ValidatorFn[]);
			this.AddEditRequisitionLibrary.controls['wageRate'].addValidators([
				this.greaterThanZeroAndLessThanTenThousand(),
				this.wageRateLessThanOrEqualToNte()
			] as ValidatorFn[]);
			this.AddEditRequisitionLibrary.controls['nte'].updateValueAndValidity();
			this.AddEditRequisitionLibrary.controls['wageRate'].updateValueAndValidity();
		}
		if ( val != undefined) {
			this.laborCategoryId = parseInt(val.Value);
			this.udfCommonMethods.manageParentsInfo(XrmEntities.LaborCategory, this.laborCategoryId);
		}
	}

	public getIsWagerateAdjustmentJobCategory(id: number) {
		this.requisition.getIsWageRateAdjustmentJobCategory(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<boolean>) => {
				if(isSuccessfulResponse(data)){
					this.isWagerateAdjustment = data.Data;
					if (this.isWagerateAdjustment) {
						this.wagerate = true;
						this.AddEditRequisitionLibrary.controls['wageRate'].addValidators([
							this.customValidators.RequiredValidator('PleaseEnterWageRate'),
							this.greaterThanZeroAndLessThanTenThousand()
						] as ValidatorFn[]);
						this.AddEditRequisitionLibrary.controls['wageRate'].updateValueAndValidity();
					} else {
						this.applyValidatorsForNonWagerate();
					}
				}
			}
		});
	}

	applyValidatorsForNonWagerate() {
		this.wagerate = false;
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsPristine();
		this.AddEditRequisitionLibrary.controls['wageRate'].markAsUntouched();
		this.AddEditRequisitionLibrary.controls['wageRate'].clearValidators();
		this.AddEditRequisitionLibrary.controls['wageRate'].setValidators([
			this.customValidators.DecimalValidator(magicNumber.two),
			this.customValidators.MaxLengthValidator(magicNumber.seven),
			this.wageRateLessThanOrEqualToNte(),
			this.customValidators.RangeValidator(magicNumber.one, magicNumber.tenThousand),
			this.greaterThanZeroAndLessThanTenThousand()
		] as ValidatorFn[]);
		this.AddEditRequisitionLibrary.controls['wageRate'].updateValueAndValidity();
	}


	public onJobCategoryChange(val: IDropdownItem | undefined) {
		if (val != undefined) {
			this.jobCategoryId = parseInt(val.Value);
			if(this.labCatTypeData != Number(dropdownLaborCatType.LightIndustrial)){
				this.getIsWagerateAdjustmentJobCategory(this.jobCategoryId);
			}else{
				this.wagerate = true;
			}
			this.udfCommonMethods.manageParentsInfo(XrmEntities.JobCategory, Number(val.Value));
		}else{
			this.applyValidatorsForNonWagerate();
		}
	}


	getUdfData(data: UdfData) {
		this.udfData = data.data;
		this.AddEditRequisitionLibrary.addControl('udf', data.formGroup);
	}

	private getBenefitAdder(sid: number, lid: number) {
		this.requisition.getIsBenefitAdder(sid, lid).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<IBenefitAdderData[]>) => {
				if (data.Data && data.Data.length === Number(magicNumber.zero)) {
					this.requisition.getIsBenefitAdder(sid, magicNumber.zero).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
						next: (newData: GenericResponseBase<IBenefitAdderData[]>) => {
							if(newData.Succeeded && newData.Data){
								this.benefitAdderData = newData.Data;
								this.cdr.markForCheck();
							}
						}
					});
				} else if(data.Data) {
					this.benefitAdderData = data.Data;
					this.cdr.markForCheck();
				}
				this.benefitAdderData.forEach((a: IBenefitAdderData) => {
					const x = new FormControl(
						magicNumber.zeroDecimalZero,
						this.customValidators.RangeValidator(
							magicNumber.zero,
							magicNumber.tenThousand
						)
					);
					this.AddEditRequisitionLibrary.addControl(a.LabelLocalizedKey, x);
				});
			}

		});
	}

	onFocusOut(controlName: string) {
		const control = this.AddEditRequisitionLibrary.get(controlName),
			currentValue = control?.value;
		if (currentValue == null || currentValue.trim() == '') {
			control?.setValue(magicNumber.zeroDecimalZero);
		}
	}


	public getRequisitionLibraryById() {
		if (this.isEditMode) {
			this.getRequisitionLibraryByIdIsEditMode();
		} else {
			const sectorId = this.requisitionLibrary.SectorId,
				locationId = this.requisitionLibrary.LocationId || magicNumber.zero;
			this.getBenefitAdder(sectorId, locationId);
		}
	}

	setPatchValues() {
		const {
				SectorName, SectorId, LaborCategoryName, LaborCategoryId, JobCategoryName,
				JobCategoryId, LocationName, TargetRate, PreLaunchRate, WageRate, RateUnitCode,
				PositionDesc, SkillDesc, EducationDesc, ExperienceDesc
			} = this.requisitionLibrary,

		 patchValues = {
				sectorName: { Text: SectorName, Value: SectorId },
				laborCategoryName: { Text: LaborCategoryName, Value: LaborCategoryId },
				jobCategoryName: { Text: JobCategoryName, Value: JobCategoryId },
				workLocation: { Text: LocationName },
				nte: TargetRate,
				preLaunchRate: PreLaunchRate,
				wageRate: WageRate,
				rateUnit: { Value: RateUnitCode },
				positionDesc: this.getNullOrTrimValue(PositionDesc),
				skillReq: this.getNullOrTrimValue(SkillDesc),
				EducationReq: this.getNullOrTrimValue(EducationDesc),
				ExperienceReq: this.getNullOrTrimValue(ExperienceDesc)
			};
		this.benefitAdderData = [];
		this.AddEditRequisitionLibrary.patchValue(patchValues);
	}

	 getRequisitionLibraryByIdIsEditMode() {
	   	this.setPatchValues();
	   	this.requisition.getIsBenefitAdder(this.requisitionLibrary.SectorId, this.requisitionLibrary.LocationId)
	   		.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((slData: GenericResponseBase<IBenefitAdderData[]>) => {
	   			if (isSuccessfulResponse(slData)) {
	   				this.slResponse = slData.Data;
					   this.cdr.markForCheck();
	   			}
	   			if (this.slResponse.length === Number(magicNumber.zero)) {
	   				this.requisition.getIsBenefitAdder(this.requisitionLibrary.SectorId, magicNumber.zero)
	   					.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((sdata: GenericResponseBase<IBenefitAdderData[]>) => {
	   						if (isSuccessfulResponse(sdata)) {
								this.slResponse = sdata.Data;
	   							const data = this.comparisonMethod();
	   				   data.forEach((e: BenefitAdderForView) => {
	   								this.benefitAdderData.push({
										LabelLocalizedKey: e.LabelLocalizedKey,
										Id: magicNumber.zero, Label: '',
										LocationId: null,
										SectorId: magicNumber.zero,
										UKey: ''
									});
										 const controlValue = e.Value ?? magicNumber.zeroDecimalZero,
	   									control = new FormControl(controlValue, this.
	   										customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand));
	   								this.AddEditRequisitionLibrary.addControl(e.LabelLocalizedKey, control);
	   							});
	   						}
	   					});
	   			}
	   			else {
	   				const data = this.comparisonMethod();
	   				data.forEach((e: BenefitAdderForView) => {
	   					this.benefitAdderData.push({
							LabelLocalizedKey: e.LabelLocalizedKey,
							Id: magicNumber.zero,
							Label: '',
							LocationId: null,
							SectorId: magicNumber.zero,
							UKey: ''
						});
							 const controlValue = e.Value ?? magicNumber.zeroDecimalZero,
	   						control = new FormControl(controlValue, this.
	   							customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand));
	   					this.AddEditRequisitionLibrary.addControl(e.LabelLocalizedKey, control);
	   				});

				}
	   		});
	   	this.setActionTypeAndIds();
	   }

	setActionTypeAndIds() {
		this.actionTypeId = ActionType.Edit;
		this.sectorId = this.requisitionLibrary.SectorId;
		this.recordUKey = this.requisitionLibrary.UKey;
		this.udfRecordId = this.requisitionLibrary.Id;
	}

	comparisonMethod() {
		return this.slResponse.map((sl: IBenefitAdderData) => {
			const { LabelLocalizedKey, ...rest } = sl,
				matchingSecondItem = this.requisitionLibrary.ReqLibraryBenefitAdders.find((benefit: ReqLibraryBenefitAdder) =>
					benefit.LocalizedLabelKey == sl.LabelLocalizedKey);
			return {
				LabelLocalizedKey: LabelLocalizedKey,
				ReqLibraryBenefitAdderId: matchingSecondItem
					? matchingSecondItem.ReqLibraryBenefitAdderId
					: magicNumber.zero,
				Value: matchingSecondItem
					? matchingSecondItem.Value
					: magicNumber.zero,
				...rest
			};
		});
	}


	public submitForm() {
		this.AddEditRequisitionLibrary.markAllAsTouched();
		if (this.AddEditRequisitionLibrary.valid) {
			this.save();
		}
	}


	private getBenefitAddersToUpdate() {
		const benefitData = this.comparisonMethod(),
			befefitAdders: IBenefitData[] = [];
		benefitData.forEach((data: BenefitAdderForView) => {
			const control = this.AddEditRequisitionLibrary.controls[data.LabelLocalizedKey],
				value: string | null = control.value !== null && control.value !== undefined
					? parseFloat(control.value.toString()).toFixed(magicNumber.two)
					: magicNumber.zeroDecimalZero.toString(),
				dt: IBenefitData = {
					ReqLibraryBenefitAdderId: data.ReqLibraryBenefitAdderId
						? data.ReqLibraryBenefitAdderId
						: magicNumber.zero,
					LocalizedLabelKey: data.LabelLocalizedKey,
					Value: Number(parseFloat(value).toFixed(magicNumber.two))
				};
			befefitAdders.push(dt);
		});
		return befefitAdders;
	}


	private getBenefitAddersToPost() {
		const befefitAdders: BenefitAddersToPost[] = [];
		this.benefitAdderData.forEach((data: IBenefitAdderData) => {
			const control = this.AddEditRequisitionLibrary.controls[data.LabelLocalizedKey],
				value: string | null = control.value !== null && control.value !== undefined
					? parseFloat(control.value.toString()).toFixed(magicNumber.two)
					: magicNumber.zeroDecimalZero.toString(),
				dt: BenefitAddersToPost = {
					LocalizedLabelKey: data.LabelLocalizedKey,
					Value: Number(parseFloat(value).toFixed(magicNumber.two))
				};
			befefitAdders.push(dt);
		});
		return befefitAdders;
	}

	private save() {
		if (this.isEditMode) {
			this.saveEditMode();
		}else {
			this.saveAddMode();
		}
	}


	isValidNumber = (value: string | number | null | undefined): boolean => {
		return typeof value === 'number' && !isNaN(value);
	};

	private handleSaveResponse(data: ApiResponseBase): void {
		if (data.StatusCode == HttpStatusCode.Conflict) {
			this.conflictData = true;
			this.toasterServc.showToaster(ToastOptions.Error, 'RequisitionLibraryAlreadyExists');
		} else if (data.StatusCode == HttpStatusCode.Ok) {
			this.commonService.resetAdvDropdown(this.entityId);
			this.conflictData = false;
			this.toasterServc.resetToaster();
			this.router.navigate([this.navigationPaths.list]);
			setTimeout(() => {
				this.toasterServc.showToaster(ToastOptions.Success, 'ReqLibrarySaveSuccessfully');
			});
		} else {
			this.conflictData = true;
			this.toasterServc.resetToaster();
			this.toasterServc.showToaster(ToastOptions.Error, data.Message ?? '');
		}
	}


	saveAddMode() {
		const reqlibData: RequisitionLibraryAddPayload = {
			sectorId: parseInt(this.AddEditRequisitionLibrary.controls['sectorName'].value.Value),
			laborCategoryId: parseInt(this.AddEditRequisitionLibrary.controls['laborCategoryName'].value.Value),
			jobCategoryId: parseInt(this.AddEditRequisitionLibrary.controls['jobCategoryName'].value.Value),
			locationId: parseInt(this.AddEditRequisitionLibrary.controls['workLocation'].value.Value),
			targetRate: this.isValidNumber(this.AddEditRequisitionLibrary.controls['nte'].value)
				? this.AddEditRequisitionLibrary.controls['nte'].value.toFixed(magicNumber.two)
				: null,
			preLaunchRate: this.isValidNumber( this.AddEditRequisitionLibrary.controls['preLaunchRate'].value)
				? this.AddEditRequisitionLibrary.controls['preLaunchRate'].value.toFixed(magicNumber.two)
				: null,
			wageRate: this.isValidNumber(this.AddEditRequisitionLibrary.controls['wageRate'].value)
				? this.AddEditRequisitionLibrary.controls['wageRate'].value.toFixed(magicNumber.two)
				: null,
			rateUnitCode: this.AddEditRequisitionLibrary.controls['rateUnit'].value.Value ?? RateUnitValue.Hour,
			rateTypeCode: this.AddEditRequisitionLibrary.controls['rateType'].value,
			reqLibraryAdditionalDetail: {
				positionDesc: this.AddEditRequisitionLibrary.controls['positionDesc'].value,
				skillDesc: this.AddEditRequisitionLibrary.controls['skillReq'].value,
				educationDesc: this.AddEditRequisitionLibrary.controls['EducationReq'].value,
				experienceDesc: this.AddEditRequisitionLibrary.controls['ExperienceReq'].value
			},
			reqLibraryBenefitAdders: this.getBenefitAddersToPost(),
			UdfFieldRecords: this.udfData
		};

		this.requisition.addRequisitionLibrary(reqlibData)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (data: ApiResponseBase) =>
					this.handleSaveResponse(data)
			});

		this.AddEditRequisitionLibrary.patchValue({
			rateUnit: [{ Value: RateUnit.Hour }, this.customValidators.RequiredValidator()]
		});

	}

	private getNullOrTrimValue(value: string | null | undefined): string | null {
		return (value === null || value === undefined || value.trim() === '')
			? ""
			: value.trim();
	}

	saveEditMode() {
		const reqlibData: RequisitionLibraryUpdatePayload = {
			uKey: this.requisitionLibrary.UKey,
			targetRate: this.isValidNumber(this.AddEditRequisitionLibrary.controls['nte'].value)
				? this.AddEditRequisitionLibrary.controls['nte'].value.toFixed(magicNumber.two)
				: null,
			preLaunchRate: this.isValidNumber( this.AddEditRequisitionLibrary.controls['preLaunchRate'].value)
				? this.AddEditRequisitionLibrary.controls['preLaunchRate'].value.toFixed(magicNumber.two)
				: null,
			wageRate: this.isValidNumber(this.AddEditRequisitionLibrary.controls['wageRate'].value)
				? this.AddEditRequisitionLibrary.controls['wageRate'].value.toFixed(magicNumber.two)
				: null,
			rateUnitCode: this.AddEditRequisitionLibrary.controls['rateUnit'].value.Value,
			rateTypeCode: this.AddEditRequisitionLibrary.controls['rateType'].value,
			reqLibraryBenefitAdders: this.getBenefitAddersToUpdate(),
			reqLibraryAdditionalDetail: {
				reqLibraryAdditionalDetailId: this.requisitionLibrary.ReqLibraryAdditionalDetailId,
				positionDesc: this.AddEditRequisitionLibrary.controls['positionDesc'].value.trim(),
				skillDesc: this.AddEditRequisitionLibrary.controls['skillReq'].value.trim(),
				educationDesc: this.AddEditRequisitionLibrary.controls['EducationReq'].value.trim(),
				experienceDesc: this.AddEditRequisitionLibrary.controls['ExperienceReq'].value.trim()
			},
			reasonForChange: this.reasonForChange,
			UdfFieldRecords: this.udfData
		};
		this.requisition.updateRequisitionLibrary(reqlibData)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (data: ApiResponseBase) => {
					this.toasterServc.resetToaster();
					if (data.StatusCode == HttpStatusCode.Ok) {
						this.eventLog.isUpdated.next(true);
						this.commonService.resetAdvDropdown(this.entityId);
						this.toasterServc.showToaster(ToastOptions.Success, 'ReqLibrarySaveSuccessfully');
						this.loadRequisitionLibraryData();
						this.AddEditRequisitionLibrary.markAsPristine();
					} else {
						this.toasterServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					}

				}
			});
	}

	ngOnDestroy(): void {
		if (this.isEditMode || this.conflictData) {
			this.toasterServc.resetToaster();
		}
		this.conflictData = false;
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

}

