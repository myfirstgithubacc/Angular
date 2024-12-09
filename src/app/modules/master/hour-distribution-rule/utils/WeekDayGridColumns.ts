import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

/* eslint-disable max-lines-per-function */
export function getWeekDayColumns({dynamicRequiredValidator, addValidationForDecimal, ValidationsForHoursPerDay }: any) {
	return [
		{
			columnWidth: '130px',
			columnName: 'WeekDayId',
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
			columnWidth: '260px',
			columnName: 'StraightTime',
			childColumn: [{ name: 'Operator', isAstrik: true }, { name: 'Value', isAstrik: true, childColumnWidth: '100px' }],
			asterik: false,
			tooltipVisible: true,
			tooltipTitile: 'ST_Tooltip',
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'StOperator',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					isValuePrimitiveAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseSelectData', 'StOperator')]
				},
				{
					controlType: 'number',
					controlId: 'StValue',
					decimals: magicNumber.two,
					format: 'n2',
					defaultValue: magicNumber.twentyFour,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					min: magicNumber.zero,
					maxlength: magicNumber.five,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseEnterData', 'StValue'), addValidationForDecimal(), ValidationsForHoursPerDay()]
				}
			]
		},
		{
			columnWidth: '260px',
			columnName: 'OverTime',
			childColumn: [{ name: 'Operator', isAstrik: true }, { name: 'Value', isAstrik: true }],
			asterik: false,
			tooltipVisible: true,
			tooltipTitile: 'OT_Tooltip',
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'OtOperator',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					isValuePrimitiveAllowed: true,
					specialCharactersNotAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseSelectData', 'OtOperator')]
				},
				{
					controlType: 'number',
					controlId: 'OtValue',
					decimals: '2',
					format: 'n2',
					defaultValue: magicNumber.zero,
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					min: magicNumber.zero,
					maxlength: magicNumber.five,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseEnterData', 'OtValue'), addValidationForDecimal(), ValidationsForHoursPerDay()]
				}
			]
		},
		{
			columnWidth: '260px',
			columnName: 'DoubleTime',
			childColumn: [{ name: 'Operator', isAstrik: true }, { name: 'Value', isAstrik: true }],
			asterik: false,
			tooltipVisible: true,
			tooltipTitile: 'DT_Tooltip',
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'DtOperator',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					isValuePrimitiveAllowed: true,
					specialCharactersNotAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseSelectData', 'DtOperator')]
				},
				{
					controlType: 'number',
					controlId: 'DtValue',
					decimals: '2',
					format: 'n2',
					defaultValue: magicNumber.zero,
					isEditMode: true,
					isDisable: false,
					min: magicNumber.zero,
					placeholder: '',
					maxlength: magicNumber.five,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseEnterData', 'DtValue'), addValidationForDecimal(), ValidationsForHoursPerDay()]
				}
			]
		},
		{
			columnWidth: '160px',
			columnName: 'Max Hours Allowed per Day',
			asterik: true,
			controls: [
				{
					controlType: 'number',
					controlId: 'MaxHoursAllowed',
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
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseEnterData', 'MaxHoursAllowed'), addValidationForDecimal(), ValidationsForHoursPerDay()]
				}
			]
		}
	];
}

export function getWeekDaysColumnConfigs() {
	return 		{
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		noOfRows: magicNumber.zero,
		itemSr: false,
		isVisibleAsterick: true,
		isAddMoreValidation: false,
		widgetId: 'WeekDayRule'
	};
}

export function getWeek2RuleColumnConfigs() {
	return {
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		noOfRows: magicNumber.zero,
		itemSr: false,
		isAddMoreValidation: false,
		widgetId: 'Week2Rule'
	};
}


