import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { UserActivationService } from '../services/user-activation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ActivateUserPayload, QuestionAnswer, SecurityQuestion, Step, StringCount, UserData, ValidatePasswordPayload, VerifyUserPayload } from './user_activation_interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { StepLabels, ToastMessages, ValidationMessages } from './user_activation_enums.enum';
import { checkDimension, xDimension } from '../../../app/shared/icons/xrm-icon-library/xrm-icon-library.component';
import { PasswordPolicy, ValidationError } from '@xrm-shared/models/common.model';
import { NavigationPath, RequiredStrings } from '../forgot-password/forgot-password-enums.enum';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';

@Component({
	selector: 'app-user_activation',
	templateUrl: './user_activation.component.html',
	styleUrls: ['./user_activation.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActivationComponent implements OnInit, OnDestroy {

	public securityQuestions: SecurityQuestion[] | null | undefined = [];
	public userObject: UserData | null | undefined;
	public errorMessage: string = RequiredStrings.EmptyString;
	public currentStep = magicNumber.zero;
	public activationForm: FormGroup;
	public isButtonDisabledExplicitly: boolean = false;
	public passwordPolicy: PasswordPolicy | null | undefined;
	private uKeyOrToken: string;
	private unsubscribe$ = new Subject<void>();
	private timeoutId: ReturnType<typeof setTimeout>;
	public MinLengthMessage: string;
	public MaxLengthMessage: string;
	public steps: Step[] = [
		{
			label: StepLabels.Verification
		},
		{
			label: StepLabels.SetNewPassword
		},
		{
			label: StepLabels.SetSecurityQuestions
		}
	];

	//UI Icons
	public check = checkDimension;
	public x = xDimension;

	constructor(
		private fb: FormBuilder,
		private route: Router,
		private localizationService: LocalizationService,
		private customValidator: CustomValidators,
		private toasterService: ToasterService,
		private userActivationService: UserActivationService,
		private routes: ActivatedRoute
	) { }

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		clearTimeout(this.timeoutId);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.setActivationForm();
		this.uKeyOrToken = this.routes.snapshot.params['ukey'];
		this.userActivationService.checkUrlValid(this.uKeyOrToken).pipe(switchMap((res: ApiResponse) => {
			if(!res.Data){
				this.route.navigate(['link-expired']);
				return of(null);
			}
			else{
				return this.userActivationService.getPasswordPolicy();
			}
		}), takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<PasswordPolicy> | null) => {
			if (res?.Succeeded)
				this.passwordPolicy = res.Data;
			this.setPasswordRequirements();
		});
	}

	private setActivationForm(): void {
		this.activationForm = this.fb.group({
			emailAddress: [
				RequiredStrings.EmptyString,
				[
					this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage(ValidationMessages.PleaseEnterEmailAddress)),
					this.customValidator.EmailValidator(ValidationMessages.PleaseEnterAValidEmailAddress)
				]
			],
			lastName: [
				RequiredStrings.EmptyString,
				this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage(ValidationMessages.PleaseEnterLastName))
			],
			newPassword: [
				RequiredStrings.EmptyString,
				[this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage(ValidationMessages.PleaseEnterNewPassword))]
			],
			confirmPassword: [
				RequiredStrings.EmptyString,
				this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage(ValidationMessages.PleaseConfirmNewPassword))
			],
			userSecQuestionsAddDtos: this.fb.array([this.getFormGroup(), this.getFormGroup()])
		});
	}

	private getSecurityQuestions(): void {
		this.userActivationService.getAllSecurityQuestions().pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: GenericResponseBase<SecurityQuestion[]>) => {
				if (res.Succeeded) {
					this.securityQuestions = res.Data;
					this.securityQuestions?.forEach((question: SecurityQuestion) => {
						question.Text = this.localizationService.GetLocalizeMessage(question.Text);
					});
				}
			});
	}

	private notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
		return value !== null && value !== undefined && value !== "";
	}

	private getFormGroup(): FormGroup {
		return this.fb.group({
			secQuestionId: [
				null,
				this.customValidator.RequiredValidator(this.localizationService.GetLocalizeMessage(ValidationMessages.PleaseSelectSecurityQuestion))
			],
			answer: [
				null, [
					this.customValidator.RequiredValidator(this.localizationService
						.GetLocalizeMessage(ValidationMessages.PleaseEnterSecurityQuestionAnswer)),
					this.customValidator.MinLengthValidator(magicNumber.three, ValidationMessages.MinimumLengthThree),
					this.customValidator.MaxLengthValidator(magicNumber.forty, ValidationMessages.MaximumLengthForty),
					this.validateUniqueAnswers.bind(this)
				]
			]
		});
	}

	private validateUniqueAnswers(control: AbstractControl): ValidationErrors | null {
		try {
			const str: string = control.value?.toLowerCase()?.trim() ?? RequiredStrings.EmptyString,
				duplicates: string[] = this.getDuplicateAnswers();

			return this.handleDuplicateAnwers(duplicates, str);
		} catch (e) {
			return {
				error: true,
				message: ValidationMessages.SomeErrorOccured
			};
		}
	}

	private getDuplicateAnswers(): string[] {
		const arr: string[] = this.userSecQuestionsAddDtos.controls.map((cont: AbstractControl) =>
			cont.get('answer')?.value?.toLowerCase()?.trim()).filter(this.notEmpty),

			counts: StringCount = arr.reduce((acc: StringCount, item: string) => {
				acc[item] = (acc[item] || magicNumber.zero) + magicNumber.one;
				return acc;
			}, {});
		return Object.keys(counts).filter((item: string) =>
			counts[item] > Number(magicNumber.one));
	}

	private handleDuplicateAnwers(duplicates: string[], str: string): ValidationErrors | null {
		this.userSecQuestionsAddDtos.controls.forEach((control: AbstractControl) => {
			const currentAnswer = control.get('answer')?.value?.toLowerCase()?.trim();
			if (!duplicates.includes(currentAnswer) && control.get('answer')?.errors?.['message'] == ValidationMessages.UniqueAnswerForQuestions) {
				control.get('answer')?.setErrors(null);
				control.get('answer')?.markAsTouched();
				control.get('answer')?.updateValueAndValidity();
			}
		});
		if (duplicates.includes(str)) {
			return {
				error: true,
				message: ValidationMessages.UniqueAnswerForQuestions
			};
		}
		return null;
	}

	public get userSecQuestionsAddDtos(): FormArray {
		return this.activationForm.get('userSecQuestionsAddDtos') as FormArray;
	}

	public formControl(item: AbstractControl): FormGroup {
		return item as FormGroup;
	}

	public addControl(): void {
		if (this.isButtonDisabledExplicitly) {
			return;
		}
		(this.activationForm.get('userSecQuestionsAddDtos') as FormArray).push(this.getFormGroup());
	}

	public removeControl(index: number): void {
		if (this.isButtonDisabledExplicitly)
			return;
		(this.activationForm.get('userSecQuestionsAddDtos') as FormArray).removeAt(index);
	}

	public getQuestionList(): SecurityQuestion[] | null | undefined {

		let isAnySelected = false,
			questionList: SecurityQuestion[] = [];

		isAnySelected = this.userSecQuestionsAddDtos.controls.some((item) => {
			return item.get('secQuestionId')?.value !== null;
		});
		if (!isAnySelected)
			return this.securityQuestions;
		const selectedDropdown = this.userSecQuestionsAddDtos.value
			.map((item: QuestionAnswer | undefined) =>
				item?.secQuestionId?.Value);
		questionList = this.securityQuestions?.filter((item: SecurityQuestion) =>
			!selectedDropdown.includes(item.Value)) ?? [];
		return questionList;
	}

	public isPasswordMinimum(): boolean {
		return this.activationForm.get('newPassword')?.value.length >= (this.passwordPolicy?.RequiredLength ?? magicNumber.zero);
	}
	public isPasswordMaximum(): boolean {
		return this.activationForm.get('newPassword')?.value.length <= (this.passwordPolicy?.MaximumLength ?? magicNumber.zero);
	}

	public isEmpty(): boolean {
		return this.activationForm.get('newPassword')?.value.length === magicNumber.zero;
	}

	public hasUppercase(): boolean {
		if (this.passwordPolicy?.RequireUppercase) {
			const regex = /[A-Z]/;
			return regex.test(this.activationForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasLowercase(): boolean {
		if (this.passwordPolicy?.RequireLowercase) {
			const regex = /[a-z]/;
			return regex.test(this.activationForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasNumeric(): boolean {
		if (this.passwordPolicy?.RequireDigit) {
			const regex = /\d/;
			return regex.test(this.activationForm.get('newPassword')?.value);
		}
		return true;
	}

	public hasSpecialCharacter(): boolean {
		if (this.passwordPolicy?.RequireNonAlphanumeric) {

			const regex = new RegExp(`[${this.passwordPolicy?.AllowedSpecialCharacters}]`);
			return regex.test(this.activationForm.get('newPassword')?.value);
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


	public hasEmailAndLastName(): boolean {
		const emailControl = this.activationForm.get('emailAddress'),
			lastNameControl = this.activationForm.get('lastName');

		if ((emailControl?.value === RequiredStrings.EmptyString || lastNameControl?.value === RequiredStrings.EmptyString) ||
			(emailControl?.invalid || lastNameControl?.invalid)) {
			return true;
		}
		return false;
	}

	public isPasswordMatched(): void {
		if (!this.passwordMatchValidator())
			return;
		else {
			const data: ValidatePasswordPayload = {
				"userId": this.uKeyOrToken,
				"newPassword": this.activationForm.get('newPassword')?.value
			};
			this.userActivationService.validatePassword(data).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
				if (!res.Succeeded) {
					if (res.ValidationMessages && res.ValidationMessages.length > Number(magicNumber.zero)) {
						const valMessage: ValidationError[] = res.ValidationMessages;
						this.setError(this.localizationService.GetLocalizeMessage(valMessage[magicNumber.zero]?.ErrorMessage));
					}
					else {
						this.setError(res.Message);
					}
				}
				else {
					this.toasterService.resetToaster();
					this.currentStep = magicNumber.two;
				}
			});

		}

	}

	public onChangeNewPassword(): void {
		const newPasswordControl = this.activationForm.get('newPassword'),
			confirmPasswordControl = this.activationForm.get('confirmPassword');
		if (!(confirmPasswordControl?.value == undefined || confirmPasswordControl.value == RequiredStrings.EmptyString))
			this.isConfirmPasswordMatch(newPasswordControl as FormControl, confirmPasswordControl as FormControl);
	}

	public passwordMatchValidator(): boolean {
		const newPasswordControl = this.activationForm.get('newPassword') as FormControl,
			confirmPasswordControl = this.activationForm.get('confirmPassword') as FormControl;
		if (confirmPasswordControl.value == undefined || confirmPasswordControl.value == RequiredStrings.EmptyString) {
			confirmPasswordControl.setValidators([
				this.customValidator.RequiredValidator(this.localizationService
					.GetLocalizeMessage(ValidationMessages.PleaseConfirmNewPassword))
			]);
			confirmPasswordControl.markAsTouched();
			confirmPasswordControl.updateValueAndValidity();
			return false;
		}
		if (this.isConfirmPasswordMatch(newPasswordControl as FormControl, confirmPasswordControl as FormControl))
			return false;
		return true;
	}

	private isConfirmPasswordMatch(newPasswordControl: FormControl, confirmPasswordControl: FormControl): boolean {
		if (newPasswordControl.value !== confirmPasswordControl.value) {
			confirmPasswordControl.setValidators([this.customValidator.CompareValidator(this.activationForm.controls['newPassword'], ValidationMessages.ConfirmPasswordDoesNotMatch)]);
			confirmPasswordControl.markAsTouched();
			confirmPasswordControl.updateValueAndValidity();
			return true;
		}
		confirmPasswordControl.markAsUntouched();
		confirmPasswordControl.updateValueAndValidity();
		return false;
	}

	private setError(message: string): void {
		this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(message));
	}

	public verifyEmailAndLastName(): void {
		const emailAddress = this.activationForm.controls['emailAddress'],
			lastName = this.activationForm.controls['lastName'];
		if (this.currentStep === magicNumber.zero) {
			if (emailAddress.invalid || this.activationForm.controls['lastName'].invalid) {
				emailAddress.markAsTouched();
				lastName.markAsTouched();
				return;
			}
			const payload: VerifyUserPayload = {
				Email: emailAddress.value,
				LastName: this.activationForm.controls['lastName'].value,
				IsUserName: true,
				UKey: this.uKeyOrToken ?? RequiredStrings.EmptyString
			};
			this.userActivationService
				.verifyEmailLName(payload)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: GenericResponseBase<UserData>) => {
					if (res.Succeeded) {
						this.userObject = res.Data;
						if (!res.Data?.Disabled) {
							this.toasterService.showToaster(ToastOptions.Error, ToastMessages.AccountAlreadyActivated);
							return;
						}
						this.toasterService.resetToaster();
						this.currentStep = magicNumber.one;
						this.getSecurityQuestions();
					}
					else if (res.Message != RequiredStrings.EmptyString.toString()) {
						const message = res.Message != String(String(ToastMessages.InvalidEmailOrLastName)) ?
							res.Message :
							ToastMessages.XRMUserVerificationFailed;
						this.setError(message);
					}
				});
		}
	}

	public submitForm(): void {
		this.activationForm.get('userSecQuestionsAddDtos')?.markAllAsTouched();
		if (this.activationForm.invalid) {
			return;
		}
		const payload: ActivateUserPayload = {
			userId: this.uKeyOrToken,
			newPassword: this.activationForm.get('newPassword')?.value ?? RequiredStrings.EmptyString,
			confirmPassword: this.activationForm.get('confirmPassword')?.value ?? RequiredStrings.EmptyString,
			userSecQuestionsAddDtos: []
		};
		payload.userSecQuestionsAddDtos = this.activationForm.get('userSecQuestionsAddDtos')?.value
			.map((item: QuestionAnswer | undefined) =>
				({ secQuestionId: item?.secQuestionId?.Value, answer: item?.answer }));
		this.userActivationService.activateUser(payload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
			if (!res.Succeeded) {
				if (res.ValidationMessages && res.ValidationMessages.length > Number(magicNumber.zero)) {
					const valMessage: ValidationError[] = res.ValidationMessages;
					this.setError(this.localizationService.GetLocalizeMessage(valMessage[magicNumber.zero]?.ErrorMessage));
				}
				else {
					this.setError(res.Message);
				}
			}
			else {
				this.toasterService.showToaster(ToastOptions.Success, ToastMessages.AccountActivatedSuccessfully);
				this.isButtonDisabledExplicitly = true;
				this.activationForm.disable();
				this.timeoutId = setTimeout(() => {
					this.login();
				}, magicNumber.seventhousand);
			}
		});
	}
	private setPasswordRequirements(): void {
		if (this.passwordPolicy?.RequiredLength != null) {
			const dynamicParam: DynamicParam[] = [{ Value: this.passwordPolicy?.RequiredLength.toString(), IsLocalizeKey: false }];
			this.MinLengthMessage = this.localizationService.GetLocalizeMessage(ValidationMessages.MinimumCharactersLimitOfPassword, dynamicParam);
		}
		if (this.passwordPolicy?.MaximumLength != null) {
			const dynamicParam: DynamicParam[] = [{ Value: this.passwordPolicy?.MaximumLength.toString(), IsLocalizeKey: false }];
			this.MaxLengthMessage = this.localizationService.GetLocalizeMessage(ValidationMessages.MaximumCharactersLimitOfPassword, dynamicParam);
		}
	}

	private login(): void {
		this.route.navigateByUrl(NavigationPath.Login, { replaceUrl: true });
	}

	public trackByFn(index: number): number {
		return index;
	}

	public clearAnswer(index: number): void {
		const userSecQuestionsAddDtos = this.activationForm.get('userSecQuestionsAddDtos') as FormArray;
		(userSecQuestionsAddDtos.controls[index] as FormGroup).get('answer')?.setValue(RequiredStrings.EmptyString);
	}

	public prev(): void {
		if (this.currentStep == magicNumber.zero)
			this.login();
		this.currentStep -= magicNumber.one;
	}
}
