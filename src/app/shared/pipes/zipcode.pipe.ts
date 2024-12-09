import { Pipe, PipeTransform } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Pipe({
	name: 'zipcode'
})
export class ZipcodePipe implements PipeTransform {

	transform(value: string | undefined): string {
		if (!value) {
			return "";
		}

		if (value.trim().replace(/-/g, "").length < magicNumber.five) {
			return value;
		}

		const zipWithoutDash = value.trim().replace(/-/g, ""),
		  firstFiveDigits = zipWithoutDash.slice(magicNumber.zero, magicNumber.five),
		  lastFourDigits =
      zipWithoutDash.length > magicNumber.five
      	? zipWithoutDash.slice(magicNumber.five)
      	: "",
		   lastFourWithDash =
      lastFourDigits
      	? `-${lastFourDigits}`
      	: "",
		  result = firstFiveDigits + lastFourWithDash;
		return result;
	}


}
