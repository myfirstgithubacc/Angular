import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ForgotUserIdService } from '../services/forgot-user-id.service';
import { UserActivationService } from '../services/user-activation.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { NavigationPath, RequiredStrings, ValidationMessages } from './forgot-password-enums.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SecurityQuestion, VerifyAnswerPayload } from './forgot-password-interfaces';


@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
	private userId: string = RequiredStrings.EmptyString;
	public randomIndex: number = magicNumber.zero;
	public question: SecurityQuestion[];
	public AddEditEventReasonForm: FormGroup;
	public isButtonDisabledExplicitly: boolean = false;
	private unsubscribe$ = new Subject<void>();
	private timeoutId: ReturnType<typeof setTimeout>;

	constructor(
		private fb: FormBuilder,
		private customValidator: CustomValidators,
		private route: Router,
		private forgotUserIdService: ForgotUserIdService,
		private userActivationService: UserActivationService,
		private toasterService: ToasterService,
		private localizationService: LocalizationService
	) {
		this.AddEditEventReasonForm = this.fb.group({
			securityQues: [null, this.setValidators()]
		});
		this.question = [];
	}

	ngOnInit(): void {
		this.userId = this.userActivationService.userId;
		if (this.userId == RequiredStrings.EmptyString.toString()) {
			this.route.navigateByUrl(NavigationPath.Login);
			return;
		}
		this.getSecurityQuestion();
	}
	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		clearTimeout(this.timeoutId);
	}

	private getSecurityQuestion(): void {
		this.forgotUserIdService.getSecurityQuestionbyUsername(this.userId)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<SecurityQuestion[]>) => {
				if (res.Succeeded && res.Data) {
					this.question = res.Data;
					return;
				}
				this.AddEditEventReasonForm.get('securityQues')?.disable();
				this.toasterService.showToaster(ToastOptions.Error, ValidationMessages.UserInvalid);
			});
	}

	private setValidators(): ValidatorFn[] {
		const minLength: DynamicParam[] = [{ Value: magicNumber.three.toString(), IsLocalizeKey: false }],
			maxLength: DynamicParam[] = [{ Value: magicNumber.forty.toString(), IsLocalizeKey: false }];
		return [
			this.customValidator.RequiredValidator(ValidationMessages.PleaseEnterSecurityQuestionAnswer),
			this.customValidator.MinLengthValidator(
				magicNumber.three,
				this.localizationService.GetLocalizeMessage(ValidationMessages.MinimumAnswerCharacterLimit, minLength)
			),
			this.customValidator.MaxLengthValidator(
				magicNumber.forty,
				this.localizationService.GetLocalizeMessage(ValidationMessages.MaximumAnswerCharacterLimit, maxLength)
			)
		];
	}

	public verifyAnswers(): void {
		if (this.AddEditEventReasonForm.controls['securityQues'].valid) {

			const payload: VerifyAnswerPayload = {
				questionId: this.question
					? this.question[this.randomIndex]?.QuestionId
					: magicNumber.zero,
				answer: this.AddEditEventReasonForm.controls['securityQues'].value,
				userName: this.userId
			};
			this.forgotUserIdService.SendPasswordResetEmail(payload)
				.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
					if (res.Succeeded) {
						this.toasterService.showToaster(ToastOptions.Success, this.localizationService.GetLocalizeMessage(res.Message));
						this.isButtonDisabledExplicitly = true;
						this.AddEditEventReasonForm.disable();
						this.timeoutId = setTimeout(() => {
							this.route.navigate([`${NavigationPath.Login}`]);
						}, magicNumber.fiveThousand);
					}
					else {
						this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(res.Message));
					}
				});
		}
		else {
			this.AddEditEventReasonForm.controls['securityQues'].markAsTouched();
		}
	}

	private getRandomNumber = (maxValue: number): number => {
		const randomValues = new Uint32Array(magicNumber.one);
		window.crypto.getRandomValues(randomValues);
		return Math.floor((randomValues[magicNumber.zero] / (magicNumber.maxHexadecimal + magicNumber.one)) * maxValue);
	};

	private clearAndSetValidator(): void {
		this.AddEditEventReasonForm.controls['securityQues'].clearValidators();
		this.AddEditEventReasonForm.get('securityQues')?.setValue(RequiredStrings.EmptyString);
		this.AddEditEventReasonForm.controls['securityQues'].setValidators(this.setValidators());
		this.AddEditEventReasonForm.controls['securityQues'].markAsUntouched();
	}

	public changeQuestion(): void {
		if (this.question && !this.isButtonDisabledExplicitly) {
			this.toasterService.resetToaster();
			this.clearAndSetValidator();
			const num = this.getRandomNumber(this.question.length);
			if (num <= this.question.length && this.randomIndex != num) {
				this.randomIndex = num;
			}
			else {
				this.changeQuestion();
			}
		}
	}

	public hasSecurityQues(): boolean {
		const securityQues = this.AddEditEventReasonForm.get('securityQues');

		if ((securityQues?.value === RequiredStrings.EmptyString) || (securityQues?.invalid)) {
			return true;
		}
		return false;
	}
	public prev(): void {
		this.route.navigateByUrl(`${NavigationPath.Login}`, { replaceUrl: true });
	}

}
