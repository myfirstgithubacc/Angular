
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { EventConfigurationService } from 'src/app/services/masters/event-configuration.service';
import { forkJoin, map, Subject, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { makeScreenScrollonError } from '@xrm-shared/directives/focus-on-erro.directive';
import { activateDeactivate, ActivateDeactivateData, AdvanceSearchFilter, ColumnOption, CopyInfoData, CopyTreeModel, dropdown, OnAllActivateDeactivate, PreventAction, Sector, SelectedEventConfig } from '../constant/event-configuration.enum';
import { DropdownModel, DynamicObject, IDropdownWithExtras, IPermissionInfo, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { TerminationReason } from '@xrm-core/models/termination-reason';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { DropdownData } from '@xrm-master/user/model/model';
import { CopyDropdownModel } from '@xrm-core/models/expense-type/copy-dropdown.model';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { Permission } from '@xrm-shared/enums/permission.enum';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy{
	public actionSet: IRecordButtonGrid[];
	public isServerSidePagingEnable: boolean = true;
	public entityId = XrmEntities.EventConfiguration;
	public pageSize: number;
	public selectedEventConfig: SelectedEventConfig;
	public massActivateDeactivate: activateDeactivate[];
	public tabOptions: ITabOptions;
	public columnOptions: ColumnOption[] | undefined;
	public treeData: [];
	public searchText: string = '';
	private ngUnsubscribe$ = new Subject<void>();
	public isActionIdFound: boolean;
	public viewPermission:Permission[]|undefined = [];
	public dialogRef: DialogRef;
	public copyDailogInfo: CopyDialogComponent;
	public appliedAdvFilter: AdvanceSearchFilter;
	public apiUrlForGrid: string = "encf/paged";
	public apiUrlForAdv: string = "encf/select-paged";
	public extraButton = this.gridConfiguration.showCopyButtonIcon(griHeaderType);
	public copyInfo: CopyInfoData;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		public sector: SectorService,
		public gridConfiguration: GridConfiguration,
		private eventConfigServc: EventConfigurationService,
		private gridService: GridViewService,
		private gridConfigurationServ: GridConfiguration,
		private activatedroute: ActivatedRoute,
		public permissionService: PermissionsService,
		private copyItemServc: CopyItemService,
		private localizationServc: LocalizationService,
		private kendoDialogServc: DialogService,
		private toastServc: ToasterService
	) {
		this.getActionSet();
	}

	ngOnInit(): void {
		this.getTabOption();
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: Params) => {
			this.permissionService.permission = data['permission'];
			this.getActionSet();
		});
		this.checkPermission();
		forkJoin({
			columnData: this.getColumnData(),
			pageSizeData: this.getPageSize()
		}).subscribe({
			next: (results) => {
				const columnRes = results.columnData,
				 pageSizeRes = results.pageSizeData;
				if (columnRes.Succeeded) {
					this.columnOptions = columnRes.Data?.map((e: GridColumnCaption) => {
						e.fieldName = e.ColumnName;
						e.columnHeader = e.ColumnHeader;
						e.visibleByDefault = e.SelectedByDefault;
						return e;
					});
				}
				if (pageSizeRes.StatusCode == HttpStatusCode.Ok) {
					this.pageSize = pageSizeRes.Data.PageSize;
				}
			}
		});

		this.handleCopyItemChanges();
	}

	public checkPermission(){
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((action: Params) => {
			this.isActionIdFound = action['permission']
				? action['permission'].some((permission: IPermissionInfo) =>
					permission.ActionId === Number(Permission.VIEW_ONLY))
				: false;
		});
	}

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

	private onActivateDeactivateAction = (dataItem: ActivateDeactivateData, action: string) => {
		this.massActivateDeactivate = [];
		this.selectedEventConfig = dataItem;
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
				Disabled: event.actionName === 'deactivate',
				ReasonForChange: null
			}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivate();
	}

	private activateDeactivate() {
		this.eventConfigServc.updateEventConfigStatus(this.massActivateDeactivate).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res:ApiResponse) =>
		{
			if(!res.Succeeded) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
				return;
			}

			if (this.massActivateDeactivate[magicNumber.zero].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'EventConfigurationDeactivatedSuccessfully');

			} else if (!this.massActivateDeactivate[Number(magicNumber.zero)].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'EventConfigurationActivatedSuccessfully');
			}

			if (this.massActivateDeactivate.length > Number(magicNumber.one) && this.massActivateDeactivate[magicNumber.zero].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'SelectedEventConfigDeactivatedSuccessfully');
			}
			else if (this.massActivateDeactivate.length > Number(magicNumber.one) && !this.massActivateDeactivate[magicNumber.zero].Disabled) {
				this.toastServc.resetToaster();
				this.toastServc.showToaster(ToastOptions.Success, 'SelectedEventConfigActivatedSuccessfully');
			}
			this.gridConfiguration.refreshGrid();
		});
	}

	private getColumnData() {
		return this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.ngUnsubscribe$));
	}

	private getPageSize() {
		return this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.ngUnsubscribe$));
	}


	onView = (dataItem: TerminationReason) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};
	onEdit = (dataItem: TerminationReason) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};


	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	public onSearch(searchtext: string) {
		this.searchText = searchtext;
	}
	public onFilter(filteredData: AdvanceSearchFilter) {
		this.appliedAdvFilter = filteredData;
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
			validationMessage: 'PleaseSelectTo',
			validationMessageDynamicParam: this.sectorLabelTextParams,
			tooltipTitleLocalizeParam: this.sectorLabelTextParams
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
							text: 'All',
							items: requiredTreeArray
						}
					],
					label: 'SelectEventToCopy',
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
		this.copyItemServc.getChanges().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: CopyTreeModel) => {
				if (data.controlName == 'copyToSourceSector') {
					if (data.change == undefined) {
						this.resetCopyDialogInfo();
					} else {
						this.fetchAndSetCopyDialogInfo(data.change.Value);
					}
				}
			}
		});
	}
	private resetCopyDialogInfo(): void {
		this.copyDailogInfo.formGroup.controls['TreeValues'].reset();
		this.copyDailogInfo.treeData = {};
		this.copyDailogInfo.formGroup.controls['copyToDestinationSector'].reset();
		this.setCopyDropdownData([], 'copyToDestinationSector');
	}
	private fetchAndSetCopyDialogInfo(sectorValue: string): void {
		this.eventConfigServc.getEventsBasedOnSectorId(sectorValue)
			.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((item: ApiResponse) => {
				if (item.Succeeded) {
					this.setCopySectorTreeData(item.Data);
				}
			});
		this.eventConfigServc.getSector()
			.pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: ApiResponse) => {
				if (res.Succeeded) {
					const destinationData = res.Data,
					 filteredDestinationData = destinationData.filter((sector: Sector) =>
							sector.Value !== sectorValue);
					this.setCopyDropdownData(filteredDestinationData, 'copyToDestinationSector');
				}
			});
	}


	public openCopy() {
		let fromSectorData: DropdownData[] = [];
		this.eventConfigServc.GetSectorForEventCopyDropdown().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: ApiResponse) => {
			if (data.Succeeded) {
				this.copyItemServc.setItemListForCopyItems(data.Data);
				fromSectorData = data.Data;
				fromSectorData.sort((a, b) =>
					a.Text.localeCompare(b.Text));
				this.setCopyDropdownData(fromSectorData, 'copyToSourceSector');
			}
		});
		this.subFnOpenCopy();
		this.copyDailogInfo = this.dialogRef.content
			.instance as CopyDialogComponent;
		this.copyDailogInfo.title = this.localizationServc.GetLocalizeMessage(
			'CopyEvents',
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
					themeColor: 'primary',
					value: Number(magicNumber.one)
				},
				{ text: this.localizationServc.GetLocalizeMessage('Nocopy'),
					value: Number(magicNumber.zero) }
			],
			width: Number(magicNumber.fourTwenty),
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
					this.toastServc.showToaster(ToastOptions.Error, 'PleaseSelectAtleastOneEventToCopy');
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
			eventConfiIds: this.copyDailogInfo.formGroup.value.TreeValues
				? this.copyDailogInfo.formGroup.value.TreeValues.map((x: CopyDropdownModel) =>
					x.value)
				: null,
			destinationSectorId:
				this.copyDailogInfo.formGroup.value.copyToDestinationSector?.Value
		};
		this.eventConfigServc.eventCopyToAnotherSector(this.copyInfo).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: ApiResponse) => {
			if (data.StatusCode == HttpStatusCode.Conflict) {
				this.toastServc.showToaster(ToastOptions.Success, 'EventCopySuccessConfirmation');
			} else if (data.StatusCode == HttpStatusCode.Ok) {
				this.gridConfigurationServ.refreshGrid();
				this.toastServc.showToaster(ToastOptions.Success, 'EventCopySuccessConfirmation');
			} else if (data.StatusCode == HttpStatusCode.NotFound) {
				this.toastServc.showToaster(ToastOptions.Success, 'EventCopySuccessConfirmation');
			}
			this.dialogRef.close();
		});
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.toastServc.resetToaster();
	}

}
