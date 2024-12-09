import { FormArray, FormGroup } from "@angular/forms";

export function validatorsParams(controlName: string, startingValue: number, endingValue: number) {
	return [
		{ 'Value': controlName, 'IsLocalizeKey': true },
		{ 'Value': startingValue.toString(), 'IsLocalizeKey': false },
		{ 'Value': endingValue.toString(), 'IsLocalizeKey': false }
	];
}

export function resetFormArrayErrorsOnSectorEdit(formArray: FormArray) {
	formArray.markAsUntouched();
}

export function removeFormArrayValidations(formArray: FormArray<FormGroup>|undefined): void {
	formArray?.controls.forEach((row: FormGroup) => {
		Object.keys(row.controls).forEach((controlName) => {
			const control = row.get(controlName);
			if (control) {
				control.setValidators(null);
				control.updateValueAndValidity();
			}
		});
	});
}
