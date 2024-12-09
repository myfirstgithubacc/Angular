import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subject, forkJoin, takeUntil} from 'rxjs';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { NavigationPaths } from '../route-constants/routes-constant';
import { Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { JobCategoryService } from 'src/app/services/masters/job-category.service';
import { JobCategory, RecordStatusChangeResponse} from '@xrm-core/models/job-category.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {

	public entityId = XrmEntities.JobCategory;
	public pageSize: number = magicNumber.zero;
	public apiAddress: string = 'jcat/paged';
	public advApiAddress: string = 'jcat/select-paged';
	public isServerSidePagingEnable: boolean = true;
	public advFilterData: JobCategory[] = [];
	public searchText: string;
	private destroyAllSubscribtion$ = new Subject<void>();
	public columnOptions : GridColumnCaption[] = [];
	private jobCategoryLabelTextParams: DynamicParam[] = [{ Value: 'JobCategorySmall', IsLocalizeKey: true }];

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

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private jobCategoryService: JobCategoryService,
		private gridService: GridViewService,
		private toasterService: ToasterService,
		private gridConfiguration: GridConfiguration
	) {
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

	private getColumnData(res : GenericResponseBase<GridColumnCaption[]>) {
		if(!isSuccessfulResponse(res)) return;

		this.columnOptions = res.Data.map((event: GridColumnCaption) => {
			event.fieldName = event.ColumnName;
			event.columnHeader = event.ColumnHeader;
			event.visibleByDefault = event.SelectedByDefault;
			return event;
		});
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (!res.Succeeded || !res.Data) return;
		this.pageSize = res.Data.PageSize;
	}

	public OnFilter(filteredData: JobCategory[]) {
		this.advFilterData = filteredData;
	}

	public OnSearch(list: string) : void {
		this.searchText = list;
	}

	private ActivateDeactivateJobCategory(dataItem: string[], status: boolean) {

		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				ukey: item,
				disabled: status,
				reasonForChange: ''
			}));

		this.jobCategoryService.deleteJobCategory(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.jobCategoryLabelTextParams);
			this.gridConfiguration.refreshGrid();
		});
	}

	private onActiveChange = (dataItem: JobCategory) => {
		if (dataItem.UKey) {
			const a: string[] = [dataItem.UKey];
			this.ActivateDeactivateJobCategory(a, !dataItem.Disabled);
		}
	};

	private onView = (dataItem: JobCategory) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	public navigateTOAdd() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private onEdit = (dataItem: JobCategory) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public actionSet :IActionSetModel[] = [
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

	public generateFileName(){
		const newDate = new Date(),
			uniqueDateCode = `${this.calculateDate(newDate.getMonth() + magicNumber.one) +
		this.calculateDate( newDate.getDate()) + newDate.getFullYear().toString() }_${ this.calculateDate( newDate.getHours() )
			}${this.calculateDate( newDate.getMinutes() ) }${this.calculateDate( newDate.getSeconds() )}`,
		 fileName = `Job Category_${uniqueDateCode}`;

		return fileName;
	}

	public calculateDate(val: number): string {
		return val < Number(magicNumber.ten)
			? `0${val}`
			: val.toString();
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}

