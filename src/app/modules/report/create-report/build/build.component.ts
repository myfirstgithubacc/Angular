
/* eslint-disable one-var */
import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CompositeFilterDescriptor } from "@progress/kendo-data-query";
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ReportDataService } from 'src/app/services/report/report.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ReportNavigationPaths } from '../../constants/route-path';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { FieldAttributes, ReportDetails, ReportPayload, selectedSorts} from '@xrm-core/models/report/report-payload';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { DialogButton } from '@xrm-master/user/interface/user';
import { Subject, take, takeUntil } from 'rxjs';
import { NavigationService } from '../../common/utils/common-method';
import { OutputType } from '../../constants/enum-constants';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { StatusData } from '@xrm-shared/models/common-header.model';


@Component({
	selector: 'app-build',
	templateUrl: './build.component.html',
	styleUrls: ['./build.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class BuildComponent implements OnInit, OnDestroy{
	public sorts: string[] = ["Asc", "Desc"];
	public indexRow = magicNumber.minusOne;
	public value: any = [];
	private entityGroupList: any = [];
	public gridData: any =[];
	public filterData:any = null;
	private defaultSelectedField:any = [];
	private draggeddData:FieldAttributes;
	public isDisabled:boolean = false;
	public isExpanedeField : boolean =false;
	public selectedFields: FieldAttributes[] = [];
	public resetStep = false;
	public currentStep = magicNumber.one;
	public reportId:number = magicNumber.zero;
	public isCustomReport:boolean = false;
	public activeItem: string = 'list';
	private destroyAllSubscribtion$ = new Subject<void>();
	public isInvalidFilterValue:boolean = false;
	public isDragStart:boolean = false;
	private destroyAllSubscription$ = new Subject<void>();
	private isEditMode:boolean = false;
	public reportDetails: ReportDetails;
	public includeLinkedData:FormGroup;
	public entityId = XrmEntities.Report;
	public commonHeader:FormGroup;
	public statusData: StatusData = {
		items: [
			{
				title: 'Report Name',
				titleDynamicParam: [],
				item: '',
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: ''
			}
		]
	};
	// eslint-disable-next-line max-lines-per-function, max-params
	constructor(
    private route: Router,
    private fb: FormBuilder,
    public sector: SectorService,
	private activatedRoute: ActivatedRoute,
	private cd: ChangeDetectorRef,
	private reportDataService:ReportDataService,
	private toasterServc: ToasterService,
	private dialogService: DialogPopupService,
	private navigationService:NavigationService
	) {
	  this.value = [];
	  this.includeLinkedData = this.fb.group({
			linkedData: [null]
	  });
	  this.reportDetails = JSON.parse(window.sessionStorage.getItem('reportData') ?? '{}');
	}
	// eslint-disable-next-line max-lines-per-function
	ngOnInit(): void {
		// eslint-disable-next-line max-lines-per-function
  		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((param) => {
			if(this.reportDetails.Json.SelectedFields.length > Number(magicNumber.zero)){
				const copyMode = this.reportDetails.CopyMode;
				this.statusData.items[0].item = this.reportDetails.ReportName;
				this.reportDetails.CopyMode = copyMode;
				this.includeLinkedData.get('linkedData')?.setValue(this.reportDetails.IncludeLinkedData);
				this.getEntityTablesReport(this.reportDetails.BaseEntityUkey, this.reportDetails.IncludeLinkedData, false);
				this.reportId = this.reportDetails.Json.ReportId;
				if(this.reportDetails.ReportId == Number(magicNumber.zero)){
					this.reportId = magicNumber.zero;
				}
				if(this.reportDetails.UKey != ''){
					this.isEditMode = true;
				}
				this.selectedFields = this.reportDetails.Json.SelectedFields;
				this.activeItem = this.reportDetails.Json.ReportType.toLowerCase();
				if (this.reportDetails.Json.IsAggregateReport) {
					this.activeItem = 'summary';
					this.isDisabled = true;
				}
				if (this.reportDetails.Json.Filters.length > Number(magicNumber.zero)) {
					this.filterData = [this.convertFilters(this.reportDetails.Json.Filters[magicNumber.zero], this.reportDetails.Json.ReportId)];
				}
				this.value = [...this.reportDetails.Json.Filters];
				this.bindSortnAggregation();
			}
			else if (param['id'] || this.reportDetails.CopyMode) {
				let uKey = param['id'];
				if(this.reportDetails.CopyMode){
					uKey = this.reportDetails.UKey;
					this.isEditMode = false;
				}
				else{
					this.isEditMode = true;
				}
				this.reportDataService.setStepperData.next({ currentStep: magicNumber.one });
				this.reportDataService.getReportDetailsByUkey(uKey).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
					if (data.Succeeded) {
						const copyMode = this.reportDetails.CopyMode;
						this.reportDetails = data.Data;
						this.reportDetails.CopyMode = copyMode;
						this.getEntityTablesReport(data.Data.BaseEntityUkey, data.Data.IncludeLinkedData, false);
						this.includeLinkedData.get('linkedData')?.setValue(this.reportDetails.IncludeLinkedData);
						this.reportId = this.reportDetails.Json.ReportId;
						this.selectedFields = this.reportDetails.Json.SelectedFields;
						if(copyMode){
							this.reportDetails.ReportId = magicNumber.zero;
							this.reportDetails.Json.ReportId = magicNumber.zero;
						}
						this.statusData.items[0].item = this.reportDetails.ReportName;
						this.activeItem = this.reportDetails.Json.ReportType.toLowerCase();
						if (this.reportDetails.Json.IsAggregateReport) {
							this.activeItem = 'summary';
							this.isDisabled = true;
						}
						if (this.reportDetails.Json.Filters.length > Number(magicNumber.zero)) {
							// eslint-disable-next-line max-len
							this.filterData = [this.convertFilters(this.reportDetails.Json.Filters[magicNumber.zero], this.reportDetails.Json.ReportId)];
						}
						this.value = [...this.reportDetails.Json.Filters];
						this.bindSortnAggregation();
					}
				});
			}
			else {
				this.isEditMode = false;
				if (this.reportDetails.BaseEntityUkey) {
					this.getEntityTablesReport(this.reportDetails.BaseEntityUkey, this.reportDetails.IncludeLinkedData, true);
				}
			}

		});

  	this.activatedRoute.data.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
  		this.isCustomReport = data.isCustomReport;
		  if(this.isCustomReport){
  			this.reportDataService.setStepperData.next({currentStep: magicNumber.one});
  		}
  		else{
  			this.reportDataService.setStepperData.next({currentStep: 2});
  		}
  	});

	  this.reportDataService.isStepperClickedObs.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((data: any) => {
			if (!data) return;
			const stepIndex = data.index,
				targetStep = this.isCustomReport
					? magicNumber.two
					: magicNumber.three;
			switch (stepIndex) {
		  case targetStep:
					this.handleStep();
					break;
		  case magicNumber.one:
					if (!this.isCustomReport) {
			  this.reportDataService.setStepperData.next({ currentStep: magicNumber.one });
			  this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.parameterSelection]);
					}
					break;
		  default:
					break;
			}
	  });
	}
	bindSortnAggregation(){
		this.selectedFields.map((x: FieldAttributes) => {
			x.selectedfieldAggregate = null;
			x.selectedSorts = null;
			const index = this.reportDetails.Json.GroupFunctionList.findIndex((field: any) =>
				field.FieldId == x.fieldId);
			if (index > Number(magicNumber.minusOne)) {
				x.selectedfieldAggregate = this.reportDetails.Json.GroupFunctionList[index].GroupFunc;
			}
		});
		if (this.reportDetails.Json.SelectedSorts?.length > Number(magicNumber.zero)) {
			const indexSortBy = this.selectedFields.findIndex((field: FieldAttributes) =>
				field.fieldId == this.reportDetails.Json.SortBy);
			if (indexSortBy > Number(magicNumber.minusOne)) {
				if(this.reportDetails.Json.SortDesc){
					this.selectedFields[indexSortBy].selectedSorts = 'Desc';
				}
				else{
					this.selectedFields[indexSortBy].selectedSorts = 'Asc';
				}
			}
			this.reportDetails.Json.SelectedSorts.forEach((sort: selectedSorts) => {
				const indexSorts = this.selectedFields.findIndex((field: FieldAttributes) =>
					field.fieldId == sort.FieldId);
				if (indexSorts > Number(magicNumber.minusOne)) {
					this.selectedFields[indexSorts].selectedSorts = sort.Descending
						? 'Desc'
						: 'Asc';
				}
			});
		}
		else{
			const indexSortBy = this.selectedFields.findIndex((field: FieldAttributes) =>
				field.fieldId == this.reportDetails.Json.SortBy);
			if (indexSortBy > Number(magicNumber.minusOne)) {
				if(this.reportDetails.Json.SortDesc){
					this.selectedFields[indexSortBy].selectedSorts = 'Desc';
				}
				else{
					this.selectedFields[indexSortBy].selectedSorts = 'Asc';
				}
			}
		}
		this.cd.markForCheck();
	}
	private handleStep(): void {
  	if (this.selectedFields.length > Number(magicNumber.zero) && !this.isInvalidFilterValue) {
	  const stepperIndex = { currentStep: this.isCustomReport
  			? magicNumber.two
  			: magicNumber.three },
  			path = this.isCustomReport
  			? ReportNavigationPaths.addEdit.customReport.formatAndSave
  			: ReportNavigationPaths.addEdit.predefinedReport.formatAndSave;
	  this.reportDataService.setStepperData.next(stepperIndex);
	  this.route.navigate([path]);
  	} else {
	  this.toasterServc.showToaster(ToastOptions.Warning, 'Please select fields for the report.');
  	}
	}
	onChangeIncludeLinkedData(event:boolean){
		this.reportDetails.IncludeLinkedData = event;
		this.getEntityTablesReport(this.reportDetails.BaseEntityUkey, event, false);
	}
	// eslint-disable-next-line max-lines-per-function
	getEntityTablesReport(entityId:string, includeLinkedData:boolean, isDefaultColumnCallNeeded:boolean){
  	// eslint-disable-next-line max-lines-per-function
  	this.reportDataService.getEntityTables(entityId, includeLinkedData).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
  		if(data){
  			this.entityGroupList = data.Data;
			  this.bindGrid(data.Data);
			  this.reportDetails.LinkedDataAvailable = data.Data[0].LinkedDataAvailable;
  			if(isDefaultColumnCallNeeded){
  				this.reportDataService.getDefaultColumnByEntityId(entityId).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data:any) => {
  					if(data){
  						this.defaultSelectedField = data.Data;
  						this.defaultSelectedField.forEach((a:any) => {
  							// eslint-disable-next-line max-nested-callbacks
  							const data = this.entityGroupList.filter((ent:any) =>
									ent.entity.Id == a.EntityId);
					   // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-nested-callbacks
					   data.forEach((tab:any) => {
  								// eslint-disable-next-line max-nested-callbacks
  								tab.tables.forEach((table:any) => {
  									if(table.tableDbName.split('.').pop() == a.TableName){
								   // eslint-disable-next-line max-nested-callbacks
								   table.fields.forEach((field:any) => {
  											if(field.fieldDbName == a.FieldName){
  												a.fieldId = field.fieldId;
  												a.fieldName = field.fieldName;
  												a.tableName = table.tableName;
  												a.fieldFilter = field.fieldFilter;
  												a.fieldType = field.fieldType;
  												a.fieldAggregate = field.fieldAggregate;
													a.hasForeignKey = field.hasForeignKey;
											    a.selectedfieldAggregate = null;
													a.selectedSorts = null;
									   }
								   });
  									}
  								});
					   });
					   });
  						this.selectedFields = this.defaultSelectedField;
  						this.selectedFields.sort((a:any, b:any) =>
  							a.DisplayOrder - b.DisplayOrder);
						  this.mapDataEntity();
						  this.selectedFields.forEach((x:FieldAttributes) => {
							  this.markUnmarkSelectedFields(x.fieldId, true);
							});
						}
  				});
  			}
  			else{
  				this.mapDataEntity();
  				this.selectedFields.map((x:FieldAttributes) => {
  					this.markUnmarkSelectedFields(x.fieldId, true);
  				});
				}
  		}
  	});
	}
	isInvalidFilter(isInvalid:boolean){
		this.reportDataService.isGridChangedSubject.next(true);
  	this.isInvalidFilterValue = isInvalid;
	}
	convertFilters(input: any, id: number) {
  	return {
  		AndOr: input.AndOr.trim(),
  		Filters: input.Filters.map((filter:any) =>
  			this.transformFilter(filter, id)), // Correctly pass each filter
  		isRoot: true,
  		SavedReportId: id
  	};
	}

	transformFilter(filter: any, id: number): any {
  	if(filter.FieldId == null){
  		return {
  			AndOr: filter.AndOr.trim(),
  			Filters: filter.Filters.map((filter:any) =>
  				this.transformFilter(filter, id)), // Correctly pass each filter
  			isRoot: true,
  			SavedReportId: id
  		};
  	}
  	else{
  		return {
  			AndOr: filter.AndOr.trim(), // Trim the AndOr value
  			Filters: filter.Filters.map((subFilter:any) =>
			   this.transformFilter(subFilter, id)), // Correctly map over sub-filters
  			FieldId: filter.FieldId.toString(),
  			Operator: filter.Operator,
  			SavedReportId: id,
  			Value1: filter.Value1,
  			Value2: filter.Value2
  		};
  	}
	}
	mapDataEntity(){
  	this.selectedFields.forEach((x:FieldAttributes) => {
  		this.entityGroupList.forEach((y:any) => {
  			y.tables.forEach((z:any) => {
  				// eslint-disable-next-line max-nested-callbacks
  				z.fields.forEach((a:any) => {
  					z.isSelected = false;
  					if(a.fieldId === x.fieldId){
  						x.tableName = z.tableName;
  					}
  				});
  			});
  		});
  	});
	}
	markUnmarkSelectedFields(fieldId:number, isMark:boolean){
		if(this.isExpanedeField){
			this.gridData.forEach((y:any) => {
				y.tables.forEach((z:any) => {
					// eslint-disable-next-line max-nested-callbacks
					z.fields.forEach((a:any) => {
						if(a.fieldId === fieldId){
							a.isSelected = isMark;
						}
					});
				});
			});
		}
		else{
			this.entityGroupList.forEach((y:any) => {
				y.tables.forEach((z:any) => {
					// eslint-disable-next-line max-nested-callbacks
					z.fields.forEach((a:any) => {
						if(a.fieldId === fieldId){
							a.isSelected = isMark;
						}
					});
				});
			});
		}

	}
	selectedFilters(event: any) {
		this.reportDataService.isGridChangedSubject.next(true);
  	this.filterData = event;
	}
	updateStatusPosition(event:any, dragStatus:any){
	}
	private bindGrid(gridData : any){
		this.gridData = gridData;
		this.cd.markForCheck();
	}

	onFilter(inputValue: string) {
		inputValue = inputValue.trim().toLowerCase();
		if (inputValue.trim().length <Number(magicNumber.three)) {
			this.bindGrid(this.entityGroupList);
			this.isExpanedeField= false;
			return;
		  }
		  const formattedata = JSON.parse(JSON.stringify(this.entityGroupList));
		formattedata.forEach((dataEntry: any) => {
			dataEntry.tables = dataEntry?.tables?.filter((row: any) => {
				if (row.tableName.toLowerCase().includes(inputValue)) {
					return row.fields;
				} else {
					const fields = row?.fields?.filter((element: any) => {
						return element.fieldName.toLowerCase().includes(inputValue);
					});
					row.fields = fields;
					if (row.fields.length) return row;
				}
			});
		});
		// formattedata[0].tables = data;
		this.isExpanedeField = true;
		this.bindGrid(formattedata);
		return;
	}
	convertIntoKendoFilter(data: any, field: number): boolean {
		const isExist = data.some((item: any) => {
			// Check for direct FieldId match
			if (item.FieldId == field) {
				return true;
			}
			// Check for nested Filters
			if (item.Filters && item.Filters?.length > Number(magicNumber.zero)) {
				return item.Filters.some((i: any) => {
					// Check for FieldId in nested items
					if (i.FieldId == field) {
						return true;
					}
					// Recursively check nested filters
					return i.Filters && i.Filters?.length > Number(magicNumber.zero)
						? this.convertIntoKendoFilter(i.Filters, field)
						: false;
				});
			}
			return false; // No match found
		});
		return isExist;
	}
	returnField(data:any, field:number){
		const exist = data.some((a:any) =>
			a.FieldId == field);
		return exist;
	}

	fieldExistInFilter(field:number){
		if(this.filterData?.length > Number(magicNumber.zero)){
			const data = this.filterData[magicNumber.zero],
				isFieldOnly = data.Filters.every((a: any) =>
					a.FieldId && a.Filters.length == magicNumber.zero);
			if (isFieldOnly) {
				return this.returnField(data.Filters, field);
			}
			else {
				return this.convertIntoKendoFilter(data.Filters, field);
			}
		}
		else{
			return false;
		}
	}

	removeSelectedFields(index: number) {
		if(this.fieldExistInFilter(this.selectedFields[index].fieldId)){
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please clear the filter before removing fields.');
		}
		else{
			this.markUnmarkSelectedFields(this.selectedFields[index].fieldId, false);
			this.selectedFields.splice(index, magicNumber.one);
			  this.selectedFields = [...this.selectedFields];
			  this.reportDataService.isGridChangedSubject.next(true);
			this.cd.markForCheck();
		}
  	}
	OnSearch(data: any) {
	}
	togglePasswordVisibility(dataItem: any) {
  	dataItem.showPassword = !dataItem.showPassword;
	}

	onFilterChange(value: CompositeFilterDescriptor): void {
  	this.filterData = value;
	}
	onDragOverGrid(event: any){
		// console.log('top triggerd');
		event.preventDefault();
	}
	onDragEnter(event: any){
		event.preventDefault();
	}

	onDragStart(field:FieldAttributes, tableName:string){
  	field.tableName = tableName;
  	this.draggeddData = field;
		this.indexRow = magicNumber.minusOne;
	}
	ondragOver(event: Event, index:number) {
		event.preventDefault();
		if(index >= Number(magicNumber.zero)){
			this.selectedFields.map((x:FieldAttributes) => {
				x.highlight = false;
			});
			this.selectedFields[index].highlight = true;
		}
	}
	onDropspan(event:any){
	}
	onDragEndFields(){
		this.selectedFields.map((x:FieldAttributes) => {
			x.highlight = false;
		});
	}
	ondropRow(event: any, currentIndex: number) {
		this.selectedFields.map((x:FieldAttributes) => {
			x.highlight = false;
		});
		if(this.indexRow > magicNumber.minusOne){
			const dragStatus = document.getElementById('drag-status');
			if (dragStatus) {
				dragStatus.style.display = 'none';
			}
			const previousData = this.selectedFields[this.indexRow],
				currentData = this.selectedFields[currentIndex];
			this.selectedFields.splice(this.indexRow, magicNumber.one);
			this.selectedFields.splice(currentIndex, magicNumber.zero, previousData);
			const newCurrentIndex = this.selectedFields.indexOf(currentData);
			this.selectedFields.splice(newCurrentIndex, magicNumber.one);
			this.selectedFields.splice(currentIndex + magicNumber.one, magicNumber.zero, currentData);
			this.indexRow = magicNumber.minusOne;
		}
	}
	ondropGridEmpty(){
		if(this.selectedFields.length == Number(magicNumber.zero)){
			this.selectedFields.push(this.draggeddData);
			this.markUnmarkSelectedFields(this.draggeddData.fieldId, true);
			this.selectedFields = [...this.selectedFields];
		}
	}
	onnddrop(event:any, rowIndex:number){
		// if (event.currentTarget.id === 'drop_Target') {
		this.reportDataService.isGridChangedSubject.next(true);
		const index = this.selectedFields.findIndex((x: FieldAttributes) =>
			x.fieldId === this.draggeddData.fieldId);
		this.selectedFields.map((x:FieldAttributes) => {
			x.highlight = false;
		});
		if (index === Number(magicNumber.minusOne) && this.indexRow == magicNumber.minusOne) {
			this.draggeddData.selectedSorts = null;
			if(this.draggeddData.fieldType == 'Double' || this.draggeddData.fieldType == 'Int'){
				this.draggeddData.selectedfieldAggregate = 'Count';
			}
			else{
				this.draggeddData.selectedfieldAggregate = 'Group';
			}
			this.selectedFields.splice(rowIndex+magicNumber.one, magicNumber.zero, this.draggeddData);
			this.selectedFields = [...this.selectedFields];
			const fields = this.selectedFields;
			this.selectedFields = [...fields];
			this.markUnmarkSelectedFields(this.draggeddData.fieldId, true);
		}
		// }
	}
	// eslint-disable-next-line max-lines-per-function
	setBuildData() {
		if (this.selectedFields.length > Number(magicNumber.zero) && !this.isInvalidFilterValue) {
			const reportData = JSON.parse(window.sessionStorage.getItem('reportData') ?? '{}');
			if (reportData && this.reportDetails.Id == Number(magicNumber.one)) {
				this.reportDetails.BaseEntityUkey = reportData.BaseEntityUkey;
			}
			// eslint-disable-next-line max-len
			this.reportDetails.Json = this.reportDataService.preparePayLoad(this.selectedFields, this.filterData, this.reportDetails.Json, this.activeItem);
			this.reportDetails.Json.SelectedFields = this.selectedFields;
			this.reportDetails.UserId = this.entityGroupList[magicNumber.zero]?.entity?.UserNo;
			this.reportDetails.ApplicableActions = reportData.ApplicableActions;
			this.reportDetails.IsEditMode = this.isEditMode;
			if(this.reportDetails.IsCopyOfPredefined || this.reportDetails.CopyMode){
				this.reportDetails.UKey = '';
			}
			window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
			if (this.isCustomReport) {
				this.reportDataService.setStepperData.next({ currentStep: magicNumber.two });
				if(this.reportDetails.UKey != '' && !this.reportDetails.CopyMode && !this.reportDetails.IsCopyOfPredefined){
					this.route.navigate([`${ReportNavigationPaths.addEdit.customReport.formatAndSave}/${this.reportDetails.UKey}`]);
				}
				else{
					this.route.navigate([ReportNavigationPaths.addEdit.customReport.formatAndSave]);
				}

			}
			else {
				this.reportDataService.setStepperData.next({ currentStep: magicNumber.three });
				this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.formatAndSave]);
			}

		}
		else if (this.isInvalidFilterValue) {
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}

		else {
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select fields for report.');
		}
	}
	onChangeAggregationOption(event: any, index: number) {
		this.reportDataService.isGridChangedSubject.next(true);
  	this.selectedFields[index].selectedfieldAggregate = event;
	}
	onChangeSortingOption(event: any, index: number){
		this.reportDataService.isGridChangedSubject.next(true);
		this.selectedFields[index].selectedSorts = event;
	}

	toggleActive(item: string): void {
		if (item === 'list' && this.activeItem !== 'list' && this.activeItem !== '') {
			this.dialogService.resetDialogButton();
			this.dialogService.showConfirmation('VisualizationChangeConfirmation', PopupDialogButtons.YesAndNo);
			this.dialogService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((data: DialogButton) => {
					if (data.value == Number(magicNumber.twentyFive)) {
						this.reportDetails.Json.ReportType = 'list';
						this.activeItem = item;
						this.reportDetails.OutputTypeId = OutputType.List;
					}
					else if (data.value == Number(magicNumber.twentySix)) {
						this.reportDetails.Json.ReportType = 'summary';
						this.activeItem = 'summary';
						this.isDisabled = true;
						this.reportDetails.OutputTypeId = OutputType.Summary;
					}
				});
		} else {
			this.reportDetails.Json.ReportType = item;
			this.reportDetails.OutputTypeId = OutputType.Summary;
			this.bindDefaultAggregationOption();
			if (this.isActive(item)) {
				this.activeItem = '';
			} else {
				this.activeItem = item;
			}
		}

	}
	bindDefaultAggregationOption(){
		this.selectedFields.map((field:FieldAttributes) => {
			if(field.fieldType == 'Double' || field.fieldType == 'Int'){
				field.selectedfieldAggregate = 'Count';
			}
			else{
				field.selectedfieldAggregate = 'Group';
			}
		});
	}
	onDragStartGridRow(event: any, data: number) {
  	this.indexRow = data;
  	this.showCustomTextDrag(event);
	}
	onDragRow(event: any) {
  	this.showCustomTextDrag(event);
	}
	showCustomTextDrag(event: any) {
  	const dragStatus = document.getElementById('drag-status');
  	const grid = document.getElementById('drop_TargetRow');
  	const position = grid?.getBoundingClientRect();
  	if (dragStatus) {
  		dragStatus.style.display = 'block';
  		dragStatus.style.left = '0px';
  		if(position && event.pageY > position?.top){
  			dragStatus.style.top = `${event.pageY - 220}px`;
  		}
  	}
	}
	onDragEnd(){
		this.selectedFields.map((x:FieldAttributes) => {
			x.highlight = false;
		});
  	const dragStatus = document.getElementById('drag-status');
  	if (dragStatus) {
  		dragStatus.style.display = 'none';
  	}
	}
	isActive(item: string): boolean {
  	return this.activeItem === item;
	}
	back(){
		this.reportDataService.isGridChanged.pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			this.navigationService.backToBaseDataEntity({isCustomReport: this.isCustomReport, isGridChanged: res,
						  isEditMode: this.isEditMode,
						   isCopyOfPredefined: this.reportDetails.IsCopyOfPredefined, isCopyMode: this.reportDetails.CopyMode});
				  });
	}
	cancel(){
		this.route.navigate([ReportNavigationPaths.list]);
	}
	ngOnDestroy(): void {
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	this.dialogService.resetDialogButton();
  	this.toasterServc.resetToaster();
		this.reportDataService.isStepperClicked.next(null);
	}

}

