import { FormGroup } from "@angular/forms";

import { SectorPricingModelConfiguration } from "@xrm-core/models/Sector/sector-pricing-model-configuration.model";
import { IPricingModelConfigFM } from "./formModel";

export function patchPricingModelConfig(PricingModelConfigData: SectorPricingModelConfiguration, formGroup: FormGroup<IPricingModelConfigFM>) {
	/* Due to ASYNC nature and too many radio buttons patching is not successfully convert it into string when
					switch showAll gets true, so introduce conversion function before patching the values */
	conversion(PricingModelConfigData);
	formGroup.patchValue({
		'MspFeeType': { 'Text': PricingModelConfigData.MspFeeTypeName ?? '', 'Value': PricingModelConfigData.MspFeeType?.toString() ?? '' },
		'ClientPaysStaffingAgencyDirectly': PricingModelConfigData.ClientPaysStaffingAgencyDirectly,
		'IsOtEligibilityVisible': PricingModelConfigData.IsOtEligibilityVisible
	});

	formGroup.patchValue({
		'CostEstimationType': PricingModelConfigData.CostEstimationType,
		'PricingModel': PricingModelConfigData.PricingModel,
		'BillRateValidation': PricingModelConfigData.BillRateValidation,
		'SectorId': PricingModelConfigData.SectorId,
		'SectorUkey': PricingModelConfigData.SectorUkey,
		'StatusCode': PricingModelConfigData.StatusCode
	});
}

function conversion(pricingModel: SectorPricingModelConfiguration) {
	pricingModel.CostEstimationType = pricingModel.CostEstimationType.toString();
	pricingModel.PricingModel = pricingModel.PricingModel.toString();
	pricingModel.MarkUpType = pricingModel.MarkUpType?.toString();
	pricingModel.BillRateValidation = pricingModel.BillRateValidation.toString();
}
