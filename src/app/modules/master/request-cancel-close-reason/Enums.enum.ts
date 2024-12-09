export enum Status{
    Active = 'Active',
    Inactive = 'Inactive',
    All = 'All',
    Activate = 'Activate',
    activate = 'activate',
    Deactivate = 'Deactivate',
    Disabled = 'Disabled'
}

export enum ToastMessages{
    EntityHasBeenDeactivatedSuccessfully = 'EntityHasBeenDeactivatedSuccessfully',
    EntityHasBeenActivatedSuccessfully = 'EntityHasBeenActivatedSuccessfully',
    DeactivateAllCancelCloseReasonSuccess = 'DeactivateAllCancelCloseReasonSuccess',
    ActivateAllCancelCloseReasonSuccess = 'ActivateAllCancelCloseReasonSuccess',
    DeactivateCancelCloseReasonSuccess = 'DeactivateCancelCloseReasonSuccess',
    ActivateCancelCloseReasonSuccess = 'ActivateCancelCloseReasonSuccess',
    EnitityAlreadyExists = 'EnitityAlreadyExists',
    CreateCancelCloseReasonSuccess = 'CreateCancelCloseReasonSuccess',
    Somethingwentwrong = 'Somethingwentwrong'
}

export enum RqccrKeys{
    RequestCancelCloseReason = 'RequestCancelCloseReason',
    RequestCancelCloseID = 'RequestCancelCloseID',
    SelectAtLeastOneApplicableIn = 'SelectAtLeastOneApplicableIn',
    Status = 'Status',
    Sector = 'Sector',
    CancelCloseReason = 'CancelCloseReason',
    Yes ='Yes',
    NA = 'N/A',
    EmptyString = '',
    BasicTitle = 'basic-title'
}

export enum RqccrNavigationUrls{
    View = '/xrm/master/request-cancel-close-reason/view/',
    AddEdit = '/xrm/master/request-cancel-close-reason/add-edit/',
    List = '/xrm/master/request-cancel-close-reason/list',
    Add = 'xrm/master/request-cancel-close-reason/add-edit'
}

export enum ValidationMessages {
    PleaseSelectData = 'PleaseSelectData',
    PleaseEnterData = 'PleaseEnterData',

}
