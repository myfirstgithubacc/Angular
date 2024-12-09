import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { CopyDialogComponent } from '@xrm-widgets';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { NavigationPaths } from '../constant/routes-constant';
import { RequisitionLibrary } from '@xrm-core/models/requisition-library.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { RequisitionLibraryGatewayService } from 'src/app/services/masters/requisition-library-gateway.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { EMPTY, forkJoin, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { CopyData, RequisitionDataAddEdit } from '../constant/rate-enum';
import { IBulkStatusUpdateAction, ICopyDialogData, ICopyToSourceData, IDropdownOption, IPageSize, IPermissionInfo, IRecordButtonGrid, ITabOptions, TreeObject } from '@xrm-shared/models/common.model';
import { AdvanceSearchFilter } from 'src/app/modules/contractor/contractor-details/constant/contractor-interface';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { FormGroup } from '@angular/forms';
import { CopyAction } from '@xrm-shared/enums/enums-constant';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public CopyDialogRef: CopyDialogComponent;
	public appliedFilterCount: number = magicNumber.zero;
	public actionSet: IRecordButtonGrid[];
	public massActivateDeactivate: ActivateDeactivate[];
	public LocationData: IDropdownOption[];
	public filteredDataCopyDestinationLocation: IDropdownOption[];
	public pageSize = magicNumber.zero;
	public entityId = XrmEntities.RequisitionLibrary;
	public dialogRef: DialogRef;
	public copiedData: CopyData;
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	public toLocationLabelTextParams: DynamicParam[] = [{ Value: 'Location', IsLocalizeKey: true }];
	public extraButton = this.gridConfiguration.showCopyButtonIcon(griHeaderType);
	public isActionIdFound: boolean;
	public isServerSidePagingEnable: boolean = true;
	public apiUrlForGrid: string = "rqlib/paged";
	public apiUrlForAdv: string = "rqlib/select-paged";
	public searchText: string ='';
	public appliedAdvFilter: AdvanceSearchFilter;
	public tabOptions: ITabOptions;
	public columnOptions: GridColumnCaption[];
	private ngUnsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		public requisitionLibrary: RequisitionLibraryGatewayService,
		private router: Router,
		private copyItemService: CopyItemService,
		private dialog: DialogService,
		private gridService: GridViewService,
		private gridConfiguration: GridConfiguration,
		private loaderService: LoaderService,
		private toasterServc: ToasterService,
		public permissionService: PermissionsService,
		private activatedroute: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private localizationService: LocalizationService

	) {
		this.dataInitializationOnConstructor();
	}

	ngOnInit(): void {
		this.checkPermission();
		this.callColumnAndPageData();
		this.handleCopyServiceChanges();
	}

	public checkPermission(){
		this.activatedroute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((action: Params) => {
			this.isActionIdFound = action['permission']
				? action['permission'].some((permission: IPermissionInfo) =>
					permission.ActionId === Number(Permission.VIEW_ONLY))
				: false;
		});
	}

	private callColumnAndPageData() {
		this.loaderService.setState(true);

		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.ngUnsubscribe$)),
			pageSize: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.ngUnsubscribe$))
		}).subscribe({
			next: (results: { columnData: GenericResponseBase<GridColumnCaption[]>, pageSize: GenericResponseBase<IPageSize> }) => {
				this.processColumnData(results.columnData);
				this.processPageSize(results.pageSize);
				this.loaderService.setState(false);
			},
			error: () => {
				this.loaderService.setState(false);
			}
		});
	}

	private processColumnData(columnData: GenericResponseBase<GridColumnCaption[]>) {
		if (isSuccessfulResponse(columnData)) {
			this.columnOptions = columnData.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
			this.columnOptions = this.columnOptions.filter((dt: GridColumnCaption) =>
				dt.ColumnHeader != "JobLevel");
			this.cdr.markForCheck();

		}
	}

	private processPageSize(pageSize: GenericResponseBase<IPageSize>) {
		if (pageSize.StatusCode === Number(HttpStatusCode.Ok) && pageSize.Data) {
			this.pageSize = pageSize.Data.PageSize;
		}
	}

	private dataInitializationOnConstructor() {
		this.getActionSet();
		this.getTabOption();
	}

	public getActionSet() {
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

	private onView = (dataItem: RequisitionDataAddEdit) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: RequisitionDataAddEdit) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private callCopyLocationToAnotherLocation(): Observable<ApiResponseBase> {
		return this.requisitionLibrary.copyAnotherLocation(this.copiedData)
			.pipe(takeUntil(this.ngUnsubscribe$), tap((data: ApiResponseBase) => {
				this.toasterServc.showToaster(ToastOptions.Success, 'ReqLibraryCopiedSuccessfully');
				this.gridConfiguration.refreshGrid();
			}));
	}

	private handleCopyServiceChanges(): void {
		this.copyItemService.getChanges().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: ICopyToSourceData) => {
			if (data.controlName === 'CopySourceSector') {
				this.subFnHandleCopyServiceChanges(data);
			}
			else if (data.controlName === 'CopySourceLocation') {
				this.subFnHandleCopySourceLocation(data);
			}
		});
	}

	private subFnHandleCopyServiceChanges(data: ICopyToSourceData) {
		if (data.change) {
			this.loaderService.setState(true);
			this.requisitionLibrary.GetLocationDropdownForReqLibraryAsync(data.
				change.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
				next: (data2: GenericResponseBase<IDropdownOption[]>) => {
					if (isSuccessfulResponse(data2)) {
						this.LocationData = data2.Data;
						this.cdr.markForCheck();
						this.setCopyDropdownData(this.LocationData, 'CopySourceLocation');
					}
					this.CopyDialogRef.formGroup.patchValue({
						CopySourceLocation: null,
						CopyDestinationLocation: null
					});
				}
			});
			this.requisitionLibrary
				.getWorkLocationDropdown(data.change.Value)
				.pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
					next: (data3: GenericResponseBase<IDropdownOption[]>) => {
						if (isSuccessfulResponse(data3)) {
							this.filteredDataCopyDestinationLocation = data3.Data;
						}
						this.loaderService.setState(false);
						this.setCopyDropdownData([], 'CopyDestinationLocation');
					}
				});
		} else {
			this.CopyDialogRef.formGroup.patchValue({
				CopySourceLocation: null,
				CopyDestinationLocation: null
			});
			this.setCopyDropdownData([], 'CopySourceLocation');
			this.setCopyDropdownData([], 'CopyDestinationLocation');
		}
	}

	private subFnHandleCopySourceLocation(data: ICopyToSourceData) {
		if (data.change) {
			const filteredDataDestination =
				this.filteredDataCopyDestinationLocation.filter((d: IDropdownOption) => {
					return d.Value != data.change?.Value;
				});
			this.setCopyDropdownData(filteredDataDestination, 'CopyDestinationLocation');
			this.CopyDialogRef.formGroup.patchValue({
				CopyDestinationLocation: null
			});
		} else {
			this.CopyDialogRef.formGroup.patchValue({
				CopyDestinationLocation: null
			});
			this.setCopyDropdownData([], 'CopyDestinationLocation');
		}
	}

	private onActivateDeactivateAction = (dataItem: RequisitionDataAddEdit) => {
		this.massActivateDeactivate = [];
		const Data = new RequisitionLibrary({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: ''
		});
		this.massActivateDeactivate.push(Data);
		this.activateDeactivateReqLibrary();
	};

	public onAllActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		const massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate",
				ReasonForChange: ''
			}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivateReqLibrary();
	}

	public onSearch(searchtext: string) {
		this.searchText = searchtext;
	}

	public onFilter(filteredData: AdvanceSearchFilter) {
		this.appliedAdvFilter = filteredData;
	}

	private activateDeactivateReqLibrary() {
		this.requisitionLibrary.activatedeactivateRequisitionLibrary(this.massActivateDeactivate)
			.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: ApiResponseBase) => {
				if(!res.Succeeded) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					return;
				}
				if (this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'ReqLibDeactivatedSuccessfully');

				} else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'ReqLibActivatedSuccessfully');
				}

				if (this.massActivateDeactivate.length > Number(magicNumber.one) && this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedReqLibDeactivatedSuccessfully');
				}
				else if (this.massActivateDeactivate.length > Number(magicNumber.one) && !this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedReqLibActivatedSuccessfully');
				}
				this.gridConfiguration.refreshGrid();
			});
	}

	public copyDialogData: ICopyDialogData[] = [
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'Sector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			tooltipVisible: false,
			tooltipTitle: 'FromSector',
			dropdownData: [],
			controlName: 'CopySourceSector',
			tooltipTitleLocalizeParam: this.sectorLabelTextParams,
			IsTreePresent: false,
			validationMessage: 'PleaseSelectData',
			validationMessageDynamicParam: this.sectorLabelTextParams,
			tooltipTitleParam: []
		},
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'FromLocation' },
			labelLocalizeParam: [],
			tooltipVisible: false,
			tooltipTitle: 'FromLocation',
			dropdownData: [],
			controlName: 'CopySourceLocation',
			tooltipTitleLocalizeParam: [],
			IsTreePresent: false,
			validationMessage: 'PleaseSelectFrom',
			validationMessageDynamicParam: this.toLocationLabelTextParams,
			tooltipTitleParam: []
		},
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'ToLocation' },
			labelLocalizeParam: [],
			tooltipVisible: false,
			tooltipTitle: 'ToLocation',
			dropdownData: [],
			controlName: 'CopyDestinationLocation',
			tooltipTitleLocalizeParam: [],
			IsTreePresent: false,
			validationMessage: 'PleaseSelectTo',
			validationMessageDynamicParam: this.toLocationLabelTextParams,
			tooltipTitleParam: []
		}
	];

	public setCopyDropdownData(dropdownData: IDropdownOption[], controlName: string): void {
		const index = this.copyDialogData.findIndex((data: ICopyDialogData) =>
			data.controlName == controlName);
		if (index != -magicNumber.one) {
			this.copyDialogData[index].dropdownData = dropdownData;
		}
		this.CopyDialogRef.copydialogdata = this.copyDialogData;
	}

	public openCopy() {
		this.loaderService.setState(true);
		this.requisitionLibrary.getSectorDropdownForReqLibraryAsyn().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (dt: GenericResponseBase<IDropdownOption[]>) => {
				if (isSuccessfulResponse(dt)) {
					this.setCopyDropdownData(dt.Data, 'CopySourceSector');
					this.loaderService.setState(false);
				}
			}
		});
		this.dialogRef = this.dialog.open({
			content: CopyDialogComponent,
			actions: [
				{ text: this.localizationService.GetLocalizeMessage('Yescopy'), themeColor: 'primary' },
				{ text: this.localizationService.GetLocalizeMessage('Nocopy'), value: CopyAction.NoCopy}
			],
			width: magicNumber.fourTwenty,
			preventAction: (ev: DialogResult, dialog) => {
				if ('value' in ev && ev.value == magicNumber.tweleve) {
					dialog?.close();
					this.toasterServc.resetToaster();
				}
				const formGroup = (dialog?.content.instance as CopyDialogComponent).formGroup;
				if (!formGroup.valid) {
					formGroup.markAllAsTouched();
				}
				return !formGroup.valid;
			}
		});

		this.CopyDialogRef = this.dialogRef.content.instance as CopyDialogComponent;
		this.CopyDialogRef.title = 'CopyRequisitionLibrary';
		this.CopyDialogRef.copydialogdata = this.copyDialogData;

		this.dialogRef.result.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((dataDialog: DialogResult) =>
				this.handleDialogResult(dataDialog))
		).subscribe();
	}

	private handleDialogResult(data: DialogResult): Observable<ApiResponseBase>{
		const formValuesForCopy = this.CopyDialogRef.formGroup.value;
		this.copiedData = {
			sourceSectorId: formValuesForCopy.CopySourceSector?.Value,
			sourceLocationId: formValuesForCopy.CopySourceLocation?.Value,
			destinationLocationId: formValuesForCopy.CopyDestinationLocation?.Value
		};

		if (!('text' in data) || !(data.text === this.localizationService.GetLocalizeMessage('Yescopy')))
			return EMPTY;

		return this.callCopyLocationToAnotherLocation();
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}
