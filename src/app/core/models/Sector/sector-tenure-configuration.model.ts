import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { ITenureConfigFM } from '@xrm-master/sector/add-edit/tenure-configurations/utils/helper';
import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class SectorTenureConfiguration extends CommonSection{
	TenurePolicyApplicable: boolean;
	TenureLimitType: nullableString;
	TenureLimitTypeName: nullableString;
	ReqTenureLimit: nullableNumber;
	ExtTenureLimit: nullableNumber;
	ClpTenureLimit: nullableNumber;
	TenureResetPeriod: nullableNumber;
	IsTenureAllowRenewedAfterResetPeriod: boolean;

	constructor(init?: Partial<ɵTypedOrUntyped<ITenureConfigFM, ɵFormGroupRawValue<ITenureConfigFM>, any>>) {
		super();
		Object.assign(this, init);
	}
}
