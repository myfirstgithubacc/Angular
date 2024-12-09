import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { AssignmentDetailsDataService } from '../../service/assingmentDetailsData.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { IAssignmentDetails, IBooleanOptionField, IDropdownItems, INumberOptionField, RequestDetail, WorkAttributes } from '../../interfaces/interface';
import { AssignmentPoNumber } from '../../interfaces/editAssignmentInterface';

@Component({selector: 'app-po-details',
	templateUrl: './po-details.component.html',
	styleUrls: ['./po-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PODetailsComponent implements OnInit, OnDestroy {
  @Input() inputProperties : {
    editAssingmentForm:FormGroup;
    assignmentDetails:IAssignmentDetails;
    poOwnerList:IDropdownItems[];
    poRadioGroup:INumberOptionField[];
    poGrid:AssignmentPoNumber[];
    currencyCode:string|null;
    isRevisionMode:boolean;
    isControlRevision: WorkAttributes;
    IsRevisionPending: boolean;
    revisionFields:string[];
    poEffectiveFromDateList: IDropdownItems[];
  };
  @Output() changePoRadioAddFunds = new EventEmitter<number>();
  @Output() changePoFundAmount = new EventEmitter<number|string|boolean>();
  @Output() revisionFieldUpdate = new EventEmitter<string>();

  public isAppendModeForDropdown:boolean=false;
  private destroyAllSubscription$ = new Subject<void>();

  constructor(
    private assignmentDataService: AssignmentDetailsDataService,
    private cd: ChangeDetectorRef, private localizationService: LocalizationService
  ){}

  ngOnInit(): void {
  	this.detectValuechange();
  }

  private detectValuechange(){
  	this.inputProperties.editAssingmentForm.get('poAdjustmentType')?.valueChanges.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((dt:number|string|null|undefined) => {
  		if(dt){
  			this.cd.detectChanges();
  		}
  	});
  }


  public isSeparateTandEPoAmount(){
  	return this.inputProperties.poGrid[0]?.SeparateTandEPoAmount;
  }

  public getGridlabelForPO(text:string){
  	const dynamicParam: DynamicParam[] = [{Value: String(this.inputProperties.currencyCode), IsLocalizeKey: false}];

  	return this.localizationService.GetLocalizeMessage(text, dynamicParam);
  }

  public onChangePoAdjustSwitch(isOn:boolean){
  	if(!isOn){
  		this.inputProperties.editAssingmentForm.get('poAdjustmentType')?.setValue(magicNumber.one);
  	}
  }

  public isRevisionFieldExist(control: string): boolean {
  	return this.inputProperties.revisionFields.some((ctrl: string) =>
  		control === ctrl);
  }

  public onChangePoRadioAddFunds(e:number){
  	this.changePoRadioAddFunds.emit(e);
  }

  public isReadOnly(controlName:string){
  	return this.assignmentDataService.isReadOnly(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
  }

  public isFieldVisible(controlName:string){
  	return this.assignmentDataService.isFieldVisible(controlName, this.inputProperties.assignmentDetails.LoggedInUserRoleGroupID);
  }

  public onChangePoFundAmount(e:number|string|boolean){
  	this.changePoFundAmount.emit(e);
  }

  public getRevisionFieldsUpdate(control:string){
  	this.revisionFieldUpdate.emit(control);
  }
  public getEstimatedCostChangeText(currency:string){
  	let amount = (this.inputProperties.editAssingmentForm.get('revisedFundByRateChange')?.value + this.inputProperties.editAssingmentForm.get('revisedFundByEndDateChange')?.value).toFixed(magicNumber.two);
  	const dynamicParam: DynamicParam[] = [{ Value: amount?? '0', IsLocalizeKey: true }, { Value: currency, IsLocalizeKey: true }];
  	amount = amount > magicNumber.zero
  		? amount
  		: magicNumber.zero;
  	return this.localizationService.GetLocalizeMessage('EstimatedCostChange', dynamicParam);

  }


  ngOnDestroy(): void {
  	this.destroyAllSubscription$.next();
  	this.destroyAllSubscription$.complete();
  }
}
