import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericService } from 'src/app/shared/services/generic.service';

@Injectable({
	providedIn: 'root'
})
export class LoggingService extends GenericService {
	constructor(private http: HttpClient) {
		super(http);
	}
	pageAccessLog(pageTitile: string, pageUrl: string) {
		const pageData = {
			pageTitle: pageTitile,
			url: pageUrl
		};
		return this.http.post(`${this.baseUrl}/AccessLogs/`, pageData);
	}
}
