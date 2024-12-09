export interface ISelectionReasonUkeyData {
    UKey: string,
    Id: number,
    Code: string,
    SectorId: number,
    SectorName: string,
    Disabled: boolean,
    CreatedBy: string,
    CreatedOn: string,
    LastModifiedBy: string,
    LastModifiedOn: string,
    CandidateSelectionReason: string,
    ProfessionalRequest: boolean,
    LiRequest: boolean,
    RfxSowRequest: boolean,
}

export interface ICommonComponentData {
    CandidateSelectionReasonId: number;
    Disabled: boolean;
    CandidateSelectionReasonCode: string;
}


interface IFilterValue {
    Code: string[];
    SectorName: string[];
    CandidateSelectionReason: string[];
    ProfessionalRequest: string[];
    RfxSowRequest: string[];
    LiRequest: string[];
    CreatedBy: string[];
    CreatedOn: (string | null)[];
    LastModifiedBy: string[];
    LastModifiedOn: (string | null)[];
}

export interface IFilterControlData {
    controlType: string;
    value?: IFilterValue;
}

