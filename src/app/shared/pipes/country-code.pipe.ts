import { Pipe, PipeTransform } from '@angular/core';
import { CountriesInfoService } from '../services/countries-info.service';
@Pipe({
	name: 'countryCode'
})
export class CountryCodePipe implements PipeTransform {
	constructor(private service:CountriesInfoService){}
	transform(value: string | undefined|null):string {
		if (!value || value===null )
			return "Supply country name";
		const countries:any= this.service.getCountries(),
			filterArray = countries.List.filter(function (el:any)
			{
				return el.name ==value;
			}),
		 countryCode = filterArray['0'].code3;
		return countryCode;
	}

}
