import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { AssignmentDetailsDataService } from '../../service/assingmentDetailsData.service';
import { debounceTime, Subject, Subscription, takeUntil } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { BenefitAdder, IAssignmentDetails, IBooleanOptionField, IDropdownItems, WorkAttributes } from '../../interfaces/interface';

@Component({selector: 'app-rate-details',
	templateUrl: './rate-details.component.html',
	styleUrls: ['./rate-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateDetailsComponent implements OnInit, OnDestroy {
  @Input() inputProperties : {
    editAssingmentForm:FormGroup;
    assignmentDetails:IAssignmentDetails;
    otHoursBilledAtRadioGroup:IDropdownItems[];
    benefitAdderGrid:BenefitAdder[];
		currencyCode:string|null;
		countryId:string|null;
		unitType:string;
		modifyPORadioGroup:IBooleanOptionField[]
		isRevisionMode:boolean;
		assignmentRevisionFields:IDropdownItems[];
		isControlRevision:WorkAttributes;
		estimatedCostChange:number;
		IsRevisionPending: boolean;
		showRevisionRateDate:boolean;
		revisionFields:string[];
  };

	@Output() revisionFieldUpdate = new EventEmitter<string>();
	@Output() poAmountRevisedRate = new EventEmitter<boolean>();
	@Output() revisedRateDate = new EventEmitter<Date|string>();
	@Output() changePoRevisedButton = new EventEmitter<boolean>();

	showRevisionRateDate: boolean = false;
	destroyAllSubscription$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private localizationService: LocalizationService,
		private assignmentDataService: AssignmentDetailsDataService,
		private customValidator: CustomValidators,
		private cd: ChangeDetectorRef
	){}

	ngOnInit(): void {
		this.detectRateValuechange();
		this.inputProperties.editAssingmentForm.statusChanges.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((dt:string|number) => {
			if(this.inputProperties.editAssingmentForm.get('ModifyPObasedOnRevisedRates')?.touched){
				this.cd.markForCheck();
			}
		});
	}

	private detectRateValuechange(){
  	this.inputProperties.editAssingmentForm.get('revisedFundByRateChange')?.valueChanges.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((dt:number|string) => {
  		if(dt){
  			this.cd.detectChanges();
  		}
  	});
	}

	public changePoRevised(poRate:boolean){
		this.inputProperties.isControlRevision.ModifyPObasedOnRevisedRates = true;
		this.changePoRevisedButton.emit();
		this.poAmountRevisedRate.emit(poRate);
	}

	public changeRateReviseDate(data:Date|string){
		this.revisedRateDate.emit(data);
	}

	public getDayHourLocalizationValue(key:string){
  	let unitType = this.inputProperties.assignmentDetails?.UnitTypeName;
  	unitType = unitType == 'Hour'
  		? 'Hour'
  		: unitType;
  	this.inputProperties.unitType = unitType;
  	if(this.inputProperties.assignmentDetails?.UnitTypeName !="")
  	{
  		const dynamicParam: DynamicParam[] = [
  			{ Value: String(this.inputProperties.currencyCode), IsLocalizeKey: false },
  			{ Value: unitType, IsLocalizeKey: false }
  		];
  		return this.localizationService.GetLocalizeMessage(key, dynamicParam);
  	}
  	else
  		return this.localizationService.GetLocalizeMessage(key);
	}

	public isRevisionFieldExist(control: string): boolean {
		return this.inputProperties.revisionFields.some((ctrl: string) =>
			control === ctrl);
	}

	public isReadOnly(controlName:string){
  	if(this.assignmentDataService.isReadOnly(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID)){
  			this.inputProperties.editAssingmentForm.controls[controlName].clearValidators();
  			this.inputProperties.editAssingmentForm.controls[controlName].updateValueAndValidity();
  		return true;
  	}
  	else{
  		return false;
  	}

	}

	public isFieldVisible(controlName:string){
  	return this.assignmentDataService.isFieldVisible(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
	}


	public getRevisionFieldsUpdate(control:string){
		this.showRevisionRateDate = true;
		this.inputProperties.editAssingmentForm.controls['revisedRatedate'].setValidators(this.customValidator.RequiredValidator('Please select Revised Rate Effective Date.'));
		this.inputProperties.editAssingmentForm.controls['revisedRatedate'].updateValueAndValidity();
		this.inputProperties.editAssingmentForm.controls['ModifyPObasedOnRevisedRates'].setValidators(this.customValidator.RequiredValidator('PleaseSelectModifyPOApprovedAmountBasedOnRevisedRates'));
		this.inputProperties.editAssingmentForm.controls['ModifyPObasedOnRevisedRates'].updateValueAndValidity();
		this.revisionFieldUpdate.emit(control);
	}

	public getEstimatedCostChangeText(amount:number, currency:string|null){
		if(amount)
			return'';
		const dynamicParam: DynamicParam[] = [
			{
				Value: this.localizationService.TransformNumber(amount, Number(magicNumber.two), null, Number(magicNumber.two))?? '0', IsLocalizeKey: true }, { Value: String(currency), IsLocalizeKey: true }];
		amount = amount > Number(magicNumber.zero)
			? amount
			: magicNumber.zero;
		return this.localizationService.GetLocalizeMessage('EstimatedCostChange', dynamicParam);
	}

	ngOnDestroy(): void {
		this.destroyAllSubscription$.next();
		this.destroyAllSubscription$.complete();
	}
}
