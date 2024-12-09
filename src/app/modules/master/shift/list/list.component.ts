import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { NavigationPaths } from '../constant/routes-constant';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { advancesearch } from '@xrm-shared/widgets/advance-search/advance-search/interface/advance-search.modal';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { makeScreenScrollonError } from '@xrm-shared/directives/focus-on-erro.directive';
import { CommonService } from '@xrm-shared/services/common.service';
import { activateDeactivate, ActivateDeactivateData, AdvanceSearchFilter, CopyInfo, CopyTreeModel, dropdown, OnAllActivateDeactivate, PreventAction, SectorDdlData } from '../constant/shift-data.model';
import { DropdownModel, DynamicObject, IDropdownWithExtras, IPermissionInfo, ITabOptions } from '@xrm-shared/models/common.model';
import { TerminationReason } from '@xrm-core/models/termination-reason';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { CopyDropdownModel } from '@xrm-core/models/expense-type/copy-dropdown.model';
import { DropdownData } from '@xrm-master/user/model/model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActionSetItem } from '@xrm-master/retiree-options/constant/retiree.enum';
import { Permission } from '@xrm-shared/enums/permission.enum';


@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit {
	public list = [];
	public isActionIdFound: boolean;
	public viewPermission: Permission[]|undefined = [];
	public actionSet: ActionSetItem[];
	public pageSize = magicNumber.zero;
	public tabOptions: ITabOptions;
	public entityId = XrmEntities.Shift;
	public columnOptions: GridColumnCaption[];
	public massActivateDeactivate: activateDeactivate[];
	private ngUnsubscribe$ = new Subject<void>();
	public selectedShift: ActivateDeactivateData;
	public selectTextsearch: string = '';
	public appliedFilterCount: number = magicNumber.zero;
	public treeData: [];
	public sectorDdlData: SectorDdlData;
	public copyInfo: CopyInfo;
	public advanceSearchFields: advancesearch[];
	public formValueExists: boolean = false;
	public copyDailogInfo: CopyDialogComponent;
	public extraButton = this.gridConfigurationServ.showCopyButtonIcon(griHeaderType);
	private dialogRef: DialogRef;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public isServerSidePagingEnable: boolean = true;
	public apiUrlForGrid: string = "shft/paged";
	public apiUrlForAdv: string = "shft/select-paged";
	public searchText: string = '';
	public appliedAdvFilter: AdvanceSearchFilter;
	private toSectorData: [];
	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		public shiftService: ShiftGatewayService,
		private copyItemServc: CopyItemService,
		private loaderService: LoaderService,
		private gridConfigurationServ: GridConfiguration,
		private gridService: GridViewService,
		private dialogPopupServc: DialogPopupService,
		private kendoDialogServc: DialogService,
		private localizationServc: LocalizationService,
		private toastServc: ToasterService,
		public permissionService: PermissionsService,
		private activatedroute: ActivatedRoute,
		public commonService: CommonService

	) { }

	ngOnInit(): void {
		this.getActionSet();
		this.getTabOption();
		this.handleCopyItemChanges();
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: Params) => {
			this.permissionService.permission = data['permission'];
			this.getActionSet();
		});

		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(([firstresponse, secondresponse]) => {
			this.getColumnData(firstresponse);
			this.getPageSize(secondresponse);

		});
		this.checkPermission();
	}

	public checkPermission(){
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((action: Params) => {
			this.isActionIdFound = action['permission']
				? action['permission'].some((permission: IPermissionInfo) =>
					permission.ActionId === Number(Permission.VIEW_ONLY))
				: false;
		});
	}

	onView = (dataItem: TerminationReason) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	onEdit = (dataItem: TerminationReason) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	private getTabOption() {
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

	public getActionSet() {
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

	public onSearch(searchtext: string) {
		this.searchText = searchtext;
	}
	public onFilter(filteredData: AdvanceSearchFilter) {
		this.appliedAdvFilter = filteredData;
	}

	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	getPageSize(res:GenericResponseBase<{PageSize : number}>) {
		this.loaderService.setState(true);
		if (res.StatusCode == Number(HttpStatusCode.Ok) && res.Data) {
			this.loaderService.setState(false);
			const Data = res.Data;
			this.pageSize = Data.PageSize;
		}
	}

	private getColumnData(res:GenericResponseBase<GridColumnCaption[]>) {
		this.loaderService.setState(true);
		if (res.Succeeded && res.Data) {
			this.loaderService.setState(false);
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}

	}

	private onActivateDeactivateAction = (dataItem: ActivateDeactivateData, action: string) => {
		this.massActivateDeactivate = [];
		this.selectedShift = dataItem;
		const Data:activateDeactivate = {
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: ''
		};
		this.massActivateDeactivate.push(Data);
		if (action == dropdown.Activate || action == dropdown.Deactivate) {
			this.activateDeactivate();
		}
	};

	public onAllActivateDeactivateAction(event: OnAllActivateDeactivate) {
		const massActivateDeactivate: activateDeactivate[] = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate",
				ReasonForChange: null
			}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivate();
	}


	private activateDeactivate() {
		this.shiftService.activateDeactivateShift(this.massActivateDeactivate).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res:ApiResponse) => {
			if(!res.Succeeded) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
				return;
			}

			if (this.massActivateDeactivate[magicNumber.zero].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'ShiftDeactivatedSuccessfully');

			} else if (!this.massActivateDeactivate[Number(magicNumber.zero)].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'ShiftActivatedSuccessfully');
			}

			if (this.massActivateDeactivate.length > Number(magicNumber.one) && this.massActivateDeactivate[magicNumber.zero].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'SelectedShiftDeactivatedSuccessfully');
			}
			else if (this.massActivateDeactivate.length > Number(magicNumber.one) && !this.massActivateDeactivate[magicNumber.zero].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'SelectedShiftActivatedSuccessfully');
			}
			this.gridConfigurationServ.refreshGrid();
		});
	}

	public copyDialogData = [
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
			controlName: 'copyToDestinationSector',
			tooltipTitleLocalizeParam: this.sectorLabelTextParams,
			validationMessage: 'PleaseSelectTo',
			validationMessageDynamicParam: this.sectorLabelTextParams
		},
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'ToLocation' },
			labelLocalizeParam: this.sectorLabelTextParams,
			tooltipVisible: true,
			tooltipTitleParam: [],
			tooltipTitle: 'ToLocationShift',
			dropdownData: [],
			controlName: 'copyToDestinationLocation',
			tooltipTitleLocalizeParam: '',
			notRequired: true
		}
	];

	public setCopyDropdownData(drpData: IDropdownWithExtras[], controlName: string) {
		const index = this.copyDialogData.findIndex((i) =>
			i.controlName == controlName);
		if (index >= Number(magicNumber.zero)) {
			this.copyDialogData[index].dropdownData = drpData;
		}
	}

	private setCopySectorTreeData(treeArray: DropdownModel[]) {
		if (treeArray.length == Number(magicNumber.zero)) {
			this.copyDailogInfo.treeData = {};
		} else {
			const requiredTreeArray = treeArray.map((obj: IDropdownWithExtras) =>
					Object.keys(obj).reduce((accumulator: DynamicObject, key: string) => {
						accumulator[key.toLowerCase()] = obj[key];
						return accumulator;
					}, {})),
				treeData = {
					treeData: [
						{
							text: dropdown.All,
							items: requiredTreeArray
						}
					],
					label: 'SelectShiftToCopy',
					tooltipVisible: false,
					textField: 'text',
					tooltipTitleParams: [],
					tooltipTitle: 'SelectTheRecordsToCopy',
					tooltipTitleLocalizeParam: [],
					isRequired: true,
					treeViewType: "copyTree"
				};
			this.copyDailogInfo.treeData = treeData;
		}
	}

	private handleCopyItemChanges(): void {
		this.loaderService.setState(true);
		this.copyItemServc.getChanges().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: CopyTreeModel) => {
				if (data.controlName == 'copyToSourceSector') {
					this.copyDailogInfo.formGroup.controls['copyToDestinationSector'].reset();
					this.copyDailogInfo.formGroup.controls['copyToDestinationLocation'].reset();
					this.setCopyDropdownData([], 'copyToDestinationLocation');
					this.setCopyDropdownData([], 'copyToDestinationSector');
					if (data.change == undefined) {
						this.copyDailogInfo.formGroup.controls['TreeValues'].reset();
						this.copyDailogInfo.treeData = {};
					}else{
						const toDestinationSector = this.toSectorData.filter((el: DropdownModel) =>
							el.Value !== data.change?.Value);
						this.setCopyDropdownData(toDestinationSector, 'copyToDestinationSector');
					}
					this.shiftService.getAllShiftBySectorId(data.change?.Value ?? '')
						.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((item: ApiResponse) => {
							if (item.Succeeded) {
								this.setCopySectorTreeData(item.Data);
								this.loaderService.setState(false);
							}
						});
				} else if (data.controlName == 'copyToDestinationSector') {
					const copyToDestinationSector = data.change;
					if (copyToDestinationSector) {
						this.copyDailogInfo.formGroup.controls['copyToDestinationLocation'].reset();
						this.setCopyDropdownData([], 'copyToDestinationLocation');
						this.loaderService.setState(true);
						this.shiftService.getWorkLocationDropdown(copyToDestinationSector.Value)
							.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data2: ApiResponse) => {
								if (data2.Succeeded) {
									this.setCopyDropdownData(data2.Data, 'copyToDestinationLocation');
								}
								this.loaderService.setState(false);
							});
					} else {
						this.copyDailogInfo.formGroup.patchValue({
							copyToDestinationLocation: null
						});
						this.setCopyDropdownData([], 'copyToDestinationLocation');
					}
				}
			}
		});
	}

	public openCopy() {
		this.setCopyDropdownData([], 'copyToDestinationLocation');
		let fromSectorData: DropdownData[] = [];
		this.toSectorData = [];
		this.shiftService.getCopySectorDropdownData().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: SectorDdlData) => {
			this.sectorDdlData = data;
			if (data.ddlShift.Succeeded) {
				this.copyItemServc.setItemListForCopyItems(data.ddlShift.Data);
				fromSectorData = data.ddlShift.Data;
				this.toSectorData = this.sectorDdlData.ddlSector.Data;
				fromSectorData.sort((a, b) =>
					a.Text.localeCompare(b.Text));
				this.setCopyDropdownData(fromSectorData, 'copyToSourceSector');

			}
		});

		this.subFnOpenCopy();
		this.copyDailogInfo = this.dialogRef.content
			.instance as CopyDialogComponent;
		this.copyDailogInfo.title = this.localizationServc.GetLocalizeMessage(
			'CopyShift',
			this.sectorLabelTextParams
		);
		this.copyDailogInfo.copydialogdata = this.copyDialogData;
		this.copyDailogInfo.treeData = this.treeData;
		this.copyDailogInfo.treeData = this.treeData;
	}

	subFnOpenCopy() {
		this.dialogRef = this.kendoDialogServc.open({
			content: CopyDialogComponent,
			actions: [
				{
					text: this.localizationServc.GetLocalizeMessage('Yescopy'),
					themeColor: 'primary', value: magicNumber.one
				},
				{ text: this.localizationServc.GetLocalizeMessage('Nocopy'), value: magicNumber.zero }
			],
			width: magicNumber.fourTwenty,
			preventAction: (ev: DialogResult, dialog) => {
				const preventActionEvent = ev as PreventAction,
				 formGroup = (dialog?.content.instance as CopyDialogComponent).formGroup,
					 treeValue = formGroup.get('TreeValues')?.value,
					 copyToSourceSectorStatus = formGroup.get('copyToSourceSector')?.value;

				if (!formGroup.valid) {
					formGroup.markAllAsTouched();
					makeScreenScrollonError(treeValue);
				}
				if (preventActionEvent.value == Number(magicNumber.zero)) {
					dialog?.close();
					this.toastServc.resetToaster();
				} else if (copyToSourceSectorStatus && ((treeValue == null || treeValue == undefined || treeValue.value == "") && preventActionEvent.value == Number(magicNumber.one))) {
					this.toastServc.resetToaster();
					this.toastServc.showToaster(ToastOptions.Error, 'PleaseSelectAtleastOneShiftToCopy');
				} else if (preventActionEvent.value == Number(magicNumber.one) && formGroup.valid) {
					this.copyConfirmation();
					return true;
				}
				return !formGroup.valid;
			}
		});

	}


	private copyConfirmation() {
		this.copyInfo = {
			sourceSectorId:
				this.copyDailogInfo.formGroup.value.copyToSourceSector?.Value,
			shiftIds: this.copyDailogInfo.formGroup.value.TreeValues
				? this.copyDailogInfo.formGroup.value.TreeValues.map((x: CopyDropdownModel) =>
					x.value)
				: null,
			destinationSectorId:
				this.copyDailogInfo.formGroup.value.copyToDestinationSector?.Value,
			destinationLocationId:
				this.copyDailogInfo.formGroup.value.copyToDestinationLocation
					?.Value
		};
		this.shiftService.shiftCopyToAnotherSector(this.copyInfo).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: ApiResponse) => {
			if (data.StatusCode == HttpStatusCode.Conflict) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'ShiftCopySuccessConfirmation');
				this.commonService.resetAdvDropdown(this.entityId);
			} else if (data.StatusCode == HttpStatusCode.Ok) {
				this.gridConfigurationServ.refreshGrid();
				this.commonService.resetAdvDropdown(this.entityId);
				this.toastServc.showToaster(ToastOptions.Success, 'ShiftCopySuccessConfirmation');
				this.commonService.resetAdvDropdown(this.entityId);
			} else if (data.StatusCode == HttpStatusCode.NotFound) {
				this.toastServc.showToaster(ToastOptions.Success, 'ShiftCopySuccessConfirmation');
				this.commonService.resetAdvDropdown(this.entityId);
			} else if (data.StatusCode == HttpStatusCode.BadRequest) {
				this.toastServc.showToaster(ToastOptions.Error, 'PleaseSelectSectorHavingSameDifferentialMethod');
				return;
			}
			this.dialogRef.close();
		});
	}

	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.dialogPopupServc.resetDialogButton();
		this.toastServc.resetToaster();
	}
}
