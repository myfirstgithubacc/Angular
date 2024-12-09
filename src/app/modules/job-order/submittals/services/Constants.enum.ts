import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export enum NavigationUrls {
    Add = 'xrm/job-order/submittals/add-edit',
    Edit = 'xrm/job-order/submittals/add-edit/',
    List = 'xrm/job-order/submittals/list',
    View = 'xrm/job-order/submittals/view/',
    Withdraw = 'xrm/job-order/submittals/withdraw/',
    Process = 'xrm/job-order/submittals/process/',
    MassCompare = 'xrm/job-order/submittals/mass-comparsion',
    SubmittalDetails = 'xrm/job-order/professional/submittal-details/',
    Review = 'xrm/job-order/submittals/review/',
    InterviewRequest = 'xrm/job-order/interview/add/'
}


export enum Status{
    Status = 'Status',
    Drafted = 'Draft',
    Withdrawn = 'Withdrawn',
    Submitted = 'Submitted',
    Processed = 'Processed',
    Forwarded = 'Forwarded',
    All = 'All',
    Broadcasted = 'Broadcasted',
    Open = 'Open',
    Declined = 'Declined',
    Received = 'Received',
    ViewByMSP = 'ViewByMSP',
    ReSubmitted = 'Resubmitted',
    ViewedByManager = 'ViewedByManager',
    PendingFinalOnboardApproval = 'PendingFinalOnboardApproval',
    PendingFinalOfferApproval = 'PendingFinalOfferApproval',
    SelectedOfferReview = 'SelectedOfferReview',
    SelectedOfferAccepted = 'SelectedOfferAccepted',
    Selected = 'Selected',
    Deferred = 'Deferred',
    SelectedStaffingAgencyConfirmed = 'SelectedStaffingAgencyConfirmed',
    Shortlisted = 'Shortlisted',
    OfferDeclined = 'OfferDeclined',
    OfferAccepted = 'OfferAccepted',
    StaffingAgencyOnboardCompeleted = 'StaffingAgencyOnboardCompeleted'
}

export enum CurrentPage{
    View = 'View',
    Draft = 'Draft',
    Withdraw = 'Withdraw',
    Submit = 'Submit',
    Process = 'Process',
    Edit = 'Edit',
    Add = 'Add',
    Review = 'Review'
}

export enum StatusId{
    Drafted = magicNumber.twoHundredTwenty,
    Submitted = magicNumber.twoHundredTwentyOne,
    ReSubmitted = magicNumber.twoHundredTwentyTwo,
    Withdrawn = magicNumber.twoHundredTwentyThree,
    ViewByMSP = magicNumber.twoHundredTwentyFour,
    Declined = magicNumber.twoHundredTwentyFive,
    Forwarded = magicNumber.twoHundredTwentySix,
    Accepted = magicNumber.twohundredTwentySeven,
    Shortlisted = magicNumber.twoHundredTwentyEight,
    Received = magicNumber.twofifty,
    ViewedByManager = magicNumber.twoHundredSixtyOne,
    PendingFinalOnboardApproval = magicNumber.zero,
    PendingFinalOfferApproval = magicNumber.twoHundredSixtySeven,
    SelectedOfferReview = magicNumber.twoHundredSixtySix,
    SelectedOfferAccepted = magicNumber.twoHundredSixtyFive,
    Selected = magicNumber.twoHundredSixtyFour,
    Deferred = magicNumber.twoHundredSixtyTwo,
    SelectedStaffingAgencyConfirmed = magicNumber.twohundredfortynine,
    OfferDeclined = magicNumber.twoHundredSixtyEight,
    OfferAccepted = magicNumber.twoHundredSixtyNine,
    StaffingAgencyOnboardCompeleted = magicNumber.twoHundredSeventy
}

export enum ValidationMessageKeys{
    MarkUpCannotExceedMarkUpNTE = 'MarkUpCannotExceedMarkUpNTE',
    BidRateCannotBeGreaterThanNTE = 'BidRateCannotBeGreaterThanNTE',
    ValueShouldBeBelowThousand = 'ValueShouldBeBelowThousand',
    PleaseEnterAllowedLengthOfUID = 'PleaseEnterAllowedLengthOfUID',
    PreviousWorkHistoryDetails = 'PreviousWorkHistoryDetails',
    PleaseEnterValidContactNumber = 'PleaseEnterValidContactNumber',
    PleaseEnterValidContactNumberExtension = 'PleaseEnterValidContactNumberExtension',
    PleaseEnterAValidEmailAddress = 'PleaseEnterAValidEmailAddress',
    SubCategoryForWorkerClassification = 'SubCategoryForWorkerClassification',
    CandidatesWorkerClassification = 'CandidatesWorkerClassification',
    WithdrawcommentbyStaffingAgency = 'WithdrawcommentbyStaffingAgency',
    UIDRequiredToDraftSubmittal = 'UIDRequiredToDraftSubmittal',
    FirstNameRequiredToDraftSubmittal = 'FirstNameRequiredToDraftSubmittal',
    LastNameRequiredToDraftSubmittal = 'LastNameRequiredToDraftSubmittal',
    BillRateCannotExceedNTE = 'BillRateCannotExceedNTE',
    UidValidation = 'Please enter allowed length',
    SomeErrorOccured = 'SomeErrorOccurred',
    DeclineReason = 'DeclineReason',
    DeclineComment = 'DeclineComment',
    WithdrawReason = 'WithdrawReason',
    WorkerClassification = 'WorkerClassification',
    RecipientEmail = 'RecipientEmail'
}

export enum ToastMessages{
    SubmittalHasBeenDraftSuccessfully = 'SubmittalHasBeenDraftSuccessfully',
    SubmittalHasBeenSavedSuccessfully = 'SubmittalHasBeenSavedSuccessfully',
    SubmittalHasBeenWithdrawnSuccessfully = 'SubmittalHasBeenWithdrawnSuccessfully',
    SubmittalHasBeenForwardedSuccessfully = 'SubmittalHasBeenForwardedSuccessfully',
    SubmittalHasBeenReceivedSuccessfully = 'SubmittalHasBeenReceivedSuccessfully',
    SubmittalHasBeenDeclinedSuccessfully = 'SubmittalHasBeenDeclinedSuccessfully',
    SelectedSubmittalsForwarded = 'SelectedSubmittalsForwarded',
    SelectedSubmittalForwarded = 'SelectedSubmittalForwarded',
    AtleastTwoRecordForMassCompare = 'AtleastTwoRecordForMassCompare',
    AtmostRecordForMassCompare = 'AtmostRecordForMassCompare',
    SubmittalsNotAllowedAfterCutoffDate = 'SubmittalsNotAllowedAfterCutoffDate',
    TotalSubmittalsAlreadyFilled = 'TotalSubmittalsAlreadyFilled',
    SubmittalsLimitExceededPerStaffingAgency = 'SubmittalsLimitExceededPerStaffingAgency'
}

export enum RequiredStrings{
    AddSubmittal = 'AddSubmittal',
    EditSubmittal = 'EditSubmittal',
    EmptyString = '',
    Submittal = 'Submittal',
    Sector = 'Sector',
    W2Employee = 'W2Employee',
    RequisitionNTE = 'RequisitionNTE',
    TargetBillRate = 'TargetBillRate',
    ProfessionalRequestID = 'ProfessionalRequestID',
    JobCategory = 'JobCategory',
    SubmittalCodeLabel = 'SubmittalCodeLabel',
    SubmittalId = 'SubmittalId',
    SubmittalStatus = 'SubmittalStatus',
    ProfessionalRequestStatus = 'ProfessionalRequestStatus',
    TimeAndOneHalfNonExempt = 'TimeAndOneHalfNonExempt',
    StraightTimeExempt = 'StraightTimeExempt',
    Hour = 'Hour',
    USD = 'USD',
    SubmittalStatusId = 'SubmittalStatusId',
    Client = 'Client'
}

export enum SubmittalTabName{
    PendingProcess = 'PendingProcess',
    PendingOnboarding = 'PendingOnboarding',
    All = 'All',
    Draft = 'Draft',
    ActiveCandidates = 'Active Candidates',
    SelectedCandidates = 'Selected Candidates'
}

export type Keys = '2' | '3' | '4';
