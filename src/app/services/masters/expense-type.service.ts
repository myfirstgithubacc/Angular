import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExpenseTypeAddEdit } from '@xrm-core/models/expense-type/add-Edit/expense-type-add-edit';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { DropdownModel, IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ExpenseTypeService extends HttpMethodService {
	constructor(private http: HttpClient) {
		super(http);
	}
	public holdData = new BehaviorSubject<{'Disabled': boolean, 'RuleCode': string, 'Id': number} | null>(null);
	getData = this.holdData.asObservable();

	getAllExpenseType(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/expense-type');
	}

	updateExpenseTypeStatus(payload: ActivateDeactivate[]): Observable<GenericResponseBase<ActivateDeactivate>> {
		return this.PutBulk('/expense-type/bulk-status', payload);
	}

	updateExpenseType(payload: ExpenseTypeAddEdit): Observable<GenericResponseBase<ExpenseTypeAddEdit>> {
		return this.Put('/expense-type/edit', payload);
	}

	getExpenseTypeByUkey(Ukey: string): Observable<GenericResponseBase<ExpenseTypeAddEdit>> {
		return this.Get<GenericResponseBase<ExpenseTypeAddEdit>>('/expense-type-ukey', Ukey);
	}

	addNewExpenseType(payload: ExpenseTypeAddEdit): Observable<GenericResponseBase<ExpenseTypeAddEdit>> {
		return this.Post('/expense-type/save', payload);
	}

	getDropdownRecordsBySectorId(payload: number): Observable<GenericResponseBase<IDropdownWithExtras[]>> {
		return this.Get('/expense-type/expense-type-sector', payload);
	}

	expenseCopyToAnotherSector(data: { fromSectorId: string; expenseIdsToBeCopied: string[]; toSectorId: string;}):
	Observable<GenericResponseBase<null>> {
		return this.Post('/expense-type/copy', data);
	}

	getNatureOfExpenseDropDown(data: string): Observable<GenericResponseBase<DropdownModel[]>>{
		return this.Get('/StaticType/StaticTypesDropdownWithId', data);
	}
}
