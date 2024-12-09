import { ExpenseEntryDetailGrid } from "@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-grid";

export interface AssignmentDetail {
    AssignmentID: string;
    Contractor: string;
    WeekendingDate: string;
    Reason: string;
    [Key:string]:string;
}
export type DynamicExpenseEntryDetails = Record<string, ExpenseEntryDetailGrid[] | null>;
