import { ToJson } from '../responseTypes/to-json.model';

type nullableString = string | undefined | null;
export class SectorOnboarding extends ToJson{
	Id: number | undefined | null;
	Type: nullableString;
	ComplianceFieldName: nullableString;
	ComplianceItemLabel: nullableString;
	IsVisibleToClient: boolean;
	DisplayOrder: number | undefined | null;

	constructor(init?: Partial<SectorOnboarding>) {
		super();
		Object.assign(this, init);
	}
}
