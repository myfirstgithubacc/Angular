import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IDropdown } from "@xrm-shared/models/common.model";
import { GenericResponseBase } from "@xrm-core/models/responseTypes/generic-response.interface";
import { HttpMethodService } from "@xrm-shared/services/http-method.service";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})

export class StateService extends HttpMethodService {
	constructor(private http: HttpClient){
		super(http);
	}
	getDropdownListByCountry(Id : number): Observable<GenericResponseBase<IDropdown>> {
		return this.Get('/State/select-state', Id);
	}
}
