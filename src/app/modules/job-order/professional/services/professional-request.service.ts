import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpMethodService } from "@xrm-shared/services/http-method.service";
import { BehaviorSubject, Observable } from "rxjs";
import {
	IAcknowledgeByMSP,
	IApprovePayload, IAssignmentTypeListPayload, IEstimationPayload, IJobCategoryDetails, ILaborCategoryDetails, IMinimumClearanceToStartList,
	IPermissionsForProfessional,
	IPreviousProfItemResponse, IProfReqSuccessResponse, IProfRequestData, IRequestLibraryItemResponse
} from "../interface/shared-data.interface";
import { GenericResponseBase } from "@xrm-core/models/responseTypes/generic-response.interface";
import { DropdownItem } from "@xrm-core/models/common/dropdown.model";
import { IPreviousLiRequestPayload } from "../../light-industrial/interface/li-request.interface";
import { IDropdownOption } from "@xrm-shared/models/common.model";
import { ApiResponseBase } from "@xrm-core/models/responseTypes/api-response-base.model";
import { ClientDetails, PRDetails } from "../../submittals/services/Interfaces";
@Injectable({
	providedIn: 'root'
})

export class ProfessionalRequestService extends HttpMethodService {
	public saveProfessionalRequest = new BehaviorSubject<any>(false);
	public submitProfessionalRequest = this.saveProfessionalRequest.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}
	public getAssignmentTypeDropdown(data: IAssignmentTypeListPayload) {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/loc/select-ass-type/${data.secId}/${data.locId}`);
	}

	public getMinimumClearanceToStartDropdown(data: IMinimumClearanceToStartList) {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/scl/select-sectorid-isprof/${data.secId}/${data.isProfessional}`);
	}

	public getLabourCategoryDetails(id: number) {
		return this.Get<GenericResponseBase<ILaborCategoryDetails>>('/lcat/select-details-id', id);
	}

	public getJobCategoryDetails(id: number) {
		return this.Get<GenericResponseBase<IJobCategoryDetails>>('/jcat/select-details-id', id);
	}

	public getStaticTypesDropdownWithId(typeName: string) {
		return this.Get<GenericResponseBase<DropdownItem[]>>('/StaticType/StaticTypesDropdownWithId', typeName);
	}
	public getReqLibDetailsToCopy(ids: { secId: number, locId: number }, data: IPreviousLiRequestPayload)
		: Observable<GenericResponseBase<IRequestLibraryItemResponse>> {
		return this.Post(`/reqlib/copy-reqlib-details-paged/${ids.secId}/${ids.locId}`, data);
	}

	public getPreviousProfessionalRequest(reqManagerId: number | null | undefined, data: IPreviousLiRequestPayload)
		: Observable<GenericResponseBase<IPreviousProfItemResponse>> {
		return this.Post(`/prreq/copy-previous-req-paged/${reqManagerId}`, data);
	}

	public saveProfRequest(data: any): Observable<GenericResponseBase<IProfReqSuccessResponse>> {
		return this.Post('/prreq/save', data);
	}

	public updateProfRequest(data: any): Observable<GenericResponseBase<IProfReqSuccessResponse>> {
		return this.Put('/prreq/edit', data);
	}

	public getReqViewById(Ukey: string, stepperId: number): Observable<GenericResponseBase<IProfRequestData>> {
		return this.GetAll<GenericResponseBase<IProfRequestData>>(`/prreq/pr-req-ukey/${Ukey}/${stepperId}`);
	}

	public getPermissionsbyUkey(Ukey:string): Observable<GenericResponseBase<IPermissionsForProfessional>>{
		return this.Get<GenericResponseBase<IPermissionsForProfessional>>('/prreq/pr-req-auth', Ukey);
	}

	public calcBillRate(data: any): Observable<GenericResponseBase<number>> {
		return this.Post('/rate-calculate/calculate-bill-rate', data);
	}

	public calcEstimationCost(data: IEstimationPayload): Observable<GenericResponseBase<number>> {
		return this.Post('/rate-calculate/calculate-estimation-cost', data);
	}

	public getBroadcastReasonData(TypeName: string): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.Get<GenericResponseBase<IDropdownOption[]>>('/StaticType/StaticTypesDropdownWithId', TypeName);
	}

	public approveRequest(data: IApprovePayload): Observable<GenericResponseBase<string>> {
		return this.Post('/profreq/approveprofrequest', data);
	}

	public declineRequest(data: IApprovePayload): Observable<GenericResponseBase<string>> {
		return this.Post('/profreq/declineprofrequest', data);
	}

	public setAcknowledgeByMspStatus(data: IAcknowledgeByMSP): Observable<ApiResponseBase> {
		return this.PutBulk('/prreq/ack-msp-status', data);
	}

	public getProfReqDataForSubmittal(uKey:string):Observable<GenericResponseBase<PRDetails>>{
		return this.GetAll<GenericResponseBase<PRDetails>>(`/prof-req/prof-request-ukey/${uKey}`);
	}

	public getConfigureClient(): Observable<GenericResponseBase<ClientDetails>> {
		return this.GetAll<GenericResponseBase<ClientDetails>>('/ccl/basic-detail');
	}
}
