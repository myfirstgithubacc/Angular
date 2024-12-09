import { ToJson } from "../responseTypes/to-json.model";

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
type nullableBoolean = boolean | undefined | null;
export class RestMealBreakConfigurationList extends ToJson{

	Id: nullableNumber;
	UKey: string;
	RuleCode: nullableString;
	RuleDescription: nullableString;
	DefaultBreakDuration: nullableNumber;
	MealBreakPenalty: nullableBoolean;
	MealBreakPenaltyHours: nullableNumber;
	NumberOfMealBreakText: nullableString;
	RestBreakPenalty: nullableBoolean;
	RestBreakMinimumHours: nullableNumber;
	RestBreakPenaltyHours: nullableNumber;
	CreatedBy: nullableString;
	CreatedOn: Date | undefined | null;
	LastModifiedBy: nullableString;
	LastModifiedOn: Date | undefined | null;
	Disabled: nullableBoolean;
	RuleName: nullableString;
	AllowInOutTimeSheet: nullableBoolean;
	AllowInOutMealBreak: nullableBoolean;
	NumberOfMealBreak: nullableNumber;

	constructor(init?: Partial<RestMealBreakConfigurationList>) {
		super();
		Object.assign(this, init);
	}
}
