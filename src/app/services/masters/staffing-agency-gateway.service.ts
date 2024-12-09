import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { StaffingAgency } from '@xrm-core/models/staffing-agency/staffing-agency-add.model';
import { DrpData, StaffingAgencyData, UserDetail } from '@xrm-master/staffing-agency/constant/status-enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class StaffingAgencyGatewayService extends HttpMethodService {
	public enableLink = new BehaviorSubject(false);
	public openRightPanel = new BehaviorSubject(false);
	public Staffing = new BehaviorSubject<StaffingAgencyData | null>(null);
	constructor(private http: HttpClient) {
		super(http);
	}

	public getAllDropdownData(): Observable<GenericResponseBase<DrpData>> {
		return this.GetAll<ApiResponse>('/staf/select-aggr') as Observable<GenericResponseBase<DrpData>>;
	}

	public getAllStaffingAgencyData(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/staf');
	}

	public getStaffingAgencyByUkey(Ukey: string): Observable<GenericResponseBase<StaffingAgencyData>> {
		return this.Get<ApiResponse>(`/staf-ukey`, Ukey) as Observable<GenericResponseBase<StaffingAgencyData>>;
	}

	public activateDeactivateStaffingAgency(data: any): Observable<ApiResponse> {
		return this.PutBulk('/staf/bulk-status', data);
	}

	public GetStaticDataTypeListforDropdownAsync(TypeName: string) {
		return this.GetAll<ApiResponse>(`/StaticType/StaticTypesDropdownWithId/${TypeName}`);
	}

	public getSectorByRfx(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/sector/SectorByRfx');
	}

	public getRoleDropdown(): Observable<ApiResponse> {
		const roleGroupId: RoleGroupId = RoleGroupId.StaffingAgency,
			url = `/Role/DropdownListByRoleGroupId/${roleGroupId}`;
		return this.GetAll<ApiResponse>(url);
	}


	public getUserDetailsByUserID(userId: string | number): Observable<GenericResponseBase<UserDetail>> {
		return this.Get<ApiResponse>('/UserDetail/ByUserNo', userId) as Observable<GenericResponseBase<UserDetail>>;
	}

	public getUserDropdownRecords(stafingId: string | number): Observable<ApiResponse> {
		return this.Get<ApiResponse>('/UserDetail/StaffingAgencyUsers', stafingId);
	}


	public addStaffingAgency(data: StaffingAgency) : Observable<GenericResponseBase<StaffingAgencyData>> {
		return this.Post('/staf/save', data) as Observable<GenericResponseBase<StaffingAgencyData>>;
	}

	public updateStaffingAgency(data: StaffingAgency): Observable<GenericResponseBase<StaffingAgencyData>> {
		const response = this.http.put(`${this.baseUrl}/staf/edit/${data.UKey}`, data, {
			withCredentials: true
		}) as Observable<ApiResponse>;
		return response as Observable<GenericResponseBase<StaffingAgencyData>>;
	}


	getStateDropDownByCountryId(secId: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>('/State/select-state', secId);
	}

	public getIcSowSectorWiseLaborCategories(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/lcat/icsow-labor-categories-by-sector');
	}

	getBasicDetails() {
		return this.GetAll<ApiResponse>('/ccl/basic-detail');
	}

	public getAllDropdownData1(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/staf/select-aggradd');
	}

	checkDublicateUserName(name: string): Observable<GenericResponseBase<boolean>> {
		return this.GetAll(`/user-detail/check-duplicate/${name}`) as Observable<GenericResponseBase<boolean>>;
	}
}
enum RoleGroupId {
	StaffingAgency = magicNumber.three
}
enum UserId {
	StaffingAgency = magicNumber.three
}
