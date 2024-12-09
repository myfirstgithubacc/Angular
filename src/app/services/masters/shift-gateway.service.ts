import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { Injectable } from '@angular/core';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { activateDeactivate, AddDispatchApiData, AddDispatchShiftData, CopyInfo, editDispatchApiData, ICommonComponentData, RootObject, SectorDdlData, ShiftDataEditDispatch } from '@xrm-master/shift/constant/shift-data.model';
import { IShiftListPayload, ShiftDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';

@Injectable({
	providedIn: 'root'
})
export class ShiftGatewayService extends HttpMethodService {
	public shiftDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.shiftDataSubject.asObservable();
	constructor(private http: HttpClient) {
		super(http);
	}

	public getAllShiftData(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/sft');
	}

	public activateDeactivateShift(data: activateDeactivate[]): Observable<ApiResponse> {
		return this.PutBulk('/sft/bulk-status', data);
	}

	public getShiftById(Ukey: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/sft-ukey`, Ukey);
	}

	public updateShift(data: ShiftDataEditDispatch): Observable<GenericResponseBase<editDispatchApiData>> {
		const response = this.http.put(`${this.baseUrl}/sft/edit/${data.uKey}`, data, {
			withCredentials: true
		}) as Observable<GenericResponseBase<editDispatchApiData>>;
		return response;
	}

	public addShift(data: AddDispatchShiftData) {
		const response = this.Post('/sft', data) as Observable<GenericResponseBase<AddDispatchApiData>>;
		return response;
	}

	public shiftCopyToAnotherSector(data: CopyInfo) {
		return this.Post('/sft/copy-to-another-sect', data);
	}

	public getSectorHavingShiftForDropdown() {
		return this.GetAll<ApiResponse>('/sft/select-sect-having-sft');
	}

	public getSectorById(id: number): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/sect/sect-config-for-lcat`, id);
	}

	getDropdownDataBySectorId(id: number):Observable<RootObject> {
		return this.GetAll<RootObject>(`/sft/create-select-aggr-sectorid/${id}`);
	}

	public getAllShiftBySectorId(id: string) {
		return this.GetAll<ApiResponse>(`/sft/sfts-by-sectid/${id}`);
	}

	public getWorkLocationDropdown(id: string) {
		return this.Get<ApiResponse>('/loc/select-sectorid', id);
	}

	getSectorDropDownList() {
		return this.GetAll<ApiResponse>('/sector/select');
	}

	getCopySectorDropdownData() {
		return this.GetAll<SectorDdlData>('/sft/copy-select-aggr');
	}

	public getshiftDropdown(reqPayload: IShiftListPayload) {
		return this.GetAll<GenericResponseBase<any>>(`/sft-sector-li/${reqPayload.sectorId}/${reqPayload.locationId}`);
	}

	public getshiftDetailsData(id: number) {
		return this.Get<GenericResponseBase<ShiftDetails>>('/sft/select-sft-detail', id);
	}
	public getLocationBasedTimeClock(locId:number){
		return this.GetAll<ApiResponse>(`/loc/time-clock-config/${locId}`);
	}
}
