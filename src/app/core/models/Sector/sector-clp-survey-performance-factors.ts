
export class SectorClpSurveyPerformanceFactor {
	Id: number|null;
	XrmEntityId: number;
	Factor: string | null;
	ApplicableFor: string | null;

	constructor(init?: Partial<SectorClpSurveyPerformanceFactor>) {

		Object.assign(this, init);
	}
}
