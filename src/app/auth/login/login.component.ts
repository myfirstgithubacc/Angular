import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ScrollViewComponent } from '@progress/kendo-angular-scrollview';
import { SupportContactInfo } from '@xrm-core/models/Configure-client/basic-details.model';
import { SupportDetails } from '@xrm-core/models/Configure-client/system-messages.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SmartSearchSet } from '@xrm-core/store/actions/smart-search.action';
import { ClearAdvAppliedFilterData } from '@xrm-core/store/advance-filter/actions/adv-filter.actions';
import { AdvanceFilterState } from '@xrm-core/store/states/advance-filter.state';
import { GridTabNameState } from '@xrm-core/store/states/grid-tab.state';
import { StorageKeys } from '@xrm-shared/enums/storage-keys.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { MessageBoardService } from '@xrm-shared/services/message-board.service';
import { PageAccessLoggerService } from '@xrm-shared/services/page-access-logger.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { StateClear, StateResetAll } from 'ngxs-reset-plugin';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Configuration, MessageBoard } from 'src/app/modules/extras/landing-page/constants/message-board.model';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { AuthGuardService } from '../services/auth-guard.service';
import { UserActivationService } from '../services/user-activation.service';
import { Login } from './../../auth/models/login.model';
import { LoginService } from './../services/login.service';
import { ValidationError } from './Interfaces';
import { ManageTabsService } from '@xrm-shared/services/manage-tabs.service';


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoginComponent implements OnInit, OnDestroy {

	@ViewChild('myCarousel') carousel: ScrollViewComponent;
	public loginForm: FormGroup;
	public showPassword: boolean = false;
	public isLoginIdValid: boolean = true;
	public userIdControl: FormControl;
	private messageValue: string;
	public support: SupportDetails = {
		contactNumber: '',
		email: ''
	};
	private unsubscribe$ = new Subject<void>();
	private login = new Login();
	public width = "100%";
	private transitionTime: number = magicNumber.thirtyThousand;
	private interval: ReturnType<typeof setTimeout>;
	public height = "400px";
	public containsSingleMessage = false;

	public items = [{ TextContent: '' }];
	public pause: boolean = false;

	private timeoutId: ReturnType<typeof setTimeout>;

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private aroute: ActivatedRoute,
		private route: Router,
		private loginService: LoginService,
		private authGuardSrv: AuthGuardService,
		private sessionStore: SessionStorageService,
		private configureClientService: ConfigureClientService,
		private menuService: MenuService,
		private toasterService: ToasterService,
		private localizationService: LocalizationService,
		private pageAccessLoggerService: PageAccessLoggerService,
		private store: Store,
		private messageBoard: MessageBoardService,
		private userActivationService: UserActivationService,
		private customValidator: CustomValidators,
		private cdr: ChangeDetectorRef,
		private el: ElementRef,
		private manageTabSrv: ManageTabsService,
		@Inject(DOCUMENT) private documentDoc: Document
	) {
		this.userIdControl = new FormControl('');
		this.loginForm = this.formBuilder.group({
			loginId: this.userIdControl,
			password: [''],
			rememberMe: [false]
		});
	}

	ngAfterViewInit(): void {
		this.focusOnTextbox();
	}

	private focusOnTextbox(): void {
		const inputs = this.el.nativeElement.querySelectorAll('input');

		if (inputs.length !== magicNumber.zero) {
			const firstInput = inputs[magicNumber.zero] as HTMLInputElement;
			firstInput.focus();
		}
	}

	public backButton(): void {
		this.toasterService.resetToaster();
		this.showPassword = false;
		this.loginForm.get('password')?.clearValidators();
		this.cdr.detectChanges();
	}

	public getUserId() {
		return this.loginForm.get('loginId')?.value;
	}

	public isPasswordValid() {
		return this.loginForm.get('password')?.value != '' && this.loginForm.get('password')?.value != null;
	}

	ngOnInit(): void {
		this.loginForm.get('loginId')?.setValue(this.getSavedUserID());
		forkJoin([
			this.configureClientService.getSupportDetail(),
			this.messageBoard.getLoginMessages(),
			this.messageBoard.getTransitionTime()
		]).pipe(takeUntil(this.unsubscribe$)).subscribe(([supportDetails, messageBoard, transitionTime]) => {
			this.getSupportDetails(supportDetails);
			this.getMessageBoard(messageBoard);
			this.getTransitionTime(transitionTime);
			this.startCarousel();
			this.cdr.markForCheck();
			this.cdr.detectChanges();
		});
	}

	private startCarousel(): void {
		this.interval = setInterval(() => {
			if (!this.pause && !this.containsSingleMessage) {
				this.carousel.next();
				this.cdr.markForCheck();
			}
		}, this.transitionTime);
	}

	private getMessageBoard(res: GenericResponseBase<MessageBoard[]>): void {
		if (res.Data && res.Data.length > Number(magicNumber.zero)) {
			this.items = res.Data;
		} else {
			this.items = [];
		}
		this.containsSingleMessage = this.items.length <= Number(magicNumber.one);
	}

	private getTransitionTime(res: GenericResponseBase<Configuration[]>): void {
		if (Array.isArray(res.Data) && res.Data.length > Number(magicNumber.zero)) {
			this.transitionTime = parseInt(res.Data[0].ConfigurationValue) * magicNumber.oneThousand;
		} else {
			this.transitionTime = 0;
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.toasterService.resetToaster();
		clearInterval(this.timeoutId);
		clearInterval(this.interval);
	}

	private getSavedUserID(): string {
		const data = this.sessionStore.get('loginId') ?? "";
		if (data != "")
			this.loginForm.get('rememberMe')?.setValue(true);
		return data;
	}

	public isLoginIdEmpty(){
		if(this.getUserId()!='')
			return false;
		return true;
	}

	private rememberMe(): void {
		if (this.login.rememberMe)
			this.sessionStore.set('loginId', `${this.login.loginId}`);
		else
			this.sessionStore.remove('loginId');
	}

	private getSupportDetails(data: GenericResponseBase<SupportContactInfo>): void {
		this.sessionStore.set('supportContactNumber', data.Data?.SupportContactNumber ?? '');
		this.sessionStore.set('supportEmail', data.Data?.SupportEmail ?? '');
		this.support.contactNumber = data.Data?.SupportContactNumber ?? '';
		this.support.email = data.Data?.SupportEmail ?? '';
	}

	public onSubmit(): void {
		this.loginForm.markAsTouched();
		if (!this.loginForm.valid)
			return;

		// if (this.manageTabSrv.isAnyTabLogin()) {
		// 	this.setError('Youarealreadyloggedinanothertab');
		// 	return;
		// }

		this.login.loginId = this.loginForm.get('loginId')?.value.trim();
		this.login.password = this.loginForm.get('password')?.value.trim();
		this.login.rememberMe = this.loginForm.get('rememberMe')?.value;

		this.rememberMe();
		this.loginService.Loginfn(this.login)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((s: GenericResponseBase<number[] | null>) => {
				if (s.Succeeded) {
					this.manageSessionData(s);
					this.store.dispatch(new StateClear());
					this.store.dispatch(new StateResetAll(
						AdvanceFilterState,
						GridTabNameState
					));
					this.store.dispatch(new ClearAdvAppliedFilterData());
					this.store.dispatch(new SmartSearchSet({}));

					this.pageAccessLoggerService.fnGetRoutes("/auth/login");
					this.localizationService.ManageCultureInfo(s);
					this.menuService.isCameFromLogin = true;

					localStorage.setItem(StorageKeys[StorageKeys.loggedIn], 'true');
					// this.manageTabSrv.manageLoginStatus(true);

					this.route.navigate(['/xrm/landing/home']);
				}
				else if (s.Data == null && s.StatusCode !== Number(magicNumber.fourHundredThree)) {
					this.setError(this.localizationService.GetLocalizeMessage(s.Message));
				}
				else if (s.Data != undefined && s.Data.length != Number(magicNumber.zero)) {
					this.messageValue = s.Data[0].toString();
					const orgDynamicParam: DynamicParam[] = [{ Value: this.messageValue, IsLocalizeKey: false }];
					this.setError(this.localizationService.GetLocalizeMessage(s.Message, orgDynamicParam));
				}
				else if (s.StatusCode === Number(magicNumber.fourHundredThree) && s.ValidationMessages?.length != magicNumber.zero) {
					const valArray: ValidationError[] | undefined = s.ValidationMessages;
					this.setError(this.localizationService.GetLocalizeMessage(valArray?.[0]?.ErrorMessage));
				}
			});
	}

	private manageSessionData(s: GenericResponseBase<number[] | null>): void {
		this.sessionStore.set(StorageKeys[StorageKeys.loggedIn], 'true');
		this.sessionStore.set(StorageKeys[StorageKeys.roleGroupId], s.RoleGroupId?.toString() ?? '');
		this.sessionStore.set(StorageKeys[StorageKeys.AcknowledgementKey], s.AcknowledgementKey ?? '');
		this.sessionStore.set(StorageKeys[StorageKeys.IsAcknowledge], s.IsAcknowledge
			? 'true'
			: 'false');
		this.sessionStore.set(StorageKeys[StorageKeys.ProfileDmsId], s.ProfileDmsId ?? '');
		this.sessionStore.set(StorageKeys[StorageKeys.LandingPageUrl], s.LandingPageUrl ?? '');
		this.menuService.clearRoutes();
		this.menuService.fetchAllAccessData();
		this.sessionStore.set(CultureFormat[CultureFormat.ClientName], s.ClientName ?? '');
		this.sessionStore.set(CultureFormat[CultureFormat.ClientCultureCode], s.CultureCode ?? '');
		this.sessionStore.set(StorageKeys[StorageKeys.RefreshToken], s.RefreshToken ?? '');
		this.sessionStore.set(StorageKeys[StorageKeys.TokenGeneratedOn], s.TokenGeneratedOn ?? '');
  	    this.sessionStore.set(StorageKeys[StorageKeys.UserDisplayName], s.UserDisplayName??'');
		this.sessionStore.set(StorageKeys[StorageKeys.TokenExpiresInMinutes], s.TokenExpiresInMinutes?.toString() ?? '');
		this.sessionStore.set(StorageKeys[StorageKeys.RefreshTokenExpiresInMinutes], s.RefreshTokenExpiresInMinutes?.toString() ?? '');
	}

	public verifyUserId(): void {
		this.loginForm.get('password')?.reset();
		this.isLoginIdValid = true;
		this.showPassword = true;
		this.timeoutId = setTimeout(() => {
			this.focusOnTextbox();
		});
	}

	private setError(message: string): void {
		this.toasterService.showToaster(ToastOptions.Error, message);
	}

	public setPauseAndPlay(): void {
		this.pause = !this.pause;
	}

	public removeError(): void {
		const existingValidators = this.userIdControl.validator
				? [this.userIdControl.validator]
				: [],
		 requiredValidator = this.customValidator.RequiredValidator('PleaseEnterUserId');

		// Check if the required validator is already present
		if (!existingValidators.includes(requiredValidator)) {
			this.userIdControl.setValidators([...existingValidators, requiredValidator]);
			this.userIdControl.updateValueAndValidity();
		}

		this.isLoginIdValid = true;
	}

	public passwordError(): void {
		const passwordControl = this.loginForm.get('password'),
		 existingValidators = passwordControl?.validator ?
				[passwordControl.validator] :
				[],
		 requiredValidator = this.customValidator.RequiredValidator('PasswordIsRequired');

		// Check if the required validator is already present
		if (passwordControl && !existingValidators.includes(requiredValidator)) {
			passwordControl.setValidators([...existingValidators, requiredValidator]);
			passwordControl.updateValueAndValidity();
		}
	}


	public forgotPassword(): void {
		if (this.userIdControl.value !== '' && this.userIdControl.value != undefined) {
			this.loginService.CheckUserExistence(this.userIdControl.value)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: GenericResponseBase<null>) => {
					if (res.Succeeded) {
						this.userActivationService.userId = this.userIdControl.value;
						this.route.navigate(['/auth/forgot-password']);
					}
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				});

		}
	}

}
