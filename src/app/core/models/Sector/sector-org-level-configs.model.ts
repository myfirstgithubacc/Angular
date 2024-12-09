import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';

type nullableNumber = number | null;
type nullableString = string | null;
export class SectorOrgLevelConfigs extends CommonSection{
	SectorOrgLevelConfigDtos: SectorOrgLevelConfigDtos[];
	constructor(init?: Partial<SectorOrgLevelConfigs>) {
		super();
		Object.assign(this, init);
	}
}

export interface SectorOrgLevelConfigDtos {
	IsVisible: boolean|null;
	IsMandatory: boolean|null;
	IsShowHide?: boolean|null;
	OrgName: nullableString;
	OrgType?: nullableNumber;
	Id: nullableNumber;
}
