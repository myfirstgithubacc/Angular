import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { TerminationReasonService } from 'src/app/services/masters/termination-reason.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { NavigationPaths } from '../route-constants/routes-constants';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { TerminationReason } from '@xrm-core/models/termination-reason';
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

export class ListComponent implements OnInit, OnDestroy{

	public entityId= XrmEntities.TerminationReason;
	public pageSize = magicNumber.zero;
	public isServerSidePagingEnable: boolean = true;
	public searchText: string;
	public fileName: string;
	public advFilterData: TerminationReason[]= [];
	private destroyAllSubscribtion$ = new Subject<void>();
	public advApiAddress: string = 'trmrsn-advsearch/getdropdown';
	public apiAddress: string = 'trmrsn-selectpaged/paged';
	public advanceSearchFields: TerminationReason[] = [];
	public columnOptions : GridColumnCaption[] = [];
	private terminationLabelTextParams: DynamicParam[] = [{ Value: 'TerminationReasonSmall', IsLocalizeKey: true }];

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

	constructor(
    	private router: Router,
    	private terminationReasonService: TerminationReasonService,
		private gridService: GridViewService,
		private gridConfiguration: GridConfiguration,
    	private toasterServ: ToasterService
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

	private getColumnData( result : GenericResponseBase<GridColumnCaption[]> ) {
		if(isSuccessfulResponse(result))
			this.columnOptions = result.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
	};

	private activateDeactivateTerminationReason(dataItem: string[], status: boolean) {

		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				ukey: item,
				disabled: status,
				reasonForChange: ''
			}));

		this.terminationReasonService.UpdateBulkStatus(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterServ.resetToaster();
			this.toasterServ.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.terminationLabelTextParams);
			this.gridConfiguration.refreshGrid();
		});
	}


	private onActiveChange = (dataItem: TerminationReason) => {
		if (dataItem.UKey) {
			const a: string[] = [dataItem.UKey];
			this.activateDeactivateTerminationReason(a, !dataItem.Disabled);
		}
	};

	private onView = (dataItem: TerminationReason) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
	};

	private onEdit = (dataItem: TerminationReason) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.UKey}`]);
	};

	public actionSet : IActionSetModel[] =[
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

	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`;
		 this.fileName = `Termination Reason_${uniqueDateCode}`;

		return this.fileName;
	}

	public calculateDate(n: number): string {
		return n < Number(magicNumber.ten)
			? `0${n}`
			: n.toString();
	}

	public navigateToAdd(){
		this.router.navigate([NavigationPaths.addEdit]);
	}

	public OnFilter(data: TerminationReason[]) {
		this.advFilterData = data;
	}

	public OnSearch(data: string) {
		this.searchText= data;
	}

	ngOnDestroy(): void {
		this.toasterServ.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}
