export class SectorRequisitionSurveyPerformanceFactor {
	Id: number|null;
	XrmEntityId: number;
	Factor: string | null;

	constructor(init?: Partial<SectorRequisitionSurveyPerformanceFactor>) {
		Object.assign(this, init);
	}
}
