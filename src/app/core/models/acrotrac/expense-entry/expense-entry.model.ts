import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
type nullableBoolean = boolean | undefined | null;
type nullableDate = Date | undefined | null;
export class ExpenseEntryList extends ToJson{
	Id: nullableNumber;
	UKey: nullableString;
	ExpenseEntryCode: nullableString;
	AssignmentId: nullableString;
	ContractorId: nullableString;
	CurrencyCode: nullableString;
	SectorName: nullableString;
	ContractorName: nullableString;
	WeekendingDate: nullableDate;
	TotalBillAmount: nullableNumber;
	StatusId: nullableNumber;
	StatusName: nullableString;
	Status: nullableString;
	ContractorWorkLocation: nullableString;
	CreatedBy: nullableString;
	CreatedDate: nullableDate;
	LastModifiedBy: nullableString;
	LastModifiedDate: nullableDate;
	Disabled: nullableBoolean;
	constructor(init?: Partial<ExpenseEntryList>){
		super();
		Object.assign(this, init);
	}
}
