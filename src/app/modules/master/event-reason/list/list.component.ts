import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { griHeaderType } from '@xrm-shared/services/common-constants/gridheaderType';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DialogRef, DialogResult, DialogService } from '@progress/kendo-angular-dialog';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Subject, forkJoin, switchMap, takeUntil } from 'rxjs';
import { CopyDropdownModel, CopyInfo, CopyTreeModel, EventReason, TreeView} from '@xrm-core/models/event-reason.model';
import { EventReasonService } from 'src/app/services/masters/event-reason.service';
import { NavigationPaths } from '../routes/routeConstants';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { DynamicObject, RecordStatusChangeResponse, dropdownModel, dropdownWithExtras } from '@xrm-core/models/job-category.model';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy{

	public entityId = XrmEntities.EventReason;
	private dialogRef: DialogRef;
	public pageSize:number = magicNumber.zero;
	private copyDailogInfo: CopyDialogComponent;
	public columnOptions: GridColumnCaption[] =[];
	private isAnyTreeValue: boolean = false;
	private treeData: TreeView;
	private sectorLabelTextParams: DynamicParam[] = [{ Value: 'Sector', IsLocalizeKey: true }];
	private eventReasonLabelTextParams: DynamicParam[] = [{ Value: 'EventReasonSmall', IsLocalizeKey: true }];
	public extraButton = this.gridConfiguration.showCopyButtonIcon(griHeaderType);
	private destroyAllSubscribtion$ = new Subject<void>();
	public sectorData: dropdownModel[] = [];
	public copyInfo: CopyInfo;
	public isServerSidePagingEnable: boolean = true;
	public advApiAddress: string = 'evtrsn/select-paged';
	public apiAddress: string = 'evtrsn/paged';
	public advFilterData: EventReason[]=[];
	public searchText: string;

	constructor(
    	private router:Router,
    	private gridConfiguration: GridConfiguration,
		private localizationService: LocalizationService,
		private copyItemService: CopyItemService,
		private sectorService: SectorService,
		private gridService: GridViewService,
		private toasterService: ToasterService,
		private kendoDialogService: DialogService,
    	private eventReasonService: EventReasonService,
		private activateRoute: ActivatedRoute
	) {
	}

	private getColumnData( data : GenericResponseBase<GridColumnCaption[]> ) {
		if(isSuccessfulResponse(data)){
			this.columnOptions = data.Data.map((e: GridColumnCaption) => {
				if(e.ColumnName == 'IsProfessionalContractor'){
					e.ColumnName = 'ProfessionalContractor';
				}
				if(e.ColumnName == 'IsLIContractor'){
					e.ColumnName = 'LIContractor';
				}
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	ngOnInit(): void {
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId),
			this.sectorService.getExistingSectorsDropdownList()
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columns, pageData, SectorDropdownRes]) => {
			this.getColumnData(columns);
			this.getPageSizeData(pageData);
			this.sectorDropdownResponse(SectorDropdownRes);
			this.handleCopyItemChanges();
		});
		this.activateRoute.params.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: Params) => {
			if (data['permission'].length && data['permission'][magicNumber.zero].ActionId === magicNumber.twentyFive) {
				this.extraButton = [];
			}
		});
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.twenty;
		}
	}

	private onActiveChange = (dataItem: EventReason) => {
		if (dataItem.UKey) {
			const a: string[] = [dataItem.UKey];
			this.ActivateDeactivateEventReason(a, !dataItem.Disabled);
		}
	};

	private onView=(dataItem: EventReason) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit=(dataItem: EventReason) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public actionSet : IActionSetModel[] = [
		{
			Status: false,
			Items: this.gridConfiguration
				.showAllActionIcon(this.onView, this.onEdit, this.onActiveChange)
		},
		{
			Status: true,
			Items: this.gridConfiguration
				.showInactiveActionIcon(this.onView, this.onEdit, this.onActiveChange)
		}
	];

	public navigate() {
		this.router.navigate([`${NavigationPaths.addEdit}`]);
	}

	public tabOptions : ITabOptions= {
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

	private ActivateDeactivateEventReason(dataItem: string[], status: boolean) {
		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				ukey: item,
				disabled: status,
				reasonForChange: ''
			}));

		this.eventReasonService.deleteEventReason(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.eventReasonLabelTextParams);
			   this.gridConfiguration.refreshGrid();
		   });
	}

	public OnFilter(filteredData: EventReason[]) {
		this.advFilterData = filteredData;
	}

	public OnSearch(list:string){
		this.searchText= list;
	}

	private sectorDropdownResponse(SectorDropdownRes:GenericResponseBase<dropdownModel[]>): void{
		if(isSuccessfulResponse(SectorDropdownRes)){
			this.copyItemService.setItemListForCopyItems(SectorDropdownRes.Data);
			this.sectorData = SectorDropdownRes.Data;
			this.sectorData.sort((a, b) =>
				a.Text.localeCompare(b.Text));
			if (SectorDropdownRes.Data.length < Number(magicNumber.two)) {
				this.extraButton = [];
			}
		}
	}

	public openCopy(): void {
		this.setCopyDropdownData(this.sectorData, 'copyToSourceSector');
		this.setCopyDropdownData(this.sectorData, 'copyToDestinationSector');
		this.subFnOpenCopy();
		this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
		this.copyDailogInfo.title = this.localizationService.GetLocalizeMessage('CopySelectedEventReasonToAnotherSector', this.sectorLabelTextParams);
		this.copyDailogInfo.copydialogdata = this.copyDialogData;
		this.copyDailogInfo.treeData = this.treeData;
	}

	private subFnOpenCopy() {
		this.dialogRef = this.kendoDialogService.open({
			content: CopyDialogComponent,
			actions: [
				{
					text: this.localizationService.GetLocalizeMessage('Yescopy'),
					value: magicNumber.eleven,
					themeColor: 'primary'
				},
				{
					text: this.localizationService.GetLocalizeMessage('Nocopy'),
					value: magicNumber.tweleve
				}
			],
			width: magicNumber.fourTwenty,
			preventAction: (buttonResponse: DialogResult, dialog) => {
				const formGroup = (dialog?.content.instance as CopyDialogComponent).formGroup,
					treeValue = formGroup.get('TreeValues')?.value,
					copyToSourceSectorStatus = formGroup.get('copyToSourceSector')?.value;

				if ('value' in buttonResponse && buttonResponse.value === Number(magicNumber.tweleve)) {
					dialog?.close();
					this.toasterService.resetToaster();
					return !formGroup.valid;
				} else if (!formGroup.valid) {
					formGroup.markAllAsTouched();
				}
				if (copyToSourceSectorStatus && (!this.isAnyTreeValue) && formGroup.value.copyToDestinationSector) {
					this.toasterService.showToaster(ToastOptions.Error, 'SelectedSectorDoesNotHaveAnyEventReason', this.sectorLabelTextParams);
				} else if (this.isAnyTreeValue && (treeValue == null || (treeValue && treeValue.length == magicNumber.zero)) &&
						formGroup.value.copyToDestinationSector) {
					this.toasterService.showToaster(ToastOptions.Error, 'PleaseSelectAtleastOneEventReasonToCopy');
				}
				else if ('value' in buttonResponse && buttonResponse.value === Number(magicNumber.eleven) && formGroup.valid) {
					this.toasterService.resetToaster();
					this.copyConfirmation();
					return true;
				}
				return !formGroup.valid;
			}
		});
	}

	private copyConfirmation() {
		this.copyInfo = {
			source:
				parseInt(this.copyDailogInfo.formGroup.value.copyToSourceSector?.Value),
			eventReasonIds: this.copyDailogInfo.formGroup.value.TreeValues
				? this.copyDailogInfo.formGroup.value.TreeValues.map((x: CopyDropdownModel) =>
					parseInt(x.value))
				: null,
			destination:
				parseInt(this.copyDailogInfo.formGroup.value.copyToDestinationSector?.Value)
		};
		this.eventReasonService.EventCopyToAnotherSector(this.copyInfo).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data:GenericResponseBase<EventReason>) => {
				if (data.StatusCode == Number(HttpStatusCode.Conflict) || data.StatusCode == Number(HttpStatusCode.Ok)) {
					this.toasterService.showToaster(ToastOptions.Success, 'SelectedEventReasonCopySuccessConfirmation');
					this.dialogRef.close();
					this.gridConfiguration.refreshGrid();
				} else {
					this.toasterService.showToaster(ToastOptions.Error, data.Message);
				}
			});
	}

	private copyDialogData = [
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'FromSector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			dropdownData: [] as dropdownWithExtras[],
			controlName: 'copyToSourceSector',
			IsTreePresent: true,
			validationMessageDynamicParam: [{Value: 'Sector', IsLocalizeKey: true}],
			validationMessage: 'PleaseSelectFrom'
		},
		{
			type: 'dropdown',
			labels: { dropdownLabel: 'ToSector' },
			labelLocalizeParam: this.sectorLabelTextParams,
			dropdownData: [] as dropdownWithExtras[],
			controlName: 'copyToDestinationSector',
			validationMessageDynamicParam: [{Value: 'Sector', IsLocalizeKey: true}],
			validationMessage: 'PleaseSelectTo'
		}
	];


	private handleCopyItemChanges(): void {
		this.copyItemService.getChanges()
			.pipe(
				takeUntil(this.destroyAllSubscribtion$),
				switchMap((data: CopyTreeModel) => {
					if (data.controlName == 'copyToSourceSector') {
						return this.eventReasonService.getDropdownRecordsBySectorId(Number(data.change.Value))
							.pipe(switchMap((item: GenericResponseBase<dropdownWithExtras[]>) => {
								if (isSuccessfulResponse(item)) {
									this.copyDailogInfo.formGroup.controls['TreeValues'].reset();
									this.setCopySectorTreeData(item.Data);

									const copySectorDestinationDrpData = [...this.copyItemService.getItemListForCopyItems().value];
									copySectorDestinationDrpData.splice(copySectorDestinationDrpData.findIndex((el: dropdownModel) =>
										el.Value === data.change.Value), magicNumber.one);

									this.setCopyDropdownData(copySectorDestinationDrpData, 'copyToDestinationSector');
									this.copyDailogInfo.formGroup.controls["copyToDestinationSector"].reset();
								}
								return [];
							}));
					}
					return [];
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
	}

	private setCopySectorTreeData(treeArr: dropdownModel[]) {
		if (treeArr.length == Number(magicNumber.zero)) {
			this.copyDailogInfo.treeData = {};
		}
		else {
			const requiredTreeArray = treeArr.map((obj: dropdownWithExtras) => {
					const arra: string[] = Object.keys(obj);
					return arra.reduce((accumulator: DynamicObject, key: string) => {
						accumulator[key.toLowerCase()] = obj[key];
						return accumulator;
					}, {});
				}),

				treeData = {
					treeData: [
						{
							text: 'All',
							items: requiredTreeArray
						}
					],
					label: 'SelectEventReasonToCopy',
					tooltipVisible: false,
					textField: 'text',
					tooltipTitle: 'SelectTheRecordsToCopy',
					isRequired: true,
					treeViewType: "copyTree"
				};
			this.copyDailogInfo.treeData = treeData;
		}
		if (treeArr.length) {
			this.isAnyTreeValue = true;
		} else {
			this.isAnyTreeValue = false;
		}
	}

	private setCopyDropdownData(drpData: dropdownWithExtras[], controlName: string): void {
		const index = this.copyDialogData.findIndex((i) =>
			i.controlName == controlName);
		if (index >= Number(magicNumber.zero)) {
			this.copyDialogData[index].dropdownData = drpData;
		}
	}


	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Event Reason_${uniqueDateCode}`;

		return fileName;
	}

	public calculateDate(date: number): string {
		return date < Number(magicNumber.ten)
			? `0${date}`
			: date.toString();
	}

	ngOnDestroy(): void {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		this.copyDailogInfo?.close();
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
