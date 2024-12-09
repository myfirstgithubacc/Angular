import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { ConditionParameters } from "../hdr-enum-constants/enum-constants";

export function getAdditionalRuleWithNonePrefilledData() {
	return [
		{
			 Id: magicNumber.zero, WeekDayId: 138, StOperator: ConditionParameters.Equal, StValue: magicNumber.zero,
			  OtOperator: ConditionParameters.Equal, OtValue: magicNumber.zero,
				 DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero
		},
		{
			 Id: magicNumber.zero, WeekDayId: 139, StOperator: ConditionParameters.Equal, StValue: magicNumber.zero,
			  OtOperator: ConditionParameters.Equal, OtValue: magicNumber.zero,
				 DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero
		}
	];
}

export function getAdditionalRuleWith9By80PrefilledData() {
	return [
		{
			 Id: magicNumber.zero, WeekDayId: 138, StOperator: ConditionParameters.Equal, StValue: magicNumber.zero,
			  OtOperator: ConditionParameters.LessThanOrEqual, OtValue: magicNumber.eight,
				 DtOperator: ConditionParameters.GreaterThan, DtValue: magicNumber.eight
		},
		{ Id: magicNumber.zero, WeekDayId: 139, StOperator: ConditionParameters.Equal, StValue: magicNumber.zero,
			 OtOperator: ConditionParameters.Equal, OtValue: magicNumber.zero,
			  DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero
		}
	];
}

export function getAdditionalRuleFirstColumnText() {
	return [
		{ asterik: false, label: '7DayConsecutive', tooltipVisible: true, tooltipTitle: '7th_Consecutive_Day_Tooltip' },
		{ asterik: false, label: 'Holiday', tooltipVisible: true, tooltipTitle: 'Holiday_Tooltip' }
	];
}

// eslint-disable-next-line max-lines-per-function
export function getAdditionalRuleColumns({dynamicRequiredValidator, addValidationForDecimal, ValidationsForHoursPerDay }: any) {
	return [
		{
			columnWidth: '160px',
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
			columnWidth: '260px',
			columnName: 'StraightTime',
			childColumn: [{ name: 'Operator', isAstrik: true }, { name: 'Value', isAstrik: true }],
			asterik: false,
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
					decimals: '2',
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
					maxlength: 5,
					isSpecialCharacterAllowed: false,
					specialCharactersAllowed: false,
					specialCharactersNotAllowed: false,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseEnterData', 'DtValue'), addValidationForDecimal(), ValidationsForHoursPerDay()]
				}
			]
		}
	];
}

export function getAdditionalRuleColumnConfigs() {
	return 		{
		isShowfirstColumn: false,
		isShowLastColumn: false,
		changeStatus: false,
		uKey: false,
		Id: true,
		noOfRows: magicNumber.zero,
		itemSr: false,
		isAddMoreValidation: false,
		widgetId: 'AdditionalRuleDay'
	};
}
