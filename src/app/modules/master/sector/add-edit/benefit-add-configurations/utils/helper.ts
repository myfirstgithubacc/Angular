import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { SectorBenefitAdderConfiguration } from "@xrm-core/models/Sector/sector-benefit-adder-configuration.model";
import { removeFormArrayValidations } from "@xrm-master/sector/common/common-sector-code";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export interface IBenefitAdderConfigFM extends ICommonSectionFM{
    IsBenefitAdder:FormControl<boolean|null>,
	SectorBenefitAdders: FormArray<FormGroup<ISectorBenefitAdders>>;
}

export interface ISectorBenefitAdders{
    Id: FormControl<number|null>;
    Label : FormControl<string | null>;
}

export function getBenefitAdderConfigFormModel() {
	return new FormGroup<IBenefitAdderConfigFM>({
		...getCommonSectionFormModel(),
		'IsBenefitAdder': new FormControl<boolean|null>(false, IsBenefitAdderValidation()),
		'SectorBenefitAdders': new FormArray<FormGroup<ISectorBenefitAdders>>([
			new FormGroup<ISectorBenefitAdders>({
				'Id': new FormControl<number|null>(magicNumber.zero),
				'Label': new FormControl<string | null>(null)
			})
		])
	});
}

export function patchBenefitAdderConfig(benefitAdderConfigData: SectorBenefitAdderConfiguration, formGroup: FormGroup<IBenefitAdderConfigFM>) {
	formGroup.patchValue(benefitAdderConfigData);
}

export function IsBenefitAdderValidation(): ValidationErrors | null {
	return (control: AbstractControl) => {
		const IsBenefitAdderSwitch = control.value,
			SectorBenefitAddersFA = control?.parent?.get('SectorBenefitAdders') as FormArray;
		if(SectorBenefitAddersFA !== null) {
			if(!IsBenefitAdderSwitch) {
				removeFormArrayValidations(SectorBenefitAddersFA);
			}
			SectorBenefitAddersFA?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
		}
		return null;
	};
}
