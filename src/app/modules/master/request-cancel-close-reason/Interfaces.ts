export interface RQCCR {
    Id: number;
    uKey: string;
    CancelCloseReasonCode: string;
    SectorId: number;
    SectorName: string;
    CancelCloseReason: string;
    ProfessionalPsrRequest: boolean | string;
    IcSowRequest: boolean | string | null;
    LiRequest: boolean | string;
    Disabled: boolean;
    CreatedBy: number;
    CreatedByUserName: string;
    CreatedOn: string;
    LastModifiedBy: number | null;
    LastModifiedByUserName: string | null;
    LastModifiedOn: string | null;
}

export interface SaveUpdatePayload{
    sectorId: string;
    cancelCloseReason: string;
    professionalPsrRequest: boolean;
    icSowRequest: boolean;
    liRequest: boolean;
    uKey?: string;
}

export interface StatusUpdatePayload {
    uKey: string;
    disabled: boolean;
    reasonForChange?: string;
}

export interface AdvanceSearchData {
    controlType: string;
    value: {
      [key: string]: string[];
    };
  }

export interface ParentData {
    recordCode: string;
    ukey: string;
    Disabled: boolean;
    recordId: number;
}
