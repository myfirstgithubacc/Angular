import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { MealBreakPenaltyConfigGrid } from "./rest-meal-break-configuration-Grid";
import { DropdownModel } from "@xrm-shared/models/common.model";


type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;

export class RestMealBreakConfigurationAddEdit extends ToJson {
	Id: number;
	UKey: nullableString;
	RuleCode: string;
	RuleName: nullableString;
	AllowInOutTimeSheet: boolean;
	AllowInOutMealBreak: boolean;
	NumberOfMealBreak: DropdownModel | null | undefined | number;
	NumberOfMealBreakText: nullableString;
	RuleDescription: nullableString;
	DefaultBreakDuration: nullableNumber;
	MealBreakPenalty: boolean;
	MealBreakPenaltyHours: nullableNumber;
	RestBreakPenalty: boolean;
	RestBreakMinimumHours: nullableNumber;
	RestBreakPenaltyHours: nullableNumber;
	MealBreakPenaltyConfigurations: MealBreakPenaltyConfigGrid[];
	Disabled: boolean;

	constructor(init: Partial<RestMealBreakConfigurationAddEdit>) {
		super();
		if (init.NumberOfMealBreak && typeof init.NumberOfMealBreak === 'object' && 'Value' in init.NumberOfMealBreak)
			init.NumberOfMealBreak = parseInt(init.NumberOfMealBreak.Value);
		Object.assign(this, init);
	}
}
