export interface CopyExpensePayload {
    fromSectorId: string;
    expenseIdsToBeCopied: string[];
    toSectorId: string;
}
