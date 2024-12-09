
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OffCanvasService } from '@xrm-master/approval-configuration/services/off-canvas.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { AssignmentDetailsDataService } from '../../service/assingmentDetailsData.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AssignmentCostAccountingCode, CostAccountingCodeData, CostCenterConfig, IAssignmentDetails, SegmentData, SegmentInfo } from '../../interfaces/interface';
import { DateConversationService } from '../../service/date_conversation.service';

@Component({selector: 'app-cost-accounting-code',
	templateUrl: './cost-accounting-code.component.html',
	styleUrls: ['./cost-accounting-code.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostAccountingCodeComponent implements OnInit {

	public Form: FormGroup;
  @ViewChild('gridCAC', { static: false }) gridCAC: ElementRef;
  @ViewChild('popupOpen', { static: false }) popupOpen: ElementRef;
  @Input() EditUserForm: FormGroup;
  @Input() isEditMode = true;
  @Input() public isAppendModeForDropdown=false;
  @Input() public listForDropdown:SegmentData[] = [];
  //   @Input() public gridData:any = [];
  @Input() public gridData:AssignmentCostAccountingCode[] = [];
  @Input() public assignmentDetails:IAssignmentDetails;
	@Input() public costCenterConfig: CostCenterConfig|SegmentData[];
  @Output() public updateCostAccountingCodeData: EventEmitter<SegmentData[]|AssignmentCostAccountingCode[]> =
  	new EventEmitter<SegmentData[]|AssignmentCostAccountingCode[]>();
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent): void {
  	const element = e.target as HTMLElement;
  	if (
  		(element.nodeName === "TD" || element.className === "k-column-title") &&
      element.offsetWidth < element.scrollWidth
  	) {
  		this.tooltipDir.toggle(element);
  	} else {
  		this.tooltipDir.hide();
  	}
  }
  public controlNames: string[] = [];
  public isSegmentVisible=true;
  public isEditCostAccountCode:boolean = false;
  private indexNumber:number;
  public isOnComponent:boolean = false;

  // eslint-disable-next-line max-params
  constructor(
    private fb: FormBuilder,
    private customValidator: CustomValidators,
    private cd: ChangeDetectorRef,
    private localizationService: LocalizationService,
		private toasterService:ToasterService,
		private offCanvasService:OffCanvasService,
		private assignmentDataService: AssignmentDetailsDataService,
    private dateConvert: DateConversationService
  ) {

  }


  ngOnInit() {
  	this.Form = this.fb.group({description: [null], singleCostAccounting: [null]});
  	this.addControl();
  }

  public offcanvasHidden(){
  	this.isOnComponent = false;
  	this.toasterService.notPopup.next(true);
  	this.isEditCostAccountCode = false;
  	const lastToaster = this.toasterService.data[this.toasterService.data.length - magicNumber.one];
	  if (lastToaster && lastToaster.cssClass === 'alert__danger') {
		  this.toasterService.resetToaster(lastToaster.toasterId);
	  }
  }
  public openRightPanelCard(){
  	this.toasterService.resetToaster();
  	this.toasterService.notPopup.next(false);
  	this.Form.reset();
  }
  public isAddCostCenterManuallyAllowed(): boolean {
  	if(this.assignmentDetails.AssignmentTypeName == "LightIndustrial")
  		return false;
  	return (this.costCenterConfig as CostCenterConfig)?.AddCostCenterManually ?? false;
  }

  public onChangeCostAccountingDropdown(data:any){
  	// console.log(data);
  }

  public getSegmentName(segmentName: number): string {
  	return (this.costCenterConfig as CostCenterConfig)?.SectorCostCenterConfigs[segmentName]?.SegmentName;
  }

  private addControl() {
  	if((this.costCenterConfig as CostCenterConfig) &&
	(this.costCenterConfig as CostCenterConfig)?.SectorCostCenterConfigs?.length > Number(magicNumber.zero))
  		{
  		(this.costCenterConfig as CostCenterConfig)?.SectorCostCenterConfigs.forEach((element:SegmentInfo, index: number) => {
  				this.Form.addControl(`segment${index+ magicNumber.one}`, this.fb.control(''));
  				this.Form.get(`segment${index+magicNumber.one}`)?.addValidators(this.setValidators(element));
  				this.controlNames.push(`segment${index+magicNumber.one}`);
  			});
  			this.cd.detectChanges();

  	}
  	else
  		this.Form.addControl('costCenter', this.fb.control({}));
  }

  private setValidators(segment: SegmentInfo) {
  	const dynamicParam: DynamicParam[] = [{ Value: segment.SegmentName, IsLocalizeKey: false }],
  	dynamicParam1: DynamicParam[] = [{ Value: String(segment.SegmentMinLength), IsLocalizeKey: false }],
  	dynamicParam2: DynamicParam[] = [{ Value: String(segment.SegmentMaxLength), IsLocalizeKey: false }];
  	return [
  		this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage('PleaseEnterData', dynamicParam)),
  		this.customValidator.MinLengthValidator(segment.SegmentMinLength, this.localizationService.GetLocalizeMessage('MinimumAnswerCharacterLimit', dynamicParam1)),
  		this.customValidator.MaxLengthValidator(segment.SegmentMaxLength, this.localizationService.GetLocalizeMessage('MaximumAnswerCharacterLimit', dynamicParam2))
  	];
  }

  public submitCostCenter() {
  	this.offCanvasService.offcanvasElement = true;
  	if (this.assignmentDetails.AssignmentTypeName != 'LightIndustrial' && (this.costCenterConfig as CostCenterConfig)?.AddCostCenterManually) {
  		if (this.Form.valid) {
  			this.addNewCostCenter();
  		}
  		else {
  			this.Form.markAllAsTouched();
  		}

  	}
  	else if (this.Form.get('singleCostAccounting')?.value) {
  		if(!this.checkDublicateCostCenter(this.Form.get('singleCostAccounting')?.value)){
  			this.addCostCentre();

  		}
  		else{
  			this.toasterService.showToaster(ToastOptions.Error, 'CostAccountingCodeAlreadyExists');
  		}

  	}
  	else {
  		this.Form.get('singleCostAccounting')?.setValidators(this.customValidator.RequiredValidator('PleaseSelectCostAccountingCode'));
  		this.Form.get('singleCostAccounting')?.markAsTouched();
  		this.Form.get('singleCostAccounting')?.updateValueAndValidity();
  	}

  }

  private addNewCostCenter() {
  	this.Form.markAllAsTouched();
  		if(this.Form.valid)
  		{
  			// eslint-disable-next-line prefer-const
  			let data:string[] = [];
  			for (const key in this.Form.controls) {
  				if (this.Form.get(key)?.value && key != 'description' && key != 'singleCostAccounting'){
  					data.push(this.Form.get(key)?.value);
  				}
  			}
  		const Joinedstring = data.join('~'),
  			 costAccountingCodeData = {...this.Form.value, CostAccountingCode: Joinedstring,
  				Description: this.Form.get('description')?.value,
  				CostAccoutingCodeId: 0,
  				assignmentCostAccountingCodeId: this.isEditCostAccountCode ?
					 this.gridData[this.indexNumber].AssignmentCostAccountingCodeId :
					  magicNumber.zero
  			};
  			if(this.isEditCostAccountCode){
			  this.gridData[this.indexNumber] = costAccountingCodeData;
			  this.EditUserForm.markAsDirty();
			  this.gridCAC?.nativeElement?.click();
  			}
  			else if(!this.checkDublicateCostCenter(costAccountingCodeData)){
  				this.gridData.unshift(costAccountingCodeData);
				  this.gridCAC?.nativeElement?.click();
				  this.EditUserForm.markAsDirty();
  			}
  			else{
  				this.isOnComponent = true;
  				this.toasterService.showToaster(ToastOptions.Error, 'CostAccountingCodeAlreadyExists');
  			}
		    this.gridData.map((x:AssignmentCostAccountingCode) => {
  				x.isTempSaved = x.assignmentCostAccoutingCodeId == magicNumber.zero
  					? true
  					: false;
  			});
  			this.updateCostAccountingCodeData.emit(this.gridData);
  		}

  }

  private addCostCentre(){
  	const costAccountingCodeData:AssignmentCostAccountingCode = {CostAccountingCode: this.Form.get('singleCostAccounting')?.value.Text,
  		Description: this.Form.get('singleCostAccounting')?.value?.Description,
  		assignmentCostAccountingCodeId: 0,
  		CostAccountingCodeId: this.Form.get('singleCostAccounting')?.value.Value,
  		EffectiveFrom: this.Form.get('singleCostAccounting')?.value.EffectiveStartDate,
  		EffectiveTo: this.Form.get('singleCostAccounting')?.value.EffectiveEndDate
  	};
	  if(!this.checkDublicateCostCenter(costAccountingCodeData)){
  		this.gridData.unshift(costAccountingCodeData);
  		this.gridData[0].isTempSaved = true;
		  this.gridCAC?.nativeElement?.click();
		  this.EditUserForm.markAsDirty();
  	}
  	else{
  		this.toasterService.showToaster(ToastOptions.Error, 'CostAccountingCodeAlreadyExists');
  	}
  	this.gridData.map((x:AssignmentCostAccountingCode) => {
  		x.EffectiveFrom = x.EffectiveFrom
  			? this.dateConvert.getFormattedDateIntoString(x.EffectiveFrom)
  			: '';
  		x.EffectiveTo = x.EffectiveTo
  			? this.dateConvert.getFormattedDateIntoString(x.EffectiveTo)
  			: '';
  	});

  	this.updateCostAccountingCodeData.emit(this.gridData);
  }

  private checkDublicateCostCenter(data: SegmentData): boolean {
  	return this.gridData.some((x: AssignmentCostAccountingCode) =>
  		x.CostAccountingCode === data.CostAccountingCode);
  }

  public onEdit = (dataItem: AssignmentCostAccountingCode, index:number) => {
  	this.indexNumber = index;
  	this.isEditCostAccountCode = true;
  	this.popupOpen?.nativeElement?.click();
  	this.Form.patchValue({
  		segment1: dataItem.Segment1??dataItem.segment1,
  		segment2: dataItem.Segment2??dataItem.segment2,
  		segment3: dataItem.Segment3??dataItem.segment3,
  		segment4: dataItem.Segment4??dataItem.segment4,
  		segment5: dataItem.Segment5??dataItem.segment5,
  		description: dataItem.Description??dataItem.description
  	});
  };

  public onActiveChange(dataItem: AssignmentCostAccountingCode){
  	dataItem.Disabled = !dataItem.Disabled;
  	this.EditUserForm.markAsDirty();
  };

  public removeItem(dataItem: AssignmentCostAccountingCode){
  	this.gridData.splice(this.gridData.indexOf(dataItem), magicNumber.one);
  	this.EditUserForm.markAsDirty();
  	this.updateCostAccountingCodeData.emit(this.gridData);
  }

  public isFieldVisible(controlName:string){
  	return this.assignmentDataService.isFieldVisible(controlName, this.assignmentDetails.LoggedInUserRoleGroupID);
  }

  public isEffectiveDateVisible(): boolean{
  	return this.assignmentDetails?.HasChargeEffectiveDate ?? false;
  }

}
