import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { OrganizationLevelService } from '@xrm-master/organization-level/service/organization-level.service';
import { HttpStatusCode } from '@angular/common/http';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AdvanceSearchData, OrganizationLevel, StatusUpdatePayload } from '@xrm-master/organization-level/Interfaces/Interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ListApis, NavigationUrls, Status, ToastMessages } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public pageSize: number = magicNumber.ten;
	public entityId = XrmEntities.OrgLevel2;
	public columnOptions: GridColumnCaption[];
	public actionSet: IRecordButtonGrid[];
	public tabOptions: ITabOptions;
	public selectTextsearch: string;
	private bulkStatusData: StatusUpdatePayload[] = [];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = ListApis.Org2GetAll;
	public advApiAddress: string = ListApis.Org2AdvanceSearch;
	public appliedAdvFilters: AdvanceSearchData;
	private destroyAllSubscription$ = new Subject<void>();

	constructor(
    private gridService: GridViewService,
    private organizationLevelService: OrganizationLevelService,
    private gridConfiguration: GridConfiguration,
    private router: Router,
    private toasterService: ToasterService
	) {
	}

	ngOnInit(): void {
		this.setTabOptions();
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

	ngOnDestroy():void {
		this.toasterService.resetToaster();
		this.destroyAllSubscription$.next();
		this.destroyAllSubscription$.complete();
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

	private setTabOptions():void {
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
					favourableValue: Status.All,
					selected: false
				}
			]
		};
	}
	private setColumnData(data:GenericResponseBase<GridColumnCaption[]>):void {
		if (data.Succeeded && data.Data) {
			this.columnOptions = data.Data.map((e: GridColumnCaption) => {
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

	private onView = (dataItem: OrganizationLevel):void => {
		this.router.navigate([`${NavigationUrls.Org2View}${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: OrganizationLevel):void => {
		this.router.navigate([`${NavigationUrls.Org2Edit}${dataItem.UKey}`]);
	};

	public navigate():void {
		this.router.navigate([`${NavigationUrls.Org2Add}`]);
	}

	private onActiveChange = (dataItem: OrganizationLevel, action: string):void => {
		this.bulkStatusData = [];
		if (action == Status.Activate.toString()) {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				disabled: false
			});
		}
		else if (action == Status.Deactivate.toString()) {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				disabled: true
			});
		}
		this.bulkUpdate();
	};

	private bulkUpdate():void {
		this.organizationLevelService.updateOrgLvl2BulkStatus(this.bulkStatusData)
			.pipe(takeUntil(this.destroyAllSubscription$))
			.subscribe((res:GenericResponseBase<null>) => {
				if (res.Succeeded) {
					if (this.bulkStatusData.length > Number(magicNumber.one) && this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.MassOrgLevel2HasBeenDeactivated);
					} else if (this.bulkStatusData.length > Number(magicNumber.one) && !this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.MassOrgLevel2HasBeenActivated);
					} else if (this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel2HasBeenDeactivated);
					} else if (!this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel2HasBeenActivated);
					}
					this.gridConfiguration.refreshGrid();
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, "Somethingwentwrong");
				}
			});
	}

	public onGroupedAction(data: IBulkStatusUpdateAction | null):void {
		this.bulkStatusData = [];
		data?.rowIds.forEach((a: string) => {
			this.bulkStatusData.push({
				uKey: a,
				disabled: data.actionName != Status.activate.toString()
			});
		});
		this.bulkUpdate();
	}
	private setPageSize(data:GenericResponseBase<IPageSize>):void {
		if (data.StatusCode == Number(HttpStatusCode.Ok)) {
			const Data = data.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.zero;
		}
	}
}
