
import { HttpClient } from '@angular/common/http';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Observable } from 'rxjs';
import {GenericModel } from 'src/app/core/models/genericModel';
import { environment } from 'src/environments/environment';


export abstract class HttpMethodService {
	protected baseUrl = `${environment.GATEWAY_URL}/${environment.APIVERSION}`;
	constructor(private httpClient: HttpClient) { }

	protected GetAllv2<TResponse>(apiUrl: string): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.get<GenericResponseBase<TResponse>>(`${this.baseUrl + apiUrl}`, {
			withCredentials: true
		});
	}

	protected GetAll<TResponse>(apiUrl: string): Observable<TResponse> {
		return this.httpClient.get<TResponse>(`${this.baseUrl + apiUrl}`, {
			withCredentials: true
		});
	}

	protected GetCulture<TResponse>(apiUrl: string): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.get<GenericResponseBase<TResponse>>(`${apiUrl}`, {
			withCredentials: false
		});
	}

	protected Get<TResponse>(apiUrl: string, id: number | string): Observable<TResponse>;
	protected Get<TResponse>(apiUrl: string, id: unknown): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.get<GenericResponseBase<TResponse>>(`${this.baseUrl + apiUrl}/${id}`, {
			withCredentials: true
		});
	}

	protected Post<T, TResponse>(
		apiUrl: string,
		model: Partial<T>
	): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.post<GenericResponseBase<TResponse>>(`${this.baseUrl + apiUrl}`, model, {
			withCredentials: true
		});
	}

	protected PostExtension<TResponse>(apiUrl:string):Observable<GenericResponseBase<TResponse>>{
		return this.httpClient.post<GenericResponseBase<TResponse>>(`${this.baseUrl + apiUrl}`, null, {
			withCredentials: true
		});
	}


	protected Put<T, TResponse>(
		apiUrl: string,
		model: Partial<T> & { UKey?: string | null }
	): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.put<GenericResponseBase<TResponse>>(
			`${this.baseUrl + apiUrl}/${model.UKey}`,
			model,
			{ withCredentials: true }
		);
	}

	protected PutBulk<T, TResponse>(
		apiUrl: string,

		model: Partial<T>
	): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.put<GenericResponseBase<TResponse>>(
			`${this.baseUrl + apiUrl}`,

			model,

			{ withCredentials: true }
		);
	}

	protected Delete<TResponse>(
		apiUrl: string,
		ukey: string
	): Observable<GenericResponseBase<TResponse>> {
		return this.httpClient.delete<GenericResponseBase<TResponse>>(
			`${this.baseUrl + apiUrl}/${ukey}`,
			{ withCredentials: true }
		);
	}
}
