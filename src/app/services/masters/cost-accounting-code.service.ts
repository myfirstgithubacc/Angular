import { Injectable } from '@angular/core';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CostAccountingCodeSubmit } from '@xrm-core/models/cost-accounting-code/cost-accounting-code.add-edit';
import { CostAccountingCodeList } from '@xrm-core/models/cost-accounting-code.model';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { ICostAccountingCodeDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { DropdownModel, IDropdownWithExtras } from '@xrm-shared/models/common.model';

@Injectable({
	providedIn: 'root'
})
export class CostAccountingCodeService extends HttpMethodService {
	constructor(private http: HttpClient)
	{
		super(http);
	}

	getAllCostAccountingCode(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/cost-code');
	}

	getAllCostAccountingCodeByUkey(Ukey: string): Observable<GenericResponseBase<CostAccountingCodeSubmit>> {
		return this.Get<GenericResponseBase<CostAccountingCodeSubmit>>('/cost-code-ukey', Ukey);
	}

	updateStatus(data: ActivateDeactivate []): Observable<GenericResponseBase<null>> {
		const tPayload:ActivateDeactivate[] = data;
		return this.PutBulk('/cost-code/bulk-status', tPayload);
	}

	getDropDownDataOfShift(sectorId: number): Observable<GenericResponseBase<DropdownModel[]>> {
		return this.GetAll<GenericResponseBase<DropdownModel[]>>(`/sft/sfts-shftLoc-by-sectid/${sectorId}`);
	}

	getDropDownDataOfSector(): Observable<GenericResponseBase<IDropdownWithExtras[]>> {
		return this.GetAll<GenericResponseBase<IDropdownWithExtras[]>>('/sector/select');
	}

	addCostAccountingCode(data: CostAccountingCodeList) : Observable<GenericResponseBase<null>> {
		return this.Post('/cost-code/save', data);
	}

	public updateCostAccountingCode(data: CostAccountingCodeList): Observable<GenericResponseBase<null>> {
		return this.Put('/cost-code/edit', data);
	}

	// Get Cost Accounting  Details  for li Request
	public getCostAccountingDetails(id: number) {
		return this.Get<GenericResponseBase<ICostAccountingCodeDetails[]>>('/cost-code/select-cost-code', id);
	}

	effectiveEndDateValidation(date: string, validationMessage:string | null): ValidatorFn {
		return (control: AbstractControl) => {
			if (!(control.value && new Date(control.value) >= new Date(date))) {
				return {
					error: true,
					message: validationMessage ?? ''
				};
			}
			return null;
		};
	};
}
