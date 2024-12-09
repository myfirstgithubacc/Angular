import { Pipe, PipeTransform } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Pipe({
	name: 'disable'
})
export class DisablePipe implements PipeTransform {

	transform(value: number | string | undefined | null): string {
		let result: string;
	
		if (value === magicNumber.zero || value === magicNumber.zero.toString()) {
			result = "Active";
		} else if (value === null || value === magicNumber.one || value === magicNumber.one.toString()) {
			result = "InActive";
		} else {
			result = "InActive"; // Default value in case none of the conditions match
		}
	
		return result;
	}
	
	
}
