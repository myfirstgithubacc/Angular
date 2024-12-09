
import { Pipe, PipeTransform } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
@Pipe({
	name: 'numeric'
})
export class NumericPipe implements PipeTransform {

	private cultureCode: any = null;
	private decimalPlaces = magicNumber.zero;

	constructor(private localizationService: LocalizationService) {
	}

	transform(value: any): any {
		return value.toLocaleString(
			this.cultureCode,
			{ minimumFractionDigits:
      this.decimalPlaces, maximumFractionDigits: this.decimalPlaces
			}
		);
	}

}
