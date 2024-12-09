import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { UsersService } from '../service/users.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Location } from '@angular/common';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ChangePasswordPayload, ChangePasswordResponse } from '../model/model';
import { checkDimension, xDimension } from '../../../../shared/icons/xrm-icon-library/xrm-icon-library.component';
import { IRecordButton, PasswordPolicy } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

	public uid: string = '';
	public passwordPolicy: PasswordPolicy | null | undefined;
	public recordId: string;
	public entityId: number = XrmEntities.Users;
	public buttonset: IRecordButton[];
	public recordName: string;
	public userStatus: string;
	public isExplicitlyDisabled: boolean = false;
	public AddEditEventReasonForm: FormGroup;
	public resetStep = false;
	public MinLengthMessage: string;
	public MaxLengthMessage: string;
	private unsubscribe$ = new Subject<void>();
	private timeoutId: ReturnType<typeof setTimeout>;

	//UI Icons
	public check = checkDimension;
	public x = xDimension;


	constructor(
		private fb: FormBuilder,
		private customValidator: CustomValidators,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		private userService: UsersService,
		private location: Location,
		private authguardService: AuthGuardService,
		private sessionStore: SessionStorageService,
		private cdr: ChangeDetectorRef
	) {
		this.AddEditEventReasonForm = this.fb.group({
			currentPassword: ['', this.customValidator.RequiredValidator('Please enter the Current Password.')],
			newPassword: ['', this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage('PleaseEnterNewPassword'))],
			confirmPassword: ['', this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage('PleaseConfirmNewPassword'))]
		});
	}


	ngOnInit(): void {
		forkJoin([
			this.userService.getLoginUserInfo(),
			this.userService.getPasswordPolicy()
		]).pipe(takeUntil(this.unsubscribe$))
			.subscribe(([userData, passwordPolicy]) => {
				const UserData = userData.Data;
				this.recordName = UserData?.FullName ?? '';
				this.recordId = UserData?.Code ?? '';
				this.userStatus = UserData?.NormalizedStatus ?? '';

				this.passwordPolicy = passwordPolicy.Data;
				this.setPasswordRequirements();
				this.cdr.detectChanges();
			});
	}

	private setPasswordRequirements() {
		if (this.passwordPolicy?.RequiredLength != null) {
			const dynamicParam: DynamicParam[] = [{ Value: this.passwordPolicy?.RequiredLength.toString(), IsLocalizeKey: false }];
			this.MinLengthMessage = this.localizationService.GetLocalizeMessage('MinimumCharacterslimitofPassword', dynamicParam);
		}
		if (this.passwordPolicy?.MaximumLength != null) {
			const dynamicParam: DynamicParam[] = [{ Value: this.passwordPolicy?.MaximumLength.toString(), IsLocalizeKey: false }];
			this.MaxLengthMessage = this.localizationService.GetLocalizeMessage('MaximumCharacterslimitofPassword', dynamicParam);
		}
	}

	public submitClicked() {
		if (
			this.AddEditEventReasonForm.controls['newPassword'].valid && this.AddEditEventReasonForm.controls['confirmPassword'].valid
			&& this.AddEditEventReasonForm.controls['currentPassword'].valid
		) {
			this.uid = this.sessionStore.getCookieValue('X-UID');
			if (!this.uid || this.uid == '') {
				this.toasterService.showToaster(ToastOptions.Error, 'SomeErrorOccurred');
				return;
			}
			const payload: ChangePasswordPayload = {
				oldPassword: this.AddEditEventReasonForm.controls['currentPassword'].value,
				newPassword: this.AddEditEventReasonForm.controls['newPassword'].value,
				confirmPassword: this.AddEditEventReasonForm.controls['confirmPassword'].value,
				uId: this.uid
			};
			this.userService.changePassword(payload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ChangePasswordResponse) => {
				if (res.Succeeded) {
					this.isExplicitlyDisabled = true;
					this.toasterService.showToaster(ToastOptions.Success, this.localizationService.GetLocalizeMessage('PasswordChangedSuccessfully'));
					this.timeoutId = setTimeout(() => {
						this.authguardService.logOut();
					}, magicNumber.threeThousand);
				}
				else if (res.ValidationMessages && res.ValidationMessages.length != Number(magicNumber.zero)) {
					this.toasterService.showToaster(
						ToastOptions.Error,
						this.localizationService.GetLocalizeMessage(res.ValidationMessages[magicNumber.zero].ErrorMessage)
					);
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(res.Message));
				}
			});
		}
		else {
			this.AddEditEventReasonForm.controls['newPassword'].markAsTouched();
			this.AddEditEventReasonForm.controls['confirmPassword'].markAsTouched();
			this.AddEditEventReasonForm.controls['currentPassword'].markAsTouched();
		}
	}
	public isPasswordMinimum() {
		if (this.passwordPolicy)
			return this.AddEditEventReasonForm.get('newPassword')?.value?.length >= this.passwordPolicy.RequiredLength;
		return false;
	}
	public isPasswordMaximum() {
		if (this.passwordPolicy)
			return this.AddEditEventReasonForm.get('newPassword')?.value?.length <= this.passwordPolicy.MaximumLength;
		return false;
	}


	public isEmpty() {
		return this.AddEditEventReasonForm.get('newPassword')?.value?.length === magicNumber.zero;
	}

	public hasUppercase() {
		if (this.passwordPolicy?.RequireUppercase) {
			const regex = /[A-Z]/;
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasLowercase() {
		if (this.passwordPolicy?.RequireLowercase) {
			const regex = /[a-z]/;
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasNumeric() {
		if (this.passwordPolicy?.RequireDigit) {
			const regex = /\d/;
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasSpecialCharacter() {
		if (this.passwordPolicy?.RequireNonAlphanumeric) {
			const regex = new RegExp(`[${this.passwordPolicy?.AllowedSpecialCharacters}]`);
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public isPasswordButtonDisabled(): boolean {
		if (!this.hasSpecialCharacter() || !this.isPasswordMinimum()
			|| !this.isPasswordMaximum() || !this.hasUppercase() ||
			!this.hasLowercase() || !this.hasNumeric()) {
			return true;
		}
		else {
			return false;
		}
	};

	public onCancel() {
		this.location.back();
	}

	ngOnDestroy() {
		clearInterval(this.timeoutId);
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.unsubscribe$.unsubscribe();
	}
}
