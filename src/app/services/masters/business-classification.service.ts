import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BusinessClassification } from '@xrm-core/models/business-classification';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';

@Injectable({
	providedIn: 'root'
})
export class BusinessClassificationService extends HttpMethodService {

	public businessClassificationData = new BehaviorSubject<any>(null);
	businessClassificationObsevable = this.businessClassificationData.asObservable();

	public getBusinessClassification(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/biscl');
	}

	public getBusinessClassificationById(uKey: string): Observable<GenericResponseBase<BusinessClassification>> {
		return this.Get<GenericResponseBase<BusinessClassification>>(`/biscl`, uKey);
	}

	public addBusinessClassification(data: BusinessClassification): Observable<GenericResponseBase<BusinessClassification>> {
		return this.Post('/biscl/save', data);
	}

	public updateBusinessClassification(Ukey: BusinessClassification): Observable<GenericResponseBase<BusinessClassification>> {
		return this.Put('/biscl/edit', Ukey);
	}

	public deleteBusinessClassification(Ukey: RecordStatusChangeResponse[]): Observable<GenericResponseBase<ActivateDeactivate>> {
		return this.PutBulk('/biscl/bulk-status', Ukey);
	}

	constructor(private http: HttpClient) {
		super(http);
	}
}

