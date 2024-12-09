import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'containsValue'
})
export class ContainsValuePipe implements PipeTransform {

	transform(value:string, checkVal:string): string|boolean {
		if(!value || !checkVal)
		{
			return "Please Supply Parameters";
		}
		if(value.includes(checkVal))
		{
			return true;
		}
		else
			return false;
	}

}
