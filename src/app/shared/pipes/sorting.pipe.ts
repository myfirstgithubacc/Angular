import { Pipe, PipeTransform } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Pipe({
	name: 'sorting'
})
export class SortingPipe implements PipeTransform {

	transform(value: string[]|number[]|undefined|null, sortBy?:string|undefined|null): any {
		if(sortBy==="desc")
		{
			const descending: any= value?.sort((a, b) =>
				(a > b
					? magicNumber.minusOne
					: magicNumber.one));
			return descending;
		}

		const ascending: any= value?.sort((a, b) =>
			(a > b
				? magicNumber.one
				: magicNumber.minusOne));
		return ascending;
	}

}
