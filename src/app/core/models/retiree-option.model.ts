import { ToJson } from "./responseTypes/to-json.model";

type nullableString = string | undefined | null;
type nullableNumber = number | undefined | null;
type nullableDate = Date | undefined | null;
export class RetireeOption extends ToJson{


	UKey: nullableString;
	Id: nullableNumber;
	Code: nullableString;
	SectorId: nullableNumber;
	SectorName: nullableString;
	Disabled: boolean | undefined | null;
	CreatedOn: nullableDate;
	CreatedBy: nullableNumber;
	LastModifiedOn: nullableDate;
	LastModifiedBy: string;
	CandidateDeclineReason: nullableString;
	RetireeOptionName: nullableString;
	ReasonForChange:nullableString;
	constructor(init?: Partial<RetireeOption>) {
		super();
		Object.assign(this, init);
	}
}

export class ActivateDeactivateModel{
	UKey: string;
	Disabled: boolean;
	ReasonForChange: string;
	constructor(init?: Partial<ActivateDeactivateModel>) {
		Object.assign(this, init);
	}
}
