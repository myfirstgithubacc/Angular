import { Pipe, PipeTransform } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Pipe({
	name: 'maskFormat'
})
export class MaskFormatPipe implements PipeTransform {

	private maskedArray: string[] = ['#', '0', '9', 'L', '?', 'A', 'a', '&', 'C'];

	transform(value: any, mask: any): any {
		if (value == null || value.toString().trim().length == magicNumber.zero) {
			return value;
		}

		if (mask == null || mask.toString().trim().length == magicNumber.zero) {
			return value;
		}

		let i = 0,
		 result = '';
		const values = value.toString().split('');

		for (const element of mask) {
			if (!this.maskedArray.includes(element)) {
				result += element;
				continue;
			}

			if (values[i] === undefined) {
				break;
			}

			result += values[i];
			i++;
		}

		return result;
	}

}
