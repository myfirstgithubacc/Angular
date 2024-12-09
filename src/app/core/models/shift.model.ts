import { Time } from '@angular/common';
import { ToJson } from './responseTypes/to-json.model';

type NullableString = string | undefined | null;
type NullableNumber = number | undefined | null;
type NullableBoolean = boolean | undefined | null;

export class Shift extends ToJson {
	Ukey: NullableString;
	ShiftId: NullableNumber;
	SectorId: NullableNumber;
	LocationId: NullableNumber;
	LocationName: NullableString;
	SectorName: NullableString;
	IsLocationSpecific: NullableBoolean;
	ShiftName: NullableString;
	ShiftCode: NullableString;
	ReportingDayType: NullableString;
	StartTime: Time | undefined | null;
	EndTime: Time | undefined | null;
	Sun: NullableBoolean;
	Mon: NullableBoolean;
	Tue: NullableBoolean;
	Wed: NullableBoolean;
	Thu: NullableBoolean;
	Fri: NullableBoolean;
	Sat: NullableBoolean;
	ClpWorkingDays: ClpWorkingDays[];
	Disabled: NullableBoolean;
	CreatedOn: Date | undefined | null;
	CreatedBy: NullableNumber;
	LastModifiedOn: Date | undefined | null;
	LastModifiedBy: string;
	reasonForChange: string;

	constructor(init?: Partial<Shift>) {
		super();
		Object.assign(this, init);
	}
}
export class ClpWorkingDays extends ToJson {
	Text: NullableString;
	Value: NullableNumber;

	constructor(init?: Partial<ClpWorkingDays>) {
		super();
		Object.assign(this, init);
	}
}
