/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { FormArray } from "@angular/forms";
import { SectorBackground } from "@xrm-core/models/Sector/sector-backgrounds.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export function BackgroundCheckValidation(SectorBackGroundsChecks: FormArray, parentFormValid: boolean) {
	let response = ({'error': false, 'index': 0});
	SectorBackGroundsChecks.value.forEach((row: SectorBackground, index: number) => {

		// if is visible is on and all 3 switch is off then throw error...
		if(parentFormValid) {
			if ((row.IsVisibleToClient) && !(row.IsApplicableForProfessional || row.IsApplicableForLi || row.IsApplicableForSow)) {
				SectorBackGroundsChecks.at(index).get('IsVisibleToClient')?.setErrors({error: true});
				response = ({'error': true, 'index': index + magicNumber.one});
				return;
			} else {
				SectorBackGroundsChecks.at(index).get('IsVisibleToClient')?.setErrors(null);
			}
		}
	});
	return response;
}

export function removeIsVisibleToClientError(SectorBackGroundsChecks: FormArray) {
	SectorBackGroundsChecks.value.forEach((row: SectorBackground, index: number) => {
		SectorBackGroundsChecks.at(index).get('IsVisibleToClient')?.setErrors(null);
	});
}
