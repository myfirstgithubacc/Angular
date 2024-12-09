import { ToJson } from '../responseTypes/to-json.model';

export class CandidatePoolPreferableAssignmentType extends ToJson{

	CandidatePoolId: number | undefined | null;
	AssignmentTypeId: number;
	AssignmentName: string;

	constructor(init?: Partial<CandidatePoolPreferableAssignmentType>) {
		super();
		Object.assign(this, init);
	}
}
