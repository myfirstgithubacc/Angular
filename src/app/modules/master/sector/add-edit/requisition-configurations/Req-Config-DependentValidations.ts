import { AbstractControl, FormArray, ValidationErrors } from "@angular/forms";
import { removeFormArrayValidations } from "@xrm-master/sector/common/common-sector-code";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export function QuestionBankRequiredValidation(customValidators: CustomValidators): ValidationErrors | null {
	return (control: AbstractControl|undefined) => {
		const QuestionBankRequiredSwitch = control?.value,
			QuestionBankLabelTextBox = control?.parent?.get('QuestionBankLabel'),
			QuestionToBeAnsweredByDropdown = control?.parent?.get('QuestionToBeAnsweredBy');

		if(QuestionBankLabelTextBox !== null && QuestionToBeAnsweredByDropdown !== null ) {
			if(QuestionBankRequiredSwitch) {
				QuestionBankLabelTextBox?.addValidators([customValidators.requiredValidationsWithMessage('PleaseEnterData', 'QuestionBankLabel')]);
				QuestionToBeAnsweredByDropdown?.addValidators([customValidators.requiredValidationsWithMessage('PleaseSelectData', 'QuestionToBeAnsweredBy')]);
			} else {
				QuestionBankLabelTextBox?.clearValidators();
				QuestionToBeAnsweredByDropdown?.clearValidators();
			}
			QuestionBankLabelTextBox?.updateValueAndValidity();
			QuestionToBeAnsweredByDropdown?.updateValueAndValidity();
		}

		return null;
	};
}

export function IsSystemRankingFunctionalityValidation(): ValidationErrors | null {
	return (control: AbstractControl|undefined) => {
		const IsSystemRankingFunctionalitySwitch = control?.value,
			SectorCandidateEvaluationItemsFA = control?.parent?.get('SectorCandidateEvaluationItems') as FormArray;
		if(SectorCandidateEvaluationItemsFA !== null) {
			if(!IsSystemRankingFunctionalitySwitch) {
				removeFormArrayValidations(SectorCandidateEvaluationItemsFA);
			}
			SectorCandidateEvaluationItemsFA?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
		}
		return null;
	};
}
