import { ToJson } from '../responseTypes/to-json.model';

type nullableBoolean = boolean | undefined | null;
export class SectorSurveyPerformanceFactor extends ToJson{
	Id: number | undefined | null;
	XrmEntityId: number | undefined | null;
	Factor: string | undefined | null;
	ApplicableForProfessional: nullableBoolean;
	ApplicableForLi: nullableBoolean;
	ApplicableForSow: nullableBoolean;

	constructor(init?: Partial<SectorSurveyPerformanceFactor>) {
		super();
		Object.assign(this, init);
	}
}
