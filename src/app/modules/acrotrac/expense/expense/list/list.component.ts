import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ExpenseEntryList } from '@xrm-core/models/acrotrac/expense-entry/expense-entry.model';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { getTabsAndActions, hasPermissions } from '../../utils/userDependentList';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ExpenseEntryService } from 'src/app/services/masters/expense-entry.service';
import { statusIds } from '../enum-constants/enum-constants';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { NavigationPaths } from '../route-constants/route-constants';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { IMassActionButton } from '@xrm-shared/models/mass-action-button.model';
import { createToasterTable } from '../../utils/CommonEntryMethods';
import { GenericResponseBase, hasData, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBulkStatusUpdateAction } from '@xrm-shared/models/common.model';
import { AssignmentDetail } from '../../../common/view-review/approve-decline.model';
import { Entity } from '@xrm-shared/models/menu-interface';
import { ApproveDecline } from '@xrm-core/models/acrotrac/expense-entry/view-review/approve-decline';
@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public searchList: string;
	public entityId: number = XrmEntities.Expense;
	public isLoading: boolean = false;
	public pageSize: number;
	public actionSet: IActionSetModel[];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'expense/paged';
	public advApiAddress: string = 'expense/select-paged';
	public columnOptions: GridColumnCaption[];
	public tabOptions: ITabOption;
	public appliedAdvFilters: ExpenseEntryList[];
	public expenseEntryLabelTextParams: DynamicParam[] = [{ Value: 'ExpenseEntry', IsLocalizeKey: true }];
	public multiSelect: boolean = true;
	public hasReviewPermission: boolean = false;
	public isShowPopup: boolean = false;
	public massActionButtonSet: IMassActionButton[];
	public isShowSuccess: boolean = false;
	private roleId: number;
	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	private selectedRows: string[] = [];

	constructor(
		private router: Router,
		private gridService: GridViewService,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		private gridConfiguration: GridConfiguration,
		private expEntryService: ExpenseEntryService,
		private menuService: MenuService,
		private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
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

		this.columnOptions = [];
	}

	ngOnInit(): void {
		forkJoin({
			ColumnOptionsRes: this.gridService.getColumnOption(this.entityId),
			PageSizeRes: this.gridService.getPageSizeforGrid(this.entityId)
		})
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: {
        ColumnOptionsRes: GenericResponseBase<GridColumnCaption[]>,
        PageSizeRes: GenericResponseBase<{ PageSize: number }>
      }) => {
				this.getGridColumnData(data.ColumnOptionsRes);
				this.getGridPageSizeData(data.PageSizeRes);
				this.activatedRoute.params
					.pipe(takeUntil(this.destroyAllSubscribtion$))
					.subscribe((param) => {
						const permission = param['permission'] ?? '';
						this.getMenuService(permission);
						this.cdr.markForCheck();
					});
			});
	}


	private getMenuService(res: Entity[]): void {
		this.hasReviewPermission = this.loginUserHasReviewPermission(res);
		this.cdr.markForCheck();
		this.cdr.detectChanges();
	}

	private loginUserHasReviewPermission(entityActions: {EntityTypeId: number, EntityType: string, ActionId: number, ActionName: string}[]): boolean {
		return (hasPermissions(entityActions, Permission.REVIEW_APPROVE) || hasPermissions(entityActions, Permission.REVIEW_DECLINE));
	}

	private createTabOptions(): void {
		const { userPrefferedtabs, userPrefferedActions } = getTabsAndActions<ExpenseEntryList>(this.roleId, this.ListNavigator);
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

	public onGroupedAction($event: IBulkStatusUpdateAction): void {
		const { rowIds } = $event;
		this.selectedRows = rowIds;
		this.handleDialogPopUp(true);
	}

	public aprroveSelectedRows(): void {
		let payload: ApproveDecline[] = [];

		payload = this.selectedRows.map((rowId: string) => {
			return new ApproveDecline({
				'UKey': rowId,
				'StatusId': statusIds.Approved,
				'approverComment': ""
			});

		});
		this.expEntryService.submitApproveDecline(payload).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: GenericResponseBase<AssignmentDetail[]>) => {
				if (res.Succeeded) {
					this.toasterService.displayToaster(ToastOptions.Success, payload.length>Number(magicNumber.one)
						?'ExpenseRecordsApproved'
						:'ExpenseRecordApproved');
				}
				else if (hasValidationMessages(res)) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(res.Message);
					this.toasterService.displayToaster(
						ToastOptions.Error, `${localizedErrorMsg} ${createToasterTable(res.Data, this.localizationService)}`,
						[], true
					);
				}
				else if (hasData(res)) {
					const localizedErrorMsg = this.localizationService.GetLocalizeMessage(res.Message);
					this.toasterService.displayToaster(
						ToastOptions.Warning, `${localizedErrorMsg} ${createToasterTable(res.Data, this.localizationService)}`,
						[], true
					);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, res.Message);
				}
				this.gridConfiguration.refreshGrid();
				this.handleDialogPopUp(false);
				this.cdr.markForCheck();
			});
	}

	private getGridPageSizeData(PageSizeRes: GenericResponseBase<{ PageSize: number }>): void {
		if (isSuccessfulResponse(PageSizeRes)) {
			const Data = PageSizeRes.Data;
			this.pageSize = Data.PageSize;
		}
	}

	private ListNavigator = (dataItem: ExpenseEntryList, action: string): void => {
		this.router.navigate([
			`/xrm/time-and-expense/expense/${(action === 'View' || action === 'Review')
				? action.toLowerCase()
				: 'add-edit'
			}/${dataItem.UKey}`
		]);
	};

	public entryNavigationPath = () =>
		NavigationPaths.addEdit;

	public openDialog(): void {
		this.isShowPopup = true;
	}

	public handleDialogPopUp(isShowDialog: boolean): void {
		this.isShowSuccess = isShowDialog;
	}

	public OnFilterTriggered(filteredData: ExpenseEntryList[]): void {
		this.appliedAdvFilters = filteredData;
	}

	public OnSearchTriggered(list: string): void {
		this.searchList = list;
	}

	public selectedTab(currTab: string): void {
		if (this.roleId === Number(magicNumber.three) || this.roleId === Number(magicNumber.five)) {
			this.multiSelect = false;
		}
		else if (this.roleId === Number(magicNumber.one) || this.roleId === Number(magicNumber.two) || this.roleId === Number(magicNumber.four)) {
			this.multiSelect = (currTab !== 'Declined');
		}
		this.cdr.markForCheck();
		this.cdr.detectChanges();
	}

	ngOnDestroy(): void {
		this.expEntryService.formDataHold.next(null);
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}


