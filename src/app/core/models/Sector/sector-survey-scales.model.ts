export class SectorClpSurveyScale {
	Id: number|null;
	XrmEntityId: number;
	Scale: number;
	Definition: string | null;
	ApplicableFor: string | null;

	constructor(init?: Partial<SectorClpSurveyScale>) {
		Object.assign(this, init);
	}
}
