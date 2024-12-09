import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GlobalService } from '@xrm-shared/services/global.service';
import { HeaderService } from '@xrm-shared/services/header.service';
import { ManageTabsService } from '@xrm-shared/services/manage-tabs.service';
import { NotifierService } from '@xrm-shared/services/notifier.service';
import { PageAccessLoggerService } from '@xrm-shared/services/page-access-logger.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthGuardService } from './auth/services/auth-guard.service';
import { LoginService } from './auth/services/login.service';
import { CacheBustingService } from './cache-busting.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
// import { AuthService } from './auth/services/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

	incompatibleBrowser: boolean = false;

	title = 'xrm';
	isIdle: boolean = false;
	idleTime: any;
	refreshToken1: boolean = false;
	private languagePath = `${environment.LocalizationBasePath}${sessionStorage.getItem('ClientName')}
			/Language/${sessionStorage.getItem('ClientCultureCode')}.json`;
	public banned = ['select ', 'update', 'script', '.exe', 'execute', 'union', 'joined', 'delay', 'delete', 'drop', 'truncate', 'alter', 'create', 'like', ' OR ', ' and ', ' order', 'group', 'waitfor', 'sleep', 'having', 'where'];
	public specialChars = /[`!@#$%^&*()_+\[\]{};'"\\|,.<>~]/;
	refreshTokenExpiryTime: any = this.sessionStore.get("RefreshTokenExpiresInMinutes");
	tokenExpiryTime: any = this.sessionStore.get("TokenExpiresInMinutes");
	lastActivityTime = new Date();
	dateAfterAddExpiryTime: any = this.timeAfterAddExpiryTime(new Date(), this.tokenExpiryTime);
	@HostListener('document:mousemove', ['$event'])
	@HostListener('document:keypress', ['$event'])
	onUserActivity(event: MouseEvent | KeyboardEvent): void {

	}
	private unsubscribe$ = new Subject<void>();
	public exportClearTimeOut: any = null;
	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		public titleService: PageTitleService,
		public titlepage: Title,
		public activatedRoute: ActivatedRoute,
		public global: GlobalService,
		private headerService: HeaderService,
		public authGuardSrv: AuthGuardService,
		public pageAccessLoggerService: PageAccessLoggerService,
		private sessionStore: SessionStorageService,
		private notifierService: NotifierService,
		private cacheBustingService: CacheBustingService,
		private loginSrv: LoginService,
		private manageTabsSrv: ManageTabsService,
		private browserService: GlobalService,
		private localizationSrv: LocalizationService
	) {
		// this.checkIdleTime();
		router.events
			.pipe(
				filter((e: Event) =>
					e instanceof NavigationStart),
				takeUntil(this.unsubscribe$)
			)
			.subscribe((e: RouterEvent) => {
				const navigationUrl = (e as NavigationStart).url.toLowerCase(),
					url = environment.BASE_URL + navigationUrl;
				// eslint-disable-next-line @typescript-eslint/prefer-for-of
				if (!this.isEmailLink(navigationUrl)) {
					for (const bannedWord of this.banned) {
						if (
							url.search(bannedWord.toLowerCase()) !== magicNumber.minusOne
							|| this.specialChars.test(url)
						) {
							this.router.navigate(['/xrm/master']);
							// Optional: exit the loop early if a match is found
							break;
						}
					}
				}
			});

		this.localizationSrv.setDefaultLanguage();
	}

	private checkIdleTime(): void {
		this.exportClearTimeOut = setInterval(() => {
			const refreshTokenExpiryTime: any = this.sessionStore.get("RefreshTokenExpiresInMinutes"),
				idleTime = this.getIdleDuration();
			if (idleTime == refreshTokenExpiryTime && this.sessionStore.get('loggedIn')) {
				this.logOut();
			}
		}, magicNumber.sixtyThousand);
	}

	private newBuildDeployedUI() {
		this.cacheBustingService.checkForUpdates().subscribe((hasNewVersion) => {
			if (hasNewVersion) {
				if (confirm('A new update is ready! Would you like to load it now?')) {
					this.cacheBustingService.applyUpdate();
				}
			}
		});
	}

	// private newBuildDeployedAPI() {
	// 	this.notifierService.statusCode1.subscribe((status) => {
	// 		if (status) {
	// 			console.log("Going to logout API",status);
	// 			if (confirm('A new update is ready! Please Login Again.')) {
	// 				// localStorage.clear();
	// 				// sessionStorage.clear();
	// 				// this.router.navigate(["/auth/login"]);
	// 			}
	// 		}
	// 	});
	// }

	ngOnInit(): void {
		// this.manageTabsSrv.trackTab();
		// window.addEventListener('beforeunload', () => this.manageTabsSrv.handleTabClose());
		const browser = this.browserService.getBrowserName();
		if (browser === 'Firefox') {
			this.incompatibleBrowser = true;
		}
		// this.checkDuplicateTab();

		// eslint-disable-next-line one-var
		const appTitle = this.titlepage.getTitle();
		this.router
			.events.pipe(
				filter((event: any) =>
					event instanceof NavigationEnd),
				map(() => {
					let child = this.activatedRoute.firstChild;
					while (child?.firstChild) {
						child = child.firstChild;
					}

					if (child?.snapshot.data['title']) {
						return child.snapshot.data['title'];
					}
					return appTitle;
				}),
				takeUntil(this.unsubscribe$)
			).subscribe((ttl: any) => {
				//this.newBuildDeployedAPI();
				//this.newBuildDeployedUI();
				this.global.getRoute.next(true);
				this.titleService.setTitle(ttl);
				this.titleService.getRoute.next(this.router.routerState.snapshot.url);
				if (this.sessionStore.get('loggedIn')) {
					this.pageAccessLoggerService.fnGetRoutes(this.router.routerState.snapshot.url);
				}
			});
	}

	timeAfterAddExpiryTime(date: any, tokenExpiryTime: any) {
		const minuteToAdd = Number(tokenExpiryTime) - Number(magicNumber.five);
		date.setMinutes((Number(date.getMinutes()) + Number(minuteToAdd)));
		return new Date(date);
	}


	getIdleDuration(): number {
		const currentTime = new Date(),
			millisecondsSinceLastActivity = currentTime.getTime() - this.lastActivityTime.getTime(),
			seconds = Math.floor(millisecondsSinceLastActivity / Number(magicNumber.oneThousand)),
			minutes = Math.floor(seconds / Number(magicNumber.sixty));
		return minutes;
	}

	refreshToken() {
		// this.global.renewToken();
		this.refreshToken1 = true;
		this.dateAfterAddExpiryTime = this.dateAfterAddExpiryTime(new Date(), this.tokenExpiryTime);
		this.lastActivityTime = new Date();
	}
	private isEmailLink(url: string): boolean {
		const breakUrl = url.split('_');
		if (breakUrl.length >= magicNumber.three) {
			const encryptedUrl = breakUrl[breakUrl.length - magicNumber.one],
				extractedValue = this.extractAlphabets(encryptedUrl);
			if (extractedValue.length == magicNumber.two) {
				return true;
			}
		}
		return false;
	}
	private extractAlphabets(encriptedElement: string): string {
		return encriptedElement.replace(/[^a-zA-Z]/g, '');
	}

	logOut() {
		this.lastActivityTime = new Date();
		this.dateAfterAddExpiryTime = this.dateAfterAddExpiryTime(new Date(), this.tokenExpiryTime);
		this.authGuardSrv.logOut();
	}

	ngOnDestroy() {
		clearTimeout(this.exportClearTimeOut);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
