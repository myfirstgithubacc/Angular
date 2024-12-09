import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';

export class SectorEmailApprovalConfiguration extends CommonSection{
	IsQuickLinkToApprovalEmails: boolean;

	constructor(init?: Partial<SectorEmailApprovalConfiguration>) {
		super();
		Object.assign(this, init);
	}
}
