import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, forkJoin, take, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { NavigationPaths } from '../route-constants/route-constants';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { CostAccountingCodeService } from 'src/app/services/masters/cost-accounting-code.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CostAccCodeList } from '@xrm-core/models/cost-accounting-code/cost-accounting-code-list';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IMassAction } from '@xrm-shared/models/mass-action-button.model';
import { SharedModule } from '@xrm-shared/shared.module';
import { CommonModule } from '@angular/common';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	standalone: true,
	imports: [SharedModule, CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {
	private selectedCostAccountingCode: string[] = [];
	private activeDeactivateCostAccountingCodeList: ActivateDeactivate[] = [];
	private destroyAllSubscribtion$ = new Subject<void>();

	public costAccountingNameLabelTextParams: DynamicParam[] = [{ Value: 'CostAccountingCode', IsLocalizeKey: true }];
	public tabOptions: ITabOption;
	public actionSet: IActionSetModel[];
	public columnOptions: GridColumnCaption[];
	public isLoading: boolean = false;
	public pageSize: number;
	public entityId: number = XrmEntities.CostAccountingCode;
	public searchText: string = '';
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'cost-code/getpage';
	public advApiAddress: string = 'cost-code/getdropdown';
	public appliedAdvFilters: CostAccCodeList[];

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private gridService: GridViewService,
		private gridConfiguration: GridConfiguration,
		private toasterService: ToasterService,
		private costAccCodeService: CostAccountingCodeService,
		private localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
	) {
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
					selected: false,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'All',
					favourableValue: 'All',
					selected: false,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				}
			]
		};
		this.createActionSet();
		this.columnOptions = [];
	}

	ngOnInit(): void {
		forkJoin({
			'colOptionResponse': this.gridService.getColumnOption(this.entityId),
			'pageSizeResponse': this.gridService.getPageSizeforGrid(this.entityId)
		}).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data :{colOptionResponse:GenericResponseBase<GridColumnCaption[]>,
			 pageSizeResponse:GenericResponseBase<{ PageSize: number }>}) => {
			this.getGridColumnData(data.colOptionResponse);
			this.getGridPageSizeData(data.pageSizeResponse);
			this.cdr.markForCheck();
		});
	}


	private createActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showAllActionIcon(this.onView, this.onEdit, this.onActiveChange)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showInactiveActionIcon(this.onView, this.onEdit, this.onActiveChange)
			}
		];
	}

	private processDialogResponse() {
		this.toasterService.resetToaster();
		this.activateDeactivateCostAccountingCode(this.activeDeactivateCostAccountingCodeList);
	}

	private getGridColumnData(colOptionResponse: GenericResponseBase<GridColumnCaption[]>) {
		if (isSuccessfulResponse(colOptionResponse)) {
			this.columnOptions = colOptionResponse.Data.map((row) => {
				row.fieldName = row.ColumnName;
				row.columnHeader = row.ColumnHeader;
				row.visibleByDefault = row.SelectedByDefault;
				return row;
			});
			this.isLoading = true;
			this.cdr.markForCheck();
		}
	}

	private getGridPageSizeData(pageSizeResponse: GenericResponseBase<{ PageSize: number }>) {
		if (isSuccessfulResponse(pageSizeResponse)) {
			const Data = pageSizeResponse.Data;
			this.pageSize = Data.PageSize;
		}
	}

	public OnFilterTriggered(filteredData: CostAccCodeList[]) {
		this.appliedAdvFilters = filteredData;
	}

	public OnSearchTriggered(list: string) {
		this.searchText = list;
	}

	private makeStatusPayload(rowIds: string[], action: boolean) {
		let payload: ActivateDeactivate[] = [];
		payload = [
			...new Set(rowIds.map((item: string) =>
				({ UKey: item, Disabled: action, ReasonForChange: '' })))
		];

		return payload;
	}

	private activateDeactivateCostAccountingCode(dataItem: ActivateDeactivate[]) {
		this.costAccCodeService.updateStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$), take(magicNumber.one))
			.subscribe((response: GenericResponseBase<null>) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.costAccountingNameLabelTextParams);
				if (response.Succeeded) {
					this.gridConfiguration.refreshGrid();
					// const successMessage = this.getSuccessMessage(dataItem, isCheckBox);
					this.toasterService.showToaster(ToastOptions.Success,
						dataItem[0].Disabled
							? 'EntityHasBeenDeactivatedSuccessfully'
							: 'EntityHasBeenActivatedSuccessfully', localizeTextParams
					);
				}	else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
				}
				else if (response.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists', localizeTextParams);
				}
				else {
					this.toasterService.displayToaster(ToastOptions.Error, response.Message);
				}
			});
	}

	private onActiveChange = (dataItem: CostAccCodeList) => {
		this.selectedCostAccountingCode = [];
		this.selectedCostAccountingCode.push(dataItem.UKey);

		this.activeDeactivateCostAccountingCodeList = [];
		this.activeDeactivateCostAccountingCodeList = this.makeStatusPayload(this.selectedCostAccountingCode, !dataItem.Disabled);

		this.processDialogResponse();
	};

	private onView = ({UKey}: CostAccCodeList) => {
		this.toasterService.resetToaster();
		this.router.navigate([`${NavigationPaths.view}/${UKey}`]);
	};

	private onEdit = ({UKey}: CostAccCodeList) => {
		this.toasterService.resetToaster();
		this.router.navigate([`${NavigationPaths.addEdit}/${UKey}`]);
	};

	public navigate() {
		this.toasterService.resetToaster();
		this.router.navigate([NavigationPaths.addEdit]);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
