import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'removeUnderscore'
})
export class RemoveUnderscorePipe implements PipeTransform {
	transform(value: string|undefined|null): string {
		if(!value || value==null)
		{
			return "";
		}
		const result = value.replace(/-/g, "").trim();
		return result;

	}
}
