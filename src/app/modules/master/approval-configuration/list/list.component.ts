import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocationService } from 'src/app/services/masters/location.service';
import { NavigationPaths } from '../constant/routes.constant';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { SmartSearchService } from '@xrm-shared/services/smartsearch.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';
import { ActivateDeactivate, IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { DropDown, IDataItem } from '../constant/enum';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';


@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
	public actionSet: IRecordButtonGrid[];
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public tabOptions: ITabOptions;
	public massActivateDeactivate: ActivateDeactivate[];
	public entityId = XrmEntities.ApprovalConfiguration;
	public isServerSidePagingEnable: boolean = true;
	public apiUrlForGrid: string = "aprcnf/paged";
	public apiUrlForAdv: string = "aprcnf/select-paged";
	public searchText: string ='';
	public appliedAdvFilter:[];
	private ngUnsubscribe$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		public sector: SectorService,
		public location: LocationService,
		private gridConfiguration: GridConfiguration,
		private gridService: GridViewService,
		private loaderService: LoaderService,
		public approvalConfigService: ApprovalConfigurationGatewayService,
		public smartSearchService: SmartSearchService,
		public toasterServc:ToasterService,
    	private activatedroute: ActivatedRoute,
		public permissionService: PermissionsService
	) {
	}

	ngOnInit(): void {
		this.getActionSet();
		this.getTabOptions();
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: Params) => {
			this.permissionService.permission = data['permission'];
			this.getActionSet();
		});
		this.callColumnAndPageData();
	}

	private callColumnAndPageData() {
		this.loaderService.setState(true);

		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.ngUnsubscribe$)),
			pageSize: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.ngUnsubscribe$))
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

	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}

	public onFilter(filteredData: []) {
		this.appliedAdvFilter = filteredData;
	}


	private onView = (dataItem:IDataItem) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	public onEdit = (dataItem: IDataItem) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
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

	public navigate() {
		this.router.navigate([`${NavigationPaths.addEdit}`]);
	}

	public getTabOptions() {
		this.tabOptions = {
			bindingField: DropDown.Disabled,
			tabList: [
				{
					tabName: DropDown.Active,
					favourableValue: false,
					selected: true
				},
				{
					tabName: DropDown.Inactive,
					favourableValue: true
				},
				{
					tabName: DropDown.All,
					favourableValue: DropDown.All
				}
			]
		};
	}

	private onActivateDeactivateAction = (dataItem: IDataItem) => {
		this.massActivateDeactivate = [];
		const approvalData = {
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: null
		};
		this.massActivateDeactivate.push(approvalData);
		this.activateDeactivateApprovalConfiguration();
	};

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		const massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate",
				ReasonForChange: ''
			}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivateApprovalConfiguration();
	}

	private activateDeactivateApprovalConfiguration() {
		this.approvalConfigService.updateApprovalConfigurationStatus(this.massActivateDeactivate)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res:ApiResponseBase) => {
				 if (!res.Succeeded) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					return;
				}

				if (this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'ApprovalConfigurationDeactivatedSuccessfully');

				} else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'ApprovalConfigurationActivatedSuccessfully');
				}

				if (this.massActivateDeactivate.length > Number(magicNumber.one) && this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedApprovalConfigurationHasBeenDeActivatedSuccessfully');
				}
				else if (this.massActivateDeactivate.length > Number(magicNumber.one) && !this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedApprovalConfigurationHasBeenActivatedSuccessfully');
				}
				this.gridConfiguration.refreshGrid();
			});
	}

	ngOnDestroy(): void {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}

}
