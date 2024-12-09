import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpMethodService } from '../http-method.service';
import { of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ErrorLogService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public addErrorLog(data: any) {
		//return this.Post('/err-log/log', data);
		return of(null);
	}
}
