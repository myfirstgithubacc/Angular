import { ToJson } from '../responseTypes/to-json.model';

type nullableString = string | null;
export class SectorList extends ToJson{
	UKey: string;
	SectorName: nullableString;
	SectorCode: nullableString;
	City: nullableString;
	State: nullableString;
	Disabled: boolean | undefined | null;
	Status: nullableString;
	CreatedByName: number | undefined | null;
	CreatedOn: Date | undefined | null;
	LastModifiedByName: nullableString;
	LastModifiedOn: Date | undefined | null;
	constructor(init?: Partial<SectorList>) {
		super();
		Object.assign(this, init);
	}
}
