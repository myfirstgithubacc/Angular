import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, forkJoin, take, takeUntil } from 'rxjs';
import { CandidatePool } from '@xrm-core/models/candidate-pool/candidate-pool.model';
import { CandidatePoolService } from 'src/app/services/masters/candidate-pool.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { LightIndustrialPopupService } from '../../light-industrial/services/light-industrial-popup.service';
import { ShowApiResponseMessage } from '@xrm-shared/services/common-methods/show-api-message';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { GenericResponseBase, hasValidationMessages, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { ITabOption } from '@xrm-shared/models/tab-option.model';
import { PopupData } from 'src/app/modules/job-order/light-industrial/models/fill-a-request.model';
import { ParentEntity } from '../../Constants/ParentEntity.enum';
@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	@Input() showTabs: boolean = true;
	@Input() overrideActions: boolean = false;
	@Input() ActionList: IActionSetModel[] = [];
	@Input() fillButton: boolean = false;
	@Input() liRequestData: PopupData;
	@Input() parentEntity: ParentEntity = ParentEntity.CandidatePool;
	public apiAddressLI: string = 'capl/paged';
	public advApiAddressLI: string = 'capl/select-paged';
	public searchList: string;
	public filterList: CandidatePool[] = [];
	public entityId: number = XrmEntities.CandidatePool;
	public isLoading: boolean = false;
	public pageSize: number;
	public actionSet: IActionSetModel[];
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'cand-pool/getpage';
	public advApiAddress: string = 'cand-pool/getdropdown';
	public columnOptions: GridColumnCaption[];
	public tabOptions: ITabOption;
	public appliedAdvFilters: CandidatePool[];
	private activeDeactivateCandidatePoolList: ActivateDeactivate[] = [];
	private candidateLabelTextParams: DynamicParam[] = [{ Value: 'Candidate', IsLocalizeKey: true }];
	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private destroyAllSubscribtion$ = new Subject<void>();
	private selectedCandidatePool: string[] = [];
	public liMenuID: number = magicNumber.fiftyFour;
	public submittalMenuId: number = magicNumber.seventyFour;
	public gridMenuId: number | null = null;
	private timeoutId:ReturnType<typeof setTimeout>;

	constructor(
		private router: Router,
		private candidatePoolService: CandidatePoolService,
		private toasterService: ToasterService,
		private gridService: GridViewService,
		private gridConfiguration: GridConfiguration,
		private localizationService: LocalizationService,
		private menuService: MenuService,
		private lightIndustrialPopupService: LightIndustrialPopupService,
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
		this.columnOptions = [];
	}

	ngOnInit(): void {
		this.setGridMenuId();
		forkJoin({
			'ColumnOptionsRes': this.getColumnOptionsRes(),
			'PageSizeRes': this.getPageSizeRes()
		}).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: {
			ColumnOptionsRes: GenericResponseBase<GridColumnCaption[]>,
			PageSizeRes: GenericResponseBase<{ PageSize: number }>
		}) => {
			this.getGridColumnData(data.ColumnOptionsRes);
			this.getGridPageSizeData(data.PageSizeRes);
			this.cdr.markForCheck();
		});
		this.menuService.fetchAndAppendEntityPermissions(true, this.entityId);
		this.createActionSet();
	}

	private getColumnOptionsRes(): Observable<GenericResponseBase<GridColumnCaption[]>> {
		let columnOptionsRes;
		if(this.parentEntity === ParentEntity.LiRequest || this.parentEntity === ParentEntity.Submittal){
			columnOptionsRes = this.gridService.getColumnOption(
				this.entityId,
				null,
				this.liMenuID
			);
		}
		else{
			columnOptionsRes = this.gridService.getColumnOption(
				this.entityId,
				null,
				null
			);
		}

		return columnOptionsRes;
	}

	private getPageSizeRes(): Observable<GenericResponseBase<{ PageSize: number }>> {
		let columnOptionsRes;
		if(this.parentEntity === ParentEntity.LiRequest){
			columnOptionsRes = this.gridService.getPageSizeforGrid(this.entityId, this.liMenuID);
		}
		else if(this.parentEntity === ParentEntity.Submittal){
			columnOptionsRes = this.gridService.getPageSizeforGrid(this.entityId, this.submittalMenuId);
		}
		else{
			columnOptionsRes = this.gridService.getPageSizeforGrid(this.entityId, null);
		}

		return columnOptionsRes;
	}

	private setGridMenuId(): void{
		if(this.parentEntity == ParentEntity.LiRequest)
			this.gridMenuId = this.liMenuID;
		else if(this.parentEntity == ParentEntity.Submittal)
			this.gridMenuId = this.submittalMenuId;
	}

	private processDialogResponse(isCheckBox:boolean = false): void {
		this.toasterService.resetToaster();
		this.activeDeactivateCandidatePool(this.activeDeactivateCandidatePoolList, isCheckBox);
	}

	private createActionSet(): void {
		if (this.overrideActions) {
			this.timeoutId = setTimeout(() => {
				this.actionSet = this.ActionList;
			}, magicNumber.hundred);
		} else {
			this.actionSet = [
				{
					Status: true,
					Items: this.gridConfiguration.showInactiveActionIcon(this.onView, this.onEdit, this.onActiveChange)
				},
				{
					Status: false,
					Items: this.gridConfiguration.showAllActionIcon(this.onView, this.onEdit, this.onActiveChange)
				}
			];
		}
	}

	private onActiveChange = (dataItem: CandidatePool): void => {
		this.selectedCandidatePool = [];
		this.selectedCandidatePool.push(dataItem.UKey);
		this.activeDeactivateCandidatePoolList = [];
		this.activeDeactivateCandidatePoolList = this.makeStatusPayload(this.selectedCandidatePool, !dataItem.Disabled);
		this.processDialogResponse();
	};

	private onView = (dataItem: CandidatePool): void => {
		this.router.navigate([`/xrm/job-order/candidate-pool/view/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: CandidatePool) => {
		this.router.navigate([`/xrm/job-order/candidate-pool/add-edit/${dataItem.UKey}`]);
	};

	public navigate() {
		this.router.navigate(['xrm/job-order/candidate-pool/add-edit']);
	}

	public onAllActivateDeactivateAction(data: { 'actionName': string, 'rowIds': string[], 'clickedTabName': string }) {
		this.activeDeactivateCandidatePoolList = [];
		this.activeDeactivateCandidatePoolList = this.makeStatusPayload(data.rowIds, data.actionName === 'deactivate');
		this.processDialogResponse(true);
	}

	public onSearchTriggered(list: string): void {
		this.searchList = list;
	}

	public onFilterTriggered(filteredData: CandidatePool[]): void {
		this.appliedAdvFilters = filteredData;
	}

	private makeStatusPayload(rowIds: string[], action: boolean): ActivateDeactivate[] {
		let payload: ActivateDeactivate[] = [];
		payload = [
			...new Set(rowIds.map((item: string) =>
				({ UKey: item, Disabled: action, ReasonForChange: '' })))
		];

		return payload;
	}

	private getGridColumnData(ColumnOptionsRes: GenericResponseBase<GridColumnCaption[]>) {
		if (isSuccessfulResponse(ColumnOptionsRes)) {
			this.columnOptions = ColumnOptionsRes.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader =
					e.ColumnHeader == 'PreferredSector'
						? this.localizationService.GetLocalizeMessage('PreferredSector', this.sectorLabelTextParams)
						: e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
			this.isLoading = true;
		}
	}

	private getGridPageSizeData(PageSizeRes: GenericResponseBase<{ PageSize: number }>) {
		if (isSuccessfulResponse(PageSizeRes)) {
			const Data = PageSizeRes.Data;
			this.pageSize = Data.PageSize;
		}
	}

	private activeDeactivateCandidatePool(dataItem: ActivateDeactivate[], isCheckBox:boolean): void {
		this.candidatePoolService.updateStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$), take(magicNumber.one))
			.subscribe((response: GenericResponseBase<ActivateDeactivate>) => {
				const localizeTextParams = this.localizationService.getLocalizationMessageInLowerCase(this.candidateLabelTextParams);
				if (isSuccessfulResponse(response)) {
					this.gridConfiguration.refreshGrid();
					const successMessage = this.getSuccessMessage(dataItem, isCheckBox);
					this.toasterService.showToaster(
						ToastOptions.Success, successMessage,
						localizeTextParams
					);
				} else if (hasValidationMessages(response)) {
					ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
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

	private getSuccessMessage(dataItem: ActivateDeactivate[], isCheckBox: boolean): string {
		let successMessage;
		if (dataItem[magicNumber.zero].Disabled) {
			if (dataItem.length > Number(magicNumber.one)) {
				successMessage = 'SelectedEntityHaveBeenDeactivatedSuccessfully';
			  } else {
				successMessage = isCheckBox
				  ? 'SelectedEntityHasBeenDeactivatedSuccessfully'
				  : 'EntityHasBeenDeactivatedSuccessfully';
			  }
		} else if (dataItem.length > Number(magicNumber.one)) {
			successMessage = 'SelectedEntityHaveBeenActivatedSuccessfully';
			  } else {
			successMessage = isCheckBox
				  ? 'SelectedEntityHasBeenActivatedSuccessfully'
				  : 'EntityHasBeenActivatedSuccessfully';
			  }
			  return successMessage;
	}

	public lightIndustrialfillNewCandidate(): void {
		this.lightIndustrialPopupService.openDialogAddEdit(null, this.liRequestData);
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		clearTimeout(this.timeoutId);
	}
}
