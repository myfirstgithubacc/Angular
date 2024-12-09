import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { ExpenseEntryDetailGrid } from "./expense-entry-grid";
import { AddEditExpense } from "src/app/modules/acrotrac/expense/expense/utils/formModel";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { DropdownModel } from "@xrm-shared/models/common.model";
type nullableString = string | undefined | null;

export class ExpenseEntryAddEdit extends ToJson {
	Id: number;
	ExpenseEntryCode: string;
	AssignmentId?: string | DropdownModel;
	WeekendingDate?: string | DropdownModel;
	StatusId: number;
	IsMSPFeeVisible: boolean;
	IsPendingApproval : boolean;
	ContractorComment: nullableString;
	ContractorName: string;
	StatusName: string;
	ReviewerComment: [{
		ReviewedOnDate: string;
		ApproverLabel: string;
		ApproverComments: string;
	}];
	ExpenseEntryDetails: ExpenseEntryDetailGrid[];
	DmsId: number;
	UKey: string;
	Screen?: string;
	AssignmentCode?: string;
	TotalAmount?: DynamicParam[];
	constructor(init?: Partial<AddEditExpense>) {
		super();
		if (typeof init?.WeekendingDate !== 'string' && init?.WeekendingDate?.Value) {
			init.WeekendingDate = init.WeekendingDate.Value;
		}
		if (init?.totalBillAmount !== undefined && init.totalBillAmount !== null) {
			init.totalBillAmount = parseFloat(parseFloat(init.totalBillAmount as unknown as string).toFixed(magicNumber.two));
		}

		Object.assign(this, init);
	}
}
