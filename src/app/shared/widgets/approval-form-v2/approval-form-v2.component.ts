/* eslint-disable one-var */
import { Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges, ChangeDetectorRef, ElementRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ExpansionPanelActionEvent } from '@progress/kendo-angular-layout';
import { formInitialization } from '@xrm-master/approval-configuration/approval-function';
import { ApprovalConfigUser, RadioGroup, ApproverType, DataStatus, Level, LevelApprover, SetupApprovalformValue, Sublevel, ValidationConfig, IndexObj, ControlsData, ControlNames, ExceptionApprovalFormGroup } from '@xrm-master/approval-configuration/constant/enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil} from 'rxjs';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';

@Component({selector: 'app-approval-form-v2',
	templateUrl: './approval-form-v2.component.html',
	styleUrls: ['./approval-form-v2.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ApprovalFormV2Component implements OnDestroy{
	public approvalConfigForm: FormGroup;
	@Input() approverDropDownDataObj: ApprovalConfigUser;
	@Input() setupApprovalData:ApproverType[];
	@Input() isEdit: boolean = false;
	@Input() editData :LevelApprover[];
	@Input() approverByData :IDropdownOption[] = [];
	@Output() getApprovalConfigForm: EventEmitter<SetupApprovalformValue> = new EventEmitter<SetupApprovalformValue>();
	@Output() approvalForm: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
	private ngUnsubscribe$: Subject<void> = new Subject<void>();
	public approvalData: any;
	public excPercVal: number;
	public user:IDropdownOption[];
	private previousFormValue: SetupApprovalformValue;
	private currentFormValue: SetupApprovalformValue;
	public numericWords = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
	public radioGroup = RadioGroup;

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private customValidators: CustomValidators,
		private toasterServc: ToasterService,
		private approvalConfigServc: ApprovalConfigurationGatewayService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.approvalConfigForm = this.fb.group({
			approvalFormArray: this.fb.array([this.addNewApproval()])
		});
		this.approvalForm.emit(this.approvalConfigForm);
		this.currentFormValue = { ...this.approvalConfigForm.value };
		this.cdr.detectChanges();
		this.previousFormValue = { ...this.approvalConfigForm.value };
		 this.approvalConfigServc.isWorkFlowChanged.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data) => {
			if(data){
				this.approvalFormArray.clear();
				this.approvalFormArray.push(this.addNewApproval());
				this.cdr.detectChanges();
			}
		});
		this.approvalConfigServc.isSectorChanged.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((sec:DataStatus) => {
			if(sec.status){
				this.approvalFormArray.controls.forEach((userGroup) => {
					const subApprovalArray = userGroup.get('subApproval') as FormArray;
					subApprovalArray.controls.forEach((subGroup) => {
						const approvertypeId = subGroup.get('ApproverTypeId')?.value?.Value ?? subGroup.get('ApproverTypeId')?.value;
						if(approvertypeId == magicNumber.six){
							subGroup.get('UserId')?.setValue(null);
							subGroup.get('UserId')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectUser'));
							subGroup.get('UserId')?.updateValueAndValidity();
							this.approvalFormArray.markAllAsTouched();
						}
					});
				  });
			}
			if(sec.data.length> Number(magicNumber.zero)){
				this.approverDropDownDataObj.user = sec.data;
				this.user = this.approverDropDownDataObj.user;
			}
			this.cdr.detectChanges();
		});

		this.approvalConfigServc.isSubmitForm.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data) => {
			if(data){
				this.approvalFormArray.markAllAsTouched();
				this.cdr.detectChanges();
			}
		});

		this.approvalConfigForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data) => {
			if(data){
				this.currentFormValue = { ...this.approvalConfigForm.value };
			}
		});
	}

	ngDoCheck() {
		if (JSON.stringify(this.currentFormValue) !== JSON.stringify(this.previousFormValue)) {
			this.getApprovalConfigForm.emit(this.approvalConfigForm.value);
			this.approvalForm.emit(this.approvalConfigForm);
			this.cdr.detectChanges();
			this.previousFormValue = { ...this.currentFormValue };
		}
		this.cdr.markForCheck();

	  }

	ngAfterViewInit() {
		if(this.isEdit && this.editData.length > Number(magicNumber.zero)) {
			this.getFormData(this.editData);
			this.cdr.markForCheck();
		}

	}

	  ngOnChanges(changes: SimpleChanges) {
		if(this.isEdit && this.editData.length > Number(magicNumber.zero)) {
			this.getFormData(this.editData);
			this.cdr.markForCheck();

		}
	  }


	public getFormData(data: LevelApprover[]) {
		const datatransform = this.transformData(data);
		this.approvalFormArray.clear();
		datatransform.forEach((levelItem:Level) => {
			const level1 = levelItem.level;
			let subApprovalCounter = Number(magicNumber.zero);
			this.approvalFormArray.push(this.addNewApproval());
			levelItem.sublevel.forEach((sublevel:Sublevel) => {
				if(level1 == sublevel.level && subApprovalCounter < levelItem.sublevel.length - Number(magicNumber.one)){
					this.subApproval(level1- magicNumber.one).push(this.newSubApproval());
					subApprovalCounter++;
				}
				const subApprovalArray = this.subApproval(level1- magicNumber.one).controls;
				const subApprovalGroup = subApprovalArray.at(Number(sublevel.sublevel) - magicNumber.one) as FormGroup;
					 subApprovalGroup.patchValue(sublevel.approverType);
					 subApprovalGroup.get('UserType')?.setValue(sublevel.approverType.UserTypId);
				subApprovalGroup.get('UserId')?.setValue(sublevel.approverType.Userid);
				const roleValue = sublevel.approverType.RolesDetail.map((e:any) => {
					e.Value = Number(e.Value);
					return e;
				});
				subApprovalGroup.get('RolesDetail')?.setValue(roleValue);
				this.setDynamicValidation(subApprovalGroup);
			});
	  });

	}

	private setDynamicValidation(subGroup:FormGroup){
		if(subGroup.get('UserId')?.value == null && subGroup.get('ApproverTypeId')?.value == magicNumber.six){
			subGroup.get('UserId')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectUser'));
			subGroup.get('UserId')?.updateValueAndValidity();
		}
		if(subGroup.get('RolesDetail')?.value == null && subGroup.get('ApproverTypeId')?.value == magicNumber.four){
			subGroup.get('RolesDetail')?.setValidators(this.customValidators.RequiredValidator('PleaseSelectRole'));
			subGroup.get('RolesDetail')?.updateValueAndValidity();
		}
	}

	private transformData(originalData:LevelApprover[]) {
		const transformedData:Level[] = [];
		originalData.forEach((item:LevelApprover ) => {
			const existingLevel = transformedData.find((dataItem:Level) =>
				dataItem.level === item.Level);

			if (existingLevel) {
				existingLevel.sublevel.push({level: item.Level, sublevel: item.SubLevel, approverType: item.ApproverType});
			} else {
				transformedData.push({
					level: item.Level,
					sublevel: [{level: item.Level, sublevel: item.SubLevel, approverType: item.ApproverType}]
				});
			}
		});

		return transformedData;
	}


	get approvalFormArray(): FormArray {
		return this.approvalConfigForm.get('approvalFormArray') as FormArray;
	}

	addNewApproval(): FormGroup {
		return this.fb.group({
			subApproval: this.fb.array([this.newSubApproval()])
		});
	}

	addApproval() {
		const control = this.approvalConfigForm.get('approvalFormArray') as FormArray;
		if(Number(control.length) < Number(magicNumber.five) && control.valid){
			this.approvalFormArray.push(this.addNewApproval());
		}
		else if (Number(control.length) > (Number(magicNumber.five)-magicNumber.one)) {
			this.toasterServc.showToaster(ToastOptions.Warning, "ReachedMaximumLimit");

		}
		else if(this.approvalFormArray.invalid){
			this.approvalFormArray.markAllAsTouched();
		}
	}

	public removeApproval(approvalIndex: number) {
		this.approvalConfigForm.markAsDirty();
		this.approvalFormArray.removeAt(approvalIndex);
	}

	public subApproval(approvalIndex: number): FormArray {
		return this.approvalFormArray
			.at(approvalIndex)
			.get('subApproval') as FormArray;
	}

	private newSubApproval(): FormGroup {
		return formInitialization(this.fb, this.customValidators);
	}

	public onSpecificUserChange(data:{Value:string | number}, approvalIndex:number, subApprovalIndex:number){
		const controlName = this.getControlName(approvalIndex, subApprovalIndex, 'UserId');
		controlName.setValue(data.Value);
		if (data.Value) {
			controlName.clearValidators();
			controlName.updateValueAndValidity();
		}
		else{
			controlName.setValidators(this.customValidators.RequiredValidator('PleaseSelectUser'));
			controlName.updateValueAndValidity();
		}
	}

	onUserTypeChange(data:{Value:string | number}, approvalIndex:number, subApprovalIndex:number){
		const controlName = this.getControlName(approvalIndex, subApprovalIndex, 'UserTypId');
		controlName.setValue(data.Value);
		if(data.Value){
			controlName.clearValidators();
			controlName.updateValueAndValidity();
		}
		else{
			controlName.setValidators(this.customValidators.RequiredValidator('PleaseSelectUserType'));
			controlName.updateValueAndValidity();
		}
	}

	addSubApproval(approvalIndex: number) {
		const subControl = this.getSubApproval(approvalIndex);
		if(Number(subControl.controls.length) <= (Number(magicNumber.ten)-magicNumber.one)
			 && this.approvalFormArray.valid){
			if(this.subApproval(approvalIndex).controls[subControl.controls.length-magicNumber.one]?.get('Condition')?.value == null){
				this.subApproval(approvalIndex).controls[subControl.controls.length-magicNumber.one]?.get('Condition')?.setValidators(this.customValidators.RequiredValidator('ChooseAnOption'));
				this.subApproval(approvalIndex).controls[subControl.controls.length-magicNumber.one]?.get('Condition')?.updateValueAndValidity();
				this.subApproval(approvalIndex).push(this.newSubApproval());
				this.approvalFormArray.markAsUntouched();
			}

			if(this.subApproval(approvalIndex).controls[subControl.controls.length-magicNumber.one]?.get('Condition')?.value != null){
				this.subApproval(approvalIndex).push(this.newSubApproval());
				this.approvalFormArray.markAsUntouched();
			}

		}
		else if (Number(subControl.length) >= (Number(magicNumber.ten)-magicNumber.one)) {
			this.toasterServc.showToaster(ToastOptions.Warning, "ReachedMaximumLimit");

		}
		else if(this.approvalFormArray.invalid){
			this.approvalFormArray.markAllAsTouched();
		}
	}

	public removeSubApproval(approvalIndex: number, subIndex: number) {
		const controlName = this.getControlName(approvalIndex, (subIndex), 'Condition');
		this.approvalConfigForm.markAsDirty();
		this.subApproval(approvalIndex).removeAt(subIndex);
		controlName.setValue(null);
		controlName.clearValidators();
		controlName.updateValueAndValidity();
	}

	public getSubApproval(approvalIndex: number): FormArray {
		return this.approvalFormArray.at(approvalIndex).get('subApproval') as FormArray;
	  }

	  public getControlName(approvalIndex: number, subIndex:number, controlName:string) {
		const dd = (this.approvalFormArray.at(approvalIndex).get('subApproval') as FormArray).at(subIndex) as FormGroup;
		return dd.controls[controlName] as FormControl;
	  }


	  public getControlValue(approvalIndex: number, subIndex:number, controlName:string){
		const dd = (this.approvalFormArray.at(approvalIndex).get('subApproval') as FormArray).at(subIndex) as FormGroup,
		 cc = dd.controls[controlName] as FormControl;
		return cc.value;
	  }

	public onApprovedByChange(data: {Value:string | number}, approvalIndex: number, subIndex:number) {
		 const controlName = this.getControlName(approvalIndex, subIndex, 'ApproverTypeId');
		   controlName.setValue(data.Value);
		   this.fundingBasedValueIsTrue(approvalIndex, 'ExceptionApprovalRequired');
		this.fundingBasedValueIsTrue(approvalIndex, 'FundingBasedRequired');
		   this.resetControlApproverChange(approvalIndex, subIndex);
		   this.VisibleExceptionApprover(data, approvalIndex, subIndex);
		   if (data.Value == magicNumber.four) {
		   	this.updateFormControl(approvalIndex, subIndex, {controlName: 'RolesDetail', shouldSetValidators: true, validatorMsg: 'PleaseSelectRole'});
		   } else {
		   	this.updateFormControl(approvalIndex, subIndex, {controlName: 'RolesDetail', shouldSetValidators: false});
		   }
		   if (data.Value == magicNumber.five) {
		   	this.updateFormControl(approvalIndex, subIndex, {controlName: 'UserTypId', shouldSetValidators: true, validatorMsg: 'PleaseSelectUserType'});
		   } else {
		   	this.updateFormControl(approvalIndex, subIndex, {controlName: 'UserTypId', shouldSetValidators: false});
		   }
		   if (data.Value == magicNumber.six) {
			this.getSpecificUser();
		   	this.updateFormControl(approvalIndex, subIndex, {controlName: 'UserId', shouldSetValidators: true, validatorMsg: 'PleaseSelectUser'});
		   }
		   else{
			this.getSpecificUser();
		   	this.updateFormControl(approvalIndex, subIndex, {controlName: 'UserId', shouldSetValidators: false});
		   }

	}

	public getSpecificUser(){
		this.approvalConfigServc.isSectorChanged.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((sec:DataStatus) => {
			this.approverDropDownDataObj.user = sec.data;
			this.user = this.approverDropDownDataObj.user;

		});
	}
	private setValidatorsAndUpdate(approvalIndex: number, subIndex:number, validation:ValidationConfig): void {
		const control= this.getControlName(approvalIndex, subIndex, validation.controlName);
		if (control) {
			control.setValidators(validation.validationFn(validation.message));
			control.updateValueAndValidity();
		}
	  }


	 private resetControlApproverChange(index: number, subIndex:number) {

		this.setValidatorsAndUpdate(index, subIndex, {controlName: 'ApproverTypeId', validationFn: this.customValidators.RequiredValidator, message: 'PleaseSelectOneToBeApprovedBy'});
		this.exceptionApproval(false, {approvalIndex: index, subIndex: subIndex});
		this.fundingBasedSwitch(false, {approvalIndex: index, subIndex: subIndex});
		const booleanControls = [
			  'OrgLevel1BasedRequired',
			  'IsVisibleExceptionApprover', 'IsVisibleExceptionPercentage', 'IsVisibleFundingBased',
				'IsVisibleFundingMinLimit',
			  'IsVisibleOrgLevel1Based', 'IsVisibleRole', 'IsVisibleUser', 'IsVisibleUserType'
			],
			 nullControls = ['RolesDetail', 'UserId', 'UserTypId'];
			   booleanControls.forEach((controlName) => {
			this.resetValue(index, subIndex, { controlName: controlName, value: false });
			   });
		nullControls.forEach((controlName) =>
			   	this.resetValue(index, subIndex, { controlName: controlName, value: null }));


	  }


	  public exceptionApproval(event: boolean, dataIndx:IndexObj) {
		const dd = (this.approvalFormArray.at(dataIndx.approvalIndex).get('subApproval') as FormArray).at(dataIndx.subIndex) as FormGroup<ExceptionApprovalFormGroup>,
			exceptionControl = dd.controls.ExceptionApprovalRequired as FormControl,
			exceptionPer = dd.controls.ExceptionPercentage as FormControl;
		exceptionControl.setValue(event);
		exceptionPer.reset();

		const excVal = exceptionPer.value,
			isExcValEmpty = excVal == null || !excVal,

			validators = isExcValEmpty && event
				? [this.customValidators.RequiredValidator('PleaseEnterExceptionPercentage')]
				: [];

		exceptionPer.setValidators(validators);
		exceptionPer.updateValueAndValidity();
	}

	public fundingBasedSwitch(event: boolean, dataIndx: IndexObj) {
		const dd:FormGroup = (this.approvalFormArray.at(dataIndx.approvalIndex).get('subApproval') as FormArray).at(dataIndx.subIndex) as FormGroup;
		(dd.controls['FundingBasedRequired'] as FormControl).setValue(event);
		(dd.controls['FundingMinLimit'] as FormControl).reset();

		if (event) {
			(dd.controls['FundingMinLimit'] as FormControl).setValidators(this.customValidators.RequiredValidator('PleaseEnterMinLimit'));
			(dd.controls['FundingMinLimit'] as FormControl).updateValueAndValidity();
		} else {
			(dd.controls['FundingMinLimit'] as FormControl).clearValidators();
			(dd.controls['FundingMinLimit'] as FormControl).updateValueAndValidity();
		}

	}


	  private resetValue(approvalIndex: number, subIndex:number, controlName: { controlName: string, value: boolean | null }): void {
		if(controlName.controlName){
			const control= this.getControlName(approvalIndex, subIndex, controlName.controlName);
			control.setValue(controlName.value);
		}
	  }

	  public onApproverLabelChange(event:KeyboardEvent, approvalIndex:number, subIndex:number) {
		console.log("sfsjdfs");
		const data = (event.target as HTMLInputElement).value;
		this.setApproverLabelValidation(data, approvalIndex, subIndex);
		this.cdr.markForCheck();
	}

	// eslint-disable-next-line max-lines-per-function
	private setApproverLabelValidation(value: string, approvalIndex: number, subIndex: number) {
		const approvalFormArray = this.approvalConfigForm.get('approvalFormArray') as FormArray;
		const controlName = this.getControlName(approvalIndex, subIndex, 'ApproverLabel');

		// Check if value is empty
		if (value.trim() === "") {
			controlName.setValidators(this.customValidators.RequiredValidator('PleaseEnterApproverLabel'));
			controlName.updateValueAndValidity();
			return;
		}

		// Collect all approver labels across all approval and sub-approval levels
		const allApproverLabels: string[] = [];
		approvalFormArray.controls.forEach((approvalGroup, mainIndex) => {
			const subApprovalArray = approvalGroup.get('subApproval') as FormArray;
			subApprovalArray.controls.forEach((subGroup, subIndex) => {
				const approverLabelValue = subGroup.get('ApproverLabel')?.value.trim();
				if (approverLabelValue) {
					allApproverLabels.push(approverLabelValue);
				}
			});
		});

		// Check if there are any duplicates
		const duplicateApproverLabel = allApproverLabels.some((label, idx) =>
			allApproverLabels.indexOf(label) !== idx);

		if (duplicateApproverLabel) {
			const trimmedValue = value.trim();
			approvalFormArray.controls.forEach((approvalGroup, mainIndex) => {
				const subApprovalArray = approvalGroup.get('subApproval') as FormArray;
				subApprovalArray.controls.forEach((subGroup, subIndex) => {
					const subValue = subGroup.get('ApproverLabel')?.value.trim();
					if (subValue === trimmedValue) {
						subGroup.get('ApproverLabel')?.setErrors({ error: true, message: 'ApproverLabelNameAlreadyUsed' });
					} else {
						subGroup.get('ApproverLabel')?.setErrors(null);
					}
					this.cdr.markForCheck();
				});
			});
		} else {
			// If no duplicates are found, clear errors for all controls
			approvalFormArray.controls.forEach((approvalGroup) => {
				const subApprovalArray = approvalGroup.get('subApproval') as FormArray;
				subApprovalArray.controls.forEach((subGroup) => {
					const approverLabelControl = subGroup.get('ApproverLabel');
					approverLabelControl?.setErrors(null);
					approverLabelControl?.markAsDirty();
					approverLabelControl?.markAsTouched();
					approverLabelControl?.updateValueAndValidity({ emitEvent: true, onlySelf: true });
					subGroup.updateValueAndValidity({ emitEvent: true, onlySelf: true });
					this.cdr.detectChanges();
				});
				subApprovalArray.updateValueAndValidity({emitEvent: true, onlySelf: true});
			});
		}
		this.cdr.markForCheck();
		this.cdr.detectChanges();
		this.approvalConfigForm.updateValueAndValidity({emitEvent: false, onlySelf: true});
	}

	private updateFormControl(approvalIndex: number, subIndex:number, control:any): void {
		const controlName = this.getControlName(approvalIndex, subIndex, control.controlName);
		if (controlName) {
		  if (control.shouldSetValidators) {

				controlName.setValidators(this.customValidators.RequiredValidator(control.validatorMsg));
		  } else {
				controlName.clearValidators();
		  }
		  controlName.updateValueAndValidity();
		}
	  }

	  private VisibleExceptionApprover(data: {Value: string | number}, index: number, subIndex:number) {
		const approverItem = this.setupApprovalData,
			  approverData = approverItem.find((e:ApproverType) =>
				e.ApproverTypeId === data.Value);
		if (approverData) {
		  this.approvalData = approverData;

		  const controlsData:ControlsData = {
				IsVisibleExceptionApprover: this.approvalData.IsVisibleExceptionApprover,
				IsVisibleExceptionPercentage: this.approvalData.IsVisibleExceptionPercentage,
				IsVisibleFundingBased: this.approvalData.IsVisibleFundingBased,
				IsVisibleFundingMinLimit: this.approvalData.IsVisibleFundingMinLimit,
				IsVisibleOrgLevel1Based: this.approvalData.IsVisibleOrgLevel1Based,
				IsVisibleRole: this.approvalData.IsVisibleRole,
				IsVisibleUser: this.approvalData.IsVisibleUser,
				IsVisibleUserType: this.approvalData.IsVisibleUserType
		  };
		  this.updateFormControls(index, subIndex, controlsData);
		}
	  }


	public getExceptionPercVal(e: any, approvalIndex: number, subIndex:number) {
		e.preventDefault();
		this.excPercVal = Number(e.target.value);
		const controlName = this.getControlName(approvalIndex, subIndex, 'ExceptionPercentage');
		if (!this.excPercVal) {

			controlName.setValidators([this.customValidators.RequiredValidator('PleaseEnterExceptionPercentage'), this.customValidators.RangeValidator(magicNumber.zero, 999.999, 'ExceptionPercentageRange')]);
			controlName.updateValueAndValidity();

		} else if (this.excPercVal < Number(magicNumber.one) || this.excPercVal > Number(magicNumber.hundred)) {
			controlName.setValidators(this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tripleNineWithThreeDecPlaces, 'ExceptionPercentageRange'));
			controlName.updateValueAndValidity();
		}

		else {
			controlName.clearValidators();
			controlName.updateValueAndValidity();
		}
	}


	private updateFormControls(approvalIndex: number, subIndex: number, controlsData: ControlsData): void {
		const dd = this.approvalFormArray.at(approvalIndex).get('subApproval') as FormArray;
		const subFormGroup = dd.at(subIndex) as FormGroup;

		Object.keys(controlsData).forEach((key) => {
		  const controlName = key as ControlNames;
		  const cc = subFormGroup.get(controlName) as FormControl;
		  const newValue = controlsData[controlName];
		  if (newValue) {
				cc.setValue(newValue);
		  }
		});
	  }

	  public onRoleChange(item:[], approvalindex:number, subIndex:number){
		const controlName = this.getControlName(approvalindex, subIndex, 'RolesDetail');
		if(item.length == Number(magicNumber.zero)){
			controlName.setValidators(this.customValidators.RequiredValidator('PleaseSelectRole'));
			controlName.updateValueAndValidity();
		}
		else{
			controlName.clearValidators();
			controlName.updateValueAndValidity();
		}
	}

	public collapse(e:ExpansionPanelActionEvent, approvalIndex:number){
		if(this.approvalFormArray
			.at(approvalIndex).invalid){
			this.approvalFormArray.at(approvalIndex).markAllAsTouched();
			e.preventDefault();
		}
	}
	public getMinLimitUSD(event:number, approvalIndex:number, subIndex:number){
		const dd:FormGroup = (this.approvalFormArray.at(approvalIndex).get('subApproval') as FormArray).at(subIndex) as FormGroup;
		const isFundingReq = (dd.controls['FundingBasedRequired'] as FormControl);

		if (isFundingReq && !event) {
			(dd.controls['FundingMinLimit'] as FormControl).setValidators(this.customValidators.RequiredValidator('PleaseEnterMinLimit'));
			(dd.controls['FundingMinLimit'] as FormControl).updateValueAndValidity();
			this.cdr.markForCheck();
		} else {
			(dd.controls['FundingMinLimit'] as FormControl).clearValidators();
			(dd.controls['FundingMinLimit'] as FormControl).updateValueAndValidity();
		}
	}

	public fundingBasedValueIsTrue(approvalIndex:number, controlName:string){
		const subApprovalArray = (this.approvalFormArray.at(approvalIndex).get('subApproval') as FormArray);
		const hasFundingBased = subApprovalArray.controls.some((control) =>
			control.get(controlName)?.value === true);
		this.cdr.markForCheck();
		return hasFundingBased;
	}
	  ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.approvalConfigForm.reset();
	}
}

