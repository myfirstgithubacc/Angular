import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventConfiguration } from '@xrm-core/models/event-configuration.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { CopyInfoData, ICommonEventConfigrationData } from '@xrm-master/event configuration/constant/event-configuration.enum';
import { ActivateDeactivate } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
	providedIn: 'root'
})
export class EventConfigurationService extends HttpMethodService {

	public saveContractorevent = new BehaviorSubject<boolean>(false);
	public _saveContractorevent = this.saveContractorevent.asObservable();

	public eventConfigSubject = new Subject<ICommonEventConfigrationData>();
	public sharedDataObservable = this.eventConfigSubject.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	getEventConfigAll() {
		return this.GetAll('/evnt');
	}
	public getEventConfigById(Ukey: string): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/evnt-ukey/${Ukey}`) as Observable<ApiResponse>;
	}

	public updateEventConfigStatus(data: ActivateDeactivate[]): Observable<ApiResponse> {
		return this.PutBulk('/evnt/bulk-status', data);
	}

	public getSector() {
		return this.GetAll<ApiResponse>('/sector/select');
	}

	public addEventConfig(data: EventConfiguration) {
		return this.Post('/evnt/save', data);
	}

	public updateEventConfig(data: EventConfiguration): Observable<ApiResponse> {
		const response = this.http.put(`${this.baseUrl}/evnt/edit/${data.Ukey}`, data, {
			withCredentials: true
		}) as Observable<ApiResponse>;
		return response;
	}

	public GetStaticDataTypeListforDropdownAsync(TypeName: string) {
		return this.GetAll<ApiResponse>(`/StaticType/StaticTypesDropdownWithId/${TypeName}`);
	}

	public eventCopyToAnotherSector(data: CopyInfoData) {
		return this.Post('/evnt/copy-to-another-sector', data);
	}

	public getEventsBasedOnSectorId(id: string) {
		return this.GetAll<ApiResponse>(`/evnt/select-sector/${id}`);
	}

	public GetSectorForEventCopyDropdown() {
		return this.GetAll<ApiResponse>(`/evnt/select-copy-from-sector`);
	}


}
