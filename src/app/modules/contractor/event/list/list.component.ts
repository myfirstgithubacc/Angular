import { Component, Input, OnInit, OnChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { NavigationPaths } from '../constant/routes-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { HttpStatusCode } from '@angular/common/http';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { ContractorEvent } from '../data.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Entity, EntityAction, IEventDetailsUkey, UserObject } from '../constant/event-interface';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPageSize, IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';

@Component({selector: 'app-contractor-event-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsListComponent implements OnInit, OnChanges, OnDestroy {
	@Input() isTab: boolean = false;
	@Input() contractorId: number;
	@Input() contractorUkey:string;
	public isaddEdit: boolean = false;
	public isView: boolean = false;
	public isList: boolean = true;
	public dataItemUkey: string;
	public actionSet: IRecordButtonGrid[];
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public tabOptions: ITabOptions;
	public massActivateDeactivate: ActivateDeactivate[];
	public entityId = XrmEntities.ContractorEvent;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = NavigationPaths.apiAddress;
	public advApiAddress: string = NavigationPaths.advApiAddress;
	public searchText: string;
	public appliedAdvFilters: [];
	public userObject: UserObject;
	public showBtn: boolean = false;
	private ngUnsubscribe = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		public permissionService: PermissionsService,
		public activatedRoute: ActivatedRoute,
		private router: Router,
		private loaderService: LoaderService,
		private gridService: GridViewService,
		private toasterServc : ToasterService,
		private gridConfiguration : GridConfiguration,
		private ContractorServc: ContractorService,
		private menuService: MenuService
	) {}

	ngOnInit(): void {
		this.callGridData();
		this.callColumnAndPageData();
	}

	private callGridData(): void{
		this.getTabOptions();
		this.getPermisssion();
		this.getActionSet();
		this.ngOnChanges();
	}

	ngOnChanges() {
		if(this.isTab){
			this.userObject = {"contractorUKey": this.contractorUkey};
			this.isList = true;
		}else{
			this.userObject = {"contractorUKey": null};
		}
	}

	navigate(){
		if(this.isTab){
			this.isaddEdit = true;
			this.isList = false;
			this.isView = false;
		}else{
			this.router.navigate([NavigationPaths.addEdit]);
		}
	}

	cancelForm(value: boolean){
		if(value){
			this.isaddEdit= false;
			this.isView=false;
			this.isList=true;
		}
	}

	viewBack= () => {
		this.isTab=false;
		this.isView=false;
		this.isList=true;
		this.isaddEdit = false;
	};

	private onView = (dataItem: IEventDetailsUkey) => {
		this.dataItemUkey=dataItem.UKey;
		if(this.isTab){
			this.isView=true;
			this.isaddEdit=false;
			this.isList = false;
		}else{
			this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
		}
	};

	private onActivateDeactivateAction = (dataItem: IEventDetailsUkey) => {
		this.massActivateDeactivate = [];
		const laborData = new ContractorEvent({
			UKey: dataItem.UKey,
			Disabled: !dataItem.Disabled,
			ReasonForChange: ''
		});
		this.massActivateDeactivate.push(laborData);
		this.activateDeactivateContractor(this.massActivateDeactivate);
	};


	private activateDeactivateContractor(activeDeactiveData: ActivateDeactivate[]) {
		this.ContractorServc.updateContactEventStatus(activeDeactiveData).pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((res:ApiResponseBase) => {
				if(res.Succeeded){
					this.gridConfiguration.refreshGrid();
					if (activeDeactiveData[magicNumber.zero].Disabled) {
						this.toasterServc.showToaster(ToastOptions.Success, "ContractorEventDeactivatedSuccessfully");
					}else {
						this.toasterServc.showToaster(ToastOptions.Success, "ContractorEventActivatedSuccessfully");
					}
				}else {
					this.toasterServc.showToaster(ToastOptions.Error, "Somethingwentwrong");
				}
			});
	}

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showViewAndDeactiveActionIcon(
					this.onView,
				 this.onActivateDeactivateAction
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showViewAndActivateActionIcon(
					this.onView,
					this.onActivateDeactivateAction
				)
			}
		];
	}


	public manageActionSets: ManageGridActionSet[] = [
		{
			ColumnName: 'BackfillRequired',
			ColumnValue: "Yes",
			ActionTitles: ['Deactivate']
		},
		{
			ColumnName: 'BackfillRequired',
			ColumnValue: "Yes",
			ActionTitles: ['Activate']
		}
	];

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

	private callColumnAndPageData() {
		this.loaderService.setState(true);

		forkJoin({
			columnData: this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.ngUnsubscribe)),
			pageSize: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.ngUnsubscribe))
		}).subscribe({
			next: (results: { columnData: GenericResponseBase<GridColumnCaption[]>, pageSize: GenericResponseBase<IPageSize>,
				}) => {
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

	private getPermisssion() {
		this.menuService.getAuthorizedActionsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: Entity[]) => {
			const pers = data.find((val: Entity) =>
				val.EntityId == Number(this.entityId));
			if(pers){
				this.showBtn = pers.EntityActions.some((x: EntityAction) =>
					x.ActionId == Number(Permission.CREATE_EDIT__CREATE));
			}
		});
	}

	public onSearchTriggered(searchText: string) {
		this.searchText = searchText;
	}

	public onFilterTriggered(appliedFilters: []) {
		this.appliedAdvFilters = appliedFilters;
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
		this.isTab = false;
		this.toasterServc.resetToaster();
	}
}
