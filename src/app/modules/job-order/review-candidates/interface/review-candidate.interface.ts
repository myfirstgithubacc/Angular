
export interface ISelectCandidate {
  CandidateUkey: string;
  Comment: string;
}

export interface IDeclineCandidate {
  CandidateUkey: string;
  DeclineReasonId: number;
  DeclineComment: string;
}

export interface ICandidate {
  ActualShiftWageRate: number;
  CandidateCode: string;
  CandidateId: number;
  CandidateName: string;
  CandidateUkey: string;
  CurrencyCode: string;
  IsReviewed: boolean;
  JobCategoryName: string;
  MspStBillRate: number;
  OrgLevel1Name: string;
  OrgLevel2Name: string | null;
  OrgLevel3Name: string | null;
  OrgLevel4Name: string | null;
  RequestCode: string;
  ReviewedByName: string;
  ReviewedOn: string;
  SectorName: string;
  ShiftName: string;
  StaffingAgencyName: string | null;
  Status: string;
  StatusId: number;
  SubmittedOn: string;
  WorkLocationName: string;
}

export interface ICandidateLiRequestDetailsGetDto {
  RequestCode: string;
  SectorId: number;
  SectorName: string;
  Orglevel1Name: string;
  Orglevel2Name: string | null;
  Orglevel3Name: string | null;
  Orglevel4Name: string | null;
  RequestingManagerName: string;
  WorkLocationId: number;
  WorkLocationName: string;
  LocationAddress: string;
  LaborCategoryName: string;
  JobCategoryName: string;
  ReasonForRequestName: string;
  CostAccountingCode: string;
  DefaultCostCenterDescription: string;
  StartDate: string;
  EndDate: string;
  PositionDescription: string;
  IsBackgrounCheckRequired: boolean;
  IsDrugTestRequired: boolean;
  RateUnitId: number;
  RateUnitName: string;
}

export interface ILiRequestShiftGetAllDto {
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

export interface ICandidateData {
  RequestId: number;
  UKey: string;
  CandidateId: number;
  CandidateCode: string;
  StatusId: number;
  Status: string;
  CandidatePoolCode: string;
  FullName: string;
  StaffingAgencyId: number;
  PhoneNumber: string | null;
  BidRate: number;
  BaseWageRate: number;
  ActualShiftWageRate: number;
  OtWageRate: number;
  DtWageRate: number;
  MspStBillRate: number;
  MspOtBillRate: number;
  MspDtBillRate: number;
  VendorStRate: number;
  VendorOtRate: number;
  VendorDtRate: number;
  NteRate: number;
  CandidateDeclineReasonId: number | null;
  DeclineReason: string;
  Comment: string | null;
  IsAllowedToReview: boolean;
  candidateLiRequestDetailsGetDto: ICandidateLiRequestDetailsGetDto;
  liRequestShiftGetAllDto: ILiRequestShiftGetAllDto;
  CandidatePoolId: number;
  FirstName: string;
  MiddleName: string | null;
  LastName: string;
  UId: string;
  SubmittedMarkup: number;
  ScheduleStartDate: string;
  ReviewerComments: [{
    ReviewedOnDate: string;
    ApproverLabel: string;
    ApproverComments: string;
  }];
}

export interface ReviewComments {
  ReviewedOnDate: string;
  ApproverLabel: string;
  ApproverComments: string;
}
