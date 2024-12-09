interface DayDetails {
	isDisabled: boolean;
	title: string[];
}

export interface WeekDetails {
	Sunday: DayDetails;
	Monday: DayDetails;
	Tuesday: DayDetails;
	Wednesday: DayDetails;
	Thursday: DayDetails;
	Friday: DayDetails;
	Saturday: DayDetails;
	[key: string]: DayDetails;
}

export function getDefaultWeekDetails(): WeekDetails {
	return {
		Sunday: {
			isDisabled: false,
			title: []
		},
		Monday: {
			isDisabled: false,
			title: []
		},
		Tuesday: {
			isDisabled: false,
			title: []
		},
		Wednesday: {
			isDisabled: false,
			title: []
		},
		Thursday: {
			isDisabled: false,
			title: []
		},
		Friday: {
			isDisabled: false,
			title: []
		},
		Saturday: {
			isDisabled: false,
			title: []
		}
	};
}

export type WeekDetailsMap = Record<number, WeekDetails>;
