import { FormArray, FormGroup } from "@angular/forms";
import { WeekDayRule } from "@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-WeekDayRule.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function addCustomFocus(AddEditHourAdjustmentForm: FormGroup) {
	setTimeout(() => {
		const fieldWithError: NodeListOf<HTMLElement> | null =
			document.querySelectorAll('.ng-invalid');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (fieldWithError.length != magicNumber.zero) {
			let index = magicNumber.zero;
			for (let i = Number(magicNumber.zero); i < fieldWithError.length; i++) {
				if (fieldWithError[i].localName != "form" && fieldWithError[i].localName != "div" && fieldWithError[i].localName != "tr") {
					index = i;
					break;
				}
			}
			const error: HTMLElement | null = fieldWithError[index].querySelector('.k-input-inner');
			if (error != null) {
				setTimeout(() => {
					error.scrollIntoView({ block: 'center' });
				}, magicNumber.hundred);
				error.focus();
			} else {
				setTimeout(() => {
					fieldWithError[index].scrollIntoView({ block: 'center' });
				}, magicNumber.hundred);
				fieldWithError[index].focus();
			}
		}
	}, magicNumber.oneFifty);
	// it is for AppFocusOnError Directive.
	AddEditHourAdjustmentForm.markAllAsTouched();
}

function nullifyFormArray(formArrayName: string, formGroup: FormGroup): void {
	const myArray = formGroup.get(formArrayName) as FormArray;
	myArray.clear();
}

export function resetValidationGrids(formGroup: FormGroup) {
	nullifyFormArray('WeekDayRule', formGroup);
	nullifyFormArray('Week1Rule', formGroup);
	nullifyFormArray('Week2Rule', formGroup);
	nullifyFormArray('AdditionalRules', formGroup);
	nullifyFormArray('SpecialDayRules', formGroup);
}

export function removeArrayOfJsonElements(arrayToBePop: WeekDayRule[], isEditMode: boolean, isSpecialDayRuleAllowed: boolean = false) {
	arrayToBePop.map((row: WeekDayRule) => {
		if (!isEditMode) {
			row.Id = magicNumber.zero;
		}
		row.StOperator = row.StOperator.toString();
		row.OtOperator = row.OtOperator.toString();
		row.DtOperator = row.DtOperator.toString();

		if (isSpecialDayRuleAllowed) {
			row.ApplicableOnOperator = row.ApplicableOnOperator?.toString();
			row.ApplicableOnTypeId = row.ApplicableOnTypeId?.toString();
			row.WeekDayId = row.WeekDayId?.toString();
		}

	});
	return arrayToBePop.splice(magicNumber.zero, arrayToBePop.length);
}
