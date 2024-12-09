import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { toggleSwitchDependentValidations } from "../Submittal-Config-DependentValidation";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { SectorSubmittalConfiguration } from "@xrm-core/models/Sector/sector-submittal-configuration.model";

export interface ISubmittalConfigFM extends ICommonSectionFM {
    'NonW2ClpAccepted': FormControl<boolean>,
    'AllowSupplierToSubmitExistingClps': FormControl<boolean>,
    'IsSubmittalReminderToManager': FormControl<boolean | null>,
    'SubmittalReminderToStaffingForNotOfferAccepting': FormControl<boolean | null>,
    'SubmittalReminderInterval': FormControl<string | null>,
    'SubmittalReminderIntervalToStaffing' : FormControl<string | null>,
    'UniqueSubmittals': FormArray<FormGroup<IUniqueSubmittal>>
}

export interface IUniqueSubmittal {
	'Id': FormControl<number | null>,
	'LabelName': FormControl<string | null>,
	'ToolTip': FormControl<string | null>,
	'MaxLength': FormControl<number | null>,
	'IsNumeric': FormControl<boolean>,
	'IsPartialEntry': FormControl<boolean>,
	'RightmostChars': FormControl<number | null>
}

export function getSubmittalConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<ISubmittalConfigFM>({
		...getCommonSectionFormModel(),
		'NonW2ClpAccepted': new FormControl<boolean>(false, {nonNullable: true}),
		'AllowSupplierToSubmitExistingClps': new FormControl<boolean>(false, {nonNullable: true}),
		'IsSubmittalReminderToManager': new FormControl<boolean>(false, toggleSwitchDependentValidations('SubmittalReminderInterval', [
			customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SubmittalReminderInterval'),
			customValidators.RangeValidator(magicNumber.zeroDotZeroOne, magicNumber.fourNineWithTwoNine, 'ValueGreaterThanZero')
			 	])),
		'SubmittalReminderInterval': new FormControl<string | null>(null, {nonNullable: true}),
		'SubmittalReminderToStaffingForNotOfferAccepting': new FormControl<boolean>(false, toggleSwitchDependentValidations('SubmittalReminderIntervalToStaffing', [
			customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SubmittalReminderIntervalToStaffing'),
			customValidators.RangeValidator(magicNumber.zeroDotZeroOne, magicNumber.fourNineWithTwoNine, 'ValueGreaterThanZero')
			 	])),
		"SubmittalReminderIntervalToStaffing": new FormControl<string | null>(null, {nonNullable: true}),
		'UniqueSubmittals': new FormArray<FormGroup<IUniqueSubmittal>>([
			new FormGroup<IUniqueSubmittal>({
				'Id': new FormControl<number | null>(magicNumber.zero),
				'LabelName': new FormControl<string | null>(null, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'CurrentFieldName'), customValidators.MaxLengthValidator(magicNumber.fifty, "MaximumCharLimit")]),
				'ToolTip': new FormControl<string | null>(null, [customValidators.MaxLengthValidator(magicNumber.fiveThousand, "MaximumCharLimit")]),
				'MaxLength': new FormControl<number>(magicNumber.zero, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'UIDLength')]),
				'IsNumeric': new FormControl<boolean>(false, {nonNullable: true}),
				'IsPartialEntry': new FormControl<boolean>(false, {nonNullable: true}),
				'RightmostChars': new FormControl<number | null>(null)
			})
		])
	});
}

export function patchSubmittalConfig(submittalConfigData: SectorSubmittalConfiguration, formGroup: FormGroup<ISubmittalConfigFM>) {
	formGroup.patchValue(submittalConfigData);
}

export function setUniqueSubmittalsForConfigureClient(
	UniqueSubmittals: FormArray,
	 configureClient: { 'IsUidNumeric': boolean, 'UidLength': number, 'UidLabelLocalizedKey': string }
) {
	UniqueSubmittals.at(magicNumber.zero).patchValue({
		'LabelName': configureClient.UidLabelLocalizedKey,
		'MaxLength': configureClient.UidLength,
		'IsNumeric': configureClient.IsUidNumeric
	});
}
