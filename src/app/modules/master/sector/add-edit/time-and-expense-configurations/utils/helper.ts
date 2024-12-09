import { AbstractControl, FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { IDropdown } from "@xrm-shared/models/common.model";
import { SectorTimeAndExpenseConfiguration } from "@xrm-core/models/Sector/sector-time-and-expense-configuration.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { PoType } from "@xrm-shared/services/common-constants/static-data.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface ITimeAndExpenseConfigFM extends ICommonSectionFM {
	IsClpJobRotationAllowed: FormControl<boolean>;
	IsAllowedClpToAddCharge: FormControl<boolean>;
	IsAllTimeAdjustmentApprovalRequired: FormControl<boolean>;
	AllowTimeUploadWithStOtDt: FormControl<boolean>;
	ValidateApprovedAmountWithTimeRecords: FormControl<boolean>;
	AllowStaffingAgencyInTandEApproval: FormControl<boolean>;
	TimeUploadAsApprovedHours: FormControl<boolean>;
	IsAutoApprovedAdjustment: FormControl<boolean>;
	IsPoSentToPm: FormControl<boolean|null>;
	IsPoSentToPoOwner: FormControl<boolean|null>;
	PoType: FormControl<string>;
	DefaultPoForRecruitment: FormControl<string | null>;
	DefaultPoForPayroll: FormControl<string | null>;
	NoConsecutiveWeekMissingEntry: FormControl<IDropdown | null>;
	DefaultPoDepletionForNewLocations: FormControl<string | null>;
}

export function getTimeAndExpenseConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<ITimeAndExpenseConfigFM>({
		...getCommonSectionFormModel(),
		'IsClpJobRotationAllowed': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAllowedClpToAddCharge': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAllTimeAdjustmentApprovalRequired': new FormControl<boolean>(false, { nonNullable: true }),
		'AllowTimeUploadWithStOtDt': new FormControl<boolean>(false, { nonNullable: true }),
		'ValidateApprovedAmountWithTimeRecords': new FormControl<boolean>(false, { nonNullable: true }),
		'AllowStaffingAgencyInTandEApproval': new FormControl<boolean>(false, { nonNullable: true }),
		'TimeUploadAsApprovedHours': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAutoApprovedAdjustment': new FormControl<boolean>(false, { nonNullable: true }),
		'IsPoSentToPm': new FormControl<boolean|null>(false, IsPoSentToPmSwitchsValidation()),
		'IsPoSentToPoOwner': new FormControl<boolean|null>(false, IsPoSentToPmSwitchsValidation()),
		'PoType': new FormControl<string>(PoType['Single Po'].toString(), { nonNullable: true }),
		'DefaultPoForRecruitment': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'DefaultPoForRecruitment')),
		'DefaultPoForPayroll': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'DefaultPoForPayroll')),
		'NoConsecutiveWeekMissingEntry': new FormControl<IDropdown | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'NoConsecutiveWeekMissingEntry')),
		'DefaultPoDepletionForNewLocations': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'DefaultPoDepletionForNewLocations'))
	});
}

export function patchTimeAndExpenseConfig(
	TimeAndExpenseConfigData: SectorTimeAndExpenseConfiguration,
	 formGroup: FormGroup<ITimeAndExpenseConfigFM>
) {
	formGroup.patchValue({
		'IsClpJobRotationAllowed': TimeAndExpenseConfigData.IsClpJobRotationAllowed,
		'IsAllowedClpToAddCharge': TimeAndExpenseConfigData.IsAllowedClpToAddCharge,
		'IsAllTimeAdjustmentApprovalRequired': TimeAndExpenseConfigData.IsAllTimeAdjustmentApprovalRequired,
		'AllowTimeUploadWithStOtDt': TimeAndExpenseConfigData.AllowTimeUploadWithStOtDt,
		'ValidateApprovedAmountWithTimeRecords': TimeAndExpenseConfigData.ValidateApprovedAmountWithTimeRecords,
		'AllowStaffingAgencyInTandEApproval': TimeAndExpenseConfigData.AllowStaffingAgencyInTandEApproval,
		'TimeUploadAsApprovedHours': TimeAndExpenseConfigData.TimeUploadAsApprovedHours,
		'IsAutoApprovedAdjustment': TimeAndExpenseConfigData.IsAutoApprovedAdjustment,
		'IsPoSentToPm': TimeAndExpenseConfigData.IsPoSentToPm,
		'IsPoSentToPoOwner': TimeAndExpenseConfigData.IsPoSentToPoOwner,
		'PoType': TimeAndExpenseConfigData.PoType.toString(),
		'DefaultPoForRecruitment': TimeAndExpenseConfigData.DefaultPoForRecruitment,
		'DefaultPoForPayroll': TimeAndExpenseConfigData.DefaultPoForPayroll,
		'NoConsecutiveWeekMissingEntry': { 'Text': TimeAndExpenseConfigData.NoConsecutiveWeekMissingEntryName ?? '', 'Value': TimeAndExpenseConfigData.NoConsecutiveWeekMissingEntry?.toString() ?? ''},
		'DefaultPoDepletionForNewLocations': TimeAndExpenseConfigData.DefaultPoDepletionForNewLocations,
		'SectorId': TimeAndExpenseConfigData.SectorId,
		'SectorUkey': TimeAndExpenseConfigData.SectorUkey,
		'StatusCode': TimeAndExpenseConfigData.StatusCode
	});
}

function IsPoSentToPmSwitchsValidation(): ValidatorFn {
	return (control: AbstractControl | undefined) => {
		const IsPoSentToPm = control?.parent?.get('IsPoSentToPm'),
			IsPoSentToPoOwner = control?.parent?.get('IsPoSentToPoOwner');
		if (IsPoSentToPm?.value === false && IsPoSentToPoOwner?.value === false) {
			IsPoSentToPm?.setErrors({ error: true });
			IsPoSentToPoOwner?.setErrors({ error: true });
		} else {
			IsPoSentToPm?.setErrors(null);
			IsPoSentToPoOwner?.setErrors(null);
		}
		return null;
	};
}
