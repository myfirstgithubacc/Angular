import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { CandidateDeclineReason } from '@xrm-core/models/candidate-decline-reason.model';
import { CandidateDeclineReasonService } from 'src/app/services/masters/candidate-decline-reason.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { CanDecRsnData } from '../constant/candidate-decline-reason-interface';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {
	public actionSet: IRecordButtonGrid[];
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public tabOptions: ITabOptions;
	public massActivateDeactivate: ActivateDeactivate[];
	private ngUnsubscribe$ = new Subject<void>();
	public entityId = XrmEntities.CandidateDeclineReason;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string ='dccd/paged';
	public advApiAddress: string ='dccd/select-paged';
	public searchText: string;
	public appliedAdvFilters: [];

	// eslint-disable-next-line max-params
	constructor(
		public candDeclineServc: CandidateDeclineReasonService,
			private loaderService: LoaderService,
			private toasterServc : ToasterService,
			public permissionService: PermissionsService,
			private gridConfiguration : GridConfiguration,
			private router: Router,
			private gridService: GridViewService
	) {
	}

	ngOnInit(): void {
		this.callColumnAndPageData();
		this.getActionSet();
		this.getTabOptions();
	}


	private onView = (dataItem: CanDecRsnData) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};
	private onEdit = (dataItem: CanDecRsnData) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};


	private onActivateDeactivateAction = (dataItem: CanDecRsnData) => {
		this.massActivateDeactivate = [];
		const Data = new CandidateDeclineReason({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: ''
		});
		this.massActivateDeactivate.push(Data as ActivateDeactivate);
		this.activateDeactivateCandidateDecline();
	};

	public onMassActivateDeactivateAction(event: IBulkStatusUpdateAction) {
		const massActivateDeactivate = event.rowIds.map((dt: string) =>
			({
				UKey: dt,
				Disabled: event.actionName === "deactivate",
				ReasonForChange: ''
			}));

		this.massActivateDeactivate = massActivateDeactivate;
		this.activateDeactivateCandidateDecline();
	}

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit, this.onActivateDeactivateAction
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
		if (columnData.Succeeded && columnData.Data) {
			this.columnOptions = columnData.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private processPageSize(pageSize: GenericResponseBase<IPageSize>) {
		if (pageSize.StatusCode === Number(HttpStatusCode.Ok) && pageSize.Data) {
			this.pageSize = pageSize.Data.PageSize;
		}
	}

	public getTabOptions() {
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

	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}

	public onFilterTriggered(appliedFilters: []) {
		this.appliedAdvFilters = appliedFilters;
	}

	private activateDeactivateCandidateDecline() {
		this.candDeclineServc.updateCanDeclineRsnStatus(this.massActivateDeactivate).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((res: ApiResponseBase) => {
				if(!res.Succeeded) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'Somethingwentwrong');
					return;
				}

				if (this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'CandidateDecRsnDeactivatedSuccessfully');

				} else {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'CandidateDecRsnActivatedSuccessfully');
				}

				if (this.massActivateDeactivate.length > Number(magicNumber.one) && this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedCandidateDecRsnDeactivatedSuccessfully');
				}
				else if (this.massActivateDeactivate.length > Number(magicNumber.one) && !this.massActivateDeactivate[magicNumber.zero].Disabled) {
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Success, 'SelectedCandidateDecRsnActivatedSuccessfully');
				}
				this.gridConfiguration.refreshGrid();
			});
	}

	public navigate() {
		this.router.navigate([NavigationPaths.addEdit]);
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}
