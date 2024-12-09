/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { GenericService } from './generic.service';
import { PlatformLocation } from '@angular/common';
import { SessionStorageService } from './TokenManager/session-storage.service';
import { magicNumber } from './common-constants/magic-number.enum';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';

@Injectable({
	providedIn: 'root'
})
export class PageAccessLoggerService extends GenericService {
	private unsubscribe$ = new Subject<void>();
	private baseGatewayUrl = `${environment.GATEWAY_URL}/${environment.APIVERSION}`;

	constructor(
		private http: HttpClient,
		private PlatformLocation: PlatformLocation,
		private sessionStore: SessionStorageService
	) {
		super(http);
	}

	pageAccessLogDetails(data: any): Observable<any> {
		return of(null);
	}

	fnGetRoutes(url: any) {
		const location = Object(this.PlatformLocation),
			arr = url.split('/'),

			i = arr.length,
			myForm = {
				category: url === ''
					? 'authentication'
					: arr[i - magicNumber.three],
				module: url === ''
					? 'auth'
					: arr[i - magicNumber.two],
				screen: url === ''
					? 'logout'
					: arr[i - magicNumber.one],
				url: url === ''
					? location._location.origin
					: location._location.href,
				screenResolution: `${window.screen.width}x${window.screen.height}`
			};

		if (myForm.screen === 'login') {
			myForm.category = 'authentication';
		}
		this.pageAccessLogDetails(myForm)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((response: any) => {
				return response;
			});
		return myForm;
	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
