import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from '../constants/route';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { Subject, forkJoin, takeUntil} from 'rxjs';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { BulkDataManagementService } from 'src/app/services/masters/bulk-data-management.service';
import { AdvanceSearchComponent } from '@xrm-widgets';
import { HttpStatusCode } from '@angular/common/http';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { ListItems } from '../constants/model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPageSize } from '@xrm-shared/models/common.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GlobalService } from '@xrm-shared/services/global.service';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('advanceSearch', {static: false}) advanceSearch: AdvanceSearchComponent;

	public columnOptions: GridColumnCaption[] = [];

	public pageSize: number = magicNumber.zero;

	public entityId: number = XrmEntities.ListBulkDataManagement;

	public isServerSidePagingEnable: boolean = true;

	private selectedTabforGrid :boolean = false;

	private destroyAllSubscribtion$: Subject<void> = new Subject<void>();

	private onDownloadSuccess = (dataitem: ListItems) => {

		this.downloadRecords(dataitem, 'Success');
	};

	private onDownloadFailed = (dataitem: ListItems) => {

		this.downloadRecords(dataitem, 'Failure');
	};

	private onCancel = (dataitem:ListItems) => {

		this.procesCancel(dataitem);
	};

	public actionSet : IActionSetModel[] = [
		{
			Status: 'In-Queue', Items: this.gridConfiguration.showCrossIcon(this.onCancel)
		},
		{
			Status: 'Processed', Items: this.gridConfiguration.showSuccessDownloadIcon(this.onDownloadSuccess)
		},
		{
			Status: 'Failed', Items: this.gridConfiguration.showFailedDownloadIcon(this.onDownloadFailed)
		},
		{
			Status: 'Partially Processed', Items: this.gridConfiguration.showProcessedDownloadIcon(this.onDownloadSuccess, this.onDownloadFailed)
		}
	];

	public tabOptions = {
		bindingField: 'StatusId',
		tabList: [
			{
				tabName: 'Processed',
				favourableValue: true,
				bindingInfo: [{ columnName: 'StatusId', values: ['247', '248', '250'] }],
				selected: !this.selectedTabforGrid
			},
			{
				tabName: 'InQueue',
				favourableValue: 249
			},
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: this.selectedTabforGrid
			}
		]
	};

	public advFilterData: unknown;
	public searchText: string;
	public apiAddress: string = 'blk-upld/paged';
	public advApiAddress: string = 'blk-upld/select-paged';

	constructor(
		private router: Router,
		private gridService: GridViewService,
		private bulkDataService: BulkDataManagementService,
		private gridConfiguration: GridConfiguration,
		private globalSer: GlobalService,
		private toasterService: ToasterService
	) {
	}

	ngOnInit(): void {

		forkJoin([
			this.gridService.getColumnOption(this.entityId, 'BulkDataTransaction'),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columnData, pageData]) => {
			this.getColumnData(columnData);
			this.getPageSizeData(pageData);
		});

		this.onTimeLoadData();
		if(this.bulkDataService.isuploadBtn.getValue()){
			this.globalSer.persistTab.next({ tabName: 'InQueue', key: this.entityId });
		}
		else{
			this.globalSer.persistTab.next({ tabName: 'Processed', key: this.entityId });
		}
	}

	private onTimeLoadData(){
		this.bulkDataService.isUploaded.pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res: {showToaster: boolean, templateName: string}) => {
				if(res.showToaster){
					this.toasterService.showToaster(
						ToastOptions.Success, 'TemplateHasBeenQueuedForUploadMessage',
						[{ Value: res.templateName, IsLocalizeKey: true }],
						false,
						false,
						'',
						magicNumber.ten
					);

				}
			});
	}

	ngAfterViewInit(){
		this.bulkDataService.isBackFromUploadHistory.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: any) => {
			if (data) {
				this.selectedTabforGrid = data.isBackFromUploadHistory;
				this.advanceSearch.openPopup();
				this.advanceSearch.closePopup();
				const columnInfo = Object.keys(this.advanceSearch.filterForm.value);
				columnInfo.forEach((element: string) => {
					if (this.advanceSearch.formData[element] != undefined)
					{
						this.advanceSearch.filterForm.get(element)?.setValue(this.advanceSearch.formData[element]);
					}
					if(element === "TemplateName-591")
					{
						this.advanceSearch.filterForm.get(element)?.
							setValue([{Value: data.uploadHistoryId.TemplateName, Text: data.uploadHistoryId.TemplateName}]);
						this.advanceSearch.applyFilter('');
					}
				});

			}
		});
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.ten;
		}
	}

	private getColumnData(res: ApiResponse) {
		if (res.Succeeded === true) {
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});

		}
	}

	public onSearchTriggered(list: string) {
		this.searchText = list;
	}

	public navigate(){
		this.router.navigate([`${NavigationPaths.addEdit}`]);
	}

	public onFilterTriggered(filteredData: unknown) {
		this.advFilterData = filteredData;
	}

	private procesCancel(dataItem: ListItems){
		 this.bulkDataService.cancelTransaction(dataItem.Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res:any) => {
			if(res.Succeeded)
			{
				this.toasterService.showToaster(ToastOptions.Success, 'CancelTransaction');
				this.gridConfiguration.refreshGrid();
			}
		 });
	}

	private downloadRecords(dataitem: ListItems, status: string){

		const payload = status === 'Failure'
			? dataitem.FailedRecordId
			: dataitem.SuccessRecordId;
		this.bulkDataService.downloadRecords(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: any) => {
			this.downloadFile(res, dataitem, status);
		});
	}

	private downloadFile(res:any, record: ListItems, status: string){
		const url = window.URL.createObjectURL(res.body),
			a = document.createElement('a'),
			fileNameWithExtension = this.generateFileName(record, status);
		a.href = url;
		a.download = fileNameWithExtension;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	private generateFileName(rec:ListItems, status:string){

		const fileName = `${status}_${rec.TemplateName}`;
		return fileName;
	}


	public generateExportFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `BulkDataManagement_${uniqueDateCode}`;

		return fileName;
	}

	private calculateDate(n:number) {
		return n < Number(magicNumber.ten)
			? `0${ n}`
			: n.toString();
	}

	ngOnDestroy() {
		this.bulkDataService.backFromUploadHistory.next(false);
		this.bulkDataService.isuploadBtn.next(false);
		this.bulkDataService.uploaded.next({});
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
