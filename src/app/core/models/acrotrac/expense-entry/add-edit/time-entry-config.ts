export interface TimesheetConfigDetails {
    AssignmentStartDate: string;
    AssignmentEndDate: string;
    NonScheduledDates: string [] | null;
    IsHolidayTimeEntryAllowed: boolean;
    HolidayDates: string[];
    HourDistributionRuleId: number|null;
    HourDistributionRuleName: string;
    RestMealBreakRuleName: string;
    RestMealBreakRuleId: number|null;
    ManualOtDtEntry: boolean;
    PreDefinedWorkScheduleId: number;
}
