import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPaths } from '../routes/routeConstants';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { AdvanceSearchComponent } from '@xrm-widgets';
import { AdvanceSearchAutoApply } from '@xrm-shared/services/common-constants/advanceSearchAutoApply';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { EmailList } from '@xrm-core/models/recent-alert.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPageSize } from '@xrm-shared/models/common.model';


@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

	@ViewChild('advanceSearch', {static: false}) advanceSearch: AdvanceSearchComponent;

	public entityId= XrmEntities.RecentAlerts;
	public apiAddress: string = 'emailnot-pgd/paged';
	public advApiAddress: string = 'emailnot/select-paged';
	public isServerSidePagingEnable: boolean = true;
	public advFilterData: EmailList[] = [];
	public searchText: string;
	public pageSize = magicNumber.zero;
	private destroyAllSubscribtion$ = new Subject<void>();
	private last30Days: Date;
	private today: Date;
	public columnOptions : GridColumnCaption[] = [];

	constructor(
		private router: Router,
		private gridConfiguration: GridConfiguration,
		private gridService: GridViewService,
		private toasterService: ToasterService,
		private advanceSearchAutoApply: AdvanceSearchAutoApply
	) {
		this.today = new Date();
		this.last30Days = this.getDateNdaysAgo(magicNumber.thirty);
	}

	ngOnInit(): void {
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columns, pageData]) => {
			this.getColumnData(columns);
			this.getPageSizeData(pageData);
		});
	}

	ngAfterViewInit(){
		this.advanceSearch.openPopup();
		this.advanceSearch.closePopup();
	}

	ngAfterViewChecked() {
		this.advanceSearchAutoApply.applyAdvSearchDateFilter(
			this.advanceSearch,
			'ReceivedOn-693',
			this.today, this.last30Days
		);
	}

	private getDateNdaysAgo(days: number): Date {
		const today = new Date(),
		 pastDate = new Date(today);
		pastDate.setDate(today.getDate() - days);
		return pastDate;
	}

	private getColumnData(res : GenericResponseBase<GridColumnCaption[]>) {
		if(isSuccessfulResponse(res)){
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.twenty;
		}
	}

	private onView = (dataItem: EmailList) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.EmailLogUkey}`]);

	};

	public actionSet = [
		{
			  Items: this.gridConfiguration
				  .showViewIcon(this.onView)
		  }
	];

	public OnSearch(list: string) {
		this.searchText = list;
	}

	public OnFilter(filteredData: EmailList[]) {
		this.advFilterData = filteredData;
	}


	public generateExportFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Messages_${uniqueDateCode}`;

		return fileName;
	}

	private calculateDate(n: number): string {
		return n < Number(magicNumber.ten)
			? `0${n}`
			: n.toString();
	}

	ngOnDestroy(){
		this.advanceSearchAutoApply.setCodeExec(false);
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
