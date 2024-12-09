import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { IsSystemRankingFunctionalityValidation, QuestionBankRequiredValidation } from "../Req-Config-DependentValidations";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { validatorsParams } from "@xrm-master/sector/common/common-sector-code";
import { SectorRequisitionConfiguration } from "@xrm-core/models/Sector/sector-requisition-configuration.model";
import { IDropdown } from "@xrm-shared/models/common.model";

export interface IRequisitionConfigFM extends ICommonSectionFM{
	IsExtendedWorkLocationAddress: FormControl<boolean>;
	DisplayCanSupplierContactQusInReq: FormControl<boolean>;
	RestrictReqToOnePos: FormControl<boolean>;
	MaskSubmittedMarkUpAndWageRate: FormControl<boolean>;
	IsSecurityClearance: FormControl<boolean>;
	QuestionBankRequired: FormControl<boolean|null>;
	QuestionToBeAnsweredBy: FormControl<IDropdown | null>;
	IsRateExceptionAllowed: FormControl<boolean>;
	LiFillRateWeekAhead: FormControl<number | null>;
	BroadCastInterval: FormControl<number | null>;
	QuestionBankLabel: FormControl<string | null>;
	IsPositionDetailsEditable: FormControl<boolean>;
	IsSystemCandidateRankingMandatory: FormControl<boolean>;
	IsSystemRankingFunctionality: FormControl<boolean|null>;
	EnableManagerScoring: FormControl<boolean>;
	IsManagerScoringMandatory: FormControl<boolean>;
	SectorAssignmentTypes: FormArray<FormGroup<ISectorAssignmentTypes>>;
	SectorCandidateEvaluationItems: FormArray<FormGroup<ISectorCandidateEvaluationItems>>;
}

export interface ISectorAssignmentTypes {
		Id: FormControl<number | null>;
		AssignmentName: FormControl<string | null>;
		DisplayOrder: FormControl<number | null>;
}

export interface ISectorCandidateEvaluationItems {
	Id: FormControl<number | null>;
	EvaluationRequirementId: FormControl<string | null>;
	Description: FormControl<string | null>;
	DisplayOrder: FormControl<number | null>;
	IsVisible: FormControl<boolean | null>;
	EvaluationRequirementName: FormControl<string | null>;
}

export function getRequisitionConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IRequisitionConfigFM>({
		...getCommonSectionFormModel(),
		'IsExtendedWorkLocationAddress': new FormControl<boolean>(false, { nonNullable: true }),
		'DisplayCanSupplierContactQusInReq': new FormControl<boolean>(false, { nonNullable: true }),
		'RestrictReqToOnePos': new FormControl<boolean>(false, { nonNullable: true }),
		'MaskSubmittedMarkUpAndWageRate': new FormControl<boolean>(false, { nonNullable: true }),
		'IsSecurityClearance': new FormControl<boolean>(false, { nonNullable: true }),
		'QuestionBankRequired': new FormControl<boolean>(false, QuestionBankRequiredValidation(customValidators)),
		'QuestionToBeAnsweredBy': new FormControl<IDropdown | null>(null),
		'IsRateExceptionAllowed': new FormControl<boolean>(false, { nonNullable: true }),
		'LiFillRateWeekAhead': new FormControl<number | null>(null, [customValidators.RangeValidator(magicNumber.zero, magicNumber.nine, 'FieldSpecificValueGreaterEqualAndLessThan', validatorsParams('LiFillRateWeekAhead', magicNumber.zero, magicNumber.ten))]),
		'BroadCastInterval': new FormControl<number | null>(null, [customValidators.requiredValidationsWithMessage('PleaseEnterData', 'BroadCastInterval'), customValidators.RangeValidator(magicNumber.zero, magicNumber.ninetyNine, 'MaxValue100ValidationMessage')]),
		'QuestionBankLabel': new FormControl<string | null>(null),
		'IsPositionDetailsEditable': new FormControl<boolean>(false, { nonNullable: true }),
		'IsSystemCandidateRankingMandatory': new FormControl<boolean>(false, { nonNullable: true }),
		'IsSystemRankingFunctionality': new FormControl<boolean|null>(false, IsSystemRankingFunctionalityValidation()),
		'EnableManagerScoring': new FormControl<boolean>(false, { nonNullable: true }),
		'IsManagerScoringMandatory': new FormControl<boolean>(false, { nonNullable: true }),
		'SectorAssignmentTypes': new FormArray([
			new FormGroup<ISectorAssignmentTypes>({
				'Id': new FormControl<number | null>(magicNumber.zero),
				'AssignmentName': new FormControl<string | null>(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'ItemTitle')),
				'DisplayOrder': new FormControl<number | null>(null)
			})
		]),
		'SectorCandidateEvaluationItems': new FormArray<FormGroup<ISectorCandidateEvaluationItems>>([])
	});
}

export function patchRequisitionConfig(requisitionConfigData: SectorRequisitionConfiguration, formGroup: FormGroup<IRequisitionConfigFM>) {
	formGroup.patchValue({
		'IsExtendedWorkLocationAddress': requisitionConfigData.IsExtendedWorkLocationAddress,
		'DisplayCanSupplierContactQusInReq': requisitionConfigData.DisplayCanSupplierContactQusInReq,
		'RestrictReqToOnePos': requisitionConfigData.RestrictReqToOnePos,
		'MaskSubmittedMarkUpAndWageRate': requisitionConfigData.MaskSubmittedMarkUpAndWageRate,
		'IsSecurityClearance': requisitionConfigData.IsSecurityClearance,
		'QuestionBankRequired': requisitionConfigData.QuestionBankRequired,
		'QuestionToBeAnsweredBy': { Text: requisitionConfigData.QuestionToBeAnsweredByName ?? '', Value: requisitionConfigData.QuestionToBeAnsweredBy?.toString() ?? ''},
		'LiFillRateWeekAhead': requisitionConfigData.LiFillRateWeekAhead,
		'BroadCastInterval': requisitionConfigData.BroadCastInterval,
		'QuestionBankLabel': requisitionConfigData.QuestionBankLabel,
		'IsPositionDetailsEditable': requisitionConfigData.IsPositionDetailsEditable,
		'IsSystemCandidateRankingMandatory': requisitionConfigData.IsSystemCandidateRankingMandatory,
		'IsSystemRankingFunctionality': requisitionConfigData.IsSystemRankingFunctionality,
		'EnableManagerScoring': requisitionConfigData.EnableManagerScoring,
		'IsManagerScoringMandatory': requisitionConfigData.IsManagerScoringMandatory,
		'SectorUkey': requisitionConfigData.SectorUkey,
		'SectorId': requisitionConfigData.SectorId,
		'StatusCode': requisitionConfigData.StatusCode
	});
}
