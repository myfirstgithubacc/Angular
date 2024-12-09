/* eslint-disable no-magic-numbers */
// eslint-disable-next-line no-shadow
export const enum TimeEntryStatus
{
    Draft = 193,
    Declined = 194,
    Submitted = 195,
    ReSubmitted = 196,
    PartiallyApproved = 197,
    Approved = 198,
    Posted = 199,
    Invoiced = 200,
    PartiallyInvoiced = 201,
    Paid = 202,
    PartiallyPaid = 203
}

export enum ScreenId
{
    SelectionPopUp = 0,
    View, timeAdjustmentView = 1,
    AddEdit = 2,
    Review, timeAdjustmentReview = 3,
}
