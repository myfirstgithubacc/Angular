import { FormGroup } from "@angular/forms";
import { assignmentCostAccountingCode } from "../model/assignment.model";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface IBooleanOptionField {
  Text: string;
  Value: boolean;
};

export interface INumberOptionField {
  Text: string;
  Value: number;
};

export interface IDropdownItems {
  IsSelected?: false;
  Text?: string;
  TextLocalizedKey?: null | string;
  Value?: string;
}

export interface IApprovalConfigWidgetObject{
  "actionId": number;
  "entityId": number;
  "sectorId": number;
  "locationId": number;
  "orgLevel1Id": number;
  "laborCategoryId": number;
  "reasonsForRequestId": number;
  "estimatedcost": number;
  "nextLevelManagerId": number;
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
interface ComplianceOnboardingItemDto {
  SectorComplianceItemId: number;
  ComplianceCheckValue: boolean;
  IsVisibleToClient: boolean;
}
export interface onboardingData {
  formGroup: FormGroup;
  data:ComplianceDetail
}
export interface IAssignmentDetails {
  // udfData:any;
	InitialGoLiveDate: string | Date;
	// shiftDataById(shiftDataById: AssignmentShiftDetail, toasterService: ToasterService, approverWidgetForm: ApprovalFormEvent): boolean;
    shiftDataById: AssignmentShiftDetail;
    complianceDetail: ComplianceDetail;
    AdditionalEndDateReminderRecipientId: number | null;
    AllowContractorToEnterTime: boolean;
    AlternateManagerId: number | null;
    AlternateManagerName: string | null;
    AssignmentCode: string;
    AssignmentCostAccountingCodes: assignmentCostAccountingCode[];
    AssignmentEndDate: string;
    AssignmentHourDistributionRules: AssignmentHourDistributionRule[];
    AssignmentMealBreakConfigurations: AssignmentMealBreakConfiguration[];
    AssignmentPONumberId: number | null;
    AssignmentPoNumber: string | null;
    AssignmentPoNumbers: AssignmentPoNumber[];
    AssignmentRates: AssignmentRate;
    AssignmentShiftDetails:any;
    AssignmentStartDate: string;
    AssignmentTypeId: number|string;
    AssignmentTypeName: string;
    BadgeNo: string | null;
    BenefitAdders:BenefitAdder[];
    CandidateId: number | null;
    CandidateUKey: string | null;
    ContractorId: number;
    ContractorName: string;
    CandidateCode: string|number|null|undefined;
    CheckEffectiveDatesAlignment: boolean;
    DefaultCostAccountingCode: string;
    DefaultCostAccountingCodeId: number;
    DeliveryCompletionDate: string | null;
    EstimatedQuantity: number | null;
    EstimatedRegularQuantityPerWeek: number;
    HireCodeId: number;
    HireCodeName: string;
    HasChargeEffectiveDate?:boolean;
    HourDistributionRuleEffectiveDate: string;
    HoursYTD: number;
    ICType: string | null;
    Id: number|null|undefined;
    IncurredQuantity: number | null;
    IsBackgroundChecksRequired: boolean;
    IsDrugScreenRequired: boolean;
    IsMultipleTimeApprovalNeeded: boolean;
    IsRevisionPending: boolean;
    IsRevisionProcessed: boolean;
    IsSinglePO: boolean;
    JobCategoryId: number;
    JobCategoryName: string;
    LaborCategoryId: number;
    LaborCategoryName: string;
    LoggedInUserRoleGroupID?: string|number|null|undefined;
    MaskOTFields: boolean;
    MealBreakConfigurationEffectiveDate: string;
    MileageRate: number;
    MinimumClearanceToStartId: number | null;
    MinimumClearanceToStartName: string | null;
    NextAssignmentStartDate: string| null;
    CanWorkerLogin: boolean;
    OTEligibility: boolean;
    OTRateTypeId: number;
    OrgLevel1Id: number;
    OrgLevel1Name: string;
    OrgLevel2Id: number | null;
    OrgLevel2Name: string | null;
    OrgLevel3Id: number;
    OrgLevel3Name: string;
    OrgLevel4Id: number | null;
    OrgLevel4Name: string | null;
    OriginalAssignmentStartDate: string;
    OtRateTypeLocalizedKey: string;
    POOwnerId: number;
    POOwnerName: string;
    PositionDescription: string;
    PreviousAssignmentEndDate: string| null;
    PositionTitle: string;
    PrimaryManagerId: number | null;
    PrimaryManagerName: string | null;
    RegularQuantityPerWeek: number;
    ReportingLocationId: number | null;
    ReportingLocationName: string;
    ReqLibraryCode: string;
    ReqLibraryId: number;
    RequestCode: string;
    RequestId: number;
    RequestUKey: string;
    RequestingManagerId: number;
    RequestingManagerName: string;
    RevisedRateEffectiveDate: string;
    SectorId: number;
    SectorName: string;
    SecurityClearanceId: number;
    SecurityClearanceName: string;
    ShiftId: number;
    SowId: number | null;
    StaffingAgencyId: number;
    StaffingAgencyName: string;
    StatusId: number;
    StatusName: string;
    TenureDetailId: number;
    TenureLimit: number |null|undefined;
    TenureLimitTypeId: number;
    TerminatedRevisionId: number | null;
    TenureCompleted: boolean;
    TimeInOutNeeded: boolean;
    UKey: string;
    UnitType: number|string;
    UnitTypeName: string;
    WagesYTD: number;
    WorkLocationId: number;
    WorkLocationName: string;
    udfData:UdfData[]
  }
export interface timeLabelConfig {
    labelLocalizeParam1: DynamicParam[];
    labelLocalizeParam2: DynamicParam[];
    label1: string;
    label2: string;
    DefaultInterval: number;
    AllowAI: boolean;
    startisRequired: boolean;
    endisRequired: boolean;
    starttooltipVisible: boolean;
    starttooltipTitle: string;
    starttooltipPosition: string;
    starttooltipTitleLocalizeParam: DynamicParam[];
    startlabelLocalizeParam: DynamicParam[];
    startisHtmlContent: boolean;
    endtooltipVisible: boolean;
    endtooltipTitle: string;
    endtooltipPosition: string;
    endtooltipTitleLocalizeParam: DynamicParam[];
    endlabelLocalizeParam: DynamicParam[];
    endisHtmlContent: boolean;
}

export interface udfAssignmentData {
    data: UdfData[];
    formGroup: FormGroup;
}
type NullableString = string | null;
type NullableNumber = number | null;
type OptionalNullableNumber = number | undefined | null;
type OptionalNullableString = string | undefined | null;
export interface UdfData {
    udfId: number;
    xrmEntityId: OptionalNullableNumber;
    sectorId: OptionalNullableNumber;
    recordId: OptionalNullableNumber;
    recordUKey: OptionalNullableString;
    udfConfigId: number;
    udfIntegerValue: NullableNumber;
    udfNumericValue: NullableNumber;
    udfTextValue: NullableString;
    udfDateValue: NullableString;
}

interface AssignmentPoNumber {
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
  [key: string]: number | string | Date | boolean | null;
    Id: number;
    RateEffectiveDateFrom: string|number|Date;
    RateEffectiveDateTo: string| Date|number | null;
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

// interface AssignmentShiftDetail {
//     ShiftId: number;
//     ShiftName: string;
//     Sun: boolean;
//     Mon: boolean;
//     Tue: boolean;
//     Wed: boolean;
//     Thu: boolean;
//     Fri: boolean;
//     Sat: boolean;
//     StartTime: string;
//     EndTime: string;
//     CLPWorkingDays: string;
// }
export interface weekDays {
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thu: boolean;
  Fri: boolean;
  Sat: boolean;
}

export interface AssignmentShiftDetail {
  ShiftId?: number|null;
  ShiftName?: string;
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thu: boolean;
  Fri: boolean;
  Sat: boolean;
  StartTime?: string|Date;
  EndTime?: string|Date;
  CLPWorkingDays: string;
  assignmentShiftDetailId?:string|number;
  AdderOrMultiplierValue?:string|number;
  ShiftDifferentialMethod?:string|number;
}

export interface AssignmentCostAccountingCode {
  CostAccountingCode: string;
  Description?: string;
  description?: string|undefined;
  assignmentCostAccountingCodeId?: number;
  CostAccountingCodeId: string | number;
  EffectiveFrom?: string|undefined|null;
	EffectiveTo?: string|undefined|null;
  AssignmentCostAccountingCodeId?: number;
  assignmentCostAccoutingCodeId?:number;
  RefCostAccountingCode?: string;
  Segment1?: string | null;
  Segment2?: string | null;
  Segment3?: string | null;
  Segment4?: string | null;
  Segment5?: string | null;
  segment1?: string | null;
  segment2?: string | null;
  segment3?: string | null;
  segment4?: string | null;
  segment5?: string | null;
  DefaultCostAccountingCode?: boolean;
  Disabled?: boolean;
  isTempSaved?:boolean;
  EffectiveStartDate?: string|Date;
  EffectiveEndDate?: string|Date;
  Text?: string;
  Value?: string;
}
export interface SegmentData {
  Segment1?: string | null;
  Segment2?: string | null;
  Segment3?: string | null;
  Segment4?: string | null;
  Segment5?: string | null;
  EffectiveStartDate?: string|Date;
  EffectiveEndDate?: string|Date;
  Description?: string|undefined;
  Text?: string;
  Value?: string;
  CostAccountingCode?: string;

}
export interface SegmentInfo {
  Id: number;
  LocalizedKey: string;
  SegmentName: string;
  SegmentMaxLength: number;
  SegmentMinLength: number;
}

export interface AssignmentHourDistributionRule {
    Id: number;
    HourDistributionRuleId: number;
    HourDistributionRuleName: string;
    EffectiveFrom: string;
    EffectiveTo: string | null;
    Disabled: boolean;
}

export interface AssignmentMealBreakConfiguration {
    Id: number;
    MealBreakConfigurationId: number;
    MealBreakConfigurationName: string;
    EffectiveFrom: string;
    EffectiveTo: string | null;
    Disabled: boolean;
}

export interface IShiftDetails{
  ShiftId: number;
  CLPWorkingDays: string;
  StartTime: string;
  EndTime: string;
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thu: boolean;
  Fri: boolean;
  Sat: boolean;
}

export interface IDynamicLabel {
  Text: string;
  Value: string;
  isVisible: boolean;
  IsMandatory?: boolean;
  isMandatory?: boolean;
}

export interface IAssignmentPONumber {
  AssignmentPONumberId: number;
  Comment: string | null;
  Disabled: boolean;
  PoEffectiveFrom: string;
  PoEffectiveTo: string | null;
  PoExpenseAmount: number;
  PoExpenseIncurredAmount: number;
  PoExpenseRemainingAmount: number;
  PoNumber: string;
  PoRemainingAmount: number;
  PoTimeAmount: number;
  PoTimeIncurredAmount: number;
  PoTimeRemainingAmount: number;
  SeparateTandEPoAmount: boolean;
  TotalPoAmount: number;
  TotalPoIncurredAmount: number;
}

export interface ICommonHeaderForm {
  status: [null | string];
}

export interface IDay {
  day: string;
  isSelected: boolean;
}

export interface IExpenseEntry{
  AssignmentMaxValidDate: string;
  AssignmentMinValidDate: string;
  IsExpenseEntry: boolean;
  TimeMaxWeekendingDate: string;
}

export interface EndDateChangeEvent {
	control: {
		control1: string;
		control2: string;
	};
	key: {
		key1: string;
		key2: string;
	};
	e: Date;
}

export interface IRecordButtonGrid {
  StatusId: string | boolean | number;
  Items: IRecordButtonItem[];
}

export interface IRecordButtonGridView{
  status: string | boolean | number;
  items: IRecordButtonItem[];
}

export interface IRecordButtonItem {
  icon: string;
  title: string;
  color: string;
  actionId: number[];
}

export interface Status{
  items: StatusDataItem[]
}

export interface StatusDataItem {
  title: string;
  titleDynamicParam: [];
  item: string | undefined;
  itemDynamicParam: [];
  cssClass: string[];
  isLinkable: boolean;
  link: string;
}

export interface TabName{
  index: number;
  prevented: boolean;
  title: string;
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

export interface DetailItem {
  title: string|number;
  titleDynamicParam: [];
  item: number|string;
  itemDynamicParam: [];
  cssClass: string[];
  isLinkable: boolean;
  link: string;
  linkParams?: string;
}

export interface StatusData {
  items: DetailItem[];
}

export interface RouteParams {
  id: string;
}
export interface BenefitAdder {
  Id: number;
  ReqLibraryBenefitAdderId: number;
  LocalizedLabelKey: string;
  Value: string|number;
}
export interface ColumnConfig {
  fieldName: string;
  columnHeader: string;
  visibleByDefault: boolean;
  ValueType?: string;
  IsLocalizedKey?:boolean;
}
export interface DocumentDetails {
  Id: number;
  DocumentTitle: string;
  DocumentName: string;
  DocumentFile: string;
  DocumentSize: number;
  UploadedBy: string;
  UploadedOn: string;
  IsDeleteAllowed: boolean;
  FileName: string;
  FileExtension: string;
  EncryptedFileName: string;
  StatusId: number;
  WorkflowId: number;
  IsDraft?: boolean;
  DocumentConfigurationId: number;
}
export interface AssignmentRevision {
  index: number;
  assignmentId: string|number|null;
  revisionId: string;
  isOpen?: boolean;
}

export interface RequestShiftDetail {
  ShiftName: string;
  ShiftId: number;
  Sun: boolean;
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thu: boolean;
  Fri: boolean;
  Sat: boolean;
  StartTime: string;
  EndTime: string;
}

export interface RequestPositionDetail {
  Ukey: string;
  PositionId: number;
  ClpId: number | null;
  CandidatePoolCode: string | null;
  CandidateId: number | null;
  ContractorName: string;
  StaffingAgencyId: number | null;
  StafingAgencyName: string | null;
  SubmittedMarkup: number | null;
  MspStBillRate: number | null;
  CandidateStatusId: number;
  CandidateStatusName: string;
  StaffingAgencyStBillRate: number | null;
  TargetStartDate: string;
  TargetEndDate: string;
  BaseWageRate: number;
  ActualShiftWageRate: number;
  ShiftMultiplier: number;
}


export interface RequestDetail {
  RequestId: number;
  Ukey: string;
  RequestCode: string;
  SectorId: number;
  ReasonForRequestId: number;
  SectorName: string;
  RequestingManagerName: string;
  PrimaryTimeApproverName: string | null;
  AlternateTimeApproverName: string | null;
  Orglevel1Name: string;
  Orglevel2Name: string | null;
  Orglevel3Name: string;
  Orglevel4Name: string | null;
  WorkLocationName: string;
  LocationAddress: string;
  LaborCategoryName: string;
  JobCategoryName: string;
  ReasonForRequestName: string;
  CostAccountingCode: string;
  DefaultCostCenterDescription: string;
  Status: string;
  StatusId: number;
  PositionDescription: string;
  ManagerCommentsToStaffingAgency: string | null;
  ManagerComments: string | null;
  NoOfContractorFilled: number;
  LastTbdSequenceNo: number;
  CreatedBy: number;
  CreatedDate: string;
  LoggedInUserRoleGroupID?: string|number|null|undefined;
  RequestShiftDetailGetAllDto: RequestShiftDetail;
  RequestPositionDetailGetAllDtos: RequestPositionDetail[];
  IsReviewActionRequired: boolean;
  IsAllowedToEdit: boolean;
  IsAllowedToBroadcast: boolean;
  IsAllowedToFill: boolean;
  HourDistributionRuleName: string;
  AwaitingConfirmation: number;
  RequestingManagerId: number;
  PrimaryTimeApproverId: number | null;
  AlternateTimeApproverId: number | null;
  LaborCategoryId: number;
  JobCategoryId: number;
  OrgLevel1Id: number;
  OrgLevel2Id: number | null;
  OrgLevel3Id: number;
  OrgLevel4Id: number | null;
  WorkLocationId: number;
  ReqLibraryId: number;
  DefaultCostCenterId: number;
  PositionNeeded: number;
  StartDate: string;
  EndDate: string;
  StartDateNoLaterThan: string | null;
  EstimatedCost: number;
  IsManualBroadcast: boolean;
  IsMspProcessRequired: boolean;
  IsManualBroadcastRequired: boolean;
  HourDistributionRuleId: number;
  IsBackgrounCheckRequired: boolean;
  IsDrugTestRequired: boolean;
  ReviewerComments: string|null;
}
interface Permission {
  EntityTypeId: number;
  EntityType: string;
  ActionId: number;
  ActionName: string;
}

export interface PermissionSet {
  id: string;
  permission: Permission[];
}
export interface assignmentRoute {
  url:string;
  isAssignDetailsTabSelected:boolean
}
export interface workLocationConfiguration {
  AlternateTimeAndExpenseConfigurations: boolean;
  AutoApproveHoursAdjustmentAllowed: boolean;
  AutoBroadcastForLIRequest: boolean;
  DefaultBackGroundCheckValue: boolean;
  DefaultDrugResultValue: boolean;
  IsAltDrugandbackgConfigurations: boolean;
  IsAlternateConfigurationForMSPProcess: boolean;
  IsBackGroundCheckVisible: boolean;
  IsBackGroundItemEditable: boolean;
  IsDrugResultVisible: boolean;
  IsDrugScreenItemEditable: boolean;
  IsPositionDetailsEditable: boolean;
  LocationAddress: string;
  SkipLIRequestProcessbyMSP: boolean;
  TimeUploadAsApprovedHours: boolean;
}
interface SectorCostCenterConfig {
  Id: number;
  LocalizedKey: string;
  SegmentName: string;
  SegmentMaxLength: number;
  SegmentMinLength: number;
}

export interface CostCenterConfig {
  AddCostCenterManually: boolean;
  SectorCostCenterConfigs: SectorCostCenterConfig[];
}
export interface OrgDetail {
  Id: number;
  IsMandatory: boolean;
  IsVisible: boolean;
  LocalizedKey: string;
  OrgName: string;
  OrgType: number;
}
export interface CostAccountingCodeData {
  CostAccountingCode: string;
  Description: string;
  assignmentCostAccountingCodeId: number;
  CostAccountingCodeId: string;
  EffectiveFrom: string;
  EffectiveTo: string;
  isTempSaved?: boolean;
}
export class WorkAttributes
{
  [key: string]: boolean | number | string;
  WorkLocationId: boolean;
  LaborCategoryId: boolean;
  JobCategoryId: boolean;
  AssignmentStartDate: boolean;
  AssignmentEndDate: boolean;
  ShiftId: boolean;
  ModifyPOEndDate: boolean;
  BaseWageRate: boolean;
  ActualSTWageRate: boolean;
  OTWageRate: boolean;
  DTWageRate: boolean;
  StaffingAgencyMarkup: boolean;
  OTRateTypeId: boolean;
  STBillRate: boolean;
  OTBillRate: boolean;
  StaffingAgencySTBillRate: boolean;
  StaffingAgencyOTBillRate: boolean;
  StaffingAgencyDTBillRate: boolean;
  ModifyPObasedOnRevisedRates: boolean;
  TerminateAssignment: boolean;
  AddedToDNR: boolean;
  BackFillRequested: boolean;
  BackFillStartDate: boolean;
  BackFillEndDate: boolean;
  NotifyToStaffingAgency: boolean;
  DTBillRate: boolean;
  NewPOFundAmount: boolean;
  NewPONumber: boolean;
  PoEffectiveFromDate: boolean;
  TerminateReasonId: boolean;
  restMealBreak: boolean;
  poFundAmount:number|string;
  shiftWorkingDays: boolean;
}
export interface IFormControlValue {
  Text?: string;
  Value?: string | number;
}

export interface IPatchedFormValue {
  [key: string]: IFormControlValue | string | number | boolean | null;
}
export interface ratePayload {
  assignmentId: number|null|undefined;
  laborCategoryId: number;
  jobCategoryId: number;
  shiftId: number;
  overtimeHoursBilledAt: number;
  submittedMarkup: number;
  baseWageRate: number|null;
  actualSTWageRate: number | null;
  stBillRate: number | null;
}
export interface assignmentSchedulePayload {
  startTime: string;
  endTime: string;
  assignmentStartDate: string;
  assignmentEndDate: string;
  oldAssgnmtEndDate: string;
  shiftDays: string|null;
  StBillRate: number;
}
export interface shiftPopup {
  text: string;
  value: number;
  themeColor?: string;
}
export interface reqChanges {
  WageRate: number;
  RateUnit: number;
  RateUnitType: string;
  OvertimeHoursBilledAtId: number;
  OvertimeHoursBilledAtText: string;
}


