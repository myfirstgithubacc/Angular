import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SectorOrgLevelConfigs } from "@xrm-core/models/Sector/sector-org-level-configs.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface IOrgStructureFM extends ICommonSectionFM{
	SectorOrgLevelConfigDtos: FormArray<FormGroup<ISectorOrgLevelConfigDtos>>;
}

export interface ISectorOrgLevelConfigDtos{
    Id: FormControl<number|null>;
    OrgName : FormControl<string | null>;
    IsVisible: FormControl<boolean|null>;
    IsShowHide: FormControl<boolean|null>;
    IsMandatory: FormControl<boolean|null>;
}

export function getOrgStructureFormModel(customValidators: CustomValidators) {
	return new FormGroup<IOrgStructureFM>({
		...getCommonSectionFormModel(),
		'SectorOrgLevelConfigDtos': new FormArray<FormGroup<ISectorOrgLevelConfigDtos>>([
			new FormGroup<ISectorOrgLevelConfigDtos>({
				'Id': new FormControl<number|null>(magicNumber.zero),
				'OrgName': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ScreenLabelName')),
				'IsVisible': new FormControl<boolean|null>(true),
				'IsShowHide': new FormControl<boolean|null>(true),
				'IsMandatory': new FormControl<boolean|null>(true)
			})
		])
	});
}

export function patchOrgStructure(OrgStructure: SectorOrgLevelConfigs, formGroup: FormGroup<IOrgStructureFM>){
	formGroup.patchValue({
		'SectorId': OrgStructure.SectorId,
		'SectorUkey': OrgStructure.SectorUkey,
		'StatusCode': OrgStructure.StatusCode
	});
}
