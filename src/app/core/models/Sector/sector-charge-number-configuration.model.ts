import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { SectorCostCenterConfig } from './sector-cost-center-configs.model';
import { IChargeNumberConfigFM } from '@xrm-master/sector/add-edit/charge-number-configurations/utils/helper';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';

export class SectorChargeNumberConfiguration extends CommonSection{
	IsChargeEnteredManually: boolean;
	IsMultipleTimeApprovalNeededOtRateType: boolean;
	IsMultipleTimeApprovalNeeded: boolean;
	HasChargeEffectiveDate: boolean;
	IsChargeInReqPsr: boolean;
	NoOfSegment: string;
	SectorCostCenterConfigs: SectorCostCenterConfig[];

	constructor(init?: Partial<ɵTypedOrUntyped<IChargeNumberConfigFM, ɵFormGroupRawValue<IChargeNumberConfigFM>, any>>) {
		super();

		this.NoOfSegment = init?.NoOfSegment?.Value ?? '';
		Object.assign(this, init);
	}
}

export interface SectorChargeNumberConfig {
	UKey: string | undefined | null;
	IsChargeEnteredManually: boolean;
	IsMultipleTimeApprovalNeededOtRateType: boolean | undefined | null;
	IsMultipleTimeApprovalNeeded: boolean | undefined | null;
	HasChargeEffectiveDate: boolean;
	IsChargeInReqPsr: boolean;
	NoOfSegment: number | undefined | null;
	SectorCostCenterConfigs: SectorCostCenterConfig[];
	SectorId: number | undefined | null;
}
