import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { RestMealBreakConfigurationAddEdit } from '@xrm-core/models/rest-meal-break-configuration/add-Edit/rest-meal-break-configuration-add-edit';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Injectable({
	providedIn: 'root'
})

export class RestMealBreakService extends HttpMethodService {
	constructor(private http: HttpClient) {
		super(http);
	}

	public holdData = new BehaviorSubject<{'Disabled': boolean, 'RuleCode': string, 'Id': number} | null>(null);
	getData = this.holdData.asObservable();

	getAllRestMealBreakConfiguration(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/meal-break');
	}

	getRestMealBreakConfigurationByUkey(Ukey: string): Observable<GenericResponseBase<RestMealBreakConfigurationAddEdit>> {
		return this.GetAll<GenericResponseBase<RestMealBreakConfigurationAddEdit>>(`/meal-break-uKey/${Ukey}`);
	}

	getRestMealBreakCopyDropdown(): Observable<GenericResponseBase<DropdownModel[]>> {
		return this.GetAll<GenericResponseBase<DropdownModel[]>>('/meal-break/select');
	}

	getRestMealBreakConfigurationById(Id: number): Observable<GenericResponseBase<RestMealBreakConfigurationAddEdit>> {
		return this.GetAll<GenericResponseBase<RestMealBreakConfigurationAddEdit>>(`/meal-break-id/${Id}`);
	}

	// Put Api's
	updateRestMealBreakConfigurationStatus(payload: ActivateDeactivate[]):
	 Observable<GenericResponseBase<ActivateDeactivate>> {
		const tpayload:ActivateDeactivate[] = payload;
		return this.PutBulk('/meal-break/BulkStatus', tpayload);
	}

	updateRestMealBreakConfiguration(payload: RestMealBreakConfigurationAddEdit):
	Observable<GenericResponseBase<RestMealBreakConfigurationAddEdit>> {
		return this.Put(`/meal-break/edit`, payload);
	}

	// Post Api's
	addNewRestMealBreakConfiguration(payload: RestMealBreakConfigurationAddEdit):
	Observable<GenericResponseBase<RestMealBreakConfigurationAddEdit>> {
		return this.Post('/meal-break/save', payload);
	}

	getMealBreakDropDownList() {
		return [
			{ Text: 'One', Value: 'One' },
			{ Text: 'Two', Value: 'Two' },
			{ Text: 'Three', Value: 'Three' }
		];
	}

}
