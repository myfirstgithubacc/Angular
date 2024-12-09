import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { UserDefinedFieldsPickListService } from '../services/user-defined-fields-pick-list.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, IRecordStatusChangePayload, ITabOptions } from '@xrm-shared/models/common.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IUdfPickListData } from '@xrm-core/models/user-defined-field-pick-list/usd-pick-list-type.model';
import { ApiUrl } from '../constant/api-url-constant';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { MenuService } from '@xrm-shared/services/menu.service';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	private massActivateDeactivate: IRecordStatusChangePayload[];
	public columnOptions: GridColumnCaption[];
	public entityId: XrmEntities = XrmEntities.UserDefinedFieldPicklistType;
	public pageSize: number = magicNumber.zero;
	public actionSet: IActionSetModel[];

	public tabOptions: ITabOptions = {
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
	public apiAddress: string = ApiUrl.listApiAddress;
	public searchText: string = '';
	private unsubscribeAll$: Subject<void> = new Subject<void>();
	private timeoutId:ReturnType<typeof setTimeout>;

	// eslint-disable-next-line max-params
	constructor(
		private gridViewService: GridViewService,
		private toasterService: ToasterService,
		private userDefinedFieldsPickListService: UserDefinedFieldsPickListService,
		private gridConfiguration: GridConfiguration,
		private cdr: ChangeDetectorRef,
		private menuService: MenuService
	) { }

	ngOnInit(): void {
		this.menuService.fetchAndAppendEntityPermissions(true, this.entityId);
		this.timeoutId = setTimeout(() => {
			this.fetchActionSet();
			this.loadGridData();
		}, magicNumber.zero);
	}


	private loadGridData(): void {
		forkJoin({
			columnData: this.gridViewService.getColumnOption(this.entityId),
			pageSizeData: this.gridViewService.getPageSizeforGrid(this.entityId)
		}).pipe(takeUntil(this.unsubscribeAll$)).subscribe({
			next: (results: { columnData: GenericResponseBase<GridColumnCaption[]>, pageSizeData: GenericResponseBase<IPageSize> }) => {
				const columnRes = results.columnData,
					pageSizeRes = results.pageSizeData;

				this.processColumnOptions(columnRes);
				if (!pageSizeRes.Succeeded || !pageSizeRes.Data) return;
				this.pageSize = pageSizeRes.Data.PageSize;
				this.cdr.markForCheck();
			}
		});
	}

	private processColumnOptions(columnRes: GenericResponseBase<GridColumnCaption[]>): void {
		if (!columnRes.Succeeded || !columnRes.Data) return;
		this.columnOptions = columnRes.Data.map((item: GridColumnCaption) => {
			item.fieldName = item.ColumnName;
			item.columnHeader = item.ColumnHeader;
			item.visibleByDefault = item.SelectedByDefault;
			return item;
		});
	}

	public onEdit = (dataItem: IUdfPickListData): void => {
		this.userDefinedFieldsPickListService.backDialogList();
		this.userDefinedFieldsPickListService.openDialogAddEdit(dataItem.UKey);
	};

	public navigateToNewPickList(): void {
		this.userDefinedFieldsPickListService.backDialogList();
		this.userDefinedFieldsPickListService.openDialogAddEdit('');
	}

	public onSearch(list: string): void {
		this.searchText = list;
	}

	private onActivateDeactivateAction = (dataItem: IUdfPickListData): void => {
		this.massActivateDeactivate = [
			{
				UKey: dataItem.UKey,
				Disabled: !dataItem.Disabled
			}
		];
		this.toggleStatusPickList();
	};

	private toggleStatusPickList = (): void => {
		this.userDefinedFieldsPickListService.UpdateBulkStatusUDFPickListType(this.massActivateDeactivate)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: ApiResponseBase) => {
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

		this.toasterService.notPopup.next(false);
		this.toasterService.showToaster(ToastOptions.Success, message);
		this.gridConfiguration.refreshGrid();
	}

	private getSuccessMessage(isMultiple: boolean, isDisabled: boolean): string {
		const baseMessage = isMultiple
				? "UDFPickLists"
				: "UDFPickList",
			action = isDisabled
				? "Deactivated"
				: "Activated";
		return `${baseMessage}${action}Confirmation`;
	}

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction): void {
		this.massActivateDeactivate = event.rowIds.map((uKey: string) =>
			({
				UKey: uKey,
				Disabled: event.actionName === "deactivate"
			}));
		this.toggleStatusPickList();
	}

	private fetchActionSet() {
		this.actionSet = this.userDefinedFieldsPickListService.getCommonActionSet<IUdfPickListData>(this.onEdit, this.onActivateDeactivateAction);
	}

	ngOnDestroy(): void {
		this.userDefinedFieldsPickListService.triggerOnDestroyCallback();
		this.toasterService.notPopup.next(true);
		this.toasterService.resetToaster();
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		clearTimeout(this.timeoutId);
	}
}
