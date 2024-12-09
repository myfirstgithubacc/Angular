import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { TerminationReason } from '@xrm-core/models/termination-reason';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { ISectorDetailById } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class TerminationReasonService extends HttpMethodService{

	saveTerminationReason = new BehaviorSubject<boolean>(false);
	saveEventReasonObs = this.saveTerminationReason.asObservable();

	public terminationReasonData = new BehaviorSubject<any>(null);
	terminationReasonObservable = this.terminationReasonData.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	getAllTerminationReason() : Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/trmrsn');
	}

	UpdateBulkStatus(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<ActivateDeactivate>>{
		return this.PutBulk('/trmrsn/bulk-status', Ukey);
	}

	getTerminationReasonById(uKey: string): Observable<GenericResponseBase<TerminationReason>> {
		return this.Get<GenericResponseBase<TerminationReason>>('/trmrsn-ukey', uKey);
	}

	addEventReason(data: TerminationReason): Observable<GenericResponseBase<TerminationReason>> {
		return this.Post('/trmrsn/save', data);
	}

	updateEventReason(data: TerminationReason):Observable<GenericResponseBase<TerminationReason>>{
		return this.Put('/trmrsn/edit', data);
	}

	public getSOWDataFromSector(id: number): Observable<GenericResponseBase<ISectorDetailById>> {
		return this.GetAll<GenericResponseBase<ISectorDetailById>>(`/sector/SectorBasicDetailById/${id}`);
	}
}
