import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { Injectable } from '@angular/core';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ICommonComponentData, InewPricingModel, LabCategory } from '@xrm-master/labor-category/enum/enums';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IDropdownOption } from '@xrm-shared/models/common.model';
import { LaborCategory } from '@xrm-core/models/labor-category.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { ILaborCategoryDetails, ILabourCategoryListPayload } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';


@Injectable({ providedIn: 'root' })

export class LaborCategoryService extends HttpMethodService {

	public laborDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.laborDataSubject.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}


	public getLaborCategory(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/lcat');
	}


	public getLaborCategoryById(Ukey: string): Observable<GenericResponseBase<LabCategory>> {
		return this.Get<GenericResponseBase<LabCategory>>(`/lcat-ukey`, Ukey);
	}

	public addLaborCategory(data: LaborCategory): Observable<GenericResponseBaseWithValidationMessage<null>> {
		return this.Post('/lcat/save', data);
	}


	public newgetpricingmodelBySector(id: number) {
		return this.Get<GenericResponseBase<InewPricingModel>>(`/sect/sect-config-for-lcat`, id);
	}


	public updateLaborCategory(data: LaborCategory): Observable<GenericResponseBaseWithValidationMessage<null>> {
		return this.Put('/lcat/edit', data);
	}

	public updateLaborCategoryStatus(data: ActivateDeactivate[]): Observable<ApiResponseBase> {
		return this.PutBulk('/lcat/bulk-status', data);
	}


	public GetStaticDataTypesDropdownWithId(TypeName: string) {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>(`/StaticType/StaticTypesDropdownWithId/${TypeName}`);
	}

	public getSector() {
		return this.GetAll<GenericResponseBase<IDropdownOption>>('/sector/select');
	}

	public getMspProgramManager(): Observable<GenericResponseBase<IDropdownOption>> {
		const roleGroupId: RoleGroupId = RoleGroupId.userRole,
			statusId: RoleGroupId = RoleGroupId.statusId,
			url = `/UserDetail/selectby-rolegrpid-and-status/${roleGroupId}/${statusId}`;
		return this.GetAll<GenericResponseBase<IDropdownOption>>(url);
	}


	public getLaborCategoryType(): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>('/static/select-laborcategorytype');
	}


	public getLaborCategoryDropdown(reqPayload: ILabourCategoryListPayload) {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/lcat/select-sectorid/${reqPayload.secId}/${reqPayload.laborCatTypeId}`);
	}

	public getLabourCategoryDetails(id: number) {
		return this.Get<GenericResponseBase<ILaborCategoryDetails>>('/lcat/select-details-id', id);
	}

}

enum RoleGroupId {
	userRole = 2,
	statusId = 1
}
