import { DropdownModel } from '@xrm-shared/models/common.model';
import { ToJson } from '../responseTypes/to-json.model';

export type nullableDropDown = DropdownModel[] | undefined | null;
export class HourDistributionRuleDropDowns extends ToJson {
	PreDefinedSchedules: nullableDropDown;
	Days: nullableDropDown;
	ConditionParameters: nullableDropDown;
	ComparisonOperators: nullableDropDown;
	SpecialDays: nullableDropDown;

	constructor(init?: Partial<HourDistributionRuleDropDowns>) {
		super();
		Object.assign(this, init);
	}
}
