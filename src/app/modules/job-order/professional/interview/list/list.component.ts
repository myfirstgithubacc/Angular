import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { IRecordButtonGrid, ITabOptions, IPageSize } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { CommonHeaderActionLIService } from '@xrm-shared/services/common-constants/common-header-action-li.service';
import { ActionToAdd } from '@xrm-shared/services/common-constants/common-header-action.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SectorService } from 'src/app/services/masters/sector.service';
import { InterviewNavigationPaths } from '../../constant/routes-constant';
import { NavigationUrls } from '../../../submittals/services/Constants.enum';
import { IListDataItem } from '../../interface/interview.interface';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrl: './list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public entityId: number = XrmEntities.InterviewRequest;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'intwreq/paged';
	public advApiAddress: string = 'intwreq/select-paged';
	public searchText: string;
	public appliedAdvFilters: [];
	public actionSet: IRecordButtonGrid[];
	private actionsToAdd: ActionToAdd[] = [];
	public isLoading: boolean = false;
	public pageSize: number = magicNumber.zero;
	public columnOptions: GridColumnCaption[] = [];
	public tabOptions: ITabOptions;

	// eslint-disable-next-line max-params
	constructor(
		public sectorService: SectorService,
		private gridService: GridViewService,
		public activatedRoute: ActivatedRoute,
		private router: Router,
		private commonHeadActionLIService: CommonHeaderActionLIService
	) { }

	ngOnInit(): void {
		this.getExtraActionSet();
		this.loadData();
		this.getActionSet();
		this.getTabOptions();
	}

	private loadData() {
		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.destroyAllSubscriptions$)),
			pageSizeData: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscriptions$))
		}).subscribe({
			next: ({ columnData, pageSizeData }) => {
				this.columnData(columnData);
				this.pageSizeData(pageSizeData);
			}
		});
	}

	private columnData(columnData: GenericResponseBase<GridColumnCaption[]>) {
		if (columnData.Succeeded && columnData.Data) {
			this.columnOptions = this.mapColumnData(columnData.Data);
			this.isLoading = true;
		}
	}

	private mapColumnData(data: GridColumnCaption[]) {
		return data.map((e: GridColumnCaption) => {
			e.fieldName = e.ColumnName;
			e.columnHeader = e.ColumnHeader;
			e.visibleByDefault = e.SelectedByDefault;
			if (e.ColumnName === 'Status') {
				e.IsLocalizedKey = true;
			}
			return e;
		});
	}

	private pageSizeData(pageSizeData: GenericResponseBase<IPageSize>) {
		if (pageSizeData.Succeeded && pageSizeData.Data) {
			const Data = pageSizeData.Data;
			this.pageSize = Data.PageSize;
		}
	}

	onView = (dataItem: IListDataItem) => {
		this.router.navigate([`${InterviewNavigationPaths.view}/${dataItem.Ukey}`]);
	};

	onReview = (dataItem: IListDataItem) => {
		this.router.navigate([`${InterviewNavigationPaths.review}/${dataItem.Ukey}`]);
	};

	onEdit = (dataItem: IListDataItem) => {
		this.router.navigate([`${InterviewNavigationPaths.edit}/${dataItem.Ukey}`]);
	};

	onCancel = (dataItem: IListDataItem) => {
		this.router.navigate([`${InterviewNavigationPaths.cancelInterview}/${dataItem.Ukey}`]);
	};

	onViewSubmittal = (dataItem: IListDataItem) => {
		this.router.navigate([`${NavigationUrls.Process}/${dataItem.Ukey}`]);
	};

	onInterviewFinish = (dataItem: IListDataItem) => {
		this.router.navigate([`${InterviewNavigationPaths.finishInterview}/${dataItem.Ukey}`]);
	};

	onNextRound = (dataItem: IListDataItem) => {
		this.router.navigate([`${InterviewNavigationPaths.scheduleForNextRound}/${dataItem.Ukey}`]);
	};

	public getActionSet() {
		this.actionSet = [
			{
				Status: true,
				Items: this.commonHeadActionLIService.commonActionSetForReview(this.onView, this.actionsToAdd)
			},
			{
				Status: false,
				Items: this.commonHeadActionLIService.commonActionSetForReview(this.onView, this.actionsToAdd)
			}
		];
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
			{ icon: 'x', color: 'red-color', title: 'Cancel Interview', fn: this.onCancel, actionId: [Permission.CANCEL_INTERVIEW] },
			{ icon: 'dummy', color: 'orange-color', title: 'View Submittal', fn: this.onViewSubmittal, actionId: [Permission.CREATE_EDIT__EDIT] },
			{ icon: 'dummy', color: 'dark-blue-color', title: 'Finish Interview', fn: this.onInterviewFinish, actionId: [Permission.FINISH_INTERVIEW] },
			{ icon: 'dummy', color: 'orange-color', title: 'Schedule for Next Round', fn: this.onNextRound, actionId: [Permission.CREATE_EDIT__EDIT] },
			{ icon: 'check-file', color: 'dark-blue-color', title: 'Review', fn: this.onReview, actionId: [Permission.REVIEW_APPROVE] }
		];
	}

	public getTabOptions() {
		this.tabOptions = {
			bindingField: 'Status',
			tabList: [
				{
					tabName: 'Pending Confirmation', favourableValue: 'Pending Confirmation',
					selected: true,
					bindingInfo: [{ columnName: 'StatusId', values: [253]}]
				},
				{
					tabName: 'All',
					favourableValue: 'All'
				}
			]
		};
	}

	public onFilter(filteredData: []) {
		this.appliedAdvFilters = filteredData;
	}

	public OnSearch(list: string) {
		this.searchText = list;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}
