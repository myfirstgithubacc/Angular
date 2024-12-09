export interface WeeklyHours {
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    [key: string]: number;
}

export interface WeeklyHoursTotal extends WeeklyHours {
    TotalHour: number;
}

export interface WeeklyHoursFullTotal extends WeeklyHoursTotal {
    Total: number;
}
