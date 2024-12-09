type nullableNumber = number | null;
type nullableString = string | null;

export class SectorCostCenterConfig {
	Id: nullableNumber;
	LocalizedKey?: nullableString;
	SegmentName: nullableString;
	SegmentMaxLength: nullableNumber;
	SegmentMinLength: nullableNumber;
	controlName?: nullableString;
	localizeName?: nullableString;
	constructor(init?: Partial<SectorCostCenterConfig>) {
		Object.assign(this, init);
	}
}
