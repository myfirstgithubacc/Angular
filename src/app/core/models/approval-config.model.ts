import { ToJson } from './responseTypes/to-json.model';

type NullableString = string | undefined | null;

export class ApprovalConfiguration extends ToJson{

	ActionLocalizedKey: NullableString;
	ApprovalConfigId: NullableString;
	ApprovalProcessName: NullableString;
	ApproverLevelsCount: NullableString;
	CreatedBy: NullableString;
	CreatedOn: Date | undefined | null;
	Disabled: boolean | undefined | null;
	LastModifiedBy : any | undefined | null;
	LastModifiedOn: Date | undefined | null;
	UKey: NullableString;
	WorkFlow: NullableString;

	constructor(init?: Partial<ApprovalConfiguration>) {
		super();
		Object.assign(this, init);
	}
}

