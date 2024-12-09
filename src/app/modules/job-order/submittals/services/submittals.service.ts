import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubmittalCommonResponse, CalculatedRatesResponse, CalculateRatesPayload, ClientDetails, CreateAddEditApiPayload, ICandidateData,
	ParentData, PRDetails, RecruiterContactInfo, SubmittalDetails, SubmittalDetailsView, WithdrawPayload, ProcessPayload, 
	WithdrawByMspPayload, DeclinePayload, StepperData} from './Interfaces';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';

@Injectable({
	providedIn: 'root'
})
export class SubmittalsService extends HttpMethodService {

	public ParentData: BehaviorSubject<ParentData|null> = new BehaviorSubject<ParentData|null>(null);
	public CalculatedRates: BehaviorSubject<GenericResponseBaseWithValidationMessage<CalculatedRatesResponse|null>|null> =
		new BehaviorSubject<GenericResponseBaseWithValidationMessage<CalculatedRatesResponse|null>|null>(null);
	public IsW2Employee: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public IsChangeRecruiterDetails: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public CandidateDetailsFromPool: BehaviorSubject<ICandidateData|null> = new BehaviorSubject<ICandidateData|null>(null);
	public StepperData: BehaviorSubject<StepperData|null> = new BehaviorSubject<StepperData|null>(null);
	public IsEmailValid: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public IsWageRateChange: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


	constructor(private http: HttpClient)
	{
		super(http);
	}

	public getConfigureClient(): Observable<GenericResponseBase<ClientDetails>> {
		return this.GetAll<GenericResponseBase<ClientDetails>>('/ccl/basic-detail');
	}
	public getSubmittalViewWise(uKey: string): Observable<GenericResponseBase<SubmittalDetailsView>> {
		return this.GetAll<GenericResponseBase<SubmittalDetailsView>>(`/submittal/get-subtl-view-details/${uKey}`);
	}

	public getSubmittalByUkey(uKey:string): Observable<GenericResponseBase<SubmittalDetails>>{
		return this.GetAll<GenericResponseBase<SubmittalDetails>>(`/submittal/get-subtl-edit-details/${uKey}`);
	}

	public calculateRates(payload: CalculateRatesPayload): Observable<GenericResponseBase<CalculatedRatesResponse>>{
		return this.Post<CalculateRatesPayload, CalculatedRatesResponse>('/calculate/markupratevariant', payload);
	}

	public getProfReqData(uKey:string):Observable<GenericResponseBase<PRDetails>>{
		return this.GetAll<GenericResponseBase<PRDetails>>(`/prof-req/prof-request-ukey/${uKey}`);
	}

	public getRecruiterNameList(uKey:string): Observable<GenericResponseBase<DropdownItem[]>>{
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/stafing-agency/recruiter-ddl/${uKey}`);
	}

	public getRecruiterDetails(recruiterNo:number):Observable<GenericResponseBase<RecruiterContactInfo>>{
		return this.GetAll<GenericResponseBase<RecruiterContactInfo>>(`/user-detail/recruiter-detail/${recruiterNo}`);
	}

	public createSubmittal(payload: CreateAddEditApiPayload): Observable<GenericResponseBaseWithValidationMessage<SubmittalCommonResponse>>{
		return this.Post(`/submittal/save`, payload);
	}

	public getWorkerClassificationList(sectorId: number): Observable<GenericResponseBase<DropdownItem[]>>{
		return this.GetAll<GenericResponseBase<DropdownItem[]>>(`/wrcs/select-wrcs/${sectorId}`);
	}

	public updateSubmittal(payload:CreateAddEditApiPayload): Observable<GenericResponseBaseWithValidationMessage<SubmittalCommonResponse>>{
		return this.Put(`/submittal/edit`, payload);
	}

	public withdrawSubmittal(payload: WithdrawPayload): Observable<GenericResponseBase<SubmittalCommonResponse>>{
		return this.Put<WithdrawPayload, SubmittalCommonResponse>(`/submittal/withdraw`, payload);
	}

	public getCandidateByUkey(Ukey: string): Observable<GenericResponseBase<ICandidateData>> {
		return this.Get<ApiResponse>(`/cand-pool-ukey`, Ukey) as Observable<GenericResponseBase<ICandidateData>>;
	}

	public forwardSubmittal(processPayload: ProcessPayload): Observable<ApiResponseBase>{
		return this.Post(`/submittal/forward-submittal`, processPayload);
	}

	public receiveSubmittal(processPayload: ProcessPayload): Observable<ApiResponseBase>{
		return this.Post(`/submittal/receive-submittal`, processPayload);
	}

	public declineSubmittal(processPayload: DeclinePayload[]): Observable<ApiResponseBase>{
		return this.Post(`/submittal/decline-submittal`, processPayload);
	}

	public acknowledgeSubmittal(processPayload: ProcessPayload): Observable<ApiResponseBase>{
		return this.Post(`/submittal/mark-viewed`, processPayload);
	}

	public withdrawSubmittalByMsp(payload: WithdrawByMspPayload[]): Observable<ApiResponseBase>{
		return this.Post(`/submittal/withdraw-submittal`, payload);
	}

	public getDeclineReasonList(sectorId: number): Observable<GenericResponseBase<DropdownItem[]>>{
		return this.GetAll(`/dccd/select-by-sectorid/${sectorId}`);
	}

	public checkEmailDomain(data: {Email: string}): Observable<GenericResponseBase<boolean>> {
		return this.Post('/user-detail/is-email-valid', data);
	}
}
