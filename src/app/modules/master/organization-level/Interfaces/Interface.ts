import { FormGroup } from "@angular/forms";

export interface OrganizationLevel {
    Id: number;
    UKey: string;
    SectorId: number;
    OrganizationCode: string;
    SectorName: string;
    Disabled: boolean;
    CreatedBy: number;
    CreatedOn: string;
    LastModifiedBy: number;
    LastModifiedOn: string;
    CreatedByUserName: string;
    LastModifiedByUserName: string;
    OrganizationName: string;
    ClientPayStaffingDirectly: string;
  }

export interface OrgLevelDetailsBySectorId {
    OrgLevelType: number;
    LocalizedKey: string;
    OrgName: string;
    ClientPaysStaffingAgencyDirectly?: boolean;
    IsRfxSowRequired?: boolean;
    IsMandatory: boolean;
}


export interface ClientDetails {
    Id: number;
    Ukey: string;
    TimeZone: string;
    HomeCountry: string;
    DefaultCultureName: string;
    WeekEndingDay: string;
    Name: string;
    Email: string;
    Url: string;
    Code: string;
    ClientConfigureType: string;
    ProgramManagerName: string;
    ProgramManagerEmail: string;
    ProgramManagerContact: string;
    OrganizationLabel: string;
    TimezoneId: number;
    DefaultCultureId: number;
    SystemGeneratedEmail: string;
    CountryId: number;
    WeekEndingDayId: number;
    SowVariance: number;
    OnsiteName: string;
    EmailDomain: string;
    ClientPaySalesTax: boolean;
    IsPortalImplementation: boolean;
    IsSalesTaxFromExternalSource: boolean;
    IsLiClpFilledByDifferentStaffing: boolean;
    SkipHoursValidationOnTimeUpload: boolean;
    IsLimitAvailableWeekendingInTimeCapture: boolean;
    NoOfPreviousWeekending: number;
    IsAcroTracInOutTime: boolean;
    IsRfxRequired: boolean;
    UidLabelLocalizedKey: string;
    UidLength: number;
    IsUidNumeric: boolean;
    SupportContactNumber: string;
    SupportEmail: string;
  }

export interface UdfData{
    data:PreparedData[];
    formGroup:FormGroup
}

export interface SaveUpdatePayload {
    SectorId?: number;
    OrganizationName: string;
    ClientPayStaffingDirectly?: boolean;
    OrganizationCode: string | null;
    SectorName: string | null;
    udf: Record<string, unknown>;
    UdfFieldRecords: [];
    UKey?:string;
    ReasonForChange?:string;
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

export interface PreparedData {
    udfId: number;
    xrmEntityId: number | undefined | null;
    sectorId: number | undefined | null;
    recordId: number | undefined | null;
    recordUKey: string | undefined | null;
    udfConfigId: number;
    udfIntegerValue: number | null;
    udfNumericValue: number | null;
    udfTextValue: string | null;
    udfDateValue: string | null;
}

export interface ParentData {
    recordCode: string;
    uKey: string;
    Disabled: boolean;
    recordId: number;
    recordCodeLabel:string;
}
