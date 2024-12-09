import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Observable } from 'rxjs';
import { ICandidateData } from '../../review-candidates/interface/review-candidate.interface';
import {
	IApproveRequestResponse,
	ICostAccountingListWithIdPayload, IJobCategoryListWithIdPayload, ILabourCategoryListWithIdPayload,
	ILiRequestAddPayload,
	ILiRequestSucessResponse, ILiRequestUpdatePayload, IPreviousLiRequestPayload, IPreviousRequestItemResponse, IReqLibraryDetails,
	IReqLibraryDetailsWithIdPayload, ISectorDetailsAggrLocOrgDropdown, IShiftListWithIdPayload,
	IStaffingAgencyGetPayload, RequestDetails,
	ShiftDetails
} from '../interface/li-request.interface';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { UserPermissions } from '@xrm-master/user/interface/user';
import { IBroadcastDetails, IStaffingAgencyListPayload, ITieredStaffingAgenciesList } from '../interface/broadcast.interface';
import {
	CandidateInterface, IAssignmentRatePayload, ICandidateActionPayload, ICandidateFinalSubmitInterface, ISectorDetailForReqConfig,
	IStaffingMarkupPayload, IUIDConfig, IWageRateDetails, IWageRatePayload
} from '../models/fill-a-request.model';
import { ApproverDataInterface } from '../models/review-request.model';
import { BroadcastInterface } from '../models/broadcast.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IAssignmentRequirement } from '../../professional/interface/preview.interface';
import { IShiftRequirement } from '../../professional/interface/shared-data.interface';

@Injectable({
	providedIn: 'root'
})
export class LightIndustrialService extends HttpMethodService {

	constructor(
		private http: HttpClient,
		private toasterService: ToasterService
	) {
		super(http);
	}

	public getLIRequest(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/lireq');
	}

	// use for both single and multiple status update of an data object
	public updateLIRequestStatus(ukey: string): Observable<ApiResponse> {
		return this.PutBulk('/lireq/bulk-status', ukey);
	}

	// use for add data object
	public addLiRequest(data: ILiRequestAddPayload): Observable<GenericResponseBase<ILiRequestSucessResponse>> {
		return this.Post('/lireq/save', data);
	}

	// use for updata data object
	public updateLiRequest(uKey: string, data: ILiRequestUpdatePayload): Observable<GenericResponseBase<ILiRequestSucessResponse>> {
		data.UKey = uKey;
		return this.Put(`/lireq-ukey-edit`, data);
	}
	// use for get data object by id
	public getLIReqViewById(Ukey: string): Observable<GenericResponseBase<RequestDetails>> {
		return this.Get<GenericResponseBase<RequestDetails>>(`/lireq-ukey`, Ukey);
	}

	// use for approve request
	public approveLiRequest(data: ApproverDataInterface): Observable<GenericResponseBase<IApproveRequestResponse>>{
		return this.Post('/lireq/ApproveLiRequest', data);
	}

	// use for approve request
	public declineLiRequest(data: ApproverDataInterface): Observable<GenericResponseBase<IApproveRequestResponse>> {
		return this.Post('/lireq/DeclineLiRequest', data);
	}

	// Get privious requests as loggedIn user
	public getPreviousLIRequest(reqManagerId: number | null | undefined, data: IPreviousLiRequestPayload)
		: Observable<GenericResponseBase<IPreviousRequestItemResponse>> {
		return this.Post(`/lireq/copy-previous-request/${reqManagerId}`, data);
	}

	// for Sector dependent dropdown
	public getDropdownValueBasedOnSector(id: number): Observable<ISectorDetailsAggrLocOrgDropdown> {
		return this.Get<ISectorDetailsAggrLocOrgDropdown>('/lireq/select-aggr-lireq', id);
	}

	// Common function to generate daysInfo array
	public generateDaysInfo(data: ShiftDetails | IAssignmentRequirement | IShiftRequirement | null): DayInfo[] {
		const days: { day: string; key: DayKey }[] = [
			{ day: 'Sunday', key: 'Sun' },
			{ day: 'Monday', key: 'Mon' },
			{ day: 'Tuesday', key: 'Tue' },
			{ day: 'Wednesday', key: 'Wed' },
			{ day: 'Thursday', key: 'Thu' },
			{ day: 'Friday', key: 'Fri' },
			{ day: 'Saturday', key: 'Sat' }
		];

		return days.map(({ day, key }) =>
			({
				day,
				isSelected: data
					? (data as Record<DayKey, boolean>)[key] ?? false
					: false
			})) as DayInfo[];
	}

	public getStaffingAgenciesList(reqIds: IStaffingAgencyListPayload): Observable<GenericResponseBase<ITieredStaffingAgenciesList>> {
		return this.Post('/staf/broadcast-eligible-agencies', reqIds);
	}

	public requestBroadcast(data: BroadcastInterface) {
		return this.Post('/reqbroadcast/broadcast', data);
	}
	public requestRebroadcast(data: BroadcastInterface) {
		return this.http.put<ApiResponse>(`${this.baseUrl}/reqbroadcast/re-broadcast`, data, { withCredentials: true });
	}

	public getRequestBroadcast(Ukey: string) {
		return this.Get<GenericResponseBase<IBroadcastDetails>>(`/reqbroadcast/reqbroadcastukey`, Ukey);
	}

	public checkStaffingAgenciesList(reqIds: IStaffingAgencyGetPayload): Observable<GenericResponseBase<true>> {
		return this.http.get<GenericResponseBase<true>>(
			`${this.baseUrl}/stafmarkup/check-secId-locId-lcId/${reqIds.secId}/${reqIds.locid}/${reqIds.laborcatid}`,
			{ withCredentials: true }
		);
	}

	public formatWeekData(weekDaysArray: ShiftDetails | null) {
		if (weekDaysArray) {
			return [
				weekDaysArray.Sun,
				weekDaysArray.Mon,
				weekDaysArray.Tue,
				weekDaysArray.Wed,
				weekDaysArray.Thu,
				weekDaysArray.Fri,
				weekDaysArray.Sat
			];
		} else {
			return [];
		}
	}

	public getLocationDropdownEdit(reqIds: { secId: number, locid: number }) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/loc/select-sectorid/${reqIds.secId}/${reqIds.locid}`,
			{ withCredentials: true }
		);
	}
	public getOrgLevel1DropdownEdit(reqIds: { secId: number, orgLevel1Id: number }) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/org1-select-sector-id/${reqIds.secId}/${reqIds.orgLevel1Id}`,
			{ withCredentials: true }
		);
	}
	public getOrgLevel2DropdownEdit(reqIds: { secId: number, orgLevel2Id: number }) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/org2-select-sector-id/${reqIds.secId}/${reqIds.orgLevel2Id}`,
			{ withCredentials: true }
		);
	}
	public getOrgLevel3DropdownEdit(reqIds: { secId: number, orgLevel3Id: number }) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/org3-select-sector-id/${reqIds.secId}/${reqIds.orgLevel3Id}`,
			{ withCredentials: true }
		);
	}
	public getOrgLevel4DropdownEdit(reqIds: { secId: number, orgLevel4Id: number }) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/org4-select-sector-id/${reqIds.secId}/${reqIds.orgLevel4Id}`,
			{ withCredentials: true }
		);
	}

	public getCostAccountingCodeDropdown(reqIds: ICostAccountingListWithIdPayload) {
		let url = `${this.baseUrl}/cost-code/select-sector-cost-id/${reqIds.secId}/${reqIds.startDate}`;
		if (reqIds.defaultCostCenterId) {
			url += `/${reqIds.defaultCostCenterId}`;
		}
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			url,
			{ withCredentials: true }
		);
	}

	public getHDRDropdownEdit(reqIds: { locId: number, hourDistributionRuleId: number }) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/loc/select-hdr-by/${reqIds.locId}/${reqIds.hourDistributionRuleId}`,
			{ withCredentials: true }
		);
	}
	public getShiftDropdownEdit(reqIds: IShiftListWithIdPayload) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/sft-sector-li/${reqIds.secId}/${reqIds.shiftId}/${reqIds.locId}`,
			{ withCredentials: true }
		);
	}
	public getRequestingManagerDropdownEdit(reqManagerId: number, data: UserPermissions): Observable<GenericResponseBase<DropdownItem[]>> {
		return this.Post(`/user-detail/user-role-grp-entity-action/${reqManagerId}`, data);
	}
	public getLaborCategoryDropdownEdit(reqIds: ILabourCategoryListWithIdPayload) {
		return this.http.get<GenericResponseBase<DropdownItem[]>>(
			`${this.baseUrl}/lcat/select-sectorid/${reqIds.secId}/${reqIds.laborCatTypeId}/${reqIds.laborCatId}`,
			{ withCredentials: true }
		);
	}
	// for job category dropdown for Li Request
	public getJobCategoryDropdown(data: IJobCategoryListWithIdPayload) {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/rlib/select-job-catgory/${data.locId}/${data.laborCatId}/${data.jobCatId}`);
	}

	// for reason for request dropdown for Li Request
	public getReasonForRequestDropdown(sectorId: number, reasonforRequestId: number) {
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/rqrsn/select-li-sectorid/${sectorId}/${reasonforRequestId}`);
	}


	// Get Req Library  Details Data for Li Request
	public getReqLibraryDetailsEdit(id: IReqLibraryDetailsWithIdPayload) {
		return this.GetAll<GenericResponseBase<IReqLibraryDetails>>(`/rqlib/select-detail-by/
			${id.secId}/${id.locId}/${id.laborCatId}/${id.jobCatId}/${id.reqLibId}`);
	}

	// candidate submit
	public candidateSubmit(data: CandidateInterface): Observable<GenericResponseBase<null>> {
		return this.Post('/cnsub/save-li-candidate', data);
	}
	// candidate edit submit
	public candidateSubmitTentative(data: CandidateInterface): Observable<GenericResponseBase<null>> {
		return this.http.put<GenericResponseBase<null>>(`${this.baseUrl}/cnsub/update-li-candidate`, data, { withCredentials: true });
	}

	public submitFillRequest(data: ICandidateFinalSubmitInterface): Observable<GenericResponseBase<null>> {
		return this.Post('/cnsub/fill-li-cand', data);
	}

	public getRateValue(data: IWageRatePayload): Observable<GenericResponseBase<IWageRateDetails>> {
		return this.Post(`/rate-calculate/request`, data);
	}

	public getStaffingMarkup(data: IStaffingMarkupPayload) {
		return this.http.get<GenericResponseBase<number>>(
			`${this.baseUrl}/stf-mrk/stf-mrk/${data.laborCategoryId}/${data.locationId}`,
			{ withCredentials: true }
		);
	}

	public getCandidateByUkey(Ukey: string): Observable<GenericResponseBase<ICandidateData>> {
		return this.Get<ApiResponse>(`/cnsub-ukey`, Ukey) as Observable<GenericResponseBase<ICandidateData>>;
	}

	public withdrawCandidate(data: ICandidateActionPayload): Observable<GenericResponseBase<null>> {
		return this.PutBulk(`/cnsub/withdraw-candidate`, data);
	}

	public getSectorDetailForReqConfic(sector: number): Observable<GenericResponseBase<ISectorDetailForReqConfig>> {
		return this.Get<GenericResponseBase<ISectorDetailForReqConfig>>(`/sec/allow-payrate`, sector);
	}

	public getAssigmentRate(data: IAssignmentRatePayload): Observable<GenericResponseBase<number>> {
		return this.Post(`/assignment/contractor-basewage`, data);
	}

	public getSectorUIDConfig(sector: number): Observable<GenericResponseBase<IUIDConfig>> {
		return this.Get<GenericResponseBase<IUIDConfig>>(`/sec/uid-config`, sector);
	}

	public multipleErrorValidationMsg(data: any) {
		const messages = data.Data.map((entry: any) =>
			entry.Message);

		// check if there's only one message
		if (messages.length === magicNumber.one) {
			this.toasterService.showToaster(ToastOptions.Error, messages[magicNumber.zero]);
		} else {
			// if there are multiple messages, concatenate them with bullet points
			const listItems = messages.map((message: string) =>
					`<li>${message}</li>`).join('\n'),
				formattedMessage = `<ul>\n${listItems}\n</ul>`;
			this.toasterService.showToaster(ToastOptions.Error, formattedMessage, [], true);
		}
	}

}
export interface DayInfo {
	day: string;
	isSelected: boolean;
}

type DayKey = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
