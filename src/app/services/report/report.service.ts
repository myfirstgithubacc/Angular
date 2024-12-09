/* eslint-disable max-lines-per-function */
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ReportFolderAddEdit, ReportFolderList } from '@xrm-core/models/report/report-folder-list';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { BasicEntitiesDetails, PopularEntitiesDetails } from '@xrm-core/models/report/basic-entity-details';
import { ReportPayload } from '@xrm-core/models/report/report-payload';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ReportDetails } from '@xrm-core/models/report/report-details';

@Injectable({
	providedIn: 'root'
})
export class ReportDataService extends HttpMethodService {
	public isGridChangedSubject = new BehaviorSubject<boolean>(false);
	public isGridChanged = this.isGridChangedSubject.asObservable(); 
	public baseData = new BehaviorSubject<any>(false);

	public baseDataObs = this.baseData.asObservable();

	public buildData = new BehaviorSubject<any>(false);

	public buildDataObs = this.buildData.asObservable();

	public reportData = new BehaviorSubject<any>(false);

	public reportDataObs = this.reportData.asObservable();

	public setStepperData = new BehaviorSubject<any>(null);

	public getStepperData = this.setStepperData.asObservable();

	public isStepperClicked = new BehaviorSubject<any>(null);

	public isStepperClickedObs = this.isStepperClicked.asObservable();

	public isExecuteReport = new BehaviorSubject<any>(false);

	public IsExecuteReport = this.isExecuteReport.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	setData(data: any) {
		if (data) {
			this.baseData.next(data);
		}
	}
	setBuildData(data: any) {
		if (data) {
			this.buildData.next(data);
		}
	}

	setReportData(data: any) {
		if (data) {
			this.reportData.next(data);
		}
	}
	getUserList(): Observable<ApiResponse> {
		const data: any = {
			"byPassLoader": true,
			"entityId": 35,
			"entityType": null,
			"columnName": null,
			"pageSize": 10,
			"searchText": null,
			"userValues": {
				"RoleGroupId": window.sessionStorage.getItem('roleGroupId'),
				"AllStaffingUsers": false
			},
			"pageIndex": 0
		};
		return this.Post(`/user-detail/get-user-ddl-paged`, data);
	}
	getReportDetailsByUkey(uKey:string){
		return this.GetAll<GenericResponseBase<BasicEntitiesDetails[]>>(`/report/report-ukey/${uKey}`);
	}
	getDefaultColumnByEntityId(entityId:string | number){
		return this.GetAll<GenericResponseBase<any>>(`/report/get-def-col/${entityId}`);
	}
	getAllBaseEntities(): Observable<GenericResponseBase<BasicEntitiesDetails[]>>{
		return this.GetAll<GenericResponseBase<BasicEntitiesDetails[]>>('/report/get-base-entity');
	}

	getAllPreDefinedReports(): Observable<GenericResponseBase<any>>{
		return this.GetAll<GenericResponseBase<any>>('/report/select-pre-rpts');
	}

	getAllBasePopularEntities() : Observable<GenericResponseBase<PopularEntitiesDetails[]>>{
		return this.GetAll<GenericResponseBase<PopularEntitiesDetails[]>>('/report/get-popular-entity');
	}
	getFolderList() : Observable<GenericResponseBase<ReportFolderList[]>> {
		return this.GetAll<GenericResponseBase<ReportFolderList[]>>('/report/get-folders');
	}

	getEntityTables(baseData:any, isInclude:boolean){
		return this.GetAll(`/report/get-entity-tables/${baseData}/${isInclude}`);
	}

	addNewFolder(payload: ReportFolderAddEdit):Observable<GenericResponseBase<ReportFolderAddEdit>>{
		return this.Post('/report/save-folder', payload);
	}
	updateReport(payload:any){
		return this.PutBulk(`/report/edit-report/${payload.UKey}`, payload);
	}
	addReport(payload: any){
		return this.Post('/report/save', payload);
	}
	runReport(payload: any){
		return this.Post('/report/run-report', payload);
	}

	updateFolder(payload: ReportFolderAddEdit):Observable<GenericResponseBase<ReportFolderAddEdit>>{
		return this.Put('/report/edit', payload);
	}

	deleteFolder(Ukey: string): Observable<GenericResponseBase<ReportFolderAddEdit>> {
		return this.Delete('/report/del-folder', Ukey);
	}


	callReportApi(param:any){
		return this.http.get(`https://nvxrm-dev.acrocorp.com/dotnetreportsetup/api/DotNetReportApi
	/CallReportApi?method=%2FReportApi%2FLoadReport&model=%7B%22reportId%22%3A${param}%2C%22adminMode%22%3Afalse%7D&_=1720694181546`);
	}

	runReportApi(payload:any, headers:any){
		return	this.http.post(`https://nvxrm-dev.acrocorp.com/dotnetreportsetup/api/DotNetReportApi/RunReportApi`, payload, {headers});
	}


	public submitReport(payload: any): Observable<GenericResponseBase<any>> {
		const endpoint = '/report/save';
		return this.Post(endpoint, payload);
	}

	public getExeHistoryByUkey(ukey: string): Observable<GenericResponseBase<ReportDetails[]>> {
		return this.GetAll(`/report/exec-his/${ukey}`).pipe(map((res: unknown) => {
			const typedRes = res as GenericResponseBase<ReportDetails[]>;
			typedRes.Data?.map((data) => {
				if(data.Status === 'Completed')
					data.DmsFieldRecord.DocumentAddDto.UKey = data.UKey;
			});
			return typedRes;
		}));
	}

	public getLookupList(data:any):Observable<GenericResponseBase<any>>{
		return this.Post(`/report/select-lookup`, data);
	}

	public deleteReport(ukey:string):Observable<GenericResponseBase<null>>{
		return this.Delete('/report/del-report', ukey);
	}
	public downloadReport(ukey:string):Observable<HttpResponse<Blob>>{
		const url = `${this.baseUrl}/report/download-file/${ukey}`;
		return this.http.get<Blob>(url, { responseType: 'blob' as 'json', withCredentials: true, observe: 'response' });
	}

	// eslint-disable-next-line max-statements
	preparePayLoad(selectedFields: any[], filterData: any, reportData?: any, chartType: string = 'List') {
		const fields: any = [],
		 sorts:any = [];
		selectedFields.forEach((field: any) => {
			const obj = {
				FieldID: field.fieldId
					? field.fieldId
					: field.FieldID,
				FieldId: field.fieldId
					? field.fieldId
					: field.FieldID,
				GroupFunc: field.selectedfieldAggregate ?? "",
				FieldLabel: field.fieldName
					? field.fieldName
					: field.FieldLabel,
				CustomLabel: field.fieldName
					? field.fieldName
					: field.FieldLabel,
				JsonColumnName: "",
				FieldConditionVal: "",
				LinkFieldItem: null,
				FieldSettings: JSON.stringify({
					dateFormat: "",
					customDateFormat: "",
					currencyFormat: "",
					fieldLabel2: ""
				})
			};
			if(field.selectedSorts){
				sorts.push({
					FieldId: field.fieldId
						? field.fieldId
						: field.FieldID,
					Descending: field.selectedSorts == 'Asc'
						? false
						: true
			  });
			}
			fields.push(obj);
		});
		selectedFields = fields;
		// eslint-disable-next-line one-var
		const data = new ReportPayload();
		data.GroupFunctionList = selectedFields;
		data.uKey = reportData?.uKey;
		// eslint-disable-next-line one-var
		const settings = '{dateFormat: "", customDateFormat: "", currencyFormat: "", fieldLabel2: ""}';
		data.GroupFunctionList.forEach((a: any) => {
			a.FieldSettings = settings;
		});
		data.SelectedFieldIDs = selectedFields.map((field: any) =>
			field.FieldID);
		data.OutputTypeId = reportData?.OutputTypeId;
		data.Filters = filterData ?? [];
		data.ReportId = reportData?.ReportId;
		data.FolderID = reportData?.FolderID ?? 1;
		data.ReportName = reportData?.ReportName;
		data.ReportDescription = reportData?.ReportDescription;
		data.OwnerName = reportData?.OwnerName;
		data.OwnerId = reportData?.OwnerId;
		if(sorts.length < magicNumber.one){
			data.SortBy = data.SelectedFieldIDs[0];
			data.SortDesc = false;
		}
		else if(sorts.length == magicNumber.one){
			data.SortBy = sorts[0].FieldId;
			data.SortDesc = sorts[0].Descending;
		}
		if(sorts.length > magicNumber.one){
			data.SortBy = sorts[0].FieldId;
			data.SortDesc = sorts[0].Descending;
			sorts.shift();
			data.SelectedSorts = sorts;
		}
		data.Series = [];
		data.IncludeSubTotals = false;
		data.EditFiltersOnReport = true;
		data.ShowUniqueRecords = false;
		data.ReportSettings = '{"ShowExpandOption": false, "SelectedStyle": "default", "DontExecuteOnRun": false, "barChartStacked": false, "barChartHorizontal": false, "DefaultPageSize": 10}';
		data.OnlyTop = null;
		data.IsAggregateReport = chartType == 'summary'
			? true
			: false;
		data.ShowDataWithGraph = false;
		data.ShowOnDashboard = false;
		data.ReportType = reportData.ReportType;
		data.UseStoredProc = false;
		data.StoredProcId = null;
		data.DrillDownRow = [];
		data.UserId = "";
		data.ViewOnlyUserId = "";
		data.DeleteOnlyUserId = "";
		data.UserRoles = "";
		data.ViewOnlyUserRoles = "";
		data.DeleteOnlyUserRoles = "";
		data.ClientId = null;
		data.DataFilters = {};
		data.SelectedParameters = [];
		data.Schedule = reportData.Schedule;
		if(chartType == 'pie'){
			data.chartType = 'pie';
		}
		else if(chartType == 'line'){
			data.chartType = 'line';
		}
		else if(chartType == 'column'){
			data.chartType = 'column';
		}
		else{
			data.chartType = '';
		}
		return data;

	}
}

