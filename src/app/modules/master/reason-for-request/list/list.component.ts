import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { EMPTY, forkJoin, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { NavigationPaths } from '../constant/routes-constant';
import { ReasonForRequestService } from '@xrm-master/reason-for-request/services/reason-for-request.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { IFilterControlData, IReasonForRequestCopyData, IReasonForRequestData } from '@xrm-core/models/reason-for-request/reason-for-request.interface';
import { FormGroup } from '@angular/forms';
import { IBulkStatusUpdateAction, ICopyDialogData, ICopySectorDropData, ICopyToSourceData, IDropdownOption, IExtraAction, IPageSize, IProcessedCopyItemChange, IRecordButtonGrid, IRecordStatusChangePayload, ITabOptions, TreeObject, ITreeValue, IPermissionInfo } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { ApiUrl } from '../constant/apiUrl-constant';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { CopyAction } from '@xrm-shared/enums/enums-constant';
import { Permission } from '@xrm-shared/enums/permission.enum';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public apiAddress: string = ApiUrl.ListApiAddress;
	public advApiAddress: string = ApiUrl.AdvApiAddress;
	public searchText: string = '';
	public appliedAdvFilters: IFilterControlData;
	public pageSize: number = magicNumber.zero;
	public entityId: XrmEntities = XrmEntities.ReasonForRequest;
	public columnOptions: GridColumnCaption[];

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

	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public actionSet: IRecordButtonGrid[] = [];

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

	private massActivateDeactivate: IRecordStatusChangePayload[] = [];
	private dialogRef: DialogRef;
	private copyInfoRequest: IReasonForRequestCopyData;
	private copyDailogInfo: CopyDialogComponent;
	public extraButton: IExtraAction[] = [];
	public sectorList: IDropdownOption[] = [];
	public viewPermission: IPermissionInfo[];
	public isActionIdFound: boolean = false;

	private isAnyTreeValue: boolean = false;
	private unsubscribeAll$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private gridService: GridViewService,
		private router: Router,
		public reasonForRequestService: ReasonForRequestService,
		private copyItemService: CopyItemService,
		private gridConfiguration: GridConfiguration,
		private sectorService: SectorService,
		private kendoDialogService: DialogService,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		private commonService: CommonService,
		private activatedRoute: ActivatedRoute,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.handleRouteParams();
		this.getActionSet();
		this.initializeData();
	}

	private initializeData(): void {
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

	public onFilter(filteredData: IFilterControlData): void {
		this.appliedAdvFilters = filteredData;
	}

	public onSearch(list: string): void {
		this.searchText = list;
	}

	private onActivateDeactivateAction = (dataItem: IReasonForRequestData): void => {
		this.massActivateDeactivate = [
			{
				UKey: dataItem.UKey,
				Disabled: !dataItem.Disabled
			}
		];
		this.toggleStatusReasonForRequest();
	};

	private toggleStatusReasonForRequest = (): void => {
		this.reasonForRequestService.updateReasonForRequestStatus(this.massActivateDeactivate)
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

		this.toasterService.showToaster(ToastOptions.Success, message);
		this.gridConfiguration.refreshGrid();
	}

	private getSuccessMessage(isMultiple: boolean, isDisabled: boolean): string {
		const baseMessage = isMultiple
				? "ReasonForRequests"
				: "ReasonForRequest",
			action = isDisabled
				? "Deactivated"
				: "Activated";
		return `${baseMessage}${action}SuccessfulConfirmation`;
	}

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction): void {
		this.massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate"
			}));
		this.toggleStatusReasonForRequest();
	}

	public navigateToAdd(): void {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private onView = (dataItem: IReasonForRequestData): void => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: IReasonForRequestData): void => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public getActionSet(): void {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration
					.showAllActionIcon(this.onView, this.onEdit, this.onActivateDeactivateAction)
			},
			{
				Status: true,
				Items: this.gridConfiguration
					.showInactiveActionIcon(this.onView, this.onEdit, this.onActivateDeactivateAction)
			}
		];
	}

	private openCopyDialogContainer(): void {
		this.dialogRef = this.kendoDialogService.open({
			content: CopyDialogComponent,
			actions: [
				{ text: this.localizationService.GetLocalizeMessage('Yescopy'), themeColor: "primary" },
				{ text: this.localizationService.GetLocalizeMessage('Nocopy'), value: CopyAction.NoCopy }
			],
			width: magicNumber.fourTwenty,
			preventAction: (ev: DialogResult, dialog) =>
				this.handleCopyDialogAction(ev, dialog)
		});

		this.bindDataInsideDialogContainer();
		this.subscribeToDialogResult();
	}

	private handleCopyDialogAction = (ev: DialogResult, dialog: DialogRef | undefined): boolean => {
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
	};

	private handleCopyDialogValidation(formGroup: FormGroup, copyToSource: IDropdownOption | null, treeValue: ITreeValue[] | null): void {
		this.toasterService.resetToaster();
		if (copyToSource && !this.isAnyTreeValue && formGroup.value.copyToDestination) {
			this.toasterService.showToaster(ToastOptions.Error, 'ReasonForRequestCopyWithNoSectorMessage', this.sectorLabelTextParams);
			return;
		}
		if (this.isAnyTreeValue &&
			(treeValue == null || treeValue.length === Number(magicNumber.zero)) && formGroup.value.copyToDestination) {
			this.toasterService.showToaster(ToastOptions.Error, 'ReasonForRequestCopySelectSectorMessage');
		}
	}

	private bindDataInsideDialogContainer(): void {
		this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
		this.copyDailogInfo.title = this.localizationService.GetLocalizeMessage("CopyEntity", [{ Value: 'ReasonForRequest', IsLocalizeKey: true }]);
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

	private subscribeToDialogResult(): void {
		this.dialogRef.result.pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((data: DialogResult) => {
				if (this.copyDailogInfo.formGroup.value.TreeValues == null) {
					return EMPTY;
				}
				this.copyInfoRequest = {
					Source: this.copyDailogInfo.formGroup.value.copyToSource?.Value,
					Destination: this.copyDailogInfo.formGroup.value.copyToDestination?.Value,
					reasonForRequestIds: this.copyDailogInfo.formGroup.value.TreeValues ?
						this.copyDailogInfo.formGroup.value.TreeValues.map((x: ITreeValue) =>
							x.value)
						: null
				};
				if ('text' in data && data.text === this.localizationService.GetLocalizeMessage('Yescopy')) {
					return this.copySectorConfirmation();
				}
				return EMPTY;
			})
		).subscribe();
	}

	private copySectorConfirmation(): Observable<ApiResponseBase> {
		this.toasterService.resetToaster();
		return this.reasonForRequestService.copyToAnotherSector(this.copyInfoRequest).pipe(
			takeUntil(this.unsubscribeAll$),
			tap((data: ApiResponseBase) => {
				if (data.StatusCode === Number(HttpStatusCode.Conflict))
					return this.toasterService.showToaster(ToastOptions.Error, 'ReasonForRequestDuplicateValidation');

				if (!data.Succeeded && data.Message)
					return this.toasterService.showToaster(ToastOptions.Error, data.Message);

				this.toasterService.showToaster(
					ToastOptions.Success,
					this.getCopyConfirmationMessage(this.copyInfoRequest.reasonForRequestIds.length)
				);

				this.gridConfiguration.refreshGrid();
				this.commonService.resetAdvDropdown(this.entityId);
			})
		);
	}

	private getCopyConfirmationMessage(length: number): string {
		if (length === Number(magicNumber.one)) return 'ReasonForRequestCopySuccessConfirmation';
		return 'ReasonForRequestsCopySuccessConfirmation';
	}

	public copySectorBtnEvent(): void {
		this.openCopyDialogContainer();
		forkJoin({
			sectorDropDownList: this.prepareSectorCopyListData(),
			destinationDropdownAndTreeData: this.setDestinationDropdownAndTreeDataOnChange()
		}).pipe(takeUntil(this.unsubscribeAll$)).subscribe();
	}

	private prepareSectorCopyListData(): Observable<GenericResponseBase<IDropdownOption[]>> {
		return this.sectorService.getSectorDropDownListV2().pipe(tap((data: GenericResponseBase<IDropdownOption[]>) => {
			if (!data.Succeeded || !data.Data) return;
			this.copyItemService.setItemListForCopyItems(data.Data);
			this.setCopySectorDropdownData(data.Data, 'copyToSource');
		}));
	}

	private setDestinationDropdownAndTreeDataOnChange(): Observable<IProcessedCopyItemChange> {
		return this.copyItemService.getChanges().pipe(
			switchMap((data: ICopyToSourceData) => {
				if (data.controlName !== 'copyToSource') return EMPTY;
				if (!data.change) {
					this.resetCopyDialogInfo();
					return EMPTY;
				}
				return this.reasonForRequestService.getDropdownRecordsBySectorId(data.change.Value).pipe(
					takeUntil(this.unsubscribeAll$),
					map((item: GenericResponseBase<TreeObject[]>) =>
						({ item, data }))
				);
			}),
			tap(({ item, data }) =>
				this.updateCopySectorTreeData(item, data))
		);
	}

	private updateCopySectorTreeData(item: GenericResponseBase<TreeObject[]>, data: ICopyToSourceData): void {
		if (!item.Succeeded || !item.Data) return;
		this.setCopySectorTreeData(item.Data);
		const copySectorDestinationDrpData = [...this.copyItemService.getItemListForCopyItems().value],
			index = copySectorDestinationDrpData.findIndex((el: ICopySectorDropData) =>
				el.Value === data.change?.Value);
		if (index === Number(magicNumber.minusOne)) return;
		copySectorDestinationDrpData.splice(index, magicNumber.one);
		this.setCopySectorDropdownData(copySectorDestinationDrpData, 'copyToDestination');
		this.copyDailogInfo.formGroup.controls["copyToDestination"].reset();
	}

	private resetCopyDialogInfo(): void {
		this.copyDailogInfo.formGroup.controls['TreeValues'].reset();
		this.copyDailogInfo.treeData = {};
		this.toasterService.resetToaster();
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		this.toasterService.resetToaster();
		this.copyDailogInfo?.close();
	}
}
