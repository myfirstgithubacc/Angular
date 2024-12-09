import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;

export class ApproveDecline extends ToJson{
	UKey: nullableString;
	StatusId: nullableNumber;
	approverComment: nullableString;

	constructor(init?: Partial<ApproveDecline>) {
		super();
		Object.assign(this, init);
	}
}
