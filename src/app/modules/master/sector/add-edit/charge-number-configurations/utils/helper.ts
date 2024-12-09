import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SectorChargeNumberConfiguration } from "@xrm-core/models/Sector/sector-charge-number-configuration.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { IDropdown } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface IChargeNumberConfigFM extends ICommonSectionFM {
	IsChargeEnteredManually: FormControl<boolean>;
	IsMultipleTimeApprovalNeeded: FormControl<boolean>;
	HasChargeEffectiveDate: FormControl<boolean>;
	IsChargeInReqPsr: FormControl<boolean>;
	NoOfSegment: FormControl<IDropdown | null>;
	SectorCostCenterConfigs: FormArray<FormGroup<ISectorCostCenterConfig>>;
}

export interface ISectorCostCenterConfig {
	Id: FormControl<number>;
	SegmentName: FormControl<string | null>;
	SegmentMaxLength: FormControl<number | null>;
	SegmentMinLength: FormControl<number | null>;
}

export function getChargeNumberConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IChargeNumberConfigFM>({
		...getCommonSectionFormModel(),
		'IsChargeEnteredManually': new FormControl<boolean>(true, {nonNullable: true}),
		'IsMultipleTimeApprovalNeeded': new FormControl<boolean>(false, {nonNullable: true}),
		'HasChargeEffectiveDate': new FormControl<boolean>(false, {nonNullable: true}),
		'IsChargeInReqPsr': new FormControl<boolean>(false, {nonNullable: true}),
		'NoOfSegment': new FormControl<IDropdown | null>({Text: '1', Value: '1'}, [customValidators.requiredValidationsWithMessage('PleaseSelectData', 'NoOfSegments')]),
		'SectorCostCenterConfigs': new FormArray<FormGroup<ISectorCostCenterConfig>>([
			new FormGroup<ISectorCostCenterConfig>({
				'Id': new FormControl<number>(magicNumber.zero, {nonNullable: true}),
				'SegmentName': new FormControl<string | null>(null, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'SegmentName')]),
				'SegmentMaxLength': new FormControl<number | null>(null),
				'SegmentMinLength': new FormControl<number | null>(null)
			})
		])
	});
}

export function patchCostAccCodeConfig(CostAccCodeConfigData: SectorChargeNumberConfiguration, formGroup: FormGroup<IChargeNumberConfigFM>) {
	formGroup.patchValue({
		'IsChargeEnteredManually': CostAccCodeConfigData.IsChargeEnteredManually,
		'IsMultipleTimeApprovalNeeded': CostAccCodeConfigData.IsMultipleTimeApprovalNeeded,
		'HasChargeEffectiveDate': CostAccCodeConfigData.HasChargeEffectiveDate,
		'IsChargeInReqPsr': CostAccCodeConfigData.IsChargeInReqPsr,
		'NoOfSegment': {
			'Text': Number(CostAccCodeConfigData.NoOfSegment) === Number(magicNumber.zero)
				? '1'
				: CostAccCodeConfigData.NoOfSegment.toString(),
			'Value': Number(CostAccCodeConfigData.NoOfSegment) === Number(magicNumber.zero)
				? '1'
				: CostAccCodeConfigData.NoOfSegment.toString()
		},
		'SectorId': CostAccCodeConfigData.SectorId,
		'SectorUkey': CostAccCodeConfigData.SectorUkey,
		'StatusCode': CostAccCodeConfigData.StatusCode
	});
}
