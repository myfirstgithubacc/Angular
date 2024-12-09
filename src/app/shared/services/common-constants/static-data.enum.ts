/* eslint-disable no-shadow */
/* eslint-disable no-magic-numbers */
export enum PricingModels {
    'Markup Based' = 8,
    'Bill Rate Based' = 7
}

export enum BillRateValidations {
    "NTE" = 16,
    "Target" = 17
}

export enum CostEstimationTypes {
    "Period of Performance" = 14,
    "Budgeted Hours" = 15
}

export enum EvaluationRequirements {
    "Education" = 1,
    "Skills" = 2,
    "Certification" = 3,
    "Not Required" = 4
}

export enum LengthOfAssignmentTypes {
    "Day(s)" = "Day",
    "Month(s)" = "Month",
    "Year(s)" = "Year"
}

export enum MarkUpTypes {
    "Staffing Agency Std. Mark Up %" = 22,
    "Rate Card" = 23
}

export enum MspFeeTypes {
    "A" = 19,
    "A1" = 20,
    "B1" = 21
}

export enum NoConsecutiveWeekMissingEntrys {
    "1-Week" = 1,
    "2-Week" = 2,
    "3-Week" = 3,
    "4-Week" = 4,
    "5-Week" = 5,
    "Not Applicable" = 0
}

export enum OtRateTypes {
    "Wage Based" = 6,
    "Bill Rate Based" = 4,
    "Bill Rate + Wage Based" = 5
}

export enum PasswordExpiryPeriods {
    "90Days" = 52,
    "180Days" = 53,
    "365Days" = 54,
    "Never" = 55
}

export enum PoTypeSowIcs {
    "Single Po" = 26,
    "Multiple Po" = 27
}

export enum PoType {
    "Single Po" = 26,
    "Multiple Po" = 27
}

export enum PunchTimeIncrementRoundings {
    "Five" = 5,
    "Ten" = 10,
    "Fifteen" = 15,
    "Twenty" = 20,
    "Zero" = 0
}

export enum PunchTimeRoundings {
    "Forward" = "Forward",
    "Backward" = "Backward",
    "Midpoint" = "Midpoint",
    "None" = "None"
}

export enum QuestionToBeAnsweredBys {
    "MSP" = "M",
    "Supplier" = "S",
}

export enum ShiftDifferentialMethods {
    "Adder" = 24,
    "Multiplier" = 25
}

export enum SurveyUsedInEntities {
    "All" = "A",
    "Professional CLP" = "P",
    "LI CLP" = "L",
    "SOW Resource" = "S"
}

export enum TenureLimitTypes {
    "Hours" = 36,
    "Length of Assignment" = 37,
}

export enum XrmUseEmployeeTimeClocks {
    "Employee Id" = 43,
    "TimeClock Id" = 44
}

export enum WeekDays {
    "Monday" = 0,
    "Tuesday" = 1,
    "Wednesday" = 2,
    "Thursday" = 3,
    "Friday" = 4,
    "Saturday" = 5,
    "Sunday" = 6
}

export enum YesNo {
    "Yes" = "true",
    "No" = "false"
}

//

export enum PreDefinedSchedules {
    "None" = 128,
    "9/80" = 129,
    "4/40" = 130
}

export enum Days {
    "Monday" = '161',
    "Tuesday" = '162',
    "Wednesday" = '163',
    "Thursday" = '164',
    "Friday" = '165',
    "Saturday" = '166',
    "Sunday" = '167',
    "Holiday" = '168'
}

export enum SpecialDays {
    "Week1_Non-working_Day" = '231',
    "Week1_1st_Day" = '232',
    "Week1_2st_Day" = '233',
    "Week1_3st_Day" = '234',
    "Week1_4st_Day" = '235',
    "Week1_5st_Day" = '236',
    "Week1_6st_Day" = '237',
    "Week1_Working_Day" = '238',
    "Week2_Working_Day" = '239',
    "Week2_1st_Day" = '240',
    "Week2_2st_Day" = '241',
    "Week2_3st_Day" = '242',
    "Week2_4st_Day" = '243',
    "Week2_5st_Day" = '244',
    "Week2_6st_Day" = '245',
    "Week2_Non-working_Day" = '246',
    "Week1_Holiday" = '247',
    "Week2_Holiday" = '248'
}

export enum ConditionParameters {
    "Week Total" = '140',
    "ST Total" = '141',
    "OT Total" = '143',
    "DT Total" = '142',
    "Day Total" = '144'
}

export enum ComparisonOperators {
    "GreaterThan" = '1',
    "LessThan" = '2',
    "Equal" = '3',
    "LessThanOrEqual" = '4',
    "GreaterThanOrEqual" = '5'
}

export enum drugScreenResultIdEnum {
    Pending = 211,
    Positive = 87,
    Negative = 88,
    PositivewithWaiver = 198,
}

export enum drugScreenIdEnum {
    None = 199,
    Initiated = 200,
    Completed = 216,
}

export enum backgroundChcekIdEnum {
    None = 201,
    Initiated = 202,
    Completed = 217,
}

export enum AssignmentTypesEnum {
    LI = 84,
    Prof = 85,
    ICSOW = 86
}
