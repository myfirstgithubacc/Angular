import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageKeys } from '@xrm-shared/enums/storage-keys.enum';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { TokenManagerService } from '@xrm-shared/services/TokenManager/token-manager.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, catchError, switchMap, tap, throwError, Subject, takeUntil } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class JWTInterceptor {
	private unsubscribe$ = new Subject<void>();
	private isRefreshing = false;
	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	private requestQueue: HttpRequest<any>[] = [];

	// eslint-disable-next-line max-params
	constructor(
		private cookies: CookieService,
		private gridViewSrv: GridViewService,
		private tokenSrv: TokenManagerService,
		private sessionSrv: SessionStorageService
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(catchError((error: any) => {
			const tokenInfo = this.tokenSrv.getTokenInfo();

			if (error.error && error.error.Message === 'Refresh Token Invalid/ Expired.') {
				this.sessionSrv.set(StorageKeys[StorageKeys.IsAnotherUserLogin], 'true');
			}

			if (tokenInfo.isTokenExpire && !tokenInfo.isRefreshTokenExpire) {
				return this.manageToken(request, next);
			}

			return throwError(error);
		}));
	}

	private manageToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			return this.refreshToken().pipe(switchMap(() => {
				this.isRefreshing = false;
				this.refreshTokenSubject.next("token");

				this.requestQueue.forEach((queuedRequest) => {
					next.handle(queuedRequest)
						.pipe(takeUntil(this.unsubscribe$)).subscribe();
				});
				this.requestQueue = [];

				return next.handle(request);
			}));
		} else {
			return new Observable((observer) => {
				this.requestQueue.push(request);
			});
		}
	}

	private refreshToken(): Observable<any> {
		const uId = this.cookies.get('X-UID'),
			refreshToken = this.sessionSrv.get(StorageKeys[StorageKeys.RefreshToken]) ?? '',
			obj: { uId: string, refreshToken: string } = { uId: uId, refreshToken: refreshToken };

		return this.gridViewSrv.RenewToken(obj).pipe(tap((response: any) => {
			if (response.Succeeded == true) {
				this.sessionSrv.set(StorageKeys[StorageKeys.RefreshToken], response.RefreshToken);
				this.sessionSrv.set(StorageKeys[StorageKeys.TokenGeneratedOn], response.TokenGeneratedOn);
				this.sessionSrv.set(StorageKeys[StorageKeys.TokenExpiresInMinutes], response.TokenExpiresInMinutes);
				this.sessionSrv.set(StorageKeys[StorageKeys.RefreshTokenExpiresInMinutes], response.RefreshTokenExpiresInMinutes);
			}
		}));
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
