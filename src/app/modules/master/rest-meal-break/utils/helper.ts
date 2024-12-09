import { MealBreakPenaltyConfigGrid } from "@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-configuration-Grid";
import { RestMealBreakConfigurationAddEdit } from "@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-configuration-add-edit";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function isArrayNullOrEmpty(arr: MealBreakPenaltyConfigGrid[], isMealBreakSwitch: boolean) {
	return isMealBreakSwitch || arr.length === Number(magicNumber.zero);
}

export function removeArrayOfJsonElements(arrayToBePop: MealBreakPenaltyConfigGrid[]): MealBreakPenaltyConfigGrid[] {
	arrayToBePop.forEach((obj: MealBreakPenaltyConfigGrid) => {
		obj.Id = magicNumber.zero;
	});
	return arrayToBePop.splice(magicNumber.zero, arrayToBePop.length);
}

export function clearDependentData(
	payload: RestMealBreakConfigurationAddEdit,
	 {AllowInOutTimeSheet, AllowInOutMealBreak, MealBreakPenalty, RestBreakPenalty}: RestMealBreakConfigurationAddEdit
) {
	if (!AllowInOutTimeSheet) {
		payload.DefaultBreakDuration = null;
		payload.AllowInOutMealBreak = false;
		nullNumberOfMealBreakAndMealBreakPenalty(payload);
		nullMealBreakPenaltyConfigAndHours(payload);
		payload.RestBreakPenalty = false;
		nullMealBreakMinimumHoursAndPenaltyHours(payload);
	}

	if (!AllowInOutMealBreak) {
		nullNumberOfMealBreakAndMealBreakPenalty(payload);
		nullMealBreakPenaltyConfigAndHours(payload);
		payload.RestBreakPenalty = false;
		nullMealBreakMinimumHoursAndPenaltyHours(payload);
	} else {
		payload.DefaultBreakDuration = null;
	}

	if (!MealBreakPenalty) {
		nullMealBreakPenaltyConfigAndHours(payload);
	}

	if (!RestBreakPenalty) {
		nullMealBreakMinimumHoursAndPenaltyHours(payload);
	}
}

function nullMealBreakMinimumHoursAndPenaltyHours(payload: RestMealBreakConfigurationAddEdit) {
	payload.RestBreakMinimumHours = null;
	payload.RestBreakPenaltyHours = null;
}

function nullMealBreakPenaltyConfigAndHours(payload: RestMealBreakConfigurationAddEdit) {
	payload.MealBreakPenaltyHours = null;
	payload.MealBreakPenaltyConfigurations = [];
}

function nullNumberOfMealBreakAndMealBreakPenalty(payload: RestMealBreakConfigurationAddEdit) {
	payload.MealBreakPenalty = false;
	payload.NumberOfMealBreak = null;
}
