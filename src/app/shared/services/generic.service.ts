import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GenericModel } from 'src/app/core/models/genericModel';
import { environment } from 'src/environments/environment';

export abstract class GenericService {
	protected baseUrl = `${environment.GATEWAY_URL}/${environment.APIVERSION}`;
	constructor(private httpClient: HttpClient) { }

	protected GetAll<TResponse>(apiUrl: string): Observable<TResponse> {
		return this.httpClient.get<TResponse>(`${this.baseUrl + apiUrl}`, {
			withCredentials: true
		});
	}

	protected GetCulture<TResponse>(apiUrl: string): Observable<TResponse> {
		return this.httpClient.get<TResponse>(`${apiUrl}`, {
			withCredentials: false
		});
	}

	protected Get<TResponse>(apiUrl: string, id: number): Observable<TResponse>;
	protected Get<TResponse>(apiUrl: string, id: string): Observable<TResponse>;
	protected Get<TResponse>(apiUrl: string, id: unknown): Observable<TResponse> {
		return this.httpClient.get<TResponse>(`${this.baseUrl + apiUrl}=${id}`, {
			withCredentials: true
		});
	}

	protected Post<T extends GenericModel<T>, TResponse>(
		apiUrl: string,
		model: Partial<T> & { toJson: () => T }
	): Observable<TResponse> {
		return this.httpClient.post<TResponse>(`${this.baseUrl + apiUrl}`, model, {
			withCredentials: true
		});
	}

	protected Put<T extends GenericModel<T>, TResponse>(
		apiUrl: string,
		model: Partial<T>
	): Observable<TResponse> {
		return this.httpClient.put<TResponse>(
			`${this.baseUrl + apiUrl}=${model.UKey}`,
			model,
			{ withCredentials: true }
		);
	}

	protected PutBulk<T extends GenericModel<T>, TResponse>(
		apiUrl: string,

		model: Partial<T>
	): Observable<TResponse> {
		return this.httpClient.put<TResponse>(
			`${this.baseUrl + apiUrl}`,

			model,

			{ withCredentials: true }
		);
	}

	protected Delete<TResponse>(
		apiUrl: string,
		ukey: string
	): Observable<TResponse> {
		return this.httpClient.delete<TResponse>(
			`${this.baseUrl + apiUrl}/${ukey}`,
			{ withCredentials: true }
		);
	}
}
