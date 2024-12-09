import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ReportDataService } from 'src/app/services/report/report.service';
import { NavigationService } from './common/utils/common-method';
import { Router } from '@angular/router';
import { ReportNavigationPaths } from './constants/route-path';
import { ReportDetails } from '@xrm-core/models/report/report-payload';

@Component({
	selector: 'app-core-report',
	templateUrl: './core-report.component.html',
	styleUrls: ['./core-report.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CoreReportComponent implements OnInit, OnDestroy {
	private destroyAllSubscribtion$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
	private global: PageTitleService,
	private reportDataService:ReportDataService,
	private navigationService: NavigationService,
	private route: Router
	) { }
	public steps:any[] = [];
	currentStep = magicNumber.zero;
	reportDetails: ReportDetails;
	showStepper:boolean = false;
	isCustomReport:boolean;
	isExecuteMode:boolean = false;

	ngOnInit(): void {
		this.reportDataService.getStepperData.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data) => {
			if(data){
				this.currentStep = data.currentStep;
			}
		});
		this.global.getRouteObs.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((url) => {
			this.reportDetails = JSON.parse(window.sessionStorage.getItem('reportData')?? '{}');
			this.isExecuteMode = this.reportDetails.ExecuteMode;
			if (url.includes('/xrm/report/report-library/list') || this.reportDetails.RecentRunMode) {
                 	this.showStepper = false;
			}
			else if (url.includes('/xrm/report/report-library/custom-report') && !this.isExecuteMode) {
				this.showStepper = true;
				this.isCustomReport = true;
				this.steps = [
					{ id: 0, label: "Select Base Data Entity", route: "/xrm/report/report-library/custom-report" },
					{ id: 1, label: "Build", route: "/xrm/report/report-library/custom-report/build" },
					{ id: 2, label: "Format & Save", route: "/xrm/report/report-library/custom-report/format-and-save" },
					{ id: 3, label: "View", route: "/xrm/report/report-library/custom-report/list-view" }
				];
			}
			else if (url.includes('/xrm/report/report-library/custom-report') && this.isExecuteMode) {
				this.isExecuteMode = true;
				this.currentStep = magicNumber.zero;
				this.showStepper = true;
				this.steps = [
					{ label: "Parameter Selection", route: "/xrm/report/report-library/pre-defined-report/build" },
					{ label: "View", route: "/xrm/report/report-library/pre-defined-report/list-view" }
				];
			}
			else if(url.includes('/xrm/report/report-library/pre-defined-report') && !this.isExecuteMode){
				this.showStepper = true;
				this.isCustomReport = false;
				this.steps = [
					{ label: "Report Selection", route: "/xrm/report/report-library/pre-defined-report" },
					{ label: "Parameter Selection", route: "/xrm/report/report-library/pre-defined-report/parameter-selection" },
					{ id: 1, label: "Build", route: "/xrm/report/report-library/custom-report/build" },
					{ id: 2, label: "Format & Save", route: "/xrm/report/report-library/custom-report/format-and-save" },
					{ label: "View", route: "/xrm/report/report-library/pre-defined-report/list-view" }
				];
			}
		});
	}
	stepChanged(event:any){
		//this.reportDataService.isStepperClicked.next(event);
	}
	activate(event: any) {
		if (event?.preventDefault) {
		  event.preventDefault();
		}
		const isZeroStep = this.currentStep === magicNumber.zero || event.index === magicNumber.zero;
		if (isZeroStep) {
		  this.reportDataService.isStepperClicked.next(null);
		  this.reportDataService.isGridChanged.pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
				if (event.index === magicNumber.zero && !this.isExecuteMode) {
					this.navigationService.backToBaseDataEntity({isCustomReport: this.isCustomReport, isGridChanged: res});
		  }
		  else if(event.index === magicNumber.zero && this.isExecuteMode){
					this.reportDataService.setStepperData.next({ currentStep: magicNumber.zero });
					this.route.navigate([`${ReportNavigationPaths.addEdit.customReport.parameterSelection}/${this.reportDetails.UKey}`]);
		  }
		  });

		} else {
		  this.reportDataService.isStepperClicked.next(event);
		}
	  }

	ngOnDestroy(): void {
		this.reportDataService.isStepperClicked.next(null);
	}
}
