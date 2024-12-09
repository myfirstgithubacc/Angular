import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { UserDefinedFieldsService } from '../services/user-defined-fields.service';
import { Subject, takeUntil } from 'rxjs';
import { NavigationPaths } from '../constant/route-constant';
import { IUserDefinedFieldData } from '@xrm-core/models/user-defined-field-config/udf-config-list.model';
import { ApiUrl } from '../constant/apiUrl-constant';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public entityId: number = XrmEntities.UserDefinedField;
	public pageSize: number;
	public columnOptions: GridColumnCaption[] = [];
	public actionSet: IRecordButtonGrid[];
	private massActivateDeactivate: IRecordStatusChangePayload[] = [];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = ApiUrl.listApiAddress;
	public advApiAddress: string = ApiUrl.advApiAddress;
	public searchText: string;
	public appliedAdvFilters: [];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
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
		private gridViewService: GridViewService,
		private toasterService: ToasterService,
		private gridConfiguration: GridConfiguration,
		public udfConfigService: UserDefinedFieldsService
	) {
	}

	ngOnInit(): void {
		this.fetchActionSet();
		this.fetchPageSize();
		this.fetchColumnNames();
	}

	private fetchActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.handleView,
					this.handleEdit,
					this.handleActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.handleView,
					this.handleEdit,
					this.handleActivateDeactivateAction
				)
			}
		];
	}

	private fetchPageSize() {
		this.gridViewService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IPageSize>) => {
				if (!res.Succeeded || !res.Data) {
					return;
				}
				this.pageSize = res.Data.PageSize;
			});
	}

	private fetchColumnNames() {
	    this.gridViewService.getColumnOption(this.entityId).pipe(takeUntil(this.destroyAllSubscriptions$))
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
			});
	}

	public addNewUDF(): void {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private handleView = (dataItem: IUserDefinedFieldData) =>
		this.navigateToDetail('view', dataItem.UKey, dataItem.UserDefinedFieldTypeId);

	private handleEdit = (dataItem: IUserDefinedFieldData) =>
		this.navigateToDetail('add-edit', dataItem.UKey, dataItem.UserDefinedFieldTypeId);

	private navigateToDetail(action: string, uKey: string, FieldTypeId: string) {
		this.router.navigate([`${NavigationPaths.list}/${action}/${uKey}/${FieldTypeId}`]);
	}

	public handleAllActivateDeactivate(event: IBulkStatusUpdateAction) {
		this.massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate"
			}));
		this.performActivateDeactivate();
	}

	private handleActivateDeactivateAction = (dataItem: IUserDefinedFieldData, action: string) => {
		const data = ({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled
		});
		this.massActivateDeactivate = [data];

		if (action === 'Activate' || action === 'Deactivate') {
			this.performActivateDeactivate();
		}
	};

	private performActivateDeactivate() {
		this.udfConfigService.UpdateStatus(this.massActivateDeactivate).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res:ApiResponseBase) => {
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
				multipleDeactivate: "UserDefinedFieldsDeactivatedSuccessfully",
				multipleActivate: "UserDefinedFieldsActivatedSuccessfulConfirmation",
				singleDeactivate: "UserDefinedFieldDeactivatedSuccessfulConfirmation",
				singleActivate: "UserDefinedFieldActivatedSuccessfulConfirmation"
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

	public applyFilter(filteredData: []) {
		this.appliedAdvFilters = filteredData;
	}

	public applySmartSearch(list: string) {
		this.searchText = list;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.toasterService.resetToaster();
	}
}
