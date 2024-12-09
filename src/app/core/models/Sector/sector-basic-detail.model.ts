import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IBasicDetailsFM } from '@xrm-master/sector/add-edit/basic-details/utils/helper';
import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';


type nullableString = string | null;
export class SectorBasicDetails extends CommonSection {
	Id : nullableString | number;
	SectorName: nullableString;
	SectorCode: nullableString;
	AddressLine1: string|null;
	AddressLine2: nullableString;
	CountryId: number;
	CountryName: string;
	City: string|null;
	StateId: string;
	StateName: string;
	PostalCode: string | null;
	DefaultCulture: nullableString;
	HomeLanguageCode: number;
	HomeLanguageName: string;
	PasswordExpiryPeriod: number;
	PasswordExpiryPeriodName: string;
	InitialGoLiveDate: nullableString;
	WeekEndingDayId: number;
	WeekDayName: string;
	IsWeekendingRequired: boolean;
	TimeZoneId: number;
	TimezoneName: string;
	IsLimitAvailableWeekendingInTimeCapture: boolean;
	NoOfPastWeekeding: number | null;

	constructor(init?: Partial<ɵTypedOrUntyped<IBasicDetailsFM, ɵFormGroupRawValue<IBasicDetailsFM>, any>>) {
		super();
		this.CountryId = Number(init?.CountryId?.Value);
		// init?.CountryId? = this.CountryId;
		this.CountryName = init?.CountryId?.Text ?? '';

		this.HomeLanguageCode = Number(init?.HomeLanguageCode?.Value);
		this.HomeLanguageName = init?.HomeLanguageCode?.Text ?? '';

		this.PasswordExpiryPeriod = Number(init?.PasswordExpiryPeriod?.Value);
		this.PasswordExpiryPeriodName = init?.PasswordExpiryPeriod?.Text ?? '';

		this.WeekEndingDayId = Number(init?.WeekEndingDayId?.Value);
		this.WeekDayName = init?.WeekEndingDayId?.Text ?? '';

		this.TimeZoneId = Number(init?.TimeZoneId?.Value);
		this.TimezoneName = init?.TimeZoneId?.Text ?? '';

		this.StateId = init?.StateId?.Value ?? '';
		this.StateName = init?.StateId?.Text ?? '';
		Object.assign(this, init);
	}
}
