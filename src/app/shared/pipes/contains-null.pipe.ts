import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'containsNull'
})
export class ContainsNullPipe implements PipeTransform {

	transform(value: number|string|undefined|null, defaultVal:number|string|undefined): any {
		if(value===null)
		{
			return defaultVal
				?defaultVal.toString()
				:"";
		}
		return value;
	}

}
