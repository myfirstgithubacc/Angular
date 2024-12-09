import { AssignmentDetailsData } from "../expense-entry/add-edit/assignment-details";

export interface AssignmentDetailsForTandE {
    "IsCompleted": boolean,
    "IsCompletedSuccessfully": boolean,
    "IsFaulted": boolean,
    "IsCanceled": boolean,
    "Result": AssignmentDetailsData
}
