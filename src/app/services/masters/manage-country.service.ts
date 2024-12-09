import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ManageCountry } from '@xrm-core/models/manage-country.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';


@Injectable({
	providedIn: 'root'
})
export class ManageCountryService extends HttpMethodService {

	public manageCountryData = new BehaviorSubject<any>(null);
	manageCountryObservable = this.manageCountryData.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	getManageCountry()
	{
		return this.GetAll<ApiResponse>('/ctry');
	}

	getManageCountryById(Ukey: string): Observable<GenericResponseBase<ManageCountry>> {
		return this.Get<GenericResponseBase<ManageCountry>>('/ctry-ukey', Ukey);
	}

	deleteManageCountry(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<ActivateDeactivate>>{
		return this.PutBulk('/ctry/bulk-status', Ukey);
	}

	updateManageCountry(data: ManageCountry): Observable<GenericResponseBase<ManageCountry>> {
		return this.Put('/ctry/edit', data);
	}

}
