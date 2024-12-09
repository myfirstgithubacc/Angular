import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable } from 'rxjs';
import { ActionResponse, SelectedCandidate, SubmittalResponse } from '../interfaces/mass-candidate';
import { IDropdown } from '@xrm-shared/models/common.model';
import { DropdownItem } from '@xrm-shared/models/tree-dropdown.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';

@Injectable({
	providedIn: 'root'
})
export class MassComparsionService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public getCandidates(candidates: SelectedCandidate): Observable<GenericResponseBase<SubmittalResponse>> {
		return this.Post(`/submittal/compare-submittals`, candidates);
	}
	public getDeclineReason(sectorId: number): Observable<GenericResponseBase<DropdownItem[]>> {
		return this.GetAll(`/dccd/select-by-sectorid/${sectorId}`);
	}
	public getActions() { }

	public getSelectionReason(sectorId: number): Observable<GenericResponseBase<DropdownItem[]>>{
		return this.GetAll(`/slcd/select-sectorid/${sectorId}`);
	}
	public getOfferApprover() { }

	public submitCandidates(candidates: ActionResponse[]): Observable<ApiResponseBase> {
		return this.Post(`/submittal/bulk-actions`, candidates);
	}
}
