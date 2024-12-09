import { ToJson } from './responseTypes/to-json.model';
type nullableString = string | undefined | null;
export class ManageCountry extends ToJson {

	Id: number | undefined | null;
	UKey: nullableString;
	CountryCode: nullableString;
	CountryName: nullableString;
	ZipLabel: nullableString;
	ZipLengthSeries: number | undefined | null;
	ZipLabelLocalizedKey: nullableString;
	ZipFormat: nullableString;
	PhoneExtFormat: nullableString;
	PhoneFormat: nullableString;
	StateLabel: nullableString;
	StateLabelLocalizedKey: nullableString;
	CurrencyCode: nullableString;
	CurrencySymbol: nullableString;
	DateFormat: nullableString;
	AutoGeneratedCode: nullableString;
	PhoneFormatWithExtension: nullableString;
	Disabled: boolean | undefined | null;
	CreatedBy: nullableString;
	CreatedOn: Date | undefined | null;
	LastModifiedBy: nullableString;
	LastModifiedOn: Date | undefined | null;
	ReasonForChange: nullableString;

	constructor(init?: Partial<ManageCountry>) {
		super();
		Object.assign(this, init);
	}
}

