import { Pipe, PipeTransform } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Pipe({
	name: 'boolean'
})
export class BooleanPipe implements PipeTransform {

	transform(value: number|string): boolean|string {
		if(value === magicNumber.one|| value === magicNumber.one.toString())
		{
			return true;
		}
		else if(value === magicNumber.zero|| value === magicNumber.zero.toString())
		{
			return false;
		}
		return "Invalid Parameter Value";
	}

}
