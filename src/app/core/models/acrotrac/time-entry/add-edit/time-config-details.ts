
export interface TimeConfigDetails{
AssignmentHdrId: number;
AssignmentMealBreakId: number;
AssignmentStartDate: string;
AssignmentEndDate: string;
NonScheduledDates: string[];
IsHolidayTimeEntryAllowed: boolean;
HolidayDates: string[];
HourDistributionRuleId: number|null;
HourDistributionRuleName: string;
RestMealBreakRuleName: string;
RestMealBreakRuleId: number|null;
ManualOtDtEntry: boolean;
PreDefinedWorkScheduleId: number;
IsPreviousTimeSheetAvailable: boolean;
IsOtEligible: boolean;
WeekOneDate: string | null;
CostAccountingDetails: CostAccountingDetail[];
}

interface CostAccountingDetail {
    CostAccountingCodeId: number;
    HasChargeEffectiveDate: boolean;
    EffectiveStartDate: string;
    EffectiveEndDate: string;
  }
