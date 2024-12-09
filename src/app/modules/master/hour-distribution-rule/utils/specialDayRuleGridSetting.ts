import { Days } from "@xrm-shared/services/common-constants/static-data.enum";
import { ConditionParameters } from "../hdr-enum-constants/enum-constants";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { DropdownModel } from "@xrm-shared/models/common.model";

export function getSpecialRuleDefaultPrefilledData() {
	return [
		{ Id: magicNumber.zero, WeekDayId: Days.Monday, StOperator: ConditionParameters.LessThanOrEqual, StValue: magicNumber.twentyFour,
	 OtOperator: ConditionParameters.Equal, OtValue: magicNumber.zero,
	  DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero, ApplicableOnTypeId: '144', ApplicableOnOperator: ConditionParameters.Equal, ApplicableOnValue: magicNumber.zero }
	];
}

export function getSpecialRuleIn4By40PrefilledData() {
	return [
		{ Id: magicNumber.zero, WeekDayId: Days.Monday, StOperator: ConditionParameters.LessThanOrEqual, StValue: magicNumber.eight, OtOperator: ConditionParameters.GreaterThan, OtValue: magicNumber.eight, DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero, ApplicableOnTypeId: '144', ApplicableOnOperator: ConditionParameters.LessThan, ApplicableOnValue: magicNumber.ten },
		{ Id: magicNumber.zero, WeekDayId: Days.Tuesday, StOperator: ConditionParameters.LessThanOrEqual, StValue: magicNumber.eight, OtOperator: ConditionParameters.GreaterThan, OtValue: magicNumber.eight, DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero, ApplicableOnTypeId: '144', ApplicableOnOperator: ConditionParameters.LessThan, ApplicableOnValue: magicNumber.ten },
		{ Id: magicNumber.zero, WeekDayId: Days.Wednesday, StOperator: ConditionParameters.LessThanOrEqual, StValue: magicNumber.eight, OtOperator: ConditionParameters.GreaterThan, OtValue: magicNumber.eight, DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero, ApplicableOnTypeId: '144', ApplicableOnOperator: ConditionParameters.LessThan, ApplicableOnValue: magicNumber.ten },
		{ Id: magicNumber.zero, WeekDayId: Days.Thursday, StOperator: ConditionParameters.LessThanOrEqual, StValue: magicNumber.eight, OtOperator: ConditionParameters.GreaterThan, OtValue: magicNumber.eight, DtOperator: ConditionParameters.Equal, DtValue: magicNumber.zero, ApplicableOnTypeId: '144', ApplicableOnOperator: ConditionParameters.LessThan, ApplicableOnValue: magicNumber.ten }
	];
}

// eslint-disable-next-line max-lines-per-function
export function getSpecialRuleColumns(
	{dynamicRequiredValidator, addValidationForDecimal, ValidationsForHoursPerDay }: any,
	 customValidators: CustomValidators
) {
	return [
		{
			columnWidth: '140px',
			columnName: 'Day',
			asterik: true,
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'WeekDayId',
					defaultValue: [{Text: '', Value: ''}] as DropdownModel[],
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					requiredMsg: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					isValuePrimitiveAllowed: true,
					validators: [dynamicRequiredValidator('PleaseSelectData', 'Day')]
				}
			]
		},
		{
			columnWidth: '180px',
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
					validators: [dynamicRequiredValidator('PleaseEnterData', 'StValue'), addValidationForDecimal(), ValidationsForHoursPerDay()]
				}
			]
		},
		{
			columnWidth: '180px',
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
			columnWidth: '180px',
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

			columnName: 'ApplicableOn',
			columnWidth: '360px',
			childColumn: [{ name: 'Condition Parameters', isAstrik: true, childWidth: '200px' }, { name: 'Operator', isAstrik: true }, { name: 'Value', isAstrik: true }],
			asterik: false,
			controls: [
				{
					controlType: 'dropdown',
					controlId: 'ApplicableOnTypeId',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					isValuePrimitiveAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseSelectData', 'ApplicableOnType')]
				},
				{
					controlType: 'dropdown',
					controlId: 'ApplicableOnOperator',
					defaultValue: '',
					isEditMode: true,
					isDisable: false,
					placeholder: '',
					isSpecialCharacterAllowed: true,
					specialCharactersAllowed: true,
					specialCharactersNotAllowed: true,
					isValuePrimitiveAllowed: true,
					requiredMsg: 'ReqFieldValidationMessage',
					validators: [dynamicRequiredValidator('PleaseSelectData', 'ApplicableOnOperator')]
				},
				{
					controlType: 'number',
					controlId: 'ApplicableOnValue',
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
					validators: [
						dynamicRequiredValidator('PleaseEnterData', 'ApplicableOnValue'), customValidators.DecimalValidator(magicNumber.two, 'PleaseEnterNumericValuesUpto2Decimal'),
						customValidators.RangeValidator(magicNumber.zero, magicNumber.oneHundredSixtyEightDotZeroZero, 'YouCanEnterValueBetween', [{ Value: '0', IsLocalizeKey: false }, { Value: '168', IsLocalizeKey: false }])
					]
				}
			]
		}
	];
}

export function getSpecialRuleColumnConfigs() {
	return {
		isShowfirstColumn: false,
		isShowLastColumn: true,
		changeStatus: false,
		uKey: false,
		Id: true,
		firstColumnName: '',
		secondColumnName: 'AddMore',
		deleteButtonName: 'Delete',
		noOfRows: magicNumber.zero,
		itemSr: false,
		isAddMoreValidation: true,
		widgetId: 'SpecialRuleDay',
		isAddMoreClicked: true
	};
}
