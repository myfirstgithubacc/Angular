export class SectorRequisitionSurveyScale{
	Id: number|null;
	XrmEntityId: number;
	Scale: number;
	Definition: string | null;
	ApplicableFor: string;
	ApplicableForName: string;

	constructor(init?: Partial<SectorRequisitionSurveyScale>) {
		Object.assign(this, init);
	}
}
