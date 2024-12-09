import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "@xrm-core/models/responseTypes/api-response.model";
import { HttpMethodService } from "@xrm-shared/services/http-method.service";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class HDRMockSreenService extends HttpMethodService {
	constructor(private http: HttpClient) {
		super(http);
	}
	postTotalHours(payload: any): Observable<ApiResponse> {
		return this.Post('/time/calci', payload);
	}
}
