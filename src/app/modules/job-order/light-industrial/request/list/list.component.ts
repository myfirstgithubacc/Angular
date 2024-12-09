import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LightIndustrialService } from '../../services/light-industrial.service';
import { NavigationPaths } from '../../constant/routes-constant';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CommonHeaderActionLIService } from '@xrm-shared/services/common-constants/common-header-action-li.service';
import { ActionToAdd } from '@xrm-shared/services/common-constants/common-header-action.service';
import { IPageSize, IPermissionInfo, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { IFilterControlData } from '../../../professional/interface/shared-data.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IRequestDetailsListData } from '../../interface/li-request-list.interface';
import { UserRole } from '@xrm-master/user/enum/enums';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public pageSize: number = magicNumber.zero;
	public entityId: number = XrmEntities.LightIndustrialRequest;
	public columnOptions: GridColumnCaption[] = [];
	public actionSet: IRecordButtonGrid[] = [];
	private ngUnsubscribe = new Subject<void>();
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'lireq/paged';
	public advApiAddress: string = 'lireq/select-paged';
	public tabOptions: ITabOptions;
	private permissionArray: IPermissionInfo[] = [];
	public canCreate: boolean = false;
	public appliedAdvFilters: IFilterControlData;
	public searchText: string = '';
	private isStaffingUser: boolean = false;
	private isMSPUser: boolean = false;
	private actionsToAdd: ActionToAdd[] = [];
	public manageActionSets: ManageGridActionSet[] = [
		{
			ColumnName: 'IsAllowedToEdit',
			ColumnValue: false,
			ActionTitles: ['Edit']
		},
		{
			ColumnName: 'IsReviewActionRequired',
			ColumnValue: false,
			ActionTitles: ['Review Request']
		},
		{
			ColumnName: 'IsAllowedToBroadcast',
			ColumnValue: false,
			ActionTitles: ['Broadcast']
		},
		{
			ColumnName: 'IsAllowedToFill',
			ColumnValue: false,
			ActionTitles: ['Fill a Request']
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		public gridService: GridViewService,
		private router: Router,
		public lightIndustrialService: LightIndustrialService,
		private localizationService: LocalizationService,
		public activatedRoute: ActivatedRoute,
		public permissionService: PermissionsService,
		private commonHeadActionLIService: CommonHeaderActionLIService
	) {
		this.getUserType();
	}

	ngOnInit(): void {
		this.getPermissionSet();
		this.getGridData();
		this.getExtraActionSet();
		this.getActionSet();
		this.getTabOptions();
	}

	private getUserType() {
		const userType = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
		this.isStaffingUser = userType == UserRole.StaffingAgency;
		this.isMSPUser = userType == UserRole.MSP;
	}

	private getPermissionSet() {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((action: Params) => {
			this.permissionArray = action['permission'];
		});
		this.canCreate = this.permissionArray.some((x: IPermissionInfo) =>
			x.ActionId == Number(Permission.CREATE_EDIT__CREATE));
	}

	private getGridData() {
		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId),
			pageSizeData: this.gridService.getPageSizeforGrid(this.entityId)
		})
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(({ columnData, pageSizeData }) => {
				this.setColumnData(columnData);
				this.setPageSizeData(pageSizeData);
			});
	}

	private setColumnData(res: GenericResponseBase<GridColumnCaption[]>): void {
		if (!res.Succeeded || !res.Data) return;
		this.columnOptions = res.Data.map((e: GridColumnCaption) => {
			e.fieldName = e.ColumnName;
			e.columnHeader = e.ColumnHeader;
			e.visibleByDefault = e.SelectedByDefault;
			if (e.ColumnName === 'Status') {
				e.IsLocalizedKey = true;
			}
			return e;
		});
	}

	private setPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (!res.Succeeded || !res.Data) return;
		this.pageSize = res.Data.PageSize;
	}

	public getTabOptions() {
		const commonTabList = [
			{
				tabName: 'Open', favourableValue: 'Open',
				selected: true,
				bindingInfo: [{ columnName: 'StatusId', values: ['121'] }]
			}
		];
		// to show open tab for staffing only and to show all tabs for msp and client
		if (this.isStaffingUser) {
			this.tabOptions = { bindingField: 'Status', tabList: commonTabList };
		} else {
			this.tabOptions = {
				bindingField: 'Status',
				tabList: [
					...commonTabList, this.isMSPUser
						? {
							tabName: 'PendingApprovals', favourableValue: 'Pending for Approval',
							bindingInfo: [{ columnName: 'StatusId', values: ['112', '113'] }]
						}
						: {
							tabName: 'PendingMyApprovals', favourableValue: 'Pending for Approval',
							selected: false,
							bindingInfo: [
								{ columnName: 'StatusId', values: ['112', '113'] },
								{ columnName: 'IsReviewActionRequired', values: [true] }
							]
						},
					{
						tabName: 'CloseCancel', favourableValue: 'CloseCancel',
						bindingInfo: [{ columnName: 'StatusId', values: ['115', '116'] }]
					},
					{
						tabName: 'PendingBrodcast', favourableValue: 'Pending for Broadcast',
						selected: false,
						bindingInfo: [{ columnName: 'StatusId', values: ['117'] }]
					},
					{ tabName: 'All', favourableValue: 'All' }
				]
			};
		}
	}

	public getExtraActionSet() {
		this.actionsToAdd = [
			{
				icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit, actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT
				]
			},
			{ icon: 'broadcast-tower', color: 'red-color', title: 'Broadcast', fn: this.onBroadcast, actionId: [Permission.PROCESS_AND_BROADCAST] },
			{ icon: 'check-file', color: 'light-blue-color', title: 'Review Request', fn: this.onReview, actionId: [Permission.REVIEW_APPROVE] },
			{ icon: 'file-text-pen', color: 'dark-blue-color', title: 'Fill a Request', fn: this.onFillRequest, actionId: [Permission.FILL_CANDIDATE] }
		];
	}

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.commonHeadActionLIService.commonActionSetForLI(
					this.onView,
					this.actionsToAdd
				)
			}
		];
	}

	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}

	public onFilterTriggered(appliedFilters: IFilterControlData) {
		this.appliedAdvFilters = appliedFilters;
	}

	public navigateToAdd() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private onView = (dataItem: IRequestDetailsListData) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.Ukey}`]);
	};

	private onReview = (dataItem: IRequestDetailsListData) => {
		this.router.navigate([`${NavigationPaths.review}/${dataItem.Ukey}`]);
	};

	private onEdit = (dataItem: IRequestDetailsListData) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.Ukey}`]);
	};

	private onBroadcast = (dataItem: IRequestDetailsListData) => {
		this.router.navigate([`${NavigationPaths.broadcast}/${dataItem.Ukey}`]);
	};

	private onFillRequest = (dataItem: IRequestDetailsListData) => {
		this.router.navigate([`${NavigationPaths.fillrequest}/${dataItem.Ukey}`]);
	};

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

}
