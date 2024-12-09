
import { IDropdownOption } from "@xrm-shared/models/common.model";

export interface IEventNameDropdown extends IDropdownOption{
    RoleGroupIds: string;
}
export interface StaffingAgencyItems {
    Index: string;
    text: string;
    staffingAgencyId: number;
    staffingAgencyTier?: string;
    isSelected: boolean;
}

export interface StaffingCategoryList {
    text: string;
    Index: string;
    items: StaffingAgencyItems[];
}

export interface StaffingChoice {
    Text: string;
    Value: number;
}

interface AssignmentPoNumber {
    AssignmentPONumberId: number;
    PoNumber: string;
    PoEffectiveFrom: string;
    PoEffectiveTo: string;
    SeparateTandEPoAmount: boolean;
    TotalPoAmount: number;
    TotalPoIncurredAmount: number;
    PoTimeAmount: number;
    PoTimeIncurredAmount: number;
    PoExpenseAmount: number;
    PoExpenseIncurredAmount: number;
    Comment: string;
    Disabled: boolean;
    PoRemainingAmount: number;
    PoTimeRemainingAmount: number;
    PoExpenseRemainingAmount: number;
}

interface AssignmentMealBreakConfiguration {
    Id: number;
    MealBreakConfigurationId: number;
    MealBreakConfigurationName: string;
    EffectiveFrom: string;
    EffectiveTo: string;
    Disabled: boolean;
}

interface AssignmentHourDistributionRule {
    Id: number;
    HourDistributionRuleId: number;
    HourDistributionRuleName: string;
    EffectiveFrom: string;
    EffectiveTo: string;
    Disabled: boolean;
}

interface AssignmentCostAccountingCode {
    AssignmentCostAccountingCodeId: number;
    CostAccountingCodeId: number;
    RefCostAccountingCode: string;
    CostAccountingCode: string;
    Description: string;
    Segment1: string;
    Segment2: string;
    Segment3: string;
    Segment4: string;
    Segment5: string;
    DefaultCostAccountingCode: boolean;
    Disabled: boolean;
    EffectiveFrom: string;
    EffectiveTo: string;
}

interface AssignmentRate {
    Id: number;
    RateEffectiveDateFrom: string;
    RateEffectiveDateTo: string;
    MspFee: number;
    StaffingAgencyMarkup: number;
    ShiftMultiplier: number;
    BaseWageRate: number;
    ActualSTWageRate: number;
    OTWageRate: number;
    DTWageRate: number;
    STBillRate: number;
    OTBillRate: number;
    DTBillRate: number;
    StaffingAgencySTBillRate: number;
    StaffingAgencyOTBillRate: number;
    StaffingAgencyDTBillRate: number;
    OTMultiplier: number;
    DTMultiplier: number;
    Comments: string;
    Disabled: boolean;
}

interface BenefitAdder {
    Id: number;
    ReqLibraryBenefitAdderId: number;
    LocalizedLabelKey: string;
    Value: number;
}

interface AssignmentShiftDetails {
    ShiftId: number;
    ShiftName: string;
    Sun: boolean;
    Mon: boolean;
    Tue: boolean;
    Wed: boolean;
    Thu: boolean;
    Fri: boolean;
    Sat: boolean;
    StartTime: string;
    EndTime: string;
    CLPWorkingDays: string;
}

export interface AssignmentDetails {
    Id: number;
    UKey: string;
    LoggedInUserRoleGroupID: number;
    AssignmentCode: string;
    SectorId: number;
    SectorName: string;
    OrgLevel1Id: number;
    OrgLevel1Name: string;
    OrgLevel2Id: number;
    OrgLevel2Name: string;
    OrgLevel3Id: number;
    OrgLevel3Name: string;
    OrgLevel4Id: number;
    OrgLevel4Name: string;
    ReportingLocationId: number;
    ReportingLocationName: string;
    BadgeNo: number;
    RequestId: number;
    RequestUKey: string;
    CandidateId: number;
    CandidateUKey: string;
    RequestCode: string;
    SowId: number;
    ContractorId: number;
    ContractorName: string;
    AssignmentTypeId: number;
    AssignmentTypeName: string;
    WorkLocationId: number;
    WorkLocationName: string;
    LaborCategoryId: number;
    LaborCategoryName: string;
    JobCategoryId: number;
    JobCategoryName: string;
    ReqLibraryId: number;
    ReqLibraryCode: string;
    DefaultCostAccountingCodeId: number;
    DefaultCostAccountingCode: string;
    StaffingAgencyId: number;
    StaffingAgencyName: string;
    PositionTitle: string;
    PositionDescription: string;
    OTRateTypeId: number;
    OTEligibility: boolean;
    OtRateTypeLocalizedKey: string;
    AssignmentStartDate: string;
    AssignmentEndDate: string;
    UnitType: number;
    UnitTypeName: string;
    EstimatedQuantity: number;
    IncurredQuantity: number;
    RegularQuantityPerWeek: number;
    EstimatedRegularQuantityPerWeek: number;
    ICType: string;
    DeliveryCompletionDate: string;
    StatusId: number;
    StatusName: string;
    HireCodeId: number;
    HireCodeName: string;
    HourDistributionRuleEffectiveDate: string;
    MealBreakConfigurationEffectiveDate: string;
    MinimumClearanceToStartId: number;
    MinimumClearanceToStartName: string;
    HoursYTD: number;
    WagesYTD: number;
    MaskOTFields: boolean;
    MileageRate: number;
    AllowContractorToEnterTime: boolean;
    TimeInOutNeeded: boolean;
    POOwnerId: number;
    POOwnerName: string;
    AssignmentPONumberId: number;
    AssignmentPoNumber: string;
    TerminatedRevisionId: number;
    PrimaryManagerId: number;
    PrimaryManagerName: string;
    AlternateManagerId: number;
    AlternateManagerName: string;
    OriginalAssignmentStartDate: string;
    AdditionalEndDateReminderRecipientId: number;
    TenureDetailId: number;
    SecurityClearanceId: number;
    SecurityClearanceName: string;
    RequestingManagerId: number;
    RequestingManagerName: string;
    IsSinglePO: boolean;
    IsMultipleTimeApprovalNeeded: boolean;
    TenureLimit: number;
    TenureLimitTypeId: number;
    IsRevisionPending: boolean;
    IsDrugScreenRequired: boolean;
    IsBackgroundChecksRequired: boolean;
    ShiftId: number;
    RevisedRateEffectiveDate: string;
    AssignmentPoNumbers: AssignmentPoNumber[];
    AssignmentRates: AssignmentRate;
    AssignmentShiftDetails: AssignmentShiftDetails[];
    AssignmentCostAccountingCodes: AssignmentCostAccountingCode[];
    AssignmentHourDistributionRules: AssignmentHourDistributionRule[];
    AssignmentMealBreakConfigurations: AssignmentMealBreakConfiguration[];
    BenefitAdders: BenefitAdder[];
}

export interface UserObject {
    contractorUKey: string | null;
}

export interface EventConfigData {
    ID: number;
    UKey: string;
    EventCode: string;
    SectorName: string;
    EventName: string;
    DateType: string;
    DateTypeId: number;
    RequiresEventReason: boolean;
    RequiresComment: boolean;
    RequiresBackfill: boolean;
    BackfillDefaultValue: boolean;
    EffectOnDailySchedule: string;
    EffectOnDailyScheduleId: number;
    ManagerSurveyToRequested: boolean;
    EventEnteredBy: string;
    NotifyTo: string;
    DelayNotificationBeforeEvent: boolean;
    DaysPriorToEventDate: number | null;
    ValidateEventDateWithTimesheet: boolean;
    IsProfessionalContractor: boolean;
    IsLightIndustrialContractor: boolean;
    Disabled: boolean;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string | null;
    LastModifiedOn: string | null;
}

export interface IEventDetailsUkey {
    UKey: string;
    Id: number;
    AssignmentId: string | number;
    EventConfigId: number;
    EventReasonId: number;
    EventCode: string;
    EventName: string;
    EventReasonName: string;
    FromDate: string | null;
    ToDate: string | null;
    BackfillRequired: string;
    BackfillStartDate: string | null;
    BackfillEndDate: string | null;
    BroadcastFrom: number | null;
    Comment: string;
    RequestId: number;
    HasEmailNotificationRequired: boolean;
    EventNotificationToBeSentOn: string | null;
    HasEventNotificationSent: boolean;
    Disabled: boolean;
    Status: string;
    CreatedBy: string;
    CreatedOn: string;
}

export interface ContractorEventData extends IEventDetailsUkey {
    SectorName: string;
    IsBackFillRequired: boolean;
    staffingAgencies: IDropdownOption[]
}

export interface EntityAction {
    EntityTypeId: number;
    EntityType: string;
    ActionId: number;
    ActionName: string;
}
export interface Entity {
    EntityId: number;
    EntityActions: EntityAction[];
}

export interface IGetStaffingAgency{
        sectorId: number;
        locationId: number;
        laborCategoryId:number;
        assignmentId: number;
}

export interface StaffingAgency {
    StaffingAgencyId: number;
    StaffingAgencyName: string;
    IsSelected: boolean;
    StaffingAgencyTier?: string;
}
export interface IGetStaffingAgencies {
    Preferred: StaffingAgency[];
    Tier2: StaffingAgency[];
    Tier3: StaffingAgency[];
}

export interface TransformedAgency {
    Index: string;
    text: string;
    staffingAgencyId: number;
    isSelected: boolean;
    staffingAgencyTier?: string;
}

export interface TransformedData {
    text: string;
    Index: string;
    items: TransformedAgency[];
}

export interface ICheckedKeyData {
    selected: [];
    checkedKey: string[];
}
