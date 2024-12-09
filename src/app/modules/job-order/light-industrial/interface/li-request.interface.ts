import { FormGroup } from "@angular/forms";
import { IBenefitData } from "@xrm-shared/common-components/benefit-adder/benefit-adder.interface";
import { DMSApiRequestPayload } from "@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";
import { IPermissionInfo } from "@xrm-shared/models/common.model";
import { IDayInfo, ISelectedTime } from "@xrm-shared/Utilities/dayinfo.interface";
import { ReviewComments } from "../../review-candidates/interface/review-candidate.interface";
import { IBroadcastComments } from "./broadcast.interface";

type NullableNumber = number | null;

export interface IPreviousRequestItemResponse extends IPreviousRequestItem {
    Count: number;
    Data: IPreviousRequestItem[];
}
export interface IPreviousRequestItem {
    RequestId: number;
    RequestCode: string;
    SectorId: number;
    SectorName: string;
    WorkLocationId: number;
    LocationName: string;
    LaborCategoryId: number;
    LaborCategory: string;
    JobCategoryId: number;
    JobCategory: string;
    DefaultCostCenterId: number;
    CostAccountingCode: string;
    RequestingManagerId: number;
    RequestingManagerName: string;
    PrimaryTimeApproverId: number | null;
    PrimaryTimeApproverName: string | null;
    AlternateTimeApproverId: number | null;
    AlternateTimeApproverName: string | null;
    OrgLevel1Id: number;
    OrgLevel1Name: string;
    OrgLevel2Id: number | null;
    OrgLevel2Name: string | null;
    OrgLevel3Id: number | null;
    OrgLevel3Name: string | null;
    OrgLevel4Id: number | null;
    OrgLevel4Name: string | null;
    ReqLibraryId: number;
    ReasonForRequestId: number;
    ReasonForRequestName: string;
    PositionDescription: string;
    ClientComments: string | null;
    ClientCommentsToStaffingAgency: string | null;
    HourDistributionRuleName: string;
    HourDistributionRuleId: number;
    RequestShiftDetailGetAllDto: ShiftDetail;
}

export interface ShiftDetail {
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

export interface RequestShiftDetailGetAllDto {
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
    ShiftDifferentialMethod: string;
    AdderOrMultiplierValue: number;
}

export interface RequestPositionDetailGetAllDto {
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

export interface RequestDetails {
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
    Orglevel3Name: string | null;
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
    ManagerComments: string;
    NoOfContractorFilled: number;
    LastTbdSequenceNo: number;
    CreatedBy: number;
    CreatedDate: string;
    RequestShiftDetailGetAllDto: RequestShiftDetailGetAllDto;
    RequestPositionDetailGetAllDtos: RequestPositionDetailGetAllDto[];
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
    OrgLevel3Id: number | null;
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
    ReviewerComments: ReviewComments[];
    RequestBroadcastCommentDto: IBroadcastComments[];
}

export interface RequestPositionDetailsItem {
    targetStartDate: string;
    targetEndDate: string;
    baseWageRate: number;
    actualShiftWageRate: number;
    shiftMultiplier: number;
    noOfContractors?: number;
    positionId?: number;
    IsFilled?: boolean;
}

export interface OrgTypeData {
    OrgName: string;
    IsMandatory: boolean;
    IsVisible: boolean;
}

export interface TimeRange {
    labelLocalizeParam1: any[];
    labelLocalizeParam2: any[];
    label1: string;
    label2: string;
    DefaultInterval: number;
    AllowAI: boolean;
    startisRequired: boolean;
    endisRequired: boolean;
    starttooltipVisible: boolean;
    starttooltipTitle: string;
    starttooltipPosition: string;
    starttooltipTitleLocalizeParam: any[];
    startlabelLocalizeParam: any[];
    startisHtmlContent: boolean;
    endtooltipVisible: boolean;
    endtooltipTitle: string;
    endtooltipPosition: string;
    endtooltipTitleLocalizeParam: any[];
    endlabelLocalizeParam: any[];
    endisHtmlContent: boolean;
}

export interface ICostAccountingCodeDetails {
    UKey: string;
    Id: number;
    SectorId: number;
    SectorName: string;
    CostAccountingName: string;
    CostCode: string;
    EffectiveStartDate: string;
    EffectiveEndDate: string;
    Description: string;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string;
    LastModifiedOn: string;
    Disabled: boolean;
}

export interface IReqLibraryDetailsPayload {
    secId: number;
    locId: number;
    laborCatId: number;
    jobCatId: number;
}
export interface IReqLibraryDetailsWithIdPayload extends IReqLibraryDetailsPayload {
    reqLibId: number;
}

export interface IReqLibraryDetails {
    Id: number;
    WageRate: number;
    RateUnitCode: number;
    RateTypeCode: number;
    PositionDesc: string;
    SkillRequired: string;
    ExperienceRequired: string;
    EducationRequired: string;
    BillRate: number | null;
    RateUnitName: string;
}

// payload for create request
export type ILiRequestPayload = ILiRequestAddPayload | ILiRequestUpdatePayload;

export interface ILiRequestAddPayload {
    sectorId: number;
    requestingManagerId: number;
    primaryTimeApproverId: NullableNumber;
    alternateTimeApproverId: NullableNumber;
    orgLevel1Id: NullableNumber;
    orgLevel2Id: NullableNumber;
    orgLevel3Id: NullableNumber;
    orgLevel4Id: NullableNumber;
    managerLocationId: number;
    workLocationId: number;
    hourDistributionRuleId: number;
    laborCategoryId: number;
    jobCategoryId: number;
    reasonForRequestId: number;
    reqLibraryId: NullableNumber;
    defaultCostCenterId: number;
    StartDate: string;
    startDateNoLaterThan: string;
    EndDate: string;
    positionNeeded: number;
    estimatedCost: number;
    isMspProcessRequired: boolean;
    isManualBroadcastRequired: boolean;
    isManualBroadcast: boolean;
    isDrugTestRequired: boolean;
    isBackgrounCheckRequired: boolean;
    requestShiftDetailAddDto: IRequestShiftDetailDtoPayload | null;
    udfFieldRecords: IPreparedUdfPayloadData[];
    dmsFieldRecords: DMSApiRequestPayload[]
    requestAdditionalDetailAddDto: IRequestAdditionalDetail;
    approvalDetails: any;
    requestPositionDetailAddDtos: IRequestPositionDetail[];
    benefitAddDto: BenefitAddUpdateDto[];
}

export interface ILiRequestUpdatePayload {
    requestingManagerId: number;
    primaryTimeApproverId: NullableNumber;
    alternateTimeApproverId: NullableNumber;
    orgLevel1Id: NullableNumber;
    orgLevel2Id: NullableNumber;
    orgLevel3Id: NullableNumber;
    orgLevel4Id: NullableNumber;
    managerLocationId: number;
    workLocationId: number;
    hourDistributionRuleId: number;
    laborCategoryId: number;
    jobCategoryId: number;
    reqLibraryId: NullableNumber;
    defaultCostCenterId: number;
    StartDate: string;
    startDateNoLaterThan: string;
    EndDate: string;
    positionNeeded: number;
    estimatedCost: number;
    isMspProcessRequired: boolean;
    isManualBroadcastRequired: boolean;
    isManualBroadcast: boolean;
    isDrugTestRequired: boolean;
    isBackgrounCheckRequired: boolean;
    requestShiftDetailUpdateDto: IRequestShiftDetailDtoPayload | null;
    udfFieldRecords: IPreparedUdfPayloadData[];
    dmsFieldRecords: DMSApiRequestPayload[];
    requestAdditionalDetailUpdateDto: IRequestAdditionalDetail;
    approvalDetails: any;
    requestPositionDetailUpdateDtos: IRequestPositionDetail[];
    benefitUpdateDto: BenefitAddUpdateDto[];
    UKey: string;
}

export interface ILiRequestSucessResponse {
    Id: number;
    Ukey: string;
    RequestCode: string;
    LastActionStatusId: number;
}

export interface BenefitAddUpdateDto {
    ReqLibraryBenefitAdderId: number;
    Value: number;
}

// contractor details
export interface IRequestPositionDetail {
    targetStartDate: string;
    targetEndDate: string;
    baseWageRate: number;
    actualShiftWageRate: number;
    shiftMultiplier: number | null | undefined;
    noOfContractors?: number;
    positionId?: number;
    IsFilled?: boolean;
}

export interface IPositionGridData {
    contractorsControl: number;
    startDateControl: string;
    endDateControl: string;
    baseWage: number;
    actualWage: number;
    netEstimatedCost: number;
    positionId: number;
    clpId: number | null;
    contractorName: string | null;
    stafingAgencyName: string | null;
    submittedMarkup: number | null;
    mspStBillRate: number | null;
    shiftMultiplier: number | null;
    candidatePoolId?: number | null;
    StaffingAgencyStBillRate?: number | null;
}

export interface IPositionGridDataForm {
    gridData: IPositionGridData[]
}

export interface IDatePlaceholderFormat {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
}

export type IChangeFieldsValues = Date | number | boolean | boolean[] | string | ShiftDetails | IBenefitData[] | RequestPositionDetailGetAllDto[];


export interface SectorOrgLevelConfigDto {
    Id: number;
    LocalizedKey: string;
    OrgName: string;
    OrgType: number;
    IsMandatory: boolean;
    IsVisible: boolean;
}
export interface SectorDetails {
    TimeUploadAsApprovedHours: boolean;
    SkipLIRequestProcessByMsp: boolean;
    AutoBroadcastForLiRequest: boolean;
    InitialGoLiveDate: string;
    CostAccountingCodeHaveSpecificApprovers: boolean;
    TenurePolicyApplicable: boolean;
    TenureLimitType: number | null;
    RequisitionTenureLimit: number;
    SectorOrgLevelConfigDtos: SectorOrgLevelConfigDto[];
    IsDrugResultVisible: boolean;
    IsDrugScreenItemEditable: boolean;
    DefaultDrugResultValue: boolean;
    IsBackGroundCheckVisible: boolean;
    IsBackGroundItemEditable: boolean;
    DefaultBackGroundCheckValue: boolean;
    IsChargeHasEffectiveDate: boolean;
    IsChargeInReqPsr: boolean;
    DisplayCanSupplierContactQusInReq: boolean;
    IsSecurityClearance: boolean;
    MaskOtFieldsInSystem: boolean;
    MaskSubmittedMarkUpAndWageRate: boolean;
}


export interface LocationDetails {
    LocationAddress: string;
    AlternateTimeAndExpenseConfigurations: boolean;
    TimeUploadAsApprovedHours: boolean;
    AutoApproveHoursAdjustmentAllowed: boolean;
    IsAlternateConfigurationForMSPProcess: boolean;
    SkipLIRequestProcessbyMSP: boolean;
    AutoBroadcastForLIRequest: boolean;
    IsAltDrugandbackgConfigurations: boolean;
    IsDrugResultVisible: boolean;
    IsDrugScreenItemEditable: boolean;
    DefaultDrugResultValue: boolean;
    IsBackGroundCheckVisible: boolean;
    IsBackGroundItemEditable: boolean;
    DefaultBackGroundCheckValue: boolean;
}


export interface ShiftDetails {
    StartTime: string;
    EndTime: string;
    Sun: boolean;
    Mon: boolean;
    Tue: boolean;
    Wed: boolean;
    Thu: boolean;
    Fri: boolean;
    Sat: boolean;
    ShiftDifferentialMethod: string;
    AdderOrMultiplierValue: number;
    ShiftId?: number;
}

interface IRequestShiftDetailDtoPayload {
    startTime: string;
    endTime: string;
    sun: boolean;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    shiftId: number;
}

export interface IUdfData {
    data: IPreparedUdfPayloadData[];
    formGroup: FormGroup
}

export interface IPreviousLiRequestPayload {
    pageSize: number;
    startIndex: number;
    smartSearchText: string;
    xrmEntityId: number;
}


export interface DropdownItem {
    Text: string;
    Value: string;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
}

interface ResponseBase {
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
}

interface DropdownResponse extends ResponseBase {
    Data?: DropdownItem[];
}

interface SectorDetailResponse extends ResponseBase {
    Data?: SectorDetails;
}

export interface ISectorDetailsAggrLocOrgDropdown {
    ddlOrg4Sector: DropdownResponse;
    ddlOrg3Sector: DropdownResponse;
    ddlOrg2Sector: DropdownResponse;
    ddlOrg1Sector: DropdownResponse;
    ddlLocation: DropdownResponse;
    ddlsectordetail: SectorDetailResponse;
}


export interface IUserDetails {
    UserId: number;
    PrimarySectorId: number;
    PrimaryOrgLevels1Id: number;
    PrimaryOrgLevels2Id: number;
    PrimaryOrgLevels3Id: number;
    PrimaryOrgLevels4Id: number;
    PrimaryLocationId: number;
    DefaultCostAccountingsCode: number;
    DataAccessRight: any | null;

    ReasonForRequestId: number;
    HourDistributionRuleId: number;
    RequestShiftDetailGetAllDto: ShiftDetails;
}

export interface IShiftListPayload {
    sectorId: number,
    recordId?: number | null,
    locationId: number | null
}
export interface IShiftListWithIdPayload {
    secId: number,
    shiftId: number
    locId: number
}


export interface IJobCategoryListPayload {
    locId: number,
    laborCatId: number;
}
export interface IJobCategoryListWithIdPayload extends IJobCategoryListPayload {
    jobCatId: number
}

export interface ILabourCategoryListPayload {
    secId: number,
    laborCatTypeId: number
}

export interface ILaborCategoryDetails {
    MaxSubmittalsTotalPerPosition: number;
    MaxSubmittalsPerStaffingAgency: number;
    CostEstimationTypeId: number;
    CostEstimationTypeName: string;
    PricingModelId: number;
    PricingModelName: string;
    BillRateValidationId: number;
  }

export interface ILabourCategoryListWithIdPayload extends ILabourCategoryListPayload {
    laborCatId: number
}

export interface ICostAccountingListWithIdPayload {
    secId: number,
    startDate: number,
    defaultCostCenterId?: number,
}
export interface ICostAccountingFuncParams {
    sectorId: number;
    costAccountingId: number;
    startDate: string;
}

export interface IBroadcastActionPermission {
    permission: IPermissionInfo[];
}

export interface IWeekData {
    day: IDayInfo[],
    time: ISelectedTime
}

export interface IApprovalConfigWidget {
    actionId: number;
    entityId: number;
    estimatedcost: number;
    sectorId: number;
    locationId: number;
    orgLevel1Id: number;
    laborCategoryId: number;
    reasonsForRequestId: number;
    nextLevelManagerId: number;
}

export interface IApprovalConfigWidgetPayload {
    approvalForm: FormGroup,
    data: IApprovalDetailData[]
}

export interface IApprovalDetailData {
    TransactionId: number;
    TransactionDetailId: number;
    ApprovalConfigId: number;
    ApprovalConfigDetailId: number;
    ApproverTypeId: number;
    ApproverLabel: string;
    ApproverLevel: number;
    SubApproverLevel: number;
    Items: DropdownItem[];
}

export interface IRequestAdditionalDetail {
    positionDescription: string;
    clientComments: string;
    clientCommentsToStaffingAgency: string;
}

export interface IStaffingAgencyGetPayload {
    secId: number;
    locid: number;
    laborcatid: number;
}

export interface IDialogButton {
    reasonValue: string;
    text: string;
    themeColor: string;
    value: number;
}

export interface INavigationPaths {
    globalPath: string;
    addEdit: string;
    view: string;
    list: string;
    review: string;
    broadcast: string;
    fillrequest: string;
}

export interface IApproveRequestResponse{
    Id: number;
    Ukey: string | null;
    RequestCode: string;
    LastActionStatusId: number;
}
