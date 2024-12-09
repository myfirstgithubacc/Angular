
import { ToJson } from '../responseTypes/to-json.model';
type nullableString = string | undefined | null;

export class BasicDetails extends ToJson{
	UKey : nullableString;
	Name: nullableString;
	Email: nullableString;
	Url: nullableString;
	Code: nullableString;
	ClientConfigureType: nullableString;
	ProgramManagerName: nullableString;
	ProgramManagerEmail: nullableString;
	ProgramManagerContact: nullableString;
	OrganizationLabel: nullableString;
	TimezoneId: nullableString;
	DefaultCultureId: number | undefined | null;
	SystemGeneratedEmail: nullableString;
	CountryId: nullableString;
	WeekEndingDayId: nullableString;
	SowVariance: nullableString;
	OnsiteName: nullableString;
	EmailDomain: nullableString;
	ClientPaySalesTax: boolean;
	IsPortalImplementation: boolean;
	IsAcroTracInOutTime: boolean;
	IsSalesTaxFromExternalSource: boolean;
	IsRfxRequired: boolean;
	IsLiClpFilledByDifferentStaffing: boolean;
	IsMspReviewRequest: boolean;
	SkipHoursValidationOnTimeUpload: boolean;
	IsLimitAvailableWeekendingInTimeCapture: boolean;
	NoOfPreviousWeekending: number | null;
	MspEmail: nullableString;
	SupportContactNumber: nullableString;
	SupportEmail: nullableString;
	ReasonForChange: nullableString;
	UidLabelLocalizedKey: string;
	UidLength: number;
	IsUidNumeric: boolean;

	constructor(init?: Partial<BasicDetails>) {
		super();
		Object.assign(this, init);
	}
}

export class validationMessage{
	PropertyName: string;
	ErrorMessage: string;
}
export interface SupportContactInfo {
    SupportContactNumber: string;
    SupportEmail: string;
}

