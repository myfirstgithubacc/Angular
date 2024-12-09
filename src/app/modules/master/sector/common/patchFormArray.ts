/* eslint-disable max-lines-per-function */
import { FormArray, FormGroup } from "@angular/forms";
import { SectorService } from "src/app/services/masters/sector.service";
import { ISectorCostCenterConfig } from "../add-edit/charge-number-configurations/utils/helper";

// eslint-disable-next-line max-params
export function formArrayAddModeValidationHandle(formName: string, formGroup: FormGroup|null, sector: SectorService, sectionData: any) {
	switch(formName) {
		case 'OrgLevelConfigs': {
			const { SectorOrgLevelConfigDtos } = sectionData,
				formArray = formGroup?.get('SectorOrgLevelConfigDtos') as FormArray;
			sector.OrgStructureFormArray(SectorOrgLevelConfigDtos, formArray);
			break;
		}

		case 'RequisitionConfiguration': {
			const { SectorAssignmentTypes, SectorCandidateEvaluationItems } = sectionData,
				formArray = formGroup?.get('SectorAssignmentTypes') as FormArray,
				formArray1 = formGroup?.get('SectorCandidateEvaluationItems') as FormArray;
			// sector.AssignmentTypesFormArray(SectorAssignmentTypes, formArray);
			sector.onAddSectorAssignmentTypes(SectorAssignmentTypes, formArray);

			sector.onAddSectorCandidateEvaluationItems(SectorCandidateEvaluationItems, formArray1);
			break;
		}

		case 'BenefitAdderConfiguration': {
			const { SectorBenefitAdders } = sectionData,
				formArray = formGroup?.get('SectorBenefitAdders') as FormArray;
			sector.onAddBenefitAdderFormArray(SectorBenefitAdders, formArray);
			break;
		}

		case "BackgroundCheck": {
			const { SectorBackgrounds } = sectionData,
				formArray = formGroup?.get('SectorBackgrounds') as FormArray;
			sector.onAddSectorBackground(SectorBackgrounds, formArray);
			break;
		}

		case 'ChargeNumberConfiguration': {
			let { SectorCostCenterConfigs } = sectionData;
			SectorCostCenterConfigs = (SectorCostCenterConfigs.length)
				?	SectorCostCenterConfigs
				: [{ "Id": 0, "SegmentName": null, "SegmentMinLength": null, "SegmentMaxLength": null }];
			const formArray = formGroup?.get('SectorCostCenterConfigs') as FormArray<FormGroup<ISectorCostCenterConfig>>;
			sector.onAddCostAccCenterConfig(SectorCostCenterConfigs, formArray);
			break;
		}

		case 'PerformanceSurveyConfiguration': {
			const	{ NoOfDaysAfterStartDateLevels, NoOfDaysAfterAssignmentStart, SectorClpSurveyPerformanceFactors
					, SectorRequisitionSurveyPerformanceFactors, SectorClpSurveyScales, SectorRequisitionSurveyScales } = sectionData,
				formArray = formGroup?.get('NoOfDaysAfterStartDateLevels') as FormArray,
				formArray1 = formGroup?.get('SectorClpSurveyPerformanceFactors') as FormArray,
				formArray2 = formGroup?.get('SectorRequisitionSurveyPerformanceFactors') as FormArray,
				formArray3 = formGroup?.get('SectorClpSurveyScales') as FormArray,
				formArray4 = formGroup?.get('SectorRequisitionSurveyScales') as FormArray;

			sector.NoOfScheduleDaysFormArray(NoOfDaysAfterStartDateLevels, formArray, NoOfDaysAfterAssignmentStart);
			sector.onAddClpPerformanceFactor(SectorClpSurveyPerformanceFactors, formArray1);
			sector.onAddReqPerformaceFactor(SectorRequisitionSurveyPerformanceFactors, formArray2);
			sector.onAddClpSurveyScale(SectorClpSurveyScales, formArray3);
			sector.onAddReqSurveyScale(SectorRequisitionSurveyScales, formArray4);

			let removeValidation = (name: string) => {
				formGroup?.get(name)?.setValidators(null);
				formGroup?.get(name)?.updateValueAndValidity();
			  };
			['AvgSurveyScore', 'QuestionLabel', 'LengthOfAssignment', 'LengthOfAssignmentType'].forEach((e: string) => {
				removeValidation(e);
			 });
			break;
		}
		default: {
			break;
		}
	}
}

export default formArrayAddModeValidationHandle;

