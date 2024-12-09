import { ConditionParameters } from "../hdr-enum-constants/enum-constants";

export function getNoneWithWeeklyPrefilledData() {
	return [
		{ Id: 0, WeekDayId: 131, StOperator: ConditionParameters.LessThanOrEqual, StValue: 24,
			 OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 132, StOperator: ConditionParameters.LessThanOrEqual,
			 StValue: 24, OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 133, StOperator: ConditionParameters.LessThanOrEqual,
			 StValue: 24, OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 134, StOperator: ConditionParameters.LessThanOrEqual,
			 StValue: 24, OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 135, StOperator: ConditionParameters.LessThanOrEqual,
			 StValue: 24, OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 136, StOperator: ConditionParameters.LessThanOrEqual,
			 StValue: 24, OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 137, StOperator: ConditionParameters.LessThanOrEqual,
			 StValue: 24, OtOperator: ConditionParameters.Equal, OtValue: 0, DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 24 }
	];
}

export function getNoneWithDailyPrefilledData() {
	return [
		{
			Id: 0, WeekDayId: 131, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 132, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 133, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 134, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 135, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 136, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 137, StOperator: ConditionParameters.LessThanOrEqual, StValue: 8,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		}
	];
}

export function getNineBy80Week1PrefilledData() {
	return [
		{
			Id: 0, WeekDayId: 145, StOperator: ConditionParameters.Equal, StValue: 0,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 4,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 4, MaxHoursAllowed: 20
		},
		{
			Id: 0, WeekDayId: 146, StOperator: ConditionParameters.Equal, StValue: 0,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 147, StOperator: ConditionParameters.Equal, StValue: 0,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 148, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{ Id: 0, WeekDayId: 149, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 150, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 151, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24
		},
		{
			Id: 0, WeekDayId: 152, StOperator: ConditionParameters.LessThanOrEqual, StValue: 4,
			OtOperator: ConditionParameters.Equal, OtValue: 0,
			DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 4
		}
	];
}

export function getNineBy80Week2PrefilledData() {
	return [
		{ Id: 0, WeekDayId: 153, StOperator: ConditionParameters.LessThanOrEqual, StValue: 4,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 20 },
		{ Id: 0, WeekDayId: 154, StOperator: ConditionParameters.Equal, StValue: 0,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 155, StOperator: ConditionParameters.Equal, StValue: 0,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 156, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 157, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 158, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 159, StOperator: ConditionParameters.LessThanOrEqual, StValue: 9,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 160, StOperator: ConditionParameters.Equal, StValue: 0,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 4,
			  DtOperator: ConditionParameters.Equal, DtValue: 0, MaxHoursAllowed: 4 }
	];
}

export function getFourBy40PrefilledData() {
	return [
		{ Id: 0, WeekDayId: 131, StOperator: ConditionParameters.LessThanOrEqual, StValue: 10,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 132, StOperator: ConditionParameters.LessThanOrEqual, StValue: 10,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 133, StOperator: ConditionParameters.LessThanOrEqual, StValue: 10,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 134, StOperator: ConditionParameters.LessThanOrEqual, StValue: 10,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 12,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 12, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 135, StOperator: ConditionParameters.Equal, StValue: 0,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 136, StOperator: ConditionParameters.Equal, StValue: 0,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24 },
		{ Id: 0, WeekDayId: 137, StOperator: ConditionParameters.Equal, StValue: 0,
			 OtOperator: ConditionParameters.LessThanOrEqual, OtValue: 8,
			  DtOperator: ConditionParameters.GreaterThan, DtValue: 8, MaxHoursAllowed: 24 }
	];
}
