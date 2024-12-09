import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { WeekDayRule } from "./hour-distribution-rule-WeekDayRule.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { PreDefinedSchedules } from "@xrm-shared/services/common-constants/static-data.enum";

export class HourDistributionRuleAddEdit extends ToJson {
	Id: number;
	RuleCode: string;
	UKey?: string;
	RuleName: string;
	Disabled: boolean;
	RuleDescription: string | undefined | null;
	ManualOtDtEntry: boolean;
	PreDefinedWorkScheduleId: number;
	PreDefinedWorkScheduleName: string;
	PreDefinedWorkSchedule: number;
	WeekDayRule: WeekDayRule[];
	Week1Rule: WeekDayRule[];
	Week2Rule: WeekDayRule[];
	AdditionalRule: boolean;
	AdditionalRules: WeekDayRule[];
	SpecialDayRule: boolean;
	SpecialDayRules: WeekDayRule[];
	RegularStHoursPerWeek: number | null;
	MaxStHourAllowed: number | null;
	MaxOtHourAllowed: number | null;
	MaxDtHourAllowed: number | null;
	MaxTotalHourAllowed: number;

	constructor(init: any) {
		super();
		if ("OtCalculation" in init)
			delete init.OtCalculation;
		if (init?.PreDefinedWorkScheduleId?.Value != undefined || init?.PreDefinedWorkScheduleId?.Value != null)
			init.PreDefinedWorkScheduleId = parseInt(init.PreDefinedWorkScheduleId.Value);
		this.setBasicRuleData(init as HourDistributionRuleAddEdit);

		Object.assign(this, init);
	}

	setBasicRuleData(data: HourDistributionRuleAddEdit) {
		data.RegularStHoursPerWeek = data.RegularStHoursPerWeek ?? magicNumber.forty;
		data.MaxStHourAllowed = data.MaxStHourAllowed ?? magicNumber.forty;
		if (data.PreDefinedWorkScheduleId == PreDefinedSchedules.None) {
			data.MaxOtHourAllowed = data.MaxOtHourAllowed ?? magicNumber.oneHundredSixtyEight;
			data.MaxDtHourAllowed = data.MaxDtHourAllowed ?? magicNumber.oneHundredSixtyEight;
		} else {
			data.MaxOtHourAllowed = data.MaxOtHourAllowed ?? magicNumber.thirtyTwo;
			data.MaxDtHourAllowed = data.MaxDtHourAllowed ?? magicNumber.ninetySix;
		}
	}
}
