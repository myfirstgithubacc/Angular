import { ApiResponseBase } from "@xrm-core/models/responseTypes/api-response-base.model";
import { WeeklyHours } from "../time-entry/common-interface/weekly-hours";
import { AbstractControl } from "@angular/forms";

export interface StartPointValue {
    RouteOrigin: string;
    Action: string;
    ScreenId: number;
}

export interface WeekendingObject {
    AssignmentId: {
        Value: number;
    };
    WeekendingDate: {
        Text: string;
        Value: string;
    };
}

// expanded timesheet ----start
export interface DayWiseDetail {
    EntryType: string;
    SubmittedBy: string;
    SubmittedOn: string;
    StHours: number;
    StRates: number;
    OtHours: number;
    OtRates: number;
    DtHours: number;
    DtRates: number;
    PtHours: number;
    PtRates: number;
    TotalHours: number;
    EstimatedCost: number;
    Sequence: number;
  }

export interface SummaryDetail {
    Date: string;
    CostAccountingCodeId: number;
    CostAccountingName: string;
    ShiftId: number;
    ShiftName: string;
    HourTypeId: number;
    HourTypeName: string | null;
    DayWiseDetails: DayWiseDetail[];
}

export interface ExpandedObj {
    Index: number;
    Date: string;
    CostAccountingCodeId: number;
    CostAccountingName: string;
    ShiftName: string;
    St: number;
    Ot: number;
    Dt: number;
    Pt: number;
    TotalHours: number;
    EstimatedCost: number;
    entryTypeData: DayWiseDetail[];
}
// expanded Timesheet --end

// adjustment ukey data interface --start
export interface TimeAdjustmentDetail {
    TimeEntryId: number;
    EntryType: string;
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    PreFriday: number;
    TotalHour: number;
    InlineViewDisabled: boolean;
    ApproverName: string;
}

export interface TimeAdjustmentChargeShift {
    CostAccountingCodeId: number;
    CostAccountingName: string | null;
    ShiftId: number;
    ShiftName: string | null;
    HoursTypeId: number;
    HoursTypeName: string | null;
    JobTitle: string | null;
    StatusId: number;
    StatusName: string;
    TimeAdjustmentDetails: TimeAdjustmentDetail[];
}

export interface UkeyData {
    WeekendingDate: string;
    TimeEntryCode: string;
    UnitTypeId: number;
    UnitTypeName: string;
    TypeId: number;
    TypeName: string;
    TimeInOutDetails:EntriesArray;
    ContractorName: string;
    AssignmentId: number;
    StatusId: number;
    StatusName: string;
    TimeAdjustmentChargeShift: TimeAdjustmentChargeShift[];
    AdjustmentTypeId: number;
    AdjustmentTypeName: string;
    ContractorComment: string;
    ReviewerComment: [];
    Id: number;
    UKey: string;
    IsPendingApproval: boolean;
}


export interface InOutDetails {
    BillableHour: WeeklyHours;
    PenaltyHour: WeeklyHours;
}

// Interface for weekly hours
export interface WeeklyHoursObj {
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    PreFriday?: number;
    [key: string]: number | undefined;
}

// Interface for TotalHours
export interface TotalHours {
    BillableHour: WeeklyHours;
    PenaltyHour: WeeklyHours;
}

// Interface for each entry
interface Entry {
    EntryType: "Original" | "Adjustment";
    TotalHours: TotalHours;
}

// Array of entries
type EntriesArray = Entry[];

export interface AdjustmentObj {
    CostAccountingCodeName: string;
    ShiftName: string;
    HourType: string;
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    TotalHours: number | null;
}

export interface OriginalObj {
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    TotalHours: number | null;
}
export interface LineItemsObj {
    CostAccountingCodeName: string;
    ApproverName: string;
    ShiftName: string;
    HourType: string;
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    TotalHours: number;
}


export interface NavigationPathMap {
    addEdit: string,
	view: string,
	list: string,
	review: string
}


interface EntryWiseDetail {
    EntryType: string;
    SubmittedBy: null | string;
    SubmittedOn: null | string;
    StHours: number;
    StRates: number;
    OtHours: number;
    OtRates: number;
    DtHours: number;
    DtRates: number;
    TotalHours: number;
    EstimatedCost: number;
}

interface ExpandSheetEntry {
    Date: string;
    CostAccountingCodeId: number;
    CostAccountingName: string;
    ShiftId: number;
    ShiftName: string;
    HourTypeId: number;
    HourTypeName: string;
    DayWiseDetails: EntryWiseDetail[];
}

export type ExpandSheet = ExpandSheetEntry[];

export interface PayloadItem {
    UKey: string;
    StatusId: number;
    ApproverComment: string;
  }

export interface AdjustmentApproval {
    UKey: string | undefined | null;
    StatusId: number | undefined | null;
    approverComment: string | undefined | null;
}

export interface MealBreakPenaltyConfigurations {
    Id: number;
    MealBreakTypeId: number;
    MealBreakTypeText: string;
    MinimumHoursWorked: number;
    MandatoryBreak: number;
    RestrictWaiveOffHours: number;
  }

export interface RuleConfiguration {
        Id: number;
        Ukey: string;
        RuleCode: string;
        RuleDescription: string;
        DefaultBreakDuration: number | null;
        MealBreakPenalty: boolean;
        MealBreakPenaltyHours: number | null;
        NumberOfMealBreakText: string;
        RestBreakPenalty: boolean;
        RestBreakMinimumHours: number | null;
        RestBreakPenaltyHours: number | null;
        Disabled: boolean;
        MealBreakPenaltyConfigurations: MealBreakPenaltyConfigurations[];
        RuleName: string;
        AllowInOutTimeSheet: boolean;
        AllowInOutMealBreak: boolean;
        NumberOfMealBreak: number;
}

export interface animation{
    type: string;
    direction: string;
    duration: number;
}


// Interface for MealBreakPenaltyConfigurations, currently an empty array
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MealBreakPenaltyConfiguration {
    Id: number,
    MealBreakTypeId: number,
    MealBreakTypeText: string,
    MinimumHoursWorked:number,
    MandatoryBreak:number,
    RestrictWaiveOffHours: number
  }

// Interface for GetMealBreak data
export interface GetMealBreakData {
    Id: number;
    Ukey: string;
    RuleCode: string;
    RuleDescription: string;
    DefaultBreakDuration: number | null;
    MealBreakPenalty: boolean;
    MealBreakPenaltyHours: number | null;
    NumberOfMealBreakText: string | null;
    RestBreakPenalty: boolean;
    RestBreakMinimumHours: number | null;
    RestBreakPenaltyHours: number | null;
    Disabled: boolean;
    MealBreakPenaltyConfigurations: MealBreakPenaltyConfiguration[];
    RuleName: string;
    AllowInOutTimeSheet: boolean;
    AllowInOutMealBreak: boolean;
    NumberOfMealBreak: number | null;
  }

// Interface for GetMealBreak response
export interface GetMealBreakResponse {
    Data: GetMealBreakData;
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
  }

export interface ReviewerComment {
    ReviewedOnDate: string;
    ApproverLabel: string;
    ApproverComments: string;
  }

export interface GetTadjReviewUkeyResponse extends ApiResponseBase {
    Data: UkeyData;
  }

// Main response interface
export interface TimeAdjReviewResponse {
    getMealBreak: GetMealBreakResponse;
    getTadjReviewUkey: GetTadjReviewUkeyResponse;
  }
export interface IMealBreak {
    FirstMealBreak: string;
    IstMealTimeIn: string;
    IstMealTimeOut: string;
    TotalMinutesIstMeal: number;
  }

export interface IIndMealBreak {
    SecondMealBreak: string;
    SecondMealTimeIn: string;
    SecondMealTimeOut: string;
    TotalMinutesSecondMeal: number;
  }

export interface IIIrdMealBreak {
    ThirdMealBreak: string;
    ThirdMealTimeIn: string;
    ThirdMealTimeout: string;
    TotalMinutesThirdMeal: number;
}

export interface MealBreakGroup {
    group: {
        name: string;
        timeInKey: string;
        timeOutKey: string;
        errorMessage: string;
    };
    mealTimeInControl: AbstractControl | null;
    mealTimeOutControl: AbstractControl | null;
    startMealTimeIn: Date;
    endMealTimeOut: Date;
}

export enum MealBreakStatusEnum
{
    NotTaken = 285,

    Taken = 286,

    Partial = 287,

    Waived = 288
}

export enum MealBreakEnum
{
    First = 181,

    Second = 182,

    Third = 183,
}

export const MealBreakTypeConst = [
	{ Text: 'NotTaken', Value: MealBreakStatusEnum.NotTaken },
	{ Text: 'Taken', Value: MealBreakStatusEnum.Taken },
	{ Text: 'Partial', Value: MealBreakStatusEnum.Partial },
	{ Text: 'Waived', Value: MealBreakStatusEnum.Waived }
];

export enum MealBreakType {
    MealIn = 'MealIn',
    MealOut = 'MealOut'
}
