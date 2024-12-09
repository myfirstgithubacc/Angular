import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { DocumentConfigurationService } from '@xrm-master/document-configuration/services/document-configuration.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { NavigationPaths } from '../constant/routes-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { IDocumentRowData } from '@xrm-core/models/document-configuration/document-configuration.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, IRecordStatusChangePayload } from '@xrm-shared/models/common.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public isLoading: boolean = false;
	public pageSize: number = magicNumber.zero;
	public entityId: number = XrmEntities.DocumentUploadConfiguration;

	public columnOptions: GridColumnCaption[] = [];

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

	public actionSet: IRecordButtonGrid[];
	public documentConfigurationList: [] = [];
	private massActivateDeactivate: IRecordStatusChangePayload[] = [];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'dms/paged';
	public advApiAddress: string = 'dms/select-paged';
	public searchText: string;
	public appliedAdvFilters: [];

	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private gridService: GridViewService,
		private router: Router,
		public documentConfigurationService: DocumentConfigurationService,
		public dialogPopup: DialogPopupService,
		private gridConfiguration: GridConfiguration,
		private toasterService: ToasterService
	) {
	}

	ngOnInit(): void {
		this.getActionSet();
		this.getPageSizeData();
		this.getColumnData();
	}

	private getColumnData() {
		this.gridService.getColumnOption(this.entityId)
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<GridColumnCaption[]>) => {
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
				this.isLoading = true;
			});
	}

	private getPageSizeData() {
		this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IPageSize>) => {
				if (!res.Succeeded || !res.Data) {
					return;
				}
				this.pageSize = res.Data.PageSize;
			});
	}

	public onFilter(filteredData: []) {
		this.appliedAdvFilters = filteredData;

	}

	public onSearch(list: string) {
		this.searchText = list;
	}

	private onMassActivateDeactivateAction = (dataItem: IDocumentRowData, action: string) => {
		const data = {
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled
		};

		this.massActivateDeactivate = [data];

		if (action === 'Activate' || action === 'Deactivate') {
			this.performActivateDeactivate();
		}
	};

	public onActivateDeactivate(event: IBulkStatusUpdateAction) {
		this.massActivateDeactivate = event.rowIds.map((uKey: string) =>
	      ({
				UKey: uKey,
				Disabled: event.actionName === "deactivate"
			}));
		this.performActivateDeactivate();
	}

	private performActivateDeactivate() {
		this.documentConfigurationService.updateDocumentConfigurationStatus(this.massActivateDeactivate)
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
				multipleDeactivate: "DocumentConfigurationsDeactivateSuccessfully",
				multipleActivate: "DocumentConfigurationsActivatedSuccessfully",
				singleDeactivate: "DocumentConfigurationDeactivateSuccessfully",
				singleActivate: "DocumentConfigurationActivatedSuccessfully"
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

	public navigateToAdd() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private onView = (dataItem: IDocumentRowData) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: IDocumentRowData) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit,
					this.onMassActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onMassActivateDeactivateAction
				)
			}
		];
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.toasterService.resetToaster();
	}

}
