import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { SectorBackground } from './sector-backgrounds.model';

export class SectorBackgroundCheck extends CommonSection{
	Id: number | null;
	AllowToFillCandidateWithPendingCompliance: boolean;
	AllowAttachPreEmploymentDocToClientEmail: boolean;
	IsActiveClearance: boolean;
	IsDrugScreenItemEditable: boolean;
	IsBackGroundItemEditable: boolean;
	IsDrugResultVisible: boolean;
	DefaultDrugResultValue: string | null;
	IsBackGroundCheckVisible: boolean;
	DefaultBackGroundCheckValue: string | null;
	SectorBackgrounds: SectorBackground[];
	constructor(init?: Partial<SectorBackgroundCheck>) {
		super();
		Object.assign(this, init);
	}
}
