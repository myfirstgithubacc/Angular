import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CandidateDeclineReason } from '@xrm-core/models/candidate-decline-reason.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CanDecRsnData, ICommonDeclineData, RFXSectorDetails } from '@xrm-master/candidate-decline-reason/constant/candidate-decline-reason-interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class CandidateDeclineReasonService extends HttpMethodService{
	public declinereasonSubject = new Subject<ICommonDeclineData>();
	public declinereasonObservable = this.declinereasonSubject.asObservable();


	constructor(private http: HttpClient) {
		super(http);
	}

	getUsedInRadio(){
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>('/static/select-candidatetype');
	}

	getSectorDropDownList() {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>('/sector/select');

	}

	public getRfxDataFromSector(id: number): Observable<GenericResponseBase<RFXSectorDetails>> {
		return this.GetAll<GenericResponseBase<RFXSectorDetails>>(`/sector/SectorBasicDetailById/${id}`);
	}


	public getAllCanDeclineRsn(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/dccd');

	}


	public addCanDeclineRsn(data: CandidateDeclineReason) : Observable<ApiResponse>{
		return this.Post('/dccd/save', data);
	}


	public getCanDeclineRsnById(Ukey: string): Observable<GenericResponseBase<CanDecRsnData>> {
		return this.Get<GenericResponseBase<CanDecRsnData>>(`/dccd-ukey`, Ukey);

	}


	public updateCanDeclineRsn(data: CandidateDeclineReason): Observable<ApiResponse> {
		return this.Put(`/dccd/edit`, data);

	}


	public updateCanDeclineRsnStatus(data: ActivateDeactivate[]): Observable<ApiResponseBase> {
		return this.PutBulk('/dccd/bulk-status', data);
	}


}
