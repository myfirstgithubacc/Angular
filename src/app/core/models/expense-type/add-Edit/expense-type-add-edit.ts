import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { DropdownModel } from "@xrm-shared/models/common.model";
type nullableString = string | undefined | null;
export class ExpenseTypeAddEdit extends ToJson{
	RuleCode:string;
	Id : number;
	SectorName: nullableString;
	UKey: nullableString;
	ExpenseTypeName : string;
	ExpenseTypeCode : string;
	AvailableToClp : boolean;
	IsMspFeeAdded : boolean;
	NatureExpense : nullableString;
	NatureOfExpenseId : DropdownModel | number | null| undefined;
	SectorId : DropdownModel | null | undefined | number;
	Description : nullableString;
	Disabled:boolean;
	ExpenseCode : string;

	constructor(init: Partial<ExpenseTypeAddEdit>){
		super();

		if (init.SectorId && typeof init.SectorId === 'object' && 'Value' in init.SectorId)
			init.SectorId = parseInt(init.SectorId.Value);
		if(init.NatureOfExpenseId && typeof init.NatureOfExpenseId === 'object' && 'Value' in init.NatureOfExpenseId)
			init.NatureOfExpenseId = parseInt(init.NatureOfExpenseId.Value);
		Object.assign(this, init);
	}
}
