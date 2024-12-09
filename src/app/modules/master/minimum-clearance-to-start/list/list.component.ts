import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { MinimumClearanceToStartService } from '@xrm-master/minimum-clearance-to-start/services/minimum-clearance-to-start.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { EMPTY, forkJoin, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { NavigationPaths } from '../constant/routes-constant';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { IMinimumClearanceDetails, IClearanceCopyData, IFilterControlData } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.interface';
import { FormGroup } from '@angular/forms';
import { IBulkStatusUpdateAction, ICopyDialogData, ICopySectorDropData, ICopyToSourceData, IDropdownOption, IExtraAction, IPageSize, IPermissionInfo, IProcessedCopyItemChange, IRecordButtonGrid, IRecordStatusChangePayload, ITabOptions, TreeObject, ITreeValue } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { ApiUrl } from '../constant/apiUrl-constant';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { CopyAction } from '@xrm-shared/enums/enums-constant';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public minimumclearnce: IMinimumClearanceDetails[] = [];
	public selectedMinimumClearance: IMinimumClearanceDetails[];
	public massActivateDeactivate: IRecordStatusChangePayload[] = [];
	public dialogRef: DialogRef;
	public copyInfo: IClearanceCopyData;
	public copyDailogInfo: CopyDialogComponent;
	public pageSize: number = magicNumber.zero;
	public entityId: XrmEntities = XrmEntities.MinimumClearancetoStart;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public viewPermission: IPermissionInfo[];
	public isActionIdFound: boolean = false;
	private isAnyTreeValue: boolean = false;

	public apiAddress: string = ApiUrl.ListApiAddress;
	public advApiAddress: string = ApiUrl.AdvApiAddress;
	public searchText: string;
	public appliedAdvFilters: IFilterControlData;
	public actionSet: IRecordButtonGrid[];

	public copyDialogData: ICopyDialogData[] = [
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'FromSector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			tooltipVisible: false,
			tooltipTitleParam: [],
			tooltipTitle: 'FromSector',
			dropdownData: [],
			controlName: 'copyToSource',
			IsTreePresent: true,
			validationMessage: 'PleaseSelectFrom',
			validationMessageDynamicParam: this.sectorLabelTextParams,
			tooltipTitleLocalizeParam: this.sectorLabelTextParams
		},
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'ToSector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			tooltipVisible: false,
			tooltipTitleParam: [],
			tooltipTitle: 'ToSector',
			dropdownData: [],
			controlName: 'copyToDestination',
			validationMessage: 'PleaseSelectTo',
			validationMessageDynamicParam: this.sectorLabelTextParams,
			tooltipTitleLocalizeParam: this.sectorLabelTextParams
		}
	];

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

	public columnOptions: GridColumnCaption[] = [];
	public sectorList: IDropdownOption[] = [];
	public extraButton: IExtraAction[] = [];

	private unsubscribeAll$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private copyItemService: CopyItemService,
		private minimumClearanceToStartService: MinimumClearanceToStartService,
		private sectorService: SectorService,
		private dialog: DialogService,
		private gridService: GridViewService,
		private localizationService: LocalizationService,
		private gridConfiguration: GridConfiguration,
		private toasterService: ToasterService,
		private activatedRoute: ActivatedRoute,
		private commonService: CommonService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.handleRouteParams();
		this.handleGridData();
		this.getActionSet();
	}

	private handleGridData(): void {
		forkJoin({
			sectorListData: this.getSectorListData(),
			columnData: this.getColumnData(),
			pageSizeData: this.getPageSizeData()
		}).pipe(takeUntil(this.unsubscribeAll$))
			.subscribe(({ sectorListData, columnData, pageSizeData }) => {
				this.processSectorListData(sectorListData);
				this.processColumnData(columnData);
				this.processPageSizeData(pageSizeData);
				this.cdr.markForCheck();
			});
	}

	private getSectorListData(): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.sectorService.getSectorDropDownListV2();
	}

	private getColumnData(): Observable<GenericResponseBase<GridColumnCaption[]>> {
		return this.gridService.getColumnOption(this.entityId);
	}

	private getPageSizeData(): Observable<GenericResponseBase<IPageSize>> {
		return this.gridService.getPageSizeforGrid(this.entityId);
	}

	private processSectorListData(data: GenericResponseBase<IDropdownOption[]>): void {
		if (!data.Succeeded || !data.Data) return;
		this.sectorList = data.Data;
		if (this.sectorList.length <= Number(magicNumber.one)) return;
		this.extraButton = this.gridConfiguration.showCopyButtonIcon(griHeaderType);

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

	private handleRouteParams(): void {
		this.activatedRoute.params.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((action: Params) => {
				this.viewPermission = action['permission'];
				this.viewPermission.forEach((x: IPermissionInfo) => {
					this.isActionIdFound = x.ActionId == Number(Permission.VIEW_ONLY)
						? true
						: this.isActionIdFound;
				});
			});
	}

	private onView = (dataItem: IMinimumClearanceDetails): void => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: IMinimumClearanceDetails): void => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public navigateToAdd(): void {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	public onFilter(filteredData: IFilterControlData): void {
		this.appliedAdvFilters = filteredData;

	}

	public onSearch(list: string): void {
		this.searchText = list;
	}

	private onActivateDeactivateAction = (dataItem: IMinimumClearanceDetails): void => {
		this.massActivateDeactivate = [
			{
				UKey: dataItem.UKey,
				Disabled: !dataItem.Disabled
			}
		];
		this.activateDeactivateMinClearance();
	};

	private activateDeactivateMinClearance = (): void => {
		this.minimumClearanceToStartService.updateMinimumClearanceToStartStatus(this.massActivateDeactivate)
			.pipe(takeUntil(this.unsubscribeAll$))
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
				? "MinimumClearances"
				: "MinimumClearance",
			action = isDisabled
				? "Dectivated"
				: "Activated";
		return `${baseMessage}${action}SuccessfulConfirmation`;
	}

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction): void {
		this.massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate"
			}));

		this.activateDeactivateMinClearance();
	}

	public getActionSet(): void {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActivateDeactivateAction
				)
			}
		];
	}

	private handleDialogAction(ev: DialogResult, dialog: DialogRef | undefined): boolean {
		if ('text' in ev && ev.text === this.localizationService.GetLocalizeMessage('Nocopy')) {
			dialog?.close();
			this.toasterService.resetToaster();
		}

		const formGroup: FormGroup = (dialog?.content.instance as CopyDialogComponent).formGroup,
			copyToSource: IDropdownOption | null = formGroup.get('copyToSource')?.value,
			treeValue: ITreeValue[] | null = formGroup.get('TreeValues')?.value;

		if ('value' in ev && ev.value === CopyAction.NoCopy) {
			dialog?.close();
			this.toasterService.resetToaster();
			return !formGroup.valid;
		}

		if (!formGroup.valid) {
			this.copyItemService.submitButtonClicked.next(true);
			formGroup.markAllAsTouched();
		}
		this.handleCopyDialogValidation(formGroup, copyToSource, treeValue);
		return !formGroup.valid;
	}

	private handleCopyDialogValidation(formGroup: FormGroup, copyToSource: IDropdownOption | null, treeValue: ITreeValue[] | null): void {
		this.toasterService.resetToaster();
		if (copyToSource && !this.isAnyTreeValue && formGroup.value.copyToDestination) {
			this.toasterService.showToaster(ToastOptions.Error, 'ClearanceLevelCopyWithNoSectorMessage', this.sectorLabelTextParams);
			return;
		}
		if (this.isAnyTreeValue &&
			(treeValue == null || treeValue.length === Number(magicNumber.zero)) && formGroup.value.copyToDestination) {
			this.toasterService.showToaster(ToastOptions.Error, 'ClearanceLevelCopySelectSectorMessage');
		}
	}

	private bindDialogData(): void {
		this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
		this.copyDailogInfo.title = this.localizationService
			.GetLocalizeMessage("CopyEntity", [{ Value: 'MinimumClearancetoStart', IsLocalizeKey: true }]);
		this.copyDailogInfo.copydialogdata = this.copyDialogData;
	}

	private setCopySectorDropdownData(drpData: IDropdownOption[], controlName: string): void {
		const index = this.copyDialogData.findIndex((i: ICopyDialogData) =>
			i.controlName == controlName);
		if (index === Number(magicNumber.minusOne)) return;
		this.copyDialogData[index].dropdownData = drpData;
	}

	private setCopySectorTreeData(treeArray: TreeObject[]): void {
		this.isAnyTreeValue = Boolean(treeArray.length);
		if (!this.isAnyTreeValue) {
			this.copyDailogInfo.treeData = {};
			return;
		};

		const requiredTreeArray: TreeObject[] = treeArray.map((obj: TreeObject) =>
			Object.keys(obj).reduce<TreeObject>((accumulator: TreeObject, key: string) => {
				accumulator[key.toLowerCase()] = obj[key];
				return accumulator;
			}, {}));

		this.copyDailogInfo.treeData = {
			treeData: [
				{
					text: "All",
					items: requiredTreeArray
				}
			],
			label: "SelectTheRecords",
			tooltipVisible: false,
			textField: "text",
			tooltipTitleParams: [],
			isRequired: true,
			tooltipTitle: "SelectTheRecordsToCopy",
			tooltipTitleLocalizeParam: []
		};
		this.isAnyTreeValue = Boolean(treeArray.length);
	}

	private openCopyDialog(): void {
		this.dialogRef = this.dialog.open({
			content: CopyDialogComponent,
			actions: [
				{ text: this.localizationService.GetLocalizeMessage('Yescopy'), themeColor: "primary" },
				{ text: this.localizationService.GetLocalizeMessage('Nocopy'), value: CopyAction.NoCopy }
			],
			width: magicNumber.fourTwenty,
			preventAction: (ev: DialogResult, dialog) =>
				this.handleDialogAction(ev, dialog)
		});

		this.bindDialogData();

		this.dialogRef.result.pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((data: DialogResult) =>
				this.handleDialogResult(data))
		).subscribe();
	}

	private handleDialogResult(data: DialogResult): Observable<ApiResponseBase> {
		if (this.copyDailogInfo.formGroup.value.TreeValues == null) {
			return EMPTY;
		}

		this.copyInfo = {
			Source: this.copyDailogInfo.formGroup.value.copyToSource?.Value,
			Destination: this.copyDailogInfo.formGroup.value.copyToDestination?.Value,
			minimumClearanceIds: this.copyDailogInfo.formGroup.value.TreeValues
				? this.copyDailogInfo.formGroup.value.TreeValues.map((x: ITreeValue) =>
					x.value)
				: null
		};

		if (!('text' in data) || (data.text !== this.localizationService.GetLocalizeMessage('Yescopy')))
			return EMPTY;
		return this.copySectorConfirmation();
	}

	private copySectorConfirmation(): Observable<ApiResponseBase> {
		return this.minimumClearanceToStartService.copyToAnotherSector(this.copyInfo).pipe(
			takeUntil(this.unsubscribeAll$),
			tap((data: ApiResponseBase) => {
				if (data.StatusCode === Number(HttpStatusCode.Conflict))
					return this.toasterService.showToaster(ToastOptions.Error, 'MinimumClearanceDuplicateValidation');

				if (!data.Succeeded && data.Message)
					return this.toasterService.showToaster(ToastOptions.Error, data.Message);

				this.toasterService.resetToaster();
				this.toasterService.showToaster(ToastOptions.Success, this.getCopyConfirmationMessage(this.copyInfo.minimumClearanceIds.length));
				this.gridConfiguration.refreshGrid();
				this.commonService.resetAdvDropdown(this.entityId);
			})
		);
	}

	private getCopyConfirmationMessage(length: number): string {
		if (length === Number(magicNumber.one)) return 'MinimumClearanceCopySuccessConfirmation';
		return 'MinimumClearancesCopySuccessConfirmation';
	}

	public copySectorBtnEvent(): void {
		this.openCopyDialog();
		forkJoin({
			sectorDropDownList: this.loadSectorDropDownList(),
			copyItemChanges: this.handleCopyItemChanges()
		}).pipe(takeUntil(this.unsubscribeAll$)).subscribe();
	}

	private loadSectorDropDownList(): Observable<GenericResponseBase<IDropdownOption[]> | undefined> {
		return this.sectorService.getSectorDropDownListV2().pipe(map((data: GenericResponseBase<IDropdownOption[]>) => {
			if (!data.Succeeded || !data.Data) return;
			this.copyItemService.setItemListForCopyItems(data.Data);
			this.setCopySectorDropdownData(data.Data, "copyToSource");
			return data;
		}));
	}

	private handleCopyItemChanges(): Observable<IProcessedCopyItemChange> {
		return this.copyItemService.getChanges().pipe(
			switchMap((data: ICopyToSourceData) =>
				this.processCopyItemChange(data)),
			map((result) =>
				this.updateCopySectorTreeData(result))
		);
	}

	private processCopyItemChange(data: ICopyToSourceData): Observable<IProcessedCopyItemChange> {
		if (data.controlName !== 'copyToSource') return EMPTY;
		if (!data.change) {
			this.resetCopyDialogInfo();
			return EMPTY;
		}
		return this.minimumClearanceToStartService.getDropdownRecordsBySectorId(data.change.Value).pipe(
			takeUntil(this.unsubscribeAll$),
			map((item) =>
				({ item, data }))
		);
	}

	private resetCopyDialogInfo(): void {
		this.copyDailogInfo.formGroup.controls['TreeValues'].reset();
		this.copyDailogInfo.treeData = {};
		this.toasterService.resetToaster();
	}

	private updateCopySectorTreeData({ item, data }: IProcessedCopyItemChange): IProcessedCopyItemChange {
		if (!item.Succeeded || !item.Data || !data.change?.Value) return {} as IProcessedCopyItemChange;

		this.setCopySectorTreeData(item.Data);
		this.updateCopySectorDestinationDropdown(data.change.Value);
		this.copyDailogInfo.formGroup.controls["copyToDestination"].reset();

		return { item, data };
	}

	private updateCopySectorDestinationDropdown(selectedValue: number): void {
		const copySectorDestinationDrpData: IDropdownOption[] = [...this.copyItemService.getItemListForCopyItems().value],
			index = copySectorDestinationDrpData.findIndex((el: ICopySectorDropData) =>
				el.Value === selectedValue);
		if (index === Number(magicNumber.minusOne)) return;
		copySectorDestinationDrpData.splice(index, magicNumber.one);
		this.setCopySectorDropdownData(copySectorDestinationDrpData, 'copyToDestination');
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		this.toasterService.resetToaster();
		this.copyDailogInfo?.close();
	}
}
