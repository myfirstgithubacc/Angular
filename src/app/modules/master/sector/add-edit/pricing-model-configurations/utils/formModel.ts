import { FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { IDropdown } from "@xrm-shared/models/common.model";
import { BillRateValidations, CostEstimationTypes, MarkUpTypes, MspFeeTypes, PricingModels } from "@xrm-shared/services/common-constants/static-data.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface IPricingModelConfigFM extends ICommonSectionFM {
	CostEstimationType: FormControl<string>;
	MspFeeType: FormControl<IDropdown | null>;
	ClientPaysStaffingAgencyDirectly: FormControl<boolean>;
	PricingModel: FormControl<string>;
	BillRateValidation: FormControl<string>;
	MarkUpType: FormControl<string>;
	IsOtEligibilityVisible: FormControl<boolean>;
}

export function getPricingModelConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IPricingModelConfigFM>({
		...getCommonSectionFormModel(),
		'CostEstimationType': new FormControl<string>(CostEstimationTypes["Period of Performance"].toString(), {nonNullable: true}),
		'MspFeeType': new FormControl<IDropdown>(
			{'Text': 'Staffing Agency Funded – Fee Deducted from Bill Rate', 'Value': MspFeeTypes.B1.toString() },
		 [customValidators.requiredValidationsWithMessage('PleaseSelectData', 'MspFeeType')]
		),
		'ClientPaysStaffingAgencyDirectly': new FormControl<boolean>(false, {nonNullable: true}),
		'PricingModel': new FormControl<string>(PricingModels["Markup Based"].toString(), {nonNullable: true}),
		'BillRateValidation': new FormControl<string>(BillRateValidations.NTE.toString(), {nonNullable: true}),
		'MarkUpType': new FormControl<string>(MarkUpTypes["Staffing Agency Std. Mark Up %"].toString(), {nonNullable: true}),
		'IsOtEligibilityVisible': new FormControl<boolean>(false, {nonNullable: true})
	});
}
