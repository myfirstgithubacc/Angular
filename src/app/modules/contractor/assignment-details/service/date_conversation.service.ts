import { Injectable } from '@angular/core';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class DateConversationService {

	constructor( private localization: LocalizationService){}

	public getFormattedDate(date: string): Date {
		const targetFormat = this.localization.GetCulture(CultureFormat.DateFormat),
			momentDate = moment(date, this.transformDate(targetFormat));
		return momentDate.toDate();
	}

	public convertDate(dateString: Date): string {
		const targetFormat = this.localization.GetCulture(CultureFormat.DateFormat);
		return this.getFormattedDateIntoString(moment(dateString).format(this.transformDate(targetFormat)));
	}

	public getFormattedDateIntoString(date: string): string {
		const targetFormat = this.localization.GetCulture(CultureFormat.DateFormat),
			formattedTargetFormat = this.transformDate(targetFormat);

		// Check if the date is already in the target format
		if (moment(date, formattedTargetFormat, true).isValid()) {
			return date;
		}
		// eslint-disable-next-line one-var
		const momentDate = moment(date);
		return momentDate.format(formattedTargetFormat);
	}


	public convertDateToSpecificFormat(date: Date | string, currentFormat: string, targetFormat?: string | null | undefined): string | null {
		try {
			if (targetFormat === null || targetFormat === undefined) {
				targetFormat = this.localization.GetCulture(CultureFormat.DateFormat);
			}
			const momentDate = moment(date, this.transformDate(currentFormat));
			if (!momentDate.isValid()) return null;
			return momentDate.format(this.transformDate(targetFormat!));
		} catch (error) {
			return null;
		}
	}

	transformDate(format: string) {
		switch (format) {
			case 'd.M.yyyy':
				return 'DD.MM.YYYY';
			case 'd/M/yyyy':
				return 'DD/MM/YYYY';
			case 'M/d/yyyy':
				return 'MM/DD/YYYY';
			default:
				return format;
		}
	}

}
