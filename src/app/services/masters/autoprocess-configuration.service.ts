import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { dropdownModel, RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdownWithExtras } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExecutionDetails, Job, JobData } from '@xrm-core/models/auto-process-configuration.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';

@Injectable({
	providedIn: 'root'
})
export class AutoprocessConfigurationService extends HttpMethodService{

	public saveautoprocess = new BehaviorSubject<any>(false);
	public _saveShift = this.saveautoprocess.asObservable();

	public jobsData = new BehaviorSubject<any>(null);
	jobsObsevable = this.jobsData.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	 }

	getJobsDropDownList() {
		return this.GetAll<GenericResponseBase<IDropdownWithExtras[]>>('/apjb/select-jobs');
	}

	gettriggerGatewayDropDown() {
		return this.GetAll<GenericResponseBase<IDropdownWithExtras[]>>('/apjb/select-gateway');
	}

	getJobDescription(id: string): Observable<GenericResponseBase<dropdownModel[]>> {
		return this.Get('/apjb/job-dis-by-id', id);
	}

	executeJobDetailsUpdate(id: any): Observable<GenericResponseBase<any>> {
		return this.Post('/apjb/exec-job', id);
	}

	executeJob(jobid: number, apiurl : string, data = {}): Observable<GenericResponseBase<null>>{

		if(jobid === Number(magicNumber.one) || jobid === Number(magicNumber.four))
		{
			return this.http.put<GenericResponseBase<null>>(
				`${this.baseUrl + apiurl}`,
				data,
				{ withCredentials: true }
			);}
		else
		{
			return this.GetAll(apiurl);
		}

	}

	enableAutoProcess(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<ActivateDeactivate>>{
		return this.PutBulk('/apjb/update-client-mapping-status', Ukey);
	}

	enableScheduleStatus(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<any>>{
		return this.PutBulk('/apjb/update-schedule-status', Ukey);
	}

	getJobById(Ukey: string): Observable<GenericResponseBase<any>> {
		return this.Get<GenericResponseBase<Job>>(`/apjb/job-schedule-by-jobUkey`, Ukey);
	}

	getExecutionHisById(Ukey: string): Observable<GenericResponseBase<ExecutionDetails[]>> {
		return this.Get<GenericResponseBase<ExecutionDetails[]>>(`/apjb/job-exec-history`, Ukey);
	}

	updateJobSchedule(data: any): Observable<GenericResponseBase<any>> {
		return this.Put('/apjb/update-job-schedule', data);
	}

	addJob(data: any): Observable<GenericResponseBase<any>> {

		return this.Post('/apjb/submit-job-schedule', data);
	}

	getJobSchedulebyUkey(ukey: string){
		return this.Get<GenericResponseBase<JobData>>(`/apjb/job-schedule-by`, ukey);
	}

	public daysInfo: IDayInfo[] = [
		{ day: 'Sun', isSelected: false },
		{ day: 'Mon', isSelected: false },
		{ day: 'Tue', isSelected: false },
		{ day: 'Wed', isSelected: false },
		{ day: 'Thu', isSelected: false },
		{ day: 'Fri', isSelected: false },
		{ day: 'Sat', isSelected: false }
	  ];

	// eslint-disable-next-line max-lines-per-function
	triggerDeatilsColumnOption(){
		return[
			{
				"XrmGridPersistentMasterId": 985,
				"ColumnName": "SchedulingType",
				"ColumnHeader": "Scheduling Type",
				"SelectedByDefault": true,
				"fieldName": "SchedulingType",
				"columnHeader": "Scheduling Type",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 4,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": 100,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 986,
				"ColumnName": "StartDate",
				"ColumnHeader": "StartDate",
				"SelectedByDefault": true,
				"fieldName": "StartDate",
				"columnHeader": "StartDate",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 5,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": 100,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 992,
				"ColumnName": "EndDate",
				"ColumnHeader": "EndDate",
				"SelectedByDefault": true,
				"fieldName": "EndDate",
				"columnHeader": "EndDate",
				"visibleByDefault": true,
				"IsReadOnly": true,
				"DefaultColumnSequence": 1,
				"Dir": "undefined",
				"ValueType": null,
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": null,
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null,
				"ApplicableForAdvanceSearch": true
			},
			{
				"XrmGridPersistentMasterId": 987,
				"ColumnName": "ScheduledTime",
				"ColumnHeader": "Scheduled Time",
				"SelectedByDefault": true,
				"fieldName": "ScheduledTime",
				"columnHeader": "Scheduled Time",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 7,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": 100,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 993,
				"ColumnName": "IntervalDay",
				"ColumnHeader": "Interval Day(s)",
				"SelectedByDefault": false,
				"fieldName": "IntervalDay",
				"columnHeader": "Interval Day(s)",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 10,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": true,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 995,
				"ColumnName": "ScheduledOn",
				"ColumnHeader": "Scheduled On",
				"SelectedByDefault": false,
				"fieldName": "ScheduledOn",
				"columnHeader": "Scheduled On",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 13,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 985,
				"ColumnName": "Status",
				"ColumnHeader": "Status",
				"SelectedByDefault": true,
				"fieldName": "Status",
				"columnHeader": "Status",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 4,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": 100,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			}


		];
	}

	// eslint-disable-next-line max-lines-per-function
	executionHisColumnOption(){
		return[
			{
				"XrmGridPersistentMasterId": 985,
				"ColumnName": "ExecutedOn",
				"ColumnHeader": "Executed On",
				"SelectedByDefault": true,
				"fieldName": "ExecutedOn",
				"columnHeader": "Executed On",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 4,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 986,
				"ColumnName": "ExecutedTime",
				"ColumnHeader": "Executed Time",
				"SelectedByDefault": true,
				"fieldName": "ExecutedTime",
				"columnHeader": "Executed Time",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 5,
				"Dir": "undefined",
				"ValueType": "text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 992,
				"ColumnName": "Status",
				"ColumnHeader": "Status",
				"SelectedByDefault": true,
				"fieldName": "Status",
				"columnHeader": "Status",
				"visibleByDefault": true,
				"IsReadOnly": true,
				"DefaultColumnSequence": 1,
				"Dir": "undefined",
				"ValueType": null,
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": null,
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null,
				"ApplicableForAdvanceSearch": true
			}
		];
	}

	monthDaysDropdown(){
		return[
			{Text: 1, Value: 1},
			{Text: 2, Value: 2},
			{Text: 3, Value: 3},
			{Text: 4, Value: 4},
			{Text: 5, Value: 5},
			{Text: 6, Value: 6},
			{Text: 7, Value: 7},
			{Text: 8, Value: 8},
			{Text: 9, Value: 9},
			{Text: 10, Value: 10},
			{Text: 11, Value: 11},
			{Text: 12, Value: 12},
			{Text: 13, Value: 13},
			{Text: 14, Value: 14},
			{Text: 15, Value: 15},
			{Text: 16, Value: 16},
			{Text: 17, Value: 17},
			{Text: 18, Value: 18},
			{Text: 19, Value: 19},
			{Text: 20, Value: 20},
			{Text: 21, Value: 21},
			{Text: 22, Value: 22},
			{Text: 23, Value: 23},
			{Text: 24, Value: 24},
			{Text: 25, Value: 25},
			{Text: 26, Value: 26},
			{Text: 27, Value: 27},
			{Text: 28, Value: 28},
			{Text: 29, Value: 29},
			{Text: 30, Value: 30},
			{Text: 31, Value: 31}
		];
	}

}
