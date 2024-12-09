import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectEvent } from '@progress/kendo-angular-layout';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { ReportDataService } from 'src/app/services/report/report.service';
import { ReportNavigationPaths } from '../../constants/route-path';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { BasicEntitiesDetails, PopularEntitiesDetails } from '@xrm-core/models/report/basic-entity-details';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { ReportDetails } from '@xrm-core/models/report/report-payload';
import { ReportType } from '../../constants/enum-constants';

@Component({
	selector: 'app-select-base-data',
	templateUrl: './select-base-data.component.html',
	styleUrls: ['./select-base-data.component.css']
})
export class SelectBaseDataComponent implements OnInit, OnDestroy{
	allTableList:any=[];
	baseDataList:any= [];
	gridData:any= [];
	reportDetails:ReportDetails;
	public isCustomReport = false;
	private destroyAllSubscribtion$ = new Subject<void>();
	showPopularTab:boolean = true;

  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;

  // eslint-disable-next-line max-params
  constructor(
    private route: Router,
    private fb: FormBuilder,
	private http:HttpClient,
	private reportDataService:ReportDataService,
	private activatedRoute:ActivatedRoute,
	private dialogService: DialogPopupService
  )
  {
  	this.reportDetails = JSON.parse(window.sessionStorage.getItem('reportData') ?? '{}');
  }
  ngOnInit() {
  	this.reportDataService.isGridChangedSubject.next(false);
  	this.activatedRoute.data.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
  		this.isCustomReport = data.isCustomReport;
  		if (this.isCustomReport) {
  			if(this.reportDetails.SelectedTabName == 'Popular'){
  				this.getAllBasePopularEntitiesData();
  			}
  			else if(this.reportDetails.SelectedTabName == 'All'){
  				this.getAllBaseEntitiesData();
  			}
  		}
  		else {
  			  this.getPreDefinedReportsData();
  		}
  	});
	  this.reportDataService.setStepperData.next({currentStep: magicNumber.zero});
  }

  public onTabSelect(e: SelectEvent): void {
  	this.baseDataList = [];
  	if (e.index === Number(magicNumber.one)) {
  		this.reportDetails.SelectedTabName = 'All';
  		this.getAllBaseEntitiesData();
  	}
  	else {
  		this.reportDetails.SelectedTabName = 'Popular';
  		this.getAllBasePopularEntitiesData();
  	}
  }

  private getPreDefinedReportsData(){
  	this.reportDataService.getAllPreDefinedReports().pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((res: GenericResponseBase<any>) => {
  			if(isSuccessfulResponse(res)){
  				this.gridData = res.Data;
				  this.bindGrid(this.gridData);
  			}
  		});
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

  private getAllBasePopularEntitiesData(){
  	this.reportDataService.getAllBasePopularEntities().pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((res:GenericResponseBase<PopularEntitiesDetails[]>) => {
  			if(isSuccessfulResponse(res)){
  				this.allTableList = res;
  				this.gridData = res.Data;
  				if(this.gridData.length > 0){
  					this.bindGrid(this.gridData);
  				}
  				else{
  					this.showPopularTab = false;
  					this.reportDetails.SelectedTabName = 'All';
  					this.getAllBaseEntitiesData();
  				}
  			}
  	});
  }

  private getAllBaseEntitiesData(){
  	this.reportDataService.getAllBaseEntities().pipe(takeUntil(this.destroyAllSubscribtion$))
  		.subscribe((res: GenericResponseBase<BasicEntitiesDetails[]>) => {
  			if(isSuccessfulResponse(res)){
  				this.allTableList = res;
  				this.gridData = res.Data;
				  this.bindGrid(this.gridData);
  			}
  	});
  }

  setBaseData(data:any){
  	if(this.isCustomReport){
  		this.reportDataService.setData({selectedData: data, data: this.allTableList});
  		this.reportDataService.setStepperData.next({currentStep: 1});
  		this.reportDetails.BaseEntityUkey = data.UKey;
  		this.reportDetails.Json.SelectedFields = [];
  		this.reportDetails.Json.Filters = [];
  		this.reportDetails.BaseReportXrmEntityId = data.Id;
  		const report = JSON.stringify(this.reportDetails);
  		window.sessionStorage.setItem('reportData', report);
  		this.route.navigate([ReportNavigationPaths.addEdit.customReport.build]);
  	}
  	else{
  		// this.route.navigate([ReportNavigationPaths.addEdit.predefinedReport.parameterSelection]);
		  this.route.navigate([`${ReportNavigationPaths.addEdit.predefinedReport.parameterSelection}/${data.UKey}`]);
  	}
  }

  private bindGrid(gridData : any){
  	this.baseDataList = gridData;
  }

  onFilter(inputValue: string, reportType:number) {
  	inputValue = inputValue.trim().toLowerCase();
  	if (inputValue.trim().length <Number(magicNumber.two)) {
  		this.bindGrid(this.gridData);
  		return;
	  }
	  const reportField = reportType === Number(ReportType.CustomReport)
  			? 'DataEntities'
  			: 'PredefinedReports',
  		searchData = this.gridData.map((data: any) => {
  			const reports = Array.isArray(data[reportField])
  				? data[reportField].filter((report: any) => {
  				return report?.Name?.toLowerCase().includes(inputValue) ||
					   (report?.Description?.toLowerCase().includes(inputValue));
  			})
  				: [];
  			if (data?.Name?.toLowerCase().includes(inputValue) || reports.length > magicNumber.zero) {
  				return {
  					...data,
  					[reportField]: reports
  				};
  			}
  			return null;
  		}).filter((data: any) =>
  			data !== null);
  	this.bindGrid(searchData);
  }

  back(){
  	this.route.navigate([ReportNavigationPaths.list]);
  }
  ngOnDestroy(): void {
  	this.reportDataService.isStepperClicked.next(null);
  	this.dialogService.resetDialogButton();
  }
}
