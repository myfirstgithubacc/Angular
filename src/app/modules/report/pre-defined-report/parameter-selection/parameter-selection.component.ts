/* eslint-disable max-lines-per-function */
import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterExpression } from "@progress/kendo-angular-filter";
import { ReportDataService } from 'src/app/services/report/report.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReportNavigationPaths } from '../../constants/route-path';
import { Subject, takeUntil } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { ReportDetails } from '@xrm-core/models/report/report-payload';
import { OutputType, ReportType } from '../../constants/enum-constants';
import { MenuService } from '@xrm-shared/services/menu.service';
import { hasPermissions } from 'src/app/modules/acrotrac/expense/utils/userDependentList';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { EntityAction } from '@xrm-shared/models/menu-interface';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { FormGroup } from '@angular/forms';
import { StatusData } from '@xrm-shared/models/common-header.model';

@Component({
	selector: 'app-parameter-selection',
	templateUrl: './parameter-selection.component.html',
	styleUrls: ['./parameter-selection.component.css']
})
export class ParameterSelectionComponent implements OnInit, OnDestroy {
	activeItem: number = 295;
	public isDisabled = false;
	public reportId: number = 0;
	public isExecuteMode = false;
	isCustomReport:boolean = false;
	private destroyAllSubscribtion$ = new Subject<void>();
	public filters: any[] = [
		{
			field: "",
			title: "",
			editor: "string",
			operators: ["neq", "eq", "contains"]
		}
	];
	public isInvalidFilterValue:boolean = false;
	payload :any;
	filterData: any = [];
	value: any = [];
	reportData:any;
	fieldList:any;
	uKey:string = '';
	reportDetails: ReportDetails;
	public entityId = XrmEntities.Report;
	public permissions = {
		edit: false,
		copy: false,
		run: false
	};
	commonHeader:FormGroup;
	public statusData: StatusData = {
		items: [
			{
				title: 'Report Name',
				titleDynamicParam: [],
				item: 'Predefined Report',
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: ''
			}
		]
	};
	// eslint-disable-next-line max-params
	constructor(private reportDataService: ReportDataService,
		private http: HttpClient,
		private activatedRoute:ActivatedRoute,
	    private route:Router,
		private toasterServc: ToasterService,
		private dialogService: DialogPopupService,
		private menuService: MenuService
	) {
		this.reportDetails = JSON.parse(window.sessionStorage.getItem('reportData') ?? '{}');
	}

	ngOnInit(): void {
		this.reportDataService.isStepperClickedObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
		  if (!data) return;
		  if (data.index === magicNumber.two) {
				this.handleStep();
		  } else if (data.index === magicNumber.three) {
				this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.formatAndSave]);
		  }
		});
		this.activatedRoute.data.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
			this.isCustomReport = data.isCustomReport;
			if(this.isCustomReport){
				this.reportDataService.setStepperData.next({currentStep: 1});
			}
			else{
				this.reportDataService.setStepperData.next({currentStep: 1});
			}
		});
		this.activatedRoute.params.subscribe((param) => {
			if (param['id']) {
				this.reportDataService.getReportDetailsByUkey(param['id']).subscribe((data:any) => {
					if(data.Succeeded){
						const reportDetails = this.reportDetails;
						this.reportDetails = data.Data;
						this.reportDetails.ApplicableActions = reportDetails.ApplicableActions;
						this.reportDetails.RunReportCallNeeded = reportDetails.RunReportCallNeeded;
						this.reportDetails.Json.ReportName = data.Data.ReportName;
						this.fieldList = this.reportDetails.Json.SelectedFields;
						this.reportId = this.reportDetails.Json.ReportId;
						this.activeItem = this.reportDetails.OutputTypeId;
						this.statusData.items[0].item = this.reportDetails.ReportName;
						if (this.reportDetails.Json.Filters.length > Number(magicNumber.zero)) {
							this.filterData = [this.convertFilters(this.reportDetails.Json.Filters[0], this.reportDetails.ReportId)];
						}
						this.value = [...this.reportDetails.Json.Filters];
					}
				});
				this.menuService.getAuthorizedActionsList().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
					this.getMenuService(data);
				});
			}
			else if(this.reportDetails.Json.SelectedFields.length > 0){
				this.activeItem = this.reportDetails.OutputTypeId;
				this.fieldList = this.reportDetails.Json.SelectedFields;
				this.value = [...this.reportDetails.Json.Filters];
				this.menuService.getAuthorizedActionsList().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
					this.getMenuService(data);
				});
			}
		});
	}

	private getMenuService(res: EntityAction[]): void {
		const entityActions = res[0].EntityActions;
		this.permissions.edit = this.checkPermission(entityActions, Permission.Edit_Predefined_Report);
		this.permissions.copy = this.checkPermission(entityActions, Permission.Copy_Report);
		this.permissions.run = this.checkPermission(entityActions, Permission.Execute_Report);
	}

	private checkPermission(entityActions: {EntityTypeId: number, EntityType: string, ActionId: number,
	 ActionName: string}[], permission: Permission): boolean {
	 return hasPermissions(entityActions, permission);
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

	isInvalidFilter(isInvalid:boolean){
		console.log(isInvalid);
		this.isInvalidFilterValue = isInvalid;
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
	selectedFilters(event:any) {
		this.reportDetails.Json.Filters = event;
	}
	toggleActive(item: number): void {
		if(item === Number(OutputType.List)){
			this.reportDetails.ScheduledReport = false;
		}
		this.reportDetails.OutputTypeId = item;
		if (this.isActive(item)) {
			this.activeItem = 295;
		} else {
			this.activeItem = item;
		}
	}
	  isActive(item: number): boolean {
		return this.activeItem === item;
	  }

	  back(){
		if(this.isCustomReport){
			this.route.navigate([`${ReportNavigationPaths.list}`]);
			this.reportDataService.isExecuteReport.next(false);
		}
		else{
			this.reportDataService.setStepperData.next({currentStep: 0});
		}
	}
	  copyPredefined(){
		if(!this.isInvalidFilterValue){
			this.reportDetails.ApplicableActions = 'P';
			this.reportDetails.ReportId = magicNumber.zero;
			this.reportDetails.ReportTypeId = ReportType.CustomReport;
			this.reportDetails.RunReportCallNeeded = true;
			this.reportDetails.OutputTypeId = this.activeItem;
			this.reportDetails.IsCopyOfPredefined = true;
			window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
			this.reportDataService.setStepperData.next({currentStep: 2});
			this.route.navigate([`${ReportNavigationPaths.addEdit.customReport.build}`]);
		}
		else{
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}
	  }
	  editPredefined(){
		if(!this.isInvalidFilterValue){
			this.reportDetails.ApplicableActions = 'P';
			this.reportDetails.ReportId = this.reportDetails.ReportId > Number(magicNumber.zero) ?
		 this.reportDetails.ReportId
				: this.reportDetails.Json.ReportId;
			this.reportDetails.ReportTypeId = ReportType.PreDefinedReport;
			this.reportDetails.RunReportCallNeeded = true;
			this.reportDetails.OutputTypeId = this.activeItem;
			window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
			this.reportDataService.setStepperData.next({currentStep: 2});
			this.route.navigate([`${ReportNavigationPaths.addEdit.predefinedReport.copyModify}`]);
		}
		else{
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}
	  }
	  run(){
		this.reportDataService.setStepperData.next({currentStep: 4});
	  }
	runReport(){
		if(!this.isInvalidFilterValue){
			this.reportDetails.ExecuteMode = true;
			this.reportDetails.RunReportCallNeeded = true;
			window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
			if(this.isCustomReport){
				this.route.navigate([ReportNavigationPaths.addEdit.customReport.listView]);
				this.reportDataService.setStepperData.next({currentStep: 3});
			}
			else{
				this.reportDetails.ApplicableActions = this.permissions.edit
					?'P'
					:'N';
				this.reportDetails.OutputTypeId = this.activeItem;
				window.sessionStorage.setItem('reportData', JSON.stringify(this.reportDetails));
				this.route.navigate(['/xrm/report/report-library/pre-defined-report/list-view']);
				this.reportDataService.setStepperData.next({currentStep: 4});
			}

		}
		else{
			this.toasterServc.showToaster(ToastOptions.Warning, 'Please select value for filter.');
		}
	}
	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.dialogService.resetDialogButton();
		this.toasterServc.resetToaster();
		this.reportDataService.isStepperClicked.next(null);
	}
	handleStep(){

	};
}
