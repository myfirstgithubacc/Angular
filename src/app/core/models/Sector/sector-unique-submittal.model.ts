type nullableNumber = number | null;
export class UniqueSubmittal {

	Id: number | null;
	LabelName: string | null;
	ToolTip: string | null;
	MaxLength: nullableNumber;
	IsNumeric: boolean;
	IsPartialEntry: boolean;
	RightmostChars: nullableNumber;

	constructor(init?: Partial<UniqueSubmittal>) {
		Object.assign(this, init);
	}
}
