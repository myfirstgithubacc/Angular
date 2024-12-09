import { CultureFormat } from "./Localization/culture-format.enum";
declare module '@progress/kendo-date-math' {
	interface ZonedDate {
		getxrmDatetime(): Date;
		getxrmDate(): number;
		getxrmDay(): number;
		getxrmFullYear(): number;
		getxrmHours(): number;
		getxrmMilliseconds(): number;
		getxrmMinutes(): number;
		getxrmMonth(): number;
		getxrmSeconds(): number;
		getxrmTime(): number;
		getUTCDateTime(): Date;
		get24HourFormat(): string;
	}
}
// Assume ZonedDate is imported from an external library
declare global {
	interface Date {
		getxrmTime(): number;
		getxrmDatetime(): Date;
		getxrmDate(): number;
		getxrmDay(): number;
		getxrmFullYear(): number;
		getxrmHours(): number;
		getxrmMilliseconds(): number;
		getxrmMinutes(): number;
		getxrmMonth(): number;
		getxrmSeconds(): number;
		getUTCDateTime(): Date;
		get24HourFormat(): string;
	}
}
Date.prototype.getxrmDatetime = function (): Date {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this;
};

Date.prototype.getxrmDate = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getDate();
};

Date.prototype.getxrmDay = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getDay();
};

Date.prototype.getxrmFullYear = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getFullYear();
};

Date.prototype.getxrmHours = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getHours();
};

Date.prototype.getxrmMilliseconds = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getMilliseconds();
};

Date.prototype.getxrmMinutes = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getMinutes();
};

Date.prototype.getxrmMonth = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getMonth();
};

Date.prototype.getxrmSeconds = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getSeconds();
};
Date.prototype.getxrmTime = function (): number {
	this.setMinutes(this.getMinutes() + GetOffSet());
	return this.getTime();
};

Date.prototype.getUTCDateTime = function (): Date {
	this.setMinutes(this.getMinutes() - (GetOffSet()));
	return this;
};
Date.prototype.get24HourFormat=function(): string{
	const hours = this.getHours().toString().padStart(2, '0'),
		minutes = this.getMinutes().toString().padStart(2, '0'),
		seconds = this.getSeconds().toString().padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
};
export function GetOffSet(): number {
	const val = sessionStorage.getItem(CultureFormat[CultureFormat.OffSetValue]) ?? '',
		result = parseInt(val);
	if (!val || isNaN(result))
		return 0;

	return result;
}

export class xrmDateHelper {
}
