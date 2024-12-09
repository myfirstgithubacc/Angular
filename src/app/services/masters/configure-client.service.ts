import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BasicDetails, SupportContactInfo } from '@xrm-core/models/Configure-client/basic-details.model';
import { PasswordPolicy } from '@xrm-core/models/Configure-client/password-policy.model';
import { dropdownModel } from '@xrm-core/models/job-category.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
@Injectable({
	providedIn: 'root'
})
export class ConfigureClientService extends HttpMethodService {

	private footerRefresh = new Subject<void>();

	footerRefresh$ = this.footerRefresh.asObservable();

	public update = new BehaviorSubject<{ reasonForChange: string, update: boolean}>({ reasonForChange: '', update: false});

	updateObs = this.update.asObservable();

	public toMove = new BehaviorSubject<({ApiResponse: GenericResponseBase<null> | null, move: boolean})>({ApiResponse: null, move: false});

	toMoveObs = this.toMove.asObservable();

	public sowReq = new BehaviorSubject<boolean>(false);

	sowReqObs = this.sowReq.asObservable();

	FooterRefresh(): void {
	  this.footerRefresh.next();
	}

	constructor(private http: HttpClient) {
		super(http);
	}

	getTimeZone()
	{
		return this.GetAll<GenericResponseBase<dropdownModel[]>>('/Timezone/select');
	}
	getDefaultCulture()
	{
		return this.GetAll<GenericResponseBase<dropdownModel[]>>('/culr-info-drp/select');
	}

	getLanguageByCountry(id: string){
		return this.Get<GenericResponseBase<dropdownModel[]>>('/ctry/select-lan-by', id);
	}

	getCountry()
	{
		return this.GetAll<GenericResponseBase<dropdownModel[]>>('/ctry/select');
	}

	getWeekending()
	{
		return this.GetAll<GenericResponseBase<dropdownModel[]>>(`/weekday/select`);
	}

	getBasicDetails(){
		return this.GetAll<GenericResponseBase<BasicDetails>>('/ccl/basic-detail');
	}

	getSystemMessages(){
		return this.GetAll<ApiResponse>('/ccl/system-message');
	}

	getStaffingAgency(){
		return this.GetAll<ApiResponse>('/ccl/staffing-agency-type');
	}

	getSingleSignOn(){
		return this.GetAll<ApiResponse>('/ccl/user-type-auth-channel');
	}

	getMobileData(clientName:string){
		return this.Get<ApiResponse>('/ccl/mobile-client', clientName);
	}

	getStaticDataTypeListforDropDownAsync(TypeName : string)
	{
		 return this.Get<ApiResponse>('/StaticDataType/select-staticdatatypelist', TypeName);

	}
	getSecurityClearance(){
		return this.GetAll<ApiResponse>('/ccl/security-clearance');
	}
	getLocationOfficers(){
		return this.GetAll<ApiResponse>('/ccl/location-officer-type');
	}
	getPasswordPolicy()
	{
		return this.GetAll<GenericResponseBase<PasswordPolicy>>('/ccl/user-account-config');
	}
	getSupportDetail(): Observable<GenericResponseBase<SupportContactInfo>>{
		return this.GetAll<GenericResponseBase<SupportContactInfo>>(`/ccl/desktop-support`);

	}

	updateBasicDetails(data: BasicDetails): Observable<GenericResponseBase<null>>{
		return this.Put('/ccl/basic-detail', data);
	}

	updateSystemMessages(data:any): Observable<GenericResponseBase<null>>{
		return this.PutBulk('/ccl/system-message', data);
	}

	updateStaffingAgency(data:any): Observable<GenericResponseBase<null>>{
		return this.PutBulk('/ccl/staffing-agency', data);
	}

	updateSecurityClearance(data:any): Observable<GenericResponseBase<null>>{
		return this.PutBulk('/ccl/security-clearance', data);
	}
	updateLocationOfficersType(data:any): Observable<GenericResponseBase<null>>{
		return this.PutBulk('/ccl/location-officer-type', data);
	}

	updatePasswordPolicy(data:any): Observable<GenericResponseBase<null>>{
		return this.Put('/ccl/user-account-config', data);
	}

}
