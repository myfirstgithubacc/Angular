
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin, Subject, take, takeUntil } from 'rxjs';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Router } from '@angular/router';
import { SectorList } from '@xrm-core/models/Sector/sector-list.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorService } from 'src/app/services/masters/sector.service';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	private selectedSector: string[] = [];
	private activeDeactivateSectorList: ActivateDeactivate[] = [];
	public sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	public apiAddress: string = 'sector/paged';
	public advApiAddress: string = 'sector/advance-search';
	public appliedAdvFilters: SectorList[];
	public searchList: string;
	public createNewButton: string;
	public tabOptions: ITabOption;
	public actionSet: IActionSetModel[];
	public columnOptions: GridColumnCaption[];
	public isLoading: boolean = false;
	public pageSize: number;
	public entityId: number = XrmEntities.Sector;
	public isServerSidePagingEnable: boolean = true;

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private gridService: GridViewService,
		private localizationService: LocalizationService,
		private toasterService: ToasterService,
		private gridConfiguration: GridConfiguration,
		private sectorService: SectorService,
		private cdr: ChangeDetectorRef
	) {
		this.tabOptions = {
			bindingField: 'Status',
			tabList: [
				{
					tabName: 'Active',
					favourableValue: 'A',
					selected: true,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'Inactive',
					favourableValue: 'I',
					selected: false,
					isTooltipVisible: false,
					tooltipText: '',
					isHtmlContent: false
				},
				{
					tabName: 'Draft',
					favourableValue: 'D',
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
			'ColumnOptionsRes': this.gridService.getColumnOption(this.entityId),
			'PageSizeRes': this.gridService.getPageSizeforGrid(this.entityId)
		}).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data :{ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>, PageSizeRes:GenericResponseBase<{PageSize:number}> }) => {
				this.getGridColumnData(data.ColumnOptionsRes);
				this.getGridPageSizeData(data.PageSizeRes);
				this.cdr.markForCheck();
			});
		this.createNewButton = this.localizationService.GetLocalizeMessage('NewEntity', this.sectorLabelTextParams);
	}

	private createActionSet(): void {
		this.actionSet = [
			{
				Status: 'I',
				Items: this.gridConfiguration.showInactiveActionIcon(this.onView, this.onEdit, this.onActiveChange)
			},
			{
				Status: 'A',
				Items: this.gridConfiguration.showAllActionIcon(this.onView, this.onEdit, this.onActiveChange)
			},
			{
				Status: 'D',
				Items: this.gridConfiguration.showViewEditIcon(this.onView, this.onEdit)
			},
			{
				// if we remove this Status DF then tab section will not work properly.
				Status: 'DF',
				Items: [
					{ icon: 'k-icon k-font-icon k-i-eye', title: 'View', fn: this.onView },
					{ icon: 'k-icon k-font-icon k-i-edit', title: 'Edit', fn: this.onEdit }
				]
			}
		];
	}

	private getGridColumnData(ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>): void {
		if (isSuccessfulResponse(ColumnOptionsRes)) {
			this.columnOptions = ColumnOptionsRes.Data.map((row: GridColumnCaption) => {
				row.fieldName = row.ColumnName;
				if (row.ColumnName === 'SectorName') {
					row.columnHeader = this.localizationService.GetLocalizeMessage(row.ColumnHeader, this.sectorLabelTextParams);
				} else if (row.ColumnName === 'SectorCode') {
					row.columnHeader = this.localizationService.GetLocalizeMessage('SectorId', this.sectorLabelTextParams);
				} else {
					row.columnHeader = row.ColumnHeader;
				}
				if (row.ColumnName === 'StateId') {
					row.fieldName = 'State';
				}
				row.visibleByDefault = row.SelectedByDefault;
				return row;
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

	private processDialogResponse(): void {
		this.toasterService.resetToaster();
		this.activateDeactivateSector(this.activeDeactivateSectorList);
	}

	public onFilterTriggered(filteredData: SectorList[]): void {
		this.appliedAdvFilters = filteredData;
	}

	public onSearchTriggered(list: string): void {
		this.searchList = list;
	}


	private makeStatusPayload(rowIds: string[], action: boolean): ActivateDeactivate[] {
		let payload: ActivateDeactivate[] = [];
		payload = [
			...new Set(rowIds.map((item: string) =>
				({ UKey: item, Disabled: action, ReasonForChange: '' })))
		];

		return payload;
	}

	private activateDeactivateSector(dataItem: ActivateDeactivate[]): void {
		this.sectorService.updateStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$), take(magicNumber.one))
			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {
				if(isSuccessfulResponse(response)){
					this.gridConfiguration.refreshGrid();
					const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.sectorLabelTextParams);
					this.toasterService.showToaster(ToastOptions.Success, dataItem[0].Disabled
						? 'EntityHasBeenDeactivatedSuccessfully'
						: 'EntityHasBeenActivatedSuccessfully', localizeTextParams);
				}
				else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
				}
				else{
					this.toasterService.showToaster(ToastOptions.Error, 'Somethingwentwrong');
				}
				this.cdr.markForCheck();
		 });
	}

	private onActiveChange = (dataItem: SectorList): void => {
		this.selectedSector = [];
		this.selectedSector.push(dataItem.UKey);

		this.activeDeactivateSectorList = [];
		this.activeDeactivateSectorList = this.makeStatusPayload(this.selectedSector, !dataItem.Disabled);
		this.processDialogResponse();
	};

	private onView = (dataItem: SectorList): void => {
		this.router.navigate([`/xrm/master/sector/view/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: SectorList): void => {
		this.router.navigate([`/xrm/master/sector/add-edit/${dataItem.UKey}`]);
	};

	public navigate(): void {
		this.router.navigate(['xrm/master/sector/add-edit']);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
