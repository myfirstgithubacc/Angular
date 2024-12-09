import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IPricingModelConfigFM } from '@xrm-master/sector/add-edit/pricing-model-configurations/utils/formModel';
import { IDropdownWithExtras, IRadioGroupModel, IRadioWithExtras } from '@xrm-shared/models/common.model';

type nullableString = string | undefined | null;
export class SectorPricingModelConfiguration extends CommonSection {
	CostEstimationType: string;
	CostEstimationTypeName: string;
	MspFeeType: nullableString;
	MspFeeTypeName: nullableString;
	PricingModel: string;
	PricingModelName: nullableString;
	MarkUpType: nullableString;
	MarkUpTypeName: nullableString;
	BillRateValidation: string;
	BillRateValidationName: string;
	ClientPaysStaffingAgencyDirectly: boolean;
	IsOtEligibilityVisible: boolean;

	constructor(init?: Partial<ɵTypedOrUntyped<IPricingModelConfigFM, ɵFormGroupRawValue<IPricingModelConfigFM>, any>>) {
		super();
		this.MspFeeType = init?.MspFeeType?.Value;
		this.MspFeeTypeName = init?.MspFeeType?.Text;
		Object.assign(this, init);
	}
}

export interface PricingModelConfigDropdowns {
	'CostEstimationTypes': IRadioWithExtras[] | undefined | null,
	'MspFeeTypes': IDropdownWithExtras[] | undefined | null,
	'PricingModels': IRadioWithExtras[] | undefined | null,
	'BillRateValidations': IRadioGroupModel | undefined | null
}
