import { AbstractControl, ValidatorFn } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

// eslint-disable-next-line max-lines-per-function
export function IsXrmTimeClockRequiredValidations(customValidators: CustomValidators): ValidatorFn {
	// eslint-disable-next-line max-lines-per-function
	return (control: AbstractControl | undefined) => {
		const IsXrmTimeClockRequiredSwitch = control?.value,
			ClockBufferForReportingDateTimePicker = control?.parent?.get('ClockBufferForReportingDate'),
			ClockBufferForShiftStartTimePicker = control?.parent?.get('ClockBufferForShiftStart'),
			IsAutoLunchDeductionSwitch = control?.parent?.get('IsAutoLunchDeduction'),
			MinimumHourWorkedBeforeLunchDeductionTextBox = control?.parent?.get('MinimumHourWorkedBeforeLunchDeduction'),
			LunchTimeDeductedTextBox = control?.parent?.get('LunchTimeDeducted'),
			IsPunchRoundingNeededSwitch = control?.parent?.get('IsPunchRoundingNeeded'),
			PunchInTimeIncrementRoundingTextBox = control?.parent?.get('PunchInTimeIncrementRounding'),
			PunchOutTimeIncrementRoundingTextBox = control?.parent?.get('PunchOutTimeIncrementRounding'),
			PunchInTimeRoundingTextBox = control?.parent?.get('PunchInTimeRounding'),
			PunchOutTimeRoundingTextBox = control?.parent?.get('PunchOutTimeRounding'),
			EffectiveDateForLunchConfigurationDate = control?.parent?.get('EffectiveDateForLunchConfiguration');

		if(ClockBufferForReportingDateTimePicker !== null) {
			// Parent Control
			if(IsXrmTimeClockRequiredSwitch) {
				ClockBufferForReportingDateTimePicker?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ClockBufferForReportingDate')]);
				ClockBufferForShiftStartTimePicker?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ClockBufferForShiftStart')]);
				IsAutoLunchDeductionSwitch?.addValidators(IsAutoLunchDeductionValidations(customValidators));
				IsPunchRoundingNeededSwitch?.addValidators(IsPunchRoundingNeededValidations(customValidators));
			} else {
				ClockBufferForReportingDateTimePicker?.clearValidators();
				ClockBufferForShiftStartTimePicker?.clearValidators();

				IsAutoLunchDeductionSwitch?.clearValidators();
				MinimumHourWorkedBeforeLunchDeductionTextBox?.clearValidators();
				LunchTimeDeductedTextBox?.clearValidators();
				EffectiveDateForLunchConfigurationDate?.clearValidators();

				IsPunchRoundingNeededSwitch?.clearValidators();
				PunchInTimeIncrementRoundingTextBox?.clearValidators();
				PunchInTimeIncrementRoundingTextBox?.reset({ Value: '63' }, { emitEvent: false });

				PunchOutTimeIncrementRoundingTextBox?.clearValidators();
				PunchOutTimeIncrementRoundingTextBox?.reset({ Value: '63' }, { emitEvent: false });

				PunchInTimeRoundingTextBox?.clearValidators();
				PunchInTimeRoundingTextBox?.reset({ Value: '40' }, { emitEvent: false });

				PunchOutTimeRoundingTextBox?.clearValidators();
				PunchOutTimeRoundingTextBox?.reset({ Value: '40' }, { emitEvent: false });
			}
			ClockBufferForReportingDateTimePicker?.updateValueAndValidity();
			ClockBufferForShiftStartTimePicker?.updateValueAndValidity();

			IsAutoLunchDeductionSwitch?.updateValueAndValidity();
			MinimumHourWorkedBeforeLunchDeductionTextBox?.updateValueAndValidity();
			LunchTimeDeductedTextBox?.updateValueAndValidity();
			EffectiveDateForLunchConfigurationDate?.updateValueAndValidity();

			IsPunchRoundingNeededSwitch?.updateValueAndValidity();
			PunchInTimeIncrementRoundingTextBox?.updateValueAndValidity();
			PunchOutTimeIncrementRoundingTextBox?.updateValueAndValidity();
			PunchInTimeRoundingTextBox?.updateValueAndValidity();
			PunchOutTimeRoundingTextBox?.updateValueAndValidity();
		}
		return null;
	};
}

export function IsAutoLunchDeductionValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const IsAutoLunchDeductionSwitch = control?.parent?.get('IsAutoLunchDeduction'),
			MinimumHourWorkedBeforeLunchDeductionTextBox = control?.parent?.get('MinimumHourWorkedBeforeLunchDeduction'),
			LunchTimeDeductedTextBox = control?.parent?.get('LunchTimeDeducted');

		if(IsAutoLunchDeductionSwitch !== null) {
			if(IsAutoLunchDeductionSwitch?.value) {
				MinimumHourWorkedBeforeLunchDeductionTextBox?.addValidators([
					customValidators.requiredValidationsWithMessage('PleaseEnterData', 'MinimumHourWorkedBeforeLunchDeduction'),
					customValidators.DecimalValidator(magicNumber.one, 'PleaseEnterNumericValuesUpto1Decimal'),
					customValidators.RangeValidator(
						0.1, 24.0, 'FieldSpecificYouCanEnterValueBetween',
						[{ Value: 'MinimumHourWorkedBeforeLunchDeduction', IsLocalizeKey: true }, { Value: ".1", IsLocalizeKey: false }, { Value: "24.0", IsLocalizeKey: false }]
					),
					LunchTimeToBeDeducted()
				]);
				LunchTimeDeductedTextBox?.addValidators([
					customValidators.requiredValidationsWithMessage('PleaseEnterData', 'LunchTimeDeducted'),
					LunchTimeToBeDeducted(true)
				]);
			} else {
				MinimumHourWorkedBeforeLunchDeductionTextBox?.clearValidators();
				LunchTimeDeductedTextBox?.clearValidators();
			}
			MinimumHourWorkedBeforeLunchDeductionTextBox?.updateValueAndValidity({ emitEvent: false, onlySelf: true });
			LunchTimeDeductedTextBox?.updateValueAndValidity({ emitEvent: false, onlySelf: true });
		}
		return null;
	};
}

function LunchTimeToBeDeducted(LunchDeductedTextBox:boolean = false): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const MinimumHourWorkedBeforeLunchDeductionTextBox = control?.parent?.get('MinimumHourWorkedBeforeLunchDeduction'),
			LunchTimeDeductedTextBox = control?.parent?.get('LunchTimeDeducted');
		if(MinimumHourWorkedBeforeLunchDeductionTextBox !== null) {
			if(MinimumHourWorkedBeforeLunchDeductionTextBox?.value === magicNumber.zero) {
				MinimumHourWorkedBeforeLunchDeductionTextBox?.setErrors({ error: true, message: 'MinimumHoursWorkedCannotBeZero' });
				return (LunchDeductedTextBox)
					? null
					: { error: true, message: 'MinimumHoursWorkedCannotBeZero' };
			} else if (LunchTimeDeductedTextBox?.value === magicNumber.zero) {
				return LunchDeductionTextBoxErrorMessage(LunchDeductedTextBox, 'LunchTimeDeductedCannotBeZero');
			} else if ((MinimumHourWorkedBeforeLunchDeductionTextBox?.value * magicNumber.sixty) < LunchTimeDeductedTextBox?.value) {
				LunchTimeDeductedTextBox?.setErrors({ error: true, message: 'LunchTimeCannotBeGreaterThanMinimumHours' });
				return LunchDeductionTextBoxErrorMessage(LunchDeductedTextBox, 'LunchTimeCannotBeGreaterThanMinimumHours');
			} else {
				if(!LunchDeductedTextBox) {
					LunchTimeDeductedTextBox?.setErrors(null);
					LunchTimeDeductedTextBox?.updateValueAndValidity();
				}
				return null;
			}
		}
		return null;
	};
}

function LunchDeductionTextBoxErrorMessage(LunchDeductedTextBox:boolean, errMsg:string) {
	return (LunchDeductedTextBox)
		?	null
		: { error: true, message: errMsg };
}

function IsPunchRoundingNeededValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const IsPunchRoundingNeededSwitch = control?.parent?.get('IsPunchRoundingNeeded'),
			PunchInTimeIncrementRoundingTextBox = control?.parent?.get('PunchInTimeIncrementRounding'),
			PunchOutTimeIncrementRoundingTextBox = control?.parent?.get('PunchOutTimeIncrementRounding'),
			PunchInTimeRoundingTextBox = control?.parent?.get('PunchInTimeRounding'),
			PunchOutTimeRoundingTextBox = control?.parent?.get('PunchOutTimeRounding');

		if(IsPunchRoundingNeededSwitch !== null) {
			if(IsPunchRoundingNeededSwitch) {
				PunchInTimeIncrementRoundingTextBox?.setValue({ Value: '63' });
				PunchInTimeIncrementRoundingTextBox?.addValidators(customValidators.requiredValidationsWithMessage('PleaseEnterData', 'PunchInTimeIncrementRounding'));

				PunchOutTimeIncrementRoundingTextBox?.setValue({ Value: '63' });
				PunchOutTimeIncrementRoundingTextBox?.addValidators(customValidators.requiredValidationsWithMessage('PleaseEnterData', 'PunchOutTimeIncrementRounding'));
				// Forward
				PunchInTimeRoundingTextBox?.setValue({ Value: '40' });
				PunchInTimeRoundingTextBox?.addValidators(customValidators.requiredValidationsWithMessage('PleaseEnterData', 'PunchInTimeRounding'));

				PunchOutTimeRoundingTextBox?.setValue({ Value: '40' });
				PunchOutTimeRoundingTextBox?.addValidators(customValidators.requiredValidationsWithMessage('PleaseEnterData', 'PunchOutTimeRounding'));
			} else {
				PunchInTimeIncrementRoundingTextBox?.clearValidators();
				PunchInTimeIncrementRoundingTextBox?.reset({ Value: '63' }, { emitEvent: false });

				PunchOutTimeIncrementRoundingTextBox?.clearValidators();
				PunchOutTimeIncrementRoundingTextBox?.reset({ Value: '63' }, { emitEvent: false });

				PunchInTimeRoundingTextBox?.clearValidators();
				PunchInTimeRoundingTextBox?.reset({ Value: '40' }, { emitEvent: false });

				PunchOutTimeRoundingTextBox?.clearValidators();
				PunchOutTimeRoundingTextBox?.reset({ Value: '40' }, { emitEvent: false });
			}
			PunchInTimeIncrementRoundingTextBox?.updateValueAndValidity();
			PunchOutTimeIncrementRoundingTextBox?.updateValueAndValidity();
			PunchInTimeRoundingTextBox?.updateValueAndValidity();
			PunchOutTimeRoundingTextBox?.updateValueAndValidity();
		}
		return null;
	};
}
