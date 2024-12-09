import { Component, OnInit, Renderer2, OnDestroy, HostListener, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ClearAdvAppliedFilterData } from '@xrm-core/store/advance-filter/actions/adv-filter.actions';
import { StateClear, StateResetAll } from 'ngxs-reset-plugin';
import { AdvanceFilterState } from '@xrm-core/store/states/advance-filter.state';
import { SmartSearchState } from '@xrm-core/store/states/smart-search.state';
import { GridTabNameState } from '@xrm-core/store/states/grid-tab.state';
import { HeaderService } from '@xrm-shared/services/header.service';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { DatePipe } from '@angular/common';
import { NotificationService } from 'src/app/services/masters/notification.service';
import { EMPTY, Subject, combineLatest, forkJoin, switchMap, takeUntil } from 'rxjs';
import { GlobalSearchService } from '@xrm-shared/services/global-search.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmailList } from '@xrm-core/models/recent-alert.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { sunDimension, moonDimension } from '@xrm-shared/icons/xrm-icon-library/xrm-icon-library.component';
import { SearchEventData, UserGuideDetails } from '@xrm-shared/models/header.model';
import { HttpResponse } from '@angular/common/http';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent implements OnInit, OnDestroy {

	@ViewChild('searchTextBox') textBox: HTMLInputElement;

	public userName: string = '';
	public profileUserName: string = '';
	private isLogOut: boolean = false;
	public statuses: boolean = false;
	public Theme: string | null;
	public recentFiveMsg: EmailList[] | null | undefined = [];
	private view: string = '/xrm/landing/messages/view';
	public isActive: boolean = false;
	public dataItem: UserGuideDetails[];
	private menuToggle: boolean;
	public profilePicture: string;
	public isProfilePictureAvailable: boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();
	public webTheme: string = "sun";
	public dimension: string;
	public form: FormGroup;
	public isRecentAlertListOpen = false;
	public isUserGuideListOpen = false;
	public isProfileListOpen = false;


	constructor(
		public router: Router,
		private globalSearch: GlobalSearchService,
		private renderer: Renderer2,
		private store: Store,
		private fb: FormBuilder,
		private authGuardService: AuthGuardService,
		private elementRef: ElementRef,
		private headerServc: HeaderService,
		private notificationService: NotificationService,
		private cdr: ChangeDetectorRef,
		private sessionSrv: SessionStorageService
	) {
		combineLatest([
			this.headerServc.isRecentAlertListOpen$,
			this.headerServc.isUserGuideListOpen$,
			this.headerServc.isProfileListOpen$
		]).subscribe(([isOpen, isUGOpen, isProfileOpen]) => {
			this.isRecentAlertListOpen = isOpen;
			this.isUserGuideListOpen = isUGOpen;
			this.isProfileListOpen = isProfileOpen;
			this.cdr.detectChanges();
		});

		this.form = this.fb.group({
			searchText: []
		});
	}

	ngOnInit(): void {
		this.initializeTheme();
		this.initializeProfilePicture();
		this.handleProfilePictureUpdates();
		this.profileUserName = sessionStorage.getItem('UserDisplayName')?.toString().trim() ?? '';
		this.userName = sessionStorage.getItem('UserDisplayName')?.toString().trim()
			.replace(/,/g, '') ?? '';
		this.headerServc.isMenuVisible.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: boolean) => {
			this.menuToggle = data;
		});

		forkJoin([
			this.notificationService.getFiveRecentEmails(),
			this.headerServc.getUserGuide()
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([recentEmails, userGuide]) => {
			this.recentFiveMsg = recentEmails.Data;
			this.dataItem = userGuide.Data;
		});

	}

	private initializeTheme(): void {
		const storedTheme = this.sessionSrv.get("webThemeLoc");
		if (storedTheme === null) {
			this.webTheme = "moon";
		} else {
			this.webTheme = storedTheme;
		}
		this.getDarkTheme(this.webTheme);
	}

	private initializeProfilePicture(): void {
		const ProfileDmsId = sessionStorage.getItem('ProfileDmsId');
		if (ProfileDmsId) {
			this.headerServc.getClientProfilePicture(ProfileDmsId)
				.pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((res: GenericResponseBase<string>) => {
					if (res.Data) {
						this.isProfilePictureAvailable = true;
						this.profilePicture = res.Data;
						this.cdr.markForCheck();
					}
				});
		}
	}

	private handleProfilePictureUpdates(): void {
		this.headerServc.profilePictureObs
			.pipe(switchMap((data: number) => {
				if (data) {
					this.getUpdatedProfile(data);
				} else {
					this.profilePicture = 'assets/images/users/4.png';
					this.isProfilePictureAvailable = false;
					this.cdr.markForCheck();
				}

				return EMPTY;
			}))
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe();
	}

	private getUpdatedProfile(data: number) {
		this.headerServc.getClientProfilePicture(data).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<string>) => {
			this.isProfilePictureAvailable = true;
			this.profilePicture = res.Data ?? '';
			this.cdr.markForCheck();
		});
	}

	public downloadUserGuide(data: number, displayName: string, type: string) {
		this.headerServc.downloadUserGuide(data).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: HttpResponse<Blob>) => {
			if (res.body) {
				this.downloadFile(res.body, displayName, type);
			}
		});
	}

	private downloadFile(blob: Blob, displayName: string, type: string) {
		const url = window.URL.createObjectURL(blob),
			a = document.createElement('a'),
			fileNameWithExtension = `${displayName}.${type}`;

		a.href = url;
		a.download = fileNameWithExtension;
		a.click();

		window.URL.revokeObjectURL(url);
	}


	public logOut() {
		this.renderer.removeClass(document.body, "darkShow");
		this.authGuardService.logOut();
		this.isLogOut = true;
	}


	public getInitials() {
		let name = this.profileUserName.split(',');
		name = name.map((data: string) => {
			return data.trim();
		});
		return `${(name[0][0] + name[1][0]).toUpperCase()}`;
	}

	public sideToggleCollapse() {
		this.menuToggle = !this.menuToggle;
		this.headerServc.isMenuVisible.next(this.menuToggle);
	}

	public toggleLightAndDarkThemeSwitcher() {
		if (this.webTheme == "sun") {
			this.sessionSrv.set("webThemeLoc", "moon");
			this.dimension = moonDimension;
		} else {
			this.sessionSrv.set("webThemeLoc", "sun");
			this.dimension = sunDimension;
		}

		this.webTheme = this.sessionSrv.get("webThemeLoc") ?? "sun";
		this.getDarkTheme(this.webTheme);
	}

	private getDarkTheme(theme: string) {
		if (this.webTheme == "sun") {
			this.renderer.addClass(document.body, "darkShow");
		} else {
			this.renderer.removeClass(document.body, "darkShow");
		}
	}

	public getFiveRecentEmails() {
		this.notificationService.getFiveRecentEmails().pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<EmailList[]>) => {
				this.recentFiveMsg = data.Data;
			});
	}

	@HostListener('document:click', ['$event'])
	onClickOutside(event: Event) {
		const button = document.querySelector('.side-collapse-button'),
			menu = document.querySelector('.main-menu'),
			search = document.querySelector('.search-wrapper.active');

		if (!button?.contains(event.target as Node) && !menu?.contains(event.target as Node)) {
			if (this.menuToggle) {
				this.headerServc.isMenuVisible.next(false);
			}
		}

		if (!search?.contains(event.target as Node)) {
			if (this.isActive) {
				this.searchToggle({ value: '' });
			}
		}
	}

	@HostListener('document:click', ['$event'])
	onClick(event: MouseEvent) {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.headerServc.setDropdownState('recentAlert', false);
			this.headerServc.setDropdownState('userGuide', false);
			this.headerServc.setDropdownState('profile', false);
		}
	}

	public dateTimeTransform(data: Date) {
		const datePipe = new DatePipe('en-US'),
			formattedDate = datePipe.transform(data, 'MM/dd/yyyy'),
			formattedTime = datePipe.transform(data, 'hh:mm a');
		return `${formattedDate} ${formattedTime}`;
	}


	public navigateToMessage(dataItem: EmailList) {
		this.router.navigate([`${this.view}/${dataItem.EmailLogUkey}`]);
	}

	public navigateToList() {
		this.router.navigate(['/xrm/landing/messages/list']);
	}

	public searchroute(e: string): void {
		this.isActive = !this.isActive;
		if (!this.isActive && (e !== '')) {
			this.globalSearch.headerSearchText.next({ searchText: e, module: XrmEntities.LightIndustrialRequest });
			this.router.navigateByUrl('/xrm/landing/global-search/list');
			this.form.controls['searchText'].patchValue('');
			this.textBox.blur();
		}
	}

	public toggleDropdown(dropdownType: string) {
		if (dropdownType === 'recentAlert') {
			this.headerServc.setDropdownState('recentAlert', !this.isRecentAlertListOpen);
		} else if (dropdownType === 'userGuide') {
			this.headerServc.setDropdownState('userGuide', !this.isUserGuideListOpen);
		} else if (dropdownType === 'profile') {
			this.headerServc.setDropdownState('profile', !this.isProfileListOpen);
		}
	}

	public searchToggle(e: SearchEventData): void {
		this.isActive = !this.isActive;
		if (!this.isActive) {
			e.value = "";
		}
	}

	ngOnDestroy(): void {
		if (this.isLogOut) {
			this.store.dispatch(new StateClear());
			this.store.dispatch(new StateResetAll(
				AdvanceFilterState,
				SmartSearchState,
				GridTabNameState
			));
			this.store.dispatch(new ClearAdvAppliedFilterData());
			this.headerServc.profilePicture.next(magicNumber.zero);
			this.headerServc.isMenuVisible.next(false);
			this.destroyAllSubscribtion$.next();
			this.destroyAllSubscribtion$.complete();
		}
	}

}
