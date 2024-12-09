import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { RequestCancelCloseRequestService } from 'src/app/services/masters/request-cancel-close-request.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AdvanceSearchData, RQCCR, StatusUpdatePayload } from '../Interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { RqccrKeys, RqccrNavigationUrls, Status, ToastMessages } from '../Enums.enum';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid } from '@xrm-shared/models/common.model';

@Component({selector: 'app-reason-cancel-reason-list',
	templateUrl: './list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public entityId=XrmEntities.RequestCancelCloseReason;
	public pageSize = magicNumber.zero;
	public columnOptions:GridColumnCaption[] = [];
	public actionSet: IRecordButtonGrid[] = [];
	public bulkStatusData: StatusUpdatePayload[] = [];
	public selectTextsearch: string;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string ='req-cancel-close-all-paging';
	public advApiAddress: string ='req-cancel-close-advance-search-drpdwn';
	public appliedAdvFilters: AdvanceSearchData;
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
    private router: Router,
    public sector: SectorService,
    private toasterService: ToasterService,
    private gridService: GridViewService,
    private gridConfiguration: GridConfiguration,
    public requestCancelCloseRequestService: RequestCancelCloseRequestService

	) {}

	ngOnInit(): void {
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.unsubscribe$))
			.subscribe(([columnData, pageSize]) => {
				this.setColumnData(columnData);
				this.setPageSize(pageSize);
			});
		this.setActionSet();
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
    	this.unsubscribe$.complete();
	}

	public onGroupedAction(data: IBulkStatusUpdateAction):void {
		this.bulkStatusData = [];
		data.rowIds.forEach((a: string) => {
			this.bulkStatusData.push({
				uKey: a,
				disabled: data.actionName != Status.activate.toString()
			});
		});
		this.bulkUpdate();
	}

	private onActiveChange = (dataItem: RQCCR, action: string):void => {
		this.bulkStatusData = [];
		this.bulkStatusData.push({
			uKey: dataItem.uKey,
			disabled: action != Status.Activate.toString(),
			reasonForChange: RqccrKeys.EmptyString
		});
		this.bulkUpdate();
	};

	private bulkUpdate():void {
		if (this.bulkStatusData.length == Number(magicNumber.zero))
			return;
		this.requestCancelCloseRequestService.updateRequestCancelCloseRequestStatus(this.bulkStatusData)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<null>) => {
				if (res.Succeeded) {
					this.gridConfiguration.refreshGrid();
					if (this.bulkStatusData.length > Number(magicNumber.one) && this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.DeactivateAllCancelCloseReasonSuccess);
					} else if (this.bulkStatusData.length > Number(magicNumber.one) && !this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.ActivateAllCancelCloseReasonSuccess);
					} else if (this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.DeactivateCancelCloseReasonSuccess);
					} else if (!this.bulkStatusData[magicNumber.zero].disabled) {
						this.toasterService.showToaster(ToastOptions.Success, ToastMessages.ActivateCancelCloseReasonSuccess);
					}
					else {
						this.toasterService.showToaster(ToastOptions.Error, ToastMessages.Somethingwentwrong);
					}
				}
				else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
	}

	private onView = (dataItem: RQCCR):void => {
		this.router.navigate([`${RqccrNavigationUrls.View}${ dataItem.uKey}`]);
	};

	private onEdit = (dataItem: RQCCR):void => {
		this.router.navigate([`${RqccrNavigationUrls.AddEdit}${ dataItem.uKey}`]);
	};

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

	public tabOptions = {
		bindingField: Status.Disabled,
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

	public navigate():void {
		this.router.navigate([`${RqccrNavigationUrls.Add}`]);
	}

	public onFilterTriggered(appliedFilters: AdvanceSearchData):void {
		this.appliedAdvFilters = appliedFilters;
	}

	public onSearchTriggered(searchText: string) {
		this.selectTextsearch = searchText;
	}

	private setColumnData(res:GenericResponseBase<GridColumnCaption[]>):void {
		if (res.Succeeded && res.Data) {
			this.columnOptions = res.Data.map((e: GridColumnCaption):GridColumnCaption => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private setPageSize(res:GenericResponseBase<IPageSize>):void {
		if (res.Succeeded && res.Data) {
			const Data = res.Data;
			this.pageSize = Data.PageSize;
		}
	}

}
