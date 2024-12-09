import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TokenManagerService } from './TokenManager/token-manager.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Platform } from '@angular/cdk/platform';

@Injectable({
	providedIn: 'root'
})
export class GlobalService {
	public getRoute = new BehaviorSubject(true);
	private API = environment.APIURL;
	getRouteObs = this.getRoute.asObservable();
	public persistTab = new BehaviorSubject<any>({});
	persistTabName = this.persistTab.asObservable();
	public gridreset = new BehaviorSubject<any>(null);
	gridreset1 = this.gridreset.asObservable();
	private unsubscribe$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private tokenManager: TokenManagerService,
		private cookies: CookieService,
		private http: HttpClient,
		private platform: Platform
	) {
	}
	getBrowserName(): string {
		if (this.platform.BLINK) {
			return 'Blink (Chrome/Opera/Edge)';
		} else if (this.platform.WEBKIT) {
			return 'Webkit (Safari)';
		} else if (this.platform.TRIDENT) {
			return 'Trident (IE)';
		} else if (this.platform.EDGE) {
			return 'Edge';
		} else if (this.platform.FIREFOX) {
			return 'Firefox';
		} else {
			return 'Unknown';
		}
	}

	getXUIDValue() {
		let value: any;
		const cookies = document.cookie.split(';');
		cookies.forEach((i: any) => {
			if (i.split('=')[0].includes('X-UID')) {
				value = i.split('=')[1];
			}
		});

		return value;
	}

	renewToken() {
		const uId = this.cookies.get('X-UID'),
			refreshToken = this.tokenManager.GetToken('refreshToken'),
			obj: { uId: string, refreshToken: string } = { uId: uId, refreshToken: refreshToken },
			url = `${this.API}/Authentication/RenewToken`,
			obs = this.http.post(url, JSON.stringify(obj));
		obs.pipe(takeUntil(this.unsubscribe$))
			.subscribe((t: any) => {
				if (t.Succeeded == true) {
					this.tokenManager.AddToken("expiresIn", t.token);
					this.tokenManager.AddToken("refreshToken", t.refreshToken);
				}
			});
	}
	private performLogout(): void {
		// Implement your logout logic here

	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
