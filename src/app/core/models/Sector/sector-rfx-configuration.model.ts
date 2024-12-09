import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { SectorRfxStandardField } from './sector-rfx-standard-fields.model';
import { SectorSowCommodityType } from './sector-sow-commodity-types.model';
import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { IRfxConfigFM } from '@xrm-master/sector/add-edit/rfx-configurations/utils/helper';

type nullableNumber = number | null;
type nullableString = string | null;
export class SectorRfxConfiguration extends CommonSection {
	IsRfxSowRequired: boolean;
	IsProcessSowbyMsp: boolean;
	IcMspFeePercentage: nullableNumber;
	DefaultPoForSowIc: nullableString;
	PoTypeSowIc: string|null;
	PoTypeSowIcName: string;
	SowMspFeePercentage: nullableNumber;
	SowAdminFee: nullableNumber;
	IsReqLibraryUsedforTmSow: boolean;
	IsSkipProcessRfxSubmittal: boolean;
	IsSowAmountLimitRequired: boolean;
	SowAmountLimit: nullableNumber;
	SectorRfxStandardFields: SectorRfxStandardField[];
	SectorSowCommodityTypes: SectorSowCommodityType[];

	constructor(init?: Partial<ɵTypedOrUntyped<IRfxConfigFM, ɵFormGroupRawValue<IRfxConfigFM>, any>>) {
		super();
		Object.assign(this, init);
	}
}

export class StepDataModel {
	label: nullableString;
	icon: nullableString;
	id: nullableString;
	name: nullableString;
	[ key: string ]: any;
}
