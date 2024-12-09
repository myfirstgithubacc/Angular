import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function toggleSwitchDependentValidations(dependentControlName: string, validationArr: ValidatorFn | ValidatorFn[]): ValidationErrors | null {
	return (control: AbstractControl) => {
		const SwitchValue = control.value,
			DependentControl = control?.parent?.get(dependentControlName);

		if(DependentControl !== null) {
			if(SwitchValue) {
				DependentControl?.addValidators(validationArr);
			} else {
				DependentControl?.clearValidators();
			}
			DependentControl?.updateValueAndValidity();
		}

		return null;
	};
}
