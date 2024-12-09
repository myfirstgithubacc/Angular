import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GenericService } from "@xrm-shared/services/generic.service";


@Injectable({
    providedIn: 'root',
})

export class LanguageService extends GenericService {

    constructor(private http: HttpClient) {
        super(http);
    }
    getDropdownList() {
        return [
            { Text: "English-UK", Value: "mountain" },
            { Text: "English-USA", Value: 2 },
            { Text: "French-Canada", Value: 3 },
            { Text: "French-France", Value: 4 },
            { Text: "German", Value: 5 },
            { Text: "Portuguese-Brazil", Value: 6 },
            { Text: "Spanish", Value: 7 },
        ];
    }

}