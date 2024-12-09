import { Pipe, PipeTransform } from '@angular/core';
import { ConstantValueService } from '../services/constant-value.service';

@Pipe({
	name: 'suffix'
})
export class SuffixPipe implements PipeTransform {

	constructor(private service:ConstantValueService){}
	transform(value: string | undefined, suffix?:string): string {
		if(suffix)
		{
			const valueAfterSuffix =
      value ?
      	value + suffix
      	: "";
			return valueAfterSuffix;
		}
		return value + this.service.getSuffix();
	}
}
