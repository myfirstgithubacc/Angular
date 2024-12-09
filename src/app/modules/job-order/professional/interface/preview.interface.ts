import { TransactionDataModel } from "@xrm-master/approval-configuration/constant/enum";
import { DMSApiRequestPayload } from "@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface";
import { IDropdownOption } from "@xrm-shared/models/common.model";

export interface IRequestDetails {
    IsPreIdentifiedRequest:boolean;
    SectorId: IDropdownOption;
    WorkLocationId: IDropdownOption;
    RequestingManagerId: IDropdownOption;
    OrgLevel1Id: IDropdownOption;
    OrgLevel2Id?: IDropdownOption;
    OrgLevel3Id?: IDropdownOption;
    OrgLevel4Id?: IDropdownOption;
    CostAccountingId?: IDropdownOption;
    ReasonForRequestId?: IDropdownOption;
    SubmittalAllowedPerStaffing: string;
    SubmittalAllowedForThisRequest: string;
    IsAllowStaffingToContact: boolean;
}

export interface IPositionDetails {
    PositionTitle: string;
    LaborCategoryId: IDropdownOption;
    JobCategoryId: IDropdownOption;
    ReqLibraryId: IDropdownOption | null;
    AssignmentTypeId?: IDropdownOption;
    SecurityClearanceId: IDropdownOption;
    MinimumClearanceToStartId: IDropdownOption | null;
}

export interface ICandidateDetails {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
    PhoneExt: string;
}

export interface IAssignmentRequirement {
    TargetStartDate: string;
    TargetEndDate: string;
    ShiftId: IDropdownOption;
    Sun: boolean;
    Mon: boolean;
    Tue: boolean;
    Wed: boolean;
    Thu: boolean;
    Fri: boolean;
    Sat: boolean;
    StartTime: string | null;
    EndTime: string | null;
    PositionNeeded: string;
    IsDrugTestRequired: boolean;
    IsBackgrounCheckRequired: boolean;
    PositionDescription: string;
    SkillsRequired: string;
    SkillsPreferred: string;
    ExperienceRequired: string;
    ExperiencePreferred: string;
    EducationRequired: string;
    EducationPreferred: string;
    AdditionalInformation: string;
}

export interface IRateDetails {
    BaseWageRate: number | null;
    RateUnitId: number;
    NteBillRate: string;
    NewNteBillRate: string;
    DeltaCost: string | null;
    ReasonForException: string | null;
    HourDistributionRuleId: IDropdownOption;
    EstimatedRegularHoursPerWeek: string;
    IsOtExpected: boolean;
    OthoursBilledAt: number;
    EstimatedOtHoursPerWeek: string;
    BudgetedHours: string;
    EstimatedCost: string | null;
}

export interface IRequestComments {
    ClientComments?: string;
    ClientCommentsToStaffingAgency?: string;
}

export interface IRootObject {
    udf: UDF[];
    dmsFieldRecords: DMSApiRequestPayload[];
    approvalDetails: TransactionDataModel[];
    requestDetails: IRequestDetails;
    positionDetails: IPositionDetails;
    candidateDetails: ICandidateDetails;
    assignmentRequirement: IAssignmentRequirement;
    rateDetails: IRateDetails;
    requestComments: IRequestComments;
    StatusCode: string | null;
}

export interface IudfPreview {
    Text: string;
    Value: string;
    FieldLabelLocalizedKey: string;
}

export interface IdmsPreview {
    documentTitle: string;
    extension: string;
    fileNameWithExtension: string;
    size: string;
    uploadedBy: string;
    uploadedOn: string;
    actions: string;
    file: string;
}

interface UDFValue {
    Text?: string;
    Value?: number;
}

export type UDF = Record<string, UDFValue | string>;
