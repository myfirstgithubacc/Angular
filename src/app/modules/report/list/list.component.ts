import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, catchError, of, shareReplay, switchMap } from "rxjs";
import { ReportDataService } from 'src/app/services/report/report.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { ReportFolderAddEdit, ReportLibList } from '@xrm-core/models/report/report-folder-list';
import { MenuService } from '@xrm-shared/services/menu.service';
import { hasPermissions } from '../../acrotrac/expense/utils/userDependentList';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { EntityAction } from '@xrm-shared/models/menu-interface';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { DialogButton } from '@xrm-master/user/interface/user';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { ReportType } from '../constants/enum-constants';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ReportDetails } from '@xrm-core/models/report/report-payload';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportListComponent {
	public tabOptions = {
		tabList: [
			{
				tabName: 'All',
				favourableValue: true,
				selected: true
			}
		]
	};
	  // Setter for tabName
	set tabName(newTabName: string) {
		this.tabOptions.tabList[0].tabName = newTabName;
	}
	public openDialog: boolean;
	public isEditMode: boolean;
	public payload: ReportFolderAddEdit;
	public Remove: boolean = false;
	public folderList: ReportFolderAddEdit[] = [];
	public successfullySaved: boolean = false;
	public successfullyEdit: boolean = false;
	public apiAddress: string = 'report/paged';
	public advApiAddress: string = 'report/select-paged';
	public entityId = XrmEntities.Report;
	public isLoading: boolean = false;
	public columnOptions: GridColumnCaption[] = [];
	public appliedAdvFilters: any[] = [];
	public pageSize: number;
	public searchList: string;
	public actionSet: IActionSetModel[];
	public entityType = 'All';

	public permissions = {
		manageFolder: false,
		create: false
	};
	public userValues:{'FolderId':number}|null = null;
	private destroyAllSubscribtion$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
    private route: Router,
		private reportDataService: ReportDataService,
		private dialogService: DialogPopupService,
		private toasterService: ToasterService,
		private gridService: GridViewService,
		private cdr: ChangeDetectorRef,
		private menuService: MenuService,
		private gridConfiguration: GridConfiguration
	) {
		this.createActionSets();
	}

	ngOnInit(): void {
		sessionStorage.removeItem('reportData');
		this.reportDataService.isGridChangedSubject.next(false);
		forkJoin({
			'ColumnOptionsRes': this.getColumnOptionsForEntityType(this.entityType)
				.pipe(catchError((error) => {
					// console.error('Error in ColumnOptionsRes:', error);
					return of(null);
				})),
			'PageSizeRes': this.gridService.getPageSizeforGrid(this.entityId)
				.pipe(catchError((error) => {
					// console.error('Error in PageSizeRes:', error);
					return of(null);
				}))
		}).pipe(switchMap((data :{ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>|null,
				 PageSizeRes:GenericResponseBase<{PageSize:number}>|null}) => {
			if(data.ColumnOptionsRes) {
				this.handleGridColumnData(data.ColumnOptionsRes);
			}
			if(data.PageSizeRes) {
				this.handleGridPageSizeData(data.PageSizeRes);
			}
			return this.menuService.getAuthorizedActionsList();
		}), takeUntil(this.destroyAllSubscribtion$)).subscribe((res: EntityAction[]) => {
			this.getMenuService(res);
			this.cdr.markForCheck();
		});

		if (this.route.url == "/xrm/report/report-library/list/Edit") {
			this.Remove = true;
		}
		else {
			this.Remove = false;
		}
	}

	private getMenuService(res: EntityAction[]): void {
	   	const entityActions = res[0].EntityActions;
	   	this.permissions.manageFolder = this.checkPermission(entityActions, Permission.ManageFolder);
		this.permissions.create = this.checkPermission(entityActions, Permission.CREATE_EDIT__CREATE);
	}

	private checkPermission(entityActions: {EntityTypeId: number, EntityType: string, ActionId: number,
		ActionName: string}[], permission: Permission): boolean {
		return hasPermissions(entityActions, permission);
	}

	private getColumnOptionsForEntityType(entityType: string) {
		return this.gridService.getColumnOption(this.entityId, entityType).pipe(
			takeUntil(this.destroyAllSubscribtion$),
			shareReplay(Number(magicNumber.one))
		);
	}

	private createActionSets(): void {
		type ActionKey = keyof typeof actionMap;
		const combinations = [
				"C", "D", "E", "R", "X", "P",
				"CD", "CE", "CP", "CR", "CX", "DE", "DP", "DR", "DX", "ER", "EX", "PR", "PX", "RX",
				"CDE", "CDP", "CDR", "CDX", "CER", "CEX", "CPR", "CPX", "CRX", "DER", "DEX", "DPR", "DPX", "DRX", "ERX", "PRX",
				"CDER", "CDEX", "CDPR", "CDPX", "CDRX", "CERX", "DERX", "CPRX", "DPRX",
				"CDERX", "CDPRX"
		  ],
		  actionMap = {
				C: { icon: 'copy', color: 'light-blue-color', title: 'Copy', fn: this.onCopy, actionId: [Permission.Copy_Report], id: magicNumber.four },
				D: { icon: 'trash-2', color: 'red-color', title: 'Delete', fn: this.onDelete, actionId: [Permission.CREATE_EDIT__EDIT, Permission.CREATE_EDIT__CREATE], id: magicNumber.five },
				E: { icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit, actionId: [Permission.CREATE_EDIT__EDIT], id: magicNumber.one },
				P: { icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit, actionId: [Permission.Edit_Predefined_Report], id: magicNumber.one },
				R: { icon: 'check-file', color: 'dark-blue-color', title: 'Recent Runs', fn: this.onRecentRun, actionId: [Permission.Execute_Report], id: magicNumber.three },
				X: { icon: 'recent-run', color: 'dark-blue-color', title: 'Run', fn: this.onProcess, actionId: [Permission.Execute_Report], id: magicNumber.two }
			};

		this.actionSet = combinations.map((combination) => {
			const items = combination.split('')
				.filter((char): char is ActionKey =>
					char in actionMap)
				.map((char) =>
					actionMap[char])
				.sort((a, b) =>
					a.id - b.id);

			return { Status: combination, Items: items };
		});
	}


	private handleGridColumnData(ColumnOptionsRes:GenericResponseBase<GridColumnCaption[]>) : void {
		if (isSuccessfulResponse(ColumnOptionsRes)) {
			this.columnOptions = ColumnOptionsRes.Data.map((row: GridColumnCaption) => {
				row.fieldName = row.ColumnName;
				row.columnHeader = row.ColumnHeader;
				row.visibleByDefault = row.SelectedByDefault;
				return row;
			});
			this.isLoading = true;
		}
	}

	private handleGridPageSizeData(PageSizeRes:GenericResponseBase<{PageSize:number}>): void {
		if (isSuccessfulResponse(PageSizeRes)) {
			const Data = PageSizeRes.Data;
			this.pageSize = Data.PageSize;
		}
	}

	setTabNameAndChangeColumnOptions(entityType: string) {
		this.tabName = entityType;

		this.getColumnOptionsForEntityType(this.entityType).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
			this.handleGridColumnData(res);
			this.cdr.markForCheck();
		});
	}

	changeEntityTypeAndUserValues({EntityType, UserValues}: {'EntityType': string, 'UserValues': string|null}) {
		this.entityType = EntityType;
		this.userValues = (UserValues)
			? {'FolderId': Number(UserValues)}
			: null;
	}

	private onEdit = (dataItem: ReportLibList): void => {
		const reportDetails = new ReportDetails();
		reportDetails.OutputTypeId = dataItem.OutputTypeId;
		reportDetails.CopyMode = false;
		reportDetails.ExecuteMode = false;
		reportDetails.RecentRunMode = false;
		reportDetails.ApplicableActions = dataItem.ApplicableActions;
		window.sessionStorage.setItem('reportData', JSON.stringify(reportDetails));
		if (dataItem.ReportTypeId === Number(ReportType.PreDefinedReport)) {
			this.route.navigate([`/xrm/report/report-library/pre-defined-report/parameter-selection/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
		} else {
			this.route.navigate([`/xrm/report/report-library/custom-report/build/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
		}
	};

	private onCopy = (dataItem: ReportLibList): void => {
		const reportDetails = new ReportDetails();
		reportDetails.CopyMode = true;
		reportDetails.UKey = dataItem.UKey;
		reportDetails.ExecuteMode = false;
		reportDetails.RecentRunMode = false;
		reportDetails.OutputTypeId = dataItem.OutputTypeId;
		reportDetails.ApplicableActions = dataItem.ApplicableActions;
		window.sessionStorage.setItem('reportData', JSON.stringify(reportDetails));
		if (dataItem.ReportType === String(ReportType.PreDefinedReport)) {
			this.route.navigate([`/xrm/report/report-library/pre-defined-report/parameter-selection/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });

			this.reportDataService.isExecuteReport.next({execute: false, copy: true});
		} else {
			this.route.navigate([`/xrm/report/report-library/custom-report/build`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
			this.reportDataService.isExecuteReport.next({execute: false, copy: true});
		}
	};

	private onRecentRun = (dataItem: ReportLibList): void => {
		const reportDetails = new ReportDetails();
		reportDetails.CopyMode = false;
		reportDetails.ExecuteMode = false;
		reportDetails.RecentRunMode = true;
		reportDetails.OutputTypeId = dataItem.OutputTypeId;
		reportDetails.RunReportCallNeeded = true;
		reportDetails.ApplicableActions = dataItem.ApplicableActions;
		reportDetails.OutputTypeId = dataItem.OutputTypeId;
		window.sessionStorage.setItem('reportData', JSON.stringify(reportDetails));
		if (dataItem.ReportType === String(ReportType.PreDefinedReport)) {
			this.route.navigate([`/xrm/report/report-library/pre-defined-report/list-view/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
		} else {
			this.route.navigate([`/xrm/report/report-library/custom-report/list-view/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
		}
	};

	onProcess = (dataItem: ReportLibList) => {
		const reportDetails = new ReportDetails();
		reportDetails.CopyMode = false;
		reportDetails.ExecuteMode = true;
		reportDetails.RecentRunMode = false;
		reportDetails.UKey = dataItem.UKey;
		reportDetails.OutputTypeId = dataItem.OutputTypeId;
		reportDetails.ApplicableActions = dataItem.ApplicableActions;
		reportDetails.RunReportCallNeeded = true;
		window.sessionStorage.setItem('reportData', JSON.stringify(reportDetails));
		if (dataItem.ReportType === String(ReportType.PreDefinedReport)) {
			this.route.navigate([`/xrm/report/report-library/pre-defined-report/parameter-selection/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
			this.reportDataService.isExecuteReport.next({execute: true, copy: false});
		} else {
			this.route.navigate([`/xrm/report/report-library/custom-report/parameter-selection/${dataItem.UKey}`]);
			this.reportDataService.setStepperData.next({ currentStep: 1 });
			this.reportDataService.isExecuteReport.next({execute: true, copy: false});
		}
	};

	onDelete = (dataItem: ReportLibList) => {
		this.toasterService.resetToaster();
		this.dialogService.resetDialogButton();
		this.dialogService.showConfirmation('DeleteReportConfirmation', PopupDialogButtons.YesDeleteDontDelete, [{ Value: dataItem.ReportName, IsLocalizeKey: true }]);
		this.dialogService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: DialogButton) => {
				if(data.value == Number(magicNumber.twentyThree) && dataItem.UKey){
					this.reportDataService.deleteReport(dataItem.UKey).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
						if(res.Succeeded){
							this.toasterService.showToaster(ToastOptions.Success, 'ReportDeletionSuccess', [{ Value: dataItem.ReportName.toLocaleLowerCase(), IsLocalizeKey: false }] );
							this.gridConfiguration.refreshGrid();
						}
					});
				}
			});
		// this.route.navigate([`/xrm/reporting-v2/create-report`]);
	};
	createReport() {
		const reportDetails = new ReportDetails();
		reportDetails.ApplicableActions =this.permissions.create
			?'E'
			:'N';
		window.sessionStorage.setItem('reportData', JSON.stringify(reportDetails));
	}

	public OnFilterTriggered(filteredData: any[]): void {
		this.appliedAdvFilters = filteredData;
	}

	public OnSearchTriggered(searchedData: string) {
		this.searchList = searchedData;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.toasterService.resetToaster();
		this.dialogService.resetDialogButton();
		this.reportDataService.setStepperData.next({ currentStep: 0 });
	}
}
