import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from '../constants/routes-constants';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Subject, takeUntil, forkJoin} from 'rxjs';
import { BusinessClassificationService } from 'src/app/services/masters/business-classification.service';
import { BusinessClassification } from '@xrm-core/models/business-classification';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy {

	public pageSize:number = magicNumber.zero;
	public entityId = XrmEntities.BusinessClassification;
	public advFilterData: BusinessClassification[] = [];
	public searchText: string;
	public isServerSidePagingEnable: boolean = true;
	public apiAddress: string = 'biscl/get-paged';
	public advApiAddress: string = 'biscl/advance-search-drpdwn';
	private destroyAllSubscribtion$ = new Subject<void>();
	public columnOptions : GridColumnCaption[] = [];
	private businessClassificationLabelTextParams: DynamicParam[] = [{ Value: 'BusinessClassificationSmall', IsLocalizeKey: true }];

	// eslint-disable-next-line max-params
	constructor(
    private toasterService: ToasterService,
    private router: Router,
    private gridService: GridViewService,
    private gridConfiguration: GridConfiguration,
	private businessClassificationService: BusinessClassificationService
	) {
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

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.twenty;
		}
	}

	private ActivateDeactivate(dataItem: string[], status:boolean) {
		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				ukey: item,
				disabled: status,
				reasonForChange: ''
			}));
		this.businessClassificationService.deleteBusinessClassification(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterService.resetToaster();
			this.toasterService.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.businessClassificationLabelTextParams);
			this.gridConfiguration.refreshGrid();
		});
	}

	private onActiveChange = (dataItem: BusinessClassification) => {
		if (dataItem.UKey) {
			const a: string[] = [dataItem.UKey];
			this.ActivateDeactivate(a, !dataItem.Disabled);
		}
	};

	private onView = (dataItem: BusinessClassification) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: BusinessClassification) => {
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

	public tabOptions : ITabOptions = {
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

	private getColumnData(res:GenericResponseBase<GridColumnCaption[]>) {
		if(isSuccessfulResponse(res)){
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	public OnFilter(filteredData: BusinessClassification[]) {
		this.advFilterData = filteredData;
	}

	public OnSearch(SearchData: string) {
		this.searchText = SearchData;
	}

	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Business Classification_${uniqueDateCode}`;

		return fileName;
	}

	public calculateDate(n: number): string {
		return n < Number(magicNumber.ten)
			? `0${n}`
			: n.toString();
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
