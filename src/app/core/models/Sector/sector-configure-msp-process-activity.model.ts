import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';

export class SectorConfigureMspProcessActivity extends CommonSection{
	IsSkipProcessReqByMsp: boolean;
	IsSkipProcessSubByMsp: boolean;
	IsSkipLIRequestProcessByMsp: boolean;
	IsAutoBroadcastForLiRequest: boolean;
	HideNteRatefromCopyReqLib: boolean;

	constructor(init?: Partial<SectorConfigureMspProcessActivity>) {
		super();
		Object.assign(this, init);
	}
}
