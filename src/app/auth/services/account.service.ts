import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { GenericService } from 'src/app/shared/services/generic.service';


@Injectable({
	providedIn: 'root'
})
export class AccountService extends GenericService {
	constructor(private http: HttpClient) {
		super(http);
	}

	GetData(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/Account/All?StartIndex=0');
	}
}
