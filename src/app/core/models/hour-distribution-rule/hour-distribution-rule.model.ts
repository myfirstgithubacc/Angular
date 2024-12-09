import { ToJson } from '../responseTypes/to-json.model';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
type nullableBoolean = boolean | undefined | null;
export class HourDistributionRuleList extends ToJson {

	Id: nullableNumber;
	UKey: string;
	RuleCode: nullableString;
	RuleName: nullableString;
	PreDefinedWorkSchedule: nullableString;
	PreDefinedWorkScheduleId: nullableString;
	RegularSTHoursPerWeek: nullableNumber;
	MaxSTHoursAllowedPerWeek: nullableNumber;
	MaxOTHoursAllowedPerWeek: nullableNumber;
	MaxDTHoursAllowedPerWeek: nullableNumber;
	MaxWeekTotalAllowedPerWeek: nullableNumber;
	SpecialDayRuleRequired: nullableBoolean;
	AdditionalRuleRequired: nullableBoolean;
	Disabled: boolean;
	CreatedBy: nullableString;
	CreatedOn: Date | undefined | null;
	LastModifiedBy: nullableString;
	LastModifiedOn: Date | undefined | null;

	constructor(init?: Partial<HourDistributionRuleList>) {
		super();
		Object.assign(this, init);
	}

}
