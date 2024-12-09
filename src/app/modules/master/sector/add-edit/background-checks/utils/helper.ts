import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SectorBackgroundCheck } from "@xrm-core/models/Sector/sector-background-check.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface IBackgroundChecksFM extends ICommonSectionFM {
	Id: FormControl<number | null>;
	AllowToFillCandidateWithPendingCompliance: FormControl<boolean>;
	AllowAttachPreEmploymentDocToClientEmail: FormControl<boolean>;
	IsActiveClearance: FormControl<boolean>;
	IsDrugResultVisible: FormControl<boolean>;
	IsDrugScreenItemEditable: FormControl<boolean>;
	DefaultDrugResultValue: FormControl<string | null>;
	IsBackGroundCheckVisible: FormControl<boolean>;
	IsBackGroundItemEditable: FormControl<boolean>;
	DefaultBackGroundCheckValue: FormControl<string | null>;
	SectorBackgrounds: FormArray<FormGroup<ISectorBackgrounds>>;
}

export interface ISectorBackgrounds {
	Id: FormControl<number | null>;
	ComplianceItemLabel: FormControl<string | null>;
	IsVisibleToClient: FormControl<boolean|null>;
	IsApplicableForLi: FormControl<boolean|null>;
	IsApplicableForProfessional: FormControl<boolean|null>;
	IsApplicableForSow: FormControl<boolean|null>;
	DisplayOrder: FormControl<number|null>;
	ComplianceType: FormControl<string|null>;
	ComplianceFieldName: FormControl<string | null>;
	IsMandatorySign: FormControl<boolean|null>;
	IsShowHide: FormControl<boolean|null>;
}

export function getBackgroundChecksFormModel(customValidators: CustomValidators) {
	return new FormGroup<IBackgroundChecksFM>({
		...getCommonSectionFormModel(),
		'Id': new FormControl<number | null>(magicNumber.zero),
		'AllowToFillCandidateWithPendingCompliance': new FormControl<boolean>(false, { nonNullable: true }),
		'AllowAttachPreEmploymentDocToClientEmail': new FormControl<boolean>(false, { nonNullable: true }),
		'IsActiveClearance': new FormControl<boolean>(false, { nonNullable: true }),
		'IsDrugResultVisible': new FormControl<boolean>(true, { nonNullable: true }),
		'IsDrugScreenItemEditable': new FormControl<boolean>(false, { nonNullable: true }),
		'DefaultDrugResultValue': new FormControl<string | null>('true'),
		'IsBackGroundCheckVisible': new FormControl<boolean>(true, { nonNullable: true }),
		'IsBackGroundItemEditable': new FormControl<boolean>(false, { nonNullable: true }),
		'DefaultBackGroundCheckValue': new FormControl<string | null>('true'),
		'SectorBackgrounds': new FormArray<FormGroup<ISectorBackgrounds>>([
			new FormGroup<ISectorBackgrounds>({
				'Id': new FormControl<number | null>(magicNumber.zero),
				'ComplianceItemLabel': new FormControl<string | null>(null, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ScreenLabelName')]),
				'IsVisibleToClient': new FormControl<boolean>(true, { nonNullable: true }),
				'IsApplicableForLi': new FormControl<boolean>(false, { nonNullable: true }),
				'IsApplicableForProfessional': new FormControl<boolean>(false, { nonNullable: true }),
				'IsApplicableForSow': new FormControl<boolean>(false, { nonNullable: true }),
				'DisplayOrder': new FormControl<number | null>(magicNumber.zero),
				'ComplianceType': new FormControl<string|null>('B'),
				'ComplianceFieldName': new FormControl<string | null>(null),
				'IsMandatorySign': new FormControl<boolean>(true, { nonNullable: true }),
				'IsShowHide': new FormControl<boolean>(true, { nonNullable: true })
			})
		])
	});
}

export function patchBackgroundChecks(backgroundCheckData: SectorBackgroundCheck, formGroup: FormGroup<IBackgroundChecksFM>) {
	formGroup.patchValue({
		'Id': backgroundCheckData.Id,
		'AllowToFillCandidateWithPendingCompliance': backgroundCheckData.AllowToFillCandidateWithPendingCompliance,
		'AllowAttachPreEmploymentDocToClientEmail': backgroundCheckData.AllowAttachPreEmploymentDocToClientEmail,
		'IsDrugResultVisible': backgroundCheckData.IsDrugResultVisible,
		'IsDrugScreenItemEditable': backgroundCheckData.IsDrugScreenItemEditable,
		'DefaultDrugResultValue': (backgroundCheckData.IsBackGroundCheckVisible) ?
			backgroundCheckData.DefaultDrugResultValue?.toString()
			: 'true',
		'IsBackGroundCheckVisible': backgroundCheckData.IsBackGroundCheckVisible,
		'IsBackGroundItemEditable': backgroundCheckData.IsBackGroundItemEditable,
		'DefaultBackGroundCheckValue': (backgroundCheckData.IsDrugResultVisible) ?
			backgroundCheckData.DefaultBackGroundCheckValue?.toString()
			: 'true',
		'SectorUkey': backgroundCheckData.SectorUkey,
		'StatusCode': backgroundCheckData.StatusCode,
		'SectorId': backgroundCheckData.SectorId,
		'IsActiveClearance': backgroundCheckData.IsActiveClearance
	});
}
