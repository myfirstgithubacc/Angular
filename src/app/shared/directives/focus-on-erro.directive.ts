/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Directive, HostListener, Input} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup
} from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Directive({
	selector: '[appFocusOnError]'
})
export class FocusOnErrorDirective {
	@Input() formName: FormGroup;
	@Input() listformName: (FormGroup | FormArray<FormGroup> | undefined)[];
	@Input() isEditMode: boolean = false;
	@Input() controlIndex: number = magicNumber.zero;
	@Input() enabled: boolean = true;

	@HostListener('click', ['$event']) onClick() {
		setTimeout(() => {
			if (this.listformName) {
				for (let i = 0; i <= this.listformName.length; i++) {
					const firstInvalidControl = this.getFirstInvalidControl((this.listformName as FormGroup[])[i]);
					if (firstInvalidControl) {
						makeScreenScrollonError(firstInvalidControl, this.enabled);
						break;
					}
				}
			} else {
				const firstInvalidControl = this.getFirstInvalidControl(this.formName);
				if (firstInvalidControl) {
					makeScreenScrollonError(firstInvalidControl, this.enabled);
				}
			}
		}, magicNumber.hundred);
	}

	ngAfterViewInit(): void {

	}

	/* private focusOnFirstField(): void {
				if (this.listformName && this.listformName.length > magicNumber.zero) {
					const firstControl = this.getFirstControl(this.listformName[0]);
					if (firstControl) {
						this.makeScreenScrollonError(firstControl);
					}
				} else {
					const firstControl = this.getFirstControl(this.formName);
					if (firstControl) {
						this.makeScreenScrollonError(firstControl);
					}
				}
		 } */


	private getFirstControl(form: FormGroup): string | null | objType {
		const controlNames = Object.keys(form.controls);
		if (controlNames.length > magicNumber.zero) {
			if (this.isEditMode) {
				return controlNames[this.controlIndex];
			}
			else {
				return controlNames[0];
			}
		}
		return null;
	}

	private getFirstInvalidControl(form: FormGroup): string | null | objType {
		const obj = {
			index: '',
			name: ''
		};
		if (form instanceof FormArray) {
			const controls = form.controls;
			for (const name in controls) {
				const control = controls[name];
				if (control instanceof FormGroup) {
					const formname = this.isFormGroup(control as FormGroup);
					if (formname) {
						obj.index = name;
						obj.name = formname;
						return obj;
					}
				}
			}
		} else {
			const controls = form?.controls;
			for (const name in controls) {
				if (controls[name] instanceof FormGroup) {
					const formname = this.isFormGroup(controls[name] as FormGroup);
					if (formname) {
						return formname;
					}
				} else {
					const control = controls[name];
					if (control.invalid) {
						return name;
					}
				}
			}
		}
		return null;
	}

	private isFormGroup(subForm: FormGroup): any {
		const obj = {
			index: '',
			name: ''
		};
		if (subForm instanceof FormGroup) {
			const controls = subForm.controls;
			for (const name in controls) {
				if (controls[name] instanceof FormGroup) {
					this.isFormGroup(controls[name] as FormGroup);
				} else if (controls[name] instanceof FormArray) {
					const controls1 = controls[name] as FormArray;
					for (const subname in controls1.controls) {
						const subFormFromFormArray = controls1.controls[subname] as FormGroup;
						if (subFormFromFormArray.invalid) {
							for (const controlSubFormFromFormArray in subFormFromFormArray.controls) {
								if (
									subFormFromFormArray.controls[controlSubFormFromFormArray]
										.invalid &&
									subFormFromFormArray.controls[
										controlSubFormFromFormArray
									] instanceof FormControl
								) {
									obj.index = subname;
									obj.name = controlSubFormFromFormArray;
									return obj;
								} else {
									this.isFormGroup(subFormFromFormArray.controls[controlSubFormFromFormArray] as FormGroup);
								}
							}
						}
					}
				}
				else if (controls[name].invalid) {
					return name;
				}
			}
		}
	}

}
export interface objType {
	index: string;
	name: string;
}

export function makeScreenScrollonError(control: any, enabled: boolean = true): void {
	let elementToFind: string = ``;
	if (control instanceof Object) {
		elementToFind = `[ng-reflect-name="${control.index}"] [ng-reflect-name="${control.name}"]`;
	}
	else {
		elementToFind = `[ng-reflect-control-name="${control}"]`;
	}
	const fieldWithError: NodeListOf<HTMLElement> | null =
		document.querySelectorAll('.ng-invalid');
	if (fieldWithError != null) {
		let index = 0;
		for (let i = 0; i < fieldWithError.length; i++) {
			if (fieldWithError[i].localName != "form" && fieldWithError[i].localName != "div" && fieldWithError[i].localName != "tr") {
				index = i;
				break;
			}
		}
		const error = fieldWithError[index].querySelector('.k-input-inner') as HTMLElement | null;

		if(enabled) {
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

	}
}
