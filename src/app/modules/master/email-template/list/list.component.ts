import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { EmailTemplateService } from 'src/app/services/masters/email-template.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { NavigationPaths } from '../constants/routeConstants';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Dataitem } from '../constants/models';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { IBulkStatusUpdateAction, IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';

@Component({selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

	public entityId = XrmEntities.EmailTemplate;

	public pageSize = magicNumber.zero;

	private destroyAllSubscribtion$ = new Subject<void>();

	public isServerSidePagingEnable: boolean = true;

	public advFilterData: unknown = [];

	public searchText: string;

	public apiAddress: string = 'email-temp-getpaged/paged';

	public advApiAddress: string = 'email-temp-advsearch/getdropdown';

	private emailTemplateLabelTextParams: DynamicParam[] = [{ Value: 'EmailTemplateSmall', IsLocalizeKey: true }];

	public columnOptions: GridColumnCaption[] = [];

	public tabOptions: ITabOptions = {
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

	private onActiveChange = (dataItem: Dataitem) => {
		const a = [dataItem.Ukey];
		this.ActivateDeactivateEmailTemplate(a, !dataItem.Disabled, false);
	};

	private onView=(dataItem: Dataitem) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.Ukey}`]);
	};

	private onEdit = (dataItem: Dataitem) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.Ukey}`]);
	};

	public actionSet = [
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

	// eslint-disable-next-line max-params
	constructor(
	private router: Router,
	private gridService: GridViewService,
	private toasterService: ToasterService,
	private gridConfiguration: GridConfiguration,
	private emailtemplateService: EmailTemplateService
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

	navigate() {
		this.router.navigate([NavigationPaths.list]);
	}

	generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Email Template_${uniqueDateCode}`;

		return fileName;
	}

	private calculateDate(n: number) {
		return n < Number(magicNumber.ten)
			? `0${ n}`
			: n.toString();
	}

	onGroupedAction(event: IBulkStatusUpdateAction) {
		this.ActivateDeactivateEmailTemplate(event.rowIds, (event.actionName == "deactivate"), true);
	}

	private ActivateDeactivateEmailTemplate(dataItem: string[], status: boolean, isGroupedActionClicked:boolean) {
		const Id = [];

		for(const i in dataItem){
			const c1 = {ukey: dataItem[i], disabled: status, reasonForChange: ''};
			Id.push(c1);
		}
		this.emailtemplateService.UpdateBulkStatus(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
			this.toasterService.resetToaster();
			if(isGroupedActionClicked && dataItem.length > Number(magicNumber.one)){
				this.toasterService.showToaster(ToastOptions.Success, `${status
					? 'SelectedEmailTemplateHaveBeenDeactivatedSuccessfully' :
					'SelectedEmailTemplateHaveBeenActivatedSuccessfully'}`);
			}
			else if(isGroupedActionClicked && dataItem.length == Number(magicNumber.one)){
				this.toasterService.showToaster(ToastOptions.Success, `${status
					? 'SelectedEmailTemplateDeactivatedSuccessfully' :
					'SelectedEmailTemplateActivatedSuccessfully'}`);
			}
			else{
				this.toasterService.showToaster(ToastOptions.Success, `${status
					? 'EntityHasBeenDeactivatedSuccessfully' :
					'EntityHasBeenActivatedSuccessfully'}`, this.emailTemplateLabelTextParams);
			}
			this.gridConfiguration.refreshGrid();
		});
	}

	OnSearch(list: string) {
		this.searchText = list;
	}

	OnFilter(filteredData: unknown) {
		this.advFilterData = filteredData;
	}

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.toasterService.resetToaster();
	}
}
