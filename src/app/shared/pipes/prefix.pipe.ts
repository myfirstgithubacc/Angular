import { Pipe, PipeTransform } from '@angular/core';
import { ConstantValueService } from '../services/constant-value.service';

@Pipe({
	name: 'prefix'
})
export class PrefixPipe implements PipeTransform {
	constructor(private service:ConstantValueService){}
	transform(value: string | undefined, prefix?:string): string {
		if(prefix)
		{
			const valueAfterPrefix =
      value
      	? prefix + value
      	: "";
			return valueAfterPrefix;
		}
		return this.service.getPrefix() + value;
	}

}
