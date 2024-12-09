import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { OrganizationLevelService } from '@xrm-master/organization-level/service/organization-level.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AdvanceSearchData, OrganizationLevel, StatusUpdatePayload } from '@xrm-master/organization-level/Interfaces/Interface';
import { ListApis, NavigationUrls, Status, ToastMessages } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public pageSize: number = magicNumber.ten;
	public entityId: number = magicNumber.six;
	public columnOptions: GridColumnCaption[];
	public actionSet: IRecordButtonGrid[];
	public tabOptions: ITabOptions;
	public selectTextsearch: string;
	private bulkStatusData: StatusUpdatePayload[] = [];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = ListApis.Org4GetAll;
	public advApiAddress: string = ListApis.Org4AdvanceSearch;
	public appliedAdvFilters: AdvanceSearchData;
	private destroyAllSubscription$ = new Subject<void>();

	constructor(
    private router: Router,
    private organizationServie: OrganizationLevelService,
    private toasterService: ToasterService,
    private gridService: GridViewService,
    private gridConfiguration: GridConfiguration
	) {}

	ngOnInit(): void {
		this.setTapOptions();
		this.setActionSet();
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.destroyAllSubscription$))
			.subscribe(([columnData, pageSize]) => {
				this.setColumnData(columnData);
				this.setPageSize(pageSize);
			});
	}

	private setTapOptions():void {
		this.tabOptions = {
			bindingField: Status.Disabled,
			tabList: [
				{
					tabName: Status.Active,
					favourableValue: false,
					selected: true
				},
				{
					tabName: Status.Inactive,
					favourableValue: true
				},
				{
					tabName: Status.All,
					favourableValue: Status.All
				}
			]
		};
	}

	private setActionSet():void {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit, this.onActiveChange
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActiveChange
				)
			}
		];
	}

	ngOnDestroy():void {
		this.toasterService.resetToaster();
		this.destroyAllSubscription$.next();
		this.destroyAllSubscription$.complete();
	}

	private setColumnData(res:GenericResponseBase<GridColumnCaption[]>):void {
		if (res.Succeeded && res.Data) {
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	public OnFilterTriggered(appliedFilters: AdvanceSearchData):void {
		this.appliedAdvFilters = appliedFilters;
	}
	public OnSearchTriggered(searchText: string):void {
		this.selectTextsearch = searchText;
	}

	private bulkUpdate():void {
		this.organizationServie.updateOrgLvl4BulkStatus(this.bulkStatusData)
			.pipe(takeUntil(this.destroyAllSubscription$)).subscribe((res: GenericResponseBase<null>) => {
				if (res.Succeeded) {
					if (this.bulkStatusData.length > Number(magicNumber.one) && this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.MassOrgLevel4HasBeenDeactivated);
					} else if (this.bulkStatusData.length > Number(magicNumber.one) && !this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.MassOrgLevel4HasBeenActivated);
					} else if (this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel4HasBeenDeactivated);
					} else if (!this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel4HasBeenActivated);
					}
					this.gridConfiguration.refreshGrid();
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
	}

	public onGroupedAction(data: IBulkStatusUpdateAction|null):void {
		this.bulkStatusData = [];
		data?.rowIds.forEach((a: string) => {
			this.bulkStatusData.push({
				uKey: a,
				disabled: data.actionName != Status.activate.toString()
			});
		});
		this.bulkUpdate();
	}
	private onView = (dataItem: OrganizationLevel):void => {
		this.router.navigate([`${NavigationUrls.Org4View}${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: OrganizationLevel):void => {
		this.router.navigate([`${NavigationUrls.Org4Edit}${dataItem.UKey}`]);
	};

	private onActiveChange = (dataItem: OrganizationLevel, action: string):void => {
		this.bulkStatusData = [];
		if (action == Status.Activate.toString()) {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				disabled: false
			});
		} else if (action == Status.Deactivate.toString()) {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				disabled: true
			});
		}
		this.bulkUpdate();
	};

	public navigate():void {
		this.router.navigate([`${NavigationUrls.Org4Add}`]);
	}
	private setPageSize(res:GenericResponseBase<IPageSize>):void {
		if (res.Succeeded && res.Data) {
			const Data = res.Data;
			this.pageSize = Data.PageSize;
		}
	}
}
