import { ValidatorFn } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export function getMealBreakPenaltyDefaultPrefilledData() {
	return [
		{ Id: magicNumber.zero, MealBreakTypeId: 181, MealBreakTypeText: null, MinimumHoursWorked: magicNumber.five,
			MandatoryBreak: magicNumber.thirty, RestrictWaiveOffHours: magicNumber.six },
		{ Id: magicNumber.zero, MealBreakTypeId: 182, MealBreakTypeText: null,
			MinimumHoursWorked: magicNumber.ten, MandatoryBreak: magicNumber.thirty, RestrictWaiveOffHours: magicNumber.tweleve },
		{ Id: magicNumber.zero, MealBreakTypeId: 183, MealBreakTypeText: null,
			MinimumHoursWorked: magicNumber.fifteen, MandatoryBreak: magicNumber.thirty, RestrictWaiveOffHours: magicNumber.eighteen }
	];
}

export function getMealBreakPenaltyHoursFirstColumnSettings() {
	return [
		{ asterik: false, label: 'FirstMealBreakIn', tooltipVisible: false, tooltipTitle: '' },
		{ asterik: false, label: 'SecondMealBreakIn', tooltipVisible: false, tooltipTitle: '' },
		{ asterik: false, label: 'ThirdMealBreakIn', tooltipVisible: false, tooltipTitle: '' }
	];
}

export function getMealBreakPenaltyHoursGridConfigSettings() {
	return {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		noOfRows: magicNumber.zero,
		itemSr: false,
		isVisibleAsterick: true,
		isAddMoreValidation: false,
		widgetId: 'MealBreakPenaltyHours'
	};
}

// eslint-disable-next-line max-lines-per-function
export function getMealBreakPenaltyHoursColumnControlType(customValidators: CustomValidators, timeRangeValidation:
	(fieldName: string, timeFormat: string, rangeData?: { min: number, max: number }) => ValidatorFn) {
	return [
		{
			columnWidth: '100px',
			columnName: 'Rule',
			asterik: false,
			controls: [
				{
					controlType: 'label',
					controlId: 'WeekDayName',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					requiredMsg: ''
				}
			]
		},
		{
			columnName: 'MinimumHoursWorked',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'MinimumHoursWorked',
					decimals: '2',
					format: 'n2',
					defaultValue: 24,
					isEditMode: true,
					isDisable: false,
					min: 0,
					placeholder: '',
					maxlength: 5,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: '',
					validators: [
						customValidators.requiredValidationsWithMessage('PleaseEnterData', 'MinimumHoursWorkedField'),
						 timeRangeValidation('MinimumHoursWorkedField', 'hours')
					]
				}
			]
		},
		{
			columnName: 'MandatoryBreak',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'MandatoryBreak',
					defaultValue: magicNumber.thirty,
					decimals: '0',
					format: '',
					isEditMode: true,
					isDisable: false,
					min: magicNumber.zero,
					placeholder: '',
					maxlength: magicNumber.four,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: '',
					validators: [
						customValidators.requiredValidationsWithMessage('PleaseEnterData', 'MandatoryBreakField'),
						 timeRangeValidation('MandatoryBreakField', 'MintuesInHours', { min: 1, max: 1440 })
					]
				}
			]
		},
		{
			columnName: 'RestrictWaiveOffHours',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'RestrictWaiveOffHours',
					decimals: '2',
					format: 'n2',
					defaultValue: magicNumber.twentyFour,
					isEditMode: true,
					isDisable: false,
					min: magicNumber.zero,
					placeholder: '',
					maxlength: magicNumber.five,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: '',
					validators: [
						customValidators.requiredValidationsWithMessage('PleaseEnterData', 'RestrictWaiveOffField'),
						timeRangeValidation('RestrictWaiveOffField', 'hours')
					]
				}
			]
		}
	];
}
