import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ForgotUserIdService } from '../services/forgot-user-id.service';
import { ActivatedRoute, Router } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Observable, Subject, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { PasswordValidationMessages, ToastMessages } from './set-new-password-enums.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { UserData, ResetPasswordPayload } from './set-new-password-interfaces';
import { checkDimension, xDimension } from '../../../app/shared/icons/xrm-icon-library/xrm-icon-library.component';
import { PasswordPolicy, ValidationError } from '@xrm-shared/models/common.model';
import { NavigationPath, RequiredStrings } from '../forgot-password/forgot-password-enums.enum';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';

@Component({
	selector: 'app-set-new-password',
	templateUrl: './set-new-password.component.html',
	styleUrls: ['./set-new-password.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetNewPasswordComponent implements OnInit, OnDestroy {
	private uidOrToken: string = RequiredStrings.EmptyString;
	public resetToken: string = RequiredStrings.EmptyString;
	public passwordPolicy: PasswordPolicy | null | undefined;
	public userName: string = RequiredStrings.EmptyString;
	public MinLengthMessage: string;
	public MaxLengthMessage: string;
	public AddEditEventReasonForm: FormGroup;
	private unsubscribe$ = new Subject<void>();
	private timeoutId: ReturnType<typeof setTimeout>;
	public isButtonDisabledExplicitly: boolean = false;

	//UI Icons
	public check = checkDimension;
	public x = xDimension;


	constructor(
		private fb: FormBuilder,
		private customValidator: CustomValidators,
		private forgotUserIdService: ForgotUserIdService,
		private routes: ActivatedRoute,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		private route: Router,
		private cd: ChangeDetectorRef
	) {
		this.AddEditEventReasonForm = this.fb.group({
			newPassword: [
				RequiredStrings.EmptyString,
				this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage(PasswordValidationMessages.PleaseEnterNewPassword))
			],
			confirmPassword: [
				RequiredStrings.EmptyString,
				this.customValidator
					.RequiredValidator(this.localizationService.GetLocalizeMessage(PasswordValidationMessages.PleaseConfirmNewPassword))
			]
		});
	}


	ngOnInit(): void {
		this.uidOrToken = this.routes.snapshot.params['uid'];
		this.forgotUserIdService.checkUrlValid(this.uidOrToken).pipe(switchMap((res:ApiResponse) => {
			if(res.Data){
				return this.getCombinedData();
			}
			else{
				this.route.navigate(['link-expired']);
				return of([null, null, null]);
			}
		}), takeUntil(this.unsubscribe$))
			.subscribe((res: [GenericResponseBase<UserData>, GenericResponseBase<null>, GenericResponseBase<PasswordPolicy>] | null[]) => {
				this.setUsername(res[0]);
				this.setResetToken(res[1]);
				this.setPasswordPolicy(res[2]);
				this.cd.detectChanges();
			});
	}

	private getCombinedData(): Observable<[GenericResponseBase<UserData>, GenericResponseBase<null>, GenericResponseBase<PasswordPolicy>]>{
		return forkJoin([
			this.forgotUserIdService.getUserIdbyUkey(this.uidOrToken),
			this.forgotUserIdService.passwordResetToken(this.uidOrToken),
			this.forgotUserIdService.getPasswordPolicy()
		]);
	}

	private setUsername(data: GenericResponseBase<UserData> | null): void {
		if (data?.Succeeded) {
			this.userName = data.Data?.FullName ?? RequiredStrings.EmptyString;
		}
	}

	private setResetToken(data: GenericResponseBase<null> | null): void {
		if (data?.Succeeded && data.Token)
			this.resetToken = data.Token;
	}

	private setPasswordPolicy(data: GenericResponseBase<PasswordPolicy> | null): void {
		if (data?.Succeeded) {
			this.passwordPolicy = data.Data;
			this.setPasswordRequirements();
		}
	}

	ngOnDestroy(): void {
		clearTimeout(this.timeoutId);
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private setPasswordRequirements(): void {
		if (this.passwordPolicy?.RequiredLength != undefined) {
			const dynamicParam: DynamicParam[] = [{ Value: this.passwordPolicy.RequiredLength.toString(), IsLocalizeKey: false }];
			this.MinLengthMessage = this.localizationService
				.GetLocalizeMessage(PasswordValidationMessages.MinimumCharactersLimitOfPassword, dynamicParam);
		}
		if (this.passwordPolicy?.MaximumLength != undefined) {
			const dynamicParam: DynamicParam[] = [{ Value: this.passwordPolicy.MaximumLength.toString(), IsLocalizeKey: false }];
			this.MaxLengthMessage = this.localizationService
				.GetLocalizeMessage(PasswordValidationMessages.MaximumCharactersLimitOfPassword, dynamicParam);
		}
	}

	public submitClicked(): void {
		if (this.AddEditEventReasonForm.controls['newPassword'].valid && this.AddEditEventReasonForm.controls['confirmPassword'].valid) {
			const payload: ResetPasswordPayload = {
				uId: this.uidOrToken,
				newPassword: this.AddEditEventReasonForm.controls['newPassword'].value,
				confirmPassword: this.AddEditEventReasonForm.controls['confirmPassword'].value,
				token: this.resetToken
			};
			this.forgotUserIdService.resetPasswordConfirm(payload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
				if (res.Succeeded) {
					this.isButtonDisabledExplicitly = true;
					this.AddEditEventReasonForm.disable();
					this.toasterService.showToaster(ToastOptions.Success, ToastMessages.YourPasswordHasBeenChangedSuccessfully);
					this.timeoutId = setTimeout(() => {
						this.route.navigate([`${NavigationPath.Login}`]);
					}, magicNumber.fiveThousand);
				}
				else if (res.ValidationMessages && res.ValidationMessages.length != Number(magicNumber.zero)) {
					const valMessage: ValidationError[] = res.ValidationMessages;
					this.toasterService.showToaster(ToastOptions.Error, this.localizationService
						.GetLocalizeMessage(valMessage[magicNumber.zero].ErrorMessage));
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(res.Message));
				}
			});
		}
		else {
			this.AddEditEventReasonForm.controls['newPassword'].markAsTouched();
			this.AddEditEventReasonForm.controls['confirmPassword'].markAsTouched();
		}

	}

	public isPasswordMinimum(): boolean {
		return this.AddEditEventReasonForm.get('newPassword')?.value?.length >= (this.passwordPolicy?.RequiredLength ?? magicNumber.zero);
	}

	public isPasswordMaximum(): boolean {
		return this.AddEditEventReasonForm.get('newPassword')?.value?.length <= (this.passwordPolicy?.MaximumLength ?? magicNumber.zero);
	}

	public isEmpty(): boolean {
		return this.AddEditEventReasonForm.get('newPassword')?.value?.length === magicNumber.zero;
	}

	public hasUppercase(): boolean {
		if (this.passwordPolicy?.RequireUppercase) {
			const regex = /[A-Z]/;
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasLowercase(): boolean {
		if (this.passwordPolicy?.RequireLowercase) {
			const regex = /[a-z]/;
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasNumeric(): boolean {
		if (this.passwordPolicy?.RequireDigit) {
			const regex = /\d/;
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasSpecialCharacter(): boolean {
		if (this.passwordPolicy?.RequireNonAlphanumeric) {
			const regex = new RegExp(`[${this.passwordPolicy.AllowedSpecialCharacters}]`);
			return regex.test(this.AddEditEventReasonForm.get('newPassword')?.value);
		}
		return true;
	}

	public isPasswordButtonDisabled(): boolean {
		if (!this.hasSpecialCharacter())
			return true;
		if (!this.isPasswordMinimum())
			return true;
		if (!this.isPasswordMaximum())
			return true;
		if (!this.hasUppercase())
			return true;
		if (!this.hasLowercase())
			return true;
		if (!this.hasNumeric())
			return true;
		return false;
	};

}
