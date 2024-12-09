import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
import { FormData1, Role, UpdateFormdata, XrmEntityActionResponse } from '../Generictype.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Injectable({
	providedIn: 'root'
})
export class RoleServices extends HttpMethodService {
	public dataContainer = new Subject<any>();
	public dataStream = this.dataContainer.asObservable();
	constructor(private http: HttpClient) {
		super(http);
	}
	// SECTION To-get Roles for role listing.
	getRoleList(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/role');
	}
	// SECTION ends

	// SECTION To-get Roles for role listing.
	getXRMEntityActionList(id?: number): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/xrm-entity-act-role-grp-id/${ id}`);
	}
	// SECTION ends

	// SECTION To-get role by roleNo.
	getRoleByRoleNo(id: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/role/${ id}`);
	}
	getRoleByUkey(ukey: string|number): Observable<GenericResponseBase<Role>> {
		return this.GetAll<GenericResponseBase<Role>>(`/role-uKey/${ ukey}`);
	}
	// SECTION ends

	// SECTION To-get roleActionMapping by roleNo.
	getRoleActionMappingByRoleNo(id: number): Observable<XrmEntityActionResponse> {
		return this.GetAll<XrmEntityActionResponse>(`/xrm-entity-act-role-act-map-role-no/${ id}`);
	}
	// SECTION ends

	// SECTION To-get roleActionMapping by roleNo.
	GetRoleActionMappingForViewByRoleNoAsync(id: any): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/xrm-entity-act-role-act-map-view-role-no/${ id}`);
	}
	// SECTION ends


	// SECTION To-get Roles for role listing.
	createRole(data: FormData1):Observable<GenericResponseBase<null>> {
		return this.Post('/role/save', data);
	}
	// SECTION ends

	// SECTION To-get Roles for role listing.
	updateRole(data: UpdateFormdata, id:string):Observable<GenericResponseBase<null>> {
		return this.PutBulk(`/role/edit/${id}`, data);
	}
	// SECTION ends

	// SECTION To-get UserGroup in Role Module
	getUserGroupList() {
		return this.GetAll<ApiResponse>('/role-select-grp');
	}
	// SECTION ends

	// SECTION - To Activate role based on ID.
	   activateRoleAndDeactivate(data: any): Observable<GenericResponseBase<null>> {
	   	return this.PutBulk('/role/edit-status', data);
	   }
	// SECTION ENDS....


	// SECTION - To Check is Role Exist?
	verifyRoleTitleIsExists(roleName: string, roleId?: number): Observable<ApiResponse> {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return roleId != null && roleId != undefined ?
			this.GetAll<ApiResponse>(`/role-check/duplicate/${ roleName }/${ roleId}`)
			: this.GetAll<ApiResponse>(`/role-check/duplicate/${ roleName}`);
	}
	// SECTION ENDS....

	// SECTION TO get Role Group
	getRoleGroupList(data?: any) {
		return data
			? this.GetAll<ApiResponse>(`/role-select-grp-id-edit/${ data.roleGroupId}`)
			: this.GetAll<ApiResponse>('/role-select-grp-id-add');
	}
	// SECTION ENDS....


}
