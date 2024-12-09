import { ReviewComments } from "../../review-candidates/interface/review-candidate.interface";

export interface ISharedDataIds {
  sectorId: number,
  locationId: number,
  laborCategoryId: number,
  jobCategoryId: number,
  reqLibraryId: number,
  orgLevel1Id: number,
  orgLevel2Id?: number,
  orgLevel3Id?: number,
  orgLevel4Id?: number,
  primaryManager: number,
  reasonForRequestId: number
}

export interface IAssignmentTypeListPayload {
  secId: number,
  locId: number
}

export interface IMinimumClearanceToStartList {
  secId: number,
  isProfessional: boolean
}

export interface IRequestDetail {
  RequestId: number;
  RequestUKey: string;
  RequestCode: string;
  StatusId: number;
  StatusName: string;
  SectorId: number;
  SectorName: string;
  WorkLocationName: string;
  WorkLocationAddress: string;
  RequestingMangerName: string;
  OrgLevel1Name: string;
  OrgLevel2Name: string;
  OrgLevel3Name: string | null;
  OrgLevel4Name: string;
  CostAccountingName: string;
  DefaultCostCenterDescription: string;
  ReasonForRequestName: string;
  WorkLocationId: number;
  RequestingManagerId: number;
  OrgLevel1Id: number;
  OrgLevel2Id: number;
  OrgLevel3Id: number | null;
  OrgLevel4Id: number;
  CostAccountingId: number;
  ReasonForRequestId: number;
  SubmittalAllowedPerStaffing: number;
  SubmittalAllowedForThisRequest: number;
  IsAllowStaffingToContact: boolean;
  IsPreIdentifiedRequest: boolean;
}

export interface IPositionDetail {
  LaborCategoryName: string;
  JobCategoryName: string;
  AssignmentTypeName: string;
  SecurityClearanceName: string;
  MinimumClearanceToStartName: string;
  PositionTitle: string;
  LaborCategoryId: number;
  JobCategoryId: number;
  ReqLibraryId: number;
  AssignmentTypeId: number;
  SecurityClearanceId: number;
  MinimumClearanceToStartId: number;
}

export interface IProfPsrCandidateDetails {
  LastName: string;
  FirstName: string;
  MiddleName: string;
  FullName: string
  Email: string;
  PhoneNumber: string;
  PhoneExt: string;
}

export interface IAssignmentRequirement {
  TargetStartDate: string;
  TargetEndDate: string;
  PositionNeeded: number;
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

export interface IShiftRequirement {
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

export interface IProfRequestAssignment {
  AssignmentRequirement: IAssignmentRequirement;
  ShiftRequirement: IShiftRequirement;
}

export interface IProfRequestFinancial {
  RateUniteName?: string;
  HourDistributionRuleName: string;
  OthersBilledAtName: string;
  BaseWageRate: number;
  RateUnitId: number;
  NteBillRate: number;
  NewNteBillRate: number;
  DeltaCost: number;
  ReasonForException: string;
  HourDistributionRuleId: number;
  EstimatedRegularHoursPerWeek: number;
  IsOtExpected: boolean;
  OthoursBilledAt: number;
  EstimatedOtHoursPerWeek: number;
  BudgetedHours: number;
  EstimatedCost: number;
}

export interface IRequestComment {
  ClientComments: string;
  ClientCommentsToStaffingAgency: string;
}

export interface IDocumentAddDto {
  DocumentConfigurationId: number;
  FileName: string;
  FileExtension: string;
  FileNameWithExtension: string;
  EncryptedFileName: string;
  FileSize: number;
  ContentType: string | null;
  File: string | null;
  FileData: string | null;
  ChunkNumber: number;
  TotalChunks: number;
  DocumentProcessingType: number;
}

export interface IDmsFieldRecord {
  Id: number;
  StatusId: number;
  DocumentAddDto: IDocumentAddDto;
}

export interface IUdfFieldRecord {
  UdfId: number;
  XrmEntityId: number;
  RecordId: number;
  RecordUKey: string;
  UdfConfigId: number;
  UdfTextValue: string;
  UdfIntegerValue: number | null;
  UdfNumericValue: number | null;
  UdfDateValue: string | null;
}

export interface IApprovalItem {
  Text: string;
  Value: string;
  TextLocalizedKey: string | null;
  IsSelected: boolean;
}

export interface IApprovalDetail {
  TransactionId: number;
  TransactionDetailId: number;
  ApprovalConfigId: number;
  ApprovalConfigDetailId: number;
  ApproverTypeId: number;
  ApproverLabel: string;
  ApproverLevel: number;
  SubApproverLevel: number;
  Items: IApprovalItem[];
}

export interface IProfRequestOtherDetail {
  RequestComment: IRequestComment;
  DmsFieldRecords: IDmsFieldRecord[];
  UdfFieldRecords: IUdfFieldRecord[];
  ApprovalDetails: IApprovalDetail[];
}

export interface IProfRequest {
  RequestDetail: IRequestDetail;
  PositionDetail: IPositionDetail;
  ProfPsrCandidateDetails: IProfPsrCandidateDetails;
}

export interface IProfRequestData {
  ProfRequest: IProfRequest;
  ProfRequestAssignment: IProfRequestAssignment;
  ProfRequestFinancial: IProfRequestFinancial;
  ProfRequestComment: IRequestComment;
  ReviewerComments: ReviewComments[];
};

export interface IRequestLibraryItemResponse {
  Count: number;
  Data: IRequestLibraryDetails[];
}

export interface IRequestLibraryDetails {
  ReqLibId: number;
  ReqLibCode: string;
  SectorId: number;
  SectorName: string;
  LocationId: number;
  LocationName: string;
  LaborCategoryId: number;
  LaborCategoryName: string;
  JobCategoryId: number;
  JobCategoryName: string;
  BillRate: number | null;
  PositionDescription: string;
  SkillRequired: string;
  ExperienceRequired: string;
  WageRate: number;
  RateUnit: number;
}

export interface IPreviousProfItemResponse extends IPreviousProfItem {
  Count: number;
  Data: IPreviousProfItem[];
}

export interface IPreviousProfItem {
  AssignmentRequirement: IAssignmentRequirement
  PositionDetail: IPositionDetail
  ProfRequestFinancial: IProfRequestFinancial
  RequestComment: IRequestComment
  RequestDetail: IRequestDetail
  ShiftRequirement: IShiftRequirement
}

export type ILoadMoreDataSourceItem = IPreviousProfItemResponse | IRequestLibraryItemResponse;

export interface ILaborCategoryDetails {
  MaxSubmittalsTotalPerPosition: number;
  MaxSubmittalsPerStaffingAgency: number;
  CostEstimationTypeId: number;
  CostEstimationTypeName: string;
  PricingModelId: number;
  PricingModelName: string;
  BillRateValidationId: number;
}

export interface IJobCategoryDetails {
  OTHoursBilledAtId: number;
  OTHoursBilledAtName: string;
  IsWageRateAdjustment: boolean;
}

interface IFilterValue {
  CostAccountingCode: string[];
  CreatedBy: string[];
  CreatedOn: (string | null)[];
  Currency: string[];
  CutOffDate: string[];
  FilledRequested: string[];
  JobCategoryName: string[];
  LaborCategoryName: string[];
  NteBillRate: string[];
  Orglevel1Name: string[];
  Orglevel2Name: string[];
  Orglevel3Name: string[];
  Orglevel4Name: string[];
  PositionTitle: string[];
  RequestCode: string[];
  RequestDate: (string | null)[];
  RequestingManagerName: string[];
  SectorName: string[];
  ShiftName: string[];
  Status: string[];
  Submittals: string[];
  WorkLocationName: string[];
}

export interface IFilterControlData {
  controlType: string;
  value?: IFilterValue;
}

export interface IRequestUkeyData {
  RequestId: number,
  Ukey: string,
  RequestCode: string,
  RequestDate: string,
  RequestingManagerName: string,
  PositionTitle: string,
  WorkLocationName: string,
  LaborCategoryName: string,
  Orglevel1Name: string,
  JobCategoryName: string,
  StatusId: number,
  Status: string,
  SectorName: string,
  ShiftName: string,
  CutOffDate: string | null,
  FilledRequested: string,
  Submittals: number,
  CostAccountingCode: string,
  Orglevel2Name: string | null,
  Orglevel3Name: string | null,
  Orglevel4Name: string | null,
  NteBillRate: number,
  Currency: string,
  CreatedBy: string,
  CreatedOn: string
}

export interface IProfReqSuccessResponse {
  Id: number;
  Ukey: string;
  RequestCode: string;
  LastActionStatusId: number;
}

interface IShiftWeekDaysParamDto {
  WeekDays: boolean[];
  ShiftDifferentialMethod: string;
  AdderOrMultiplierValue: number;
  startTime: string | null;
  endTime: string | null;
}

export interface IEstimationPayload {
  StartDate: string;
  EndDate: string;
  BenefitAdderTotalAmount: number;
  ActualShiftWageRate: number;
  ShiftWeekDaysParamDto: IShiftWeekDaysParamDto;
  BillRate: number;
  WageRate: number;
  Positions: string;
  EstimatedRegularHours: number;
  EstimatedOTHours: number;
  OTMultiplier: number;
  RateUnit: string;
  OtRateType: string;
  OtHoursBilledAt: number;
  CalculationType: string;
  OtHoursAllowed: string
}

export interface IHdrDetail {
  RegularStHoursPerWeek: number | null;
  MaxStHourAllowed: number | null;
  MaxOtHourAllowed: number | null;
  MaxDtHourAllowed: number | null;
  MaxTotalHourAllowed: number;
  ManualOtDt: number | null;
  ManualOtDtEntry: boolean;
}

export interface IApprovePayload {
  recordId: number;
  entityId: number;
  approverComment: string
}

export interface IAcknowledgeByMSP {
  XrmEntityId: number;
  RecordId: number;
  CurrentStatusId: number;
}

export type IFieldOnChange = {
  location: {
    isShiftReset: boolean;
    isHDRReset: boolean;
    isBillRateReset: boolean;
  };
  reqManager: {
    isApproverReset: boolean;
  };
  org1: {
    isApproverReset: boolean;
  };
  labourCategory: {
    billRate: boolean;
    estimatedCost: boolean;
  };
  jobCategory: {
    description: boolean;
    isWageReset: boolean;
    isBillReset: boolean;
  };
  shift: {
    isBillRateReset: boolean;
    estimatedCost: boolean;
  };
};

export interface IPermissionsForProfessional {
  IsReviewActionRequired: boolean;
  IsAllowedToEdit: boolean;
  IsAllowedToBroadcast: boolean;
  IsAllowedToFill: boolean;
}
