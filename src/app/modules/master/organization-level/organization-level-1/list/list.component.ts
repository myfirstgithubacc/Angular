import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { OrganizationLevelService } from '@xrm-master/organization-level/service/organization-level.service';
import { HttpStatusCode } from '@angular/common/http';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ListApis, NavigationUrls, RequiredStrings, Status, ToastMessages } from '@xrm-master/organization-level/Constants/OrgLevels.enum';
import { AdvanceSearchData, OrganizationLevel, StatusUpdatePayload } from '@xrm-master/organization-level/Interfaces/Interface';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';


@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public pageSize: number = magicNumber.ten;
	public entityId: number = XrmEntities.OrgLevel1;
	public columnOptions: GridColumnCaption[];
	private bulkStatusData: StatusUpdatePayload[] = [];
	public selectTextsearch: string = RequiredStrings.EmptyString;
	public tabOptions: ITabOptions;
	public actionSet: IRecordButtonGrid[];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = ListApis.Org1GetAll;
	public advApiAddress: string = ListApis.Org1AdvanceSearch;
	public appliedAdvFilters: AdvanceSearchData;
	private destroyAllSubscription$ = new Subject<void>();

	constructor(
    private router: Router,
    private toasterService: ToasterService,
    private gridConfiguration: GridConfiguration,
    private organizationLevelService: OrganizationLevelService,
    private gridService: GridViewService
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

	private onView = (dataItem: OrganizationLevel):void => {
		this.router.navigate([`${NavigationUrls.Org1View}${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: OrganizationLevel):void => {
		this.router.navigate([`${NavigationUrls.Org1Edit}${dataItem.UKey}`]);
	};

	public navigate():void {
		this.router.navigate([`${NavigationUrls.Org1Add}`]);
	}

	public onFilterTriggered(appliedFilters: AdvanceSearchData):void {
		this.appliedAdvFilters = appliedFilters;
	}

	public onSearchTriggered(searchText: string):void {
		this.selectTextsearch = searchText;
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

	private bulkUpdate():void {
		this.organizationLevelService.updateOrgLvl1BulkStatus(this.bulkStatusData)
			.pipe(takeUntil(this.destroyAllSubscription$))
			.subscribe((res: GenericResponseBase<null>) => {
				if (res.Succeeded) {
					this.gridConfiguration.refreshGrid();
					if (this.bulkStatusData.length > Number(magicNumber.one) && this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.MassOrgLevel1HasBeenDeactivated);
					} else if (this.bulkStatusData.length > Number(magicNumber.one) && !this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.MassOrgLevel1HasBeenActivated);
					} else if (this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel1HasBeenDeactivated);
					} else if (!this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.OrgLevel1HasBeenActivated);
					}
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
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
				disabled: true,
				reasonForChange: RequiredStrings.EmptyString
			});
		}
		this.bulkUpdate();
	};

	private setTabOptions():void {
		this.tabOptions = {
			bindingField: Status.Disabled,
			selectedTabKey: 'org-level-1',
			tabList: [
				{
					tabName: Status.Active,
					favourableValue: false,
					selected: true
				},
				{
					tabName: Status.Inactive,
					favourableValue: true,
					selected: false
				},
				{
					tabName: Status.All,
					favourableValue: Status.All,
					selected: false
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

	private setPageSize(data:GenericResponseBase<IPageSize>):void {
		if (data.StatusCode == Number(HttpStatusCode.Ok)) {
			const Data = data.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.zero;
		}
	}


}
