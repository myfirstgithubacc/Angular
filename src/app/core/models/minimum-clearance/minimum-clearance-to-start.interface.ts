export interface IMinimumClearanceDetails {
    UKey: string;
    Id: number;
    Code: string;
    SectorId: number;
    SectorName: string;
    Disabled: boolean;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string;
    LastModifiedOn: string;
    ClearanceLevelName: string;
    ProfessionalRequest: boolean;
    Candidates: boolean;
    RfxSowRequest: boolean;
    SowResources: boolean;
}

export interface ICommonComponentData {
    MinClearanceId: number;
    Disabled: boolean;
    MinClearanceCode: string;
}


interface IFilterValue {
    SectorName: string[];
    Code: string[];
    ClearanceLevelName: string[];
    ProfessionalRequest: string[];
    CreatedBy: string[];
    CreatedOn: string[];
    LastModifiedBy: string[];
    LastModifiedOn: (string | null)[];
}

export interface IFilterControlData {
    controlType: string;
    value: IFilterValue;
}

export interface IClearanceCopyData {
    Source: string;
    Destination: string;
    minimumClearanceIds: string[];
}
