import { Client } from "./Client.models";
import { Content } from "./Content.models";
import { Country } from "./Country.models";
import { CultureInfo } from "./CultureInfo.models";
import { Language } from "./Language.models";

export class CultureFile{
    Client:Client;
    CultureInfo:CultureInfo;
    Language:Language;
    Country:Country;
    Content:Content[];

    constructor(){
        this.Client = new Client();
        this.CultureInfo = new CultureInfo();
        this.Language = new Language();
        this.Country = new Country();
        this.Content = [];
    }
}