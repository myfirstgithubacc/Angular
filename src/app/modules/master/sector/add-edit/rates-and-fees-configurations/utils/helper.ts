import { FormControl, FormGroup } from "@angular/forms";
import { SectorRatesAndFeesConfiguration } from "@xrm-core/models/Sector/sector-rates-and-fees-configuration.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { IDropdown } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface IRateAndFeesConfigFM extends ICommonSectionFM {
	OtRateType: FormControl<IDropdown | null>,
	StBillOrStWage: FormControl<number>,
	OtWageMultiplier: FormControl<number | null>,
	DtWageMultiplier: FormControl<number | null>,
	OtBillMultiplier: FormControl<number | null>,
	DtBillMultiplier: FormControl<number | null>,
	RecruitedLiMspFee: FormControl<number | null>,
	PayrolledMspFee: FormControl<number | null>,
	VendorFeeMultiplier: FormControl<number | null>,
	RecruitedAdminFee: FormControl<number | null>,
	PayrolledAdminFee: FormControl<number | null>,
	StandardRecruitedMarkup: FormControl<number | null>,
	MaskOtFieldsInSystem: FormControl<boolean>,
}

export function getRateAndFeesConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IRateAndFeesConfigFM>({
		...getCommonSectionFormModel(),
		'OtRateType': new FormControl<IDropdown | null>(null, [customValidators.requiredValidationsWithMessage('PleaseSelectData', 'OtRateCalcuatedBasedOn')]),
		'StBillOrStWage': new FormControl<number>(Number(magicNumber.one), {nonNullable: true}),
		'OtWageMultiplier': new FormControl<number | null>(Number(magicNumber.oneDotFive), ValidateFn(magicNumber.three, { min: 0.00001, max: 9.999, controlName: 'OtWageMultiplier' }, magicNumber.ten, customValidators)),
		'DtWageMultiplier': new FormControl<number | null>(Number(magicNumber.twoDotZero), ValidateFn(magicNumber.three, { min: 0.00001, max: 9.999, controlName: 'DtWageMultiplier' }, magicNumber.ten, customValidators)),
		'OtBillMultiplier': new FormControl<number | null>(null, ValidateFn(magicNumber.four, { min: 0.00001, max: 9.9999, controlName: 'OtBillMultiplier' }, magicNumber.ten, customValidators)),
		'DtBillMultiplier': new FormControl<number | null>(null, ValidateFn(magicNumber.four, { min: 0.00001, max: 9.9999, controlName: 'DtBillMultiplier' }, magicNumber.ten, customValidators)),
		'RecruitedLiMspFee': new FormControl<number | null>(null, ValidateFn(magicNumber.three, { min: 0.00001, max: 99.999, controlName: 'RecruitedLiMspFeePercent', valMessage: null }, magicNumber.hundred, customValidators)),
		'PayrolledMspFee': new FormControl<number | null>(null, ValidateFn(magicNumber.three, { min: 0.00001, max: 99.999, controlName: 'PayrolledMspFeePercent', valMessage: null }, magicNumber.hundred, customValidators)),
		'VendorFeeMultiplier': new FormControl<number | null>(Number(magicNumber.one), ValidateFn(magicNumber.three, { min: 0.00001, max: 99.999, controlName: 'VendorFeeMultiplier' }, magicNumber.hundred, customValidators)),
		'RecruitedAdminFee': new FormControl<number | null>(null, [customValidators.DecimalValidator(magicNumber.three, 'PleaseEnterNumericValuesUpto3Decimal'), customValidators.RangeValidator(magicNumber.zero, magicNumber.NinetyNineDotTripleNine, 'FieldSpecificValueGreaterEqualAndLessThan', validatorsParams('RecruitedAdminFee', magicNumber.zero, magicNumber.hundred))]),
		'PayrolledAdminFee': new FormControl<number | null>(null, [customValidators.DecimalValidator(magicNumber.three, 'PleaseEnterNumericValuesUpto3Decimal'), customValidators.RangeValidator(magicNumber.zero, magicNumber.NinetyNineDotTripleNine, 'FieldSpecificValueGreaterEqualAndLessThan', validatorsParams('PayrolledAdminFee', magicNumber.zero, magicNumber.hundred))]),
		'StandardRecruitedMarkup': new FormControl<number | null>(null, ValidateFn(magicNumber.three, { min: 0.00001, max: 99.999, controlName: 'StandardRecruitedMarkup' }, magicNumber.hundred, customValidators)),
		'MaskOtFieldsInSystem': new FormControl<boolean>(false, {nonNullable: true})
	});
}


// eslint-disable-next-line max-params
function ValidateFn(
	deciValidatorVal: number, rangeValidatorVal: {min:number, max:number, controlName:string, valMessage?: string | null},
	 rangeValidatorMaxDynamicParam: number, customvalidators: CustomValidators
) {
	const decimalValidatorMessage: string =
		deciValidatorVal === Number(magicNumber.three)
			? 'PleaseEnterNumericValuesUpto3Decimal'
			: 'PleaseEnterNumericValuesUpto4Decimal';

	return [
		customvalidators.requiredValidationsWithMessage('PleaseEnterData', rangeValidatorVal.controlName),
		customvalidators.DecimalValidator(deciValidatorVal, decimalValidatorMessage),
		customvalidators.RangeValidator(
			rangeValidatorVal.min, rangeValidatorVal.max, rangeValidatorVal.valMessage
				? rangeValidatorVal.valMessage
				: 'FieldSpecificValueGreaterAndLessThan',
			validatorsParams(rangeValidatorVal.controlName, magicNumber.zero, rangeValidatorMaxDynamicParam)
		)
	];
}

function validatorsParams(controlName: string, startingValue: number, endingValue: number) {
	return [
		{ Value: controlName, IsLocalizeKey: true },
		{ Value: startingValue.toString(), IsLocalizeKey: false },
		{ Value: endingValue.toString(), IsLocalizeKey: false }
	];
}

export function patchRateAndFeesConfig(RatesAndFeesConfigData: SectorRatesAndFeesConfiguration, formGroup: FormGroup<IRateAndFeesConfigFM>) {
	formGroup.patchValue({
		'OtRateType': { 'Text': RatesAndFeesConfigData.OtRateTypeName ?? '', 'Value': RatesAndFeesConfigData.OtRateType?.toString() ?? '' },
		'OtWageMultiplier': RatesAndFeesConfigData.OtWageMultiplier,
		'DtWageMultiplier': RatesAndFeesConfigData.DtWageMultiplier,
		'OtBillMultiplier': RatesAndFeesConfigData.OtBillMultiplier,
		'DtBillMultiplier': RatesAndFeesConfigData.DtBillMultiplier,
		'RecruitedLiMspFee': RatesAndFeesConfigData.RecruitedLiMspFee,
		'PayrolledMspFee': RatesAndFeesConfigData.PayrolledMspFee,
		'VendorFeeMultiplier': RatesAndFeesConfigData.VendorFeeMultiplier,
		'RecruitedAdminFee': RatesAndFeesConfigData.RecruitedAdminFee,
		'PayrolledAdminFee': RatesAndFeesConfigData.PayrolledAdminFee,
		'StandardRecruitedMarkup': RatesAndFeesConfigData.StandardRecruitedMarkup,
		'MaskOtFieldsInSystem': RatesAndFeesConfigData.MaskOtFieldsInSystem,
		'SectorId': RatesAndFeesConfigData.SectorId,
		'SectorUkey': RatesAndFeesConfigData.SectorUkey,
		'StatusCode': RatesAndFeesConfigData.StatusCode
	});
}
