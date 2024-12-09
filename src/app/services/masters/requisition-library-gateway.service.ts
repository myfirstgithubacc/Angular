import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CostEstimationDetail, DropdownAggregateResponse, IReqLibraryCommonData, JobDetails, LocationMapping, RequisitionDataAddEdit, RequisitionLibraryAddPayload, RequisitionLibraryUpdatePayload } from '@xrm-master/requisition-library/constant/rate-enum';
import { IBenefitAdderData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { IDropdownItem, IDropdownOption } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
import { IJobCategoryListPayload, IReqLibraryDetails, IReqLibraryDetailsPayload } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';

@Injectable({
	providedIn: 'root'
})
export class RequisitionLibraryGatewayService extends HttpMethodService {

	public laborDataSubject = new Subject<IReqLibraryCommonData>();
	public sharedDataObservable = this.laborDataSubject.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}


	public getRequisitionLibrary(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/rlib');
	}


	public getRequisitionLibraryById(Ukey: string): Observable<GenericResponseBase<RequisitionDataAddEdit>> {
		return this.Get<GenericResponseBase<RequisitionDataAddEdit>>(`/rlib-ukey`, Ukey);
	}


	public addRequisitionLibrary(data: RequisitionLibraryAddPayload) : Observable<ApiResponseBase> {
		return this.Post('/rlib', data);
	}


	public updateRequisitionLibrary(data: RequisitionLibraryUpdatePayload): Observable<ApiResponseBase> {
		const Response = this.http.put(
			`${this.baseUrl}/rlib-ukey/${data.uKey}`,
			data, {
				withCredentials: true
			}
		) as Observable<ApiResponse>;
		return Response;
	}

	public activatedeactivateRequisitionLibrary(data: ActivateDeactivate[]): Observable<ApiResponseBase> {
		return this.PutBulk('/rlib/bulk-status', data);
	}


	public getLaborCategoryDropdown(id: number) {
		return this.Get<GenericResponseBase<IDropdownItem[]>>('/lcat/select-by-sectorid', id);
	}


	public getWorkLocationDropdown(id: number) {
		return this.Get<GenericResponseBase<IDropdownOption[]>>('/loc/select-sectorid', id);
	}

	public getJobcategoryDropdown(id: number) {
		return this.Get<GenericResponseBase<IDropdownItem[]>>('/jcat/select-by-lcatid', id);
	}

	public getIsBenefitAdder(sid: number, lid: number): Observable<GenericResponseBase<IBenefitAdderData[]>> {
		return this.GetAll<GenericResponseBase<IBenefitAdderData[]>>(`/loc/benefit-adder-by-loc/${sid}/${lid}`);
	}


	public getIsWageRateAdjustmentJobCategory(id: number) {
		return this.Get< GenericResponseBase<boolean>>('/jcat/wage-rate-adjustment', id);
	}


	public getJobCategory(id: string) {
		return this.Get< GenericResponseBase<JobDetails>>('/jcat/databind-byukey', id);
	}


	public GetLocationDropdownDataForCopy(id: number) {
		return this.Get<ApiResponse>('/rlib/copy-select-aggr-sectorid', id);
	}


	public getCountryIdBySector(id: number) {
		return this.Get<GenericResponseBase<CostEstimationDetail>>(`/sect/sect-config-for-lcat`, id);
	}


	public GetDropdownDataBySectorId(id: number) {
		return this.Get<DropdownAggregateResponse>('/rlib/create-select-aggr-sectorid', id);
	}


	public copyAnotherLocation(data: LocationMapping) {
		return this.Post('/rlib/copy-to-another-loc', data);
	}


	getSectorDropDownList() {
		return this.GetAll<GenericResponseBase<IDropdownItem[]>>('/sector/select');
	}


	public getSectorDropdownForReqLibraryAsyn(): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.GetAll<GenericResponseBase<IDropdownOption[]>>('/rlib/select-sect');
	}


	public GetLocationDropdownForReqLibraryAsync(id: number) {
		return this.Get<GenericResponseBase<IDropdownOption[]>>('/rlib/select-loc-ddl', id);
	}


	public getJobCategoryDropdown(data: IJobCategoryListPayload) {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/rlib/select-job-catgory/${data.locId}/${data.laborCatId}`);
	}


	public getReqLibraryDetails(id: IReqLibraryDetailsPayload) {
		return this.GetAll<GenericResponseBase<IReqLibraryDetails>>(`/rlib/select-detail-by/${id.secId}/${id.locId}/${id.laborCatId}/${id.jobCatId}`);
	}


	public getLaborCategoryType(id: number) {
		return this.Get<GenericResponseBase<number>>('/lcat/lcat-type-byid', id);
	}
}
