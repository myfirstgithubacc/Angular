import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';

@Injectable()
export class ApiHeaderInterceptor implements HttpInterceptor {
	constructor(private sessionStore: SessionStorageService) { }

	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		if (request.url.includes("PageAccessLog/Log")) {
			request = request.clone({
				headers: request.headers.set('IdentifierId', this.sessionStore.getCookieValue("IdentifierId")),
				withCredentials: true
			});
		}

		return next.handle(request);
	}
}
