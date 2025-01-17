/* eslint-disable max-lines-per-function */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { HttpMethodService } from './http-method.service';
import { EntityAction } from '@xrm-shared/models/menu-interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { XrmEntities } from './common-constants/XrmEntities.enum';

@Injectable({
	providedIn: 'root'
})
export class GlobalSearchService extends HttpMethodService {

	public headerSearchText = new BehaviorSubject<{ searchText: string, module: number }>({searchText: '', module: XrmEntities.LightIndustrialRequest});

	public headerSearchTextObs = this.headerSearchText.asObservable();

	constructor(
		private http: HttpClient,
		private globalSer: GlobalService
	) {
		super(http);
	}

	getAuthorizeModules(){
		return this.GetAll<ApiResponse>('/gbl-srch');
	}

	getActionList():Observable<GenericResponseBase<EntityAction[]>>{
		return this.GetAll<GenericResponseBase<EntityAction[]>>('/gbl-srch-act/actionlist');
	}

	getContractorUkey(id: any){
		return this.Get<GenericResponseBase<{UKey: string}>>('/gbl-srch-cont', id);
	}

	getColumnCaptions(entityId: any, entityType: string = '', menuId: any = 0){
		const userId = this.globalSer.getXUIDValue();
		if(!entityType)
		 entityType = ' ';
	   return this.GetAll<any>(`/xrm-user-grid-detail/${userId}/${entityId}/${entityType}/${menuId}`);
	  }
	  columnCaptionsLI(){
		return [
			{
				"XrmGridPersistentMasterId": 983,
				"ColumnName": "RequestCode",
				"ColumnHeader": "RequestId",
				"SelectedByDefault": true,
				"fieldName": "RequestCode",
				"columnHeader": "RequestId",
				"visibleByDefault": true,
				"IsReadOnly": true,
				"DefaultColumnSequence": 1,
				"Dir": "undefined",
				"ValueType": "Text",
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
			// {
			// 	"XrmGridPersistentMasterId": 998,
			// 	"ColumnName": "Request Type",
			// 	"ColumnHeader": "Request Type",
			// 	"SelectedByDefault": false,
			// 	"fieldName": "RequestType",
			// 	"columnHeader": "Request Type",
			// 	"visibleByDefault": true,
			// 	"IsReadOnly": false,
			// 	"DefaultColumnSequence": 16,
			// 	"Dir": "undefined",
			// 	"ValueType": "Text",
			// 	"EntityType": null,
			// 	"MapFromProperty": null,
			// 	"IsLocalizedKey": false,
			// 	"ColumnWidth": null,
			// 	"DecimalPlaces": 0,
			// 	"Viewable": true,
			// 	"MaskingAllowed": false,
			// 	"TypeOfMasking": null,
			// 	"MaskingCount": null,
			// 	"ControlType": "multiselect",
			// 	"IsValueCommaSeparated": false,
			// 	"GroupName": null,
			// 	"MenuId": null,
			// 	"DynamicParam": null
			// },
			{
				"XrmGridPersistentMasterId": 985,
				"ColumnName": "SectorName",
				"ColumnHeader": "Sector",
				"SelectedByDefault": true,
				"fieldName": "SectorName",
				"columnHeader": "Sector",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 4,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"ColumnName": "WorkLocationName",
				"ColumnHeader": "Location",
				"SelectedByDefault": true,
				"fieldName": "WorkLocationName",
				"columnHeader": "Work Location",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 5,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"ColumnName": "Orglevel1Name",
				"ColumnHeader": "OrgLevel1",
				"SelectedByDefault": true,
				"fieldName": "Orglevel1Name",
				"columnHeader": "OrgLevel1",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 6,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 987,
				"ColumnName": "JobCategoryName",
				"ColumnHeader": "JobCategory",
				"SelectedByDefault": true,
				"fieldName": "JobCategoryName",
				"columnHeader": "JobCategory",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 7,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"ColumnName": "Status",
				"ColumnHeader": "Disabled",
				"SelectedByDefault": false,
				"fieldName": "Status",
				"columnHeader": "Disabled",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 10,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"ColumnName": "ReasonForRequestName",
				"ColumnHeader": "ReasonForRequest",
				"SelectedByDefault": false,
				"fieldName": "ReasonForRequestName",
				"columnHeader": "ReasonForRequest",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 13,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 998,
				"ColumnName": "LaborCategoryName",
				"ColumnHeader": "LaborCategory",
				"SelectedByDefault": false,
				"fieldName": "LaborCategoryName",
				"columnHeader": "LaborCategory",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 16,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 988,
				"ColumnName": "ShiftName",
				"ColumnHeader": "IsAllowManualShift",
				"SelectedByDefault": false,
				"fieldName": "ShiftName",
				"columnHeader": "IsAllowManualShift",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 11,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 991,
				"ColumnName": "RequestingManagerName",
				"ColumnHeader": "RequestingManager",
				"SelectedByDefault": true,
				"fieldName": "RequestingManagerName",
				"columnHeader": "Primary/Requesting Manager",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 3,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 996,
				"ColumnName": "Orglevel2Name",
				"ColumnHeader": "OrgLevel2",
				"SelectedByDefault": false,
				"fieldName": "Orglevel2Name",
				"columnHeader": "OrgLevel2",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 14,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 997,
				"ColumnName": "Orglevel3Name",
				"ColumnHeader": "OrgLevel3",
				"SelectedByDefault": false,
				"fieldName": "Orglevel3Name",
				"columnHeader": "OrgLevel3",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 15,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 998,
				"ColumnName": "Orglevel4Name",
				"ColumnHeader": "OrgLevel4",
				"SelectedByDefault": false,
				"fieldName": "Orglevel4Name",
				"columnHeader": "OrgLevel4",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 16,
				"Dir": "undefined",
				"ValueType": "Text",
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
			}
		];
	}

	columnCaptionsAssignment(){
		return [
			{
				"XrmGridPersistentMasterId": 1151,
				"ColumnName": "Code",
				"ColumnHeader": "ContractorID",
				"SelectedByDefault": true,
				"fieldName": "ContractorCode",
				"columnHeader": "ContractorID",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 1,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 1152,
				"ColumnName": "Name",
				"ColumnHeader": "Name",
				"SelectedByDefault": true,
				"fieldName": "ContractorName",
				"columnHeader": "Contractor Name",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 2,
				"Dir": "undefined",
				"ValueType": "Text",
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
			// {
			// 	"XrmGridPersistentMasterId": 1318,
			// 	"ColumnName": "Contractor Type",
			// 	"ColumnHeader": "Contractor Type",
			// 	"SelectedByDefault": false,
			// 	"fieldName": "ContractorType",
			// 	"columnHeader": "Contractor Type",
			// 	"visibleByDefault": true,
			// 	"IsReadOnly": false,
			// 	"DefaultColumnSequence": 9,
			// 	"Dir": "undefined",
			// 	"ValueType": "Text",
			// 	"EntityType": "AssignmentDetailList",
			// 	"MapFromProperty": null,
			// 	"IsLocalizedKey": false,
			// 	"ColumnWidth": null,
			// 	"DecimalPlaces": 0,
			// 	"Viewable": true,
			// 	"MaskingAllowed": false,
			// 	"TypeOfMasking": null,
			// 	"MaskingCount": null,
			// 	"ControlType": "multiselect",
			// 	"IsValueCommaSeparated": false,
			// 	"GroupName": null,
			// 	"MenuId": null,
			// 	"DynamicParam": null
			// },
			{
				"XrmGridPersistentMasterId": 1316,
				"ColumnName": "SectorName",
				"ColumnHeader": "Sector",
				"SelectedByDefault": true,
				"fieldName": "SectorName",
				"columnHeader": "Sector",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 2,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": false,
				"TypeOfMasking": null,
				"MaskingCount": null,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": true,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": "Sector"
			},
			{
				"XrmGridPersistentMasterId": 1318,
				"ColumnName": "OrgLevel1Name",
				"ColumnHeader": "OrgLevel1",
				"SelectedByDefault": false,
				"fieldName": "OrgLevel1Name",
				"columnHeader": "OrgLevel1",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 9,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1314,
				"ColumnName": "AssignmentId",
				"ColumnHeader": "AssignmentID",
				"SelectedByDefault": true,
				"fieldName": "AssignmentId",
				"columnHeader": "AssignmentID",
				"visibleByDefault": true,
				"IsReadOnly": true,
				"DefaultColumnSequence": 1,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1231,
				"ColumnName": "Status",
				"ColumnHeader": "Status",
				"SelectedByDefault": true,
				"fieldName": "StatusName",
				"columnHeader": "Status",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"DefaultColumnSequence": 4,
				"Dir": "undefined",
				"ValueType": "Text",
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
				"XrmGridPersistentMasterId": 1322,
				"ColumnName": "JobCategoryName",
				"ColumnHeader": "JobCategory",
				"SelectedByDefault": false,
				"fieldName": "JobCategoryName",
				"columnHeader": "JobCategory",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 11,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1160,
				"ColumnName": "SSN",
				"ColumnHeader": "UID",
				"SelectedByDefault": false,
				"fieldName": "SSN",
				"columnHeader": "UID",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 5,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": null,
				"MapFromProperty": null,
				"IsLocalizedKey": false,
				"ColumnWidth": null,
				"DecimalPlaces": 0,
				"Viewable": true,
				"MaskingAllowed": true,
				"TypeOfMasking": "left",
				"MaskingCount": 3,
				"ControlType": "multiselect",
				"IsValueCommaSeparated": false,
				"GroupName": null,
				"MenuId": null,
				"DynamicParam": null
			},
			{
				"XrmGridPersistentMasterId": 1317,
				"ColumnName": "LocationName",
				"ColumnHeader": "Location",
				"SelectedByDefault": true,
				"fieldName": "LocationName",
				"columnHeader": "Work Location",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 3,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1318,
				"ColumnName": "ShiftName",
				"ColumnHeader": "Shift",
				"SelectedByDefault": false,
				"fieldName": "ShiftName",
				"columnHeader": "Shift",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 9,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1318,
				"ColumnName": "OrgLevel2Name",
				"ColumnHeader": "OrgLeve2",
				"SelectedByDefault": false,
				"fieldName": "OrgLevel2Name",
				"columnHeader": "OrgLevel2",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 9,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1318,
				"ColumnName": "OrgLevel3Name",
				"ColumnHeader": "OrgLevel3",
				"SelectedByDefault": false,
				"fieldName": "OrgLevel3Name",
				"columnHeader": "OrgLevel3",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 9,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
				"XrmGridPersistentMasterId": 1318,
				"ColumnName": "OrgLevel4Name",
				"ColumnHeader": "OrgLevel4",
				"SelectedByDefault": false,
				"fieldName": "OrgLevel4Name",
				"columnHeader": "OrgLevel4",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"DefaultColumnSequence": 9,
				"Dir": "undefined",
				"ValueType": "Text",
				"EntityType": "AssignmentDetailList",
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
			}
		];

	}

	columnCaptionsCandidate(){
		return [
			{
				"TableName": "CandidatePools",
				"FieldName": "CandidateId",
				"ColumnHeader": "CandidateId",
				"IsGridColumn": true,
				"fieldName": "CandidateId",
				"columnHeader": "CandidateId",
				"visibleByDefault": true,
				"IsReadOnly": true,
				"SelectedByDefault": true,
				"DisplayOrder": 1,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": null,
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": false,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "CandidateName",
				"ColumnHeader": "CandidateName",
				"IsGridColumn": true,
				"fieldName": "CandidateName",
				"columnHeader": "CandidateName",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"SelectedByDefault": true,
				"DisplayOrder": 2,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": null,
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": false,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "Email",
				"ColumnHeader": "EmailAddress",
				"IsGridColumn": true,
				"fieldName": "Email",
				"columnHeader": "EmailAddress",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"SelectedByDefault": false,
				"DisplayOrder": 9,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": null,
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": false,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "ContactNumber",
				"ColumnHeader": "ContactNumber",
				"IsGridColumn": true,
				"fieldName": "ContactNumber",
				"columnHeader": "ContactNumber",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"SelectedByDefault": false,
				"DisplayOrder": 9,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": null,
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": false,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "UId",
				"ColumnHeader": "ContractorUId",
				"IsGridColumn": true,
				"fieldName": "UId",
				"columnHeader": "ContractorUId",
				"visibleByDefault": true,
				"IsReadOnly": false,
				"SelectedByDefault": true,
				"DisplayOrder": 3,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "input",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": null,
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": false,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "PreferredSectors",
				"ColumnHeader": "Preferred Sector",
				"IsGridColumn": true,
				"fieldName": "PreferredSectors",
				"columnHeader": "Preferred Sector",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"SelectedByDefault": false,
				"DisplayOrder": 7,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": "Sector",
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": true,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "PreferredLocations",
				"ColumnHeader": "PreferredLocation",
				"IsGridColumn": true,
				"fieldName": "PreferredLocations",
				"columnHeader": "PreferredLocation",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"SelectedByDefault": false,
				"DisplayOrder": 8,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": "Sector",
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": true,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			},
			{
				"TableName": "CandidatePools",
				"FieldName": "PreferredShift",
				"ColumnHeader": "PreferredShift",
				"IsGridColumn": true,
				"fieldName": "PreferredShift",
				"columnHeader": "PreferredShift",
				"visibleByDefault": false,
				"IsReadOnly": false,
				"SelectedByDefault": false,
				"DisplayOrder": 9,
				"ApplicableForAdvancedSearch": true,
				"ControlType": "multiselect",
				"OptionalDropdownData": null,
				"AndLogicInMultiSelect": null,
				"APIUrl": null,
				"ValueType": "Text",
				"DynamicParam": null,
				"GroupName": null,
				"IsLocalizedKey": false,
				"IsValueCommaSeparated": false,
				"SortOrder": null,
				"DecimalPlaces": 0,
				"Viewable": false
			}
		];
	}

}
