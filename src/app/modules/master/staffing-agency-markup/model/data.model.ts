import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";

export class DataModel extends ToJson {
	staffingAgencyUkey: string;
	baseMarkupConfigs: StaffingMarkup[];
	UKey: string;

	constructor(init?: Partial<DataModel>) {
		super();
		Object.assign(this, init);
	}
}

class StaffingMarkup {
	RecruitedMspFee: number;
	PayrolledMspFee: number;
	SectorId: number;
	SectorName: string;
	laborCategoryMarkups: LaborCategoryMarkups[];
}

class LaborCategoryMarkups {
	staffingAgencyMarkupId: number;
	laborCategoryId: number;
	broadCastAllowed: boolean;
	recruitedMarkup: number;
	recruitedMspFee: number;
	payrolledMarkup: number;
	payrolledMspFee: number;
	otMultiplier: number;
	dtMultiplier: number;
	tierLevel: number;
	locationMarkups: LocationMarkups[];
}

class LocationMarkups {
	staffingAgencyMarkupAdderId: number;
	locationId: number;
	broadCastAllowed: boolean;
	recruitedMarkupAdder: number;
	payrolledMarkupAdder: number;
	actualRecruitedMarkupAdder: number;
	actualPayrolledMarkupAdder: number;
	tierLevel: number;
	ActualRecruitedMarkup: number;
	PayrolledMarkupAdder: number;
}
