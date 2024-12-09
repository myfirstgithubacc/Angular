type nullableNumber = number | undefined | null;
export interface WeekDayRule {
	Id: number;
	RuleType?: nullableNumber;
	WeekDayId?: string | number | null;
	WeekDayName?: string;
	StOperator: number | string;
	StValue: nullableNumber;
	OtOperator: number | string;
	OtValue: nullableNumber;
	DtOperator: number | string;
	DtValue: nullableNumber;
	MaxHoursAllowed?: nullableNumber;
	ApplicableOnTypeId?: string | null;
	ApplicableOnOperator?: number | string | null;
	ApplicableOnValue?: nullableNumber;
}
