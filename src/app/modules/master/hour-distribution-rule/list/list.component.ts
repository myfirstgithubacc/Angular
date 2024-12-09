import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HourDistributionRuleList } from '@xrm-core/models/hour-distribution-rule/hour-distribution-rule.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { NavigationPaths } from '../route-constants/route-constants';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { ITabOption } from '@xrm-shared/models/tab-option.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public searchList: string;
	public xrmEntityId = XrmEntities.HourDistributionRule;
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public actionSet: IActionSetModel[];
	public tabOptions: ITabOption;
	public isLoading: boolean = false;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'hour-distribution/paged';
	public advApiAddress: string = 'hour-distribution/advance-search';
	public appliedAdvFilters: HourDistributionRuleList[];

	private HDRLabelTextParams: DynamicParam[] = [{ Value: 'HourDistributionRule', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private gridConfiguration: GridConfiguration,
		private router: Router,
		private toasterService: ToasterService,
		private gridService: GridViewService,
		private hourDistributionRuleService: HourDistributionRuleService,
		private localizationServc: LocalizationService,
		private cdr: ChangeDetectorRef
	) {
		this.createTabOptions();
		this.createActionSet();
	}

	private createTabOptions() {
		this.tabOptions = {
			bindingField: 'Disabled',
			tabList: [
				{
					tabName: 'Active',
					favourableValue: false,
					selected: true
				},
				{
					tabName: 'Inactive',
					favourableValue: true
				},
				{
					tabName: 'All',
					favourableValue: 'All'
				}
			]
		};
	}

	private createActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.ListNavigator,
					this.ListNavigator,
					this.onActiveChange
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.ListNavigator,
					this.ListNavigator,
					this.onActiveChange
				)
			}
		];
	}

	ngOnInit(): void {
		forkJoin({
			'colOptionResponse': this.gridService.getColumnOption(this.xrmEntityId),
			'pageSizeResponse': this.gridService.getPageSizeforGrid(this.xrmEntityId)
		}).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(({colOptionResponse, pageSizeResponse}) => {
			this.getGridColumnData(colOptionResponse);
			this.getGridPageSizeData(pageSizeResponse);
			this.cdr.markForCheck();
		});
	}

	private getGridColumnData(res: GenericResponseBase<GridColumnCaption[]>) {
		if (isSuccessfulResponse(res)) {
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				if (e.ColumnName === 'PreDefinedWorkScheduleId')
					e.fieldName = 'PreDefinedWorkScheduleName';
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
			this.isLoading = true;
		}
	}

	private getGridPageSizeData(res: GenericResponseBase<{PageSize: number}>) {
		if (isSuccessfulResponse(res)) {
			const { Data } = res;
			this.pageSize = Data.PageSize;
		}
	}

	public OnSearchTriggered(searchedList: string) {
		this.searchList = searchedList;
	}

	public OnFilterTriggered(filteredList: HourDistributionRuleList[]) {
		this.appliedAdvFilters = filteredList;
	}

	public navigate() {
		return this.router.navigate([NavigationPaths.addEdit]);
	}

	private ListNavigator = ({UKey}: HourDistributionRuleList, action: string) => {
		this.router.navigate([
			`/xrm/master/hour-distribution-rule/${action === 'View'
				? 'view'
				: 'add-edit'
			}/${UKey}`
		]);
	};

	private onActiveChange = ({UKey, Disabled}: HourDistributionRuleList) => {
		const selectedHDR: string[] = [];
		let activateDeactivateHDRList: ActivateDeactivate[] = [];
		selectedHDR.push(UKey);

		activateDeactivateHDRList = this.gridConfiguration.makeStatusPayload(selectedHDR, !Disabled);
		this.processDialogResponse(activateDeactivateHDRList);
	};

	processDialogResponse(selectedRows: ActivateDeactivate[]) {
		this.toasterService.resetToaster();
		this.executingHDRPayload(selectedRows);
	}

	executingHDRPayload(rows: ActivateDeactivate[]) {
		this.hourDistributionRuleService.updateHourDistributionRuleStatus(rows).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response) => {
				const localizeTextParams = this.localizationServc.getLocalizationMessageInLowerCase(this.HDRLabelTextParams);
				if(response.Succeeded){
					this.gridConfiguration.refreshGrid();
					this.toasterService.showToaster(
						ToastOptions.Success,
						rows[0].Disabled
							? 'EntityHasBeenDeactivatedSuccessfully'
							: 'EntityHasBeenActivatedSuccessfully',
						localizeTextParams
					);
				}else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationServc);
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, response.Message);
				}
				this.cdr.markForCheck();
		 });
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
