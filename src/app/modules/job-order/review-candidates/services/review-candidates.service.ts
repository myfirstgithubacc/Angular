import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable } from 'rxjs';
import { IDeclineCandidate, ISelectCandidate } from '../interface/review-candidate.interface';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IDropdownOption } from '@xrm-shared/models/common.model';

@Injectable({
	providedIn: 'root'
})
export class ReviewCandidatesService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public getDeclineReasonByID(sector: number): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.Get<GenericResponseBase<IDropdownOption[]>>(`/dccd/select-by-sectorid`, sector);
	}

	public declineCandidate(data: IDeclineCandidate): Observable<ApiResponseBase> {
		return this.PutBulk(`/cnsub/decline-li-cand`, data);
	}

	public selectCandidate(ukey: ISelectCandidate): Observable<ApiResponseBase> {
		return this.Post(`/cnsub/select-li-cand`, ukey);
	}
}
