import { ToJson } from "../responseTypes/to-json.model";

type strinAlias = string | undefined | null;
type boolAlias = boolean | undefined | null;
type numberAlias = number | undefined | null;
type dateAlias = Date | undefined | null;
export class RequestCancelCloseReason extends ToJson {
	uKey: strinAlias;
	Disabled: boolAlias;
	Id: numberAlias;
	SectorId: numberAlias;
	SectorName: strinAlias;
	CancelCloseReason: strinAlias;
	ProfessionalPsrRequest: boolAlias;
	IcSowRequest: boolAlias;
	LiRequest: boolAlias;
	CreatedBy: numberAlias;
	CreatedByUserName: strinAlias;
	CreatedOn: dateAlias;
	LastModifiedBy: numberAlias;
	LastModifiedByUserName: strinAlias;
	LastModifiedOn: dateAlias;

	constructor(init?: Partial<RequestCancelCloseReason>) {
		super();
		Object.assign(this, init);
	}
}
