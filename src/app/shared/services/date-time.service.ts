import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DateTimeService {


	public ToUTCDateTime(dateString: any): string {
		if (!dateString) {
			return dateString;
		}
		// Parse the date components manually
		const localDate = new Date(dateString).toLocaleDateString(),
			dateObject = new Date(localDate),
			newYear = dateObject.getFullYear(),
			newMonth = dateObject.getMonth(),
			newDay = dateObject.getDate(),
			utcDate = new Date(Date.UTC(newYear, newMonth, newDay, 0, 0, 0));
		return utcDate.toISOString();
	}

	GetCurrentUtcDate(): Date {
		return new Date().getUTCDateTime();
	}
	GetCurrentDate(): Date {
		return new Date().getxrmDatetime();
	}
	ConvertDateToUtc(param: string): Date | string {
		const parsedDate = Date.parse(param);
		if (!isNaN(parsedDate)) {
			return new Date(param).getUTCDateTime();
		}
		else
			return param;
	}
	ConvertTimeToUtc(param: string) {
		if (Date.parse(param)) {
			return new Date(param).getUTCDateTime();
		}
		const date = new Date();
		return new Date(`${date.toDateString()} ${param}`).getUTCDateTime();
	}
	ConvertUtcToDate(param: string): Date {
		if (Date.parse(param)) {
			return new Date(param).getxrmDatetime();
		}
		return new Date(param).getxrmDatetime();
	}
	ConvertUtcToTime(param: string): Date {
		const date = new Date();
		return new Date(`${date.toDateString()} ${param}`).getxrmDatetime();
	}
}
