export interface AssignmentPoNumber {
    AssignmentPONumberId: number;
    PoNumber: string;
    PoEffectiveFrom: string;
    PoEffectiveTo: string | null;
    SeparateTandEPoAmount: boolean;
    TotalPoAmount: number;
    TotalPoIncurredAmount: number;
    PoTimeAmount: number;
    PoTimeIncurredAmount: number;
    PoExpenseAmount: number;
    PoExpenseIncurredAmount: number;
    Comment: string | null;
    Disabled: boolean;
    PoRemainingAmount: number;
    PoTimeRemainingAmount: number;
    PoExpenseRemainingAmount: number;
  }

export interface AssignmentRate {
    Id: number;
    RateEffectiveDateFrom: string;
    RateEffectiveDateTo: string | null;
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
    Comments: string | null;
    Disabled: boolean;
  }

export interface AssignmentShiftDetail {
    ShiftId?: number|null;
    ShiftName?: string;
    Sun?: boolean|string;
    Mon?: boolean|string;
    Tue?: boolean|string;
    Wed?: boolean|string;
    Thu?: boolean|string;
    Fri?: boolean|string;
    Sat?: boolean|string;
    StartTime?: string|Date;
    EndTime?: string|Date;
    CLPWorkingDays?: string;
    assignmentShiftDetailId?:string|number;
    AdderOrMultiplierValue?:string|number;
    ShiftDifferentialMethod?:string|number;
  }

export interface AssignmentCostAccountingCode {
    AssignmentCostAccountingCodeId: number;
    CostAccountingCodeId: number;
    RefCostAccountingCode: string;
    CostAccountingCode: string;
    Description: string;
    Segment1: string;
    Segment2: string;
    Segment3: string | null;
    Segment4: string | null;
    Segment5: string | null;
    DefaultCostAccountingCode: boolean;
    Disabled: boolean;
    EffectiveFrom: string;
    EffectiveTo: string;
    isTempSaved: boolean;
  }

  interface AssignmentHourDistributionRule {
    Id: number;
    HourDistributionRuleId: number;
    HourDistributionRuleName: string;
    EffectiveFrom: string;
    EffectiveTo: string | null;
    Disabled: boolean;
  }

  interface AssignmentMealBreakConfiguration {
    Id: number;
    MealBreakConfigurationId: number;
    MealBreakConfigurationName: string;
    EffectiveFrom: string;
    EffectiveTo: string | null;
    Disabled: boolean;
  }

export interface BenefitAdder {
    Id: number;
    ReqLibraryBenefitAdderId: number;
    LocalizedLabelKey: string;
    Value: string;
  }

  interface ComplianceOnboardingItemDto {
    SectorComplianceItemId: number;
    ComplianceCheckValue: boolean;
    IsVisibleToClient: boolean;
  }

export interface ComplianceDetail {
    PendingResult: boolean;
    DrugScreenId: number;
    DrugScreenResultId: number;
    DrugResultDate: string | null;
    BackgroundCheckId: number;
    BackgroundResultDate: string | null;
    ComplianceOnboardingItems: ComplianceOnboardingItemDto[];
    RecordId?:number|string;
    XrmEntityId?:number|string;
  }

export interface AssignmentDetail {
    Id: number;
    UKey: string;
    LoggedInUserRoleGroupID: number;
    AssignmentCode: string;
    SectorId: number;
    SectorName: string;
    OrgLevel1Id: number;
    OrgLevel1Name: string;
    OrgLevel2Id: number | null;
    OrgLevel2Name: string | null;
    OrgLevel3Id: number;
    OrgLevel3Name: string;
    OrgLevel4Id: number | null;
    OrgLevel4Name: string | null;
    ReportingLocationId: number | null;
    ReportingLocationName: string;
    LocationAddress: string;
    BadgeNo: string | null;
    RequestId: number;
    RequestUKey: string;
    CandidateId: number | null;
    CandidateUKey: string | null;
    RequestCode: string;
    SowId: number | null;
    ContractorId: number;
    ContractorName: string;
    AssignmentTypeId: number;
    AssignmentTypeName: string;
    CandidateCode: string|number|null|undefined;
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
    EstimatedQuantity: number | null;
    IncurredQuantity: number | null;
    RegularQuantityPerWeek: number;
    EstimatedRegularQuantityPerWeek: number;
    ICType: string | null;
    DeliveryCompletionDate: string | null;
    StatusId: number;
    StatusName: string;
    HireCodeId: number;
    HireCodeName: string;
    HourDistributionRuleEffectiveDate: string;
    MealBreakConfigurationEffectiveDate: string;
    MinimumClearanceToStartId: number | null;
    MinimumClearanceToStartName: string | null;
    HoursYTD: number;
    WagesYTD: number;
    MaskOTFields: boolean;
    MileageRate: number;
    AllowContractorToEnterTime: boolean;
    TimeInOutNeeded: boolean;
    POOwnerId: number;
    POOwnerName: string;
    AssignmentPONumberId: number | null;
    AssignmentPoNumber: string | null;
    TerminatedRevisionId: number | null;
    PrimaryManagerId: number | null;
    PrimaryManagerName: string | null;
    AlternateManagerId: number | null;
    AlternateManagerName: string | null;
    OriginalAssignmentStartDate: string;
    AdditionalEndDateReminderRecipientId: number | null;
    TenureDetailId: number;
    SecurityClearanceId: number;
    SecurityClearanceName: string;
    RequestingManagerId: number;
    RequestingManagerName: string;
    IsSinglePO: boolean;
    IsMultipleTimeApprovalNeeded: boolean;
    TenureLimit: number;
    TenureLimitTypeId: number;
    TenureCompleted: boolean;
    IsRevisionPending: boolean;
    IsDrugScreenRequired: boolean;
    IsBackgroundChecksRequired: boolean;
    ShiftId: number;
    RevisedRateEffectiveDate: string;
    HasChargeEffectiveDate: boolean;
    IsRevisionProcessed: boolean;
    InitialGoLiveDate: string;
    AssignmentPoNumbers: AssignmentPoNumber[];
    AssignmentRates: AssignmentRate;
    AssignmentShiftDetails: AssignmentShiftDetail[];
    AssignmentCostAccountingCodes: AssignmentCostAccountingCode[];
    AssignmentHourDistributionRules: AssignmentHourDistributionRule[];
    AssignmentMealBreakConfigurations: AssignmentMealBreakConfiguration[];
    BenefitAdders: BenefitAdder[];
    complianceDetail: ComplianceDetail;
  }
export interface DropdownItem {
    Text: string;
    Value: string | number;
    TextLocalizedKey?: string | null;
    IsSelected?: boolean;
  }
export interface selectedDropdownItem {
    Text: string;
    Value: string | number;
  }


export interface DropdownData {
    Data: DropdownItem[];
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
  }

export interface CostCenterConfig {
    Id: number;
    LocalizedKey: string;
    SegmentName: string;
    SegmentMaxLength: number;
    SegmentMinLength: number;
  }

export interface SectorCostCenterConfigData {
    AddCostCenterManually: boolean;
    SectorCostCenterConfigs: CostCenterConfig[];
  }

export interface AssignmentData {
    AssignmentMinValidDate?: string | null;
    AssignmentMaxValidDate?: string | null;
    IsExpenseEntry?: boolean;
    TimeMaxWeekendingDate?: string | null;
  }

export interface IControlDates {
  control1: string;
  control2: string;
}

export interface IValidationMessages {
  key1: string;
  key2: string;
}

export interface ISchedule {
  time: {
    startTime: string;
    endTime: string;
  };
  day: {
    day: string;
    isSelected: boolean;
  }[];
}

export interface ITerminationReason {
  UKey: string;
  Id: number;
  TerminationReasonCode: string;
  TerminationReasonName: string;
  ProfessionalContractor: string;
  LIContractor: string;
  SOWResources: string;
  BackfillNeeded: string;
  ManagerSurveyRequested: string;
  DoNotReturn: string;
  ReasonTypeId: number;
  SectorId: number;
  ReasonTypeName: string;
  SectorName: string;
  Disabled: boolean;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
}
export interface assignmentTanureDetails {
  assignmentId: number|null|undefined;
  contractorId: number;
  sectorId: number;
  assignmentStartDate: string;
  assignmentEndDate: string;
  IsStartDateValidation:boolean;
}
