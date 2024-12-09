import { DropdownModel, IRadioGroupModel, IRadioWithExtras } from '@xrm-shared/models/common.model';
import { ToJson } from '../responseTypes/to-json.model';

type nullableDropDown = DropdownModel[] | undefined | null;
type nullableRadioGroup = IRadioWithExtras[] | undefined | null;
type nullableRadioGroupModel = IRadioGroupModel | undefined | null;
type nullableDropDownModel = DropdownModel | undefined | null;
export class SectorAllDropdowns extends ToJson {
	Countries: nullableDropDown;
	States: nullableDropDown;
	HomeLanguages: nullableDropDown;
	PasswordExpiryPeriods: nullableRadioGroup;
	WeekDays: nullableDropDown;
	Timezones: nullableDropDown;
	ShiftDifferentialMethods: nullableRadioGroup;
	CostEstimationTypes: nullableRadioGroup;
	MspFeeTypes: nullableRadioGroup;
	PricingModels: nullableRadioGroup;
	MarkUpTypes: nullableRadioGroupModel;
	BillRateValidations: nullableRadioGroupModel;
	OtRateTypes: nullableDropDownModel;
	PoTypes: nullableRadioGroup;
	NoConsecutiveWeekMissingEntrys: nullableDropDownModel;
	ExtUserGroups: nullableRadioGroupModel;
	TenureLimitTypes: nullableDropDownModel;
	QuestionToBeAnsweredBys: nullableDropDownModel;
	EvaluationRequirements: nullableDropDown;
	LengthOfAssignmentTypes: nullableDropDownModel;
	SurveyUsedInEntities: nullableDropDownModel;
	PoTypeSowIcs: nullableRadioGroup;
	PunchTimeRoundings: nullableDropDownModel;
	PunchTimeIncrementRoundings: nullableDropDownModel;
	XrmUseEmployeeTimeClocks: nullableDropDownModel;
	CopyExistingSector: nullableDropDownModel;
	[Key: string]: any;
	YesNo: nullableRadioGroupModel;

	constructor(init?: Partial<SectorAllDropdowns>) {
		super();
		Object.assign(this, init);
	}
}
