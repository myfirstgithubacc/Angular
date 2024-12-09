import { ExpenseEntryDetailGrid } from "@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid";
import { statusIds } from "../enum-constants/enum-constants";
import { FormControl, FormGroup } from "@angular/forms";
import { IDropdown } from "@xrm-shared/models/common.model";
type dropdownStringNullable = IDropdown | string | null;
export interface IAddEditExpenseFormModel {
	StatusId: FormControl<number>;
	totalBillAmount: FormControl<number | null>;
	AssignmentId: FormControl<number | null>;
	WeekendingDate: FormControl<dropdownStringNullable>;
	ExpenseEntryDetails: FormControl<ExpenseEntryDetailGrid[]>;
	ContractorComment: FormControl<string | null>;
	ReviewerComment: FormControl<[{
		ReviewedOnDate: string;
		ApproverLabel: string;
		ApproverComments: string;
	}] | null>;
}

export interface AddEditExpense {
	StatusId: number;
	totalBillAmount: number | null;
	AssignmentId: number | null;
	WeekendingDate: dropdownStringNullable;
	ExpenseEntryDetails: ExpenseEntryDetailGrid[];
	ContractorComment: string | null;
	ReviewerComment: [{
		ReviewedOnDate: string;
		ApproverLabel: string;
		ApproverComments: string;
	}] | null;
}

export function getAddEditExpenseEntryFormModel() {
	return new FormGroup<IAddEditExpenseFormModel>({
		'StatusId': new FormControl<number>(statusIds.Submitted, {nonNullable: true}),
		'totalBillAmount': new FormControl<number | null>(null),
		'AssignmentId': new FormControl<number | null>(null),
		'WeekendingDate': new FormControl<dropdownStringNullable>(null),
		'ExpenseEntryDetails': new FormControl<ExpenseEntryDetailGrid[]>([], {nonNullable: true}),
		'ContractorComment': new FormControl<string | null>(null),
		'ReviewerComment': new FormControl<[{
			ReviewedOnDate: string;
			ApproverLabel: string;
			ApproverComments: string;
		}] | null>(null)
	});
}
