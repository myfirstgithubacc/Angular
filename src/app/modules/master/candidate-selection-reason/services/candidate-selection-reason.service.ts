import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CandidateSelectionReason } from '@xrm-core/models/candidate-selection-reason/candidate-selection-reason.model';
import { ICommonComponentData, ISelectionReasonUkeyData } from '@xrm-core/models/candidate-selection-reason/candidate-selection-reason.interface';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IRecordStatusChangePayload, ISectorDetailById } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CandidateSelectionReasonService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public sharedDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.sharedDataSubject.asObservable();

	public getDataFromSector(id: number): Observable<GenericResponseBase<ISectorDetailById>> {
		return this.GetAll<GenericResponseBase<ISectorDetailById>>(`/sector/SectorBasicDetailById/${id}`);
	}

	public addCanSelectRsn(data: CandidateSelectionReason): Observable<GenericResponseBase<ISelectionReasonUkeyData>>{
		 return this.Post('/slcd/save', data);
	}

	public getCanSelectRsnByUkey(Ukey: string): Observable<GenericResponseBase<ISelectionReasonUkeyData>> {
		return this.Get<GenericResponseBase<ISelectionReasonUkeyData>>(`/slcd-ukey`, Ukey);
	}

	public updateCanSelectRsn(data: CandidateSelectionReason): Observable<GenericResponseBase<ISelectionReasonUkeyData>> {
		 return this.Put('/slcd-ukey', data);
	}

	public updateCanselectRsnStatus(data: IRecordStatusChangePayload[]): Observable<ApiResponseBase> {
		 return this.PutBulk('/slcd/bulk-status', data);
	}
}

