import { Injectable } from '@angular/core';
import { HttpMethodService } from './http-method.service';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';

@Injectable({
	providedIn: 'root'
})
export class ReviewlinkService extends HttpMethodService {

	constructor(private http: HttpClient)
	{
		super(http);
	}

	public checkwhetherReviewLinkIsValid(encryptedlink: string)
	{

		return this.Get<ApiResponse>('/review/review-link-valid', encryptedlink);
	}

	public getFeRouteUrl(feRouteUkey: string)
	{
		return this.Get<ApiResponse>('/review/get-fe-routeurl', feRouteUkey);

	}
}
