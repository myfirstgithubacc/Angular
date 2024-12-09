import { ToJson } from '../responseTypes/to-json.model';

export class SectorBenefitAdder extends ToJson {
	Id: number|null;
	Label: string | null;
	constructor(init?: Partial<SectorBenefitAdder>) {
		super();
		Object.assign(this, init);
	}
}
