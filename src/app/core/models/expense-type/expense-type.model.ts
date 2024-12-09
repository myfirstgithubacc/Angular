import { ToJson } from "../responseTypes/to-json.model";

type nullableString = string | undefined | null;
export class ExpenseTypeList extends ToJson{
	UKey: string;
	SectorId: nullableString;
	Description: nullableString;
	SectorName: nullableString;
	ExpenseCode: nullableString;
	ExpenseTypeCode: nullableString;
	Disabled: boolean;
	CreatedBy: nullableString;
	CreatedOn: nullableString;
	LastModifiedBy: nullableString;
	LastModifiedOn: nullableString;
	ExpenseTypeName: nullableString;
	AvailableToClp: nullableString;
	IsMspFeeAdded: nullableString;
	ReasonForChange: string;
	NatureExpense:nullableString;
	constructor(init?: Partial<ExpenseTypeList>) {
		super();
		Object.assign(this, init);
	}
}
