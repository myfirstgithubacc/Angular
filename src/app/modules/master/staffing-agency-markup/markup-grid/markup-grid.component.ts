import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { MarkupService } from '../services/markup.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { AddEditComponent } from '../add-edit/add-edit.component';
import { Subject, takeUntil } from 'rxjs';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { BaseMarkupConfig, LaborCategoryMarkup, LocationMarkup, LocationMarkupControl, MarkupSearchData, SectorMarkup, StaffingTier, markupEnum } from '../enum/enum';
import { chevronDownDimension, chevronUpDimension, chevronRightDimension} from '@xrm-shared/icons/xrm-icon-library/xrm-icon-library.component'
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
@Component({selector: 'app-markup-grid',
	templateUrl: './markup-grid.component.html',
	styleUrls: ['./markup-grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class MarkupGridComponent implements OnInit, OnChanges, OnDestroy {
	//UI Icons
	public chevronDown = chevronDownDimension;
	public chevronUp = chevronUpDimension;
	public chevronRight = chevronRightDimension;
	@Input() markupSearchData : MarkupSearchData;
	@Input() markupResult : MarkupSearchData;
	@Input() appliedFilterCount: number = magicNumber.zero;
	@Input() selectedStaffingValue : StaffingTier;
	@Output() onChange: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
	@Input() isonClickRecruitedMspFee: boolean = false;
	public MarkupConfigForm: FormGroup;
	public isViewOnly: boolean = false;
	public isMarkupLength: boolean = false;
	public mobileViewSize: boolean = false;
	private collapsedRows: number[] = [];
	private indexArr: number[] = [];
	private collapsedRows2: number[] = [];
	private tierLevelRequiredMessageKey = markupEnum.PleaseSelectTierLevel;
	private markupData: BaseMarkupConfig[] = [];
	private indexChangeArr:number[] = [];
	private unsubscribe$: Subject<void> = new Subject<void>();
	private sectorDetails: { OTMultiplier?: number; DTMultiplier?: number };

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private markupService: MarkupService,
    private customValidator: CustomValidators,
	private eventLogService: EventLogService,
	private addEditComp: AddEditComponent,
	public localizationService: LocalizationService,
	private cd : ChangeDetectorRef
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['markupSearchData'].currentValue) {
			this.markupSearchData = changes['markupSearchData'].currentValue;
			this.markupSearchData.StaffingTier = this.markupSearchData.StaffingTier.map((x: StaffingTier) => {
				x.Value = Number(x.Value);
				return x;
			});
			this.isMarkupLength = this.markupSearchData.baseMarkupConfigs.length > parseInt(`${magicNumber.zero}`);
			this.initializeForm();
			this.cd.markForCheck();
		}
	}

	ngOnInit(): void {
		this.initializeForm();
		this.checkMediaQuery();
	}

	@HostListener('window:resize', ['$event'])
	onResize(): void {
		this.checkMediaQuery();
	}

	checkMediaQuery(): void {
		this.mobileViewSize = window.innerWidth <= parseInt(`${magicNumber.nineHundredTwenty}`);
	}

	private initializeForm(): void {
		this.MarkupConfigForm = this.fb.group({
			baseMarkupConfigs: this.fb.array([])
		});
		this.onChange.emit(this.MarkupConfigForm);
		this.markupService.addForm.next(this.MarkupConfigForm);
		this.initiFormArray();
	}


	get markupConfigForm(): FormArray {
		return this.MarkupConfigForm.get('baseMarkupConfigs') as FormArray;
	}

	toggleRow(parentItemId: SectorMarkup) {
		if (this.isCollapsed(parentItemId.SectorId)) {
			this.collapsedRows = this.collapsedRows.filter((id) =>
				id !== parentItemId.SectorId);
			return;
		}
		this.collapsedRows.push(parentItemId.SectorId);
	}

	isExpanded(parentItemId: SectorMarkup): boolean {
		return this.collapsedRows.includes(parentItemId.SectorId);
	}

	isCollapsed(parentItemId: number): boolean {
		return this.collapsedRows.includes(parentItemId);
	}

	toggleRow2(parentItemId: LaborCategoryMarkup): void {
		if (this.isCollapsed2(parentItemId.LaborCategoryId)) {
			this.collapsedRows2 = this.collapsedRows2.filter((id) =>
				id !== parentItemId.LaborCategoryId);
			return;
		}
		this.collapsedRows2.push(parentItemId.LaborCategoryId);
	}

	isExpanded2(parentItemId: LaborCategoryMarkup): boolean {
  		return this.collapsedRows2.includes(parentItemId.LaborCategoryId);
	}

	isCollapsed2(parentItemId: number): boolean {
  		return this.collapsedRows2.includes(parentItemId);
	}

	private initiFormArray() {
  		this.markupSearchData.baseMarkupConfigs.forEach((x: BaseMarkupConfig) => {
  		(this.MarkupConfigForm.get("baseMarkupConfigs") as FormArray).push(this.fb.group({
  				RecruitedMspFee: [x.RecruitedMspFee, [this.customValidator.RangeValidator(magicNumber.zero, magicNumber.hundred, 'RecruitedLiMspFeeCannotBeGreaterThan')]],
  				PayrolledMspFee: [x.PayrolledMspFee, [this.customValidator.RangeValidator(magicNumber.zero, magicNumber.hundred, 'PayrollMspFeeCannotBeGreaterThan')]],
  				SectorId: [x.SectorId],
  				laborCategoryMarkups: this.fb.array([])
  			}));

  	});
  	this.addLaborCategoryFormControls();
	}

	get markupConfig(): FormArray {
		return this.MarkupConfigForm.get('baseMarkupConfigs') as FormArray;
	}

	private addLaborCategoryFormControls() {
		this.markupSearchData.baseMarkupConfigs.forEach((x: BaseMarkupConfig, index: number) => {
			x.laborCategoryMarkups.forEach((y: LaborCategoryMarkup) => {
				const validators: ValidatorFn[] = [],
					laborCategoryMarkups = this.markupConfig.at(index).get('laborCategoryMarkups') as FormArray;
				if (y.BroadCastAllowed) {
					validators.push(this.customValidator.RequiredValidator(this.tierLevelRequiredMessageKey));
				};
				laborCategoryMarkups.push(this.fb.group({
					LaborCategoryName: [y.LaborCategoryName],
					BroadCastAllowed: [y.BroadCastAllowed],
					RecruitedMarkup: [y.RecruitedMarkup, [this.customValidator.RangeValidator(magicNumber.zero, magicNumber.hundred, 'RecruitedMarkupShouldBeBetween')]],
					RecruitedMspFee: [y.RecruitedMspFee, [this.customValidator.RangeValidator(magicNumber.zero, magicNumber.hundred, 'RecruitedLiMspFeeCannotBeGreaterThan')]],
					PayrolledMarkup: [y.PayrolledMarkup, [this.customValidator.RangeValidator(magicNumber.zero, magicNumber.hundred, 'PayrollMarkupShouldBeBetween')]],
					PayrolledMspFee: [y.PayrolledMspFee, [this.customValidator.RangeValidator(magicNumber.zero, magicNumber.hundred, 'PayrollMspFeeCannotBeGreaterThan')]],
					OtMultiplier: [y.OtMultiplier, [this.MaxLengthValidatorOt, this.customValidator.RangeValidator(magicNumber.zero, magicNumber.ten, 'OtMultiplierShouldBeLessThan')]],
					DtMultiplier: [y.DtMultiplier, [this.MaxLengthValidatorDt, this.customValidator.RangeValidator(magicNumber.zero, magicNumber.ten, 'DtMultiplierShouldBeLessThan')]],
					LaborCategoryId: [y.LaborCategoryId],
					TierLevel: [y.TierLevel, validators],
					StaffingAgencyMarkupId: [y.StaffingAgencyMarkupId],
					locationMarkups: this.fb.array([])
				}));
			});
		});
		this.addLocationFormControls();
	}

	private addLocationFormControls() {
  		this.markupSearchData.baseMarkupConfigs.forEach((x: BaseMarkupConfig, index: number) => {
  		x.laborCategoryMarkups.forEach((y: LaborCategoryMarkup, index2: number) => {
  			y.locationMarkups?.forEach((z: LocationMarkup, i: number) => {
					const validators: ValidatorFn[] = [],
						locationMarkups = this.getLocationMarkup(index, index2);
  				if (z.BroadCastAllowed) {
  				validators.push(this.customValidator.RequiredValidator(this.tierLevelRequiredMessageKey));
					}
					locationMarkups.push(this.fb.group({
          		BroadCastAllowed: [z.BroadCastAllowed],
          		LocationName: [z.LocationName],
          		ActualRecruitedMarkupAdder: [magicNumber.zeroToThreeDecimal],
          		RecruitedMarkupAdder: [z.RecruitedMarkupAdder, [this.customValidator.RangeValidator(-magicNumber.nineHundrednintyNine, magicNumber.nineHundrednintyNine, 'MarkupShouldBeBetween')]],
          		ActualPayrolledMarkupAdder: [magicNumber.zeroToThreeDecimal],
          		PayrolledMarkupAdder: [z.PayrolledMarkupAdder, [this.customValidator.RangeValidator(-magicNumber.nineHundrednintyNine, magicNumber.nineHundrednintyNine, 'MarkupShouldBeBetween')]],
          		LocationId: [z.LocationId],
          		StaffingAgencyMarkupAdderId: [z.StaffingAgencyMarkupAdderId],
          		TierLevel: [z.TierLevel, validators]
					}));
					// eslint-disable-next-line one-var
					const broadCastAllowedControl = (locationMarkups.at(i) as FormGroup).get('BroadCastAllowed');
					if (broadCastAllowedControl) {
						if (!y.BroadCastAllowed) {
						  broadCastAllowedControl.disable();
						} else {
						  broadCastAllowedControl.enable();
						}
					  }
					this.getRecruitedMarkupAdder(index, index2, i);
					this.getPayrolledMarkupAdder(index, index2, i);

  			});

  		});
  	});

	}

	getLocationMarkup(index:number, index1:number){
		return (this.markupConfig.at(index).get('laborCategoryMarkups') as FormArray).at(index1).get('locationMarkups') as FormArray;
	}

	getLaborCatgeoryMarkup(index:number){
		return this.markupConfig.at(index).get('laborCategoryMarkups') as FormArray;
	}

	public getMarkup(e: Event, i: number, i1: number) {
		const recruitedMarkupControl = this.getLaborCatgeoryMarkup(i).at(i1).get('RecruitedMarkup') as FormControl,
			locationMarkupsArray = this.getLaborCatgeoryMarkup(i).at(i1).get('locationMarkups') as FormArray;
		recruitedMarkupControl.setValue(e);
		locationMarkupsArray.controls.forEach((control, i2) => {
			this.getRecruitedMarkupAdder(i, i1, i2);
		});
	}

	public getPayroll(e: Event, i: number, i1: number) {
		const payrollControl = (this.getLaborCatgeoryMarkup(i)).at(i1).get('PayrolledMarkup') as FormControl,
			locationMarkupsArray = this.getLaborCatgeoryMarkup(i).at(i1).get('locationMarkups') as FormArray;
		payrollControl.setValue(e);
		locationMarkupsArray.controls.forEach((control, i2) => {
			this.getPayrolledMarkupAdder(i, i1, i2);
		});
	}

	public getRecruitedMarkupAdder(i: number, i1: number, i2: number) {
		const recruitedMarkupValue = ((this.getLaborCatgeoryMarkup(i)).at(i1).get('RecruitedMarkup') as FormControl).value,
			b = (this.getLocationMarkup(i, i1).at(i2).get('RecruitedMarkupAdder') as FormControl).value;
			 (this.getLocationMarkup(i, i1).at(i2).get('ActualRecruitedMarkupAdder') as FormControl).setValue((recruitedMarkupValue + b).toFixed(magicNumber.three));
	}

	public getPayrolledMarkupAdder(i: number, i1: number, i2: number) {
		const payrollVal = ((this.getLaborCatgeoryMarkup(i)).at(i1).get('PayrolledMarkup') as FormControl).value,
			b = (this.getLocationMarkup(i, i1).at(i2).get('PayrolledMarkupAdder') as FormControl).value;
		(this.getLocationMarkup(i, i1).at(i2).get('ActualPayrolledMarkupAdder') as FormControl).setValue((payrollVal + b).toFixed(magicNumber.three));
	}

	public changeBroadcastLab(i: number, i1: number, event: Event) {
		const sectId = this.markupConfig.controls[i].value?.SectorId,
			tierLevelLaborControl = (this.getLaborCatgeoryMarkup(i)).at(i1).get('TierLevel') as FormControl,
			locationMarkupArray = this.getLocationMarkup(i, i1),
			broadcastLaborControl = (this.getLaborCatgeoryMarkup(i)).at(i1).get('BroadCastAllowed') as FormControl;
		  locationMarkupArray.controls.forEach((locationMarkup, index) => {
			locationMarkup.get('BroadCastAllowed')?.setValue(event);
			const tierLevelLocationControl = locationMarkup.get('TierLevel');
			if(broadcastLaborControl.value){
				tierLevelLocationControl?.markAllAsTouched();
				tierLevelLocationControl?.setValidators([this.customValidator.RequiredValidator(this.tierLevelRequiredMessageKey)]);
			}else{
				(locationMarkupArray.at(index) as FormGroup).get('BroadCastAllowed')?.disable();
				tierLevelLocationControl?.clearValidators();
			}
			tierLevelLocationControl?.updateValueAndValidity();
		});

		if(broadcastLaborControl.value){
			this.getLaborCatgeoryMarkup(i).controls[i1].enable();
			tierLevelLaborControl.markAllAsTouched();
			tierLevelLaborControl.setValidators([this.customValidator.RequiredValidator(this.tierLevelRequiredMessageKey)]);
			this.getDefaultOtDtValuesForSector(sectId, i, i1);
		}else{
			tierLevelLaborControl.clearValidators();
		}
		tierLevelLaborControl.updateValueAndValidity();
	}


	public changeLocationBroadcastLab(event: Event, params: { i: number, labcatInd: number, locationindex: number}) {
		const tierLevelControl = this.getLocationControl(params.i, params.labcatInd, params.locationindex).get('TierLevel') as FormControl,
			broadcastLocationControl = this.getLocationControl(params.i, params.labcatInd, params.locationindex).get('BroadCastAllowed') as FormControl;
		if(broadcastLocationControl.value){
			tierLevelControl.markAllAsTouched();
			tierLevelControl.setValidators([this.customValidator.RequiredValidator(this.tierLevelRequiredMessageKey)]);
		}else{
			tierLevelControl.clearValidators();
		}
		tierLevelControl.updateValueAndValidity();
	}

	public onClickRecruitedMspFee(i: number) {
		this.markupService.isCopy.next(true);
		this.markupConfig.controls[i].get('RecruitedMspFee');
		const controlName = this.markupConfig.controls[i].get('RecruitedMspFee') as FormControl;
		if(controlName.valid){
			const recruitedMspFeeVal = controlName.value;
			this.getLaborCatgeoryMarkup(i).controls.forEach((a) => {
				a.get('RecruitedMspFee')?.setValue(recruitedMspFeeVal);
			});
		}
		this.markupService.addForm.next(this.MarkupConfigForm);
	}

	public changeRecruitedMspFee(e: Event, index: number) {
		(this.markupConfig.controls[index].get('RecruitedMspFee') as FormControl).setValue(Number(e));
	}

	public onClickPayrolledMspFee(i: number) {
		this.markupService.isCopy.next(true);
		const controlName = this.markupConfig.controls[i].get('PayrolledMspFee') as FormControl;
		if(controlName.valid){
			const payrolledMspFeeMspFeeVal = controlName.value;
			this.getLaborCatgeoryMarkup(i).controls.forEach((a) => {
				a.get('PayrolledMspFee')?.setValue(payrolledMspFeeMspFeeVal);
			});
		}
		this.markupService.addForm.next(this.MarkupConfigForm);
	}

	public changePayrolledMspFee(e: Event, i: number) {
		(this.markupConfig.controls[i].get('PayrolledMspFee') as FormControl).setValue(Number(e));
	}

	public onLabCatTierChange(e: Event, i: number, i1: number) {
  		this.getLocationMarkup(i, i1).controls.forEach((x) => {
  		x.get('TierLevel')?.setValue(e);
  	});

	}

	public getSectorControl(index: number) {
  		const myArray = this.MarkupConfigForm.get('baseMarkupConfigs') as FormArray;
  		return myArray.at(index) as FormGroup;
	}

	public getLaborCategoryControl(sectorIndex: number, laborCategoryIndex: number) {
  		return this.getLaborCatgeoryMarkup(sectorIndex).controls[laborCategoryIndex] as FormGroup;
	}

	public getLocationControl(sectorIndex: number, laborCategoryIndex: number, locationIndex: number) {
  		return this.getLocationMarkup(sectorIndex, laborCategoryIndex).controls[locationIndex] as FormGroup;
	}

	public submitForm() {
		this.MarkupConfigForm.markAllAsTouched();
		if (!this.MarkupConfigForm.valid) {
			this.onChange.emit(this.MarkupConfigForm);
			this.baseMarkupConfigs();
		}else{
			this.processlocationMarkups();
			this.saveAndUpdateData();
		}
	}

	public baseMarkupConfigs(){
		const baseMarkupConfigs = this.MarkupConfigForm.get('baseMarkupConfigs') as FormArray;
		for (const sector of baseMarkupConfigs.controls) {
			if (sector.valid) {
				continue;
			}

			const sectorControls = (sector as FormGroup).controls,
				sectorObj = { SectorId: sectorControls['SectorId'].value },
				laborCategoryMarkups = sectorControls['laborCategoryMarkups'] as FormArray;

			if (!this.isCollapsed(sectorObj.SectorId)) {
				this.toggleRow(sectorObj);
				this.isExpanded(sectorObj);
			}

			for (const laborCategory of laborCategoryMarkups.controls) {
				if (laborCategory.valid) {
					continue;
				}

				const laborCategoryControls = (laborCategory as FormGroup).controls,
					  laborCategoryObj: LaborCategoryMarkup = {
						LaborCategoryId: Number(laborCategoryControls['LaborCategoryId'].value)
					  };
				if (!this.isCollapsed2(laborCategoryObj.LaborCategoryId)) {
					this.toggleRow2(laborCategoryObj);
					this.isExpanded2(laborCategoryObj);
				}
			}
		}
	}

	private processlocationMarkups() {
		const baseMarkupConfigsArray = this.MarkupConfigForm.get('baseMarkupConfigs') as FormArray;
		  baseMarkupConfigsArray.controls.forEach((sector) => {
			const sectorGroup = sector as FormGroup,
				laborCategoryMarkupsArray = sectorGroup.get('laborCategoryMarkups') as FormArray;
			if (!sectorGroup.controls['PayrolledMspFee'].value) {
			  sectorGroup.controls['PayrolledMspFee'].setValue(magicNumber.zero);
			}
			if (!sectorGroup.controls['RecruitedMspFee'].value) {
			  sectorGroup.controls['RecruitedMspFee'].setValue(magicNumber.zero);
			}
 	this.processlaborCategoryMarkups(laborCategoryMarkupsArray.controls);

		  });
	  }

	private processlaborCategoryMarkups(laborCategoryMarkups: AbstractControl[]): void {
		for (const laborCategory of laborCategoryMarkups) {
		  const locationMarkups = (laborCategory.get('locationMarkups') as FormArray).controls as LocationMarkupControl[],
		  laborCategoryRecMspFee = laborCategory.get('RecruitedMspFee') as FormControl | null,
		  laborCategoryPayrollMspFee = laborCategory.get('PayrolledMspFee') as FormControl | null,
		  laborCategoryOtMultiplier = laborCategory.get('OtMultiplier') as FormControl | null,
		  laborCategoryDtMultiplier = laborCategory.get('DtMultiplier') as FormControl | null;

		  if (!laborCategoryRecMspFee?.value) laborCategoryRecMspFee?.setValue(magicNumber.zero);
		  if (!laborCategoryPayrollMspFee?.value) laborCategoryPayrollMspFee?.setValue(magicNumber.zero);
		  if (!laborCategoryOtMultiplier?.value) laborCategoryOtMultiplier?.setValue(magicNumber.zero);
		  if (!laborCategoryDtMultiplier?.value) laborCategoryDtMultiplier?.setValue(magicNumber.zero);

		  for (const location of locationMarkups) {
				this.setRecruitedPayrolledMarkupAdderToZero(location);
		  }
		}
	  }


	private setRecruitedPayrolledMarkupAdderToZero(location: FormGroup) {
		const recruitedMarkupAdder = location.get('RecruitedMarkupAdder'),
			payrolledMarkupAdder = location.get('PayrolledMarkupAdder');

		if (!recruitedMarkupAdder?.value) {
			recruitedMarkupAdder?.setValue(magicNumber.zero);
		}
		if(!payrolledMarkupAdder?.value) payrolledMarkupAdder?.setValue(magicNumber.zero);
	}

	private saveAndUpdateData() {
		if(this.appliedFilterCount > parseInt(`${magicNumber.zero}`)){
			this.updateDataOnFilterApply();
		}
		this.markupData = this.mapData(this.MarkupConfigForm.value.baseMarkupConfigs);
		const markupObj = {
			staffingAgencyUkey: this.markupSearchData.StaffingAgencyUkey,
			baseMarkupConfigs: this.filteredData(this.markupData),
			UKey: this.markupSearchData.StaffingAgencyUkey
		};
		this.markupService.updateStaffingMarkup(markupObj).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponse) => {
			if(res.Succeeded){
				this.addEditComp.onStaffingAgencyChange(this.selectedStaffingValue);
				this.eventLogService.isUpdated.next(true);
				this.markupService.isCopy.next(false);
				this.markupService.updateSuccess.next({
					isSuccess: true,
					message: 'StaffingAgencyMarkupSavedSuccessfully'
				  });
			}
			this.markupService.isEditMode.next(true);
		});
	}

	mapData(data: BaseMarkupConfig[]) {
		data.map((e:BaseMarkupConfig) => {
	   e.PayrolledMspFee = Number(e.PayrolledMspFee).toFixed(magicNumber.three);
	   e.RecruitedMspFee = Number(e.RecruitedMspFee).toFixed(magicNumber.three);
	   if(Number(e.laborCategoryMarkups.length) > Number(magicNumber.zero)){
		   e.laborCategoryMarkups.map((e2:LaborCategoryMarkup) => {
			   e2.PayrolledMarkup = Number(e2.PayrolledMarkup).toFixed(magicNumber.three);
			   e2.PayrolledMspFee = Number(e2.PayrolledMspFee).toFixed(magicNumber.three);
			   e2.RecruitedMarkup = Number(e2.RecruitedMarkup).toFixed(magicNumber.three);
			   e2.RecruitedMspFee = Number(e2.RecruitedMspFee).toFixed(magicNumber.three);
			   e2.OtMultiplier = Number(e2.OtMultiplier).toFixed(magicNumber.four);
			   e2.DtMultiplier = Number(e2.DtMultiplier).toFixed(magicNumber.four);
			   if(Number(e2.locationMarkups?.length) > Number(magicNumber.zero)){
				   e2.locationMarkups?.map((e3:LocationMarkup) => {
					   e3.ActualPayrolledMarkupAdder = Number(e3.ActualPayrolledMarkupAdder).toFixed(magicNumber.three);
					   e3.ActualRecruitedMarkupAdder = Number(e3.ActualRecruitedMarkupAdder).toFixed(magicNumber.three);
					   e3.PayrolledMarkupAdder = Number(e3.PayrolledMarkupAdder).toFixed(magicNumber.three);
					   e3.RecruitedMarkupAdder = Number(e3.RecruitedMarkupAdder).toFixed(magicNumber.three);
					   e3.LaborCategoryId = e2.LaborCategoryId;

				   });
			   }

		   });
	   }
	   return e;
		});
		return data;

	}

	filteredData(data:BaseMarkupConfig[]) {
		data = data.filter((d: BaseMarkupConfig) =>
			d.laborCategoryMarkups.length > Number(magicNumber.zero));
		data = data.map((d: BaseMarkupConfig) => {
			d.laborCategoryMarkups = d.laborCategoryMarkups.filter((record: LaborCategoryMarkup) => {
				return this.filterRecord(record);
			});
			return d;
		});
		return data.filter((e:BaseMarkupConfig) => {
			return e.laborCategoryMarkups.length > Number(magicNumber.zero);
		});

	}

	  filterRecord(record: LaborCategoryMarkup): boolean {
		if (record.locationMarkups && (record.locationMarkups.length > Number(magicNumber.zero))) {
			record.locationMarkups = record.locationMarkups.filter((d: LocationMarkup) => {
				return this.filterlocationMarkups(d);
			});
		}
		let hasValueGreaterThanZero = false;
		for (const key in record) {
			if ((key === 'BroadCastAllowed' && record[key] === true) ||
						 (key !== 'LaborCategoryId' && key !== 'LaborCategoryName' && Number(record[key]) > parseInt(`${magicNumber.zero}`)) ||
						  (record.locationMarkups && record.locationMarkups.length > parseInt(`${magicNumber.zero}`))) {
				hasValueGreaterThanZero = true;
				break;
			}
		}
		return hasValueGreaterThanZero;
	}

	filterlocationMarkups(d: LocationMarkup) {
		let hasValueGreaterThanZero = false;
		for (const key in d) {
			if ((key === 'BroadCastAllowed' && d[key]) ||
						 (key !== 'LocationId' && key!== 'LaborCategoryId' && key!== 'ActualPayrolledMarkupAdder' && key!== 'ActualRecruitedMarkupAdder' && Number(d[key]) > parseInt(`${magicNumber.zero}`))) {
				hasValueGreaterThanZero = true;
				break;
			}
		}
		return hasValueGreaterThanZero;
	}


	updateDataOnFilterApply(): void {
		this.MarkupConfigForm.value.baseMarkupConfigs = this.markupResult.baseMarkupConfigs.map((dt: BaseMarkupConfig) => {
		  const existingConfig = this.MarkupConfigForm.value.baseMarkupConfigs.find((val: BaseMarkupConfig) =>
				val.SectorId === dt.SectorId);
		  if (existingConfig) {
				existingConfig.laborCategoryMarkups = this.maplaborCatData(dt.laborCategoryMarkups, existingConfig.laborCategoryMarkups);
				return existingConfig;
		  }
		  return dt;
		});
	  }


	maplaborCatData(data: LaborCategoryMarkup[], val: LaborCategoryMarkup[]): LaborCategoryMarkup[] {
		return data.map((dt2) => {
		  const matchingLaborCategory = val.find((lab) =>
				lab.LaborCategoryId === dt2.LaborCategoryId);
		  return matchingLaborCategory ?? dt2;
		});
	}

	getValue(index:number){
		const data = this.MarkupConfigForm.get('baseMarkupConfigs') as FormArray;
		      this.indexArr = [];
		data.controls.forEach((d:AbstractControl, index1:number) => {
			if(!d.valid){
				this.indexArr.push(index1);
			}
			if(!d.pristine){
				this.indexChangeArr.push(index1);
			}
		});
		if(this.indexArr.includes(index)){
			return String('card card--error');
		}
			 else{
			return String('card card--info');
		}

	}

	private getDefaultOtDtValuesForSector(Sectorid: number, a: number, a1: number){
		this.markupService.getDefaultOtDtValFromSector(Sectorid).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponse) => {
			if(res.Succeeded){
				this.sectorDetails = res.Data;
				const otControlName = this.getLaborCategoryControl(a, a1).get('OtMultiplier') as FormControl,
					dtControlName = this.getLaborCategoryControl(a, a1).get('DtMultiplier') as FormControl;
				if(otControlName.value === magicNumber.zero || otControlName.value == undefined || otControlName.value == null ){
					otControlName.patchValue(this.sectorDetails.OTMultiplier);
				}
				if(dtControlName.value === magicNumber.zero || dtControlName.value == undefined || dtControlName.value == null){
					dtControlName.patchValue(this.sectorDetails.DTMultiplier);
				}
			}
		});
	}

	MaxLengthValidatorOt(control: AbstractControl) {
		const otvalue = control.parent?.get('OtMultiplier')?.value,
					 broadValue = control.parent?.get('BroadCastAllowed')?.value;

		if(broadValue){
			if (otvalue == undefined || otvalue == null) return { error: true, message: 'PleaseenterOTMulitplier' };

			if (otvalue <= magicNumber.zero ) return { error: true, message: 'OTMulitpliercannotbeZero' };
		}else{
			control.parent?.get('OtMultiplier')?.setErrors(null);
		}
		return null;
	}

	MaxLengthValidatorDt(control: AbstractControl) {
		const dtvalue = control.parent?.get('DtMultiplier')?.value,
					 broadValue = control.parent?.get('BroadCastAllowed')?.value;

		if(broadValue){
			if (dtvalue == undefined || dtvalue == null) return { error: true, message: 'PleaseenterDTMulitplier'};
			if (dtvalue <= magicNumber.zero ) return { error: true, message: 'DTMulitpliercannotbeZero' };
		}
		else{
			control.parent?.get('DtMultiplier')?.setErrors(null);
		}
		return null;
	}
	openItem(comboBox: any): void {
		comboBox.toggle(true);
	  }

	ngOnDestroy(): void {
		this.markupService.updateSuccess.next({
			isSuccess: false,
			message: ''
		  });
		this.markupService.isCopy.next(false);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
