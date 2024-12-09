import { ToJson } from './responseTypes/to-json.model';
type nullableString = string | undefined | null;
type nullableDate = Date | undefined | null;
type nullableNumber = number | undefined | null;

export class BusinessClassification extends ToJson {

	Id: nullableNumber;
	UKey: nullableString;
	Name: nullableString;
	Code: nullableString;
	CreatedBy: nullableNumber;
	CreatedOn: nullableDate;
	LastModifiedBy: nullableString;
	LastModifiedOn: nullableDate;
	ReasonForChange: nullableString;
	Disabled :boolean;

	constructor(init?: Partial<BusinessClassification>) {
		super();
		Object.assign(this, init);
	}
}

