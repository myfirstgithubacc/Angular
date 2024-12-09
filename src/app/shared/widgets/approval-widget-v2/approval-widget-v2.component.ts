import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';
import { Subject, takeUntil } from 'rxjs';
import { approvalTypeEnum } from './enum';
import { ApprovalReq, BaseTransactionDataModel, EntityRecord, FormVal, ApprovalInfoDetails, TransactionDataModel} from '@xrm-master/approval-configuration/constant/enum';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdownItem } from '@xrm-shared/models/common.model';
import { Idropdown } from '@xrm-core/models/job-category.model';

@Component({selector: 'app-approval-widget-v2',
	templateUrl: './approval-widget-v2.component.html',
	styleUrls: ['./approval-widget-v2.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApprovalWidgetV2Component implements OnChanges, OnDestroy{

  @Input() searchFormGroup: FormGroup;
  @Input() approverForm:FormGroup;
  @Input() workflowList = [];
  @Input() sector:number;
  @Input() location:number;
  @Input() laborCategoryList = [];
  @Input() organizationLevel1List = [];
  @Input() isheading:boolean = true;
  @Input() heading = "ApprovalConfiguration";
  @Input() approvalInfo: ApprovalInfoDetails;
  @Input() entityId :number;
  @Input() isRecordId:number;
  @Input() orgLevel1Id:number;
  @Input() isEdit:boolean = false;
  @Input() approverExist:boolean;
  @Input() isView:boolean = false;
  @Input() isDraft: boolean= false;
  @Output() onSearchFormSubmit = new EventEmitter<FormGroup>();
  @Output() onApproverSubmitReq = new EventEmitter<ApprovalReq>();
  private ngUnsubscribe$: Subject<void> = new Subject<void>();
  public approvalData:BaseTransactionDataModel[] = [];
  public editdata:BaseTransactionDataModel[]=[];
  public isApprovalUpdate:boolean = false;
  public filterSettings: DropDownFilterSettings = {
  	caseSensitive: false,
  	operator: 'contains'
  };
  public approvalTypeEnum = approvalTypeEnum;
  // eslint-disable-next-line max-params
  constructor(
      private customValidators: CustomValidators,
      private fb: FormBuilder,
	  private cdr: ChangeDetectorRef,
     private approvalConfigWidgetServ: ApprovalConfigurationGatewayService
  ) {

  	this.approverForm = this.fb.group({
  	});
  }


  ngOnChanges(changes: SimpleChanges): void {
  	this.approverForm = this.fb.group({

  	});
  	if((this.isEdit || this.isView || this.isDraft) && this.isRecordId> Number(magicNumber.zero)){
  		this.editApprovalData(this.isRecordId, this.entityId);
  	}
  	else if(this.approvalInfo){
  		this.getApprovalData(this.approvalInfo);

  	}
  	if(changes['data'].currentValue?.length > magicNumber.zero){
  		this.approvalData = changes['data'].currentValue;
  	}
  }


  private generateFormForApproval(){
  	this.approvalData.forEach((a:BaseTransactionDataModel, i: number) => {
  		if(a.ApproverTypeId == Number(this.approvalTypeEnum.userApprovalLevel) && a.Items.length> Number(magicNumber.one)){
  			a.controlName = `controls${i}`;
  		}
  	});
  	const formVal:FormVal ={};
  	this.approvalData.forEach((d:BaseTransactionDataModel) => {
  		if(d.controlName){
  			formVal[d.controlName] = new FormControl(null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: d.ApproverLabel, IsLocalizeKey: true }])]);
  		}
  		this.approverForm = new FormGroup(formVal);
  	});
  }

  private combineArray() {
  	const approvalFormData = this.createApprovalFormData().flat(Infinity);
  	this.emitApprovalSubmitRequest(approvalFormData);
  }

  public getuserValue(controlName:string, event: Event){
  	this.approverForm.get(controlName)?.setValue(event);
  	this.combineArray();
  }

  private createApprovalFormData() {
  	return this.approvalData.map((element: BaseTransactionDataModel) => {
  		if (element.ApproverTypeId !== Number(this.approvalTypeEnum.userApprovalLevel)) {
  			return this.getObjectApprovalForEdit(element);
  		}
  		if(element.ApproverTypeId === Number(this.approvalTypeEnum.userApprovalLevel) && element.Items.length === Number(magicNumber.one)){
  			return this.getObjectApprovalForEdit(element);
  		}
  		else {
  			const controlValue = this.approverForm.value[element.controlName];
  			return this.getObjectApprovalForEdit(element, controlValue);

  		};
  	});
  }

  private getObjectApprovalForEdit(element:TransactionDataModel, controlValue?:Idropdown){
  	return {
  		"TransactionId": element.TransactionId,
  		"TransactionDetailId": element.TransactionDetailId,
  		"ApprovalConfigId": element.ApprovalConfigId,
  		"ApprovalConfigDetailId": element.ApprovalConfigDetailId,
  		"ApproverTypeId": element.ApproverTypeId,
  		"ApproverLabel": element.ApproverLabel,
  		"ApproverLevel": element.ApproverLevel,
  		"SubApproverLevel": element.SubApproverLevel,
  		"EstimatedCost": element.EstimatedCost,
  		"Items": this.getItemValue(element.Items, controlValue, element.ApproverTypeId),
  		"IsDraft": element.IsDraft
  	};
  }

  private getItemValue(data:IDropdownItem[], controlValue?: Idropdown, approverTypeId?:number) {
  	if(controlValue && approverTypeId === magicNumber.one){
  		return data.filter((item: IDropdownItem) => {
  			return item.Value == controlValue.Value;
  		});
  	}
  	else{
  		return data;
  	}
  }

  private emitApprovalSubmitRequest(data:TransactionDataModel[]) {
  	const approvalForm = this.approverForm,
  		approvalRequest = { approvalForm, data };
  	this.onApproverSubmitReq.emit(approvalRequest);
  }

  private getApprovalData(approvalInfo:ApprovalInfoDetails){
  	this.approvalConfigWidgetServ.getApprovalConfigDetailsByApprovalInfo(approvalInfo).pipe(takeUntil(this.ngUnsubscribe$)).
  		subscribe((res:GenericResponseBase<BaseTransactionDataModel[]>) => {
  		if(isSuccessfulResponse(res)){
  			this.approvalData = this.sortData(res.Data);
  			if(this.approvalData.length > Number(magicNumber.zero)){
  			this.generateFormForApproval();
  			this.combineArray();
			  this.cdr.detectChanges();
  			}
  				else{
  					this.approvalData = [];
  					const emptyForm = new FormGroup({});
  					this.onApproverSubmitReq.emit({
  						approvalForm: emptyForm,
  						data: []
  					});
  				}
  		}
  		else{
  			this.approvalData = [];
  		}
  	});
  }

  private sortData(data: BaseTransactionDataModel[]): BaseTransactionDataModel[] {
  	if (data.length > Number(magicNumber.one)) {
  		return data.sort((a: BaseTransactionDataModel, b: BaseTransactionDataModel) => {
  			if (a.ApproverLevel !== b.ApproverLevel) {
  				return a.ApproverLevel - b.ApproverLevel;
  			} else {
  				return a.SubApproverLevel - b.SubApproverLevel;
  			}
  		});
  	}
  	return data;
  }

  private editApprovalData(recordId:number, entityId:number){
  	const obj:EntityRecord = {
  		RecordId: recordId,
  		EntityId: entityId,
  		SectorId: this.sector,
  		orgLevel1Id: this.orgLevel1Id,
  		IsDraft: this.isDraft
  	};
  	if((this.isDraft && !this.isView)){
  		this.getDataForDraft(this.approvalInfo);
  	}
  	else{
  		this.getDataForEdit(obj);
  	}
  }

  public getDataForEdit(obj:EntityRecord){
  	this.approvalConfigWidgetServ.getApprovalCOnfigForEdit(obj).pipe(takeUntil(this.ngUnsubscribe$)).
  		subscribe((res:GenericResponseBase<BaseTransactionDataModel[]>) => {
  		if(isSuccessfulResponse(res)){
  			this.editdata = this.sortData(res.Data);
  			if(this.isEdit || this.isView){
  				this.approvalData = this.editdata;
  				this.generateFormForApproval();
  				this.loadItems();
  				this.combineArray();
				  this.cdr.detectChanges();
  			}

  		}
  	});
  }

  public getDataForDraft(obj:ApprovalInfoDetails){
  	this.approvalConfigWidgetServ.getApprovalCOnfigForDraft(obj).pipe(takeUntil(this.ngUnsubscribe$)).
  		subscribe((res:GenericResponseBase<BaseTransactionDataModel[]>) => {
  		if(isSuccessfulResponse(res)){
  			this.editdata = this.sortData(res.Data);
  			if(this.isEdit || this.isView){
  				this.approvalData = this.editdata;
  				this.generateFormForApproval();
  				this.loadItems();
  				this.combineArray();
				  this.cdr.detectChanges();
  			}

  		}
  	});
  }
  private loadItems() {
  	this.approvalData.forEach((element: BaseTransactionDataModel) => {
  		if(element.ApproverTypeId == Number(this.approvalTypeEnum.userApprovalLevel) && element.Items.length > Number(magicNumber.one)){
  			element.Items.forEach((item: IDropdownItem) => {
  				if(item.IsSelected && element.controlName){
  					this.approverForm.get(element.controlName)?.setValue(item);
  				}
  			});
  		}
  	});


  }

  ngOnDestroy() {
  	this.ngUnsubscribe$.next();
  	this.ngUnsubscribe$.complete();
  }

}
