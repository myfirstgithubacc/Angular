import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LocationService } from '../services/location.service';
import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { NavigationPaths } from '../constant/routes-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { LocationRowData } from '@xrm-core/models/location/location.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public entityId: number = XrmEntities.Location;
	public pageSize: number = magicNumber.zero;
	public isServerSidePagingEnable: boolean = true;
	public columnOptions: GridColumnCaption[] = [];
	private massActivateDeactivate: IRecordStatusChangePayload[] = [];
	public actionSet: IRecordButtonGrid[];
	public appliedAdvFilters: [];
	public searchText: string;
	public apiAddress: string = 'loc/paged';
	public advApiAddress: string = 'loc/select-paged';
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
				favourableValue: true
			},
			{
				tabName: 'All',
				favourableValue: 'All'
			}
		]
	};

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private gridConfiguration: GridConfiguration,
		private gridViewService: GridViewService,
		private locationService: LocationService,
		private toasterService: ToasterService
	) { }

	ngOnInit(): void {
		this.handleGridData();
		this.getActionSet();
	}

	private handleGridData(): void {
		forkJoin({
			columnData: this.getColumnData(),
			pageSizeData: this.getPageSizeData()
		}).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe(({ columnData, pageSizeData }) => {
				this.getColumnNames(columnData);
				this.processPageSizeData(pageSizeData);
			});
	}

	private getColumnData(): Observable<GenericResponseBase<GridColumnCaption[]>> {
		return this.gridViewService.getColumnOption(this.entityId);
	}

	private getPageSizeData(): Observable<GenericResponseBase<IPageSize>> {
		return this.gridViewService.getPageSizeforGrid(this.entityId);
	}

	private getColumnNames(res: GenericResponseBase<GridColumnCaption[]>) {
		if (!res.Succeeded || !res.Data) {
			return;
		}
		this.columnOptions = res.Data.map((e: GridColumnCaption) =>
			({
				...e,
				fieldName: e.ColumnName,
				columnHeader: e.ColumnHeader,
				visibleByDefault: e.SelectedByDefault
			}));
	}

	private processPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (!res.Succeeded || !res.Data) return;
		this.pageSize = res.Data.PageSize;
	}

	private onActivateDeactivateAction = (dataItem: LocationRowData, action: string) => {
		const data = ({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled
		});
		this.massActivateDeactivate = [data];
		if (action === 'Activate' || action === 'Deactivate') {
			this.activateDeactivateLocation();
		}
	};

	public OnAllActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		this.massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === 'deactivate'
			}));
		this.activateDeactivateLocation();
	}

	private activateDeactivateLocation() {
		this.locationService.updateLocationStatus(this.massActivateDeactivate)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<null>) => {
				if (!res.Succeeded) {
					this.toasterService.resetToaster();
					this.toasterService.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					return;
				}

				this.showActivationDeactivationMessage();
				this.gridConfiguration.refreshGrid();
			});
	}

	private showActivationDeactivationMessage() {
		const successMessages = {
				multipleDeactivate: "LocationsDeactivatedSuccessfully",
				multipleActivate: "LocationsActivatedSuccessfully",
				singleDeactivate: "LocationDeactivatedSuccessfully",
				singleActivate: "LocationActivatedSuccessfully"
			},
			itemCount = this.massActivateDeactivate.length,
			isDisabled = this.massActivateDeactivate[magicNumber.zero].Disabled;
		let message = '';

		if (itemCount > Number(magicNumber.one)) {
			message = isDisabled
				? successMessages.multipleDeactivate
				: successMessages.multipleActivate;
		} else {
			message = isDisabled
				? successMessages.singleDeactivate
				: successMessages.singleActivate;
		}

		this.toasterService.resetToaster();
		this.toasterService.showToaster(ToastOptions.Success, message);
	}

	private onView = (dataItem: LocationRowData) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: LocationRowData) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);

	};

	public navigateToAdd() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private getActionSet() {
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
					this.onEdit, this.onActivateDeactivateAction
				)
			}
		];
	}

	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}
	public onFilterTriggered(appliedFilters: []) {
		this.appliedAdvFilters = appliedFilters;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.toasterService.resetToaster();
	}

}
