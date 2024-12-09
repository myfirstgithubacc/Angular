import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
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
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { OrganizationLevelService } from '@xrm-master/organization-level/service/organization-level.service';
import { AdvanceSearchFilter, ContactDetails } from '../constant/contractor-interface';
import { GridColumn } from '@xrm-core/models/job-category.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { ClientDetails } from '@xrm-master/organization-level/Interfaces/Interface';
import { IRecordButtonGrid, ITabOptions } from '@xrm-shared/models/common.model';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';

@Component({selector: 'app-contractor-list',
	templateUrl: './contractor-list.component.html',
	styleUrls: ['./contractor-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractorListComponent implements OnInit, OnDestroy {
	public actionSet: IRecordButtonGrid[];
	public columnOptions: GridColumnCaption[];
	public pageSize: number;
	public tabOptions: ITabOptions;
	public entityId = XrmEntities.Contractor;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = NavigationPaths.apiAddress;
	public advApiAddress: string = NavigationPaths.advApiAddress;
	public searchText: string;
	public appliedAdvFilters: AdvanceSearchFilter;
	private SectorLabel:string = 'Sector';
	private ngUnsubscribe$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		public permissionService: PermissionsService,
		private router: Router,
		private loaderService: LoaderService,
		private gridService: GridViewService,
		private toasterServc : ToasterService,
		private gridConfiguration : GridConfiguration,
		private ContractorServc: ContractorService,
		private localizationService:LocalizationService,
		private organizationLevelService:OrganizationLevelService
		 ){}


	ngOnInit(): void {
		this.getTabOptions();
		this.getActionSet();
		forkJoin({
			getPageSize: this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.ngUnsubscribe$)),
			updateSectorName: this.organizationLevelService.getConfigureClient().pipe(takeUntil(this.ngUnsubscribe$))
		}).subscribe({
			next: ({getPageSize, updateSectorName}) => {
				this.getPageSize(getPageSize);
				this.updateSectorName(updateSectorName);
			}
		});
	}

	private updateSectorName(data:GenericResponseBase<ClientDetails>) {
		  if (data.Succeeded) {
			this.SectorLabel = data.Data?.OrganizationLabel ?? 'Sector';
		  }
		  this.getColumnData();
	}

	private onView = (dataItem: ContactDetails) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
		this.ContractorServc.showAddButtonContractor.next(false);
	};

	private onEdit = (dataItem: ContactDetails) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
		this.ContractorServc.showAddButtonContractor.next(true);
	};

	public getActionSet() {
		this.actionSet = [
			{
				Status: false,
				Items: this.gridConfiguration.showViewEditIcon(
					this.onView,
					this.onEdit
				)
			},
			{
				Status: true,
				Items: this.gridConfiguration.showViewEditIcon(
					this.onView,
					this.onEdit
				)
			}
		];
	}

	private getColumnData() {
		this.gridService.getColumnOption(this.entityId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: ApiResponse) => {
    	if (res.Succeeded) {
    		this.loaderService.setState(false);
    		this.columnOptions = res.Data.map((e: GridColumn) => {
    			e.fieldName = e.ColumnName;
    			e.columnHeader = e.ColumnHeader;
    			e.visibleByDefault = e.SelectedByDefault;
    			return e;
    		});
				this.columnOptions.forEach((x) => {
					if(x.columnHeader === "SectorName"){
				  x.columnHeader = this.localizationService.GetLocalizeMessage('SectorName', [{Value: this.SectorLabel, IsLocalizeKey: false}]);

				 }
			 });
    	} else {
    		this.loaderService.setState(false);
    	}
		});
	}

	private getPageSize(res:GenericResponseBase<{PageSize : number}>) {
		if(isSuccessfulResponse(res)){
			this.loaderService.setState(true);
			this.loaderService.setState(false);
			if (res.StatusCode != Number(HttpStatusCode.Ok))
				return;
			this.pageSize = res.Data.PageSize;
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

	public onFilterTriggered(appliedFilters: AdvanceSearchFilter) {
		this.appliedAdvFilters = appliedFilters;
	}

	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
	}
}


