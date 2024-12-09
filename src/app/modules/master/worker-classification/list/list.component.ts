import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPaths } from '../route-constants/routes-constants';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { WorkerClassificationService } from 'src/app/services/masters/worker-classification.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { WorkerClassification } from '@xrm-core/models/worker-classification.model';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrl: './list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy{

	public searchText: string;
	public entityId: number = XrmEntities.WorkerClassification;
	public columnOptions : GridColumnCaption[] = [];
	private destroyAllSubscribtion$ = new Subject<void>();
	public pageSize: number = magicNumber.zero;
	public isServerSidePagingEnable: boolean = true;
	public fileName: string;
	public advFilterData: WorkerClassification[]= [];
	public apiAddress: string = 'wrcs/paged';
	public advApiAddress: string = 'wrcs/select-paged';
	private workerClassificationLabelTextParams: DynamicParam[] = [{ Value: 'WorkerClassificationSmall', IsLocalizeKey: true }];

	public tabOptions : ITabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: 'Active',
				favourableValue: false,
				selected: true
			},
			{
				tabName: 'Inactive',
				favourableValue: true
			},
			{
				tabName: 'All',
				favourableValue: 'All'
			}
		]
	};

	constructor(
		private router: Router,
		private gridConfiguration: GridConfiguration,
		private gridService: GridViewService,
		private workerClassificationService: WorkerClassificationService,
		private toasterServ: ToasterService
	){}

	ngOnInit(): void {
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columns, pageData]) => {
			this.getColumnData(columns);
			this.getPageSizeData(pageData);
		});
		const a= this.workerClassificationService.getAllWorkerClassification();
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.twenty;
		}
	}

	private getColumnData( result : GenericResponseBase<GridColumnCaption[]> ) {
		if(isSuccessfulResponse(result))
			this.columnOptions = result.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
	};

	private onActiveChange = (dataItem: WorkerClassification) => {
		if (dataItem.UKey) {
			const a: string[] = [dataItem.UKey];
			this.workerClassificationStatusChange(a, !dataItem.Disabled);
		}
	};

	private onView = (dataItem: WorkerClassification) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: WorkerClassification) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public actionSet : IActionSetModel[] =[
		{
			Status: false,
			Items: this.gridConfiguration
				.showAllActionIcon(this.onView, this.onEdit, this.onActiveChange)
		},
		{
			Status: true,
			Items: this.gridConfiguration
				.showInactiveActionIcon(this.onView, this.onEdit, this.onActiveChange)
		}
	];

	private workerClassificationStatusChange(dataItem: string[], status: boolean) {

		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				ukey: item,
				disabled: status,
				reasonForChange: ''
			}));

		 this.workerClassificationService.UpdateBulkStatus(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterServ.resetToaster();
			this.toasterServ.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.workerClassificationLabelTextParams);
		   	this.gridConfiguration.refreshGrid();
		   });
	}

	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`;
		 this.fileName = `Worker Classification_${uniqueDateCode}`;

		return this.fileName;
	}

	public calculateDate(n: number): string {
		return n < Number(magicNumber.ten)
			? `0${n}`
			: n.toString();
	}

	public OnFilter(data: WorkerClassification[]) {
		this.advFilterData = data;
	}

	public OnSearch(data: string) {
		this.searchText= data;
	}

	public addPageNavigation(){
		this.router.navigate([NavigationPaths.addEdit]);
	}

	ngOnDestroy(): void {
		this.toasterServ.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
