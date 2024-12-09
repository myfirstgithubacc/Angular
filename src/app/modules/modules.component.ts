import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { StorageKeys } from '@xrm-shared/enums/storage-keys.enum';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { TokenManagerService } from '@xrm-shared/services/TokenManager/token-manager.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { CustomThemeService } from '@xrm-shared/services/theme.sevice';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthGuardService } from '../auth/services/auth-guard.service';
import { ManageTabsService } from '@xrm-shared/services/manage-tabs.service';

@Component({
	selector: 'app-modules',
	templateUrl: './modules.component.html',
	styleUrls: ['./modules.component.scss'],
	encapsulation: ViewEncapsulation.None,
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModulesComponent implements OnInit, OnDestroy {
	isHovered: HTMLElement;
	showCanvas = false;
	appliedFontFamily: string = "";
	appliedFontSize: string = "";
	appliedFontWeight: string = "";
	appliedLabelColor: string = "";
	appliedDataColor: string = "";
	private destroyAllSubscribtion$ = new Subject<void>();
	public selected = "Inbox";
	ThemeName: string;
	IconName: string;
	toggleClass: string;
	darktoggleClass: string;
	statuses: boolean = false;
	isShowDivIf = true;
	showSearchBox: boolean = false;
	public margin = { horizontal: 400, vertical: -190 };
	isShow = false;
	isShow2 = false;
	isHomePage: boolean = false;
	notPopup: boolean;

	toggleStatus() {
		this.isShow = !this.isShow;
	}
	toggleStatus2() {
		this.isShow2 = !this.isShow2;
	}

	showSearchMenu() {
		this.showSearchBox = true;
	}
	themeCustomizer() {
		this.showCanvas = !this.showCanvas;
	}


	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private CustomThemeSer: CustomThemeService,
		private ThemeService: CustomThemeService,
		private elementRef: ElementRef,
		private renderer: Renderer2,
		private toasterservice: ToasterService,
		private pageTitleService: PageTitleService,
		private localizationSrv: LocalizationService,
		private tokenSrv: TokenManagerService,
		private authGuardSrv: AuthGuardService,
		private manageTabSrv: ManageTabsService,
		@Inject(DOCUMENT) private document: Document,
		private sessionSrv: SessionStorageService
	) {

		this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd) {
				// if (manageTabSrv.isUserLogin() && !this.manageTabSrv.isCTabExists()) {
				// 	router.navigate(['/multitabaccess']);
				// 	return;
				// }

				const val = this.sessionSrv.get(CultureFormat[CultureFormat.IsJsonFileRefreshed]);
				if (val == '1') {
					localizationSrv.RefreshFile();
					this.sessionSrv.set(CultureFormat[CultureFormat.IsJsonFileRefreshed], '0');
				}
			}
		});
		
		this.localizationSrv.setDefaultLanguage();
	}

	ngOnInit(): void {
		this.startTokenCheck();

		const code = this.sessionSrv.get(CultureFormat[CultureFormat.ClientCultureCode]) ?? 'en-US';
		this.localizationSrv.ChangeCulture(code);
		this.toasterservice.notPopup.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((popup: any) => {
			this.notPopup = popup;
		});

		// Remove breadcrumb from the Home Page
		this.pageTitleService.castTitle.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
			this.isHomePage = (data === 'Xrm');
		});

		this.CustomThemeSer.ThemeName.asObservable().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((name: any) => {
			if (name) {
				this.ThemeName = name;
			}
		});

		this.CustomThemeSer.sideMenuToggle.asObservable().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((cssname: any) => {
			if (cssname) {
				this.toggleClass = cssname;
			}
		});

		this.CustomThemeSer.DarkToggle.asObservable().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((cssname: any) => {
			if (cssname) {
				this.darktoggleClass = cssname;
			}
		});

	}

	ngAfterViewInit() {
		this.localizationSrv.Refresh();
		// const baseElement = this.document.querySelector('base');
		// let path = baseElement ? baseElement.getAttribute('href') ?? 'access-token' : 'access-token';
		// let newValue = 'checkdomain' + path;
		// if (!this.sessionSrv.get(newValue)) {
		// 	this.sessionSrv.remove('loggedIn');
		// 	this.router.navigate(['/auth/login']);
		// }
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

	onFontFamilyChange(event: any) {
		this.appliedFontFamily = event.value;
	}

	onFontSizeChange(event: any) {
		this.appliedFontSize = event.value;
	}

	onFontWeightChange(event: any) {
		this.appliedFontWeight = event.value;
	}

	onDataColorChange(event: any) {
		this.appliedDataColor = event.value;
	}

	sideToggleCollapse() {
		this.statuses = !this.statuses;
		if (this.isShowDivIf) {
			this.ThemeService.setSideToggle('body--expended moreExpended');
		}
		else {
			this.ThemeService.setSideToggle('body--expended');
		}
		this.isShowDivIf = !this.isShowDivIf;
	}

	private themeLinks: HTMLLinkElement[] = [];

	changeTheme(themeName: string) {
		this.themeLinks.forEach((link) => {
			this.renderer.removeChild(this.elementRef.nativeElement, link);
		});
		const link = this.renderer.createElement('link');
		this.renderer.setAttribute(link, 'rel', 'stylesheet');
		this.renderer.setAttribute(link, 'media', 'all');
		this.renderer.setAttribute(link, 'href', `_${themeName}.css`);
		this.renderer.appendChild(this.document.head, link);
		this.themeLinks.push(link);
		localStorage.setItem('Theme', themeName);

	}


	private tokenCheckTimer: any;
	private readonly checkInterval = magicNumber.oneThousand;

	// #region Validate token

	public startTokenCheck(): void {
		this.tokenCheckTimer = setInterval(() => {
			this.checkTokenExpiration();
		}, this.checkInterval);
	}

	private checkTokenExpiration(): void {
		const tokenInfo = this.tokenSrv.getTokenInfo(),
			isAnotherUserLogin = sessionStorage.getItem(StorageKeys[StorageKeys.IsAnotherUserLogin]) == 'true',
			isLogin = this.manageTabSrv.isUserLogin();

		if (!isLogin)
			return;

		if (isAnotherUserLogin || (tokenInfo.isTokenExpire && tokenInfo.isRefreshTokenExpire)) {
			this.authGuardSrv.logOut();
			clearInterval(this.tokenCheckTimer);
		}
	}

	// #endregion Validate Token

}
