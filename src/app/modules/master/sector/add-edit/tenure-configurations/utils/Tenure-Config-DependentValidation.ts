/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { AbstractControl, ValidatorFn } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { TenureLimitTypes } from "@xrm-shared/services/common-constants/static-data.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

// eslint-disable-next-line max-lines-per-function
export function TenurePolicyApplicableValidations(customValidators: CustomValidators): ValidatorFn {
	// eslint-disable-next-line max-lines-per-function
	return (control: AbstractControl) => {
		const TenurePolicyApplicableSwitch = control.value,
			TenureLimitTypeRadio = control?.parent?.get('TenureLimitType'),
			TenureResetPeriodTextBox = control?.parent?.get('TenureResetPeriod'),
			ClpTenureLimitTextBox = control?.parent?.get('ClpTenureLimit'),
			ReqTenureLimitTextBox = control?.parent?.get('ReqTenureLimit'),
			ExtTenureLimitTextBox = control?.parent?.get('ExtTenureLimit');

		if(TenureLimitTypeRadio !== null) {
			if(TenurePolicyApplicableSwitch) {
				TenureLimitTypeRadio?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'TenureLimitType'), TenureLimitTypeValidations(true)]);
				ClpTenureLimitTextBox?.addValidators([
					customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ClpTenureLimit'),
					customValidators.RangeValidator(magicNumber.zeroDotZeroOne, magicNumber.fourNineWithTwoNine, 'FieldSpecificValueGreaterThanZero', [{ Value: 'ClpTenureLimit', IsLocalizeKey: true }]),
					ClpTenureLimitValidations(true)
				]);
				ReqTenureLimitTextBox?.addValidators([
					customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ReqTenureLimit'),
					customValidators.RangeValidator(magicNumber.zeroDotZeroOne, magicNumber.fourNineWithTwoNine, 'FieldSpecificValueGreaterThanZero', [{ Value: 'ReqTenureLimit', IsLocalizeKey: true }]),
					ClpTenureLimitValidations(),
					TenureLimitTypeValidations()
				]);
				ExtTenureLimitTextBox?.addValidators([
					customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ExtTenureLimit'),
					customValidators.RangeValidator(magicNumber.zeroDotZeroOne, magicNumber.fourNineWithTwoNine, 'FieldSpecificValueGreaterThanZero', [{ Value: 'ExtTenureLimit', IsLocalizeKey: true }]),
					ClpTenureLimitValidations()
				]);
				if(TenureResetPeriodTextBox?.status === 'DISABLED' || TenureResetPeriodTextBox?.status === 'VALID')
					TenureResetPeriodTextBox?.addValidators([
						customValidators.requiredValidationsWithMessage('PleaseEnterData', 'FieldTenureResetPeriod'),
				 customValidators.RangeValidator(magicNumber.zeroDotZeroOne, 9999, "FieldSpecificValueGreaterThanZero", [{ Value: 'FieldTenureResetPeriod', IsLocalizeKey: true }])
					]);
			} else {
				TenureLimitTypeRadio?.clearValidators();

				TenureResetPeriodTextBox?.reset(null, { emitEvent: false });
				TenureResetPeriodTextBox?.clearValidators();

				ClpTenureLimitTextBox?.reset(null, { emitEvent: false });
				ClpTenureLimitTextBox?.clearValidators();

				ReqTenureLimitTextBox?.reset(null, { emitEvent: false });
				ReqTenureLimitTextBox?.clearValidators();

				ExtTenureLimitTextBox?.reset(null, { emitEvent: false });
				ExtTenureLimitTextBox?.clearValidators();
			}
			TenureLimitTypeRadio?.updateValueAndValidity();
			TenureResetPeriodTextBox?.updateValueAndValidity({ emitEvent: false });
			ClpTenureLimitTextBox?.updateValueAndValidity({ emitEvent: false });
			ReqTenureLimitTextBox?.updateValueAndValidity({ emitEvent: false });
			ExtTenureLimitTextBox?.updateValueAndValidity({ emitEvent: false });
		}

		return null;
	};
}

function TenureLimitTypeValidations(radioButton:boolean = false): ValidatorFn {
	return (control: AbstractControl) => {
		const valueComingFromRadio = radioButton,
		 TenureLimitTypeRadio = control?.parent?.get('TenureLimitType'),
			ReqTenureLimitTextBox = control?.parent?.get('ReqTenureLimit');
		if(TenureLimitTypeRadio !== null) {
			if ((ReqTenureLimitTextBox?.value < magicNumber.eight) &&
				(controlNotEmpty(ReqTenureLimitTextBox?.value)) &&
				 TenureLimitTypeRadio?.value == TenureLimitTypes.Hours) {
				ReqTenureLimitTextBox?.setErrors({ error: true, message: 'ReqTenureLimitGreaterThanEqual8hours' });
				return (valueComingFromRadio)
					? null
					:({ error: true, message: 'ReqTenureLimitGreaterThanEqual8hours' });
			} else if ((ReqTenureLimitTextBox?.value < magicNumber.one) &&
			(controlNotEmpty(ReqTenureLimitTextBox?.value)) &&
				TenureLimitTypeRadio?.value == TenureLimitTypes['Length of Assignment']) {
			 ReqTenureLimitTextBox?.setErrors({ error: true, message: 'ReqTenureLimitGreaterThanEqual1month' });
			 return (valueComingFromRadio)
			 ? null
			 : ({ error: true, message: 'ReqTenureLimitGreaterThanEqual1month' });
		 }
			else {
				clearErrorOnRadioChange(valueComingFromRadio, ReqTenureLimitTextBox);
				return null;
			}
		}
		return null;
	};
}

function clearErrorOnRadioChange(valueComingFromRadio:boolean, ReqTenureLimitTextBox: AbstractControl<any, any> | null | undefined): void {
	if(valueComingFromRadio) {
		ReqTenureLimitTextBox?.setErrors(null);
		ReqTenureLimitTextBox?.updateValueAndValidity();
	}
}

function controlNotEmpty(controlValue: number|string): boolean {
	return (controlValue !== null && controlValue !== '');
}

function ClpAlwaysGreater(CLPValue: number, dependentValue: number): boolean {
	return (CLPValue < dependentValue && dependentValue > magicNumber.zero);
}

function ClpTenureLimitValidations(ClpTxtbox:boolean = false): ValidatorFn {
	return (control: AbstractControl) => {
		const ReqTenureLimitTextBox = control?.parent?.get('ReqTenureLimit'),
			ExtTenureLimitTextBox = control?.parent?.get('ExtTenureLimit'),
			ClpTenureLimitTextBox = control?.parent?.get('ClpTenureLimit');

		if (ClpTenureLimitTextBox !== null) {
			if ((controlNotEmpty(ReqTenureLimitTextBox?.value) && (controlNotEmpty(ClpTenureLimitTextBox?.value))) &&
				ClpAlwaysGreater(ClpTenureLimitTextBox?.value, ReqTenureLimitTextBox?.value)) {
				ClpTenureLimitTextBox?.setErrors({ error: true, message: 'CLPTenureLimitShouldBeGreaterThanRequisitionTenureLimit' });
				return ClpTxtbox
					? { error: true, message: 'CLPTenureLimitShouldBeGreaterThanRequisitionTenureLimit' }
					: null;
			}
			else if((controlNotEmpty(ExtTenureLimitTextBox?.value) && (controlNotEmpty(ClpTenureLimitTextBox?.value))) &&
				ClpAlwaysGreater(ClpTenureLimitTextBox?.value, ExtTenureLimitTextBox?.value)) {
				ClpTenureLimitTextBox?.setErrors({ error: true, message: 'CLPTenureLimitShouldBeGreaterThanExtensionTenureLimit' });
				return ClpTxtbox
					? { error: true, message: 'CLPTenureLimitShouldBeGreaterThanExtensionTenureLimit' }
					: null;
			}
			else if((controlNotEmpty(ReqTenureLimitTextBox?.value) && (controlNotEmpty(ClpTenureLimitTextBox?.value))) &&
			!ClpAlwaysGreater(ClpTenureLimitTextBox?.value, ReqTenureLimitTextBox?.value)){
				ClpTenureLimitTextBox?.setErrors(null);
			}
			else if((controlNotEmpty(ExtTenureLimitTextBox?.value) && (controlNotEmpty(ClpTenureLimitTextBox?.value))) &&
			!ClpAlwaysGreater(ClpTenureLimitTextBox?.value, ExtTenureLimitTextBox?.value)) {
				ClpTenureLimitTextBox?.setErrors(null);
			}
		}
		return null;
	};
}

