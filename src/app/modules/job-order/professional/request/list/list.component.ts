import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { forkJoin, Observable } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPageSize, IPermissionInfo, IRecordButtonGrid, ITabOption, ITabOptions } from '@xrm-shared/models/common.model';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { NavigationPaths } from '../../constant/routes-constant';
import { ApiUrl } from '../../constant/apiUrl-constant';
import { IFilterControlData, IRequestUkeyData } from '../../interface/shared-data.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActionToAdd } from '@xrm-shared/services/common-constants/common-header-action.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { CommonHeaderActionLIService } from '@xrm-shared/services/common-constants/common-header-action-li.service';
import { gridSetting } from '@xrm-shared/services/common-constants/gridSetting';
import { RoleGroupId } from 'src/app/modules/acrotrac/common/enum-constants/enum-constants';
import { MenuService } from '@xrm-shared/services/menu.service';
import { ProfessionalRequest } from '../../../submittals/services/Interfaces';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrl: './list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit {

	public entityId: XrmEntities = XrmEntities.ProfessionalRequest;
	public columnOptions: GridColumnCaption[] = [];
	public pageSize: number = magicNumber.zero;
	public searchText: string = '';
	public appliedAdvFilters: IFilterControlData;
	public apiAddress: string = ApiUrl.ListApiAddress;
	public advApiAddress: string = ApiUrl.AdvApiAddress;
	public canCreate: boolean = false;
	public tabOptions: ITabOptions;
	public actionSet: IRecordButtonGrid[] = [];
	private permissionArray: IPermissionInfo[] = [];
	private roleGroupId: string = '';
	public entityType: string = 'MspClient';
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
		},
		{
			ColumnName: 'IsAllowedSubDetails',
			ColumnValue: false,
			ActionTitles: ['Submittal']
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		public gridViewService: GridViewService,
		private cdr: ChangeDetectorRef,
		public activatedRoute: ActivatedRoute,
		private commonHeadActionLIService: CommonHeaderActionLIService,
		private localizationService: LocalizationService,
		private destroyRef: DestroyRef,
		private menuService: MenuService
	) {
		this.getUserType();
	}

	ngOnInit(): void {
		if(this.roleGroupId == RoleGroupId.StaffingAgency.toString()){
			this.setStaffingData();
			this.menuService.fetchAndAppendEntityPermissions(true, XrmEntities.Submittal);
		}
		else{
			this.getTabOptions();
			this.getActionSet();
		}
		this.getPermissionSet();
		this.fetchInitialData();
	}

	private getUserType(): void {
		this.roleGroupId = this.localizationService.GetCulture(CultureFormat.RoleGroupId);
	}

	private getPermissionSet(): void {
		this.activatedRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param: Params) => {
			this.permissionArray = param['permission'];
		});
		this.permissionArray.forEach((x: IPermissionInfo) => {
			this.canCreate = x.ActionId === Number(Permission.CREATE_EDIT__CREATE)
				? true
				: this.canCreate;
		});
	}

	private fetchInitialData(): void {
		forkJoin({
			columnData: this.getColumnData(),
			pageSizeData: this.getPageSizeData()
		})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(({ columnData, pageSizeData }) => {
				this.processColumnData(columnData);
				this.processPageSizeData(pageSizeData);
				this.cdr.markForCheck();
			});
	}

	private getColumnData(): Observable<GenericResponseBase<GridColumnCaption[]>> {
		return this.gridViewService.getColumnOption(this.entityId, this.entityType);
	}

	private getPageSizeData(): Observable<GenericResponseBase<IPageSize>> {
		return this.gridViewService.getPageSizeforGrid(this.entityId);
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

	public onSearchTriggered(searchText: string): void {
		this.searchText = searchText;
	}

	public onFilterTriggered(appliedFilters: IFilterControlData): void {
		this.appliedAdvFilters = appliedFilters;
	}

	public navigateToAdd(): void {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	private navigateToView = (dataItem: IRequestUkeyData): void => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.Ukey}`]);
	};

	private navigateToEdit = (dataItem: IRequestUkeyData): void => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.Ukey}`]);
	};

	private navigateToBroadcast = (dataItem: IRequestUkeyData): void => {
		this.router.navigate([`${NavigationPaths.broadcast}/${dataItem.Ukey}`]);
	};

	private navigateToReviewRequest = (dataItem: IRequestUkeyData): void => {
		this.router.navigate([`${NavigationPaths.review}/${dataItem.Ukey}`]);
	};

	private getTabOptions(): void {
		this.tabOptions = {
			bindingField: 'Status',
			tabList: this.generateTabList()
		};
		if (this.roleGroupId == RoleGroupId.Client.toString()) this.modifyForClientUser();
	}

	private generateTabList(): ITabOption[] {
		return [
			{ tabName: 'Draft', bindingInfo: [{ columnName: 'StatusId', values: ['235'] }] },
			{ tabName: 'Open', selected: true, bindingInfo: [{ columnName: 'StatusId', values: ['240'] }] },
			{ tabName: 'PendingApprovals', bindingInfo: [{ columnName: 'StatusId', values: ['236', '237', '248'] }] },
			{ tabName: 'Hold', bindingInfo: [{ columnName: 'StatusId', values: ['242', '244', '245'] }] },
			{ tabName: 'PendingBrodcast', bindingInfo: [{ columnName: 'StatusId', values: ['238', '243'] }] },
			{ tabName: 'All' }
		];
	}

	private modifyForClientUser(): void {
		const pendingApprovalTab: ITabOption = this.tabOptions.tabList[magicNumber.two];
		pendingApprovalTab.tabName = 'PendingMyApprovals';
		pendingApprovalTab.bindingInfo?.push({ columnName: 'IsReviewActionRequired', values: [true] });
		this.tabOptions.tabList = this.tabOptions.tabList.filter((tab) =>
			tab.tabName !== 'PendingBrodcast');
	}


	private getExtraActionSet(): ActionToAdd[] {
		return [
			{
				icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.navigateToEdit, actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT
				]
			},
			{ icon: 'broadcast-tower', color: 'red-color', title: 'Broadcast', fn: this.navigateToBroadcast, actionId: [Permission.PROCESS_AND_BROADCAST] },
			{ icon: 'check-file', color: 'light-blue-color', title: 'Review Request', fn: this.navigateToReviewRequest, actionId: [Permission.REVIEW_APPROVE] },
			this.getSubmittalDetailsAction()
		];
	}

	private getActionSet(): void {
		const allStatuses = ['235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248'];

		this.actionSet = allStatuses.map((status) =>
			({
				Status: status,
				Items: this.commonHeadActionLIService.commonActionSetForLI(
					this.navigateToView,
					this.getExtraActionSet()
				)
			}));
	}

	private setStaffingData(): void{
		this.entityType = 'Staffing';
		this.advApiAddress = 'reqbroadcast/get-adv-search-ddl';
		this.apiAddress = 'reqbroadcast/get-all-paged';
		this.setActionSetForStaffing();
		this.setTabOptionsForStaffing();
	}

	private setActionSetForStaffing(): void{
		this.actionSet = [
			{
				Status: Number(magicNumber.twoHundredForty),
				Items: this.commonHeadActionLIService.commonActionSetForLI(
					this.navigateToViewForStaffing,
					[this.getSubmittalDetailsAction()]
				)
			},
			{
				Status: Number(magicNumber.twoHundredFortyFive),
				Items: this.commonHeadActionLIService.commonActionSetForLI(
					this.navigateToViewForStaffing,
					[this.getSubmittalDetailsAction()]
				)
			}
		];
	}

	private setTabOptionsForStaffing(): void{
		this.tabOptions = {
			bindingField: 'StatusId',
			tabList: [
				{
					tabName: 'Open',
					favourableValue: Number(magicNumber.twoHundredForty),
					selected: true
				},
				{
					tabName: 'HoldOrNoNewSubmittals',
					favourableValue: Number(magicNumber.twoHundredFortyFive),
					selected: true
				},
				{
					tabName: 'All',
					favourableValue: 'All',
					selected: false
				}
			]
		};
	}

	private getSubmittalDetailsAction(): ActionToAdd {
		return {
			icon: gridSetting.submittal,
			title: 'Submittal',
			color: 'orange-color',
			fn: this.roleGroupId == RoleGroupId.StaffingAgency.toString()
				? this.onAddSubmittalStaffing
				: this.onAddSubmittalMspClient,
			actionId: [Permission.CREATE_EDIT_STAFFING_AGENCY_USER_PROFESSIONAL_SUBMITTAL]
		};
	}

	private onAddSubmittalStaffing = (dataItem: ProfessionalRequest): void => {
		this.router.navigate([`${NavigationPaths.submittalDetails}${dataItem.RequestUkey}`]);
	};

	private onAddSubmittalMspClient = (dataItem: IRequestUkeyData): void => {
		this.router.navigate([`${NavigationPaths.submittalDetails}${dataItem.Ukey}`]);
	};

	private navigateToViewForStaffing = (dataItem: ProfessionalRequest): void => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.RequestUkey}`]);
	};

}
