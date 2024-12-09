import { ToJson } from "./responseTypes/to-json.model";

type NullableString = string | undefined | null;
type NullableNumber = number | undefined | null;
type NullableBoolean = boolean | undefined | null;

export class CandidateDeclineReason extends ToJson{

	UKey: NullableString;
	Id: NullableNumber;
	Code: NullableString;
	SectorId: NullableNumber;
	SectorName: NullableString;
	Disabled: NullableBoolean;
	CreatedOn: Date | undefined | null;
	CreatedBy: NullableNumber;
	LastModifiedOn: Date | undefined | null;
	LastModifiedBy: string;
	CandidateDeclineReason: NullableString;
	ProfessionalRequest: NullableBoolean;
	LiRequest: NullableBoolean;
	RfxSowRequest: NullableBoolean;
	ReasonForChange: NullableString;

	constructor(init?: Partial<CandidateDeclineReason>) {
		super();
		Object.assign(this, init);
	}
}
