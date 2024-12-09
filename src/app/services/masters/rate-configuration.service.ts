import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';

@Injectable({
	providedIn: 'root'
})
export class RateConfigurationService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public calculateRequisation(data: any) {
		return this.Post('/rate-calculator', data);
	}

	// static data dropdown for Staus and payment type
	public GetDataListforMSPFeeType() {
		return this.GetAll<ApiResponse>(`/static/select-mspfeetype`);
	}

	public GetDataForOtRateType(){
		return this.GetAll<ApiResponse>(`/static/select-otratetype`);
	}

	public GetDataTypeListForPricingModel(){
		return this.GetAll<ApiResponse>(`/static/select-pricingmodel`);
	}

	public GetDataTypeListForOtRate(){
		return this.GetAll<ApiResponse>(`/static/select-otrate`);
	}
}
