import { Pipe, PipeTransform } from '@angular/core';
import { CountriesInfoService } from '../services/countries-info.service';

@Pipe({
	name: 'countryPhone'
})
export class CountryPhonePipe implements PipeTransform {
	constructor(private service:CountriesInfoService){}
	transform(value: string | undefined, country:string|undefined):string {
		if (!value)
			return "Supply phone/mobile number parameter";

		if (!country )
			return "Supply country name";

		const countries= this.service.getCountries(),
	     filterArray = countries.List.filter(function (el:any)
			{
				return el.name ==country;
			}),
			phoneNoWithCountryCode=`+${filterArray['0'].phone} ${value}`;
		return phoneNoWithCountryCode;
	}

}
