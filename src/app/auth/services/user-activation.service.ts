import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable } from 'rxjs';
import { ActivateUserPayload, SecurityQuestion, UserData, ValidatePasswordPayload, VerifyUserPayload } from '../user_activation/user_activation_interfaces';
import { PasswordPolicy } from '@xrm-shared/models/common.model';

@Injectable({
	providedIn: 'root'
})
export class UserActivationService extends HttpMethodService {

	public userId = '';

	constructor( private http: HttpClient) {
		super(http);
	}

	public verifyEmailLName(payload: VerifyUserPayload): Observable<GenericResponseBase<UserData>> {

		 const endpoint = `/acc/verify-email-last-name`;

		if (payload.IsUserName) {
			return this.Post(endpoint, payload);
		}
		payload.IsUserName=false;
		return this.Post(endpoint, payload);
	}

	public getAllSecurityQuestions(): Observable<GenericResponseBase<SecurityQuestion[]>> {
		return this.GetAll<GenericResponseBase<SecurityQuestion[]>>('/sec-ques');
	}
	public activateUser(payload: ActivateUserPayload): Observable<GenericResponseBase<null>> {
		return this.Post('/acc/activate-user', payload);
	}

	public markAcknowledeged(userName: string): Observable<GenericResponseBase<null>> {
		return this.Post(`/acc/mark-ack`, userName);
	}

	public validatePassword(data: ValidatePasswordPayload): Observable<GenericResponseBase<null>>{
		return this.Post(`/acc/verify-pwd`, data);
	}

	public verifyUserLoginClearance(userId: string){
		const obj = {Username: userId};
		return this.Post(`/acc/user-log-clear`, obj);
	}

	public getPasswordPolicy(): Observable<GenericResponseBase<PasswordPolicy>> {
		return this.GetAll<GenericResponseBase<PasswordPolicy>>('/acc/pwd-pol');
	}

	public checkUrlValid(url:string): Observable<ApiResponse>{
		return this.GetAll<ApiResponse>(`/acc/acc-verf-token/${url}`);
	}
}
