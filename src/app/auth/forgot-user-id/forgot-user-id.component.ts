import { Component, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ForgotUserIdService } from '../services/forgot-user-id.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Subject, takeUntil } from 'rxjs';
import { ForgetUserIdResponse, SecurityQuestion, User, ForgotUserIdPayload, VerifyUserCredsPayload } from './forgot-user-id-interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { StepLabels, ToastMessages, ValidationMessages } from './forgot-user-id-enums.enum';
import { NavigationPath, RequiredStrings } from '../forgot-password/forgot-password-enums.enum';
@Component({
	selector: 'app-forgot-user-id',
	templateUrl: './forgot-user-id.component.html',
	styleUrls: ['./forgot-user-id.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotUserIdComponent implements OnDestroy {
	public AddEditEventReasonForm: FormGroup;
	public resetStep = false;
	public question: SecurityQuestion[];
	public randomIndex: number = magicNumber.zero;
	public isButtonDisabledExplicitly: boolean = false;
	private timeoutId: ReturnType<typeof setTimeout>;
	private unsubscribe$ = new Subject<void>();
	public currentStep = magicNumber.zero;
	private minLength: DynamicParam[] = [{ Value: magicNumber.three.toString(), IsLocalizeKey: false }];
	private maxLength: DynamicParam[] = [{ Value: magicNumber.forty.toString(), IsLocalizeKey: false }];
	public steps = [
		{
			label: StepLabels.Verification
		},
		{
			label: StepLabels.SecurityQuestions
		}
	];

	constructor
		(
			private fb: FormBuilder,
			private customValidator: CustomValidators,
			private route: Router,
			private forgotUserIdService: ForgotUserIdService,
			private toasterService: ToasterService,
			private localizationService: LocalizationService
		) {
		this.AddEditEventReasonForm = this.fb.group({
			email: [
				null, [
					this.customValidator.RequiredValidator(ValidationMessages.PleaseEnterEmailAddress),
					this.customValidator.EmailValidator(ValidationMessages.PleaseEnterAValidEmailAddress)
				]
			],
			lastName: [null, this.customValidator.RequiredValidator(ValidationMessages.PleaseEnterLastName)],
			securityQues: [null, this.setValidators()],
			UserName: [null],
			UserNo: [null]
		});
		this.question = [];
	}

	ngOnDestroy(): void {
		clearInterval(this.timeoutId);
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private setValidators(): ValidatorFn[] {
		return [
			this.customValidator.RequiredValidator(ValidationMessages.PleaseEnterSecurityQuestionAnswer),
			this.customValidator.MinLengthValidator(
				magicNumber.three,
				this.localizationService.GetLocalizeMessage(ValidationMessages.MinimumAnswerCharacterLimit, this.minLength)
			),
			this.customValidator.MaxLengthValidator(
				magicNumber.forty,
				this.localizationService.GetLocalizeMessage(ValidationMessages.MaximumAnswerCharacterLimit, this.maxLength)
			)
		];
	}
	private clearAndSetValidator(): void {
		this.AddEditEventReasonForm.controls['securityQues'].clearValidators();
		this.AddEditEventReasonForm.get('securityQues')?.setValue(RequiredStrings.EmptyString);
		this.AddEditEventReasonForm.controls['securityQues'].setValidators(this.setValidators());
		this.AddEditEventReasonForm.controls['securityQues'].markAsUntouched();
	}

	private getRandomNumber = (maxValue: number): number => {
		const randomValues = new Uint32Array(magicNumber.one);
		window.crypto.getRandomValues(randomValues);
		return Math.floor((randomValues[magicNumber.zero] / (magicNumber.maxHexadecimal + magicNumber.one)) * maxValue);
	};

	public changeQuestion(): void {
		if (this.isButtonDisabledExplicitly)
			return;
		const num = this.getRandomNumber(this.question.length);
		if (num <= this.question.length && this.randomIndex != num) {
			this.clearAndSetValidator();
			this.randomIndex = num;
		}
		else {
			this.changeQuestion();
		}
	}

	public verifyUser(): void {
		if (!this.AddEditEventReasonForm.controls['email'].invalid && !this.AddEditEventReasonForm.controls['lastName'].invalid) {
			this.toasterService.resetToaster();
			this.verifyUserAndSetQuestions();
			this.AddEditEventReasonForm.controls['securityQues'].markAsUntouched();
			this.AddEditEventReasonForm.updateValueAndValidity();
		}
		else {
			this.AddEditEventReasonForm.controls['email'].markAsTouched();
			this.AddEditEventReasonForm.controls['lastName'].markAsTouched();
			this.AddEditEventReasonForm.updateValueAndValidity();
		}
	}

	private verifyUserAndSetQuestions(): void {
		const payload: VerifyUserCredsPayload = {
			Email: this.AddEditEventReasonForm.controls['email'].value,
			LastName: this.AddEditEventReasonForm.controls['lastName'].value,
			IsUserName: true
		};
		this.forgotUserIdService.verifyUser(payload).pipe(takeUntil(this.unsubscribe$)).subscribe((data: GenericResponseBase<User>) => {
			if (data.Succeeded) {
				if (data.Data?.Disabled) {
					this.toasterService.showToaster(
						ToastOptions.Error,
						this.localizationService.GetLocalizeMessage(ToastMessages.AccountPendingActivation)
					);
				}
				else {
					this.AddEditEventReasonForm.controls['UserName'].setValue(data.Data?.UserName);
					this.AddEditEventReasonForm.controls['UserNo'].setValue(data.Data?.UserNo);
					this.setSecurityQuestions();
				}
			}
			else {
				this.toasterService.showToaster(
					ToastOptions.Error,
					this.localizationService.GetLocalizeMessage(ToastMessages.XRMUserVerificationFailed)
				);
			}
		});
	};

	private setSecurityQuestions(): void {
		this.forgotUserIdService.getSecurityQuestionbyUsername(this.AddEditEventReasonForm.controls['UserName'].value)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<SecurityQuestion[]>) => {
				if (res.Succeeded) {
					this.toasterService.resetToaster();
					this.currentStep += magicNumber.one;
					if (res.Data != null)
						this.question = res.Data;
				}
			});
	}

	public verifyAnswer(): void {
		this.toasterService.resetToaster();
		this.AddEditEventReasonForm.controls['securityQues'].addValidators([this.customValidator.RequiredValidator(ValidationMessages.PleaseEnterSecurityQuestionAnswer)]);
		this.AddEditEventReasonForm.controls['securityQues'].addValidators([this.customValidator.MinLengthValidator(magicNumber.three, this.localizationService.GetLocalizeMessage(ValidationMessages.MinimumAnswerCharacterLimit, this.minLength))]);
		this.AddEditEventReasonForm.controls['securityQues'].markAllAsTouched();
		this.AddEditEventReasonForm.controls['securityQues'].updateValueAndValidity();
		if (this.AddEditEventReasonForm.controls['securityQues'].valid) {
			const payload: ForgotUserIdPayload = {
				QuestionId: this.question[this.randomIndex]?.QuestionId,
				Answer: this.AddEditEventReasonForm.controls['securityQues'].value.trim(),
				UserName: this.AddEditEventReasonForm.controls['UserName'].value
			};
			this.forgotUserIdService.verifySecurityAnswer(payload)
				.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<ForgetUserIdResponse>) => {
					if (res.Succeeded) {
						const dynamicParam: DynamicParam[] = [{ Value: res.Data?.Email ?? RequiredStrings.EmptyString, IsLocalizeKey: false }];
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.UserIdSentSuccessfully, dynamicParam);
						this.isButtonDisabledExplicitly = true;
						this.AddEditEventReasonForm.disable();
						this.timeoutId = setTimeout(() => {
							this.route.navigate([`${NavigationPath.Login}`]);
						}, magicNumber.fiveThousand);
					}
					else {
						this.toasterService.showToaster(
							ToastOptions.Error,
							this.localizationService.GetLocalizeMessage(ToastMessages.SecurityAnswerDoesntmatch)
						);
					}
				});

		}
		else {
			this.AddEditEventReasonForm.controls['securityQues'].markAsTouched();
		}
	}

	public hasEmailAndLastName(): boolean {
		const emailControl = this.AddEditEventReasonForm.get('email'),
			lastNameControl = this.AddEditEventReasonForm.get('lastName');

		if ((emailControl?.value === RequiredStrings.EmptyString || lastNameControl?.value === RequiredStrings.EmptyString) ||
			(emailControl?.invalid || lastNameControl?.invalid)) {
			return true;
		}
		return false;
	}

	public hasSecurityQues(): boolean {
		const securityQues = this.AddEditEventReasonForm.get('securityQues');

		if ((securityQues?.value === RequiredStrings.EmptyString) || (securityQues?.invalid) || (securityQues?.value == null)) {
			return true;
		}
		return false;
	}

	public prev(): void {
		if (this.currentStep == magicNumber.zero)
			this.login();
		this.currentStep -= magicNumber.one;
	}

	private login(): void {
		this.route.navigateByUrl(NavigationPath.Login, { replaceUrl: true });
	}

}
