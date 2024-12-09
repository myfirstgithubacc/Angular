import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpMethodService } from "@xrm-shared/services/http-method.service";
import { Observable } from "rxjs";
import { ResetPasswordPayload, UserData } from "../set-new-password/set-new-password-interfaces";
import { GenericResponseBase } from "@xrm-core/models/responseTypes/generic-response.interface";
import { SecurityQuestion, VerifyAnswerPayload } from "../forgot-password/forgot-password-interfaces";
import { ForgetUserIdResponse, ForgotUserIdPayload, User, VerifyUserCredsPayload } from "../forgot-user-id/forgot-user-id-interfaces";
import { PasswordPolicy } from "@xrm-shared/models/common.model";
import { ApiResponse } from "@xrm-core/models/event-configuration.model";

@Injectable({
	providedIn: 'root'
})
export class ForgotUserIdService extends HttpMethodService {
	constructor( private http: HttpClient) {
		super(http);
	}

	public verifyUser(payload:VerifyUserCredsPayload): Observable<GenericResponseBase<User>> {
		 const endpoint = '/acc/verify-email-last-name';
		return this.Post(endpoint, payload);
	}

	public getSecurityQuestionbyUsername(userId:string):Observable<GenericResponseBase<SecurityQuestion[]>>{
		return this.Get<GenericResponseBase<SecurityQuestion[]>>('/sec-ques/rand-ques-useraname', userId);
	}

	public verifySecurityAnswer(data:ForgotUserIdPayload):Observable<GenericResponseBase<ForgetUserIdResponse>>{
		return this.Post('/acc/forgot-uId', data);
	}

	public SendPasswordResetEmail(data: VerifyAnswerPayload): Observable<GenericResponseBase<null>>{
		return this.Post('/acc/send-reset-password-email', data);
	}

	public resetPasswordConfirm(data:ResetPasswordPayload): Observable<GenericResponseBase<null>>{
		return this.Post('/auth/reset-pwd-confirm', data);
	}

	public getPasswordPolicy(): Observable<GenericResponseBase<PasswordPolicy>> {

		return this.GetAll<GenericResponseBase<PasswordPolicy>>('/acc/pwd-pol');

	}

	public passwordResetToken(data:string):Observable<GenericResponseBase<null>>{
		const obj = {UserId: data};
		return this.Post(`/auth/pwd-token`, obj);
	}

	public getUserIdbyUkey(ukey:string):Observable<GenericResponseBase<UserData>>{
		return this.PostExtension<UserData>(`/acc/userid-ukey/${ukey}`);
	}

	public checkUrlValid(url:string): Observable<ApiResponse>{
		return this.GetAll<ApiResponse>(`/acc/acc-verf-token/${url}`);
	}
}
