/* eslint-disable max-len */
import { WeekDayRule } from "@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-WeekDayRule.model";
import { CustomData } from "@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-customdays";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { ConditionParameters } from "../hdr-enum-constants/enum-constants";

export function showInvalidHours(row: WeekDayRule, add = magicNumber.zero, code = 'st', msg = '', rowWiseMsg = '') {
	if (code == 'ot') {
		add = row.OtValue == magicNumber.zero
			? magicNumber.zero
			: add;
		msg = `The hour distribution setup is invalid ${rowWiseMsg}. The ${(row.OtValue ?? magicNumber.zero - add).toFixed(magicNumber.two)}th hour of the day cannot be allocated to both Standard Time (ST) and Overtime (OT). Please adjust the hour distribution to ensure there are no overlapping conditions`;
	}
	if (code == 'dt') {
		add = row.DtValue == magicNumber.zero
			? magicNumber.zero
			: add;
		const overLapHours = row.StValue ?? magicNumber.zero - add;
		msg = `The hour distribution setup is invalid ${rowWiseMsg}. The ${(overLapHours).toFixed(magicNumber.two)}th hour of the day cannot be allocated to both Overtime (OT) and Double Time (DT). Please adjust the hour distribution to ensure there are no overlapping conditions`;
	}
	return msg;
}

export function showIncompleteHours(row: WeekDayRule, add = magicNumber.zero, code = 'st', msg = '', rowWiseMsg = '') {
	if (code == 'st') {
		add = row.StValue == magicNumber.zero
			? magicNumber.zero
			: add;
		msg = `The hour distribution setup is incomplete ${rowWiseMsg}. The first ${(row.StValue ?? magicNumber.zero - add).toFixed(magicNumber.two)} hours have been allocated to Standard Time (ST), but the remaining ${((row.MaxHoursAllowed ?? magicNumber.twentyFour) + add - (row.StValue ?? magicNumber.zero)).toFixed(magicNumber.two)} hours are not defined for any category (neither Overtime (OT) nor Double Time (DT)). Please ensure that the total hour distribution is fully allocated to ST, OT, or DT without any gaps.`;
	}
	if (code == 'ot') {
		add = row.OtValue == magicNumber.zero
			? magicNumber.zero
			: add;
		msg = `The hour distribution setup is incomplete ${rowWiseMsg}. The first ${(row.OtValue ?? magicNumber.zero - add).toFixed(magicNumber.two)} hours have been allocated to Overtime (OT), but the remaining ${((row.MaxHoursAllowed ?? magicNumber.twentyFour) + add - (row.OtValue ?? magicNumber.zero)).toFixed(magicNumber.two)} hours are not defined for any category (Double Time (DT)). Please ensure that the total hour distribution is fully allocated to ST, OT, or DT without any gaps.`;
	}
	if (code == 'dt') {
		add = row.DtValue == magicNumber.zero
			? magicNumber.zero
			: add;
		msg = `The hour distribution setup is incomplete ${rowWiseMsg}. The first ${(row.DtValue ?? magicNumber.zero - add).toFixed(magicNumber.two)} hours have been allocated to Double Time (DT), but the remaining ${((row.MaxHoursAllowed ?? magicNumber.twentyFour) + add - (row.DtValue ?? magicNumber.zero)).toFixed(magicNumber.two)} hours are not defined for any category (Double Time (DT)). Please ensure that the total hour distribution is fully allocated to ST, OT, or DT without any gaps.`;
	}
	return msg;
}

function operatorValidator(StOperator: string|number, OtOperator: string|number, type: number, e: CustomData) {
	if (type == Number(magicNumber.one) && StOperator == magicNumber.three) {
		StOperator = e.data.value.StOperator;
	}
	if (StOperator == magicNumber.one && OtOperator == magicNumber.two) {
		return false;
	}
	if (StOperator == magicNumber.one && OtOperator == magicNumber.four) {
		return false;
	}
	if (StOperator == magicNumber.five && OtOperator == magicNumber.two) {
		return false;
	}
	if (StOperator == magicNumber.five && OtOperator == magicNumber.four) {
		return false;
	}
	return true;
}

export function checkInvalidOperator(e: CustomData) {
	if (e.data.value.OtOperator == magicNumber.three) {
		return validateForEqualOperator(e);
	} else if (isCheckInvalidOp(e)) {
		return true;
	} else {
		return false;
	}
}

function isCheckInvalidOp(e: CustomData) {
	return (e.data.value.StOperator == magicNumber.one && e.data.value.OtOperator == magicNumber.two) || (e.data.value.StOperator == magicNumber.one && e.data.value.OtOperator == magicNumber.four)
	|| (e.data.value.StOperator == magicNumber.five && e.data.value.OtOperator == magicNumber.two) || (e.data.value.StOperator == magicNumber.five && e.data.value.OtOperator == magicNumber.four)
	|| (e.data.value.OtOperator == magicNumber.one && e.data.value.DtOperator == magicNumber.two) || (e.data.value.OtOperator == magicNumber.one && e.data.value.DtOperator == magicNumber.four)
	|| (e.data.value.OtOperator == magicNumber.five && e.data.value.DtOperator == magicNumber.two) || (e.data.value.OtOperator == magicNumber.five && e.data.value.DtOperator == magicNumber.four);
}

function validateForEqualOperator(e: CustomData) {
	if (isValidForEqualOp(e)) {
		return true;
	} else {
		return false;
	}
}

function isValidForEqualOp(e: CustomData) {
	return (e.data.value.StOperator == ConditionParameters.GreaterThan && e.data.value.OtOperator == ConditionParameters.LessThan) || (e.data.value.StOperator == ConditionParameters.GreaterThan && e.data.value.OtOperator == ConditionParameters.LessThanOrEqual)
	|| (e.data.value.StOperator == ConditionParameters.GreaterThanOrEqual && e.data.value.OtOperator == ConditionParameters.LessThan) || (e.data.value.StOperator == ConditionParameters.GreaterThanOrEqual && e.data.value.OtOperator == ConditionParameters.LessThanOrEqual)
	|| (e.data.value.StOperator == ConditionParameters.GreaterThan && e.data.value.OtOperator == ConditionParameters.Equal && e.data.value.DtOperator == ConditionParameters.LessThan) || (e.data.value.OtOperator == Number(ConditionParameters.GreaterThan) && e.data.value.OtOperator == ConditionParameters.Equal && e.data.value.DtOperator == ConditionParameters.LessThanOrEqual)
	|| (e.data.value.StOperator == ConditionParameters.GreaterThanOrEqual && e.data.value.OtOperator == ConditionParameters.Equal && e.data.value.DtOperator == ConditionParameters.LessThan) || (e.data.value.OtOperator == Number(ConditionParameters.GreaterThanOrEqual) && e.data.value.OtOperator == ConditionParameters.Equal && e.data.value.DtOperator == ConditionParameters.LessThanOrEqual);
}

function otAndDtValidator(
	StOperator: string|number, OtOperator: string|number, stValue: number, otValue: number,
	 maxValue: number, type: number, e: CustomData
) {
	if (type == Number(magicNumber.one) && StOperator == magicNumber.three) {
		StOperator = e.data.value.StOperator;
		stValue = e.data.value.StValue ?? magicNumber.zero;
	}
	if (StOperator == magicNumber.one) {
		return firstOperatorValidation(OtOperator, stValue, otValue, maxValue);
	} else if (StOperator == magicNumber.two) {
		return secondOperatorValidation(OtOperator, stValue, otValue, maxValue);
	} else if (StOperator == magicNumber.three) {
		return thirdOperatorValidation(OtOperator, otValue, maxValue);
	} else if (StOperator == magicNumber.four) {
		if (OtOperator == magicNumber.two) {
			return ((otValue <= (maxValue + magicNumber.zeroDotZeroOne)) && (otValue > (stValue + magicNumber.zeroDotZeroOne)));
		} else if (OtOperator == magicNumber.one) {
			return ((otValue == stValue) && (otValue <= (maxValue - magicNumber.zeroDotZeroOne)));
		} else if (OtOperator == magicNumber.three) {
			return otValue == Number(magicNumber.zero);
		} else if (OtOperator == magicNumber.five) {
			return ((otValue == (stValue + magicNumber.zeroDotZeroOne)) && (otValue <= maxValue));
		} else if (OtOperator == magicNumber.four) {
			return ((otValue > stValue) && (otValue <= maxValue));
		}
	} else if (StOperator == magicNumber.five) {
		if (OtOperator == magicNumber.one) {
			return ((otValue > stValue) && (otValue <= (maxValue - magicNumber.zeroDotZeroOne)));
		} else if (OtOperator == magicNumber.two) {
			return false;
		} else if (OtOperator == magicNumber.three) {
			return otValue == Number(magicNumber.zero);
		} else if (OtOperator == magicNumber.four) {
			return false;
		} else if (OtOperator == magicNumber.five) {
			return ((otValue > stValue) && (otValue <= maxValue));
		}
	}
	return true;
}

function firstOperatorValidation(OtOperator: string|number, stValue: number, otValue: number, maxValue: number) {
	if (OtOperator == magicNumber.one) {
		return ((otValue > stValue) && (otValue <= (maxValue - magicNumber.zeroDotZeroOne)));
	} else if (OtOperator == magicNumber.two) {
		return false;
	} else if (OtOperator == magicNumber.three) {
		return otValue == Number(magicNumber.zero);
	} else if (OtOperator == magicNumber.four) {
		return false;
	} else {
		return ((otValue > (stValue + magicNumber.zeroDotZeroOne)) && (otValue <= maxValue));
	}
}

function secondOperatorValidation(OtOperator: string|number, stValue: number, otValue: number, maxValue: number) {
	if (OtOperator == magicNumber.two) {
		return (otValue <= (maxValue + magicNumber.zeroDotZeroOne) && otValue > stValue);
	} else if (OtOperator == magicNumber.one) {
		return (((otValue == (stValue - magicNumber.zeroDotZeroOne) ||
		 (stValue == Number(magicNumber.zero) && otValue == Number(magicNumber.zero)))) && (otValue <= (maxValue - magicNumber.zeroDotZeroOne)));
	} else if (OtOperator == magicNumber.three) {
		return otValue == Number(magicNumber.zero);
	} else if (OtOperator == magicNumber.five) {
		return ((otValue == stValue) && (otValue <= maxValue));
	} else {
		return (otValue >= stValue) && (otValue <= maxValue);
	}
}

function thirdOperatorValidation(OtOperator: string|number, otValue: number, maxValue: number) {
	if (OtOperator == magicNumber.two) {
		return ((otValue <= (maxValue + magicNumber.zeroDotZeroOne) && otValue > Number(magicNumber.zero)));
	} else if (OtOperator == magicNumber.one) {
		return otValue == Number(magicNumber.zero);
	} else if (OtOperator == magicNumber.three) {
		return otValue == Number(magicNumber.zero);
	} else if (OtOperator == magicNumber.five) {
		return (otValue == Number(magicNumber.zero)
			? true
			: (otValue == Number(magicNumber.zeroDotZeroOne)));
	} else {
		return (otValue <= maxValue);
	}
}

function validateOtValueAndOtOperator(e: CustomData, fieldsType: string, stValue: number, otValue: number, dtValue: number, maxValue: number) {
	if (fieldsType == 'OtValue') {
		return otAndDtValidator(e.data.value.StOperator, e.data.value.OtOperator, stValue, otValue, maxValue, magicNumber.zero, e);
	}
	if (fieldsType == 'DtValue') {
		return otAndDtValidator(e.data.value.OtOperator, e.data.value.DtOperator, otValue, dtValue, maxValue, magicNumber.one, e);
	}
	if (fieldsType == 'OtOperator') {
		return operatorValidator(e.data.value.StOperator, e.data.value.OtOperator, magicNumber.zero, e);
	}
	if (fieldsType == 'DtOperator') {
		return operatorValidator(e.data.value.OtOperator, e.data.value.DtOperator, magicNumber.one, e);
	}
	return true;
}

export function checkValidationOnFields(e: CustomData, fieldsType: string) {
	const stValue = e.data.value.StValue
			? parseFloat(e.data.value.StValue.toString())
			: magicNumber.zero,
		otValue = e.data.value.OtValue
			? parseFloat(e.data.value.OtValue.toString())
			: magicNumber.zero,
		dtValue = e.data.value.DtValue
			? parseFloat(e.data.value.DtValue.toString())
			: magicNumber.zero,
		maxValue = e.data.value.MaxHoursAllowed
			? parseFloat(e.data.value.MaxHoursAllowed.toString())
			: magicNumber.twentyFour;
	if (fieldsType == 'StValue') {
		if (e.data.value.StOperator == magicNumber.two) {
			return ((stValue <= (maxValue + magicNumber.zeroDotZeroOne)) && stValue > Number(magicNumber.zero));
		} else if (e.data.value.StOperator == magicNumber.one) {
			return stValue == Number(magicNumber.zero);
		} else if (e.data.value.StOperator == magicNumber.three) {
			return stValue == Number(magicNumber.zero);
		} else if (e.data.value.StOperator == magicNumber.five) {
			return (stValue == Number(magicNumber.zero)
				? true
				: stValue == Number(magicNumber.zeroDotZeroOne));
		} else if (e.data.value.StOperator == magicNumber.four) {
			return stValue <= maxValue;
		}
	}
	return validateOtValueAndOtOperator(e, fieldsType, stValue, otValue, dtValue, maxValue);
}
