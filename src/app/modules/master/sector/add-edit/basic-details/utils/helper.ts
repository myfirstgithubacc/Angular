import { AbstractControl, FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { IDropdown } from "@xrm-shared/models/common.model";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { SectorBasicDetails } from '@xrm-core/models/Sector/sector-basic-detail.model';
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export interface IBasicDetailsFM extends ICommonSectionFM {
	SectorName: FormControl<string | null>;
	AddressLine1: FormControl<string | null>;
	AddressLine2: FormControl<string | null>;
	CountryId: FormControl<IDropdown | null>;
	City: FormControl<string | null>;
	StateId: FormControl<IDropdown | null>;
	PostalCode: FormControl<string | null>;
	HomeLanguageCode: FormControl<IDropdown | null>;
	PasswordExpiryPeriod: FormControl<IDropdown | null>;
	InitialGoLiveDate: FormControl<Date | null>;
	WeekEndingDayId: FormControl<IDropdown | null>;
	TimeZoneId: FormControl<IDropdown | null>;
	IsLimitAvailableWeekendingInTimeCapture: FormControl<boolean|null>;
	NoOfPastWeekeding: FormControl<number | null>;
}

export function getBasicDetailsFormModel(customValidators: CustomValidators) {
	return new FormGroup<IBasicDetailsFM>({
		...getCommonSectionFormModel(),
		'SectorName': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'Sector')),
		'AddressLine1': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'AddressLine1')),
		'AddressLine2': new FormControl<string | null>(null),
		'CountryId': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'CountryId')),
		'City': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'City')),
		'StateId': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'State')),
		'PostalCode': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'PostalCode')),
		'HomeLanguageCode': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'DefaultCulture')),
		'PasswordExpiryPeriod': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'FieldPasswordExpiryPeriod')),
		'InitialGoLiveDate': new FormControl<Date | null>(new Date()),
		'WeekEndingDayId': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'WeekEndingDayId')),
		'TimeZoneId': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'TimeZoneId')),
		'IsLimitAvailableWeekendingInTimeCapture': new FormControl<boolean>(false, NoOfPastWeekedingValidations(customValidators)),
		'NoOfPastWeekeding': new FormControl<number | null>(null)
	});
}

function NoOfPastWeekedingValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl) => {
		const IsLimitAvailableWeekendingInTimeCaptureSwitch = control.value,
			NoOfPastWeekedingTextBox = control.parent?.get('NoOfPastWeekeding');
		if(IsLimitAvailableWeekendingInTimeCaptureSwitch) {
			NoOfPastWeekedingTextBox?.addValidators([
				customValidators.RequiredValidator("PleaseEnterData", [{ Value: 'NoOfPastWeekeding', IsLocalizeKey: true }]),
				customValidators.RangeValidator(magicNumber.one, magicNumber.sixty, "NoOfPreviousWeekEndingDatesValidation", [{ Value: '1', IsLocalizeKey: true }, { Value: '60', IsLocalizeKey: true }])
			]);
		} else {
			NoOfPastWeekedingTextBox?.clearValidators();
		}
		NoOfPastWeekedingTextBox?.updateValueAndValidity();
		return null;
	};
}

export function patchBasicDetails(
	BasicDetailsData: SectorBasicDetails,
	formGroup: FormGroup<IBasicDetailsFM>
){
	formGroup.patchValue({
		'SectorName': BasicDetailsData.SectorName,
		'AddressLine1': BasicDetailsData.AddressLine1,
		'AddressLine2': BasicDetailsData.AddressLine2,
		'CountryId': { 'Text': BasicDetailsData.CountryName, 'Value': BasicDetailsData.CountryId.toString() },
		'StateId': { 'Text': BasicDetailsData.StateName, 'Value': BasicDetailsData.StateId.toString() },
		'TimeZoneId': { 'Text': BasicDetailsData.TimezoneName, 'Value': BasicDetailsData.TimeZoneId.toString() },
		'City': BasicDetailsData.City,
		'PostalCode': BasicDetailsData.PostalCode,
		'HomeLanguageCode': { 'Text': BasicDetailsData.HomeLanguageName, 'Value': BasicDetailsData.HomeLanguageCode.toString() },
		'PasswordExpiryPeriod': { 'Text': BasicDetailsData.PasswordExpiryPeriodName, 'Value': BasicDetailsData.PasswordExpiryPeriod.toString() },
		'InitialGoLiveDate': (!(BasicDetailsData.InitialGoLiveDate !== null && BasicDetailsData.InitialGoLiveDate !== undefined)) ?
			BasicDetailsData.InitialGoLiveDate
			: new Date(BasicDetailsData.InitialGoLiveDate),
		'WeekEndingDayId': { 'Text': BasicDetailsData.WeekDayName, 'Value': BasicDetailsData.WeekEndingDayId.toString() },
		'IsLimitAvailableWeekendingInTimeCapture': BasicDetailsData.IsLimitAvailableWeekendingInTimeCapture,
		'NoOfPastWeekeding': (BasicDetailsData.IsLimitAvailableWeekendingInTimeCapture) ?
			BasicDetailsData.NoOfPastWeekeding
			: null,
		'StatusCode': BasicDetailsData.StatusCode,
		'SectorId': BasicDetailsData.SectorId,
		'SectorUkey': BasicDetailsData.SectorUkey
	});
}
