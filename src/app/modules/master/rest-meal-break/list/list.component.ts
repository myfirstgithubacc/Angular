import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { RestMealBreakService } from 'src/app/services/masters/rest-meal-break.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { RestMealBreakConfigurationList } from '@xrm-core/models/rest-meal-break-configuration/rest-meal-break-configuration.model';
import { Subject, forkJoin, take, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { HttpStatusCode } from '@angular/common/http';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { NavigationPaths } from '../route-constants/route-constants';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	standalone: true,
	imports: [CommonModule, SharedModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {
	public searchList: string;
	public filterList: RestMealBreakConfigurationList[] = [];
	public xrmEntityId: number = XrmEntities.RestOrMealBreakConfiguration;
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public isLoading: boolean = false;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'meal-break/paged';
	public advApiAddress: string = 'meal-break/advance-search';
	public appliedAdvFilters: RestMealBreakConfigurationList[];
	public actionSet: IActionSetModel[];
	public tabOptions: ITabOption;

	private selectedRestMealBreakConfiguration: string[] = [];
	private activateDeactivateRestMealBreakList: ActivateDeactivate[] = [];
	private restMealBreakLabelTextParams: DynamicParam[] = [{ Value: 'RestOrMealBreakConfiguration', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private gridConfiguration: GridConfiguration,
		private router: Router,
		private toasterService: ToasterService,
		private gridService: GridViewService,
		private restMealBreakService: RestMealBreakService,
		private localizationServc: LocalizationService,
		private cdr: ChangeDetectorRef
	) {
		this.createTabOptions();
		this.createActionSet();
		this.columnOptions = [];
	}

	private createTabOptions(): void {
		this.tabOptions = {
			bindingField: 'Disabled',
			tabList: [
				{
					tabName: 'Active',
					favourableValue: false,
					selected: true,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'Inactive',
					favourableValue: true,
					selected: true,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'All',
					favourableValue: 'All',
					selected: true,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				}
			]
		};
	}

	private createActionSet(): void {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(
					this.listNavigator,
					this.listNavigator,
					this.onActiveChange
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.listNavigator,
					this.listNavigator,
					this.onActiveChange
				)
			}
		];
	}

	ngOnInit(): void {
		forkJoin({
			'ColumnOptionsRes': this.gridService.getColumnOption(this.xrmEntityId),
			'PageSizeRes': this.gridService.getPageSizeforGrid(this.xrmEntityId)
		}).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data :{ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>, PageSizeRes:GenericResponseBase<{PageSize:number}>}) => {
				this.getGridColumnData(data.ColumnOptionsRes);
				this.getGridPageSizeData(data.PageSizeRes);
				this.cdr.markForCheck();
			});
	}

	private getGridColumnData(ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>): void {
		if(isSuccessfulResponse(ColumnOptionsRes)){
			this.columnOptions = ColumnOptionsRes.Data.map((e) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
			this.isLoading = true;
		}
	}

	private getGridPageSizeData(PageSizeRes:GenericResponseBase<{PageSize:number}>): void {
		if (isSuccessfulResponse(PageSizeRes)) {
			const Data = PageSizeRes.Data;
			this.pageSize = Data.PageSize;
		}
	}

	public onSearchTriggered(searchedList: string): void {
		this.searchList = searchedList;
	}

	public onFilterTriggered(filteredList: RestMealBreakConfigurationList[]): void {
		this.appliedAdvFilters = filteredList;
	}

	public navigate() {
		return this.router.navigate([`${NavigationPaths.addEdit}`]);
	}

	private listNavigator = ({ UKey }: RestMealBreakConfigurationList, action: string): void => {
		this.router.navigate([
			`/xrm/master/rest-meal-break-configuration/${action === 'View'
				? 'view'
				: 'add-edit'
			}/${UKey}`
		]);
	};

	private onActiveChange = (RowItem: RestMealBreakConfigurationList): void => {
		this.selectedRestMealBreakConfiguration = [];
		this.selectedRestMealBreakConfiguration.push(RowItem.UKey);
		this.activateDeactivateRestMealBreakList = [];
		this.activateDeactivateRestMealBreakList = this.makeStatusPayload(
			this.selectedRestMealBreakConfiguration,
			!RowItem.Disabled
		);
		this.processDialogResponse(this.activateDeactivateRestMealBreakList);
	};

	private makeStatusPayload(
		rowIds: string[],
		action: boolean
	): ActivateDeactivate[] {
		let payload: ActivateDeactivate[] = [];
		payload = [
			...new Set(rowIds.map((item: string) =>
				({
					UKey: item,
					Disabled: action,
					ReasonForChange: ''
				})))
		];

		return payload;
	}

	private processDialogResponse(selectedRows: ActivateDeactivate[]) {
		this.toasterService.resetToaster();
		this.executingRestMealBreakPayload(selectedRows);
	}

	private executingRestMealBreakPayload(rows: ActivateDeactivate[]): void {
		this.restMealBreakService.updateRestMealBreakConfigurationStatus(rows).pipe(takeUntil(this.destroyAllSubscribtion$), take(magicNumber.one))
			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {
				const localizeTextParams = this.localizationServc.getLocalizationMessageInLowerCase(this.restMealBreakLabelTextParams);
				if(isSuccessfulResponse(response)){
					this.gridConfiguration.refreshGrid();
					this.toasterService.showToaster(
						ToastOptions.Success,
						rows[magicNumber.zero].Disabled
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
