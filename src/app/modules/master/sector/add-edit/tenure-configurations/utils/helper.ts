import { FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { TenurePolicyApplicableValidations } from "./Tenure-Config-DependentValidation";
import { TenureLimitTypes } from "@xrm-shared/services/common-constants/static-data.enum";
import { SectorTenureConfiguration } from "@xrm-core/models/Sector/sector-tenure-configuration.model";

export interface ITenureConfigFM extends ICommonSectionFM {
	TenurePolicyApplicable: FormControl<boolean | null>;
	IsTenureAllowRenewedAfterResetPeriod: FormControl<boolean>;
	TenureLimitType: FormControl<string>;
	ReqTenureLimit: FormControl<number | null>;
	ExtTenureLimit: FormControl<number | null>;
	ClpTenureLimit: FormControl<number | null>;
	TenureResetPeriod: FormControl<number | null>;
}

export function getTenureConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<ITenureConfigFM>({
		...getCommonSectionFormModel(),
		'TenurePolicyApplicable': new FormControl<boolean | null>(false, [TenurePolicyApplicableValidations(customValidators)]),
		'IsTenureAllowRenewedAfterResetPeriod': new FormControl<boolean>(true, {nonNullable: true}),
		'TenureLimitType': new FormControl<string>(TenureLimitTypes['Length of Assignment'].toString(), {nonNullable: true}),
		'ReqTenureLimit': new FormControl<number | null>(null),
		'ExtTenureLimit': new FormControl<number | null>(null),
		'ClpTenureLimit': new FormControl<number | null>(null),
		'TenureResetPeriod': new FormControl<number | null>(null)
	});
}

export function patchTenureConfig(tenureConfigData: SectorTenureConfiguration, formGroup: FormGroup) {
	tenureConfigData.TenureLimitType = tenureConfigData.TenureLimitType?.toString();
	formGroup.patchValue(tenureConfigData, { emitEvent: false, onlySelf: true });
}
