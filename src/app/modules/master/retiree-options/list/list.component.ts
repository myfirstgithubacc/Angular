import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { RetireeoptionsService } from 'src/app/services/masters/retiree-options.service';
import { ActivateDeactivateModel } from '@xrm-core/models/retiree-option.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ActivateDeactivate, OnViewDataItem, ActivateDeactivateData, dropdown, AdvanceSearchFilter, ActionSetItem, TabOptions } from '../constant/retiree.enum';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { IBulkStatusUpdateAction } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';


@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public actionSet: ActionSetItem[];
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public tabOptions: TabOptions;
	public massActivateDeactivate: ActivateDeactivate[];
	private ngUnsubscribe$ = new Subject<void>();
	public entityId = XrmEntities.RetireeOption;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'rtopn/paged';
	public advApiAddress: string = 'rtopn/select-paged';
	public searchText: string;
	public selectedRetiree: ActivateDeactivateData;
	public appliedAdvFilters: AdvanceSearchFilter;
	// eslint-disable-next-line max-params
	constructor(
		public retireeOptServc: RetireeoptionsService,
		private loaderService: LoaderService,
		private toasterServc: ToasterService,
		public permissionService: PermissionsService,
		private gridConfiguration: GridConfiguration,
		private router: Router,
		private gridService: GridViewService
	) {
	}


	ngOnInit(): void {
		this.getActionSet();
		this.getTabOptions();
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(([firstresponse, secondresponse]) => {
			this.getColumnData(firstresponse);
			this.getPageSize(secondresponse);

		});
	}

	private onView = (dataItem: OnViewDataItem) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: OnViewDataItem) => {
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

	private getColumnData(res: GenericResponseBase<GridColumnCaption[]>) {
		this.loaderService.setState(true);
		if (res.Succeeded && res.Data) {
			this.loaderService.setState(false);
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		} else {
			this.loaderService.setState(false);
		}
	}

	private getPageSize(res: GenericResponseBase<{ PageSize: number }>) {
		this.loaderService.setState(true);
		this.loaderService.setState(false);
		if (res.StatusCode == Number(HttpStatusCode.Ok) && res.Data)
			this.pageSize = res.Data.PageSize;
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

	public onFilterTriggered(appliedFilters: AdvanceSearchFilter) {
		this.appliedAdvFilters = appliedFilters;
	}

	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		const massActivateDeactivate = event.rowIds.map((dt: string) =>
		({
			UKey: dt,
			Disabled: event.actionName === "deactivate",
			ReasonForChange: null
		}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivateRetireOption();
	}

	private onActivateDeactivateAction = (dataItem: ActivateDeactivateData, action: string) => {
		this.massActivateDeactivate = [];
		this.selectedRetiree = dataItem;
		const Data = new ActivateDeactivateModel({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: ''
		});
		this.massActivateDeactivate.push(Data);
		if (action == 'Activate' || action == 'Deactivate') {
			this.activateDeactivateRetireOption();
		}
	};

	private activateDeactivateRetireOption() {
		this.retireeOptServc.updateRetireeOptionStatus(this.massActivateDeactivate).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: ApiResponse) => {
				if (!res.Succeeded) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					return;
				}
				if (this.massActivateDeactivate[0].Disabled) {
					this.toasterServc.resetToaster();
					if (this.massActivateDeactivate.length > Number(magicNumber.one)) {
						this.toasterServc.showToaster(ToastOptions.Success, 'SelectedRetireeOptDeactivatedSuccessfully');
					} else {
						this.toasterServc.showToaster(ToastOptions.Success, 'RetireeOptDeactivatedSuccessfully');
					}
				} else {
					this.toasterServc.resetToaster();
					if (this.massActivateDeactivate.length > Number(magicNumber.one)) {
						this.toasterServc.showToaster(ToastOptions.Success, 'SelectedRetireeOptActivatedSuccessfully');
					} else {
						this.toasterServc.showToaster(ToastOptions.Success, 'RetireeOptActivatedSuccessfully');
					}
				}
				this.gridConfiguration.refreshGrid();
			});
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

}
