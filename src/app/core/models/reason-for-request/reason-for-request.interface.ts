export interface IReasonForRequestData {
    UKey: string;
    Id: number;
    Code: string;
    SectorId: number;
    SectorName: string;
    Disabled: boolean;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy?: string;
    LastModifiedOn?: string;
    ApprovalConfigured: boolean;
    ReasonForRequest: string;
    ProfessionalRequest: boolean;
    LiRequest: boolean;
    RfxSowRequest: boolean;
}

export interface IReasonForRequestCopyData {
    Source: string;
    Destination: string;
    reasonForRequestIds: string[];
}

export interface ICommonComponentData {
    ReasonForRequestId: number;
    Disabled: boolean;
    ReasonForRequestCode: string;
}

interface IFilterValue {
    SectorName: string[];
    Code: string[];
    ReasonForRequest: string[];
    ProfessionalRequest: string[];
    LiRequest: string[];
    RfxSowRequest: string[];
    ApprovalConfigured: string[];
    CreatedBy: string[];
    CreatedOn: (string | null)[];
    LastModifiedBy: string[];
    LastModifiedOn: (string | null)[];
}

export interface IFilterControlData {
    controlType: string;
    value: IFilterValue;
}
