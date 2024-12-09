import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventReason } from '@xrm-core/models/event-reason.model';
import { RecordStatusChangeResponse, dropdownWithExtras } from '@xrm-core/models/job-category.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class EventReasonService extends HttpMethodService {

	public eventReasonData = new BehaviorSubject<any>(null);
	eventReasonObservable = this.eventReasonData.asObservable();

	getEventReason() : Observable<ApiResponse>{
		return this.GetAll<ApiResponse>('/evtrsn');
	}

	getEventReasonById(uKey: string): Observable<GenericResponseBase<EventReason>> {

		return this.Get<GenericResponseBase<EventReason>>('/evtrsn-ukey', uKey);

	}

	addEventReason(data: EventReason): Observable<GenericResponseBase<EventReason>> {
		return this.Post('/evtrsn/save', data);
	}

	updateEventReason(data: EventReason):Observable<GenericResponseBase<EventReason>>{
		return this.Put('/evtrsn/edit', data);
	}

	deleteEventReason(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<ActivateDeactivate>>{
		return this.PutBulk('/evtrsn/bulk-status', Ukey);
	}

	getDropdownRecordsBySectorId(sectorId:number): Observable<GenericResponseBase<dropdownWithExtras[]>>{
		return this.GetAll(`/evtrsn/select-sectorid/${sectorId}`);
	}

	EventCopyToAnotherSector(data: any): Observable<GenericResponseBase<EventReason>> {
		return this.Post('/evtrsn/copy', data);
	}

	constructor(private http: HttpClient) {
		super(http);
	}
}
