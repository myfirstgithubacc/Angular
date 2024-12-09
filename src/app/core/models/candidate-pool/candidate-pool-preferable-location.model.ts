import { ToJson } from '../responseTypes/to-json.model';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class CandidatePoolPreferableLocation extends ToJson {
	candidatePoolId: nullableNumber;
	LocationId: number;
	LocationName: string;
	SectorId: number;
	SectorName: string;
	Text : nullableString;
	Value?: nullableNumber;
	constructor(init?: Partial<CandidatePoolPreferableLocation>) {
		super();
		Object.assign(this, init);
	}
}
