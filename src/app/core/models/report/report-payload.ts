import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export class ReportDetails {
	ApplicableActions?:string;
	BaseEntityUkey:string;
	BaseReportXrmEntityId: number;
	BaseXrmEntityName: string;
	EditAccessibleToOthers: boolean;
	EditCreatorOnly: boolean;
	EmailRecipients: string;
	EmailSubject: string;
	FolderId:number;
	FolderName:string;
	Id: number;
	UserId:number;
	IncludeLinkedData: boolean;
	OutPutTypeName: string;
	OutputTypeId: number;
	OwnerId: number;
	OwnerName: string;
	ReportCode: string;
	ReportId: number;
	Json: ReportPayload;
	ReportTypeId: number;
	ReportTypeName: string;
	RunAccessibleToOthers: boolean;
	RunCreatorOnly: boolean;
	SaveReport: boolean;
	ScheduledReport: boolean;
	SendViaEmail: boolean;
	Subject: string;
	UKey: string;
	PaginationDto:PaginationDto;
	ReportName: string;
	  SavenRunMode:boolean = false;
	  RunMode:boolean = false;
	  RecentRunMode:boolean = false;
	  ExecuteMode:boolean = false;
	  CopyMode:boolean = false;
	  SelectedTabName:string = 'Popular';
	  RunReportCallNeeded:boolean = false;
	  LinkedDataAvailable:boolean = false;
	  IsCopyOfPredefined:boolean = false;
	IsEditMode:boolean = false;
	constructor(){
		this.BaseEntityUkey = '';
		this.BaseReportXrmEntityId = magicNumber.one;
		this.EditAccessibleToOthers = false;
		this.EditCreatorOnly = true;
		this.Id = magicNumber.zero;
		this.IncludeLinkedData = false;
		this.ReportId = magicNumber.zero;
		this.ScheduledReport = false;
		this.UKey = '';
		this.SaveReport = false;
		this.RunCreatorOnly = true;
		this.ReportTypeId = 293;
		this.OutputTypeId = 295;
		this.PaginationDto = new PaginationDto();
		this.Json = new ReportPayload();
		this.FolderId = magicNumber.one;
		this.ReportName = '';
		this.ApplicableActions = '';
	}
}
export class Schedule {
	SavedReportId: number;
	UserId: string;
	EmailTo:string;
	SelectedOption: string;
	SelectedDays: string;
	SelectedMonths: string;
	SelectedDates: string;
	SelectedHour: string;
	SelectedMinute: string;
	SelectedAmPm: string;
	Format: string;
	Schedule: string;
	LastRunResult: string;
	LastRun: string;
	NextRun: string;
	ScheduleStart: string | null;
	ScheduleEnd: string | null;
	TimeZone:string;
	DataFilters: string;
	Timezone: string;
 
}
export class ReportPayload {
	uKey: string;
	ReportId: number;
	ReportName: string;
	ReportDescription: string;
	FolderID: number;
	SelectedFieldIDs: number[];
	Filters: any[]; // Replace 'any' with a more specific type if possible
	Series: any[]; // Replace 'any' with a more specific type if possible
	IncludeSubTotals: boolean;
	EditFiltersOnReport: boolean;
	ShowUniqueRecords: boolean;
	ReportSettings: string; // If you want to parse it to an object, handle that separately
	OnlyTop: number | null;
	IsAggregateReport: boolean;
	ShowDataWithGraph: boolean;
	ShowOnDashboard: boolean;
	SelectedFields: FieldAttributes[];
	SortBy: number;
	SortDesc: boolean;
	SelectedSorts: selectedSorts[]; // Replace 'any' with a more specific type if possible
	ReportType: string = "List";
	UseStoredProc: boolean;
	StoredProcId: number | null;
	GroupFunctionList: any[]; // Replace 'any' with a more specific type if possible
	// Replace 'any' with a more specific type if possible
	DrillDownRow: any[]; // Replace 'any' with a more specific type if possible
	UserId: string;
	ViewOnlyUserId: string;
	DeleteOnlyUserId: string;
	UserRoles: string;
	ViewOnlyUserRoles: string;
	DeleteOnlyUserRoles: string;
	ClientId: number | null;
	chartType:string;
	DataFilters: Record<string, any>; // Use a more specific type if possible
	SelectedParameters: any[]; // Replace 'any' with a more specific type if possible
	OwnerName : string;
	OwnerId: number;
	OutputTypeId:number;
	Schedule:Schedule | null;
	Subject:string;
	RunReportCallNeeded:boolean = false;
	constructor(){
		this.ReportName = '';
		this.SelectedFields = [];
	}
}

export class PaginationDto{
	   pageSize: number;
	startIndex: number;
	userId: string;
	columnName: string;
	sortingDirection: string;
	smartSearchText: string;
	status: string;
	tabData: any;
	advanceFilter: any;
	xrmEntityId: number;
	entityType: string;
	contractorId: number;
	userValues: any;
	menuId: number;
	constructor(){
		this.pageSize = 100;
		  this.startIndex = 1;
		  this.userId = '';
		  this.columnName = '';
		  this.sortingDirection = 'asc';
		  this.smartSearchText = "";
		  this.status = "=";
		  this.tabData = {};
		  this.advanceFilter = {};
		  this.xrmEntityId = 0;
		  this.entityType = "";
		  this.contractorId = 0;
		  this.userValues = {};
		  this.menuId = 0;
	}
}


export class FieldAttributes {
	columnRoles: string | null;
	doNotDisplay: boolean;
	fieldAggregate: string[];
	fieldDbName: string | null;
	fieldFilter: string[];
	fieldId: number;
	fieldName: string;
	fieldOrder: number;
	fieldType: string;
	forceFilter: boolean;
	forceFilterForTable: boolean;
	foreignJoin: string | null;
	foreignKey: string | null;
	foreignParentApplyTo: string | null;
	foreignParentKeyField: string | null;
	foreignParentRequired: boolean;
	foreignParentTable: string | null;
	foreignParentValueField: string | null;
	foreignTable: string | null;
	foreignValue: string | null;
	hasForeignKey: boolean;
	hasForeignParentKey: boolean;
	isPrimary: boolean;
	jsonStructure: string;
	restrictedDateRange: string | null;
	restrictedEndDate: string | null;
	restrictedStartDate: string | null;
	tableId: number;
	selectedSorts:string | null;
	selectedfieldAggregate:string | null;
	tableName:string;
	highlight:boolean;
	constructor(){
		this.columnRoles = '';
		this.doNotDisplay = false;
		this.fieldAggregate = [];
		this.fieldDbName = '';
		this.fieldFilter = [];
		this.fieldType = '';
		this.forceFilter = false;
		this.forceFilterForTable = false;
		this.foreignJoin = '';
		this.foreignKey = '';
		this.foreignParentApplyTo = '';
		this.foreignParentKeyField = '';
		this.foreignParentRequired = false;
		this.foreignParentTable = '';
		this.foreignParentValueField = '';
		this.foreignTable = '';
		this.foreignValue = '';
		this.hasForeignKey = false;
		this.hasForeignParentKey = false;
		this.isPrimary = false;
		this.jsonStructure = '';
		this.restrictedDateRange = '';
		this.restrictedEndDate = '';
		this.restrictedStartDate = '';
		this.tableId = magicNumber.zero;
		this.selectedSorts = null;
		this.selectedfieldAggregate = null;
		this.tableName = '';
		this.highlight = false;
	}

}
export interface selectedSorts{
		FieldId: number,
		Descending: boolean
}
