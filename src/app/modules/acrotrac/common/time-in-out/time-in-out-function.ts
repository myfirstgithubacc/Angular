/* eslint-disable one-var */
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { MealBreakDetail, mealBreakSubmitData } from "../../Time/timesheet/adjustment-manual/enum";

// eslint-disable-next-line max-lines-per-function
export function validateMealEntryDates(EntryTime: { EntryIn: Date, EntryOut: Date, MealIn?: Date, MealOut?: Date }): boolean {
	const entryIn = EntryTime.EntryIn
		? new Date(EntryTime.EntryIn)
		: null;
	const entryOut = EntryTime.EntryOut
		? new Date(EntryTime.EntryOut)
		: null;
	const mealIn = EntryTime.MealIn
		? new Date(EntryTime.MealIn)
		: null;
	const mealOut = EntryTime.MealOut
		? new Date(EntryTime.MealOut)
		: null;
	if (entryIn && entryOut) {
		if (entryOut.getTime() <= entryIn.getTime()) {
			entryOut.setDate(entryOut.getDate() + 1);
		}
		if (mealIn) {
			mealIn.setFullYear(entryIn.getFullYear(), entryIn.getMonth(), entryIn.getDate());
			const mealInTimestamp = mealIn.getTime();
			if (mealInTimestamp <= entryIn.getTime() || mealInTimestamp >= entryOut.getTime()) {
				return false;
			}
		}

		if (mealOut) {
			mealOut.setFullYear(entryIn.getFullYear(), entryIn.getMonth(), entryIn.getDate());
			const mealOutTimestamp = mealOut.getTime();
			if (mealIn && mealOut.getTime() <= mealIn.getTime()) {
				mealOut.setDate(mealOut.getDate() + 1);
			}

			if (mealOutTimestamp <= entryIn.getTime() || mealOutTimestamp >= entryOut.getTime()) {
				return false;
			}
		}

		return true;
	}

	return true;
}


export function subtractOneDayUsingDate(dateString: string): string {
	const [month, day, year] = dateString.split('/').map(Number),
	 date = new Date(year, month - magicNumber.one, day);
	date.setDate(date.getDate() - magicNumber.one);
	// eslint-disable-next-line one-var
	const newMonth = (date.getMonth() + magicNumber.one).toString().padStart(magicNumber.two, '0'),
	 newDay = date.getDate().toString().padStart(magicNumber.two, '0'),
	 newYear = date.getFullYear();
	return `${newMonth}/${newDay}/${newYear}`;
}

export function addOneDay(dateString: string): string {
	const dateParts = dateString.split('/'),
	 month = parseInt(dateParts[magicNumber.zero], magicNumber.ten) - magicNumber.one,
	 day = parseInt(dateParts[magicNumber.one], magicNumber.ten),
	 year = parseInt(dateParts[magicNumber.two], magicNumber.ten),
	 date = new Date(year, month, day);
	date.setDate(date.getDate() + magicNumber.one);
	// eslint-disable-next-line one-var
	const newMonth = (date.getMonth() + magicNumber.one).toString().padStart(magicNumber.two, '0'),
	 newDay = date.getDate().toString().padStart(magicNumber.two, '0'),
	 newYear = date.getFullYear();
	return `${newMonth}/${newDay}/${newYear}`;
}

export function getDateSixDaysBefore(weekendingDate: string): string {
	const date = new Date(weekendingDate);
	date.setDate(date.getDate() - Number(magicNumber.six));
	// eslint-disable-next-line one-var
	const year = date.getFullYear(),
	 month = (date.getMonth() + Number(magicNumber.one)).toString().padStart(Number(magicNumber.two), '0'),
	 day = date.getDate().toString().padStart(Number(magicNumber.two), '0');
	return `${year}-${month}-${day} 00:00:00.0000000`;
}

export function areDatesEqual(date1: string, date2: string): boolean {
	const parsedDate1 = new Date(date1),
		parsedDate2 = new Date(date2);
	return parsedDate1.getTime() === parsedDate2.getTime();
}

export function calculateTotalMin(mealIn:Date, mealOut:Date) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!mealIn || !mealOut) {
	  return;
	} else {
	  const mealInDate = new Date(mealIn);
	  const mealOutDate = new Date(mealOut);
	  const mealInHours = mealInDate.getHours();
	  const mealInMinutes = mealInDate.getMinutes();
	  const mealOutHours = mealOutDate.getHours();
	  const mealOutMinutes = mealOutDate.getMinutes();
	  const mealInTotalMinutes = mealInHours * magicNumber.sixty + mealInMinutes;
	  const mealOutTotalMinutes = mealOutHours * magicNumber.sixty + mealOutMinutes;
		let totalMinutes = mealOutTotalMinutes - mealInTotalMinutes;
	  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
	  if (totalMinutes < magicNumber.zero) {
			totalMinutes += magicNumber.twentyFour * magicNumber.sixty;
	  }
	  return totalMinutes;
	}
}


export function convertToDate(timeString: string) {
	if(timeString == null){
		timeString = "hh:mm:ss";
	}
	const [hours, minutes, seconds] = timeString.split(':'),
	 date = new Date();
	date.setHours(Number(hours), Number(minutes), Number(seconds.split('.')[0]));
	return date;
}

export function convertMinutesToHours(totalMinutes: number){
	return (Number(totalMinutes) / 60).toFixed(2);
}

export function convertDateStringToTimeString(dateString: string): string | null {
	console.log("data" );
	if (!dateString) {
	  return null;
	}

	const timeRegex = /^(\d{1,2}):(\d{2}) (AM|PM)$/;
	if (timeRegex.test(dateString)) {
	  // If the input string is already in the correct format, return it as is
	  return dateString;
	}

	const date = new Date(dateString);
	return date.toLocaleTimeString('en-US', {
	  hour: '2-digit',
	  minute: '2-digit',
	  hour12: true
	});
}
export function convertTimeToDateTime(timeString: string, dateValue: string, entryTime?:Date) {
	const dateTimeString = `${dateValue} ${timeString}`;
	if (entryTime && new Date(dateTimeString).getTime() <= entryTime.getTime()) {
		new Date(dateTimeString).setDate(new Date(dateTimeString).getDate() + 1);
	}

	// Create a new Date object
	return new Date(dateTimeString);
}

export function convertDateFormat(date:string){
	const dateStr = date;
	const [year, month, day] = dateStr.split("-");
	const formattedDate = `${month}/${day}/${year}`;
	return formattedDate;
}
export function convertMealBreakSubmitDataMethod(dataArray: mealBreakSubmitData[], mealBreakData:any, mealBreakId:any): any[] {
	const clonedDataArray = deepClone(dataArray);
	return clonedDataArray.map((data: mealBreakSubmitData) => {
		const updatedData = { ...data };
		updatedData.EntryTimeIn = updatedData.EntryTimeIn && convertDateStringToTimeString(updatedData.EntryTimeIn);
		updatedData.EntryTimeOut = updatedData.EntryTimeOut && convertDateStringToTimeString(updatedData.EntryTimeOut);
		updatedData.TotalMealBreakHours = Number(convertMinutesToHours(updatedData.TotalMealBreakHours));
		updatedData.TotalBillableHours = Number((updatedData.TotalBillableHours).toFixed(magicNumber.two));
		updatedData.MealBreakDetails = mealBreakData.AllowInOutMealBreak
			? updatedData.MealBreakDetails.map((e: MealBreakDetail, index: number) => {
				const newMealBreakDetail = { ...e };
				delete newMealBreakDetail.MealSwitch;
				newMealBreakDetail.MealIn = newMealBreakDetail.MealIn && convertDateStringToTimeString(newMealBreakDetail.MealIn);
				newMealBreakDetail.MealOut = newMealBreakDetail.MealOut && convertDateStringToTimeString(newMealBreakDetail.MealOut);
				newMealBreakDetail.MealBreakId = mealBreakId[index];
				return newMealBreakDetail;
		  })
			: [];
	  return updatedData;
	});
}

function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
