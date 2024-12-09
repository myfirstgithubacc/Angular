import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { NavigationPaths } from '../route-constants/route-constants';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
import { getTabsAndActions, hasPermissions } from '../../../expense/utils/userDependentList';
import { HttpStatusCode } from '@angular/common/http';
import { TimeSheetList } from '@xrm-core/models/acrotrac/time-entry/time-entry-model';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { statusIds } from '../../../expense/expense/enum-constants/enum-constants';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { TimeEntryService } from 'src/app/services/acrotrac/time-entry.service';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { createToasterTable, setStartPoint } from '../../../expense/utils/CommonEntryMethods';
import { PayloadItem } from '@xrm-core/models/acrotrac/time-adjustment/adjustment-interface';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { IMassActionButton } from '@xrm-shared/models/mass-action-button.model';
import { EntityAction } from '@xrm-shared/models/menu-interface';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBulkStatusUpdateAction} from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public searchList: string;
	public entityId: number = XrmEntities.Time;
	public isLoading: boolean = false;
	public pageSize: number;
	public multiSelect: boolean = true;
	public hasReviewPermission: boolean = false;
	public actionSet: IActionSetModel[];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'time/paged';
	public advApiAddress: string = 'time/select-paged';
	public columnOptions: GridColumnCaption[];
	public tabOptions: ITabOption;
	public appliedAdvFilters: TimeSheetList[];
	public timeSheetLabelTextParams: DynamicParam[] = [{ Value: 'TimesheetEntry', IsLocalizeKey: true }];
	public isShowPopup: boolean = false;
	public massActionButtonSet: IMassActionButton[];
	public isShowSuccess: boolean = false;
	public magicNumber = magicNumber;
	public manageActionSets: ManageGridActionSet[] = [
		{
			ColumnName: 'IsAdjustmentAllowed',
			ColumnValue: false,
			ActionTitles: ['Adjust Timesheet']
		},
		{
			ColumnName: 'IsAdjustmentViewAllowed',
			ColumnValue: false,
			ActionTitles: ['View']
		},
		{
			ColumnName: 'IsAdjustmentReviewAllowed',
			ColumnValue: false,
			ActionTitles: ['Review']
		},
		{
			ColumnName: 'IsAdjustmentEditAllowed',
			ColumnValue: false,
			ActionTitles: ['Edit']
		}
	];

	private roleId: number;
	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	private selectedRows: string[] = [];

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private gridService: GridViewService,
		private localizationService: LocalizationService,
		private timeEntryService: TimeEntryService,
		private expEntryService: ExpenseEntryService,
		private menuService: MenuService,
		private toasterService: ToasterService,
		private gridConfiguration: GridConfiguration,
		private sessionStorageService: SessionStorageService,
		private cdr: ChangeDetectorRef
	) {
		this.roleId = parseInt(sessionStorage.getItem('RoleGroupId') ?? '0') || magicNumber.zero;
		this.createTabOptions();
		this.massActionButtonSet = [
			{
				tabName: "PendingMyApprovals",
				button: [
					{
						id: 1,
						isActiveType: true,
						title: "Approve",
						icon: "check-activate",
						color: "green-color"
					}
				]
			}
		];
	}

	ngOnInit(): void {
		forkJoin({
			'ColumnOptionsRes': this.gridService.getColumnOption(this.entityId),
			'PageSizeRes': this.gridService.getPageSizeforGrid(this.entityId)
		}).pipe((takeUntil(this.destroyAllSubscribtion$)), switchMap((data: {
			ColumnOptionsRes: GenericResponseBase<GridColumnCaption[]>,
			PageSizeRes: GenericResponseBase<{ PageSize: number }>
		}) => {
			this.getGridColumnData(data.ColumnOptionsRes);
			this.getGridPageSizeData(data.PageSizeRes);
			return this.menuService.getAuthorizedActionsList();
		})).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: EntityAction[]) => {
				this.getMenuService(res);
				this.cdr.markForCheck();
			});
	}

	private getMenuService(res: EntityAction[]): void {
		this.hasReviewPermission = this.loginUserHasReviewPermission(res[0].EntityActions);
	}

	private loginUserHasReviewPermission(entityActions: {EntityTypeId: number, EntityType: string, ActionId: number, ActionName: string}[]): boolean {
		return (hasPermissions(entityActions, Permission.REVIEW_APPROVE) || hasPermissions(entityActions, Permission.REVIEW_DECLINE));
	}

	private createTabOptions(): void {
		const { userPrefferedtabs, userPrefferedActions } = getTabsAndActions<TimeSheetList>(this.roleId, this.ListNavigator, this.entityId);
		this.tabOptions = userPrefferedtabs;
		this.actionSet = userPrefferedActions;
	}

	private getGridColumnData(ColumnOptionsRes: GenericResponseBase<GridColumnCaption[]>): void {
		if (isSuccessfulResponse(ColumnOptionsRes)) {
			this.columnOptions = ColumnOptionsRes.Data.map((row: GridColumnCaption) => {
				row.fieldName = row.ColumnName;
				if (row.ColumnName === 'SectorName') {
					row.columnHeader = this.localizationService.GetLocalizeMessage(row.ColumnHeader, this.sectorLabelTextParams);
				} else {
					row.columnHeader = row.ColumnHeader;
				}
				row.visibleByDefault = row.SelectedByDefault;
				return row;
			});
			this.isLoading = true;
		}
	}

	private getGridPageSizeData(PageSizeRes: GenericResponseBase<{ PageSize: number }>): void {
		if (isSuccessfulResponse(PageSizeRes)) {
			const Data = PageSizeRes.Data;
			this.pageSize = Data.PageSize;
		}
	}

	private ListNavigator = (dataItem: TimeSheetList, action: string): void => {
		const actionName = action === 'Edit'
			? 'AddEdit'
			: action;

		if (dataItem.RecordType === 'Time Adjustment' || action === 'Adjust Timesheet') {
			this.navigateTimeAdjustment(dataItem, action);
		}
		else {
			setStartPoint(this.sessionStorageService, 'List', actionName);

			this.router.navigate([
				`/xrm/time-and-expense/timesheet/${(action === 'View' || action === 'Review')
					? action.toLowerCase()
					: 'add-edit'
				}/${dataItem.UKey}`
			]);
		}
	};

	private navigateTimeAdjustment(dataItem: TimeSheetList, action: string): void {
		switch (action) {
			case 'View':
				action = 'time-adjustment-view';
				break;
			case 'Review':
				action = 'time-adjustment-review';
				break;
			case 'Edit':
				action = 'adjust-add-edit';
				break;
			case 'Adjust Timesheet':
				action = 'adjust-add-edit';
				break;
			default:
				break;
		}

		setStartPoint(this.sessionStorageService, 'List', action);
		this.router.navigate(
			[`/xrm/time-and-expense/timesheet/${action}/${dataItem.UKey}`],
			{ state: { type: dataItem.RecordType, status: dataItem.Status } }
		);
	};

	public openDialog(): void {
		this.isShowPopup = true;
	}

	public OnFilterTriggered(filteredData: TimeSheetList[]): void {
		this.appliedAdvFilters = filteredData;
	}

	public OnSearchTriggered(list: string): void {
		this.searchList = list;
	}

	public selectedTab(currTab: string): void {
		if (this.roleId === Number(magicNumber.three) || this.roleId === Number(magicNumber.five)) {
			this.multiSelect = false;
		}
		else if (this.roleId === Number(magicNumber.one) || this.roleId === Number(magicNumber.two)
			|| this.roleId === Number(magicNumber.four)) {
			this.multiSelect = (currTab !== 'Declined');
		}
	}

	public onGroupedAction($event: IBulkStatusUpdateAction): void {
		const { rowIds } = $event;
		this.selectedRows = rowIds;
		this.handleDialogPopUp(true);
	}

	public handleDialogPopUp(isShowDialog: boolean): void {
		this.isShowSuccess = isShowDialog;
	}

	public aprroveSelectedRows(): void {
		let payload: PayloadItem[] = [];

		payload = this.selectedRows.map((rowId: string) => {
			return {
				'UKey': rowId,
				'StatusId': statusIds.TimeSheetApprove,
				'ApproverComment': ""
			};
		});

		this.timeEntryService.massApproveDeclineTimeSheet(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res:GenericResponseBase<null>) => {
				if (res.StatusCode === Number(HttpStatusCode.Ok)) {
					this.toasterService.displayToaster(ToastOptions.Success, 'AllRecordsApproved');
				}

				else if (res.StatusCode === Number(HttpStatusCode.InternalServerError)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'AllRecordsFailed');
				}

				else if (res.StatusCode === Number(HttpStatusCode.Forbidden) && res.Data) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(res.Message);
					this.toasterService.displayToaster(
						ToastOptions.Warning, `${localizedErrorMsg} ${createToasterTable(res.Data[magicNumber.zero], this.localizationService)}`,
						[], true
					);
				}
				else if (res.StatusCode === Number(HttpStatusCode.BadRequest)) {
					this.toasterService.displayToaster(ToastOptions.Error, res.Message);

				}
				else if ('ValidationMessages' in res && res.ValidationMessages?.length) {
					ShowApiResponseMessage.showMessage(res, this.toasterService, this.localizationService);
				}
				this.gridConfiguration.refreshGrid();
				this.handleDialogPopUp(false);
				this.cdr.markForCheck();
			});

	}

	ngOnDestroy(): void {
		this.expEntryService.formDataHold.next(null);
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}


	public entryNavigationPath = (): string =>
		NavigationPaths.addEdit;
}


