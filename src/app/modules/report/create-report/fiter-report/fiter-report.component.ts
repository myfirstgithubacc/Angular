/* eslint-disable max-lines-per-function */
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FilterExpression } from '@progress/kendo-angular-filter';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FieldAttributes } from '@xrm-core/models/report/report-payload';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { filter, forkJoin } from 'rxjs';
import { ReportDataService } from 'src/app/services/report/report.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { formatDate } from '@progress/kendo-intl';
import { dropdownEditor } from '@xrm-core/models/report/report-details';

@Component({
	selector: 'app-fiter-report',
	templateUrl: './fiter-report.component.html',
	styleUrls: ['./fiter-report.component.scss']
})


export class FiterReportComponent implements OnInit, OnChanges, AfterViewChecked{
	@ViewChild("template", { static: true })
	public template: TemplateRef<any>;
	@Input() public fieldList: FieldAttributes[] = [];
	filters: FilterExpression[] = [
		{
			field: "",
			title: "",
			editor: "string",
			operators: ["neq", "eq", "contains"]
		}
	];
    @Input() reportId:number = 0;
	@Input() value: any = [];
	selectedFilterList:any = {
		logic: "and",
		filters: []
	};
  @Output() selectedFilters: EventEmitter<any> = new EventEmitter<string>();
  @Output() applyButton: EventEmitter<any> = new EventEmitter<false>();
  @Output() isInvalidFilter: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  filterData:any = [];
  dropdownData: dropdownEditor[] = [];
  dateFormat:string;
  placeholderFormat:any;

  constructor(
	private cdr:ChangeDetectorRef,
	private localizationSrv: LocalizationService,
	private reportService:ReportDataService
  ) {
  };

  ngAfterViewChecked(): void {
  	const isForceFilter = this.dropdownData.findIndex((data:dropdownEditor) =>
  		data.isForceFilter),
	  filterElement = document.querySelector('.filter_block');
  	  if (filterElement) {
  		const buttons = filterElement.querySelectorAll('.custom-filter-report .k-icon-button.k-button-flat-base');
  			  buttons.forEach((x: any, y: number) => {
  				  if (y == Number(magicNumber.zero)) {
  					  x.style.display = 'none';
  				  }
  			  });
  		  if (isForceFilter > Number(magicNumber.zero)) {
  			  // eslint-disable-next-line one-var
  			  const dropdown = filterElement.querySelectorAll('kendo-dropdownlist');
  			  if (dropdown.length > 0) {
  				  dropdown.forEach((x: any, y: number) => {
  					  if (y == 0) {
  						  x.style.opacity = 0.6;
  						  x.style.pointerEvents = 'none';
  					  }
  				  });
  			  }
  			buttons.forEach((x: any, y: number) => {
  				  if (y < Number(magicNumber.two)) {
  					  x.style.display = 'none';
  				  }
  			  });
  		  }
  	  }
  }

  // eslint-disable-next-line max-lines-per-function
  ngOnChanges(Changes: SimpleChanges): void {
	  if (Changes['fieldList']?.currentValue.length > Number(magicNumber.zero)) {
  		const fieldList = Changes['fieldList'].currentValue;
  		this.filters = [];
  		if(fieldList.length > magicNumber.zero){
  			fieldList.forEach((field:FieldAttributes) => {
  				this.prepareFilterFields(field);
  			});
  		}
  	}
	  if (Changes['value']?.currentValue?.length > Number(magicNumber.zero)) {
  		 // eslint-disable-next-line @typescript-eslint/no-explicit-any, one-var
		  const lookupNeedCallList = this.dropdownData.filter((a:dropdownEditor) =>
  			!a.isLookupLoaded && a.hasForeignKey);
  		if(lookupNeedCallList.length > Number(magicNumber.zero)){
  		  const requests = lookupNeedCallList.map((field:dropdownEditor) => {
  			return	this.reportService.getLookupList({
  					fieldId: field.field,
  					dataFilters: {}
  				});
  			});
  			forkJoin(requests).subscribe((response:any) => {
  				if(response.length > magicNumber.zero){
  					lookupNeedCallList.forEach((field:dropdownEditor, ind:number) => {
  						const index = this.dropdownData.findIndex((a:dropdownEditor) =>
  							a.field == field.field);
  						if(index > Number(magicNumber.minusOne)){
  							this.dropdownData[index].isLookupLoaded = true;
  							this.dropdownData[index].list = response[ind].Data;
  						}
  					});
  					this.patchValueInForm(Changes['value']?.currentValue);
  				}
  			});
  		}
  		else{
  			this.patchValueInForm(Changes['value']?.currentValue);
  		}
		  this.cdr.markForCheck();
	  }
	  else if(Changes['value']?.currentValue?.length == 0){
  		this.selectedFilterList = {
  			logic: "and",
  			filters: []
  		};
	  }
  }
  patchValueInForm(choosenFilter:any){
  	this.value = [];
		  const data = choosenFilter[0],
			  isFieldOnly = data.Filters.every((a: any) =>
				  a.FieldId && a.Value1 && a.Filters.length == 0),
			  filtersTemp = {
				  logic: '',
				  filters: []
			  };
		  if (isFieldOnly) {
			  filtersTemp.filters = this.returnField(data.Filters);
		  }
		  else {
			  let arr: any = [],
				  fi = data.Filters,
				  grp = data.Filters[0].Filters;
				  fi[0].Filters = [];
			  fi.forEach((x: any) =>
  			arr.push(x));
			  grp.forEach((x: any) =>
				  arr.push(x));
			  // eslint-disable-next-line one-var
			  const allFilters = this.convertIntoKendoFilter(arr);
			  filtersTemp.filters = allFilters;
		  }

		  filtersTemp.logic = data.AndOr.trim() == "AND"
			  ? "and"
			  : "or";
		  this.selectedFilterList = filtersTemp;
  }
  ngOnInit(): void {
  	this.dateFormat = this.localizationSrv.GetCulture(CultureFormat.DateFormat);
	  this.placeholderFormat = this.localizationSrv.GetCulture(CultureFormat.DatePlaceholder);
  }
  prepareFilterFields(field:FieldAttributes){
  	let fieldFilter:any = [];
  	const index = this.filters.findIndex((a:any) =>
	   a.title === "");
  	if(index !== Number(magicNumber.minusOne)){
	   this.filters.splice(index, magicNumber.one);
  	}
  	if(field.hasForeignKey){
  		fieldFilter = ["contains", "doesnotcontain", "eq"];
  		this.filters.push({
  				field: field.fieldId.toString(),
  				title: field.fieldName,
  				editorTemplate: this.template,
  				editor: "string",
  				operators: fieldFilter
  			});
  		const indexNum = this.dropdownData.findIndex((x:dropdownEditor) =>
  			x.field?.toString() == field.fieldId.toString());
  		if(indexNum < Number(magicNumber.zero)){
  			// eslint-disable-next-line max-len
  			this.dropdownData.push({field: field.fieldId, fieldType: field.fieldType, hasForeignKey: true, list: [], isForceFilter: field.forceFilter, isLookupLoaded: false});
  		}
  	}
  	else if(field.fieldType == 'DateTime'){
  		fieldFilter = ["eq", "neq", "gt", "gte", "lt", "lte"];
  		this.filters.push({
  			field: field.fieldId.toString(),
  			title: field.fieldName,
  			editor: "date",
  			editorTemplate: this.template,
  			operators: fieldFilter
	 });
	 const indexNum = this.dropdownData.findIndex((x:dropdownEditor) =>
  			x.field?.toString() == field.fieldId.toString());
  		if(indexNum < Number(magicNumber.zero)){
  			this.dropdownData.push({field: field.fieldId, hasForeignKey: false, isForceFilter: field.forceFilter, fieldType: "DateTime", list: [], isLookupLoaded: true});
  		}
  	}
  	else if(field.fieldType == 'Double' || field.fieldType == 'Int'){
  		fieldFilter = ["eq", "neq", "gt", "gte", "lt", "lte", "isnotnull", "isnull"];
  		this.filters.push({
  			field: field.fieldId.toString(),
  			title: field.fieldName,
  			editor: "number",
  			editorTemplate: this.template,
  			operators: fieldFilter
  		});
  		const indexNum = this.dropdownData.findIndex((x:dropdownEditor) =>
  			x.field?.toString() == field.fieldId.toString());
  		if(indexNum < Number(magicNumber.zero)){
  			this.dropdownData.push({field: field.fieldId, hasForeignKey: false, isForceFilter: field.forceFilter, fieldType: "Double", list: [], isLookupLoaded: true});
  		}
  	}
  	else{
  		fieldFilter = ["eq", "neq", "isnull", "isnotnull"];
  		this.filters.push({
  			field: field.fieldId.toString(),
  			title: field.fieldName,
  			editor: "string",
  			operators: fieldFilter,
			  editorTemplate: this.template
  		});
		  const indexNum = this.dropdownData.findIndex((x:dropdownEditor) =>
  			x.field?.toString() == field.fieldId.toString());
  		if(indexNum < Number(magicNumber.zero)){
  			this.dropdownData.push({field: field.fieldId, hasForeignKey: false, isForceFilter: field.forceFilter, fieldType: "VarChar", list: [], isLookupLoaded: true});
  		}
  	}
	  if (field.forceFilter) {
  		this.selectedFilterList = {
			  logic: "and", filters:
				  [{ field: field.fieldId.toString(), operator: "eq", value: "" }]
		  };
  		this.filterData = this.selectedFilterList;
  		this.selectedFilters.emit(this.prepareFilterPayload());
  	}
  	this.filters = [...this.filters];
  	this.cdr.markForCheck();
  }
  returnField(data:any){
  	return data.map((a:any) => {
  		return {
  			field: a.FieldId.toString(),
  			value: (a.Operator == 'in' || a.Operator == 'not in')
  				? this.returnObject(a.Value1, a.FieldId)
  				: a.Value1,
  			operator: this.convertDotnetOperatortoKendo(a.Operator)
  		};
  	});
  }
  returnDate(data: any) {
  	if(data){
  		// const dateString = data,
  		// parts = dateString.split("/"),
  		// day = parseInt(parts[1]),
  		// month = parseInt(parts[0]) - 1,
  		// year = parseInt(parts[2]),
  		// date = new Date(year, month, day);
  		return new Date(data);
  	}
  	else{
  		return null;
  	}
  }
  returnObject(value:string, fieldId:number){
  	return	value.split(',').map((a:any) => {
  		const index = this.dropdownData.findIndex((data:dropdownEditor) =>
  			data.field == fieldId),
  			index2 = this.dropdownData[index].list.findIndex((x:any) =>
  				x.Id == a);
  		return {Text: this.dropdownData[index]?.list[index2]?.Text, Id: a};
  	});
  }
  convertIntoKendoFilter(data: any){
	  return data.map((filter: any) => {
		  if (filter.FieldId && filter.Operator) {
			 return {
				  field: filter.FieldId.toString(),
				  value: (filter.Operator == 'in' || filter.Operator == 'not in')
					  ? this.returnObject(filter.Value1, filter.FieldId)
					  : filter.Value1,
				  operator: this.convertDotnetOperatortoKendo(filter.Operator)
			  };
		  }
		  else {
			  return {
				  filters: this.convertIntoKendoFilter(filter.Filters),
				  logic: filter.Filters[0]?.AndOr?.trim() == "OR"
					  ? "or"
					  : "and"
			  };
		  }
	  });
  }
  getDropdownData(fieldid: number) {
  	this.reportService.getLookupList({
  		fieldId: fieldid,
  		dataFilters: {}
  	}).subscribe((res: any) => {
  		if (res) {
  			const index = this.dropdownData.findIndex((a: dropdownEditor) =>
  				a.field == fieldid);
  			if (index > Number(magicNumber.minusOne)) {
  				this.dropdownData[index].list = res.Data;
  				this.dropdownData[index].isLookupLoaded = true;
  			}
  		}
  	});
  }
  onFilterChange(event: any) {
  	this.filterData = event;
  	if(this.filterData.filters?.length == magicNumber.zero){
  		this.isInvalidFilter.emit(false);
  	}
  	this.selectedFilters.emit(this.prepareFilterPayload());
	  const lookupNeedCallList = this.dropdownData.filter((a:dropdownEditor) =>
  		!a.isLookupLoaded && a.hasForeignKey);
  	if(lookupNeedCallList.length > Number(magicNumber.zero)){
	  const requests = lookupNeedCallList.map((field:dropdownEditor) => {
  			return	this.reportService.getLookupList({
  				fieldId: field.field,
  				dataFilters: {}
  			});
  		});
  		forkJoin(requests).subscribe((response:any) => {
  			if(response.length > magicNumber.zero){
  				lookupNeedCallList.forEach((field:dropdownEditor, ind:number) => {
  					const index = this.dropdownData.findIndex((a:dropdownEditor) =>
  						a.field == field.field);
  					if(index > Number(magicNumber.minusOne)){
  						this.dropdownData[index].isLookupLoaded = true;
  						this.dropdownData[index].list = response[ind].Data;
  					}
  				});
  			}
  		});
  	}
  }
  editorValueChange(event:any, current:any, filter:any){
  	current.value = event?.Id;
	  this.filterData = filter;
	  this.selectedFilters.emit(this.prepareFilterPayload());
  }
  editorMultiSelectValueChange(event:any, current:any, filter:any){
  	current.value = event.filter((obj:any) =>
  		obj.hasOwnProperty("Id"));
  	this.filterData = filter;
  	this.selectedFilters.emit(this.prepareFilterPayload());
  }
  editorTextBoxValueChange(event:any, current:any, filter:any){
  	current.value = event;
  	this.filterData = filter;
  	this.selectedFilters.emit(this.prepareFilterPayload());
  }
  editorValueChangeDatePicker(event:any, current:any, filter:any){
  	current.value = this.localizationSrv.TransformDate(event, 'MM/dd/YYYY');
	  this.filterData = filter;
  	this.selectedFilters.emit(this.prepareFilterPayload());
  }
  editorValueChangeNumericBox(event:any, current:any, filter:any){
  	current.value = event;
  	this.filterData = filter;
  	this.selectedFilters.emit(this.prepareFilterPayload());
  }
  prepareFilterPayload(){
  	const input = this.filterData;
  	input.filters.sort(this.customSort);
  	// eslint-disable-next-line one-var
  	const payload:any = this.transformFilters(input);
  	payload.SavedReportId = this.reportId;
  	payload.isRoot = true;
  	payload.AndOr = this.filterData.logic == 'and'
	  ? ' AND '
	  : 'OR';
  	return [payload];
  }
  // eslint-disable-next-line max-params
  processFilters(filters:any, logic:string) {
  	return filters.map((filter:any) => {
  		if (filter.filters && filter.logic) {
  			const sequence:any = [],
  			filtersOnly = filter.filters.filter((a:any) =>
  			a.operator && a.field),
			  filtersGroup = filter.filters.filter((a:any) =>
  					a.logic);
  			if(filtersOnly.length > magicNumber.zero){
  				filtersOnly.forEach((z:any) => {
  					sequence.push(z);
  				});
  			}
  			 if(filtersGroup.length > magicNumber.zero){
  				filtersGroup.forEach((z:any) => {
  					sequence.push(z);
  				});
  			}
  			filter.filters = sequence;
  			return {
  				Filters: this.processFilters(filter.filters, filter.logic),
  				AndOr: logic == 'and'
  					? 'AND'
  					: 'OR',
  				SavedReportId: this.reportId,
  				IsRoot: false
  			};
  		} else {
  				 return {
  				AndOr: logic == 'and'
  					? 'AND'
  					: 'OR',
  				FieldId: filter.field,
  				Operator: this.returnOperators(filter.operator),
  				SavedReportId: this.reportId,
  				Value1: this.transformValue(filter),
  				Value2: '',
  				Filters: []
  			};
  		}
  	});
  }
  // eslint-disable-next-line max-lines-per-function
  transformFilters(input:any){
  	let processedFilters = [];
  	const isfieldGroup = input.filters.some((a:any) =>
  			a.logic),
		 isFieldOnly = input.filters.every((a:any) =>
  			a.operator && a.field);
  	if(isfieldGroup){
  		let filtersOnly = input.filters.filter((a:any) =>
  			a.operator && a.field);
  		const isEmpty = filtersOnly.some((x:any) => (x.value == null || x.value == '') && x.operator != 'isnull' && x.operator != 'isnotnull');
  		if(isEmpty){
  			this.isInvalidFilter.emit(true);
  		}
  		else{
  			this.isInvalidFilter.emit(false);
  		}
  		filtersOnly = filtersOnly.map((filter:any, index:any) => {
  			return {
					 // eslint-disable-next-line no-nested-ternary
					 AndOr: input.logic == 'and'
  						? 'AND'
  						: 'OR',
					 FieldId: filter.field,
					 Operator: this.returnOperators(filter.operator),
					 SavedReportId: this.reportId,
					 Value1: this.transformValue(filter),
					 Value2: '',
					 Filters: []
				 };
			 });

		   // eslint-disable-next-line one-var
		   const filtersGroup = input.filters.filter((a:any) =>
  		a.logic);
		   processedFilters = this.processFilters(filtersGroup, input.logic);
		   filtersOnly[0].Filters = processedFilters;
		   processedFilters = filtersOnly;
		   if(this.checkEmptyNullGroup(filtersGroup) || isEmpty){
  			this.isInvalidFilter.emit(true);
		   }
		   else{
  			this.isInvalidFilter.emit(false);
		   }
  	}
  	else if(isFieldOnly){
  		const check = input.filters.some((x:any) => (x.value == null || x.value == '') && x.operator != 'isnull' && x.operator != 'isnotnull');
  		if(check){
  			this.isInvalidFilter.emit(true);
  		}
  		else{
  			this.isInvalidFilter.emit(false);
  		}
  		processedFilters = input.filters.map((filter:any, index:any) => {
  			return {
  				// eslint-disable-next-line no-nested-ternary
  				AndOr: index == magicNumber.zero
  					? " AND "
  					: input.logic == 'and'
  						? ' AND '
  						: 'OR',
  				FieldId: filter.field,
  				Operator: this.returnOperators(filter.operator),
  				SavedReportId: this.reportId,
  				Value1: this.transformValue(filter),
  				Value2: '',
  				Filters: []
  			};
  		});


  	}
  	// Assuming the first filter in input.filters array should have nested Filters
  	if (isfieldGroup && input.filters.length > 1) {
  		if(processedFilters.length > 0){
  			return {
  				AndOr: input.logic == 'and'
  				? ' AND '
  				: 'OR',
  				Filters: processedFilters
  			};
  		}
  		else{
  			return {
  				logic: input.logic == 'and'
  				? ' AND '
  				: 'OR',
  				AndOr: 'AND',
  				Filters: []
  			};
  		}
  	}
  	else if(isFieldOnly){
  		return {
  			AndOr: input.logic == 'and'
  				? ' AND '
  				: 'OR',
  			Filters: processedFilters
  		};
  	}
  	else {
  		return {
  			AndOr: input.logic == 'and'
  				? 'AND'
  				: 'OR',
  			logic: input.logic,
  			Filters: []
  		};
  	}
  }
  transformValue(filter:any){
  	const index = this.dropdownData.findIndex((x:dropdownEditor) =>
  			x.field == filter.field);
  	if(filter.operator == 'contains' || filter.operator == 'doesnotcontain'){
  		if(Array.isArray(filter.value) && filter.value.length > Number(magicNumber.zero)){
  			const a = filter.value.map((item:any) =>
  				item.Id).join(',');
  			return a;
  		}
  		return filter.value;
  	}
  	else if(filter.value && this.dropdownData[index].fieldType == 'DateTime'){
  	  return this.localizationSrv.TransformDate(filter.value, 'MM/dd/YYYY');
  	}
  	else{
  		return filter.value;
  	}
  }
  checkEmptyNullGroup(data: any) {
  	const isExist = data.some((item: any) => {
  		if (item.logic && item.filters?.length == 0) {
  			return true;
  		}
  		else if(item.logic && item.filters?.length > 0){
  			return this.checkEmptyNullGroup(item.filters);
  		}
  		else if ((item.value == null || item.value == '') && item.operator != 'isnull' && item.operator != 'isnotnull') {
  			return true;
  		}
  	});
  	return isExist;
  }
  returnStringList(array:any[]){

  	if(Array.isArray(array) && array.length > Number(magicNumber.zero)){
  		const a = array.map((item:any) =>
  			item.Id).join(',');
  		return a;
  	}
  	return array;
  }
  convertDotnetOperatortoKendo(op:string){
  	if(op == 'in'){
  		return 'contains';
  	}
  	else if(op == 'not in'){
  		return 'doesnotcontain';
  	}
	  else if (op == '=') {
  		return 'eq';
  	}
  	else if (op == 'not equal') {
  		return 'neq';
  	}
  	else if (op == '>') {
  		return 'gt';
  	}
  	else if (op == '>=') {
  		return 'gte';
  	}
  	else if (op == '<') {
  		return 'lt';
  	}
  	else if (op == '<=') {
  		return 'lte';
  	}
	  else if (op == 'is blank') {
  		return 'isnull';
  	}
  	else if (op == 'is not blank') {
  		return 'isnotnull';
  	}
  	else{
  		return 'eq';
  	}
  }
  returnOperators(op: string) {
  	if (op == 'contains') {
  		return 'in';
  	}
  	else if (op == 'doesnotcontain') {
  		return 'not in';
  	}
  	else if (op == 'eq') {
  		return '=';
  	}
  	else if (op == 'neq') {
  		return 'not equal';
  	}
  	else if (op == 'gt') {
  		return '>';
  	}
  	else if (op == 'gte') {
  		return '>=';
  	}
  	else if (op == 'lt') {
  		return '<';
  	}
  	else if (op == 'lte') {
  		return '<=';
  	}
	  else if (op == 'isnull') {
  		return 'is blank';
  	}
  	else if (op == 'isnotnull') {
  		return 'is not blank';
  	}
  	else {
  		return '=';
  	}

  }
  customSort(a:any, b:any) {
  	// Check if 'value' property exists in both objects
  	const aValueExists = 'value' in a,
  	 bValueExists = 'value' in b;

  	// If both have 'value' property or none of them do, maintain their relative order
  	if (aValueExists && bValueExists || !aValueExists && !bValueExists) {
  		return magicNumber.zero;
  	} else if (aValueExists) {
  		// 'a' has 'value' property, move it before 'b'
  		return magicNumber.minusOne;
  	} else {
  		// 'b' has 'value' property, move it before 'a'
  		return magicNumber.one;
  	}
  }
}
