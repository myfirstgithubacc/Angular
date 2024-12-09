import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApprovalEditData, BaseTransactionDataModel, DataStatus, EntityRecord, ICommonComponentData, IDataItem, IDataItemResponse, ApprovalInfoDetails, TransactionDataModel } from '@xrm-master/approval-configuration/constant/enum';
import { DataModel } from '@xrm-master/approval-configuration/data.model';
import { IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class ApprovalConfigurationGatewayService extends HttpMethodService{
	public approverLevelRemoved = new BehaviorSubject(false);
	public isSectorChanged = new BehaviorSubject<DataStatus>({ data: [], status: false });
	public isDataSaved = new BehaviorSubject(false);
	public isWorkFlowChanged = new BehaviorSubject(false);
	public isSubmitForm = new BehaviorSubject(false);
	constructor(private http: HttpClient) {
		super(http);
	}

	getSectorDropDownList() {
		return this.GetAll<ApiResponse>('/Sector/GetDropdownRecords');
	}

	getApplicableList(){
		return this.GetAll<ApiResponse>('/Sector/GetSectorWithAccessToList');
	}

	getWorkFlowData(){
		return this.GetAll<ApiResponse>('/aprcnf/select');
	}

	getlistOfApprovalConfiguration(){
		return this.GetAll<ApiResponse>('/aprcnf');
	}

	getApprovalRequired(entitiyId:number){
		return this.GetAll<ApiResponse>(`/ApprovalConfiguration/GetDropdownForApprovalAsync?XrmEntityId=${entitiyId}`);
	}

	getApprovalConfigById(Ukey: string, isView?: boolean): Observable<GenericResponseBase<ApprovalEditData>> {
		return this.http.get<GenericResponseBase<ApprovalEditData>>(`${this.baseUrl }/aprcnf-ukey/${Ukey}/${isView}`, { withCredentials: true });
	}

	deleteApprovalConfig(Ukey: string) : Observable<ApiResponse>{
		return this.PutBulk('/ApprovalConfiguration/UpdateBulkData', Ukey);
	}

	public updateApprovalConfigurationStatus(Payload: any) : Observable<ApiResponse>{
		return this.PutBulk('/aprcnf/bulk-status', Payload);
	}

	getAllDataBasedOnWorkFlow(workFlowId:number){
		return this.GetAll<ApiResponse>(`/aprcnf/workflow-config/${workFlowId}`);
	}

	public addApprovalConfiguration(data: DataModel): Observable<GenericResponseBase<IDataItem>> {
		return this.Post('/aprcnf', data);
	}

	public updateApprovalConfiguration(data: DataModel): Observable<GenericResponseBase<IDataItemResponse>> {
		return this.http.put<GenericResponseBase<IDataItemResponse>>(`${this.baseUrl }
			/aprcnf/edit/${data.UKey}`, data, { withCredentials: true });
	}

	public changeSpecificUserSector(data:number[], entityId: any) {
		let xrmEntitiyId = entityId;
		xrmEntitiyId = xrmEntitiyId > Number(magicNumber.zero)
			? xrmEntitiyId
			: null;
		return this.Post(`/usr/select-client-msp-users?xrmEntityId=${xrmEntitiyId}`, data);
	  }

	  public getApprovalConfigDetailsByApprovalInfo(approvalInfo: ApprovalInfoDetails): Observable<GenericResponseBase<BaseTransactionDataModel[]>> {
		return this.Post('/aprvl-dtl/config-details', approvalInfo);
	  }

	  public getApprovalCOnfigForEdit(data:EntityRecord) : Observable<GenericResponseBase<BaseTransactionDataModel[]>>{
		return this.Post('/aprvl-dtl/entityId-recordId', data);
	  }

	  public getApprovalCOnfigForDraft(data:ApprovalInfoDetails) : Observable<GenericResponseBase<BaseTransactionDataModel[]>>{
		return this.Post('/aprvl-dtl/approver-draft', data);
	  }
	  // eslint-disable-next-line max-params
	  public getTimeAndExpenseApprovers(workFlowId: any, actionId:any, recordId:any, assignmentId:any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/ApproveConfig/GetTimeAndExpenseApprovers/${workFlowId}/${actionId}/${recordId}/${assignmentId}`);
	}
}
