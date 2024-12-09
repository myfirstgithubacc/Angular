import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPaths } from '../constants/routes-constants';
import { AutoprocessConfigurationService } from 'src/app/services/masters/autoprocess-configuration.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IActionSetModel } from '@xrm-shared/models/grid-actionset.mode';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { IPageSize, ITabOptions } from '@xrm-shared/models/common.model';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { EMPTY, forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Job } from '@xrm-core/models/auto-process-configuration.model';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';


@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrl: './list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListComponent implements OnInit, OnDestroy{

	public pageSize:number = magicNumber.zero;
	public columnOptions: GridColumnCaption[] =[];
	public entityId: number = XrmEntities.AutoProcess;
	public isServerSidePagingEnable:boolean = true;
	public advApiAddress: string = 'apjb/select-paged';
	public apiAddress: string = 'apjb/Paged';
	private destroyAllSubscribtion$ = new Subject<void>();
	private jobLabelTextParams: DynamicParam[] = [{ Value: 'JobSmall', IsLocalizeKey: true }];
	public showPopup = false;
	public advFilterData: Job[] = [];
	public searchText: string;
	private gatewayUrl: string;

	constructor(
	  private router: Router,
	  private gridConfiguration: GridConfiguration,
	  private gridService: GridViewService,
	  private toasterService: ToasterService,
	  public autoProcessService: AutoprocessConfigurationService,
	  private cdr: ChangeDetectorRef
	) {

	}


	ngOnInit(): void {
		forkJoin([
			this.gridService.getColumnOption(this.entityId),
			this.gridService.getPageSizeforGrid(this.entityId)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([columns, pageData]) => {
			this.getColumnData(columns);
			this.getPageSizeData(pageData);
			this.cdr.detectChanges();

		});
	}

	private getColumnData(res : GenericResponseBase<GridColumnCaption[]>) {
		if(isSuccessfulResponse(res)){
			this.columnOptions = res.Data.map((event: GridColumnCaption) => {
				event.fieldName = event.ColumnName;
				event.columnHeader = event.ColumnHeader;
				event.visibleByDefault = event.SelectedByDefault;
				return event;
			});
		}
	}

	private getPageSizeData(res: GenericResponseBase<IPageSize>) {
		if (res.StatusCode === Number(HttpStatusCode.Ok)) {
			const Data = res.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.twenty;
		}
	}

	private onActiveChange = (dataItem: Job) => {
		if (dataItem.JobUkey) {
			const a: string[] = [dataItem.JobUkey];
			this.ActivateDeactivateEventReason(a, !dataItem.Disabled);
		}
	};

	private onView=(dataItem: Job) => {
		this.router.navigate([`${NavigationPaths.view}/${dataItem.JobUkey}`]);
	};

	private onEdit=(dataItem: Job) => {
		this.router.navigate([`${NavigationPaths.addEdit}/${dataItem.JobUkey}`]);
	};

	private onExecuted = (dataItem: Job) => {
		this.gatewayUrl = dataItem.GatewayUrl.replace("/xrm/v{version}", "");
		this.autoProcessService.executeJob(dataItem.JobId, this.gatewayUrl)
		  .pipe(
			  takeUntil(this.destroyAllSubscribtion$),
			  switchMap((res: GenericResponseBase<null>) => {

				  const isExecuted = res.Succeeded,
				   message = res.Message,

				   payload = {
					  jobClientMappingUkey: dataItem.JobClientMappingUkey,
					  isExecuted,
					  message
				  };
				  if(res.Succeeded){
						this.toasterService.showToaster(ToastOptions.Success, 'ExecutedJobSuccessfully');
				  }
				  else{
						this.toasterService.showToaster(ToastOptions.Error, 'JobExecutedFailed');
				  }
				  return this.autoProcessService.executeJobDetailsUpdate(payload);
			  }),
			  takeUntil(this.destroyAllSubscribtion$)
		  )
		  .subscribe(() => {
			  this.gridConfiguration.refreshGrid();
		  });
	};


	public actionSet : IActionSetModel[] = [
		{
			Status: "Not Scheduled Active",
			Items: this.gridConfiguration
				.showAllActionIcon(this.onView, this.onEdit, this.onActiveChange)
		},
		{
			Status: "Not Scheduled InActive",
			Items: this.gridConfiguration
				.showInactiveActionIcon(this.onView, this.onEdit, this.onActiveChange)
		},
		{
			Status: "Single Trigger Defined Active",
			Items: this.gridConfiguration
				.showDeactiveIconWithExecute(this.onView, this.onEdit, this.onActiveChange, this.onExecuted)
		},
		{
			Status: "Single Trigger Defined InActive",
			Items: this.gridConfiguration
				.showActiveIconWithExecute(this.onView, this.onEdit, this.onActiveChange)
		},
		{
			Status: "Multiple Triggers Defined Active",
			Items: this.gridConfiguration
				.showDeactiveIconWithExecute(this.onView, this.onEdit, this.onActiveChange, this.onExecuted)
		},
		{
			Status: "Multiple Triggers Defined InActive",
			Items: this.gridConfiguration
				.showActiveIconWithExecute(this.onView, this.onEdit, this.onActiveChange)
		}
	];

	private ActivateDeactivateEventReason(dataItem: string[], status: boolean) {

		const Id: RecordStatusChangeResponse[] = dataItem.map((item) =>
			({
				uKey: item,
				disabled: status
			}));

		this.autoProcessService.enableAutoProcess(Id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {

			this.toasterService.resetToaster();

			this.toasterService.showToaster(ToastOptions.Success, `${status
				? 'EntityHasBeenDeactivatedSuccessfully' :
				'EntityHasBeenActivatedSuccessfully'}`, this.jobLabelTextParams);

			this.gridConfiguration.refreshGrid();
		});

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

	public generateFileName(){

		const date = new Date(),
			uniqueDateCode = `${this.calculateDate(date.getMonth() + magicNumber.one) +
		this.calculateDate( date.getDate()) + date.getFullYear().toString() }_${ this.calculateDate( date.getHours() )
			}${this.calculateDate( date.getMinutes() ) }${this.calculateDate( date.getSeconds() )}`,
		 fileName = `Auto Process_${uniqueDateCode}`;

		return fileName;
	}

	private calculateDate(date: number): string {
		return date < Number(magicNumber.ten)
			? `0${date}`
			: date.toString();
	}

	public OnFilter(filteredData: Job[]) {
		this.advFilterData = filteredData;
	}

	public OnSearch(list:string){
		this.searchText= list;
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}

}

