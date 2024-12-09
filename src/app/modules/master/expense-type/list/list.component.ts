import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NavigationPaths } from '../route-constants/route-constants';
import { ExpenseTypeList } from '@xrm-core/models/expense-type/expense-type.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { Subject, forkJoin, take, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { HttpStatusCode } from '@angular/common/http';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { CopyDialogComponent } from '@xrm-widgets';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ExpenseTypeService } from 'src/app/services/masters/expense-type.service';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { TreeView } from '@xrm-core/models/expense-type/tree-view.model';
import { CopyTreeModel } from '@xrm-core/models/expense-type/copy-tree.model';
import { CopyExpensePayload } from '@xrm-core/models/expense-type/copy-expense.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { CopyDropdownModel } from '@xrm-core/models/expense-type/copy-dropdown.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { DropdownModel, IDropdownWithExtras, IDynamicObject } from '@xrm-shared/models/common.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {

	private dialogRef: DialogRef;
	public extraButton = this.gridConfiguration.showCopyButtonIcon(griHeaderType);
	public searchList: string;
	public filterList: ExpenseTypeList[] = [];
	public xrmEntityId: number = XrmEntities.ExpenseType;
	public columnOptions: GridColumnCaption[];
	private isAnyTreeValue: boolean = false;
	public pageSize: number;
	public isLoading: boolean = false;
	private sectorData: IDropdownWithExtras[] = [];
	private treeData: TreeView;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'expense-type/paged';
	public advApiAddress: string = 'expense-type/advance-search';
	public appliedAdvFilters: ExpenseTypeList[];
	public copyDailogInfo: CopyDialogComponent;
	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private selectedExpenseType: string[] = [];
	private activateDeactivateExpenseTypeList: ActivateDeactivate[] = [];
	private expenseTypeLabelTextParams: DynamicParam[] = [{ Value: 'ExpenseType', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	public actionSet: IActionSetModel[];
	public tabOptions: ITabOption;
	private copyInfo: CopyExpensePayload;

	// eslint-disable-next-line max-params
	constructor(
		private gridConfiguration: GridConfiguration,
		private copyItemServc: CopyItemService,
		private router: Router,
		private toasterService: ToasterService,
		private expenseActivateRoute: ActivatedRoute,
		private gridViewService: GridViewService,
		private kendoDialogServc: DialogService,
		private localizationServc: LocalizationService,
		private toastServc: ToasterService,
		private copyItemService: CopyItemService,
		private expenseTypeService: ExpenseTypeService,
		private sectorService: SectorService,
		private cdr: ChangeDetectorRef
	) {
		this.tabOption();
		this.createActionSet();
		this.columnOptions = [];
	}

	ngOnInit(): void {
		forkJoin({
			'ColumnOptionsRes': this.gridViewService.getColumnOption(this.xrmEntityId),
			'PageSizeRes': this.gridViewService.getPageSizeforGrid(this.xrmEntityId),
			'SectorDropdownRes': this.sectorService.getExistingSectorsDropdownList()
		}).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data :{ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>, PageSizeRes:GenericResponseBase<{PageSize:number}>,
				SectorDropdownRes:GenericResponseBase<IDropdownWithExtras[]>, }) => {
				this.getGridColumnData(data.ColumnOptionsRes);
				this.getGridPageSizeData(data.PageSizeRes);
				this.sectorDropdownResponse(data.SectorDropdownRes);
				this.handleCopyItemChanges();
				this.cdr.markForCheck();
			});
	}

	private tabOption(): void {
		this.tabOptions = {
			bindingField: 'Disabled',
			tabList: [
				{
					tabName: 'Active',
					favourableValue: false,
					selected: true,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'Inactive',
					favourableValue: true,
					selected: false,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'All',
					favourableValue: 'All',
					selected: false,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				}
			]
		};
	}

	private sectorDropdownResponse(SectorDropdownRes:GenericResponseBase<IDropdownWithExtras[]>): void{
		if(isSuccessfulResponse(SectorDropdownRes)){
			this.copyItemServc.setItemListForCopyItems(SectorDropdownRes.Data);
			this.sectorData = SectorDropdownRes.Data;
			this.sectorData.sort((a, b) =>
				a.Text.localeCompare(b.Text));
			if (SectorDropdownRes.Data.length < Number(magicNumber.two)) {
				this.extraButton = [];
			}
		}
	}

	private createActionSet(): void {
		this.expenseActivateRoute.params.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: Params) => {
			if (data['permission'].length && data['permission'][magicNumber.zero].ActionId === magicNumber.twentyFive) {
				this.extraButton = [];
			}
			this.actionSet = [
				{
					Status: false,
					Items: this.gridConfiguration.showAllActionIcon(
						this.listNavigator,
						this.listNavigator,
						this.onActiveChange
					)
				},
				{
					Status: true,
					Items: this.gridConfiguration.showInactiveActionIcon(
						this.listNavigator,
						this.listNavigator,
						this.onActiveChange
					)
				}
			];
			this.cdr.markForCheck();
		});
	}

	private processDialogResponse(selectedRows: ActivateDeactivate[]): void {
		this.toasterService.resetToaster();
		this.executingExpenseTypePayload(selectedRows);
	}

	private getGridColumnData(ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>) : void {
		if (isSuccessfulResponse(ColumnOptionsRes)) {
			this.columnOptions = ColumnOptionsRes.Data.map((row: GridColumnCaption) => {
				row.fieldName = row.ColumnName;
				row.columnHeader = row.ColumnHeader;
				row.visibleByDefault = row.SelectedByDefault;
				return row;
			});
			this.isLoading = true;
		}
	}

	private getGridPageSizeData(PageSizeRes:GenericResponseBase<{PageSize:number}>): void {
		if (isSuccessfulResponse(PageSizeRes)) {
			const Data = PageSizeRes.Data;
			this.pageSize = Data.PageSize;
		}
	}

	public onSearchTriggered(searchedList: string): void {
		this.searchList = searchedList;
	}

	public onFilterTriggered(filteredList: ExpenseTypeList[]): void {
		this.appliedAdvFilters = filteredList;
	}

	private makeStatusPayload(rowIds: string[], action: boolean): ActivateDeactivate[] {
		let payload: ActivateDeactivate[] = [];
		payload = [
			...new Set(rowIds.map((item: string) =>
				({UKey: item, Disabled: action, ReasonForChange: ''})))
		];
		return payload;
	}

	private listNavigator = (dataItem: ExpenseTypeList, action: string): void => {
		this.router.navigate([
			`/xrm/master/expense-type/${action === 'View'
				? 'view'
				: 'add-edit'
			}/${dataItem.UKey}`
		]);
	};

	public navigate() {
		return this.router.navigate([`${NavigationPaths.addEdit}`]);
	}

	private onActiveChange = (RowItem: ExpenseTypeList): void => {
		this.selectedExpenseType = [];
		this.selectedExpenseType.push(RowItem.UKey);
		this.activateDeactivateExpenseTypeList = [];
		this.activateDeactivateExpenseTypeList = this.makeStatusPayload(this.selectedExpenseType, !RowItem.Disabled);
		this.processDialogResponse(this.activateDeactivateExpenseTypeList);
	};


	private executingExpenseTypePayload(rows: ActivateDeactivate[]): void {
		this.expenseTypeService.updateExpenseTypeStatus(rows).pipe(takeUntil(this.destroyAllSubscribtion$), take(magicNumber.one))
			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {
				const localizeTextParams = this.localizationServc.getLocalizationMessageInLowerCase(this.expenseTypeLabelTextParams);
				if(isSuccessfulResponse(response)){
					this.gridConfiguration.refreshGrid();
					this.toasterService.showToaster(
						ToastOptions.Success,
						rows[0].Disabled
							? 'EntityHasBeenDeactivatedSuccessfully'
							: 'EntityHasBeenActivatedSuccessfully',
						localizeTextParams
					);
				}else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationServc);
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, response.Message);
				}
				this.cdr.markForCheck();
			});
	}

	private copyDialogData = [
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'FromSector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			tooltipVisible: false,
			tooltipTitleParam: [],
			tooltipTitle: 'FromSector',
			dropdownData: [] as IDropdownWithExtras[],
			controlName: 'copyToSourceSector',
			IsTreePresent: true,
			tooltipTitleLocalizeParam: this.sectorLabelTextParams,
			validationMessageDynamicParam: [{Value: 'Sector', IsLocalizeKey: true}],
			validationMessage: 'PleaseSelectFrom'
		},
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'ToSector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			tooltipVisible: false,
			tooltipTitleParam: [],
			tooltipTitle: 'ToSector',
			dropdownData: [] as IDropdownWithExtras[],
			controlName: 'copyToDestinationSector',
			tooltipTitleLocalizeParam: this.sectorLabelTextParams,
			validationMessageDynamicParam: [{Value: 'Sector', IsLocalizeKey: true}],
			validationMessage: 'PleaseSelectTo'
		}
	];

	private handleCopyItemChanges(): void {
		this.copyItemService.getChanges().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (HandleCopyRes: CopyTreeModel) => {
				if (HandleCopyRes.controlName == 'copyToSourceSector') {
					this.expenseTypeService.getDropdownRecordsBySectorId(Number(HandleCopyRes.change.Value))
						.pipe(takeUntil(this.destroyAllSubscribtion$))
						.subscribe((item: GenericResponseBase<IDropdownWithExtras[]>) => {
							if(isSuccessfulResponse(item)){
								this.copyDailogInfo.formGroup.controls['TreeValues'].reset();
								this.setCopySectorTreeData(item.Data);
								const copySectorDestinationDrpData = [...this.copyItemService.getItemListForCopyItems().value];
								copySectorDestinationDrpData.splice(copySectorDestinationDrpData.findIndex((el: DropdownModel) =>
									el.Value === HandleCopyRes.change.Value), magicNumber.one);
								this.setCopyDropdownData(copySectorDestinationDrpData, 'copyToDestinationSector');
								this.copyDailogInfo.formGroup.controls["copyToDestinationSector"].reset();
							}

						});
				}
				this.cdr.markForCheck();
			}
		});
	}

	private setCopyDropdownData(drpData: IDropdownWithExtras[], controlName: string): void {
		const index = this.copyDialogData.findIndex((i) =>
			i.controlName == controlName);
		if (index >= Number(magicNumber.zero)) {
			this.copyDialogData[index].dropdownData = drpData;
		}
	}

	private setCopySectorTreeData(treeArray: IDropdownWithExtras[]): void {
		if (treeArray.length == Number(magicNumber.zero)) {
			this.copyDailogInfo.treeData = {};
		}
		else {
			const requiredTreeArray = treeArray.map((obj: IDropdownWithExtras) => {
					const arra: string[] = Object.keys(obj);
					return arra.reduce((accumulator: IDynamicObject, key: string) => {
						accumulator[key.toLowerCase()] = obj[key];
						return accumulator;
					}, {});
				}),

				treeData = {
					treeData: [
						{
							text: 'All',
							items: requiredTreeArray
						}
					],
					label: 'SelectExpenseTypeToCopy',
					tooltipVisible: false,
					textField: 'text',
					tooltipTitle: 'SelectTheRecordsToCopy',
					isRequired: true,
					treeViewType: "copyTree"
				};
			this.copyDailogInfo.treeData = treeData;
		}
		if (treeArray.length) {
			this.isAnyTreeValue = true;
		} else {
			this.isAnyTreeValue = false;
		}
	}

	public openCopy(): void {
		this.setCopyDropdownData(this.sectorData, 'copyToSourceSector');
		this.setCopyDropdownData(this.sectorData, 'copyToDestinationSector');
		this.subFnOpenCopy();
		this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
		this.copyDailogInfo.title = this.localizationServc.GetLocalizeMessage('DoYouWantCopySelectedExpenseTypeAnotherSector', this.sectorLabelTextParams);
		this.copyDailogInfo.copydialogdata = this.copyDialogData;
		this.copyDailogInfo.treeData = this.treeData;
	}

	private subFnOpenCopy(): void {
		this.dialogRef = this.kendoDialogServc.open({
			content: CopyDialogComponent,
			actions: [
				{
					text: this.localizationServc.GetLocalizeMessage('Yescopy'),
					value: 11,
					themeColor: 'primary'
				},
				{
					text: this.localizationServc.GetLocalizeMessage('Nocopy'),
					value: 12
				}
			],
			width: 420,
			preventAction: (buttonResponse: DialogResult, dialog) => {
				const formGroup = (dialog?.content.instance as CopyDialogComponent).formGroup,
					treeValue = formGroup.get('TreeValues')?.value,
					copyToSourceSectorStatus = formGroup.get('copyToSourceSector')?.value;

				if ('value' in buttonResponse && buttonResponse.value === Number(magicNumber.tweleve)) {
					dialog?.close();
					this.toastServc.resetToaster();
					return !formGroup.valid;
				} else if (!formGroup.valid) {
					formGroup.markAllAsTouched();
				}
				if (copyToSourceSectorStatus && (!this.isAnyTreeValue) && formGroup.value.copyToDestinationSector) {
					this.toastServc.showToaster(ToastOptions.Error, 'SelectedSectorDoesNotHaveAnyExpenseType', this.sectorLabelTextParams);
				} else if (this.isAnyTreeValue && (treeValue == null || (treeValue && treeValue.length == magicNumber.zero)) &&
					formGroup.value.copyToDestinationSector) {
					this.toastServc.showToaster(ToastOptions.Error, 'PleaseSelectAtleastOneExpenseTypeToCopy');
				}
				else if ('value' in buttonResponse && buttonResponse.value === Number(magicNumber.eleven) && formGroup.valid) {
					this.toastServc.resetToaster();
					this.copyConfirmation(treeValue.length===magicNumber.one);
					return true;
				}
				return !formGroup.valid;
			}
		});
	}

	private copyConfirmation(isCheckBox:boolean): void {
		this.copyInfo = {
			fromSectorId:
				this.copyDailogInfo.formGroup.value.copyToSourceSector?.Value,
			expenseIdsToBeCopied: this.copyDailogInfo.formGroup.value.TreeValues
				? this.copyDailogInfo.formGroup.value.TreeValues.map((x: CopyDropdownModel) =>
					x.value)
				: null,
			toSectorId:
				this.copyDailogInfo.formGroup.value.copyToDestinationSector?.Value
		};
		 this.expenseTypeService.expenseCopyToAnotherSector(this.copyInfo)
		 .pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data:GenericResponseBase<null>) => {
				if (data.StatusCode == Number(HttpStatusCode.Conflict) || data.StatusCode == Number(HttpStatusCode.Ok)) {
					this.toastServc.showToaster(ToastOptions.Success, isCheckBox
						?'SelectedExpenseTypeHasBeenCopySuccessConfirmation'
						:'SelectedExpenseTypeCopySuccessConfirmation');
					this.dialogRef.close();
					this.gridConfiguration.refreshGrid();
				} else {
					this.toastServc.showToaster(ToastOptions.Error, data.Message);
				}
				this.cdr.markForCheck();
		 });
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.copyDailogInfo?.close();
	}

}
