import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SectorService } from 'src/app/services/masters/sector.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationPaths } from '../constants/routes-constants';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ActionToAdd } from '@xrm-shared/services/common-constants/common-header-action.service';
import { CommonHeaderActionLIService } from '@xrm-shared/services/common-constants/common-header-action-li.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ICandidate } from '../interface/review-candidate.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { CandidateStatus } from '../../light-industrial/constant/candidate-status';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public entityId: number = XrmEntities.LICandidate;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'cansub/paged';
	public advApiAddress: string = 'cansum/select-paged';
	public searchText: string;
	public appliedAdvFilters: [];
	public actionSet: IRecordButtonGrid[];
	public isLoading: boolean = false;
	public pageSize: number = magicNumber.zero;
	public columnOptions: GridColumnCaption[] = [];
	public tabOptions: ITabOptions;
	private actionsToAdd: ActionToAdd[] = [];
	public manageActionSets: ManageGridActionSet[] = [
		{
			ColumnName: 'IsReviewed',
			ColumnValue: false,
			ActionTitles: ['Review']
		}
	];

	// eslint-disable-next-line max-params
	constructor(
		public sectorService: SectorService,
		private gridService: GridViewService,
		public activatedRoute: ActivatedRoute,
		private router: Router,
		private commonHeadActionLIService: CommonHeaderActionLIService
	) { }

	ngOnInit(): void {
		this.loadData();
		this.getExtraActionSet();
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

	onView = (dataItem: ICandidate) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.CandidateUkey}`]);
	};

	onReview = (dataItem: ICandidate) => {
		this.router.navigate([`${NavigationPaths.review}/${dataItem.CandidateUkey}`]);
	};

	public getExtraActionSet() {
		this.actionsToAdd = [{ icon: 'check-file', color: 'light-blue-color', title: 'Review', fn: this.onReview, actionId: [Permission.PRE_SCREENING] }];
	}

	public getActionSet() {
		this.actionSet = [
			{
				Status: true,
				Items: this.commonHeadActionLIService.commonActionSetForReview(
					this.onView,
					this.actionsToAdd
				)
			},
			{
				Status: false,
				Items: this.commonHeadActionLIService.commonActionSetForReview(
					this.onView,
					this.actionsToAdd
				)
			}
		];
	}

	public getTabOptions() {
		this.tabOptions = {
			bindingField: 'Status',
			tabList: [
				{
					tabName: 'PendingforReview', favourableValue: 'Pending for Review',
					selected: true,
					bindingInfo: [
						{ columnName: 'StatusId', values: [CandidateStatus.PendingforReview] },
						{ columnName: 'IsReviewed', values: [true] }
					]
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

