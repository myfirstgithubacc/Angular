import { AbstractControl, FormArray, ValidatorFn } from "@angular/forms";
import { removeFormArrayValidations } from "@xrm-master/sector/common/common-sector-code";
import { PoTypeSowIcs } from "@xrm-shared/services/common-constants/static-data.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export function IsRfxSowRequiredValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const IsRfxSowRequiredSwitch = control?.value,
			SowMspFeePercentageTextBox = control?.parent?.get('SowMspFeePercentage'),
			IcMspFeePercentageTextBox = control?.parent?.get('IcMspFeePercentage'),
			IsSowAmountLimitRequiredSwitch = control?.parent?.get('IsSowAmountLimitRequired'),
			SowAmountLimitTextBox = control?.parent?.get('SowAmountLimit'),
			PoTypeSowIcRadio = control?.parent?.get('PoTypeSowIc'),
			DefaultPoForSowIcTextBox = control?.parent?.get('DefaultPoForSowIc'),
			RfxStandardFA = control?.parent?.get('SectorRfxStandardFields') as FormArray,
			SowCommodityFA = control?.parent?.get('SectorSowCommodityTypes') as FormArray;

		if(SowMspFeePercentageTextBox !== null) {
			if(IsRfxSowRequiredSwitch) {
				SowMspFeePercentageTextBox?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SowMspFeePercentage')]);
				IcMspFeePercentageTextBox?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'IcMspFeePercentage')]);
				IsSowAmountLimitRequiredSwitch?.addValidators(IsSowAmountLimitRequiredValidations(customValidators));
				PoTypeSowIcRadio?.addValidators(PoTypeSowIcValidations(customValidators));
			} else {
				SowMspFeePercentageTextBox?.clearValidators();
				IcMspFeePercentageTextBox?.clearValidators();
				IsSowAmountLimitRequiredSwitch?.clearValidators();
				SowAmountLimitTextBox?.clearValidators();
				PoTypeSowIcRadio?.clearValidators();
				DefaultPoForSowIcTextBox?.clearValidators();
				removeFormArrayValidations(RfxStandardFA);
				removeFormArrayValidations(SowCommodityFA);
			}
			SowMspFeePercentageTextBox?.updateValueAndValidity();
			IcMspFeePercentageTextBox?.updateValueAndValidity();
			IsSowAmountLimitRequiredSwitch?.updateValueAndValidity();
			SowAmountLimitTextBox?.updateValueAndValidity();
			PoTypeSowIcRadio?.updateValueAndValidity();
			DefaultPoForSowIcTextBox?.updateValueAndValidity();
		}

		return null;
	};
}

function IsSowAmountLimitRequiredValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const IsSowAmountLimitRequiredSwitch = control?.value,
			SowAmountLimitTextBox = control?.parent?.get('SowAmountLimit');

		if(SowAmountLimitTextBox !== null) {
			if(IsSowAmountLimitRequiredSwitch) {
				SowAmountLimitTextBox?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SowAmountLimit')]);
			} else {
				SowAmountLimitTextBox?.clearValidators();
			}
			SowAmountLimitTextBox?.updateValueAndValidity();
		}
		return null;
	};
}

function PoTypeSowIcValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const PoTypeSowIcRadio = control?.value,
			DefaultPoForSowIcTextBox = control?.parent?.get('DefaultPoForSowIc');

		if(DefaultPoForSowIcTextBox !== null) {
			if(PoTypeSowIcRadio == PoTypeSowIcs['Single Po'].toString()) {
				DefaultPoForSowIcTextBox?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'DefaultPoForSowIc')]);
			} else {
				DefaultPoForSowIcTextBox?.clearValidators();
			}
			DefaultPoForSowIcTextBox?.updateValueAndValidity();
		}
		return null;
	};
}
