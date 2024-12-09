import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login } from './../models/login.model';
import { Observable } from 'rxjs';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { PageAccessLoggerService } from '@xrm-shared/services/page-access-logger.service';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';

@Injectable({
	providedIn: 'root'
})
export class LoginService extends HttpMethodService {
	constructor(
    private http: HttpClient,
    private pageAccessLoggerService: PageAccessLoggerService,
	private sessionSrv: SessionStorageService
	) {
		super(http);
	}
	Loginfn(loginDto: Login): Observable<GenericResponseBase<number[]|null>> {
		 return this.Post<Login, number[]>(
			'/auth',
			loginDto.toJson()
		);
	}

	Logout(): Observable<ApiResponseBase> {
		this.pageAccessLoggerService.fnGetRoutes('');
		return this.PostExtension('/auth/LogOff');
	}

	clearStorage(): void {
		// Save the key you want to preserve
		const preservedValue = this.sessionSrv.get('loginId');
		// Clear the entire localStorage
		 this.sessionSrv.clear();
		// Restore the preserved key-value pair
		if (preservedValue !== null) {
			this.sessionSrv.set('loginId', preservedValue);
		}
	}

	public CheckUserExistence(userId:string): Observable<GenericResponseBase<null>>{
		return this.PostExtension<null>(`/acc-chk-uid/${userId}`);
	}
}
