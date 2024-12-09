import { Injectable } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { TenureLimitTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { LightIndustrialUtilsService } from './light-industrial-utils.service';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';

@Injectable({
	providedIn: 'root'
})
export class ContractorDetailsService {
	public actualShiftWageRate: number;

	constructor(private utils: LightIndustrialUtilsService) { }

	// function to add months or days for hours to a specific date
	public addMonthsOrDays(startDate: Date, tenureLimit: number, tenureLimitType: number | null) {
		const newDate = new Date(startDate);
		switch (tenureLimitType) {
			case TenureLimitTypes['Length of Assignment']:
				return this.addMonths(newDate, tenureLimit);
			case TenureLimitTypes.Hours:
				return this.addDaysForHours(newDate, tenureLimit);
			default:
				throw new Error(`Invalid tenure type: ${tenureLimitType}`);
		}
	}

	private addMonths(newDate: Date, tenureLimit: number): Date {
		if (this.utils.isZero(tenureLimit) || this.utils.isNull(tenureLimit) || this.utils.isUndefined(tenureLimit)) {
			tenureLimit = Number(magicNumber.tweleve);
		}
		// Subtract 1
		const daysToAdd = Math.round((tenureLimit * Number(magicNumber.threeSixtyFive)) / Number(magicNumber.tweleve)) - Number(magicNumber.one);
		newDate.setDate(newDate.getDate() + daysToAdd);
		return newDate;
	}

	private addDaysForHours(newDate: Date, tenureLimit: number): Date {
		// it calculate target end date for tenure type hours
		if (this.utils.isZero(tenureLimit) || this.utils.isNull(tenureLimit) || this.utils.isUndefined(tenureLimit)) {
			throw new Error('Invalid tenureLimit for hours');
		}
		if (tenureLimit <= Number(magicNumber.eight)) {
			// Add 1 day if tenureLimit is less than or equal to 8
			newDate.setDate(newDate.getDate());
		} else {
			// Add the result of dividing tenureLimit by 8
			const daysToAdd = Math.floor(tenureLimit / magicNumber.eight);
			newDate.setDate(newDate.getDate() + daysToAdd - Number(magicNumber.one));
			// If there's a remainder, add 1 more day
			if (tenureLimit % magicNumber.eight > Number(magicNumber.zero)) {
				newDate.setDate(newDate.getDate() + magicNumber.one);
			}
		}
		return newDate;
	}

	public calculateActualShiftWageRate(wageRate: number, adderOrMultiplierValue: number, shiftDifferentialMethod: string): number {
		if (wageRate && this.utils.isNotNull(adderOrMultiplierValue) && shiftDifferentialMethod) {
			if (shiftDifferentialMethod == 'Adder') {
				return this.roundToTwoDecimalPlaces(wageRate + adderOrMultiplierValue);
			} else if (shiftDifferentialMethod == 'Multiplier') {
				return this.roundToTwoDecimalPlaces(wageRate * adderOrMultiplierValue);
			}
		}
		return magicNumber.zero;
	}

	public roundToTwoDecimalPlaces(value: number): number {
		return Math.round(value * Number(magicNumber.hundred)) / Number(magicNumber.hundred);
	}

	/**
	   * create a function which return the total number of days between two dates only for the weeks which are selected to be true
	   * workingDaysOfWeek parameter is an array of boolean, where each element represents a day of the week (0 for Sunday, 1 for Monday, etc.).
	   */
	public getNumberOfDaysWithSpecificWeeks(startDate: Date, endDate: Date, workingDaysOfWeek: boolean[]) {
		const date1 = new Date(startDate),
			date2 = new Date(endDate);
		let numberOfDays = Number(magicNumber.zero);
		if (date1 > date2) {
			return Number(magicNumber.zero);
		}
		while (date1 <= date2) {
			const dayOfWeek = date1.getDay();
			// Check if the current day of the week is selected (true) in the 'week' parameter
			if (workingDaysOfWeek[dayOfWeek]) {
				numberOfDays++;
			}
			// Move to the next day
			date1.setDate(date1.getDate() + Number(magicNumber.one));
		}
		return numberOfDays;
	}

	// find the total number of hours between two times in 24 hour format
	public calculateTotalHoursBetweenTimes(startTime: string, endTime: string): number {
		const totalMinuteStartTime = this.convertTimeToMinutes(startTime),
			totalMinuteEndTime = this.convertTimeToMinutes(endTime);
		let minutesDifference = totalMinuteEndTime - totalMinuteStartTime;
		if (minutesDifference < Number(magicNumber.zero)) {
			minutesDifference += Number(magicNumber.twentyFour) * Number(magicNumber.sixty);
		}
		// eslint-disable-next-line one-var
		const adjustedMinutes = minutesDifference - Number(magicNumber.thirty);
		return this.convertMinutesToHours(adjustedMinutes);
	}

	private convertMinutesToHours(totalMinutes: number): number {
		if (totalMinutes < Number(magicNumber.zero)) {
			return Number(magicNumber.zero);
		}
		const hours = totalMinutes / Number(magicNumber.sixty);
		return Math.max(hours, Number(magicNumber.zero));
	}

	private convertTimeToMinutes(time: string): number {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * Number(magicNumber.sixty) + minutes;
	}

	public getTotalWorkingHours(workDaysCount: number, dailyWorkHoursCount: number): number {
		if (workDaysCount && dailyWorkHoursCount) {
			return (workDaysCount * dailyWorkHoursCount);
		}
		return Number(magicNumber.zero);
	}

	public calculateNetBenefitAdders(totalHours: number, benefitAdders: IBenefitData[]) {
		if (typeof totalHours !== 'number' || totalHours < Number(magicNumber.zero)) {
			throw new Error('totalHours must be a non-negative number');
		}
		if (!Array.isArray(benefitAdders)) {
			throw new Error('benefitAdders must be an array of objects');
		}
		let totalBenefit = Number(magicNumber.zero);

		for (const benefitAdder of benefitAdders) {
			if (
				typeof benefitAdder !== 'object' ||
				!benefitAdder.Value
			) {
				throw new Error('Each benefitAdder object must have Text and Value properties');
			}
			const value = parseFloat(String(benefitAdder.Value));
			if (isNaN(value) || value < Number(magicNumber.zero)) {
				throw new Error('Value in benefitAdder must be a non-negative number');
			}
			totalBenefit += totalHours * value;
		}
		return totalBenefit;
	}

	public calculateNetEstimatedCost(totalHours: number, actualShiftWageRate: number, totalBenefit: number): number {
		if (totalHours && actualShiftWageRate) {
			return (totalHours * actualShiftWageRate) + totalBenefit;
		}
		return Number(magicNumber.zero);
	}

	public parseDateStringToDate(dateString: string): Date {
		const zero = Number(magicNumber.zero),
			date = new Date(dateString);
		date.setHours(zero, zero, zero, zero);
		return date;
	}

}
