import { AbstractControl, ValidatorFn } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

// eslint-disable-next-line max-lines-per-function
export function IsAvgSurveyScoreAllowForCommentValidations(customValidators: CustomValidators): ValidatorFn {
	// eslint-disable-next-line max-lines-per-function
	return (control: AbstractControl) => {
		const IsAvgSurveyScoreAllowForCommentSwitch = control.value,
			AvgSurveyScoreTextBox = control.parent?.get('AvgSurveyScore');
		if(IsAvgSurveyScoreAllowForCommentSwitch !== null) {
			if(IsAvgSurveyScoreAllowForCommentSwitch) {
				AvgSurveyScoreTextBox?.addValidators([
					customValidators.requiredValidationsWithMessage('PleaseEnterData', 'AvgSurveyScore'),
					customValidators.RangeValidator(
						magicNumber.zero, magicNumber.ninetyNineDotDoubleNine, 'FieldSpecificYouCanEnterValueBetween',
						[{ Value: 'AvgSurveyScore', IsLocalizeKey: true }, { Value: '0', IsLocalizeKey: true }, { Value: '99.99', IsLocalizeKey: true }]
					)
				]);
			}
			else {
				AvgSurveyScoreTextBox?.clearValidators();
			}
		}
		AvgSurveyScoreTextBox?.updateValueAndValidity();
		return null;
	};
};

export function SurveyAllowedForAssignmentValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl) => {
		const SurveyAllowedForAssignmentSwitch = control.value,
			ScheduleThroughoutLengthOfAssignmentSwitch = control.parent?.get('ScheduleThroughoutLengthOfAssignment'),
			LengthOfAssignmentTextBox = control.parent?.get('LengthOfAssignment'),
			LengthOfAssignmentTypeDropdown = control.parent?.get('LengthOfAssignmentType'),
			DisplayQuestionSwitch = control.parent?.get('DisplayQuestion'),
			QuestionLabelTextBox = control.parent?.get('QuestionLabel');
		if(SurveyAllowedForAssignmentSwitch) {
			ScheduleThroughoutLengthOfAssignmentSwitch?.addValidators(ScheduleThroughoutLengthOfAssignmentValidations(customValidators));
			DisplayQuestionSwitch?.addValidators(DisplayQuestionSwitchValidations(customValidators));
		} else {
			ScheduleThroughoutLengthOfAssignmentSwitch?.clearValidators();
			LengthOfAssignmentTextBox?.clearValidators();
			LengthOfAssignmentTypeDropdown?.clearValidators();

			DisplayQuestionSwitch?.clearValidators();
			QuestionLabelTextBox?.clearValidators();
		}
		ScheduleThroughoutLengthOfAssignmentSwitch?.updateValueAndValidity();
		LengthOfAssignmentTextBox?.updateValueAndValidity();
		LengthOfAssignmentTypeDropdown?.updateValueAndValidity();

		DisplayQuestionSwitch?.updateValueAndValidity();
		QuestionLabelTextBox?.updateValueAndValidity();
		return null;
	};
}

function ScheduleThroughoutLengthOfAssignmentValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl) => {
		const ScheduleThroughoutLengthOfAssignmentSwitch = control.value,
			LengthOfAssignmentTextBox = control.parent?.get('LengthOfAssignment'),
			LengthOfAssignmentTypeDropdown = control.parent?.get('LengthOfAssignmentType');
		if(ScheduleThroughoutLengthOfAssignmentSwitch) {
			LengthOfAssignmentTextBox?.addValidators(customValidators.requiredValidationsWithMessage('PleaseEnterData', 'ScheduledEvery'));
			LengthOfAssignmentTypeDropdown?.addValidators(customValidators.requiredValidationsWithMessage('PleaseSelectData', 'LengthOfAssignmentType'));
		} else {
			LengthOfAssignmentTextBox?.clearValidators();
			LengthOfAssignmentTypeDropdown?.clearValidators();
		}
		LengthOfAssignmentTextBox?.updateValueAndValidity();
		LengthOfAssignmentTypeDropdown?.updateValueAndValidity();
		return null;
	};
}

function DisplayQuestionSwitchValidations(customValidators: CustomValidators): ValidatorFn {
	return (control: AbstractControl) => {
		const DisplayQuestionSwitch = control.value,
			QuestionLabelTextBox = control.parent?.get('QuestionLabel');
		if(DisplayQuestionSwitch) {
			QuestionLabelTextBox?.addValidators(customValidators.requiredValidationsWithMessage('PleaseEnterData', 'QuestionLabel'));
		} else {
			QuestionLabelTextBox?.clearValidators();
		}
		QuestionLabelTextBox?.updateValueAndValidity();
		return null;
	};
}

