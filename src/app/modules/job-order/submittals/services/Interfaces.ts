import { FormGroup } from "@angular/forms";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";
import { Status, StatusId } from "./Constants.enum";
import { DMSApiRequestPayload } from "@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface";

export type CardVisibilityKeys = 'iscandidateDetailsVisible' | 'israteDetailsMarkupVisible' | 'israteDetailsBillrateVisible' | 'ispositionDescriptionVisible' | 'isrecruiterDetailVisible'| 'isudfVisible';
export interface SubmittalGetAll {
    RequestUkey: string;
    SubmittalUkey: string;
    SubmittalId: string;
    CandidateName: string;
    Status: string;
    NTEBillRate: number;
    BillRate: number;
    Shift: string;
    Currency: string;
    IsW2Employee: boolean;
    WorkerClassification: string;
    RequestCutOffDate: string;
    CutOffDatePassed: boolean;
}

export interface ListPayload{
    requestUkey:string
}


export interface ProfessionalRequest {
    RequestId: number;
    RequestUkey: string;
    RequestCode: string;
    SectorName: string;
    WorkLocationName: string;
    JobCategoryName: string;
    MySubmittal: number;
    TotalSubmittal: number;
    LowestBidRate: number;
    CurrencyCode: string;
    LaborCategoryName: string;
    PositionTitle: string;
    ShiftName: string;
    CutOffDate: string;
    MyBroadcastRound: number;
    BroadcastRound: number;
    Status: string;
    StatusId: number;
    BroadcastedOn: string;
}

export interface IActionItem {
    Status: string | boolean | number;
    Items: Action[];
}

export interface Action {
    icon: string;
    title: string;
    color: string;
    fn: (dataItem: SubmittalGetAll) => void;
    actionId: number[];
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

export interface ParentData {
    ProfessionReqId: string;
    SectorLabel: string;
    SectorName: string;
    JobCategoryName: string;
    Status: string;
    IsShowSubData?: boolean;
    SubmittalCode?: string;
    RequestUkey: string;
}

export interface UdfData{
    data: IPreparedUdfPayloadData[];
    formGroup: FormGroup
}

export interface RecruiterContactInfo {
    PhoneNumber: string;
    PhoneNumberExt: string;
    Email: string;
    CountryId: number;
}

export interface SubmittalDetails {
    SubmittalId: number;
    SubmittalUkey: string;
    SubmittalCode: string;
    StaffingAgency: string;
    SubmittalStatusId: number;
    Status: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    PhoneNumber: string;
    PhoneExt: string;
    Email: string;
    UId: string;
    WorkerClassificationId: number;
    WorkerClassificationName: string;
    ScWorkerClassificationName: string;
    HasWorkedPreviouslyAtClient: boolean;
    PreviousExperienceDescription: string;
    PreviousAssignmentEndDate: string;
    InterviewAvailability: string;
    StartAvailability: string;
    IsRateMarkupBasedVariant: boolean;
    BaseWageRate: number;
    ActualStWageRate: number;
    SubmittedMarkup: number;
    ShiftDifferential: string;
    BidRate: number;
    OtHoursBilledAtId: number;
    OtWageRate: number;
    DtWageRate: number;
    StBillRate: number;
    OtBillRate: number;
    DtBillRate: number;
    StaffingAgencyStBillRate: number;
    StaffingAgencyOtBillRate: number;
    StaffingAgencyDtBillRate: number;
    NteRate: number;
    NteMarkupPercent: number;
    CanSkillsRequired: string;
    CanSkillsPreferred: string;
    CanExperienceRequired: string;
    CanExperiencePreferred: string;
    CanEducationRequired: string;
    CanEducationPreferred: string;
    CanRelevantInformation: string;
    RecruiterUserNo: number;
    RecruiterName: string;
    RecruiterPhone: string;
    RecruiterPhoneExt: string;
    RecruiterEmail: string;
    RequestUkey: string;
    PositionId: number;
    StaffingAgencyId: number;
    CandidatePoolId: number;
    IsW2Employee: boolean;
    IsRetiree: boolean;
    RetireeTypeId: number;
    ShiftMultiplyer: number;
    IsResumeAttached: boolean;
    StatusId: number;
    JobDescription: string | null;
    FirstDayReportingInstruction: string;
    SectorId: number;
    BenefitAdders: BenefitAdder[];
  }

export interface PRDetails {
    RequestId: number;
    RequestCode: string;
    SectorId: number;
    Sector: string;
    JobCategory: string;
    RequestStatusId: number;
    RequestStatus: string;
    IsMarkupBasedVariant: boolean;
    BaseWageRate: number;
    ShiftDifferential: string;
    AdderOrMultiplierValue: number;
    MarkupPercent: number;
    NteMarkupPercent: number;
    NteBillRate: number;
    NewNteBillRate: number;
    BillRate: number;
    OvertimeHoursBilledAtId: number;
    LocalizedTypeTextKey: string;
    SkillsRequired: string;
    SkillsPreferred: string;
    ExperienceRequired: string;
    ExperiencePreferred: string;
    EducationRequired: string;
    EducationPreferred: string;
    AdditionalInformation: string;
    StaffingAgencyId: number;
    PositionDescription: string;
    CurrencyCode: string;
    RateUnit: string;
    StartDate: string;
    IsTargetBillRate: boolean;
    RequestUkey: string;
    SubmittalCutOffDate: string;
    SubmittalAllowedPerStaffingAgency: number
    SubmittalAllowedForThisRequest: number
    TotalSubmittal: number
    MySubmittal: number
    UidConfiguration: UidConfig;
    BenefitAdders: BenefitAdder[];
}

export interface RateDetails {
    BaseWageRate: number;
    MarkupPercent: number;
    OvertimeHoursBilledAtId: number;
    AdderOrMultiplierValue: number;
    BillRate: number;
    NteMarkupPercent: number;
    NteBillRate: number;
    NewNteBillRate: number;
}

export interface BenefitAdder {
    Id: number;
    ReqLibraryBenefitAdderId: number;
    LocalizedLabelKey: string;
    Value: number;
}

export interface UidConfig {
    Id: number;
    LabelName: string;
    ToolTip: string;
    MaxLength: number;
    IsNumeric: boolean;
    IsPartialEntry: boolean;
    RightmostChars: number;
}


export interface CreateAddEditApiPayload {
    // Candidate Details
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    Email?: string;
    PhoneNumber?: string;
    PhoneExt?: string;
    UId: string;
    WorkerClassificationId?: number;
    IsWcSubCategoryRequired: boolean | null;
    WCSubCategory?: string;
    HasWorkedPreviouslyAtClient: boolean;
    PreviousExperienceDescription?: string;
    PreviousAssignmentEndDate?: Date;
    InterviewAvailability?: string;
    StartAvailability?: string;

    // Rate Details
    IsRateMarkupBasedVariant: boolean;
    BaseWageRate?: number;
    ActualStWageRate?: number;
    SubmittedMarkup?: number;
    ShiftDifferential?: string;
    BidRate?: number;
    OtHoursBilledAtId?: number;
    OtWageRate?: number;
    DtWageRate?: number;
    StBillRate?: number;
    OtBillRate?: number;
    DtBillRate?: number;
    StaffingAgencyStBillRate?: number;
    StaffingAgencyOtBillRate?: number;
    StaffingAgencyDtBillRate?: number;
    NteRate?: number;

    // Position Description
    SkillsRequired?: string;
    SkillsPreferred?: string;
    ExperienceRequired?: string;
    ExperiencePreferred?: string;
    EducationRequired?: string;
    EducationPreferred?: string;
    AdditionalInformation?: string;

    // Recruiter Details
    RecruiterUserNo?: number;
    RecruiterName: string;
    RecruiterPhone: string;
    RecruiterPhoneExt?: string;
    RecruiterEmail: string;

    // Other properties
    RequestId: number;
    IsW2Employee: boolean;
    IsRetiree: boolean;
    RetireeTypeId?: number;
    ShiftMultiplyer?: number;
    IsResumeAttached: boolean;
    StatusId: number;
    JobDescription?: string;
    FirstDayReportingInstruction?: string;
    SectorId: number;
    RequestStartDate: Date;
    BenefitAddDto: BenefitAdder[];
    DmsFieldRecords: DMSApiRequestPayload[];
    UdfFieldRecords: IPreparedUdfPayloadData[];
}


export interface SubmittalCommonResponse {
    SubmittalId: number;
    SubmittalUkey: string;
    SubmittalCode: string;
}

export interface MarkUpRateData {
    MarkUpNte: number;
    ReqNte: number;
    RequestId: number;
    StaffingAgencyId: number;
    ShiftDifferentialMethod: string;
    CurrencyCode: string;
    RateUnit: string;
    IsTargetBillRate: boolean;
    BaseWageRate: number|null;
}

export interface BillRateData {
    ReqNte: number;
    CurrencyCode: string;
    RateUnit: string;
    IsTargetBillRate: boolean;
}
export interface CalculateRatesPayload {
    RequestId: number;
    BaseWageRate: number;
    SubmittedMarkup: number;
    StaffingAgencyId: number;
}


export interface CalculatedRatesResponse {
    BaseWageRate: number;
    ActualStWageRate: number;
    OtWageRate: number;
    DtWageRate: number;
    StBillRate: number;
    OtBillRate: number;
    DtBillRate: number;
    StaffingAgencyStBillRate: number;
    StaffingAgencyOtBillRate: number;
    StaffingAgencyDtBillRate: number;
    ShiftMultiplier: number;
    OtMultiplier: number;
    DtMultiplier: number;
    MspFee: number;
    ClpRateFormulaDefinition: RateFormulaDefinition;
}

export interface RateFormulaDefinition {
    baseWageRate: string;
    actualStWageRate: string;
    stBillRate: string;
    otBillRate: string;
    dtBillRate: string;
    otWageRate: string;
    dtWageRate: string;
    staffingAgencyStBillRate: string;
    staffingAgencyOtBillRate: string;
    staffingAgencyDtBillRate: string;
}


export interface AdditionalData {
    requestId: number;
    status: Status;
    statusId: StatusId;
    sectorId: number;
    documentData: DMSApiRequestPayload[];
    udfData: IPreparedUdfPayloadData[];
    isMarkupBasedVariant: boolean;
    shiftDifferentialMethod: string;
    positionDescription:string;
    isW2Employee: boolean;
    requestStartDate: string;
    benefitAddDto: BenefitAdder[]
}

export interface SubmittalDetailsView {
    SubmittalId: number;
    SubmittalUkey: string;
    SubmittalCode: string;
    SubmittalStatusId: number;
    SubmittalStatus: string;
    SubPreviousStatusId: number;
    SubPreviousStatus: string;
    StaffingAgency: string;
    FullName: string;
    UId: string;
    PhoneNumber: string;
    PhoneExt: string;
    Email: string;
    WorkerClassification: string;
    IsWcSubCategoryRequired: boolean;
    WcSubCategoryLabel: string;
    WcSubCategory:string;
    HasWorkedPreviouslyAtClient: boolean;
    PreviousExperienceDescription: string;
    PreviousAssignmentEndDate: string;
    InterviewAvailability: string;
    StartAvailability: string;
    IsRateMarkupBasedVariant: boolean;
    BaseWageRate: number;
    ActualStWageRate: number;
    SubmittedMarkup: number;
    ShiftDifferential: string;
    AdderOrMultiplierValue: number;
    BidRate: number;
    OtHoursBilledAtId: number;
    NteRate: number;
    NteMarkupPercent: number;
    SkillsRequired: string;
    CanSkillsRequired: string;
    SkillsPreferred: string;
    CanSkillsPreferred: string;
    ExperienceRequired: string;
    CanExperienceRequired: string;
    ExperiencePreferred: string;
    CanExperiencePreferred: string;
    EducationRequired: string;
    CanEducationRequired: string;
    EducationPreferred: string;
    CanEducationPreferred: string;
    AdditionalInformation: string;
    CanRelevantInformation: string;
    RecruiterUserNo: number;
    RecruiterName: string;
    RecruiterPhone: string;
    RecruiterPhoneExt: string;
    RecruiterEmail: string;
    RequestUkey: string;
    RequestId: number;
    RequestStatusId: number;
    RequestStatus: string;
    StaffingAgencyId: number;
    CandidatePoolId: number;
    IsW2Employee: boolean;
    IsRetiree: boolean;
    RetireeTypeId: number;
    IsResumeAttached: boolean;
    JobDescription: string;
    FirstDayReportingInstruction: string;
    SectorId: number;
    CurrencyCode: string;
    RateUnit: string;
    StaffingAgencyComments: string;
    EstimatedCost: number;
    MspComments: CommentHistoryItem[];
    BenefitAdders: BenefitAdder[];
}

export interface CommentHistoryItem {
    Date: string;
    Comment: string;
}

export interface WithdrawPayload{
    UKey: string;
    StatusId: number,
    Comment: string
}

export interface ICandidateData {
    Id: number;
    UKey: string;
    Code: string;
    CandidateName: string;
    StaffingAgencyName: string;
    Disabled: boolean;
    IsUsedInAssignment: boolean;
    IsUsedInActiveAssignment: boolean;
    CandidateFirstName: string;
    CandidateMiddleInitial: string;
    CandidateLastName: string;
    EmailAddress: string | null;
    ContactNumber: string | null;
    PhoneNumberExt: string | null;
    PreviouslyPlacedAtThisClient: boolean;
    WorkDetails: string;
    PreferredShift: string | null;
    DrugScreenId: number | null;
    DrugScreenName: string | null;
    DrugScreenResultId: number | null;
    DrugScreenResultName: string | null;
    DrugResultDate: string | null;
    BackgroundCheckId: number | null;
    BackGroundCheckName: string | null;
    BackgroundResultDate: string | null;
    IsCandidateEligibleForSecurityClearance: boolean;
    CurrentSecurityClearanceLevel: string | null;
    PreferredSectors: string[];
    PreferredLocations: string[];
    PreferredAssignmentTypes: AssignmentType[];
    UId: string;
}

export interface AssignmentType {
    Id: number;
    AssignmentTypeId: number;
    AssignmentName: string;
}

export interface CandidateDetails {
    Id: number;
    UKey: string;
    CountryId: number;
    CandidateId: string;
    StaffingAgencyId: number;
    CandidateName: string;
    SectorId: number;
    FirstName: string;
    LastName: string;
    EmailAddress: string | null;
    ContactNumber: string;
    PreferredShift: string | null;
    UId: string;
    PreferredSectors: string;
    PreferredLocations: string;
    Disabled: boolean;
    CreatedOn: string;
    CreatedBy: string;
    LastModifiedOn: string | null;
    LastModifiedBy: string | null;
}

interface Permission {
    EntityTypeId: number;
    EntityType: string;
    ActionId: number;
    ActionName: string;
}

export interface ActivatedRouteResponse {
    id?: string;
    permission?: Permission[];
}

export interface CandidateCardData{
    IsCanDetailsEditable: boolean;
    FullName: string;
    PreviousWorkDetails: string;
}

export interface ClickedMenuItem {
    ItemId: number;
    ItemName: string;
    Icon: string;
    ParentId: number;
    DisplayOrder: number;
    EntityId: number;
    Route: string;
    Children: ClickedMenuItem[];
}

export interface ProcessPayload {
    SubmittalIds: number[];
}

export interface WithdrawByMspPayload {
    SubmittalId: number;
    WithdrawReasonId?: number | null;
    Comment: string;
}

export interface DeclinePayload {
    SubmittalId: number;
    DeclineReasonId: number;
    AddToDnr: boolean;
    DnrOptions: number;
    Comment: string;
}

export interface Step {
    label: string;
    isValid: boolean;
    disabled: boolean;
}

export interface Steps {
    [key: number]: () => Step[];
}

export interface StepperData{
    SubmittalStatusId: number;
    CurrentPage: string;
    RecordId: number;
}
