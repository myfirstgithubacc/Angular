import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AdjustmentApproval, ExpandSheet, RuleConfiguration, TimeAdjReviewResponse } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { TimeAdjustmentAddEdit } from '@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-add-edit';
import { BillableHour, expandedTimeSheetData, MealBreak, ValidateExpandData } from 'src/app/modules/acrotrac/Time/timesheet/adjustment-manual/enum';
import { DropdownModel } from '@xrm-shared/models/common.model';
import { IShiftListPayload } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';

@Injectable({
	providedIn: 'root'
})
export class TimeAdjustmentService extends HttpMethodService {
	public entriesArray : MealBreak[] = [];

	constructor(
		private http: HttpClient,
		private datePipe: DatePipe,
		private localizationService: LocalizationService
	) {
		super(http);
	}

	getTimeAdjustmentDataByUkey(Ukey: string): Observable<TimeAdjReviewResponse> {
		return this.Get<ApiResponse>(`/time/get-tadj-review-meal`, Ukey) as Observable<TimeAdjReviewResponse>;
	}

	getTimesheetSummaryData(Ukey: string): Observable<GenericResponseBase<ExpandSheet>> {
		return this.Get<ApiResponse>(`/timeadjust-detail`, Ukey) as Observable<GenericResponseBase<ExpandSheet>>;
	}

	getWeekendingDates(entityId: number, assignmentId:string, screenId: number): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/weekending/select-weekending-date/${entityId}/${assignmentId}`, screenId);
	}

	  submitAdjustmentData(data: TimeAdjustmentAddEdit): Observable<GenericResponseBase<[]>> {
		return this.Post('/tadj', data);
	  }

	  submitValidateData(data: ValidateExpandData): Observable< GenericResponseBase<[]>> {
		return this.Post('/timeadjust/validate-expanded', data);
	  }

	getCostAccountingCodeDrp(assignmentId: number, weekendingDate: string, recordId:number): Observable<GenericResponseBase<DropdownModel[]>> {
		return this.GetAll<GenericResponseBase<DropdownModel[]>>(`/tadj/cost-accounting-code/${assignmentId}/${recordId}/${weekendingDate}`);
	}

	getshiftDropdown(reqPayload: IShiftListPayload) {
		return this.GetAll<GenericResponseBase<any>>(`/tadj/shft-recordId/${reqPayload.sectorId}/${reqPayload.recordId}/${reqPayload.locationId}`);
	}

	  updateAdjustmentData(data: TimeAdjustmentAddEdit, uKey: string): Observable< GenericResponseBase<[]>> {
		return this.PutBulk(`/tadj/edit/${uKey}`, data);
	  }

	  getTimeAdjustmentType(){
		return this.GetAll<ApiResponse>('/static/select-tadj-type');
	  }

	approveTimeAdjustment(data: AdjustmentApproval[]): Observable<ApiResponse>{
		return this.PutBulk('/time-adjustment-review', data);
	}

	getTimesheetAdjSummaryData(payload:expandedTimeSheetData): Observable<GenericResponseBase<ExpandSheet>> {
		return this.Post(`/tadj/calc-adjust-detail`, payload) as Observable<GenericResponseBase<ExpandSheet>>;
	}

	getTimeInOutconfigdata(Ukey: string): Observable<GenericResponseBase<RuleConfiguration>>{
		return this.Get<GenericResponseBase<RuleConfiguration>>(`/meal-break-uKey`, Ukey);
	}
	getInOutViewDetails(timeId:number, date: string): Observable<GenericResponseBase<MealBreak>>{
		return this.GetAll(`/time/get-details/${timeId}/${date}`);
	}

	setData(newData: any): void {
		this.checkExistingData(newData);
	  }

	  getData(): any {
		return this.entriesArray;
	  }

	  checkExistingData(newObject:any){
		const existingIndex = this.entriesArray.findIndex((entry:any) =>
			entry.EntryDate === newObject.EntryDate);
		if (existingIndex > -1) {
			if( this.entriesArray[existingIndex].Id){
				newObject.Id = this.entriesArray[existingIndex].Id;
			}
		  this.entriesArray[existingIndex] = newObject;
		} else {
		  this.entriesArray.push(newObject);
		}
	  }
	  clearInOutData(){
		this.entriesArray = [];
	  }
}
