/* eslint-disable one-var */
/* eslint-disable max-lines-per-function */
/* eslint-disable indent */
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SelectEvent } from "@progress/kendo-angular-layout";
import { ActivatedRoute, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ReportDataService } from 'src/app/services/report/report.service';
import { HttpResponse } from '@angular/common/http';
import { ReportNavigationPaths } from '../../constants/route-path';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DetailExpandEvent, PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { CategoriesService } from "./paging.service";
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { State } from '@progress/kendo-data-query';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ReportDetails, PaginationDto } from '@xrm-core/models/report/report-payload';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ReportStatusComponentService } from 'src/app/services/report/report-status-component-service';
import { OutputType } from '../../constants/enum-constants';
import { StatusData } from '@xrm-shared/models/common-header.model';
import { FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';


@Component({
	selector: 'app-report-list-view',
	templateUrl: './list-view.component.html',
	styleUrls: ['./list-view.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class ListViewComponent implements OnInit, OnDestroy {
	@ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
	private listViewData: any;
	public recentRunViewData: any[];
	public columnCaption: any = [];
	public columnCaptionDrill: any = [];
	public currentStep = magicNumber.three;
	private filterdata: any = [];
	private isCustomReport: boolean = false;
	private isExecuteMode: boolean = false;
	private drillDownRow: any = [];
	private drillIndex: number = magicNumber.zero;
	private drillIndexOuterGroup: number = magicNumber.zero;
	private isDrillMode: boolean = false;
	public pageSize: number = magicNumber.ten;
	public value: any;
	public fieldList: any = [];
	public OutputTypeId: number = OutputType.List;
	private PaginationDto: PaginationDto;
	public ismanagegroupetoggleVisible: boolean = false;
	public show: boolean = false;
	public animation: any = {
		type: 'slide',
		direction: 'left',
		duration: 0
	};
	public margin = { horizontal: 400, vertical: -190 };
	public outerGroupgrid: any = [];
	public splitButtonItems = [
		{
			text: "Export To Excel",
			icon: "excel"
		}
	];
	public view: Observable<any[]>;
	public state: any = { skip: 0, take: 100 };
	public pager: any;
	public columnOptions: { fieldName: string, columnHeader: string, visibleByDefault: boolean, ValueType?: string, DecimalPlaces?: number }[];
	public tabOptions = {
		bindingField: 'Status',
		tabList: [
			{
				tabName: 'Recent Runs',
				favourableValue: 'All',
				selected: true
			}
		]
	};
	public actionSet: IActionSetModel[];
	private destroyAllSubscribtion$ = new Subject<void>();
	public reportDetails: ReportDetails;
	private isInvalidFilterValue: boolean = false;
	public hasEditPermission: boolean = false;
	private savedFilterList: any[] = [];
	public isOuterGroupMode: boolean = false;
	public columnCaptionOuterGroup: any;
	public commonHeader: FormGroup;
	public entityId = XrmEntities.Report;
	private isPrintStarted: boolean = false;
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
	// eslint-disable-next-line max-params
	constructor(
		private route: Router,
		public sector: SectorService,
		private reportDataService: ReportDataService,
		private activatedRoute: ActivatedRoute,
		public service: CategoriesService,
		private gridConfiguration: GridConfiguration,
		private toasterServc: ToasterService,
		private renderer: Renderer2,
		private cdrf: ChangeDetectorRef,
		private localizationSrv: LocalizationService,
		private reportStatusComponentService: ReportStatusComponentService
	) {
		this.PaginationDto = new PaginationDto();
		this.reportDetails = JSON.parse(window.sessionStorage.getItem('reportData') ?? '{}');
		this.getColumnOption();
		this.getActionSet();
	}
	openFilterPopup() {
		this.show = !this.show;
		if (this.show) {
			this.value = [...this.filterdata];
		}
		this.renderer.addClass(document.body, 'scrolling__hidden');
	}
	closePopup() {
		this.show = false;
		this.renderer.removeClass(document.body, 'scrolling__hidden');
	}
	public isDetailExpanded({ dataItem }: RowArgs): boolean {
		return dataItem?.drillMode;
	}

	rowDetailCollapse(event: any) {
		event.dataItem.drillMode = false;
	}

	ngOnInit(): void {
		this.reportStatusComponentService.startConnection('2678561A-F85E-4DA5-A76D-CED27131D906', '2');
		const reportData = window.sessionStorage.getItem('reportData');
		this.OutputTypeId = this.reportDetails.OutputTypeId;
		this.activatedRoute.params.subscribe((param) => {
			if (param['id']) {
				this.reportDataService.getReportDetailsByUkey(param['id']).subscribe((data: any) => {
					if (data.Succeeded) {
						const reportDetails = this.reportDetails;
						this.reportDetails = data.Data;
						this.reportDetails.ApplicableActions = reportDetails.ApplicableActions;
						this.reportDetails.RunReportCallNeeded = reportDetails.RunReportCallNeeded;
						this.reportDetails.Json.ReportName = data.Data.ReportName;
						this.statusData.items[0].item = this.reportDetails.ReportName;
						this.fieldList = [...this.reportDetails.Json.SelectedFields];
						this.reportDataService.getExeHistoryByUkey(param['id']).subscribe((res: GenericResponseBase<any>) => {
							if (isSuccessfulResponse(res))
								this.recentRunViewData = res.Data;
						});
					}
				});
			}
		});
		this.activatedRoute.data.subscribe((data: any) => {
			this.isCustomReport = data.isCustomReport;
			if (this.isCustomReport) {
				this.reportDataService.setStepperData.next({ currentStep: 3 });
			}
			else {
				this.reportDataService.setStepperData.next({ currentStep: 4 });
			}
		});
		this.reportDataService.IsExecuteReport.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((isExecuteMode) => {
			this.isExecuteMode = isExecuteMode.execute;
		});
		this.reportDataService.isStepperClickedObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
			if (!data || this.isExecuteMode) return;
			const targetStep = this.isCustomReport
				? magicNumber.one
				: magicNumber.two,
				clickStep = this.isCustomReport
					? magicNumber.two
					: magicNumber.three;
			switch (data.index) {
				case targetStep:
					this.handleStep();
					break;
				case magicNumber.one:
					if (!this.isCustomReport) {
						this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.parameterSelection]);
					}
					break;
				case clickStep:
					this.handleSteps();
					break;
				default:
					break;
			}
		});
		if (reportData) {
			const data = JSON.parse(reportData);
			this.reportDetails = data;
			this.statusData.items[0].item = this.reportDetails.ReportName;
			if (this.reportDetails.ApplicableActions?.includes('P') || this.reportDetails.ApplicableActions?.includes('E')) {
				this.hasEditPermission = true;
			}
			this.fieldList = this.reportDetails.Json.SelectedFields;
			this.value = [...this.reportDetails.Json.Filters];
			this.savedFilterList = [...this.reportDetails.Json.Filters];
			this.OutputTypeId = this.reportDetails.OutputTypeId;
			this.filterdata = this.reportDetails.Json.Filters;
			if (this.OutputTypeId != Number(OutputType.List) && this.OutputTypeId != Number(OutputType.Summary)) {
				this.PaginationDto.startIndex = 1;
				this.PaginationDto.pageSize = 100;
				// eslint-disable-next-line max-len
				const payload = { Ukey: this.reportDetails.UKey, OutPutTypeId: this.reportDetails.OutputTypeId, SelectedFilters: this.reportDetails.Json.Filters, PaginationDto: this.PaginationDto, Json: {} };
				if (this.reportDetails.RunReportCallNeeded) {
					this.reportDataService.runReport(payload).subscribe((response: any) => {
						if (response.Succeeded) {
							this.reportDetails.RunReportCallNeeded = false;
							window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
							this.reportDataService.getExeHistoryByUkey(this.reportDetails.UKey).subscribe((res: GenericResponseBase<any>) => {
								if (isSuccessfulResponse(res))
									this.recentRunViewData = res.Data;
							});
						}
					});
				}
				else {
					this.reportDataService.getExeHistoryByUkey(this.reportDetails.UKey).subscribe((res: GenericResponseBase<any>) => {
						if (isSuccessfulResponse(res))
							this.recentRunViewData = res.Data;
					});
				}
			}
			else {
				this.runReport(1, 100);
			}
		}
	}
	private handleStep(): void {
		const stepperData = {
			currentStep: this.isCustomReport
				? magicNumber.one
				: magicNumber.two
		},
			path = this.isCustomReport
				? ReportNavigationPaths.addEdit.customReport.build
				: ReportNavigationPaths.addEdit.predefinedReport.copyModify;
		this.reportDataService.setStepperData.next(stepperData);
		this.route.navigate([path]);
	}
	private handleSteps(): void {
		const stepperData = {
			currentStep: this.isCustomReport
				? magicNumber.two
				: magicNumber.three
		},
			path = this.isCustomReport
				? ReportNavigationPaths.addEdit.customReport.formatAndSave
				: ReportNavigationPaths.addEdit.predefinedReport.formatAndSave;
		this.reportDataService.setStepperData.next(stepperData);
		this.route.navigate([path]);
	}
	public getActionSet() {
		this.actionSet = [
			{
				Status: 'Completed',
				Items: this.gridConfiguration.showSuccessDownloadIcon(this.onButtonDownloadReport.bind(this), true)
			}
		];
	}
	resetFilter() {
		this.value = [...this.savedFilterList];
		this.filterdata = [...this.value];
	}

	public onButtonDownloadReport(Items: any): void {
		this.downloadReport(Items.DmsFieldRecord.DocumentAddDto);
	}

	public onLinkDownloadReport(Items: any): void {
		this.downloadReport(Items.DocumentAddDto);
	}

	private downloadReport(Items: any): void {
		this.reportDataService.downloadReport(Items.UKey)
			.subscribe((response: HttpResponse<Blob>) => {
				if (response.body) {
					const url = window.URL.createObjectURL(response.body),
						a = document.createElement('a');
					a.href = url;
					a.download = Items?.FileNameWithExtension;
					a.click();
					window.URL.revokeObjectURL(url);
				}
			});
	}

	private getColumnOption() {
		this.columnOptions = [
			{
				fieldName: 'RunReportId',
				columnHeader: 'RunReportId',
				visibleByDefault: true,
				ValueType: "Text"
			},
			/* {
					  fieldName: 'ReportName',
					  columnHeader: 'ReportName',
					  visibleByDefault: true,
					  ValueType: "Text"
			   }, */
			{
				fieldName: 'RequestedDate',
				columnHeader: 'Date',
				visibleByDefault: true,
				ValueType: "Date"
			},
			{
				fieldName: 'Status',
				columnHeader: 'Disabled',
				visibleByDefault: true,
				ValueType: "Text"
			},
			{
				fieldName: 'FileName',
				columnHeader: 'Document',
				visibleByDefault: true
			}
		];
	}

	returnDataOuterGroup(index: number) {
		const data = this.outerGroupgrid[index].data;
		return of({
			data: data.slice(this.outerGroupgrid[index].skip, this.outerGroupgrid[index].skip + this.outerGroupgrid[index].take),
			total: data.length
		});
	}

	returnDataOuterGroupInt(index: number, index2: number) {
		const data = this.outerGroupgrid[index].data[index2].array;
		return of({
			data: data.slice(this.outerGroupgrid[index].skip, this.outerGroupgrid[index].skip + this.outerGroupgrid[index].take),
			total: data.length
		});
	}

	returnData() {
		console.log(this.listViewData);
		console.log(this.pager.TotalRecords);
		return of({
			data: this.listViewData,
			total: this.pager.TotalRecords
		});
	}
	getReportData(data: any, totalItemCount: number) {
		this.view = this.service;
		this.service.query(this.state, data, totalItemCount);
	}
	public next(): void {
		this.currentStep += magicNumber.one;
	}
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === "TD" || element.className === "k-column-title") &&
			element.offsetWidth < element.scrollWidth
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}

	public onTabSelect(e: SelectEvent): void {

	}
	editReport() {
		if (this.isCustomReport) {
			this.reportDataService.setStepperData.next({ currentStep: 0 });
			this.route.navigate([ReportNavigationPaths.addEdit.customReport.build]);
		}
		else {
			this.reportDataService.setStepperData.next({ currentStep: 1 });
			this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.copyModify]);
		}
	}
	onSplitButtonItemClick(event: any): void {
		// eslint-disable-next-line max-len
		this.reportDataService.runReport({ Ukey: this.reportDetails.UKey, OutPutTypeId: 298, SelectedFilters: [], PaginationDto: this.PaginationDto, Json: {} }).
			subscribe((response: any) => {
				if (response.Succeeded) {
					this.downloadReport({ UKey: response.Data.Data.UKey, FileNameWithExtension: response.Data.Data.FileName });
					// this.reportDataService.getExeHistoryByUkey(this.reportDetails.UKey).subscribe((res: GenericResponseBase<any>) => {
					// 	if (isSuccessfulResponse(res)) {
					// 		this.recentRunViewData = res.Data;
					// 	}
					// });
				}
			});
	}
	returnGridRowsData(rows: any) {
		const list: any = [];
		rows.forEach((row: any, i: number) => {
			const resultObject: any = {},
				drillRow: any = [];

			row.Items.forEach((item: any, index: number) => {
				item.fieldId = this.reportDetails.Json.SelectedFieldIDs[index];
				if (this.isDate(item.Value)) {
					if (item.Column.ColumnName.includes('.')) {
						resultObject[item.Column.ColumnName.replace('.', '')] = this.localizationSrv.TransformDate(item.Value);
					}
					else {
						resultObject[item.Column.ColumnName] = this.localizationSrv.TransformDate(item.Value);
					}
				}
				else if (item.Column.ColumnName.includes('.')) {
					resultObject[item.Column.ColumnName.replace('.', '')] = item.Value;
				}
				else {
					if (item.Column.IsNumeric && item.Value !== '' && item.Column.DataType === "System.Decimal") {
						item.Value = parseFloat(item.Value).toFixed(magicNumber.two);
					} else if (item.Column.IsNumeric && item.Value === '') {
						item.Value = 0;
					}
					resultObject[item.Column.ColumnName] = item.Value;
				}
				drillRow.push(item);
			});
			resultObject.drillDownRow = drillRow;
			resultObject.skip = 0;
			resultObject.take = 100;
			list.push(resultObject);
		});
		return list;
	}
	// eslint-disable-next-line max-lines-per-function
	prepareReportDataGrid(rows: any, pager?: any) {
		let isNeedCall: boolean = true;
		if (!this.isDrillMode) {
			this.listViewData = [];
		}
		const list = this.returnGridRowsData(rows);
		if (this.isDrillMode) {
			const isGroupinDetail = this.reportDetails.Json.GroupFunctionList.some((x: any) =>
				x.GroupFunc == 'Group in Detail');
			if(isGroupinDetail){
				this.prepareGroupinDetailData(list, pager);
			}
			else{
				this.listViewData[this.drillIndex].array = of({
					data: [...list],
					total: pager.TotalRecords
				});
				this.listViewData[this.drillIndex].skip = pager.PageSize * (pager.CurrentPage - 1);
			}
			// this.listViewData[this.drillIndex].array = of({
			// 	data: [...list],
			// 	total: pager.TotalRecords
			// });
			// this.listViewData[this.drillIndex].skip = pager.PageSize * (pager.CurrentPage - 1);
			this.cdrf.markForCheck();
		}
		else if (this.isOuterGroupMode) {
			isNeedCall = false;
			this.outerGroupgrid[this.drillIndexOuterGroup].data[this.drillIndex].array = [...list];
			this.outerGroupgrid[this.drillIndexOuterGroup].skip = pager.PageSize * (pager.CurrentPage - 1);
		}
		else {
			list.forEach((data: any) => {
				data.drillMode = false;
			});
			this.listViewData = [...list];
			if (this.state.take) {
				this.state.skip = this.state.take * (pager.CurrentPage - 1);
			}
			this.cdrf.markForCheck();
		}
		if (isNeedCall) {
			this.outerGroupgrid = [];
			this.prepareOuterGroupData(this.listViewData);
		}
	}
	prepareGroupinDetailData(rows:any, pager:any){
		const outerGroupFields = this.reportDetails.Json.GroupFunctionList.filter((x: any) =>
			x.GroupFunc == 'Group in Detail');
		if (outerGroupFields.length > Number(magicNumber.zero)) {
			const rowsToRemove = new Set();
			rows.forEach((row: any, index: number) => {
				let filterData: any = [];
				if (index == 0) {
					filterData = rows.filter((a: any) =>
						outerGroupFields.every((field: any) =>
							a[field.CustomLabel] === row[field.CustomLabel]));
					outerGroupFields.forEach((g: any) => {
						g.Value = row[g.CustomLabel];
					});
					this.bindGroupinDetailData([filterData[0]], pager);
					filterData.forEach((filteredRow: any) => {
						rowsToRemove.add(filteredRow);
					});
				}
			});
			const remainingRows = rows.filter((row: any) =>
				!rowsToRemove.has(row));
			if (remainingRows.length > magicNumber.zero) {
				this.prepareGroupinDetailData(remainingRows, pager);
			}
		}
	}
	prepareOuterGroupData(rows: any) {
		const outerGroupFields = this.reportDetails.Json.GroupFunctionList.filter((x: any) =>
			x.GroupFunc == 'Outer Group');
		const outerGroupLabels = outerGroupFields.map((g: any) =>
			g.CustomLabel);
		this.columnCaptionOuterGroup = this.columnCaption.filter((label: any) =>
			!outerGroupLabels.includes(label.ColumnName));
		if (outerGroupFields.length > Number(magicNumber.zero)) {
			this.isOuterGroupMode = true;
			const rowsToRemove = new Set();
			rows.forEach((row: any, index: number) => {
				let filterData: any = [];
				if (index == 0) {
					filterData = rows.filter((a: any) =>
						outerGroupFields.every((field: any) =>
							a[field.CustomLabel] === row[field.CustomLabel]));
					outerGroupFields.forEach((g: any) => {
						g.Value = row[g.CustomLabel];
					});
					const outerGroupFieldsCopy = JSON.parse(JSON.stringify(outerGroupFields));
					this.bindOuterGroupGrid(filterData, outerGroupFieldsCopy);
					filterData.forEach((filteredRow: any) => {
						rowsToRemove.add(filteredRow);
					});
				}
			});
			const remainingRows = rows.filter((row: any) =>
				!rowsToRemove.has(row));
			if (remainingRows.length > magicNumber.zero) {
				this.prepareOuterGroupData(remainingRows);
			}
		}
	}
	bindGroupinDetailData(data:any, pager:any){
		let allData = [];
		if (this.listViewData[this.drillIndex]?.array) {
			this.listViewData[this.drillIndex].array.subscribe((res: any) => {
				if (res) {
					allData = res.data;
					data.forEach((a:any) => {
						allData.push(a);
					});
				}
			});
		}
		else {
			allData = data;
		}
		this.listViewData[this.drillIndex].array = of({
			data: [...allData],
			total: allData.length
		});
	}

	bindOuterGroupGrid(data: any, OuterGroupList: any) {
		this.outerGroupgrid.push({
			labelGroup: OuterGroupList,
			data: data,
			skip: 0,
			take: 100
		});
	}
	clearGroups(group: any) {
		this.outerGroupgrid.forEach((a: any) => {
			a.labelGroup = a.labelGroup.filter((x: any) =>
				!group.includes(x.CustomLabel));
		});
		const index = this.reportDetails.Json.GroupFunctionList.findIndex((a: any) =>
			a.FieldLabel == group);
		this.reportDetails.Json.GroupFunctionList[index].GroupFunc = 'Group';
		if (this.outerGroupgrid[0].labelGroup.length > Number(magicNumber.zero)) {
			this.outerGroupgrid = [];
			this.prepareOuterGroupData(this.listViewData);
		}
		if (this.outerGroupgrid[0].labelGroup.length == Number(magicNumber.zero)) {
			this.isOuterGroupMode = false;
			this.outerGroupgrid = [];
			this.runReport(magicNumber.one, magicNumber.hundred);
		}
	}
	isDate(dateString: string): boolean {
		//   const datePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{7}$/;
		const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2} (AM|PM)$/;
		return datePattern.test(dateString);
	}
	selectedFilters(event: any) {
		this.filterdata = event;
	}
	onPageChangeGrid(event: PageChangeEvent) {
		this.isDrillMode = false;
		this.isOuterGroupMode = false;
		const pageNumber = event.skip / event.take + 1;
		this.PaginationDto.startIndex = pageNumber;
		this.runReport(pageNumber, event.take);
		this.state.take = event.take;
	}
	onPageChangeGridInt(event: PageChangeEvent, index: number) {
		const pageNumber = event.skip / event.take + 1;
		this.listViewData[this.drillIndex].take = event.take;
		this.isDrillMode = true;
		this.reportDetails.Json.DrillDownRow = this.drillDownRow;
		if (!this.isInvalidFilterValue) {
			const json = this.reportDetails.Json;
			const reportDetails = new ReportDetails();
			reportDetails.Json = json;
			reportDetails.Json.Filters = this.filterdata;
			reportDetails.PaginationDto.startIndex = pageNumber;
			reportDetails.PaginationDto.pageSize = event.take;
			reportDetails.Json.IsAggregateReport = false;
			this.reportDataService.runReport(reportDetails).subscribe((response: any) => {
				if (response.Succeeded) {
					this.prepareReportDataGrid(response.Data.ReportData.Rows, response.Data.Pager);
					this.columnCaptionDrill = response.Data.ReportData.Columns;
					this.columnCaptionDrill.forEach((column: any) => {
						if (column.ColumnName.includes('.')) {
							column.ColumnValue = column.ColumnName.replace('.', '');
						}
						else {
							column.ColumnValue = column.ColumnName;
						}
					});
				}
			});
		}
		else {
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}
	}
	onPageChangeGridOuterGroup(event: PageChangeEvent, index: number) {
		this.drillIndexOuterGroup = index;
		this.outerGroupgrid[this.drillIndexOuterGroup].take = event.take;
		this.outerGroupgrid[this.drillIndexOuterGroup].skip = event.skip;
	}
	applyButton() {
		if (!this.isInvalidFilterValue) {
			this.isDrillMode = false;
			this.isOuterGroupMode = false;
			this.show = false;
			if (this.reportDetails.UKey != '' && !this.reportDetails.CopyMode) {
				this.PaginationDto.startIndex = magicNumber.one;
				this.PaginationDto.pageSize = magicNumber.hundred;
				this.reportDataService.
					// eslint-disable-next-line max-len
					runReport({ Ukey: this.reportDetails.UKey, SelectedFilters: this.filterdata, OutPutTypeId: this.reportDetails.OutputTypeId, PaginationDto: this.PaginationDto, Json: {} }).
					subscribe((response: any) => {
						if (response.Succeeded) {
							if (response.Data) {
								if (this.OutputTypeId != 295 && this.OutputTypeId != 296) {
									this.reportDataService.getExeHistoryByUkey(this.reportDetails.UKey).subscribe((res: GenericResponseBase<any>) => {
										if (isSuccessfulResponse(res))
											this.recentRunViewData = res.Data;
									});
								}
								else {
									this.pager = response.Data?.Pager;
									this.prepareReportDataGrid(response.Data?.ReportData?.Rows, response.Data?.Pager);
									this.columnCaptionDrill = response.Data?.ReportData?.Columns;
									this.columnCaptionDrill.forEach((column: any) => {
										if (column.ColumnName.includes('.')) {
											column.ColumnValue = column.ColumnName.replace('.', '');
										}
										else {
											column.ColumnValue = column.ColumnName;
										}
									});
								}
							}

						}
					});
			}
			else {
				const json = this.reportDetails.Json;
				json.DrillDownRow = [];
				const reportDetails = new ReportDetails();
				reportDetails.Json = json;
				reportDetails.Json.Filters = this.filterdata;
				if (this.reportDetails.Json.ReportType.toLowerCase() == 'summary') {
					reportDetails.Json.IsAggregateReport = true;
				}
				this.reportDataService.runReport(reportDetails).subscribe((response: any) => {
					if (response.Succeeded) {
						this.pager = response.Data.Pager;
						this.prepareReportDataGrid(response.Data.ReportData.Rows, response.Data.Pager);
						this.columnCaptionDrill = response.Data.ReportData.Columns;
						this.columnCaptionDrill.forEach((column: any) => {
							if (column.ColumnName.includes('.')) {
								column.ColumnValue = column.ColumnName.replace('.', '');
							}
							else {
								column.ColumnValue = column.ColumnName;
							}
						});
					}
				});
			}

		}
		else {
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}
	}
	rowDetailExpanded(event: DetailExpandEvent, outerGroupIndex: number) {
		if (this.outerGroupgrid.length > Number(magicNumber.zero)) {
			this.isOuterGroupMode = true;
			this.drillIndex = event.index;
		}
		else {
			this.isDrillMode = true;
			this.drillIndex = event.index - (this.PaginationDto.startIndex - 1) * this.PaginationDto.pageSize;
		}
		event.dataItem.drillMode = true;
		this.drillIndexOuterGroup = outerGroupIndex;
		this.reportDetails.Json.DrillDownRow = event.dataItem.drillDownRow;
		this.drillDownRow = event.dataItem.drillDownRow;
		if (!this.isInvalidFilterValue) {
			const json = this.reportDetails.Json;
			const reportDetails = new ReportDetails();
			reportDetails.Json = json;
			reportDetails.Json.IsAggregateReport = false;
			reportDetails.Json.Filters = this.filterdata;
			this.reportDataService.runReport(reportDetails).subscribe((response: any) => {
				if (response.Succeeded) {
					this.columnCaptionDrill = response.Data.ReportData.Columns;
					this.columnCaptionDrill.forEach((column: any) => {
						if (column.ColumnName.includes('.')) {
							column.ColumnValue = column.ColumnName.replace('.', '');
						}
						else {
							column.ColumnValue = column.ColumnName;
						}
					});
					this.prepareReportDataGrid(response.Data.ReportData.Rows, response.Data.Pager);
				}
			});
		}
		else {
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}
	}
	isInvalidFilter(data: boolean) {
		this.isInvalidFilterValue = data;
	}

	runReport(pageNo: number, pageSize: number = 100) {
		if (this.reportDetails.UKey != '' && !this.reportDetails.CopyMode) {
			this.PaginationDto.startIndex = pageNo;
			this.PaginationDto.pageSize = pageSize;
			this.reportDataService.
				// eslint-disable-next-line max-len
				runReport({ Ukey: this.reportDetails.UKey, OutPutTypeId: this.reportDetails.OutputTypeId, SelectedFilters: this.filterdata, PaginationDto: this.PaginationDto, Json: {} }).
				subscribe((response: any) => {
					if (response.Succeeded) {
						this.pager = response.Data.Pager;
						this.columnCaption = response.Data.ReportData.Columns;
						this.columnCaption.forEach((column: any) => {
							if (column.ColumnName.includes('.')) {
								column.ColumnValue = column.ColumnName.replace('.', '');
							}
							else {
								column.ColumnValue = column.ColumnName;
							}
						});
						this.prepareReportDataGrid(response.Data.ReportData.Rows, response.Data.Pager);
						if (this.isPrintStarted) {
							this.isPrintStarted = false;
							const list = this.returnGridRowsData(response.Data.ReportData.Rows);
							this.printReportData(list);
						}
					}
				});
		}
		else {
			const json = this.reportDetails.Json,
				reportDetails = new ReportDetails();
			reportDetails.Json = json;
			reportDetails.Json.DrillDownRow = [];
			reportDetails.PaginationDto.startIndex = pageNo;
			reportDetails.PaginationDto.pageSize = pageSize;
			reportDetails.Json.ReportName = '';
			if (this.reportDetails.Json.ReportType.toLowerCase() == 'summary') {
				reportDetails.Json.IsAggregateReport = true;
			}
			this.reportDataService.runReport(reportDetails).subscribe((response: any) => {
				if (response.Succeeded) {
					this.pager = response.Data.Pager;
					this.columnCaption = response.Data.ReportData.Columns;
					this.columnCaption.forEach((column: any) => {
						if (column.ColumnName.includes('.')) {
							column.ColumnValue = column.ColumnName.replace('.', '');
						}
						else {
							column.ColumnValue = column.ColumnName;
						}
					});
					this.prepareReportDataGrid(response.Data.ReportData.Rows, response.Data.Pager);
					if (this.isPrintStarted) {
						this.isPrintStarted = false;
						const list = this.returnGridRowsData(response.Data.ReportData.Rows);
						this.printReportData(list);
					}
				}
			});
		}
	}
	edit() {
		if (this.isCustomReport) {
			this.reportDetails.ApplicableActions = 'E';
				this.reportDetails.ExecuteMode = false;
				window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
				if(this.reportDetails.UKey != ''){
					this.route.navigate([`/xrm/report/report-library/custom-report/build/${this.reportDetails.UKey}`]);
				}
				else{
					this.route.navigate([`/xrm/report/report-library/custom-report/build`]);
				}
		}
		else{
			this.route.navigate([`/xrm/report/report-library/pre-defined-report/build`]);
		}
	}
	backReport(){
		if(this.isCustomReport){
			this.route.navigate([`/xrm/report/report-library/list`]);
		}
		else{
			this.route.navigate([`/xrm/report/report-library/pre-defined-report`]);
		}
	}

	ngOnDestroy(): void {
		this.toasterServc.resetToaster();
		this.reportStatusComponentService.destroy();
	}
	returnInnerGridHtml(header: any, row: any, grp: any) {
		return `
		<tr class="tr-detail">
		<tr>
			${grp}
		</tr>
				<td colspan="12">
					<div>
						<div class="detail-content">
							<ul style="padding-left:0;list-style:none;">
								<li>
									<div class="detail-space"></div>
									 <div class="detail detail-main">
										<fieldset>
											<div>
												<table class="table table-condensed">
													<thead>
														<tr class="print__nesting-table">
														${header}
														</tr>
													</thead>
													<tbody>
														<tr>
														 ${row}
														</tr>
													</tbody>
												</table>
											</div>
										</fieldset>
									</div>
								</li>
						  </ul>
					</div>
				</div></td>
			</tr>`;
	}
	returnOuterGroupGridHtml(header: any, row: any, innerHeader: any, innerRow: any, grp: any) {
		return `<tr class="tr-detail">
		<tr>
			${grp}
		</tr>
   <td colspan="12">
      <div>
         <div class="detail-content">
            <ul style="padding-left:0;list-style:none;">
               <li>
                  <div class="detail-space"></div>
                  <div class="detail detail-main">
                     <fieldset>
                        <div>
                           <table class="table table-condensed">
                              <thead>
                                 <tr class="print__nesting-table">
                                    ${header}
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr>
                                    ${row}
                                 </tr>
                                 
                              </tbody>
                           </table>
                        </div>
                     </fieldset>
                  </div>
               </li>
            </ul>
         </div>
      </div>
   </td>
</tr>`;
	}
	html: any = '';
	printReport() {
		this.isPrintStarted = true;
		this.runReport(magicNumber.one, this.pager.TotalRecords);
	}
	printReportData(listTotal: any) {
		const tableHeader = this.columnCaption.map((item: any) =>
			`<th>${item.ColumnName}</th>`).join('');
		const printWindow = window.open('', '_blank', 'left=0,top=0,width=900,height=900');
		if (printWindow) {
			printWindow.document.open();
			printWindow.document.write(this.returnGridHtml(this.reportDetails.Json.ReportName, tableHeader, this.prepareRows(listTotal)));
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
			printWindow.close();
		}
	}
	prepareRows(listTotal: any) {
		let innertableRows = '';
		const tableHeaderNested = this.columnCaptionDrill.map((item: any) =>
			`<td class="print__nesting-table--header">${item.ColumnName}</td>`).join('');
		return listTotal.map((rowData: any) => {
			const rowsData = this.columnCaption.map((item: any) =>
				`<td>${rowData[item.ColumnValue]}</td>`).join('');
			// if(rowData.drillMode){
			// 	rowData.array.subscribe((x: any) => {
			// 		if (x?.data && x.data.length > Number(magicNumber.zero)) {
			// 			innertableRows = x.data.map((innerrowData: any) => {
			// 				const innerrowsData = this.columnCaptionDrill.map((item: any) =>
			// 					`<td class="print__nesting-table--body">${innerrowData[item.ColumnValue]}</td>`).join('');
			// 			   return this.returnInnerGridHtml(tableHeaderNested, innerrowsData, '');
			// 			}).join('');
			// 		}
			// 	});
			// }
			// if(rowData.drillMode){
			// 	return `<tr>${rowsData}</tr>${innertableRows}`;
			// }
			// else{
			// 	return `<tr>${rowsData}</tr>`;
			// }
			return `<tr>${rowsData}</tr>`;
		}).join('');
	}
	returnGridHtml(reportName: string, tableHeader: any, tableRows: any) {
		return `
            <html>
                <head>
				 <style>
                        @media print {
                            @page {
                                orientation: landscape !important;
                            }
							#header,
                            #footer,
                            #nav {
                                display: none !important;
                            }
                        }
                            
						body {
								font-family: Roboto;
								font-size:8px;
								text-align:left;
                        }
                        .table.print__main {
								font-size:8px;
								border-collapse: collapse;
                        }
						.table.print__main th {
							  	border: 1px solid #dbdde8;
								text-align: left;
								background-color: #fafafa;
								padding:4px;
                        }
                        .table.print__main td {
							  	border: 1px solid #dbdde8;
								text-align: left;
								padding:4px;
                        }                  
                    </style>
                </head>
                <body>
                    <h2>${reportName}</h2>
                    <br>
                    <table class="table print__main">
                        <thead>
                            <tr>
                                ${tableHeader}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows} 
                        </tbody>
                    </table>
                </body>
            </html>
            `;
	}
	pprint() {
		// const printSection = document.getElementById('print-section');
		// if(printSection){
		// 	printSection.style.display = 'block';
		// }
		// const customPrintOptions: PrintOptions = new PrintOptions({
		// 	printSectionId: 'print-section'
		// });
		// this.printService.print(customPrintOptions);
		// if(printSection){
		// 	printSection.style.display = 'none';
		// }
	}
}
