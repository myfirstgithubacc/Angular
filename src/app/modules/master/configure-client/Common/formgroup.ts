import { AbstractControl, FormBuilder } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export function systemMessageForm(fb: FormBuilder, validators: CustomValidators){
	return fb.group({
		submitBidMessage: [null],
		exceptionMessage: [null],
		onBoardingConfirmationMessage: [null],
		exceptionApproverMessage: [null],
		timeExpenseApproverMessage: [null],
		timeEntryMessage: [null],
		expenseEntryMessage: [null],
		sowAcceptanceMessage: ['AcceptingThisSOWResponseMessage', [validators.RequiredValidator('PleaseEnterData', [{ Value: 'SOWAcceptanceMessageLabel', IsLocalizeKey: true }])]],
		sowTimeExpenseEntryMessage: [null],
		sowTimeExpenseApproverMessage: [null],
		startDateInformation: [null]
	});
}

export function addEditForm(fb: FormBuilder, validators: CustomValidators){
	return fb.group({
		Name: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'ClientName', IsLocalizeKey: true }])]],
		Email: [null],
		Url: [null],
		ClientConfigureType: [null],
		Code: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'ClientId', IsLocalizeKey: true }])]],
		ProgramManagerEmail: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'ProgramManagerEmail', IsLocalizeKey: true }])]],
		ProgramManagerName: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'ProgramManagerName', IsLocalizeKey: true }])]],
		ProgramManagerContact: [null],
		OrganizationLabel: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'MainOrganizationLabel', IsLocalizeKey: true }])]],
		TimezoneId: [null, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'TimeZoneId', IsLocalizeKey: true }])]],
		DefaultCulture: [null, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'DefaultCulture', IsLocalizeKey: true }])]],
		SystemGeneratedEmail: [null, [SpaceValidator]],
		CountryId: [null, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'HomeCountry', IsLocalizeKey: true }])]],
		WeekEndingDayId: [null, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'WeekEndingDayId', IsLocalizeKey: true }])]],
		SowVariance: [null, [validators.RangeValidator(magicNumber.zero, magicNumber.hundred, 'SowVarianceMustBeLessThanOrEqual', validatorsParams(magicNumber.hundred, magicNumber.zero))]],
		OnsiteName: [null],
		EmailDomain: ['none@acrocorp.com', [validators.RequiredValidator('PleaseEnterData', [{ Value: 'EmailDomain', IsLocalizeKey: true }]), DomainValidator]],
		IsMspReviewRequest: [null],
		SkipHoursValidationOnTimeUpload: [null],
		IsLimitAvailableWeekendingInTimeCapture: [true],
		NoOfPreviousWeekending: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'NoOfPastWeekeding', IsLocalizeKey: true }]), validators.RangeValidator(magicNumber.one, magicNumber.sixty, 'NoOfPreviousWeekEndingDatesValidation', validatorsParams(magicNumber.one, magicNumber.sixty))]],
		ClientPaySalesTax: [null],
		IsPortalImplementation: [null],
		IsAcroTracInOutTime: [false],
		IsSalesTaxFromExternalSource: [null],
		IsRfxRequired: [null],
		IsLiClpFilledByDifferentStaffing: [null],
		SupportContactNumber: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'ContactNumber', IsLocalizeKey: true }]), MobileNumberValidator]],
		SupportEmail: [null, [validators.RequiredValidator('PleaseEnterData', [{ Value: 'EmailAddress', IsLocalizeKey: true }]), validators.EmailValidator()]]
	});
}

export function passwordPolicyForm(fb: FormBuilder, validators: CustomValidators){
	return fb.group({
		ReqUppercase: [false],
		ReqLowercase: [false],
		ReqNonAlphanumeric: [false],
		ReqDigit: [false],
		ReqLength: [{Value: magicNumber.three}, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'MinimumPasswordCharactersLimit', IsLocalizeKey: true }])]],
		SuspendedPeriod: [{Value: magicNumber.Ninety}, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'LoginSuspendedPeriod', IsLocalizeKey: true }])]],
		PwdExpiryPeriod: [{Value: magicNumber.Ninety}, [validators.RequiredValidator( 'PleaseSelectData', [{ Value: 'PasswordExpiryPeriod', IsLocalizeKey: true }])]],
		PwdExpiryNotification: [{Value: magicNumber.five}, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'PasswordExpiryNotification', IsLocalizeKey: true }])]],
		AccLockedMaxFailedAttempts: [{Value: magicNumber.three}, [validators.RequiredValidator('PleaseSelectData', [{ Value: 'InvalidAttemptThreshold', IsLocalizeKey: true }])]],
		AccLockedDuration: [
			magicNumber.twoHundredThirtyThree,
			[
				validators.RequiredValidator('PleaseEnterData', [{ Value: 'AccountLockDuration', IsLocalizeKey: true }]),
				validators.RangeValidator(
					magicNumber.ten,
					magicNumber.twoThousandEightHundredEighty,
					'YouCanEnterValueBetween',
					validatorsParams(magicNumber.ten, magicNumber.twoThousandEightHundredEighty)
				)
			]
		]
	});
}

export function staffingAgencyForm(fb: FormBuilder){
	return fb.group({
		staffingAgencyArrayform: fb.array([])
	});
}

export function securityClearance(fb: FormBuilder){
	return fb.group({
		securityClearanceList: fb.array([])
	});
}

export function LocationOfficer(fb: FormBuilder){
	return fb.group({
		locationOfficers: fb.array([])
	});
}

export function validatorsParams(startingValue: number, endingValue: number){
	return [
		{ Value: startingValue.toString(), IsLocalizeKey: false },
		 { Value: endingValue.toString(), IsLocalizeKey: false }
	];
}

export function SpaceValidator(control: AbstractControl){
	if (control.value == null) return null;
	const	val = control.value.toString();
	if (/\s/.test(val)) {
		return {
			error: true,
			message: 'SystemGeneratedEmailValidationMessage'
		};
	}
	return null;
}

export function DomainValidator(control: AbstractControl) {
	if (control.value == null) return null;
	if (control.value.trim().length == magicNumber.zero) return null;

	const value = control.value.toString(),
		emailDomainRegularExpression =
        '^((?!,|,\s*,)(?!-))(@)[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}.([a-zA-Z0-9-]{1,61}|[a-zA-Z0-9-]{1,30}.[a-zA-Z]{2,})$';

	if (value.includes(',,') || /,\s*,/.test(value)) {
		return {
			error: true,
			message: 'MultipleDomainValidationMessage'
		};
	}

	if(value.trim().at(magicNumber.minusOne) == ',')
	{
		return {
			error: true,
			message: 'MultipleDomainValidationMessage'
		};
	}

	let domains = control.value.split(',');
	domains = domains.filter((data: string) =>
		data.trim() !== '');

	domains.forEach((data: string) => {
		data = data.trim();
	});

	for (const d of domains) {
		const domain = d.trim();

		if (!domain.match(new RegExp(emailDomainRegularExpression)) || domain.indexOf('.') < 1
            || (domain.length - domain.indexOf('.')) < Number(magicNumber.three)) {
			return {
				error: true,
				message: 'MultipleDomainValidationMessage'
			};
		}
	}
	return null;
}

export function MobileNumberValidator(control: AbstractControl){
	if (control.value == null) return null;
	if (control.value.trim().length == magicNumber.zero) return null;
	const mobileRegularExpression = '^(?=.*?[1-9])[0-9() -+-]+$',
	 domains = control.value;
	if (!domains.match(new RegExp(mobileRegularExpression))) {
		return { error: true, message: 'PleaseEnterValidContactNumber' };
	}
	return null;
}
