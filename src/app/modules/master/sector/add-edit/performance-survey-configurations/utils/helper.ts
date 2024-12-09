import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { IsAvgSurveyScoreAllowForCommentValidations, SurveyAllowedForAssignmentValidations } from "./Performance-Survey-DependentValidations";
import { SectorPerformanceSurveyConfiguration } from "@xrm-core/models/Sector/sector-performance-survey-configuration.model";
import { IDropdown } from "@xrm-shared/models/common.model";

export interface IPerformanceSurveyConfigFM extends ICommonSectionFM {
	Id: FormControl<number>;
	SurveyForClosedReq: FormControl<boolean>;
	SurveyAllowedForAssignment: FormControl<boolean | null>;
	AfterAssignmentEndDate: FormControl<boolean>;
	NoOfDaysAfterAssignmentStart: FormControl<boolean>;
	NoOfDaysAfterStartDateLevels: FormArray<FormGroup<INoOfDaysAfterStartDateLevels>>;
	ScheduleThroughoutLengthOfAssignment: FormControl<boolean>;
	LengthOfAssignment: FormControl<number | null>;
	LengthOfAssignmentType: FormControl<IDropdown | null>;
	CanSurveyAnyTime: FormControl<boolean>;
	DisplayQuestion: FormControl<boolean>;
	QuestionLabel: FormControl<string | null>;
	DisplayNoThanks: FormControl<boolean>;
	IsAvgSurveyScoreAllowForComment: FormControl<boolean | null>;
	SectorClpSurveyScales: FormArray<FormGroup<ISectorClpSurveyScales>>;
	SectorClpSurveyPerformanceFactors: FormArray<FormGroup<ISectorClpSurveyPerformanceFactors>>;
	AvgSurveyScore: FormControl<number | null>;
	SectorRequisitionSurveyPerformanceFactors: FormArray<FormGroup<ISectorRequisitionSurveyPerformanceFactors>>;
	SectorRequisitionSurveyScales: FormArray<FormGroup<ISectorRequisitionSurveyScales>>;
}

export interface ISectorRequisitionSurveyScales {
	Id: FormControl<number | null>;
	XrmEntityId: FormControl<number>;
	Scale: FormControl<number>;
	Definition: FormControl<string | null>;
	ApplicableFor: FormControl<string | null>;
	ApplicableForName: FormControl<string | null>;
}

export interface ISectorRequisitionSurveyPerformanceFactors {
	Id: FormControl<number | null>;
	XrmEntityId: FormControl<number>;
	Factor: FormControl<string|null>;
}

export interface ISectorClpSurveyScales {
	Id: FormControl<number | null>;
	XrmEntityId: FormControl<number>;
	Scale: FormControl<number>;
	Definition: FormControl<string | null>;
	ApplicableFor: FormControl<string | null>;
}

export interface ISectorClpSurveyPerformanceFactors {
	Id: FormControl<number | null>;
	XrmEntityId: FormControl<number>;
	Factor: FormControl<string | null>;
	ApplicableFor: FormControl<string | null>
}

export interface INoOfDaysAfterStartDateLevels {
	Days: FormControl<number|null>;
}

export function getPerformanceSurveyConfigFormModel(customValidators: CustomValidators) {
	return new FormGroup<IPerformanceSurveyConfigFM>({
		...getCommonSectionFormModel(),
		'Id': new FormControl(magicNumber.zero, {nonNullable: true}),
		'SurveyForClosedReq': new FormControl(false, {nonNullable: true}),
		'SurveyAllowedForAssignment': new FormControl(false, SurveyAllowedForAssignmentValidations(customValidators)),
		'AfterAssignmentEndDate': new FormControl(false, {nonNullable: true}),
		'NoOfDaysAfterAssignmentStart': new FormControl(false, {nonNullable: true}),
		'NoOfDaysAfterStartDateLevels': new FormArray<FormGroup<INoOfDaysAfterStartDateLevels>>([]),
		'ScheduleThroughoutLengthOfAssignment': new FormControl(false, {nonNullable: true}),
		'LengthOfAssignment': new FormControl(null),
		'LengthOfAssignmentType': new FormControl(null),
		'CanSurveyAnyTime': new FormControl(false, {nonNullable: true}),
		'DisplayQuestion': new FormControl(false, {nonNullable: true}),
		'QuestionLabel': new FormControl(null),
		'DisplayNoThanks': new FormControl(false, {nonNullable: true}),
		'IsAvgSurveyScoreAllowForComment': new FormControl(false, IsAvgSurveyScoreAllowForCommentValidations(customValidators)),
		'SectorClpSurveyScales': new FormArray<FormGroup<ISectorClpSurveyScales>>([
			new FormGroup<ISectorClpSurveyScales>({
				'Id': new FormControl(Number(magicNumber.zero), {nonNullable: true}),
				'XrmEntityId': new FormControl(Number(magicNumber.twentyNine), {nonNullable: true}),
				'Scale': new FormControl(Number(magicNumber.one), {nonNullable: true}),
				'Definition': new FormControl(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ItemTitle')),
				'ApplicableFor': new FormControl(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'UsedIn'))
			})
		]),
		'SectorClpSurveyPerformanceFactors': new FormArray<FormGroup<ISectorClpSurveyPerformanceFactors>>([
			new FormGroup<ISectorClpSurveyPerformanceFactors>({
				'Id': new FormControl(Number(magicNumber.zero), {nonNullable: true}),
				'XrmEntityId': new FormControl(Number(magicNumber.twentyNine), {nonNullable: true}),
				'Factor': new FormControl(null, customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ItemTitle')),
				'ApplicableFor': new FormControl(null, customValidators.requiredValidationsWithMessage('PleaseSelectData', 'UsedIn'))
			})
		]),
		'AvgSurveyScore': new FormControl(null),
		'SectorRequisitionSurveyPerformanceFactors': new FormArray<FormGroup<ISectorRequisitionSurveyPerformanceFactors>>([]),
		'SectorRequisitionSurveyScales': new FormArray<FormGroup<ISectorRequisitionSurveyScales>>([])
	});
}

export function patchPerformanceSurveyConfig(
	performanceSurveyConfigData: SectorPerformanceSurveyConfiguration,
	 formGroup: FormGroup<IPerformanceSurveyConfigFM>
) {
	formGroup.patchValue({
		'Id': performanceSurveyConfigData.Id,
		'SurveyForClosedReq': performanceSurveyConfigData.SurveyForClosedReq,
		'SurveyAllowedForAssignment': performanceSurveyConfigData.SurveyAllowedForAssignment,
		'AfterAssignmentEndDate': performanceSurveyConfigData.AfterAssignmentEndDate,
		'NoOfDaysAfterAssignmentStart': performanceSurveyConfigData.NoOfDaysAfterAssignmentStart,
		'ScheduleThroughoutLengthOfAssignment': performanceSurveyConfigData.ScheduleThroughoutLengthOfAssignment,
		'LengthOfAssignment': performanceSurveyConfigData.LengthOfAssignment,
		'LengthOfAssignmentType': { 'Text': performanceSurveyConfigData.LengthOfAssignmentTypeName ?? '', 'Value': performanceSurveyConfigData.LengthOfAssignmentType?.toString() ?? '' },
		'CanSurveyAnyTime': performanceSurveyConfigData.CanSurveyAnyTime,
		'DisplayQuestion': performanceSurveyConfigData.DisplayQuestion,
		'QuestionLabel': performanceSurveyConfigData.QuestionLabel,
		'DisplayNoThanks': performanceSurveyConfigData.DisplayNoThanks,
		'IsAvgSurveyScoreAllowForComment': performanceSurveyConfigData.IsAvgSurveyScoreAllowForComment,
		'AvgSurveyScore': performanceSurveyConfigData.AvgSurveyScore,
		'SectorId': performanceSurveyConfigData.SectorId,
		'SectorUkey': performanceSurveyConfigData.SectorUkey,
		'StatusCode': performanceSurveyConfigData.StatusCode
	});
}
