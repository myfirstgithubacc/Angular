import { ToJson } from './responseTypes/to-json.model';
type nullableString = string | undefined | null;
type nullableDate = Date | undefined | null;
type nullableNumber = number | undefined | null;

export class WorkerClassification extends ToJson {
	Id: nullableNumber;
	UKey: nullableString;
	WorkerClassificationName: nullableString;
	IsAdditionalDetailsRequired: boolean;
	AdditionalDetailsLabel: nullableString;
	SectorId: nullableNumber;
	SectorName: nullableString;
	CreatedBy: nullableNumber;
	CreatedOn: nullableDate;
	LastModifiedBy: nullableString;
	LastModifiedOn: nullableDate;
	ReasonForChange: nullableString;
	Disabled :boolean;
	Code: nullableString;

	constructor(init?: Partial<WorkerClassification>) {
		super();
		Object.assign(this, init);
	}
}
export interface WorkerClassificationData {
  Disabled: boolean;
  RuleCode: nullableString;
  Id: nullableNumber;
}

