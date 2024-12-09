import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericService } from 'src/app/shared/services/generic.service';

@Injectable({
	providedIn: 'root'
})
export class EventLogService extends GenericService {
	constructor(private http: HttpClient) {
		super(http);
	}

	public recordId = new BehaviorSubject<any>({});
	public entityId = new BehaviorSubject<any>({});
	public isUpdated = new BehaviorSubject<boolean>(false);

	entityIdObs = this.entityId.asObservable();
	recordIdObs = this.recordId.asObservable();
	isUpdatedObs = this.isUpdated.asObservable();

	getEventLogData(entityId: number, recordId: number): Observable<ApiResponse> {
		let queryParams = new HttpParams();
		queryParams = queryParams.append('entityId', entityId);
		queryParams = queryParams.append('recordId', recordId);

		return this.GetAll(`/event/log/${entityId}/${recordId}`);
	}
}
