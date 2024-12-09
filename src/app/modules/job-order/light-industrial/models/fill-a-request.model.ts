import { FormGroup } from "@angular/forms";
import { IOnboardingPayloadData } from "@xrm-shared/common-components/onboarding-requirements/utils/onboarding-requirement.interface";

export interface CandidateInterface {
    requestUkey: string;
    candidateUkey?: string;
    candidatePoolId?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    uId: string;
    submittedMarkup: any;
    positionId: string;
    baseWageRate: number;
    dmsFieldRecords: any;
    udfFieldRecords: any;
    complianceDetails: any;
    benefitAddRecords?: any[];
    scheduleStartDate: string;
}

export interface PopupData {
    requestId: number;
    sectorId: number;
    locationId: number;
    reqLibraryId: number;
    shiftName: string;
    isBackgroundCheckSection: boolean;
    isDrugScreenSection: boolean;
    baseWageRate: number;
    positionId: any;
    uKey: string;
    requestUKey: string;
    laborCategoryId: number;
    targetStartDate: string;
    targetEndDate: string;
    startDateNoLaterThan: Date | null;
    endDate: string;
}
export interface IStaffingMarkupPayload {
    laborCategoryId: number;
    locationId: number;
}


export interface ISectorDetailForReqConfig {
    AllowSelectionPayRateFillLiRequest: boolean;
    MaskSubmittedMarkUpAndWageRate: boolean;
};

export interface IAssignmentRatePayload {
    sectorId: number;
    firstName: string;
    lastName: string;
    uId: string;
}

export interface WageRateOptionInterface {
    Text: string;
    Value: number;
}

export interface IWageRatePayload {
    requestId: number;
    positionId: number;
    baseWageRate: number;
    submittedMarkup: number;
}

interface ClpRateFormulaDefinition {
    BaseWageRate: string;
    ActualStWageRate: string;
    StBillRate: string;
    OtBillRate: string;
    DtBillRate: string;
    OtWageRate: string;
    DtWageRate: string;
    StaffingAgencyStBillRate: string;
    StaffingAgencyOtBillRate: string;
    StaffingAgencyDtBillRate: string;
}

export interface IWageRateDetails {
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
    ClpRateFormulaDefinition: ClpRateFormulaDefinition;
}


export interface IUIDConfig {
    Id: number | null;
    LabelName: string;
    ToolTip: string;
    MaxLength: number;
    IsNumeric: boolean;
    IsPartialEntry: boolean;
    RightmostChars: number | null;
}


export interface IOnboardingData {
    data: IOnboardingPayloadData[];
    formGroup: FormGroup
}

export interface ICandidateActionPayload {
    RequestId: number;
    PositionId: number;
}

export interface ICandidateFinalSubmitInterface {
    requestUkey: string;
}

export interface IContractorGridData {
    Ukey: string;
    PositionId: number;
    ClpId: number | null;
    CandidatePoolCode: string | null;
    CandidateId: number | null;
    ContractorName: string;
    StaffingAgencyId: number | null;
    StaffingAgencyName: string | null;
    SubmittedMarkup: number | null;
    MspStBillRate: number | null;
    CandidateStatusId: number;
    StaffingAgencyStBillRate: number | null;
    BaseWageRate: number;
    ActualShiftWageRate: number;
    ShiftMultiplier: number;
    TargetStartDate: string;
    TargetEndDate: string;
    endDate: Date;
    CandidateStatusName: string;
}

export interface IContractorGridDataWithAction extends IContractorGridData {
    action: IAction[];
}

interface IAction {
    icon: string;
    color: string;
    title: string;
}

export interface IActionClicked {
    action: IAction;
    data: FormGroup;
    formData: FormGroup;
    index: number;
}

export interface IToasterMessage {
    Message: string;
}
