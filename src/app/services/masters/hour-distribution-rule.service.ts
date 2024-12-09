import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HourDistributionRuleAddEdit } from '@xrm-core/models/hour-distribution-rule/add-Edit/hour-distribution-rule-add-Edit.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable } from 'rxjs';
import { IHdrDetail } from 'src/app/modules/job-order/professional/interface/shared-data.interface';

@Injectable({
	providedIn: 'root'
})
export class HourDistributionRuleService extends HttpMethodService {
	constructor(private http: HttpClient) {
		super(http);
	}

	getAllHourDistributionRule(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/hour-distribution');
	}

	getHourDistributionRuleByUkey(Ukey: string): Observable<GenericResponseBase<HourDistributionRuleAddEdit>> {
		return this.GetAll<GenericResponseBase<HourDistributionRuleAddEdit>>(`/hour-distribution-ukey/${Ukey}`);
	}

	getHourDistributionRuleById(id: number): Observable<GenericResponseBase<HourDistributionRuleAddEdit>> {
		return this.GetAll<GenericResponseBase<HourDistributionRuleAddEdit>>(`/hour-distribution-id/${id}`);
	}

	getHourDistributionRuleAllDropdowns(Ukey: string): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>(`/hour-distribution/select-all`);
	}

	getHourDistributionRuleCopyDropdown(): Observable<GenericResponseBase<DropdownModel[]>> {
		return this.GetAll<GenericResponseBase<DropdownModel[]>>('/hour-distribution/select');
	}

	updateHourDistributionRuleStatus(payload: ActivateDeactivate[]): Observable<GenericResponseBase<ActivateDeactivate>> {
		const tPayload: ActivateDeactivate[] = payload;
		return this.PutBulk('/hour-distribution/bulk-status', tPayload);
	}

	public getHdrById(id: number): Observable<GenericResponseBase<IHdrDetail>> {
		return this.GetAll<GenericResponseBase<IHdrDetail>>(`/hdr/select-details-id/${id}`);
	}

	postNewHourDistributionRule(addPayload: HourDistributionRuleAddEdit): Observable<GenericResponseBase<null>> {
		if (addPayload.ManualOtDtEntry) {
			addPayload.RegularStHoursPerWeek = null;
			addPayload.MaxStHourAllowed = null;
			addPayload.MaxOtHourAllowed = null;
			addPayload.MaxDtHourAllowed = null;
		}
		return this.Post('/hour-distribution/save', addPayload);
	}

	updateHourDistributionRule(payload: HourDistributionRuleAddEdit, Ukey: string): Observable<GenericResponseBase<null>> {
		payload.UKey = Ukey;
		if (payload.ManualOtDtEntry) {
			payload.RegularStHoursPerWeek = null;
			payload.MaxStHourAllowed = null;
			payload.MaxOtHourAllowed = null;
			payload.MaxDtHourAllowed = null;
		}
		return this.Put(`/hour-distribution/edit`, payload);
	}
}
