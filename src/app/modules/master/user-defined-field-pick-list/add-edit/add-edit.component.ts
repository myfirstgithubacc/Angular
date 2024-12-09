import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Subject, takeUntil } from 'rxjs';
import { UserDefinedFieldsPickListService } from '../services/user-defined-fields-pick-list.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { IColumnOption, IPickListAddEditPayload, IPickListItem, IStatusChangePayload, IUdfPickListData, IUdfPickListItem, IUdfPickListUpdateDto } from '@xrm-core/models/user-defined-field-pick-list/usd-pick-list-type.model';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { MenuService } from '@xrm-shared/services/menu.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class AddEditComponent implements OnInit, OnDestroy {
	baseGatewayUrl = `${environment.GATEWAY_URL}/${environment.APIVERSION}/`;
	public entityId: XrmEntities = XrmEntities.UserDefinedFieldPicklistItem;
	private entityIdPicklist: XrmEntities = XrmEntities.UserDefinedFieldPicklistType;
	public gridData: IPickListItem[] = [];
	public isEditMode: boolean = false;
	public isItemEditMode: boolean = false;
	private itemTypeUKey: string = "";
	public addEditPickListForm: FormGroup;
	private selectedItem: IPickListItem | null;
	private selectedItemId: number = magicNumber.zero;
	private selectedItemSr: number = magicNumber.zero;
	public pageSize: number = magicNumber.zero;
	public columnOptions: IColumnOption[] = [];
	private unsubscribeAll$: Subject<void> = new Subject<void>();
	private isAdded: boolean = false;
	private recordId: number = magicNumber.zero;
	public actionSet: IActionSetModel[];
	private timeoutId: ReturnType<typeof setTimeout>;

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private http: HttpClient,
		private activatedRoute: ActivatedRoute,
		private customValidators: CustomValidators,
		private eventlog: EventLogService,
		private gridViewService: GridViewService,
		private gridConfiguration: GridConfiguration,
		private userDefinedFieldsPickListService: UserDefinedFieldsPickListService,
		private toasterService: ToasterService,
		private menuService: MenuService,
		private commonSrv: CommonService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.menuService.fetchAndAppendEntityPermissions(true, this.entityId);
		this.timeoutId = setTimeout(() => {
			this.fetchActionSet();
		}, magicNumber.zero);
		this.initializeForm();
		this.getItemTypeUKeyFromRouteParams();
		this.getColumnOptions();
		this.getPageSize();
	}

	private initializeForm(): void {
		this.addEditPickListForm = this.formBuilder.group({
			pickListName: [null, this.pickListNameValidation()],
			itemTitle: [null, this.itemTitleValidation()]
		});
	}

	private pickListNameValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'PredefinedListName', IsLocalizeKey: true }]);
	}

	private itemTitleValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ItemTitle', IsLocalizeKey: true }]);
	}

	private getItemTypeUKeyFromRouteParams(): void {
		this.activatedRoute.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((param) => {
			if (!param['ukey']) return;
			this.itemTypeUKey = (param['ukey']);
		});
	}

	private getColumnOptions(): void {
		this.columnOptions = [
			{ fieldName: "Sr", columnHeader: "Item#", visibleByDefault: true },
			{ fieldName: "Name", columnHeader: "ItemTitle", visibleByDefault: true },
			{ fieldName: "Status", columnHeader: "Status", visibleByDefault: true },
			{ fieldName: "Id", columnHeader: "Id", visibleByDefault: false }
		];
	}

	private getPageSize(): void {
		this.gridViewService.getPageSizeforGrid(this.entityId)
			.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res: GenericResponseBase<IPageSize>) => {
				if (!res.Succeeded || !res.Data) return;
				this.pageSize = res.Data.PageSize;
			});
	}

	public tabOptions: ITabOptions = {
		bindingField: dropdown.Disabled,
		tabList: [{ tabName: dropdown.All, favourableValue: dropdown.All, selected: true }]
	};

	public loadRecordByUKey(ukey: string): void {
		this.isEditMode = true;
		this.userDefinedFieldsPickListService.GetUDFPickListByUKey(ukey)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((response: GenericResponseBase<IUdfPickListData>) => {
				if (!response.Succeeded || !response.Data) {
					this.showToaster(true, 'Somethingwentwrong');
					return;
				}
				this.populatePickListForm(response.Data);
			});
	}

	private populatePickListForm(data: IUdfPickListData): void {
		this.addEditPickListForm.get("pickListName")?.setValue(data.Name);
		this.gridData = this.reShaper(data.UdfPickListGetDtoWithTypes);
		this.eventlog.recordId.next(data.Id);
		this.eventlog.entityId.next(this.entityIdPicklist);
		this.recordId = data.Id;
		this.cdr.detectChanges();
	}

	public addUpdateItemInGrid(): void {
		this.markItemTitleAsTouched();
		if (!this.isItemTitleValid()) return;

		if (!this.isItemEditMode) {
			this.addItemToGridIfNotExists(this.getItemTitle());
		} else {
			this.updateItemInGridIfNotExists(this.getItemTitle());
		}
		this.resetForm();
	}

	private resetForm(): void {
		this.resetSelectedItems();
		this.addEditPickListForm.get('itemTitle')?.reset();
		this.addEditPickListForm.markAsDirty();
	}

	private markItemTitleAsTouched(): void {
		this.addEditPickListForm.get('itemTitle')?.markAllAsTouched();
	}

	private isItemTitleValid(): boolean {
		return this.addEditPickListForm.get('itemTitle')?.valid ?? false;
	}

	private getItemTitle(): string {
		return this.addEditPickListForm.get('itemTitle')?.value.toString().trim();
	}

	private addItemToGridIfNotExists(itemTitle: string): void {
		if (!this.checkIfItemExistsByName(itemTitle)) {
			this.addItemToGrid(itemTitle);
			return;
		}
		this.showToaster(true, 'ItemTitleAlreadyExist');
	}

	private updateItemInGridIfNotExists(itemTitle: string): void {
		if (!this.checkIfItemExistsByIdOrSr(itemTitle)) {
			this.updateItemInGrid(this.getItemIndexByIdOrSr(), itemTitle);
			return;
		}
		this.showToaster(true, 'ItemTitleAlreadyExist');
	}

	private checkIfItemExistsByName(itemTitle: string): boolean {
		return this.gridData.some((x: IPickListItem) =>
			x.Name == itemTitle);
	}

	private checkIfItemExistsByIdOrSr(itemTitle: string): boolean {
		if (this.selectedItemId !== Number(magicNumber.zero))
			return this.gridData.some((x: IPickListItem) =>
				x.Id != this.selectedItemId && x.Name == itemTitle);
		return this.gridData.some((x: IPickListItem) =>
			x.Sr != this.selectedItemSr && x.Name == itemTitle);
	}

	private addItemToGrid(itemTitle: string): void {
		const data: IPickListItem = { Id: magicNumber.zero, Sr: this.gridData.length + magicNumber.one, Name: itemTitle, Status: 'Active', Disabled: false };
		this.gridData = [...this.gridData, data];
	}

	private getItemIndexByIdOrSr(): number {
		if (this.selectedItemId !== Number(magicNumber.zero))
			return this.gridData.findIndex((x: IPickListItem) =>
				x.Id == this.selectedItemId);

		return this.gridData.findIndex((x: IPickListItem) =>
			x.Sr == this.selectedItemSr);
	}

	private updateItemInGrid(itemIndex: number, itemTitle: string): void {
		if (itemIndex === Number(magicNumber.minusOne)) {
			this.showToaster(true, 'Somethingwentwrong');
			return;
		}
		this.gridData[itemIndex].Name = itemTitle;
		this.gridData = Object.assign([], this.gridData);
	}

	private resetSelectedItems(): void {
		this.selectedItemId = magicNumber.zero;
		this.selectedItemSr = magicNumber.zero;
		this.selectedItem = null;
		this.isItemEditMode = false;
	}

	public handleFormSubmission(): void {
		this.markFormFieldsAsTouched();
		if (this.gridData.length === Number(magicNumber.zero) || !this.isFormValid()) return;

		if (this.isEditMode) this.addEditPickListForm.markAsPristine();

		this.addUpdatePickList();
		this.eventlog.isUpdated.next(true);
	}

	private markFormFieldsAsTouched(): void {
		this.markPickListNameAsTouched();
		if (this.gridData.length !== Number(magicNumber.zero)) return;
		this.markItemTitleAsTouched();
	}

	private markPickListNameAsTouched(): void {
		this.addEditPickListForm.get('pickListName')?.markAllAsTouched();
	}

	private isFormValid(): boolean {
		if (!this.isPickListNameValid()) return false;

		if (this.gridData.length > Number(magicNumber.zero)) {
			const itemTitleControl = this.addEditPickListForm.get('itemTitle');
			itemTitleControl?.clearValidators();
			itemTitleControl?.updateValueAndValidity({ onlySelf: true });
		}
		return true;
	}

	private isPickListNameValid(): boolean {
		return this.addEditPickListForm.get('pickListName')?.valid ?? false;
	}

	private addUpdatePickList(): void {
		this.toasterService.resetToaster();
		if (this.isEditMode) {
			this.updatePickList(this.preparePickListItems());
			return;
		}
		this.addPickList(this.preparePickListItems());
	}

	private preparePickListItems(): IUdfPickListUpdateDto[] {
		return this.gridData.map((item: IPickListItem) =>
			this.isEditMode
				? { udfItemId: item.Id, name: item.Name, status: item.Disabled }
				: { name: item.Name, status: item.Disabled });
	}

	private addPickList(pickListItems: IUdfPickListUpdateDto[]): void {
		this.userDefinedFieldsPickListService
			.AddPickListTypeAndItems(this.preparePickListAddPayload(pickListItems))
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe({
				next: (listData: GenericResponseBase<IUdfPickListData>) => {
					if (!listData.Succeeded) {
						this.showToaster(true, listData.Message);
						this.addEditPickListForm.get('itemTitle')?.markAsUntouched();
						return;
					}
					this.pickListAddEditSuccess();
					this.isAdded = true;
					this.cancel();
				}
			});
	}

	private preparePickListAddPayload(pickListItems: IUdfPickListUpdateDto[]): IPickListAddEditPayload {
		return {
			name: this.addEditPickListForm.get("pickListName")?.value,
			userDefinedPickListDtos: pickListItems
		};
	}

	private updatePickList(pickListItems: IUdfPickListUpdateDto[]): void {
		const ukey = this.preparePickListEditPayload(pickListItems).UKey ?? "";
		this.userDefinedFieldsPickListService
			.UpdatePickListTypeAndItems(this.preparePickListEditPayload(pickListItems))
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe({
				next: (listData: ApiResponseBase) => {
					if (!listData.Succeeded && listData.Message) {
						this.showToaster(true, listData.Message);
						return;
					}
					this.loadRecordByUKey(ukey);
					this.pickListAddEditSuccess();
				}
			});
	}

	private pickListAddEditSuccess(): void {
		this.userDefinedFieldsPickListService.saveUDFPickListType.next(true);
		this.gridConfiguration.refreshGrid();
		this.showToaster(false, 'UDFPickListItemAddedSuccessfully');
	}

	private preparePickListEditPayload(pickListItems: IUdfPickListUpdateDto[]): IPickListAddEditPayload {
		return {
			name: this.addEditPickListForm.get("pickListName")?.value,
			udfPickListUpdateDtos: pickListItems,
			UKey: this.itemTypeUKey
		};
	}

	private onEditItem = (dataItem: IPickListItem): void => {
		this.selectedItem = dataItem;
		this.isItemEditMode = true;
		this.selectedItemId = dataItem.Id;
		this.selectedItemSr = dataItem.Sr;

		this.addEditPickListForm.get("itemTitle")?.setValue(this.selectedItem.Name);
	};

	private confirmToActivateDeactivateItem = (dataItem: IPickListItem): void => {
		this.setSelectedItem(dataItem);
		this.activateDeactivateItem();
	};

	private setSelectedItem = (dataItem: IPickListItem): void => {
		this.selectedItem = dataItem;
		this.selectedItemId = dataItem.Id;
		this.selectedItemSr = dataItem.Sr;
		this.addEditPickListForm.get("itemTitle")?.markAsUntouched();
	};

	private activateDeactivateItem = (): void => {
		// This condition occurs when a new list item is added and the user tries to activate/deactivate it without saving the record first.
		if (this.selectedItemId === Number(magicNumber.zero)) {
			this.updateGridData();
			this.showToaster(false, (this.selectedItem?.Disabled
				? 'PickListItemActivateConfirmation'
				: 'PickListItemDeactivateConfirmation'));
			this.resetSelectedItems();
			return;
		}

		this.updateItemStatus();
	};

	private updateGridData = (): void => {
		const itemIndex = this.gridData.findIndex((x: IPickListItem) =>
			x.Sr === this.selectedItemSr);
		if (itemIndex > Number(magicNumber.minusOne)) {
			const item = this.gridData[itemIndex];
			item.Disabled = !this.selectedItem?.Disabled;
			item.Status = item.Disabled
				? 'Inactive'
				: 'Active';
		}
	};

	private updateItemStatus = (): void => {
		const data: IStatusChangePayload[] = [{ uKey: this.selectedItem?.UKey, disabled: !this.selectedItem?.Disabled }];

		this.userDefinedFieldsPickListService.UpdateBulkStatusUDFPickListItem(data)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: ApiResponseBase) => {
				if (!res.Succeeded) {
					this.showToaster(true, 'Somethingwentwrong');
					return;
				}

				this.gridData = this.reShaper(this.gridData, this.selectedItemId, data[magicNumber.zero].disabled);
				this.showToaster(false, (this.selectedItem?.Disabled
					? 'PickListItemActivateConfirmation'
					: 'PickListItemDeactivateConfirmation'));
				this.resetSelectedItems();
				this.eventlog.isUpdated.next(true);
			});
	};

	private showToaster(isError: boolean, message: string): void {
		this.toasterService.resetToaster();
		this.toasterService.notPopup.next(false);
		this.toasterService.showToaster((isError
			? ToastOptions.Error
			: ToastOptions.Success), message);
	}

	private fetchActionSet() {
		this.actionSet = this.userDefinedFieldsPickListService.getCommonActionSet<IPickListItem>
		(this.onEditItem, this.confirmToActivateDeactivateItem);
	}

	private reShaper(data: IUdfPickListItem[] | IPickListItem[], itemId: number = magicNumber.zero, isDisabled: boolean = false): IPickListItem[] {
		const result = data.map((item: IUdfPickListItem | IPickListItem, index: number) => {
			if (itemId > Number(magicNumber.zero) && item.Id == itemId)
				item.Disabled = isDisabled;

			const tempData: IPickListItem = {
				Sr: index + magicNumber.one,
				Id: item.Id,
				UKey: item.UKey,
				Name: item.Name,
				Disabled: item.Disabled,
				Status: item.Disabled
					? "Inactive"
					: "Active"
			};

			return tempData;
		});
		return result;
	}

	public cancel(): void {
		this.userDefinedFieldsPickListService.backDialogAddEdit();
		this.userDefinedFieldsPickListService.openDialogList();
	}

	public onExportData(){
		const payload = {
				"xrmEntityId": 41,
				"entityType": "",
				"menuId": null,
				"fileType": 1,
				"data": this.recordId.toString()
			},
		 url = `${this.baseGatewayUrl}udf-items/export`;
		    this.http.post(url, payload, { withCredentials: true, responseType: 'blob' })
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((res: any) => {
				this.commonSrv.downloadFile(res, "UDFPickListItems");
			});
	}

	ngOnDestroy(): void {
		this.userDefinedFieldsPickListService.triggerOnDestroyCallback();
		if (!this.isAdded) {
			this.toasterService.resetToaster();
		}
		this.toasterService.notPopup.next(true);
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		clearTimeout(this.timeoutId);
	}
}
