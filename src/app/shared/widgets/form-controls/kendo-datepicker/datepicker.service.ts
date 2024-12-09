import { Injectable } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Injectable({
	providedIn: 'root'
})
export class DatePickerService {

	private datePickerFields: string[] = [];
	private fieldMappings: { [key: string]: string } = {};

	public addDatePickerField(field: string): void {
		if (!this.datePickerFields.includes(field)) {
			this.datePickerFields.push(field);
		}
	}

	public addFieldMapping(controlField: string, payloadField: string): void {
		this.fieldMappings[controlField] = payloadField;
	}

	public getDatePickerFields(): string[] {
		return this.datePickerFields;
	}

	public getFieldMappings(): { [key: string]: string } {
		return this.fieldMappings;
	}

	public formatDateWithoutTime(date: Date | null): string | null {
		if (!date || isNaN(date.getTime())) {
			return null;
		}
		const month = (date.getMonth() + magicNumber.one).toString().padStart(magicNumber.two, '0'); // Add 1 because getMonth() returns 0-based month
		const day = date.getDate().toString().padStart(magicNumber.two, '0');
		const year = date.getFullYear();
		return `${month}/${day}/${year}`;
	}

	public parseDateString(dateString: string): Date | null {
		if (!dateString) {
			return null;
		}
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? null : date;
	}

	public clearDatePickerFields(): void {
		this.datePickerFields = [];
		this.fieldMappings = {};
	}

}

