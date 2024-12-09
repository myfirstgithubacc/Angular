import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { NavigationPaths } from '../navigation-paths/NavigationPaths';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ManageCountry } from '@xrm-core/models/manage-country.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { ManageCountryService } from 'src/app/services/masters/manage-country.service';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {

	public columnOptions: GridColumnCaption[] = [];

	public pageSize: number= magicNumber.zero;

	public destroyAllSubscribtion$ = new Subject<void>();

	public entityId = XrmEntities.ManageCountry;

	public isServerSidePagingEnable: boolean = true;

	public searchText: string;

	public advFilterData: ManageCountry[] = [];

	private manageCountryParams: DynamicParam[] = [{ Value: 'Country', IsLocalizeKey: true }];

	public apiAddress: string = 'ctry/paged';

	public advApiAddress: string = 'ctry/select-paged';

	constructor(
		private router: Router,
		private gridService: GridViewService,
		private manageCountryService: ManageCountryService,
		private toasterService : ToasterService,
		private gridConfiguration : GridConfiguration
	){

	}

	ngOnInit(): void {
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columns, pageData]) => {
			this.getColumnData(columns);
			this.getPageSizeData(pageData);
		});
	}

	private onView = (dataItem: ManageCountry) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: ManageCountry) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	private onActiveChange = (dataItem: ManageCountry) => {
		if (dataItem.UKey) {
			const a: string[] = [dataItem.UKey];
			this.activateDeactivate(a, !dataItem.Disabled);
		}
	};

	private getColumnData(response : GenericResponseBase<GridColumnCaption[]>) {
		if(isSuccessfulResponse(response)){
			this.columnOptions = response.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.twenty;
		}
	}

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

	public tabOptions : ITabOptions = {
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
				favourableValue: 'All'
			}
		]
	};

	public onFilterTriggered(filteredData: ManageCountry[]) {
		this.advFilterData= filteredData;
	}

	public onSearchTriggered(list: string) {
		this.searchText = list;
	}

	private activateDeactivate(dataItem: string[], status:boolean) {

		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				ukey: item,
				disabled: status,
				reasonForChange: ''
			}));

		this.manageCountryService.deleteManageCountry(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.manageCountryParams);
			this.gridConfiguration.refreshGrid();
		});
	}

	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Manage Country_${uniqueDateCode}`;

		return fileName;
	}

	public calculateDate(res: number): string {
		return res < Number(magicNumber.ten)
			? `0${res}`
			: res.toString();
	}

	ngOnDestroy() {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
