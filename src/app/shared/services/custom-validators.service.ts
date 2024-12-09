/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable max-params */
import { Injectable } from '@angular/core';
import {
	AbstractControl,
	ValidationErrors,
	FormControl,
	ValidatorFn
} from '@angular/forms';
import { DynamicParam } from './Localization/DynamicParam.interface';
import { LocalizationService } from './Localization/localization.service';
import { magicNumber } from './common-constants/magic-number.enum';
import { CultureFormat } from './Localization/culture-format.enum';
import { parseDate } from '@progress/kendo-angular-intl';

@Injectable()
export class CustomValidators {
	constructor(private localizationSrv: LocalizationService) { }
	private alphaNumericWithoutSpaceRegx = /[a-zA-Z0-9_.]/gm;

	checkValidHours(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidatorFn {

		return (control: AbstractControl): ValidationErrors | null => {

			return {
				error: true,
				message: validationMessage ?? '',
				dynamicParam: dynamicParam
			};
		};

	}

	RequiredValidator(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidatorFn {

		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null)
				return {
					error: true,
					message: validationMessage ?? 'ReqFieldValidationMessage',
					dynamicParam: dynamicParam
				};
			if (control.value.toString().trim().length == magicNumber.zero) {
				return {
					error: true,
					message: validationMessage ?? 'ReqFieldValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	requiredValidationsWithMessage(errorMessage: string, dynamicParamName?: string): ValidatorFn {
		return this.RequiredValidator(errorMessage, [{ Value: dynamicParamName ?? '', IsLocalizeKey: true }]);
	}

	AlphaNumericValidator(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidationErrors | null {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			const val = control.value.toString(),
				alphaNumericRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/;
			if (val.trim().length == magicNumber.zero) return null;
			if (!val.match(new RegExp(alphaNumericRegex))) {
				return {
					error: true,
					message: validationMessage ?? 'AlphaNumericValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	IsNumberValidator(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	) {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			const val = control.value.toString();
			if (val.trim().length == magicNumber.zero) return null;
			if (isNaN(val)) {
				return {
					error: true,
					message: validationMessage ?? 'IsNumberValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	StringValidator(
		isSpecialCharAllowed: boolean = false,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	) {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null) return null;
			const val = control.value.toString(),
				stringExp: RegExp = /[^a-zA-Z]+/,
				stringSpecialCharRegEx: RegExp =
					/^[a-zA-Z!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?]*$/;
			if (val.trim().length == magicNumber.zero) return null;

			if (!isSpecialCharAllowed) {
				if (stringExp.test(val)) {
					return {
						error: true,
						message: validationMessage ?? 'StringValidationMessage',
						dynamicParam: dynamicParam
					};
				}
				return null;
			}
			if (!stringSpecialCharRegEx.test(val)) {
				return {
					error: true,
					message: validationMessage ?? 'StringValidationMessage',
					dynamicParam: dynamicParam
				};
			}

			return null;
		};
	}

	NoSpecialCharacterOrSpaceFirst(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	) {
		return (control: AbstractControl): ValidationErrors | null => {
			const forbidden = /^[\s!@#$%^&*(),.?":{}|<>]/.test(control.value);
			return forbidden ?
				{
					error: true,
					message: validationMessage ?? 'forbiddenFirstCharacter',
					dynamicParam: dynamicParam
				}
				: null;
		};
	}

	CompareValidator(
		compareWith: AbstractControl,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	) {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null) return null;

			const val1 = control.value.toString(),
				val2 = compareWith.value.toString();
			if (val1.trim().length == magicNumber.zero) return null;

			if (compareWith.value == null) return null;
			if (val2.trim().length == magicNumber.zero) return null;

			if (val1 != val2) {
				return {
					error: true,
					message: validationMessage ?? 'CompareValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	AddCascadeRequiredValidator(controlList: AbstractControl[], customRequired: number = magicNumber.zero, controlName: any[] = []) {
		controlList.forEach((control, index) => {
			if (customRequired) {
				control.addValidators([this.RequiredValidator('PleaseEnterData', [{ Value: controlName[index], IsLocalizeKey: true }])]);
			} else {
				control.addValidators([this.RequiredValidator()]);
			}
			control.updateValueAndValidity();
		});
	}

	RemoveCascadeRequiredValidator(controlList: AbstractControl[]) {
		controlList.forEach((control) => {
			control.clearValidators();
			control.updateValueAndValidity();
		});
	}

	RegularExpressionValidator(
		regularExpression: string,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidationErrors | null {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			const val = control.value.toString();
			if (val.trim().length == magicNumber.zero) return null;
			if (!val.match(new RegExp(regularExpression))) {
				return {
					error: true,
					message: validationMessage ?? 'RegularExpressionValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	MaxLengthValidator(
		maxLength: number,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	) {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			const val = control.value.toString();

			if (val.trim().length > maxLength) {
				return {
					error: true,
					message: validationMessage ?? 'MaxLengthValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	MinLengthValidator(
		minLength: number,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): any {
		return (control: AbstractControl) => {
			if (control.value == null) return null;

			const val = control.value.toString();
			if (val.trim().length == magicNumber.zero) return null;
			if (val.length < minLength) {
				return {
					error: true,
					message: validationMessage ?? 'MinLengthValidationMessage',
					dynamicParam: dynamicParam
				};
			}

			return null;
		};
	}

	// eslint-disable-next-line max-params
	RangeValidator(
		minLength: number,
		maxLength: number,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null) return null;
			let val = control.value,
				controlVal = val;
			if (control.value instanceof Date) {
				val = val.getTime();
				controlVal = val;
			} else {
				val = val.toString();
				controlVal = Number(val);
			}

			if (val.length == magicNumber.zero) return null;
			if (isNaN(val)) return null;
			if (controlVal < minLength) {
				return {
					error: true,
					message: validationMessage ?? 'RangeValidationMessage',
					dynamicParam: dynamicParam
				};
			}

			if (controlVal > maxLength) {
				return {
					error: true,
					message: validationMessage ?? 'RangeValidationMessage',
					dynamicParam: dynamicParam
				};
			}

			return null;
		};
	}

	DateRangeValidator(minDate: Date, maxDate: Date, validationMessage?: string, dynamicParam: DynamicParam[] = []): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null) return null;
			if(control.value instanceof Date) {
				if (control.value >= minDate && control.value <= maxDate) {
					return {
						'error': true, 'message': validationMessage ?? 'InvalidDate', 'dynamicParam': dynamicParam
					};
				}
			}
			return null;
		};
	}

	DecimalValidator(
		decimalPlaces: number = magicNumber.two,
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null) return null;

			const value = control.value.toString(),
				decimalPattern = `^\\d+(\\.\\d{0,${decimalPlaces}})?$`;
			if (value.length == magicNumber.zero) return null;

			if (isNaN(value)) {
				return {
					error: true,
					message: validationMessage ?? 'IsNumberValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			if (!value.match(new RegExp(decimalPattern))) {
				return {
					error: true,
					message: validationMessage ?? 'DecimalValidationMessage'
				};
			}
			return null;
		};
	}

	NoSpaceValidator(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidationErrors | null {
		return (control: FormControl) => {
			if (control.value == null) return null;
			const noSpaceRegularExpression = '^\\w*$',
				val = control.value.toString();
			if (!val.match(new RegExp(noSpaceRegularExpression))) {
				return {
					error: true,
					message: validationMessage ?? 'NoSpaceValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	NoSpecialCharacterValidator(
		validationMessage?: any,
		dynamicParam: DynamicParam[] = []
	): ValidationErrors | null {
		return (control: FormControl) => {
			if (control.value == null) return null;
			const val = control.value.toString(),
				noSpaceRegularExpression = /^[a-zA-Z0-9 ']*$/;
			if (val.trim().length == magicNumber.zero) return null;
			if (!val.match(new RegExp(noSpaceRegularExpression))) {
				return {
					error: true,
					message: validationMessage ?? 'NoSpecialCharacterValidationMessage',
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	EmailValidator(validationMessage?: any, dynamicParam: DynamicParam[] = [], domians: any[] = []): ValidatorFn {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			if (control.value.trim().length == magicNumber.zero) return null;
			let isEndWithCommon = false;
			const value = control.value;

			if (value.indexOf(',') < magicNumber.zero) {
				if (!this.validateEmail(value, domians))
					return { error: true, message: validationMessage ?? 'EmailValidationMessage', dynamicParam: dynamicParam };

				return null;
			}
			else {
				isEndWithCommon = true;
				const emails = value.split(',');

				if (emails[0] == null || emails[0].length == magicNumber.zero || !this.validateEmail(emails[0], domians))
					return { error: true, message: validationMessage ?? 'EmailValidationMessage', dynamicParam: dynamicParam };
				// end
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (isEndWithCommon)
				return { error: true, message: validationMessage ?? 'MultipleEmailsAreNotAllowed', dynamicParam: dynamicParam };

			return null;
		};
	}

	MultiEmailValidator(validationMessage?: any, dynamicParam: DynamicParam[] = [], domians: any[] = []): ValidatorFn {
		return (control: AbstractControl) => {
			if (control.value == null || control.value.trim().length == magicNumber.zero) return null;
			let value = control.value.toLowerCase(),
				isValid = true;
			const emails = value.split(',');

			if (Number(domians.length) > Number(magicNumber.zero))
				domians = domians.map((item: string) =>
					item.toLowerCase());
			value = control.value.toString();
			if (value.trim().at(magicNumber.minusOne).match(this.alphaNumericWithoutSpaceRegx) == null) {
				return { error: true, message: validationMessage ?? 'EmailValidationMessage', dynamicParam: dynamicParam };
			}
			if (value.indexOf(',') < magicNumber.zero) {
				if (!this.validateEmail(value, domians))
					return { error: true, message: validationMessage ?? 'EmailValidationMessage', dynamicParam: dynamicParam };
				return null;
			}
			for (const email of emails) {
				if (email.trim().length === magicNumber.zero) {
					continue;
				}

				isValid = this.validateEmail(email, domians);
				if (!isValid) break;
			}

			if (!isValid)
				return { error: true, message: validationMessage ?? 'EmailValidationMessage', dynamicParam: dynamicParam };
			return null;
		};
	}

	private validateEmail(emailAddress: any, domians: any[]): boolean {
		if (emailAddress == null) return true;
		if (emailAddress == undefined) return true;
		if (emailAddress.trim().length == magicNumber.zero) return true;

		emailAddress = emailAddress.trim();
		if (emailAddress.at(magicNumber.zero).match(this.alphaNumericWithoutSpaceRegx) == null)
			return false;

		let preFix: any = '',
			domian: any = '';
		const index = emailAddress.indexOf('@');
		if (index < magicNumber.zero) return false;

		preFix = emailAddress.substring(magicNumber.zero, index);
		domian = emailAddress.substring(index + magicNumber.one, emailAddress.length);

		if (!this.validaEmailPrefex(preFix))
			return false;

		if (!this.validatEmailDomain(domian, domians))
			return false;

		return true;
	}

	private validaEmailPrefex(emailPrefix: any) {
		if (emailPrefix.trim().length == magicNumber.zero)
			return false;
		// check full is numeric
		if (!isNaN(emailPrefix))
			return false;
		// check 1st char is alphnumeric
		if (emailPrefix.at(magicNumber.zero).match(this.alphaNumericWithoutSpaceRegx) == null)
			return false;
		// check last char is alphnumeric
		if (emailPrefix.at(magicNumber.minusOne).match(this.alphaNumericWithoutSpaceRegx) == null)
			return false;
		// check allowed special chars
		if (!this.isContinuallyRepeatedSpecialChar(emailPrefix, ['.', '-', '_']))
			return false;

		return true;
	}

	private validatEmailDomain(emailDomain: any, domains: any[]) {
		// check domain empty
		if (emailDomain.trim().length == magicNumber.zero)
			return false;
		// check full is numeric
		if (!isNaN(emailDomain))
			return false;
		// check 1st char is alphnumeric
		if (emailDomain.at(magicNumber.zero).match(this.alphaNumericWithoutSpaceRegx) == null)
			return false;
		// check last char is alphnumeric
		if (emailDomain.at(magicNumber.minusOne).match(this.alphaNumericWithoutSpaceRegx) == null)
			return false;
		// check domain have dot
		if (emailDomain.indexOf('.') < magicNumber.zero)
			return false;
		if (Number(domains.length) > Number(magicNumber.zero))
			return domains.some((x: any) =>
				x == emailDomain);

		if (!this.isContinuallyRepeatedSpecialChar(emailDomain, ['.', '-']))
			return false;

		let isValid = true;
		const domainName = emailDomain.split('.');
		if (domainName.length == magicNumber.one) return true;

		for (let i = 0; i < domainName.length; i++) {
			if (domainName[i] == domainName[i + magicNumber.one] || domainName[i].length < magicNumber.two) {
				isValid = false;
				break;
			}
		}

		return isValid;
	}

	private isContinuallyRepeatedSpecialChar(value: string, allowedSpecialChars: any[]) {
		let isValid = true;
		for (let i = 0; i < value.length; i++) {
			const char = value[i],
				nextChar = value[i + magicNumber.one];
			if (char.match(this.alphaNumericWithoutSpaceRegx) != null) continue;

			if (!allowedSpecialChars.some((x: any) =>
				x == char)) {
				isValid = false;
				break;
			}
			if (nextChar.match(this.alphaNumericWithoutSpaceRegx) == null) {
				isValid = false;
				break;
			}
		}

		return isValid;
	}

	MaxLengthWithMessageValidator(maxLength: number, validationMessage?: any, dynamicParam: DynamicParam[] = []): ValidationErrors | null {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			const val = control.value.toString();

			if (val.trim().length > maxLength) {
				return {
					error: true,
					message:
						validationMessage ??
						`Can not exceed max length (${maxLength})`,
					dynamicParam: dynamicParam
				};
			}
			return null;
		};
	}

	MinLengthWithMessageValidator(minLength: number, validationMessage?: any, dynamicParam: DynamicParam[] = []): ValidationErrors | null {
		return (control: AbstractControl) => {
			if (control.value == null) return null;

			const val = control.value.toString();
			if (val.trim().length == magicNumber.zero) return null;
			if (val.length < minLength) {
				return {
					error: true,
					message:
						validationMessage ?? `Minimum length (${minLength}) required.`,
					dynamicParam: dynamicParam
				};
			}

			return null;
		};
	}

	DateNotEqualToValidator(compareWithControlName: any, validationMessage?: any, dynamicParam: DynamicParam[] = []): ValidationErrors | null {
		return (control: AbstractControl) => {
			if(!control.value || !control.parent?.get(compareWithControlName)?.value)
				return null;

			const date1 = parseDate(control.value),
				date2 = parseDate(control.parent.get(compareWithControlName)?.value);
			if (!date1 || !date2)
				return null;

			if (date1.toString() == date2.toString())
				return { error: true, message: validationMessage ?? 'InvalidDate', dynamicParam: dynamicParam };

			control.parent.get(compareWithControlName)?.setErrors(null);
			return null;
		};
	}

	DateLessThanValidator(compareWithControlName: any, validationMessage?: any, dynamicParam: DynamicParam[] = []): ValidationErrors | null {
		return (control: AbstractControl) => {
			if(!control.value || !control.parent?.get(compareWithControlName)?.value)
				return null;

			const date1 = parseDate(control.value),
				date2 = parseDate(control.parent.get(compareWithControlName)?.value);
			if (!date1 || !date2)
				return null;

			if (date1 < date2)
				return { error: true, message: validationMessage ?? 'InvalidDate', dynamicParam: dynamicParam };

			control.parent.get(compareWithControlName)?.setErrors(null);
			return null;
		};
	}

	DateGreaterThanValidator(compareWithControlName: any, validationMessage?: any, dynamicParam: DynamicParam[] = []): ValidationErrors | null {
		return (control: AbstractControl) => {
			if(!control.value || !control.parent?.get(compareWithControlName)?.value)
				return null;

			const date1 = parseDate(control.value),
				date2 = parseDate(control.parent.get(compareWithControlName)?.value);
			if (!date1 || !date2)
				return null;

			if (date1 > date2)
				return { error: true, message: validationMessage ?? 'InvalidDate', dynamicParam: dynamicParam };

			control.parent.get(compareWithControlName)?.setErrors(null);
			return null;
		};
	}


	DateLessThanWithEqualValidator(compareWithControlName: any, validationMessage: any, dynamicParam: DynamicParam[]): ValidationErrors | null {
		return (control: AbstractControl) => {
			if(!control.value || !control.parent?.get(compareWithControlName)?.value)
				return null;

			const date1 = parseDate(control.value),
				date2 = parseDate(control.parent.get(compareWithControlName)?.value);
			if (!date1 || !date2)
				return null;


			date1.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
			date2.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
			if (date1 >= date2) {
				control.parent?.get(compareWithControlName)?.setErrors(null);
				return null;
			} else {
				return { error: true, message: validationMessage ?? 'InvalidDate', dynamicParam: dynamicParam };
			}
		};
	}

	DateGreaterThanWithEqualValidator(
		compareWithControlName: any,
		validationMessage?: any, dynamicParam: DynamicParam[] = []
	): ValidationErrors {
		return (control: AbstractControl) => {
			if(!control.value || !control.parent?.get(compareWithControlName)?.value)
				return null;

			const date1 = parseDate(control.value),
				date2 = parseDate(control.parent.get(compareWithControlName)?.value);

			if (!date1 || !date2)
				return null;

			date1.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
			date2.setHours(magicNumber.zero, magicNumber.zero, magicNumber.zero, magicNumber.zero);
			if (date1 <= date2) {
				control.parent?.get(compareWithControlName)?.setErrors(null);
				return null;
			} else {
				return { error: true, message: validationMessage ?? 'InvalidDate', dynamicParam: dynamicParam };
			}
		};
	}

	MaskValidator(validationMessage?: any, dynamicParam: DynamicParam[] = []): any {
		return (control: AbstractControl) => {
			const val = control.value,
				isPatternError = control.errors?.['patternError'] != undefined;
			if (val == null) return;
			if (val.trim().length == magicNumber.zero) return;
			if (isPatternError) {
				control.setErrors({ error: true, message: validationMessage ?? 'InvalidPatternValidationMessage', dynamicParam: dynamicParam });
				return { error: true, message: validationMessage ?? 'InvalidPatternValidationMessage', dynamicParam: dynamicParam };
			}

			return null;
		};
	}

	// end class

	// eslint-disable-next-line max-params

	ZipCodeValidator(zipLengthSeries: string, zipCodeFormat: string, validationMessage?: any, dynamicParam: DynamicParam[] = []) {
		return (control: AbstractControl) => {
			if (control.value == null || (zipLengthSeries == null && zipCodeFormat == null) ||
				(zipLengthSeries.length == magicNumber.zero &&
					zipCodeFormat.length == magicNumber.zero))
				return null;

			const val = control.value.toString().trimEnd();
			if (val.length == magicNumber.zero)
				return null;
			if (val.indexOf(' ') != magicNumber.minusOne)
				return { error: true, message: validationMessage ?? 'InvalidPatternValidationMessage' };

			if (zipLengthSeries != null) {
				const zipCodeLength = zipLengthSeries.toString().split(','),
					index = zipCodeLength.findIndex((x: any) =>
						parseInt(x) == val.length);
				if (index == magicNumber.minusOne) {
					return { error: true, message: validationMessage ?? 'InvalidPatternValidationMessage', dynamicParam: dynamicParam };
				}
				return null;
			}

			if (zipCodeFormat != null) {
				if (val.trim().length == magicNumber.zero) return null;
				const alphaNumericRegex = '^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$';
				if (zipCodeFormat === "AN" && !val.match(new RegExp(alphaNumericRegex))) {
					return {
						error: true,
						message: validationMessage ?? 'AlphaNumericValidationMessage',
						dynamicParam: dynamicParam
					};

				}
				else if (isNaN(val)) {
					return {
						error: true,
						message: validationMessage ?? 'IsNumberValidationMessage',
						dynamicParam: dynamicParam
					};
				}
			}
			return null;

		};
	}

	// Zip Code Validator
	PostCodeValidator(countryId: any, validationMessage?: any, dynamicParam: DynamicParam[] = []) {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			if (countryId == undefined || countryId == null || countryId.length == magicNumber.zero || countryId == magicNumber.zero)
				return null;

			if (control.value == null || control.value.length == magicNumber.zero)
				return null;

			const dynamicParam: DynamicParam[] = [],
				val = control.value.toString().trimEnd(),
				zipLengthSeries = this.localizationSrv.GetCulture(CultureFormat.ZipLengthSeries, countryId),
				zipCodeFormat = this.localizationSrv.GetCulture(CultureFormat.ZipFormat, countryId),
				zipCodeLength = zipLengthSeries.toString().split(','),
				zipCodeLable = this.localizationSrv.GetCulture(CultureFormat.ZipLabel, countryId),
				alphaNumericRegex = '^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]+$',
				index = zipCodeLength.findIndex((x: any) =>
					parseInt(x) == val.length);

			if (validationMessage) {
				dynamicParam.length = 0;
				dynamicParam.push({ Value: zipCodeLable, IsLocalizeKey: false });
				validationMessage = this.localizationSrv.GetLocalizeMessage(validationMessage, dynamicParam);
			}
			else {
				validationMessage = zipCodeLable;
			}

			if (val.startsWith(' ') || index == magicNumber.minusOne) {
				dynamicParam.length = 0;
				dynamicParam.push({ Value: validationMessage, IsLocalizeKey: false });
				dynamicParam.push({ Value: zipLengthSeries.replaceAll(',', ", "), IsLocalizeKey: false });
				return { error: true, message: 'ZipCodeValidationMessage', dynamicParam: dynamicParam };
			}

			if (zipCodeFormat == "AN" && !val.match(new RegExp(alphaNumericRegex))) {
				dynamicParam.length = 0;
				dynamicParam.push({ Value: validationMessage, IsLocalizeKey: false });
				dynamicParam.push({ Value: 'AlphaNumeric', IsLocalizeKey: true });
				return { error: true, message: 'AlphaNumericValidationMessage', dynamicParam: dynamicParam };
			}
			else if (zipCodeFormat == "NU" && isNaN(val)) {
				dynamicParam.length = 0;
				dynamicParam.push({ Value: validationMessage, IsLocalizeKey: false });
				dynamicParam.push({ Value: 'IsNumeric', IsLocalizeKey: true });
				return { error: true, message: 'AlphaNumericValidationMessage', dynamicParam: dynamicParam };
			}

			return null;
		};
	}

	// Format validator
	FormatValidator(validationMessage?: any, dynamicParam: DynamicParam[] = []) {
		return (control: AbstractControl) => {
			if (control.value == null) return null;
			if (control.value.length == magicNumber.zero) return null;
			const formatLen = control.value.length,
				actualLen = control.value.replace(/\s/g, "").length;
			if (actualLen == formatLen)
				return null;
			return { error: true, message: validationMessage ?? 'InvalidFormat', dynamicParam: dynamicParam };
		};
	}

	removeErrors(errorName: string, formControl: AbstractControl) {
		const currentErrors = formControl.errors;
		if (currentErrors) {
			delete currentErrors[errorName];
			formControl.setErrors(Object.keys(currentErrors).length > magicNumber.zero
				? currentErrors
				: null);
		}
	}
}
