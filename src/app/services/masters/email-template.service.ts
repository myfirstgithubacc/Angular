import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { EmailTemplatePayload } from '@xrm-master/email-template/constants/models';
import { FileUploadDetails } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class EmailTemplateService extends HttpMethodService {

	public emailTemplateData = new BehaviorSubject<any>(null);
	emailTemplateObservable = this.emailTemplateData.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}
	getJsonData(){
		return this.http.get<any>('file://172.16.0.18/XRMTeam/XRMFiles/XRMv2/LocalizationWebSite/Clients/wwwroot/Development/PB/Language/email-en-US.json');
	}

	getAllEmailTemplate() : Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/email-temp');
	}

	getEmailTemplateById(uKey: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>('/email-temp-ukey', uKey);
	}

	getConfigurableDynamicFields(){
		return this.GetAll<ApiResponse>('/email-temp-dynamic-field');
	}

	getUDFDynamicFields(id: number, sectorId: number | null){
		return this.GetAll<ApiResponse>(`/email-temp-udf/${id}/${sectorId}`);
	}

	getBasicDynamicFields(id: number){
		return this.Get<ApiResponse>('/email-temp-basic', id);
	}

	getRecipientUserType(){
		return this.GetAll<ApiResponse>('/email-getrecipientuser');
	}

	getActiveUser(){
		return this.GetAll<ApiResponse>('/email-temp-getactiveuser');
	}

	getRolesType(){
		return this.GetAll<ApiResponse>('/email-temp-usertype');
	}

	public getSectorUkey(sectorId: number, masterId: number) {
		return this.GetAll<ApiResponse>(`/email-temp-sec-chng/${sectorId}/${masterId}`);
	}

	UpdateBulkStatus(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<ActivateDeactivate>>{
		return this.PutBulk('/email-temp-emailtype/bulk-status', Ukey);
	}

	updateEmailTemplate(paylaod: EmailTemplatePayload){
		return this.Post('/email-temp-submit/save', paylaod);
	}

	public downloadRecords(payload: number) {
		const response = this.http.post(`${this.baseUrl}/docconfig`, {Id: payload}, { responseType: 'blob', withCredentials: true, observe: 'response' });
		return response;
	}

	addTemplateStaticAttachment(payload: FormData): Observable<GenericResponseBase<GenericResponseBase<FileUploadDetails>>>{
		return this.Post('/email-temp-attach/save', payload);
	}

	getMsgBoardTransitionTime(){
		return this.GetAll<ApiResponse>('/system-config');
	}


	getEmailTemplateDynamicTitleDrp(id:number){
		return this.Get<ApiResponse>('/email-temp-dynamicdoc', id);
	}

	getFooterData(){
		return this.GetAll<ApiResponse>('/emtp/select-ccl-transformation');
	}

}
