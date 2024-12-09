import { ToJson } from '../responseTypes/to-json.model';

export class CandidatePoolPreferableSector extends ToJson {

	CandidatePoolId: number | undefined | null;
	SectorId: number;
	SectorName: string;
	Text: string | undefined | null;
	constructor(init?: Partial<CandidatePoolPreferableSector>) {
		super();
		Object.assign(this, init);
	}
}
