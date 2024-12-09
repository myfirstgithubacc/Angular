import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "@xrm-core/models/responseTypes/api-response.model";
import { GenericService } from "@xrm-shared/services/generic.service";
import { Observable } from "rxjs/internal/Observable";

@Injectable({
    providedIn: 'root',
  })
  
export class CountryService extends GenericService {

    constructor(private http: HttpClient){
        super(http);
    }
    getDropdownList() : Observable<ApiResponse> {
        return this.GetAll<ApiResponse>('/Country/GetDropdownRecords');
    }

}