export class SectorCandidateEvaluationItem {
	Id: number | null;
	EvaluationRequirementId: string | null;
	Description: string | null;
	DisplayOrder: number | null;
	IsVisible: boolean | null;
	EvaluationRequirementName: string | null;

	constructor(init?: Partial<SectorCandidateEvaluationItem>) {
		Object.assign(this, init);
	}
}
