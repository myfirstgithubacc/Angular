import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ActivateDeactivateData, SAdata, Status } from '../constant/status-enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { StaffingAgencyGatewayService } from 'src/app/services/masters/staffing-agency-gateway.service';
import { forkJoin, Subject, takeUntil} from 'rxjs';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBulkStatusUpdateAction, IPermission, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { SelectedAdvanceFilter } from '@xrm-shared/models/manage-advance-filter.model';


@Component({selector: 'app-list-staffing-agency',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'staf/paged';
	public advApiAddress: string = 'staf/select-paged';
	public tabOptions: ITabOptions;
	public entityId = XrmEntities.StaffingAgency;
	public pageSize: number;
	public searchText: string;
	public appliedAdvFilters: SelectedAdvanceFilter;
	public selectedStaffingAgency: ActivateDeactivateData;
	public massActivateDeactivate: ActivateDeactivateData[];
	public actionSet: IRecordButtonGrid[];
	public columnOptions: GridColumnCaption[];
	public multiselect: boolean = false;
	private ngUnsubscribe$ = new Subject<void>();
	public permission : IPermission[];

	// eslint-disable-next-line max-params
	constructor(
		public sector: SectorService,
		public permissionService: PermissionsService,
		private gridConfiguration: GridConfiguration,
		private router: Router,
		private loaderService: LoaderService,
		private gridService: GridViewService,
		private toasterServc: ToasterService,
		private activatedroute: ActivatedRoute,
		private staffingGatewayServc: StaffingAgencyGatewayService
	) {
	}

	ngOnInit(): void {
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: Params) => {
			this.permissionService.permission = data['permission'];
			this.permission = data['permission'];
			console.log("this.permission",		this.permissionService.permission );
			this.getActionSet();
		});
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

	private getTabOptions() {
		this.tabOptions = {
			bindingField: dropdown.Status,
			tabList: [
				{
					tabName: dropdown.Active,
					favourableValue: Status.Active,
					selected: true
				},
				{
					tabName: dropdown.Probation,
					favourableValue: Status.Probation
				},
				{
					tabName: dropdown.Inactive,
					favourableValue: Status.InActive

				},
				{
					tabName: dropdown.Potential,
					favourableValue: Status.Potential

				},
				{
					tabName: dropdown.All,
					favourableValue: dropdown.All
				}
			]
		};
	}

	private getActionSet() {
		this.actionSet = [
			{
				Status: magicNumber.eightyOne,
				Items: this.gridConfiguration.
					showAllActionIcon(this.onView, this.onEdit, this.onActivateDeactivateAction)
			},
			{
				Status: magicNumber.eightyTwo,
				Items: this.gridConfiguration.
					showAllActionIcon(this.onView, this.onEdit, this.onActivateDeactivateAction)
			},
			{
				Status: magicNumber.eightyThree,
				Items: this.gridConfiguration.showViewEditIcon(this.onView, this.onEdit)
			},
			{
				Status: magicNumber.eighty,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			}
		];
	}


	private activateDeactivateStaffingAgency(dataItem:ActivateDeactivateData[]) {
		this.staffingGatewayServc.activateDeactivateStaffingAgency(this.massActivateDeactivate)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
				if (res.Succeeded) {
					this.gridConfiguration.refreshGrid();
					if (dataItem.length > Number(magicNumber.one) &&
						dataItem[magicNumber.zero].Disabled) {
						this.toasterServc.showToaster(ToastOptions.Success, "SelectedStaffingAgencyDeactivatedSuccessfully");
					} else if (dataItem.length > Number(magicNumber.one) &&
						!dataItem[magicNumber.zero].Disabled) {
						this.toasterServc.showToaster(ToastOptions.Success, "SelectedStaffingAgencyActivatedSuccessfully");
					} else if (dataItem[magicNumber.zero].StaffingAgencyStatusId == Status.InActive ||
						 !this.massActivateDeactivate[magicNumber.zero].Disabled) {
						this.toasterServc.showToaster(ToastOptions.Success, "StaffingAgencyActivatedSuccessfully");
					} else if (dataItem[magicNumber.zero].StaffingAgencyStatusId == Status.Active ||
						 this.massActivateDeactivate[magicNumber.zero].Disabled) {
						this.toasterServc.showToaster(ToastOptions.Success, "StaffingAgencyDeactivatedSuccessfully");
					} else if (dataItem[magicNumber.zero].StaffingAgencyStatusId == Status.Probation ||
						 this.massActivateDeactivate[magicNumber.zero].Disabled) {
						this.toasterServc.showToaster(ToastOptions.Success, "StaffingAgencyDeactivatedSuccessfully");
					}
					else {
						this.toasterServc.showToaster(ToastOptions.Error, "Somethingwentwrong");
					}
				}
			});
	}


	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		const massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate",
				ReasonForChange: null
			}));
		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivateStaffingAgency(this.massActivateDeactivate);
	}

	private onActivateDeactivateAction = (dataItem: ActivateDeactivateData) => {
		this.massActivateDeactivate = [];
		this.selectedStaffingAgency = dataItem;
		const staffingAgencyData = {
			UKey: dataItem.UKey,
			Disabled: (dataItem.StaffingAgencyStatusId == Number(Status.Active)
				|| dataItem.StaffingAgencyStatusId == Number(Status.Probation)),
			ReasonForChange: null
		};
		this.massActivateDeactivate.push(staffingAgencyData);
		this.activateDeactivateStaffingAgency([this.selectedStaffingAgency]);
	};

	private onView = (dataItem: SAdata) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: SAdata) => {
		this.router.navigate([`${NavigationPaths.addedit}/${dataItem.UKey}`]);
	};

	public navigate() {
		this.router.navigate([`${NavigationPaths.addedit}`]);
	}

	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}
	public onFilterTriggered(appliedFilters: SelectedAdvanceFilter) {
		this.appliedAdvFilters = appliedFilters;
	}

	private getColumnData(res:GenericResponseBase<GridColumnCaption[]>) {
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


	private getPageSize(res:GenericResponseBase<{PageSize : number}>) {
		this.loaderService.setState(true);
		this.loaderService.setState(false);
		if (res.StatusCode == Number(HttpStatusCode.Ok) && res.Data)
			this.pageSize = res.Data.PageSize;
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}

