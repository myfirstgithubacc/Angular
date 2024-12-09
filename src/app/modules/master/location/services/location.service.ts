import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { CommonComponentData, LocationDataByUkey } from '@xrm-core/models/location/location.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IRecordStatusChangePayload, ISectorDetailById } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LocationDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';

@Injectable({
	providedIn: 'root'
})
export class LocationService extends HttpMethodService {
	// get data of clp job rotation from time and expense and use in xrm time clock
	public clpJobRotation = new BehaviorSubject<boolean>(false);
	public clpJobRotationObs = this.clpJobRotation.asObservable();

	// get data of email config in basic details and also used in location officer email config
	public configureClientDetails = new BehaviorSubject<any>(null);
	public configureClientDetailsObs = this.configureClientDetails.asObservable();

	public sharedDataSubject = new Subject<CommonComponentData>();
	public sharedDataObservable = this.sharedDataSubject.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	// use for get all data
	public getLocation(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/loc');

	}

	// use for add data object
	public addLocation(data: any) {
		return this.Post('/loc/save', data);
	}

	// use for update data object
	public updateLocation(data: any): Observable<ApiResponse> {
		return this.Put('/loc-ukey', data);
	}

	// use for get data object by id
	public getLocationById(Ukey: string): Observable<GenericResponseBase<LocationDataByUkey>> {
		return this.Get<GenericResponseBase<LocationDataByUkey>>(`/loc-ukey`, Ukey);
	}
	// use for both single and multiple status update of an data object
	public updateLocationStatus(data: IRecordStatusChangePayload[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/loc/bulk-status', data);
	}

	// use for get data object by id
	public getSectorDetailsBySectorId(id: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/sector-id`, id);
	}

	// get all dropdown list used in location based on sector id selected
	public getLocationAllDropdownListBySectorId(id: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/loc/select-loc`, id);
	}

	// get hour distribution rule dropdown
	public getHourDistributionAllDropdownList(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/hour-distribution/select');
	}
	// get hour distribution rule data
	public getHourDistributionRuleById(id: number): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/hour-distribution-id`, id);
	}
	public getRestMealBreakAllDropdownList(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/meal-break/select');
	}
	public locationAggregate(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/loc/select-aggr-loc');
	}
	public selectState(countryId: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/State/select-state/${countryId}`);
	}
	public userDetail(roleGroupId: any, status: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/user-detail/select-by-rolgrpid-status/${roleGroupId}/${status}`);
	}

	// Get location Data from Sectorid for Li Request
	public getLocationData(id: number) {
		return this.Get<GenericResponseBase<LocationDetails>>('/loc/select-loc-detail', id);
	}

	// Get hdr Data from locationId for Li Request
	public getHdrData(id: number): Observable<GenericResponseBase<DropdownItem[]>> {
		return this.Get<GenericResponseBase<DropdownItem[]>>('/loc/select-hdr-by', id);
	}

	public getDataFromSector(id: number): Observable<GenericResponseBase<ISectorDetailById>> {
		return this.GetAll<GenericResponseBase<ISectorDetailById>>(`/sector/SectorBasicDetailById/${id}`);
	}

	public parseNullableInt(value: any): number | null {
		return value
			? parseInt(value)
			: null;
	}

	public patchValueAsObject(value: any) {
		return value
			? { Value: (value).toString() }
			: null;
	}
}