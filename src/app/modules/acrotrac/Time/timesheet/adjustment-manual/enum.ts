/* eslint-disable one-var */
import { AssignmentDetailsData } from "@xrm-core/models/acrotrac/expense-entry/add-edit/assignment-details";
import { TimeEntryDetailGrid } from "@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid";
import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { FormControl } from "@angular/forms";
import { ApiResponseBase } from "@xrm-core/models/responseTypes/api-response-base.model";
import { WeeklyHours } from "@xrm-core/models/acrotrac/time-entry/common-interface/weekly-hours";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { WeeklyHoursObj } from "@xrm-core/models/acrotrac/time-adjustment/adjustment-interface";

export const timeAdjustConst = {
	timeUkey: '/time-ukey',
	adjustUkey: '/time/get-tadj-meal',
	timeAdj: 'Time Adjustment',
	declined: 'Declined',
	Adjustment: 'Adjustment',
	ST: 'ST',
	OT: 'OT',
	DT: 'DT',
	Declined: 210,
	Submitted: 211,
	ReSubmitted: 212,
	PartiallyApproved: 213,
	Approved: 214,
	Posted: 215,
	Invoiced: 216,
	PartiallyInvoiced: 217,
	Paid: 218,
	PartiallyPaid: 219

};

// eslint-disable-next-line one-var
export const TimeAdjustmentStatus = {
	Draft: 'Draft',
	Declined: 'Declined',
	ResUbmit: 'Re-Submitted',
	PartiallyAppproved: 'Partially Approved',
	Submitted: 'Submitted'

};

export interface NavigationState {
	type: string;
	navigationId: number;
	status:string
}

export interface ReviewerComment {
		"ReviewedOnDate": string,
		"ApproverLabel": string,
		"ApproverComments": string

}

export interface AssignmentMoreDetails {
	ContractorName: string;
	AssignmentCode: string;
	SectorId: number;
	OtEligibility: boolean;
	WorkLocationId: number;
	WeekDayName: string;
	MaxHoursAllowed: string;
  }

export class ValidateExpandData extends ToJson{
	"AssignmentId": number;
	"TimeAdjustmentDetails": TimeSheetData[];
	"penaltyHourDetails": WeeklyHoursObj;

	constructor(init?: Partial<ValidateExpandData>) {
		super();
		Object.assign(this, init);
	}
}


export type FormItem = Record<string, number>;

export interface TimeAdjData {
	AssignmentId: number;
	InOutDetails:InOutDetails;
	ContractorComment: string;
	ContractorName: string;
	AdjustmentTypeId:string;
	Id: number;
	ReviewerComment: string;
	StatusId: number;
	StatusName: string;
	TimeEntryCode: string;
	TimeEntryDetails: TimeEntryDetailGrid[];
	UKey: string;
	UnitTypeId: number;
	UnitTypeName: string;
	WeekendingDate: string;
	TimeInOutDetails: MealBreak[];
  }

export interface AssignmentDetails {
		"AssignmentHdrId": number,
		"AssignmentMealBreakId": number,
		"AssignmentStartDate": Date,
		"AssignmentEndDate": Date,
		"NonScheduledDates": [],
		"IsHolidayTimeEntryAllowed": boolean,
		"HolidayDates": [],
		"HourDistributionRuleId": number,
		"HourDistributionRuleName": string,
		"RestMealBreakRuleName": string,
		"RestMealBreakRuleId": number,
		"ManualOtDtEntry": boolean,
		"PreDefinedWorkScheduleId": number,
		"IsPreviousTimeSheetAvailable": boolean,
		"IsOtEligible": boolean,
		"WeekOneDate": Date,
		"CostAccountingDetails": CostAccounting[]
  }

export interface CostAccounting {
		"CostAccountingCodeId": number,
		"HasChargeEffectiveDate": boolean,
		"EffectiveStartDate": string,
		"EffectiveEndDate": string
  }

export interface HeaderData {
    AssignmentCode: number;
    ContractorName: string;
}

export interface StatusCardItem {
    title?: string;
    item?: number | string;
	cssClass?: string[];
	isLinkable?: boolean;
	linkParams?: string;
}
export interface ApiResponse {
	Data?: TimeAdjData;
	Message: string;
	StatusCode: number;
	Succeeded: boolean;
  }

export interface DuplicateLineArgs {
 CostAccountingCodeName?: string | null;
  ShiftName?: string | null;
  HoursTypeName?: string | null;
	// Add more properties if needed
  }

export interface DayWiseDetail {
    EntryType: string;
    SubmittedBy: string | null;
    SubmittedOn: string | null;
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
}

export interface ExpandedTimeSheetObj {
    Date: string;
    CostAccountingCodeId: number;
    CostAccountingName: string;
    ShiftId: number;
    ShiftName: string;
    HourTypeId: number;
    HourTypeName: string | null;
    DayWiseDetails: DayWiseDetail[];
	entryTypeData?:[]
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
    TotalHours: number;
    EstimatedCost: number;
    entryTypeData: DayWiseDetail[];
}

export interface TimeSheetData {
				"id": number,
				"costAccountingCodeId": number,
				"shiftId": number,
				"jobTitle": string,
				"statusId": number,
				"sunday": number,
				"monday": number,
				"tuesday":number,
				"wednesday": number,
				"thursday": number,
				"friday": number,
				"saturday": number,
				"preFriday": null,
				"hoursTypeId": number
}
export interface Dropdown {
    Value: number;
    Text: string;
}

export type DayHours = Record<string, number>;


export interface CostAccObj {
    Data: CostAccounting[];
}


export interface HdrMaxHoursData {
	MaxHoursData: string | number;
  }

export interface expandedTimeSheetData {
			ukey: string,
			WeekendingDate: string,
			AssignmentId: number,
			TimeAdjustmentDetails:[]
  }

export interface convertApprovalObjData {
	ukey: string,
	WeekendingDate: string,
	AssignmentId: number,
	TimeAdjustmentDetails: TimeEntryDetailGrid[] | [],
	penaltyHourDetails: WeeklyHoursObj;
}

export interface AdjPayload {
	ukey: string;
    AdjustmentType: string;
    AssignmentId: string|number;
    ContractorComments: string;
    EntrySourceId: number;
    StatusId: number;
    TimeAdjustmentDetails: TimeAdjDetail[];
    TimeOrAdjustmentEntryId: number | null;
    UnitTypeId: number;
    WeekendingDate: string;
}


export interface TimeAdjDetail {
    ApproverName: string | null;
    CostAccountingCodeId: number;
    CostAccountingCodeName: string;
    Friday: number;
    HoursTypeId: number;
    HoursTypeName: string;
    Id: number;
    InlineViewDisabled: boolean;
    JobTitle: string;
    Monday: number;
    PreFriday: number;
    Saturday: number;
    ShiftId: number;
    ShiftName: string;
    StatusId: number;
    StatusName: string;
    Sunday: number;
    Thursday: number;
    TotalHour: number;
    Tuesday: number;
    Wednesday: number;
}

export interface TimeEntrySelectionData {
    AssignmentDetails: AssignmentDetailsData
    WeekendingDate: string;
}
export interface HourDetails {
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    PreFriday: number;
}

export interface InOutDetails {
    BillableHour: WeeklyHours;
    PenaltyHour: WeeklyHours;
}

export type FormObject = Record<string, FormControl>;

export interface MealBreakDetail {
	MealBreakTypeId: string| number |null;
	MealBreakTime: number;
	MealIn: any ;
	MealOut: any;
	Id:number;
	MealBreakId:number;
	MealSwitch?:boolean;
	 }

export interface MealBreak {
	Id:number;
	IsMealOrRestBreakAllowed: boolean;
	DefaultDurationTime: number | null;
	IsMealBreakPenalty: boolean;
	MealBreakDetails: MealBreakDetail[];
	EntryDate: string;
	EntryTimeIn:any;
	EntryTimeOut: any;
	IsRestBreakUsed: boolean;
	IsMealBreakUsed: boolean;
	TotalBillableHours: number;
	TotalMealBreakHours: number;
	PenaltyHours: number;
  }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MealBreakPenaltyConfig {
	 "Id": number,
    "MealBreakTypeId": number,
    "MealBreakTypeText": string,
    "MinimumHoursWorked":number,
    "MandatoryBreak":number,
    "RestrictWaiveOffHours": number
  }

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
	MealBreakPenaltyConfigurations: MealBreakPenaltyConfig[];
	RuleName: string;
	AllowInOutTimeSheet: boolean;
	AllowInOutMealBreak: boolean;
	NumberOfMealBreak: number | null;
  }

export interface GetMealBreakResponse extends ApiResponseBase{
	Data: GetMealBreakData;
  }


export interface GetTadjUkeyResponse extends ApiResponseBase{
	Data: TimeAdjData;
  }

export class TimeAdjResponse {
	getMealBreak: GetMealBreakResponse;
	getTadjUkey: GetTadjUkeyResponse;
}

export interface DayData {
	Id:number,
	EntryDate: string,
	EntryTimeIn: Date| string| null,
	EntryTimeOut:Date | string | null,
	IsRestBreakUsed: boolean,
    IsMealBreakUsed: boolean,
	TotalBillableHours: number,
	TotalMealBreakHours: number,
    PenaltyHours: number
    MealBreakDetails: MealBreakDetail[];
  }


export type DaysOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export function getDefaultDayData(): DayData {
	return {
	  EntryDate: '',
	  Id: 0,
	  EntryTimeIn: null,
	  EntryTimeOut: null,
	  IsRestBreakUsed: false,
	  IsMealBreakUsed: false,
	  TotalMealBreakHours: 0,
	  TotalBillableHours: 0,
	  PenaltyHours: 0,
	  MealBreakDetails: [] as MealBreakDetail[]
	};
}
export interface mealBreakSubmitData {
	EntryDate: string,
	EntryTimeIn: string| null,
	Id:number,
	EntryTimeOut:string | null,
	IsRestBreakUsed: boolean,
    IsMealBreakUsed: boolean,
	TotalBillableHours: number,
	TotalMealBreakHours: number,
    PenaltyHours: number
    MealBreakDetails: MealBreakDetail[];
}


export function mapDataWithTimeEntry(data: WeeklyHours, type?: string) {
	return {
		Id: type
			? 1.34
			: 1.43,
		CostAccountingCodeId: '',
		CostAccountingCodeName: '',
		ShiftId: '',
		ShiftName: '',
		JobTitle: '',
		StatusId: magicNumber.zero,
		StatusName: '',
		Sunday: data.Sunday,
		SundayDisable: false,
		Monday: data.Monday,
		MondayDisable: false,
		Tuesday: data.Tuesday,
		TuesdayDisable: false,
		Wednesday: data.Wednesday,
		WednesdayDisable: false,
		Thursday: data.Thursday,
		ThursdayDisable: false,
		Friday: data.Friday,
		FridayDisable: false,
		Saturday: data.Saturday,
		SaturdayDisable: false,
		PreFriday: magicNumber.zero,
		PreFridayDisable: false,
		HoursTypeId: '',
		HoursTypeName: type ?? '',
		TotalHour: magicNumber.zero,
		InlineViewDisabled: false,
		ApproverName: null
	};
}
export const BillableHour = {
	"Sunday": 0,
	"Monday": 0,
	"Tuesday": 0,
	"Wednesday": 0,
	"Thursday": 0,
	"Friday": 0,
	"Saturday": 0,
	"PreFriday": 0
};
export const PenaltyHour = {
	"Sunday": 0,
	"Monday": 0,
	"Tuesday": 0,
	"Wednesday": 0,
	"Thursday": 0,
	"Friday": 0,
	"Saturday": 0,
	"PreFriday": 0
};
