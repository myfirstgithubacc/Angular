import { Pipe, PipeTransform } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Pipe({
	name: 'normaliseCamelcase'
})
export class NormaliseCamelcasePipe implements PipeTransform {

	transform(value: string|undefined|null): string {
		if(!value || value == null)
		{
			return "";
		}
		const changedStringValue = value.charAt(magicNumber.zero)
				.toUpperCase() + value.slice(magicNumber.one),
		 result = changedStringValue.replace(/[A-Z]/g, ' $&').trim();

		return result;
	}

}
