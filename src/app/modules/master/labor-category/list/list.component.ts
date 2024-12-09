import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { LaborCategory } from '@xrm-core/models/labor-category.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';
import { dropdown } from '../constant/dropdown-constant';
import { NavigationPaths } from '../constant/routes-constant';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IUkeyDataItem } from '../enum/enums';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';


@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public actionSet: IRecordButtonGrid[];
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public tabOptions: ITabOptions;
	public massActivateDeactivate: ActivateDeactivate[];
	public entityId = XrmEntities.LaborCategory;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'lcat/paged';
	public advApiAddress: string = 'lcat/select-paged';
	public searchText: string;
	public appliedAdvFilters: [];
	public exportApiAddress = "lcat/exp-data";
	private ngUnsubscribe = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private loaderService: LoaderService,
		private gridService: GridViewService,
		private toasterServc: ToasterService,
		private gridConfiguration: GridConfiguration,
		public permissionService: PermissionsService,
		private laborCategoryServc: LaborCategoryService
	) {
	}


	ngOnInit(): void {
		this.callColumnAndPageData();
		this.getActionSet();
		this.getTabOptions();

	}

	private callColumnAndPageData() {
		this.loaderService.setState(true);

		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.ngUnsubscribe)),
			pageSize: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.ngUnsubscribe))
		}).subscribe({
			next: (results: { columnData: GenericResponseBase<GridColumnCaption[]>, pageSize: GenericResponseBase<IPageSize> }) => {
				this.processColumnData(results.columnData);
				this.processPageSize(results.pageSize);
				this.loaderService.setState(false);
			},
			error: () => {
				this.loaderService.setState(false);
			}
		});
	}

	private processColumnData(columnData: GenericResponseBase<GridColumnCaption[]>) {
		if (isSuccessfulResponse(columnData)) {
			this.columnOptions = columnData.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private processPageSize(pageSize: GenericResponseBase<IPageSize>) {
		if (pageSize.StatusCode === Number(HttpStatusCode.Ok) && pageSize.Data) {
			this.pageSize = pageSize.Data.PageSize;
		}
	}

	private onView = (dataItem: IUkeyDataItem) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: IUkeyDataItem) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit, this.onActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			}
		];
	}


	public getTabOptions() {
		this.tabOptions = {
			bindingField: dropdown.Disabled,
			tabList: [
				{
					tabName: dropdown.Active,
					favourableValue: false,
					selected: true
				},
				{
					tabName: dropdown.Inactive,
					favourableValue: true
				},
				{
					tabName: dropdown.All,
					favourableValue: dropdown.All
				}
			]
		};
	}


	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}


	public onFilterTriggered(appliedFilters: []) {
		this.appliedAdvFilters = appliedFilters;
	}


	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}


	private onActivateDeactivateAction = (dataItem: IUkeyDataItem) => {
		this.massActivateDeactivate = [];
		const Data = new LaborCategory({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: ''
		});
		this.massActivateDeactivate.push(Data);
		this.activateDeactivateLaborCategory();
	};

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		const massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate",
				ReasonForChange: ''
			}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivateLaborCategory();
	}

	private activateDeactivateLaborCategory() {
		this.laborCategoryServc.updateLaborCategoryStatus(this.massActivateDeactivate).pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((res: ApiResponseBase) => {
				if (!res.Succeeded) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					return;
				}

				if (this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'LaborCategoryDeactivatedSuccessfully');

				} else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'LaborCategoryActivatedSuccessfully');
				}

				if (this.massActivateDeactivate.length > Number(magicNumber.one) && this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedLaborCategoryDeactivatedSuccessfully');
				}
				else if (this.massActivateDeactivate.length > Number(magicNumber.one) && !this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedLaborCategoryActivatedSuccessfully');
				}
				this.gridConfiguration.refreshGrid();
			});
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
