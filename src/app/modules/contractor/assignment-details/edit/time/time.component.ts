import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AssignmentDetailsDataService } from '../../service/assingmentDetailsData.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { IAssignmentDetails, IDropdownItems, WorkAttributes } from '../../interfaces/interface';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';

@Component({selector: 'app-time-expense-configuration',
	templateUrl: './time.component.html',
	styleUrls: ['./time.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeComponent implements OnInit, OnDestroy{
  @Input() inputProperties : {
    editAssingmentForm: FormGroup;
    assignmentDetails: IAssignmentDetails;
    hourDistributionList: IDropdownItems[];
    restMealBreakList: IDropdownItems[];
    isEditMode: boolean;
    hourDistributionEffectiveDateList: IDropdownItems[];
    restBreakEffectiveDateList: IDropdownItems[];
    IsRevisionPending: boolean;
    isControlRevision: WorkAttributes;
    revisionFields: string[]
  };
  @Output() hourDistributionRuleChanged = new EventEmitter<string>();
  @Output() hourDistributionEffectiveDateChanged = new EventEmitter<string>();
  @Output() restMealBreakEffectiveDateChanged = new EventEmitter<string>();

  destroyAllSubscription$ = new Subject<void>();

  constructor(
    private assignmentDataService: AssignmentDetailsDataService,
    private customValidators: CustomValidators,
    private localizationService: LocalizationService,
    private toasterService: ToasterService
  ){}

  ngOnInit(): void {
  	this.onRestMealBreakChange();
  }
  public isAppendModeForDropdown:boolean = true;


  public onChangeNumericBox(e:number|string){
  	const regularHoursPerWeek = this.inputProperties.editAssingmentForm.controls['estimatedRegularHoursPerWeek'],
  		dynamicParam : DynamicParam[] = [{Value: '40', IsLocalizeKey: false}, {Value: '168', IsLocalizeKey: false}];
  	if(regularHoursPerWeek.value == undefined){
  		regularHoursPerWeek.setValidators(this.customValidators.RequiredValidator('PleaseEnterEstimatedRegularHoursPerWeek'));
  		regularHoursPerWeek.updateValueAndValidity();
  	}

  	else if(regularHoursPerWeek.value > magicNumber.oneHundredSixtyEight || regularHoursPerWeek.value < magicNumber.forty){
  		regularHoursPerWeek.setValidators(this.customValidators.RangeValidator(magicNumber.forty, magicNumber.oneHundredSixtyEight, this.localizationService.GetLocalizeMessage('EstimatedRegularHoursPerWeekRange', dynamicParam)));
  		regularHoursPerWeek.updateValueAndValidity();
  	}

  }

  public onHourDistributionRuleChange(control:string){
  	this.hourDistributionRuleChanged.emit(control);
  }
  public onHourDistributionRuleEffectiveDateChange(control:string){
  	this.hourDistributionEffectiveDateChanged.emit(control);
  }

  public onRestMealBreakRuleEffectiveDateChange(control:string){
  	this.restMealBreakEffectiveDateChanged.emit(control);
  }

  public onAllowTimeEntrySwitch(event: boolean)
  {
  	if (!this.inputProperties.assignmentDetails.CanWorkerLogin)
  	{
  		this.toasterService.showToaster(ToastOptions.Error, 'PleaseEnableRequireLoginToggleInWorker');
  		this.inputProperties.editAssingmentForm.get('isTimeEntryAllowed')?.setValue(false);
  		return;
  	}
  	this.inputProperties.editAssingmentForm.get('isTimeEntryAllowed')?.setValue(event);
  }

  public onRestMealBreakChange(){
  	const control = 'restMealBreak',
  		workLocationId = this.inputProperties.isControlRevision.WorkLocationId,
  		assignmentRestMeal = this.inputProperties.assignmentDetails?.AssignmentMealBreakConfigurations[0]?.MealBreakConfigurationName,
  		restMealValue = this.inputProperties.editAssingmentForm.get(control)?.value?.Text;
  	this.inputProperties.editAssingmentForm.get(control)?.valueChanges.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((dt) => {
  		if(workLocationId && (restMealValue !== assignmentRestMeal)){
  			this.inputProperties.isControlRevision[control] = true;
  		}else{
  			this.inputProperties.isControlRevision[control] = false;
  		}
  	});
  }


  public getRateUnitLabelYearTillDate(key:string){
  	let unitType = this.inputProperties.assignmentDetails?.UnitType;
  	unitType = unitType == magicNumber.nine
  		? 'Hours'
  		: `${this.inputProperties.assignmentDetails?.UnitTypeName}s`;
  	if(this.inputProperties.assignmentDetails?.UnitTypeName !=""){
  		return `${unitType} ${this.localizationService.GetLocalizeMessage(key)}`;
  	}else{
  		return this.localizationService.GetLocalizeMessage(key);
  	}
  }

  public isReadOnly(controlName:string){
  	return this.assignmentDataService.isReadOnly(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
  }

  public isDisabled(controlName: string): boolean {
  	return this.inputProperties.editAssingmentForm?.get(controlName)?.disabled ?? false;
  }


  public isFieldVisible(controlName:string){
  	return this.assignmentDataService.isFieldVisible(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
  }

  public isRevisionFieldExist(control: string): boolean {
  	return this.inputProperties.revisionFields.some((ctrl: string) =>
  		control === ctrl);
  }

  ngOnDestroy(): void {
  	this.destroyAllSubscription$.next();
  	this.destroyAllSubscription$.complete();
  }
}
