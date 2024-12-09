import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { UniqueSubmittal } from './sector-unique-submittal.model';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { ISubmittalConfigFM } from '@xrm-master/sector/add-edit/submittal-configurations/utils/helper';

type nullableNumber = number | null;
export class SectorSubmittalConfiguration extends CommonSection {
	NonW2ClpAccepted: boolean;
	IsSubmittalReminderToManager: boolean;
	SubmittalReminderInterval: string | null;
	SubmittalReminderToStaffingForNotOfferAccepting: boolean;
	SubmittalReminderIntervalToStaffing: string | null;
	AllowSupplierToSubmitExistingClps: boolean;
	UniqueSubmittals: UniqueSubmittal[];

	constructor(init?: Partial<ɵTypedOrUntyped<ISubmittalConfigFM, ɵFormGroupRawValue<ISubmittalConfigFM>, any>>) {
		super();
		Object.assign(this, init);
	}
}
