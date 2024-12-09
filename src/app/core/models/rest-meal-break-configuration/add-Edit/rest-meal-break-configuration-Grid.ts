type nullableNumber = number | undefined | null;
export interface MealBreakPenaltyConfigGrid {
	Id: nullableNumber;
	MealBreakTypeId: nullableNumber;
	MealBreakTypeText: string | null | undefined;
	MinimumHoursWorked: nullableNumber;
	MandatoryBreak: nullableNumber;
	RestrictWaiveOffHours: nullableNumber;
	WeekDayName?:string;
	MealBreakPenaltyHours?:number;

}
