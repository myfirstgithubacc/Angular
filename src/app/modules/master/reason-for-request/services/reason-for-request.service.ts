import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { ICommonComponentData, IReasonForRequestCopyData, IReasonForRequestData} from '@xrm-core/models/reason-for-request/reason-for-request.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IRecordStatusChangePayload, ISectorDetailById, TreeObject } from '@xrm-shared/models/common.model';
import { ReasonForRequest } from '@xrm-core/models/reason-for-request/reason-for-request.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';

@Injectable({
	providedIn: 'root'
})
export class ReasonForRequestService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public sharedDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.sharedDataSubject.asObservable();

	public addReasonForRequest(data: ReasonForRequest): Observable<ApiResponseBase> {
		return this.Post('/rqrsn/save', data);
	}

	public getReasonForRequestByUkey(Ukey: string): Observable<GenericResponseBase<IReasonForRequestData>> {
		return this.Get<GenericResponseBase<IReasonForRequestData>>(`/rqrsn-ukey`, Ukey);
	}

	public updateReasonForRequest(data: ReasonForRequest): Observable<ApiResponseBase> {
		return this.Put('/rqrsn/edit', data);
	}

	public updateReasonForRequestStatus(data: IRecordStatusChangePayload[]): Observable<ApiResponseBase> {
		return this.PutBulk('/rqrsn/bulk-status', data);
	}

	public copyToAnotherSector(data: IReasonForRequestCopyData): Observable<ApiResponseBase> {
		return this.Post('/rqrsn/copy', data);
	}

	public getDropdownRecordsBySectorId(id: number): Observable<GenericResponseBase<TreeObject[]>> {
		return this.GetAll<GenericResponseBase<TreeObject[]>>(`/rqrsn/select-sectorid/${id}`);
	}

	public getRfxDataFromSector(id: number): Observable<GenericResponseBase<ISectorDetailById>> {
		return this.GetAll<GenericResponseBase<ISectorDetailById>>(`/sector/SectorBasicDetailById/${id}`);
	}

	public getReasonForRequestDropdownLi(sectorId: number): Observable<GenericResponseBase<DropdownItem[]>> {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/rqrsn/select-li-sectorid/${sectorId}`);
	}

	public getReasonForRequestDropdownProff(sectorId: number): Observable<GenericResponseBase<DropdownItem[]>> {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/rqrsn/select-prof-sectorid/${sectorId}`);
	}

}
