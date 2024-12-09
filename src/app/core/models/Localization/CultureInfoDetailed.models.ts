import { Country } from "./Country.models";
import { CultureInfo } from "./CultureInfo.models";
import { Language } from "./Language.models";

export class CultureInfoDetailed{
    CultureInfo:CultureInfo;
    Language:Language;
    Country:Country;
     constructor(){
        this.CultureInfo = new CultureInfo();
        this.Language = new Language();
        this.Country = new Country()
     }
}