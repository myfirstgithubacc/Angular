import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ISharedDataIds } from '../../../interface/shared-data.interface';
import { SharedDataService } from '../../../services/shared-data.service';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { Subject, takeUntil } from 'rxjs';
import { ApprovalReq, ApprovalInfoDetails } from '@xrm-master/approval-configuration/constant/enum';
import { IUdfData } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { approvalStage } from '@xrm-shared/widgets/approval-widget-v2/enum';
import { StatusID } from '../../../constant/request-status';

@Component({
	selector: 'app-approver-other-details',
	templateUrl: './approver-other-details.component.html',
	styleUrl: './approver-other-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproverOtherDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dms', { static: false }) dmsImplementation: DmsImplementationComponent;
  @Input() childFormGroup: FormGroup;
  @Input() isDraft: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() isCopyReq: boolean = false;
  @Input() public profRequestDetails: any;
  public entityId: number = XrmEntities.ProfessionalRequest;
  public sectorId: number = magicNumber.zero;
  public orgLevel1Id: number = magicNumber.zero;
  private locationId: number = magicNumber.zero;
  private primaryManager: number = magicNumber.zero;
  private laborCategoryId: number = magicNumber.zero;
  private reasonsForRequestId: number = magicNumber.zero;
  private jobCategoryId: number = magicNumber.zero;
  private orgLevel2Id: undefined | number = magicNumber.zero;
  private orgLevel3Id: undefined | number = magicNumber.zero;
  private orgLevel4Id: undefined | number = magicNumber.zero;
  private estimationCost: number = magicNumber.zero;
  private reqLibraryId: number = magicNumber.zero;
  public recordId: number = magicNumber.zero;
  public actionTypeIdAdd: number = ActionType.Add;
  public actionTypeIdEdit: number = ActionType.Edit;
  public uploadStageId: number = DocumentUploadStage.Request_Creation;
  public processingId: number = magicNumber.five;
  public recordUKey: string = '';
  public commentDetailsForm: FormGroup;
  private rateDetailsForm:FormGroup;
  public udfData: IPreparedUdfPayloadData[] = [];
  public hasUDFLength: boolean = false;
  public hasDMSLength: boolean = false;
  public hasApproverData: boolean = false;
  public isNeedToReloadLatestApprovers: boolean = false;
  public approverWidgetData: ApprovalReq;
  public approvalConfigWidgetObj: ApprovalInfoDetails;
  private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

  constructor(
    public udfCommonMethods: UdfCommonMethods,
    private sharedDataService: SharedDataService,
	private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
  	if(changes){
  		this.commentDetailsForm = this.childFormGroup.get('requestComments') as FormGroup;
  		this.getSharedData();
  		this.setParentsInfo();
  		this.getApprovalWidgetData();
  		this.patchClientComments();
  		if(this.isEditMode){
  			this.setEditData(this.profRequestDetails);
  			this.reloadApprover(this.profRequestDetails.ProfRequest.RequestDetail.StatusId);
  		}
  	}
  }

  ngOnInit(): void {
  	this.rateDetailsForm = this.childFormGroup.get('rateDetails') as FormGroup;
  	this.sharedDataService.billRate$.subscribe((rate:number) => {
  		if(rate > Number(magicNumber.zero)){
			  this.getApprovalWidgetData();
  		}
	  });
  }

  private setEditData(data: any){
  	this.isNeedToReloadLatestApprovers = true;
  	this.isDraft = data.ProfRequest.RequestDetail.StatusId == Number(StatusID.Draft);
  	this.recordUKey = data.ProfRequest.RequestDetail.RequestUKey;
  	this.recordId = data.ProfRequest.RequestDetail.RequestId;
  	this.estimationCost = data.ProfRequestFinancial.EstimatedCost;
  }

  private reloadApprover(statusId: number){
  	this.sharedDataService.estimatedCost$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((cost: number) => {
  		if((cost > Number(magicNumber.zero) && cost != this.estimationCost) || statusId == Number(StatusID.Declined)){
  			this.isNeedToReloadLatestApprovers = false;
  			this.getApprovalWidgetData();
  		}
  	});
  }

  private getSharedData() {
  	this.sharedDataService.currentIds$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((ids: ISharedDataIds) => {
  		this.sectorId = ids.sectorId;
  		this.locationId = ids.locationId;
  		this.orgLevel1Id = ids.orgLevel1Id;
  		this.orgLevel2Id = ids.orgLevel2Id;
  		this.orgLevel3Id = ids.orgLevel3Id;
  		this.orgLevel4Id = ids.orgLevel4Id;
  		this.laborCategoryId = ids.laborCategoryId;
  		this.jobCategoryId = ids.jobCategoryId;
  		this.reqLibraryId = ids.reqLibraryId;
  		this.reasonsForRequestId = ids.reasonForRequestId;
  		this.primaryManager = ids.primaryManager;
  		const requiredIds = [this.sectorId, this.locationId, this.orgLevel1Id, this.primaryManager, this.laborCategoryId];
  		if (requiredIds.every((id) =>
  			id > Number(magicNumber.zero))) {
  			this.getApprovalWidgetData();
  		}
  	});
  }

  private getApprovalWidgetData() {
  	this.approvalConfigWidgetObj = {
  		"recordId": this.recordId,
  		"actionId": approvalStage.ProffCreation,
  		"entityId": Number(XrmEntities.ProfessionalRequest),
  		"sectorId": this.sectorId,
  		"locationId": this.locationId,
  		"orgLevel1Id": this.orgLevel1Id,
  		"laborCategoryId": this.laborCategoryId,
  		"reasonsForRequestId": this.reasonsForRequestId,
  		"estimatedcost": this.estimationCost,
  		"nextLevelManagerId": this.primaryManager,
  		"BillRate": this.rateDetailsForm.get('NteBillRate')?.value,
  		"ExceptionalBillRate": this.rateDetailsForm.get('NewNteBillRate')?.value
  	};
  	this.cdr.markForCheck();
  }

  public getUdfData(data: IUdfData) {
  	this.udfData = data.data;
  	const udfFormGroup: FormGroup = data.formGroup;
  	this.childFormGroup.setControl('udf', udfFormGroup);
  	this.childFormGroup.controls['udfFieldRecords'].setValue(this.udfData);
  }

  public setParentsInfo() {
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.Location, this.locationId);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel1, this.orgLevel1Id);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel2, this.orgLevel2Id);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel3, this.orgLevel3Id);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.OrgLevel4, this.orgLevel4Id);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.LaborCategory, this.laborCategoryId);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.JobCategory, this.jobCategoryId);
  	this.udfCommonMethods.manageParentsInfo(XrmEntities.RequisitionLibrary, this.reqLibraryId);
  }

  public getUdfLength(isUDFLength: boolean) {
  	this.hasUDFLength = isUDFLength;
  }

  public getDmsLength(isDMSLength: boolean) {
  	this.hasDMSLength = isDMSLength;
  }

  public onGridChange(): void {
  	this.childFormGroup.controls['dmsFieldRecords'].setValue(this.dmsImplementation.prepareAndEmitFormData());
  }

  public onApproverSubmit(e: ApprovalReq) {
  	this.approverWidgetData = e;
  	this.childFormGroup.setControl('approvalForm', this.approverWidgetData.approvalForm);
  	this.childFormGroup.controls['approvalDetails'].setValue(this.approverWidgetData.data);
  	this.hasApproverData = this.approverWidgetData.data.length === Number(magicNumber.zero);
  }

  private patchClientComments() {
  	if (this.commentDetailsForm.pristine && this.isEditMode) {
  		this.commentDetailsForm.patchValue({
  			'ClientComments': this.profRequestDetails.ProfRequestComment.ClientComments,
  			'ClientCommentsToStaffingAgency': this.profRequestDetails.ProfRequestComment.ClientCommentsToStaffingAgency
  		});
  	}
  }

  ngOnDestroy(): void {
  	this.sharedDataService.approverOtherDetailsFormPersist = true;
  	this.destroyAllSubscriptions$.next();
  	this.destroyAllSubscriptions$.complete();
  }

}
