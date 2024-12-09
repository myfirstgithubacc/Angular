import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NavigationPaths } from '../constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { CandidateSelectionReasonService } from '../services/candidate-selection-reason.service';
import { forkJoin, Observable } from 'rxjs';
import { IBulkStatusUpdateAction, IPageSize, IPermissionInfo, IRecordButtonGrid, IRecordStatusChangePayload, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ISelectionReasonUkeyData, IFilterControlData } from '@xrm-core/models/candidate-selection-reason/candidate-selection-reason.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { ApiUrl } from '../constant/apiUrl-constant';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

	public entityId: XrmEntities = XrmEntities.CandidateSelectionReason;
	public columnOptions: GridColumnCaption[] = [];
	public actionSet: IRecordButtonGrid[] = [];
	public tabOptions: ITabOptions;
	public pageSize: number = magicNumber.zero;
	private massActivateDeactivate: IRecordStatusChangePayload[] = [];
	private permissionArray: IPermissionInfo[] = [];
	public canCreate: boolean = false;
	public apiAddress: string = ApiUrl.ListApiAddress;
	public advApiAddress: string = ApiUrl.AdvApiAddress;
	public searchText: string = '';
	public appliedAdvFilters: IFilterControlData;

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private gridConfigurationServ: GridConfiguration,
		private toasterService: ToasterService,
		private gridService: GridViewService,
		public activatedRoute: ActivatedRoute,
		private canSelectRsnService: CandidateSelectionReasonService,
		private gridConfiguration: GridConfiguration,
		private cdr: ChangeDetectorRef,
		private destroyRef: DestroyRef
	) { }

	ngOnInit(): void {
		this.getPermissionSet();
		this.fetchInitialData();
		this.getActionSet();
		this.getTabOption();
		this.destroyRef.onDestroy(() =>
			this.toasterService.resetToaster());
	}

	private fetchInitialData(): void {
		forkJoin({
			columnData: this.getColumnData(),
			pageSizeData: this.getPageSizeData()
		}).pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(({ columnData, pageSizeData }) => {
				this.processColumnData(columnData);
				this.processPageSizeData(pageSizeData);
				this.cdr.markForCheck();
			});
	}

	private getColumnData(): Observable<GenericResponseBase<GridColumnCaption[]>> {
		return this.gridService.getColumnOption(this.entityId);
	}

	private getPageSizeData(): Observable<GenericResponseBase<IPageSize>> {
		return this.gridService.getPageSizeforGrid(this.entityId);
	}


	private processColumnData(res: GenericResponseBase<GridColumnCaption[]>): void {
		if (!res.Succeeded || !res.Data) return;
		this.columnOptions = res.Data.map((e: GridColumnCaption) => {
			e.fieldName = e.ColumnName;
			e.columnHeader = e.ColumnHeader;
			e.visibleByDefault = e.SelectedByDefault;
			return e;
		});
	}

	private processPageSizeData(res: GenericResponseBase<IPageSize>): void {
		if (!res.Succeeded || !res.Data) return;
		this.pageSize = res.Data.PageSize;
	}

	private getPermissionSet(): void {
		this.activatedRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param: Params) => {
			this.permissionArray = param['permission'];
		});
		this.permissionArray.forEach((x: IPermissionInfo) => {
			this.canCreate = x.ActionId === Number(Permission.CREATE_EDIT__CREATE)
				? true
				: this.canCreate;
		});
	}

	private getActionSet(): void {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfigurationServ.showAllActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfigurationServ.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			}
		];
	}

	private onActivateDeactivateAction = (dataItem: ISelectionReasonUkeyData): void => {
		this.massActivateDeactivate = [
			{
				UKey: dataItem.UKey,
				Disabled: !dataItem.Disabled
			}
		];
		this.activateDeactivateSelectionReason();
	};

	private getTabOption(): void {
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

	private activateDeactivateSelectionReason = (): void => {
		this.canSelectRsnService.updateCanselectRsnStatus(this.massActivateDeactivate)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((res) => {
				this.handleResponse(res);
			});
	};

	private handleResponse(res: ApiResponseBase): void {
		this.toasterService.resetToaster();
		if (!res.Succeeded) {
			this.toasterService.showToaster(ToastOptions.Error, 'Somethingwentwrong');
			return;
		}

		const isMultiple = this.massActivateDeactivate.length > Number(magicNumber.one),
			isDisabled = this.massActivateDeactivate[magicNumber.zero].Disabled,
			message = this.getSuccessMessage(isMultiple, isDisabled);

		this.toasterService.showToaster(ToastOptions.Success, message);
		this.gridConfiguration.refreshGrid();
	}

	private getSuccessMessage(isMultiple: boolean, isDisabled: boolean): string {
		const baseMessage = isMultiple
				? "Csrs"
				: "Csr",
			action = isDisabled
				? "Deactivated"
				: "Activated";
		return `${baseMessage}${action}Successfully`;
	}

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction): void {
		this.massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate"
			}));

		this.activateDeactivateSelectionReason();
	}

	public navigateToAdd(): void {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	public onSearch(data: string): void {
		this.searchText = data;
	}

	public onFilter(list: IFilterControlData): void {
		this.appliedAdvFilters = list;
	}

	private onView = (dataItem: ISelectionReasonUkeyData): void => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: ISelectionReasonUkeyData): void => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};
}
