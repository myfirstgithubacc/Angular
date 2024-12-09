import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExpenseEntryAddEdit } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-entry-add-edit';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { DropdownModel, IDropdown, IDropdownWithExtras } from "@xrm-shared/models/common.model";
import { DatePipe } from '@angular/common';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AssignmentDetail } from 'src/app/modules/acrotrac/common/view-review/approve-decline.model';
import { ExpenseAssignmentCostEffectiveDates } from '@xrm-core/models/acrotrac/expense-entry/add-edit/expense-AssignmentCostEffectiveDates';
import { AssignmentDetailsForTandE } from '@xrm-core/models/acrotrac/common/assignmentDetailsForTandE';
import { ExpenseTypeAddEdit } from '@xrm-core/models/expense-type/add-Edit/expense-type-add-edit';
import { ApproveDecline } from '@xrm-core/models/acrotrac/expense-entry/view-review/approve-decline';
import { ExpenseEntryCoreData } from '@xrm-core/models/acrotrac/common/common-core-data';

@Injectable({
	providedIn: 'root'
})
export class ExpenseEntryService extends HttpMethodService {

	constructor(
		private http: HttpClient,
		private datePipe: DatePipe,
		private localizationService: LocalizationService
	) {
		super(http);
	}

	public dataHold = new BehaviorSubject<ExpenseEntryCoreData | null>(null);
	public dataRelease = this.dataHold.asObservable();
	updateHoldData(newData: ExpenseEntryCoreData | null) {
		if (newData) {
			const currentData = this.dataHold.getValue() ?? {},
				updatedData = { ...currentData, ...newData };
			this.dataHold.next(updatedData);
		} else {
			this.dataHold.next(null);
		}
	}

	public formDataHold = new BehaviorSubject<{
		Sector: { Value: string }, ContractorName: IDropdown, AssignmentId: IDropdown,
		WeekendingDate: IDropdown
	} | null>
	(null);
	public formDataRelease = this.formDataHold.asObservable();

	getExpenseEntryByUkey(Ukey: string): Observable<GenericResponseBase<ExpenseEntryAddEdit>> {
		return this.Get<GenericResponseBase<ExpenseEntryAddEdit>>('/expense-ukey', Ukey);
	}

	getExpenseReviewByUkey(Ukey: string): Observable<GenericResponseBase<ExpenseEntryAddEdit>> {
		return this.Get<GenericResponseBase<ExpenseEntryAddEdit>>('/expense-review-ukey', Ukey);
	}

	getAssignmentDetailsForTandE(payload:{assignmentId: string, entityId: number, weekendingDate: string | null}):
	Observable<GenericResponseBase<AssignmentDetailsForTandE>> {
		return this.Post('/assignment/assignment-details', payload);
	}


	getAllSectorDropDown(): Observable<GenericResponseBase<IDropdownWithExtras[]>> {
		return this.GetAll('/sector/select-valid-sector');
	}

	getAllWeekendingDates(assignmentId: number): Observable<ApiResponse> {
		const numberOfAdvanceWeekending = 0;
		return this.GetAll<ApiResponse>(`/week-ending/select-weekending-assignment/${assignmentId}/${numberOfAdvanceWeekending}`);
	}

	// eslint-disable-next-line max-params
	getAllWeekendingDatesForEntry(entityid: number, assignmentId: number, screenid: number, dateFormat: string): Observable<IDropdown[]> {
		return this.GetAll<ApiResponse>(`/weekending/select-weekending-date/${entityid}/${assignmentId}/${screenid}`)
			.pipe(map((response) => {
				const { Data } = response;
				return Data.map((item: IDropdownWithExtras) => {
					if (new Date(item.Text) >= new Date()) {
						return ({ 'Text': this.localizationService.GetLocalizeMessage('ThisWeek'), 'Value': item.Text });
					} else {
						return ({ 'Text': this.datePipe.transform(item.Text, dateFormat), 'Value': item.Text });
					}
				});
			}));
	}


	getCostAccCodeAgainstAssingment(assignmentId: number, weekendingDate: string): Observable<GenericResponseBase<DropdownModel[]>> {
		return this.GetAll<GenericResponseBase<DropdownModel[]>>(`/expense/select-cost-code/${assignmentId}/${weekendingDate}`);
	}

	submitExpenseEntry(payload: ExpenseEntryAddEdit): Observable<GenericResponseBase<AssignmentDetail[]>> {
		payload.ExpenseEntryDetails.forEach((item, index) => {
			payload.ExpenseEntryDetails[index].DateIncurred = this.localizationService.TransformDate(item.DateIncurred, 'MM/dd/yyyy');
		});
		return this.Post('/expense/save', payload);
	}

	updateExpenseEntry(payload: ExpenseEntryAddEdit): Observable<GenericResponseBase<AssignmentDetail[]>> {
		delete payload.AssignmentId;
		delete payload.WeekendingDate;
		payload.ExpenseEntryDetails.forEach((item, index) => {
			payload.ExpenseEntryDetails[index].DateIncurred = this.localizationService.TransformDate(item.DateIncurred, 'MM/dd/yyyy');
		});
		return this.Put('/expense/edit', payload);
	}

	getByIdExpenseType(id: number): Observable<GenericResponseBase<ExpenseTypeAddEdit>> {
		return this.Get('/expense-type-id', id);
	}

	submitApproveDecline(payload: ApproveDecline[]): Observable<GenericResponseBase<AssignmentDetail[]>> {
		return this.PutBulk('/expense-review', payload);
	}

	getAssignmentCostEffectiveDates(costAccCodeId: number): Observable<GenericResponseBase<ExpenseAssignmentCostEffectiveDates>> {
		return this.Get('/assignment/select-cost-eff-date', costAccCodeId);
	}
}
