import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ParentData, RQCCR, SaveUpdatePayload, StatusUpdatePayload } from '@xrm-master/request-cancel-close-reason/Interfaces';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class RequestCancelCloseRequestService extends HttpMethodService{

	constructor(private http: HttpClient) {
		super(http);
	}

	public RQCCRParentData = new BehaviorSubject<ParentData|null>(null);

	public getAllRequestCancelCloseRequest(){
		return this.GetAll(`/req-cancel-close`);
	}

	public addRequestCancelCloseRequest(payload: SaveUpdatePayload):Observable<GenericResponseBase<RQCCR>> {
		return this.Post(`/req-cancel-close/save`, payload);
	}

	public getRequestCancelCloseRequestId(id: string):Observable<GenericResponseBase<RQCCR>> {
		return this.GetAll(`/req-cancel-close-uKey/${id}`);
	}

	public updateRequestCancelCloseRequest(payload: SaveUpdatePayload):Observable<GenericResponseBase<RQCCR>> {
		return this.PutBulk(`/req-cancel-close/edit/${payload.uKey}`, payload);
	}

	public updateRequestCancelCloseRequestStatus(payload: StatusUpdatePayload[]):Observable<GenericResponseBase<null>> {
		return this.PutBulk(`/req-cancel-close/bulk-status`, payload);
	}

	public checkRfxSow(sectorId: string):Observable<GenericResponseBase<boolean>> {
		return this.GetAll(`/org1-isrfx-sow-req/${sectorId}`);
	}

	public GetSectorDropDownList():Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>('/sector/select');
	}

	public checkDuplicate(sectorId: number, cancelCloseReason: string, ukey: string|null = null ): Observable<GenericResponseBase<boolean>>{
		const data = {
			SectorId: sectorId,
			CancelCloseReason: cancelCloseReason,
			Ukey: ukey
		};
		return this.Post('/req-cancel-close-duplicate', data);
	}

	public getSectorList() {
		return this.GetAll(`/Sector/GetDropdownRecords`);
	}
}
