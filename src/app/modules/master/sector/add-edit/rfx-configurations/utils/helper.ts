import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SectorRfxConfiguration } from "@xrm-core/models/Sector/sector-rfx-configuration.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { PoTypeSowIcs } from "@xrm-shared/services/common-constants/static-data.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { IsRfxSowRequiredValidations } from "./Rfx-Config-DependentValidations";

export interface IRfxConfigFM extends ICommonSectionFM {
	IsRfxSowRequired: FormControl<boolean | null>;
	SowMspFeePercentage: FormControl<number | null>;
	IcMspFeePercentage: FormControl<number | null>;
	SowAdminFee: FormControl<number | null>;
	IsReqLibraryUsedforTmSow: FormControl<boolean>;
	IsSkipProcessRfxSubmittal: FormControl<boolean>;
	IsProcessSowbyMsp: FormControl<boolean>;
	IsSowAmountLimitRequired: FormControl<boolean>;
	SowAmountLimit: FormControl<number | null>;
	PoTypeSowIc: FormControl<string | null>;
	DefaultPoForSowIc: FormControl<string | null>;
	SectorRfxStandardFields: FormArray<FormGroup<ISectorRfxStandardFields>>;
	SectorSowCommodityTypes: FormArray<FormGroup<ISectorSowCommodityType>>;
}

export interface ISectorRfxStandardFields {
	Id: FormControl<number>;
	RfxLabelId: FormControl<number | null>;
	DisplayName: FormControl<string | null>;
	StandardFieldName?: FormControl<string | null>;
}

export interface ISectorSowCommodityType {
	Id: FormControl<number>;
	SowCommodityConfigId: FormControl<number | null>;
	CommodityTypeName?: FormControl<string | null>;
	CurrentCommodityTypeName: FormControl<string | null>;
	Active: FormControl<boolean>;
}

export function getRfxConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IRfxConfigFM>({
		...getCommonSectionFormModel(),
		'IsRfxSowRequired': new FormControl<boolean | null>(false, IsRfxSowRequiredValidations(customValidators)),
		'SowMspFeePercentage': new FormControl<number | null>(null),
		'IcMspFeePercentage': new FormControl<number | null>(null),
		'SowAdminFee': new FormControl<number | null>(null),
		'IsReqLibraryUsedforTmSow': new FormControl<boolean>(false, { nonNullable: true }),
		'IsSkipProcessRfxSubmittal': new FormControl<boolean>(false, { nonNullable: true }),
		'IsProcessSowbyMsp': new FormControl<boolean>(false, { nonNullable: true }),
		'IsSowAmountLimitRequired': new FormControl<boolean>(false, { nonNullable: true }),
		'SowAmountLimit': new FormControl<number | null>(null),
		'PoTypeSowIc': new FormControl<string | null>(PoTypeSowIcs['Multiple Po'].toString()),
		'DefaultPoForSowIc': new FormControl<string | null>(null),
		'SectorRfxStandardFields': new FormArray<FormGroup<ISectorRfxStandardFields>>([
			new FormGroup<ISectorRfxStandardFields>({
				'Id': new FormControl<number>(magicNumber.zero, {nonNullable: true}),
				'RfxLabelId': new FormControl<number | null>(magicNumber.one),
				'DisplayName': new FormControl<string | null>(null),
				'StandardFieldName': new FormControl<string | null>(null)
			})
		]),
		'SectorSowCommodityTypes': new FormArray<FormGroup<ISectorSowCommodityType>>([
			new FormGroup<ISectorSowCommodityType>({
				'Id': new FormControl<number>(magicNumber.zero, {nonNullable: true}),
				'SowCommodityConfigId': new FormControl<number | null>(magicNumber.one),
				'CommodityTypeName': new FormControl<string | null>(null),
				'CurrentCommodityTypeName': new FormControl<string | null>(null),
				'Active': new FormControl<boolean>(false, {nonNullable: true})
			})
		])
	});
}

export function patchRfxConfig(RfxConfigData: SectorRfxConfiguration, formGroup: FormGroup<IRfxConfigFM>) {
	RfxConfigData.PoTypeSowIc = RfxConfigData.PoTypeSowIc?.toString() ?? PoTypeSowIcs['Multiple Po'].toString();
	formGroup.patchValue({
		'IsRfxSowRequired': RfxConfigData.IsRfxSowRequired,
		'SowMspFeePercentage': RfxConfigData.SowMspFeePercentage,
		'IcMspFeePercentage': RfxConfigData.IcMspFeePercentage,
		'SowAdminFee': RfxConfigData.SowAdminFee,
		'IsReqLibraryUsedforTmSow': RfxConfigData.IsReqLibraryUsedforTmSow,
		'IsSkipProcessRfxSubmittal': RfxConfigData.IsSkipProcessRfxSubmittal,
		'IsProcessSowbyMsp': RfxConfigData.IsProcessSowbyMsp,
		'IsSowAmountLimitRequired': RfxConfigData.IsSowAmountLimitRequired,
		'SowAmountLimit': RfxConfigData.SowAmountLimit,
		'PoTypeSowIc': RfxConfigData.PoTypeSowIc,
		'DefaultPoForSowIc': RfxConfigData.DefaultPoForSowIc,
		'SectorId': RfxConfigData.SectorId,
		'SectorUkey': RfxConfigData.SectorUkey,
		'StatusCode': RfxConfigData.StatusCode
	});
}
