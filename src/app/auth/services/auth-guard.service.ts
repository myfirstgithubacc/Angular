import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '@xrm-master/user/service/users.service';
import { StorageKeys } from '@xrm-shared/enums/storage-keys.enum';
import { NextTabAllowList } from '@xrm-shared/services/common-constants/controltypes';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { MenuService } from '@xrm-shared/services/menu.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Subject, takeUntil } from 'rxjs';
import { AppRouting } from 'src/app/app-routing.module';
import { NotifierService } from 'src/app/shared/services/notifier.service';
import { LoginService } from './login.service';
@Injectable({
	providedIn: 'root'
})
export class AuthGuardService {
	unsaved: boolean = false;
	private readonly sessionIdKey = 'sessionId';
	private readonly userStatusKey = 'userStatus';
	private unsubscribe$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private sessionStorageSrv: SessionStorageService,
		private loginService: LoginService,
		private notifierService: NotifierService,
		private usersService: UsersService,
		private router: Router,
		private menuService: MenuService,
		private toasterService: ToasterService
	) { }

	public isLoggedInUser(): boolean {
		// Allow next table
		const currentUrl: any = this.router.getCurrentNavigation()?.finalUrl;
		let isLogin = this.sessionStorageSrv.get('loggedIn');
		NextTabAllowList.forEach((el) => {
			if (el == currentUrl) {
				this.sessionStorageSrv.set('loggedIn', 'true');
			}
		});
		//* ****End **********/
		isLogin = this.sessionStorageSrv.get('loggedIn');
		if (document.cookie.includes('X-UID') && isLogin) {
			return true;
		}
		if (document.cookie.includes('X-UID') && !isLogin) {
			this.notifierService.error('Not allow to open in another tab');
			this.logOut();
			return false;
		}
		if (!document.cookie.includes('X-UID')) {
			this.sessionStorageSrv.remove('loggedIn');
		}
		return false;
	}

	public logOut() {
		this.loginService.Logout()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((s: any) => {
				if (s.statusCode == magicNumber.twoHundred || s.StatusCode == magicNumber.twoHundred) {
					this.loginService.clearStorage();
					this.clearBrowserCache();
					this.sessionStorageSrv.clear();
					this.menuService.clearRoutes();
					this.sessionStorageSrv.remove('loggedIn');
					this.sessionStorageSrv.remove('IsAcknowledge');
					this.usersService.roleGroupId.next(null);
					this.router.resetConfig(new AppRouting().getRoute());
					localStorage.removeItem(StorageKeys[StorageKeys.loggedIn]);
					
					//window.location.reload();
					this.router.navigate(['/auth/login']);
					this.toasterService.resetToaster();
				}
			});
	}

	private clearBrowserCache(): void {
		this.clearCookies();
		sessionStorage.clear();
		localStorage.clear();
		if (window.caches) {
			caches.keys().then((names) => {
				names.forEach((name) => {
					caches.delete(name);
				});
			});
		}
	}

	private clearCookies(): void {
		const cookies = document.cookie.split(';');
		for (const cookie of cookies) {
			const eqPos = cookie.indexOf('='),
				name = eqPos > -1
					? cookie.substr(0, eqPos)
					: cookie;
			document.cookie = `${name}=;expires=${new Date().toUTCString()};path=/`;
		}
		console.log('Cookies cleared:', document.cookie);
	}

	public isUnsavedCopy(): boolean {
		return this.unsaved;
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
