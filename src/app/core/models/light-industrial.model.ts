import { ToJson } from './responseTypes/to-json.model';

type NullableString = string | undefined | null;
type NullableNumber = number | undefined | null;
type NullableBoolean = boolean | undefined | null;
type NullableDate = Date | undefined | null;

export class LightIndustrial extends ToJson {

	UKey: NullableString;

	SectorId: NullableNumber;

	SectorName: NullableString;

	Disabled: NullableBoolean;

	CreatedOn: NullableDate;

	LastModifiedOn: NullableDate;

	location: NullableString;

	JobCategory: NullableString;

	Shift: NullableString;

	contractorReq: NullableNumber;

	contractorFill: NullableNumber;

	primaryManager: NullableString;

	orgLevel1: NullableString;

	orgLevel2: NullableString;

	orgLevel3: NullableString;

	orgLevel4: NullableString;

	status: NullableString;

	CostAccountingCode: NullableString;

	ReasonForRequest: NullableString;


	constructor(init?: Partial<LightIndustrial>) {
		super();
		Object.assign(this, init);
	}
}
