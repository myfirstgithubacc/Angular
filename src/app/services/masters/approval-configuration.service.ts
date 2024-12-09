/* eslint-disable max-len */
/* eslint-disable max-params */
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import {GenericService} from '../../shared/services/generic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ApprovalConfigurationService extends GenericService{

	public approverLevelRemoved = new BehaviorSubject(false);
	public isSectorChanged:any = new BehaviorSubject({});
	public isDataSaved = new BehaviorSubject(false);
	public isWorkFlowChanged = new BehaviorSubject(false);
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
		return this.GetAll<ApiResponse>('/XrmEntity/GetDropdownListForApprovalConfig');
	}

	getlistOfApprovalConfiguration(){
		return this.GetAll<ApiResponse>('/ApprovalConfiguration/GetAll');
	}

	getApprovalRequired(entitiyId:any){
		return this.GetAll<ApiResponse>(`/ApprovalConfiguration/GetDropdownForApprovalAsync?XrmEntityId=${entitiyId}`);
	}

	getApprovalConfigById(Ukey: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/ApprovalConfiguration/GetByUkey?uKey`, Ukey);
	}

	deleteApprovalConfig(Ukey: any) : Observable<ApiResponse>{
		return this.PutBulk('/ApprovalConfiguration/UpdateBulkData', Ukey);
	}

	public updateApprovalConfigurationStatus(Ukey: any) : Observable<ApiResponse>{
		return this.PutBulk('/ApprovalConfiguration/UpdateBulkStatus', Ukey);
	}

	getAllDataBasedOnWorkFlow(workFlowId:any){
		return this.GetAll<ApiResponse>(`/ApprovalConfiguration/GetWorkFlowConfig?XrmEntityId=${workFlowId}`);
	}

	public addApprovalConfiguration(data: any) {
		return this.Post('/ApprovalConfiguration/SubmitData', data);
	}

	public updateApprovalConfiguration(data: any): Observable<ApiResponse> {
		return this.Put('/ApprovalConfiguration/UpdateData?uKey', data);
	}

	public getTimeAndExpenseApprovers(workFlowId: any, actionId:any, recordId:any, assignmentId:any):Observable<ApiResponse>{
		return this.GetAll<ApiResponse>(`/ApprovalConfiguration/GetTimeAndExpenseApprovers?workFlowId=${workFlowId}&actionId=${actionId}&recordId=${recordId}&assignmentId=${assignmentId}`);
	}
}
