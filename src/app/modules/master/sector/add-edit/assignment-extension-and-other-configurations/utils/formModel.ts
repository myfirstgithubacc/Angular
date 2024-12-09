import { FormControl, FormGroup } from "@angular/forms"
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel"
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";


export interface IAssignmentExtAndOtherConfigFM extends ICommonSectionFM{
    AllowProcessExtensionAdjustment: FormControl<boolean>;
    ExtRateIncreaseAllowed: FormControl<boolean>;
    IsTrainingRequired: FormControl<boolean>;
    AllowSelectionPayRateFillLiRequest: FormControl<boolean>;
    ChangeRateWithoutEffectiveDate: FormControl<boolean>;
    AllowMspAdjustSupplierMarkupInPsr: FormControl<boolean>;
    OffBoardInterval: FormControl<number | null>;
    OffBoardIntervalLi:FormControl<number | null>;
}

export function getAssignmentExtOtherConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IAssignmentExtAndOtherConfigFM>({
		...getCommonSectionFormModel(),
		'AllowProcessExtensionAdjustment': new FormControl<boolean>(false, {nonNullable: true}),
		'ExtRateIncreaseAllowed': new FormControl<boolean>(false, {nonNullable: true}),
		'IsTrainingRequired': new FormControl<boolean>(false, {nonNullable: true}),
		'AllowSelectionPayRateFillLiRequest': new FormControl<boolean>(false, {nonNullable: true}),
		'ChangeRateWithoutEffectiveDate': new FormControl<boolean>(false, {nonNullable: true}),
		'AllowMspAdjustSupplierMarkupInPsr': new FormControl<boolean>(false, {nonNullable: true}),
		'OffBoardInterval': new FormControl<number | null>(null, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'OffBoardInterval'), customValidators.RangeValidator(magicNumber.zero, magicNumber.ninetyNine, 'FieldSpecificYouCanEnterValueBetween', validatorsParams('OffBoardInterval', magicNumber.zero, magicNumber.ninetyNine)), customValidators.IsNumberValidator('PleaseEnterNumericValue')] ),
		'OffBoardIntervalLi': new FormControl<number | null>(null, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'OffBoardIntervalLi'), customValidators.RangeValidator(magicNumber.zero, magicNumber.ninetyNine, 'FieldSpecificYouCanEnterValueBetween', validatorsParams('OffBoardIntervalLi', magicNumber.zero, magicNumber.ninetyNine)), customValidators.IsNumberValidator('PleaseEnterNumericValue')])
	});
}

function validatorsParams(controlName: string, startingValue: number, endingValue: number) {
	return [
		{ Value: controlName, IsLocalizeKey: true },
		{ Value: startingValue.toString(), IsLocalizeKey: false },
		{ Value: endingValue.toString(), IsLocalizeKey: false }
	];
}
