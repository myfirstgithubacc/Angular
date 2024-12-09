import { FormControl } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export interface ICommonSectionFM {
	StatusCode: FormControl<string | null>,
	SectorId: FormControl<number>,
	SectorUkey: FormControl<string | null>,
	// ReasonForChange: [null]
}

export class CommonSection {
	StatusCode: string | null;
	SectorId: number;
	SectorUkey: string | null;
	UKey: string | null;
	// ReasonForChange: [null]
}

export function getCommonSectionFormModel() {
	return {
		'StatusCode': new FormControl<string | null>(null, {nonNullable: true}),
		'SectorId': new FormControl<number>(Number(magicNumber.zero), {nonNullable: true}),
		'SectorUkey': new FormControl<string | null>(null, {nonNullable: true})
		// 'ReasonForChange': new FormControl<null>(null)
	};
}


