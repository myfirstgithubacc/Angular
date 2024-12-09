import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SectorService } from 'src/app/services/masters/sector.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { Subject, Subscription, forkJoin, takeUntil } from 'rxjs';
import { RoleServices } from '../services/role.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { Router } from '@angular/router';
import { GroupActionDetails, PageSizeResponse, Role, Status, gridActionSet } from '../Generictype.model';
import { NavigationPaths } from '../constatnt/route';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public pageSize:number = magicNumber.zero;
	private bulkStatusData: Status[] = [];
	public entityId: number = magicNumber.fifteen;
	public activateDeactivateSubscription: Subscription;
	public dialogPopUpServicesSubscription: Subscription;
	public selectTextsearch: string;
	public actionSet: gridActionSet[];
	public columnOptions:GridColumnCaption[] = [];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string ='role-all-paging';
	public advApiAddress: string ='role/select-advance-search';
	public appliedAdvFilters: [];
	private unsubscribe$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
    private router: Router,
    public sector: SectorService,
    public roleServices: RoleServices,
    private gridService: GridViewService,
    private gridConfiguration: GridConfiguration,
    private toasterService: ToasterService
	) {}

	ngOnInit(): void {
		this.setActionSet();
		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.unsubscribe$)),
			pageSizeData: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.unsubscribe$))
		}).subscribe({
			next: ({ columnData, pageSizeData }) => {
				this.getColumnData(columnData);
				this.getPageSize(pageSizeData);
			},
			error: (err) => {
			}
		});
	}

	private setActionSet(){
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit,
					this.onActiveChange
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

	public OnFilterTriggered(appliedFilters: []) {
		this.appliedAdvFilters = appliedFilters;
	}

	public OnSearchTriggered(searchText: string) {
		this.selectTextsearch = searchText;
	}


	private bulkUpdate() {
		if (this.bulkStatusData.length == Number(magicNumber.zero))
			return;
		this.roleServices.activateRoleAndDeactivate(this.bulkStatusData).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponseBase) => {
			if (res.Succeeded) {
				this.gridConfiguration.refreshGrid();
				let message = "Somethingwentwrong";
				const isMultiple = this.bulkStatusData.length > Number(magicNumber.one),
				 isDisabled = this.bulkStatusData[0].disabled;
				if (isMultiple) {
				  message = isDisabled
						? "MassRoleHasBeenDeactivated"
						: "MassRoleHasBeenActivated";
				} else {
				  message = isDisabled
						? "RoleHasBeenDeactivated"
						: "RoleHasBeenActivated";
				}
				this.toasterService.showToaster(ToastOptions.Success, message);
			  }
			else {
				const errorMessage:string = (res.StatusCode === Number(magicNumber.fourHundredThree))
					? res.Message ?? 'Somethingwentwrong'
					: 'Somethingwentwrong';
				this.toasterService.showToaster(ToastOptions.Error, errorMessage);
			}
		});
	}

	public onGroupedAction(data: GroupActionDetails) {
		this.bulkStatusData = [];
		data?.rowIds?.forEach((a: string) => {
			this.bulkStatusData.push({
				uKey: a,
				disabled: data.actionName !== 'activate'
			});
		});
		this.bulkUpdate();
	}

	private onActiveChange = (dataItem: Role, action: string) => {
		this.bulkStatusData = [];
		if (action == 'Activate') {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				disabled: false
			});
		}
		else if (action == 'Deactivate') {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				disabled: true,
				reasonForChange: ''
			});
		}
		this.bulkUpdate();
	};


	private onView = (dataItem: Role) => {
		this.router.navigate([`${NavigationPaths.view}/${ dataItem.UKey}`]);
	};

	onEdit = (dataItem: Role) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	private getColumnData(data:GenericResponseBase<GridColumnCaption[]>) {
		if (data.Succeeded && data.Data) {
			this.columnOptions = data.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private getPageSize(data:PageSizeResponse) {
		if (data.StatusCode == Number(HttpStatusCode.Ok)) {
			const Data = data.Data;
			this.pageSize = Data.PageSize;
		}
	}

	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	public tabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: 'Active',
				favourableValue: false,
				selected: true
			},
			{
				tabName: 'Inactive',
				favourableValue: true,
				selected: false

			},
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: false
			}
		]
	};

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}

