import { HttpStatusCode } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationLevelService } from '@xrm-master/organization-level/service/organization-level.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { Subject, takeUntil } from 'rxjs';
import { AssingmentDetailsService } from '../service/assingmentDetails.service';
import { navigationUrls } from '../constants/const-routes';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { ClientDetails, IAssignmentDetails, IRecordButtonGrid } from '../interfaces/interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPageSize } from '@xrm-shared/models/common.model';


@Component({selector: 'app-contractor-assignment-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonAssignmentListComponent implements OnInit, OnDestroy {

@Input() navigationUrl:string = navigationUrls.list;
@Input() isAssignDetailsTabSelected:boolean = false;
@Input() contractorId: number;

public entityId:number = magicNumber.fiftyTwo;
public columnOptions:GridColumnCaption[] =[];
public pageSize:number = magicNumber.zero;
public appliedAdvFilters:[];
public selectTextsearch:string;
private SectorLabel:string ='Sector';
private destroyAllSubscribtion$=new Subject<void>();


public tabOptions = {
	bindingField: 'IsPreviousAssignment',
	tabList: [
		{
			tabName: 'CurrentAssignments',
			favourableValue: false,
			selected: true
		},
		{
			tabName: 'PreviousAssignments',
			favourableValue: true,
			selected: false
		},
		{
			tabName: 'All',
			favourableValue: 'All',
			selected: false
		}
	]
};

// eslint-disable-next-line max-params
constructor(
  private gridViewService:GridViewService,
  private gridConfiguration:GridConfiguration,
  private router:Router,
  private localizationService:LocalizationService,
  private organizationLevelService:OrganizationLevelService,
  private assingmentDetailsService:AssingmentDetailsService

){}

ngOnInit(): void {
	this.updateSectorName();
	this.setActionSet();
	this.getPageSize();
	this.assingmentDetailsService.resetRevisionPageIndex();
}

private onView = (dataItem: IAssignmentDetails) => {
	this.navigateEditViewActions(dataItem, 'view');
};

private onEdit = (dataItem: IAssignmentDetails) => {
	this.navigateEditViewActions(dataItem, 'add-edit');
};

public getRoleGroupId(): boolean {
	const roleGroupId = sessionStorage.getItem('roleGroupId');
	console.log(roleGroupId == '3');
	if(roleGroupId == '3')
		return true;
	return false;
}

private navigateEditViewActions(dataItem: IAssignmentDetails, action: string){
	this.assingmentDetailsService.navigationUrlCancel.next({url: `${this.navigationUrl}`,
	 isAssignDetailsTabSelected: this.isAssignDetailsTabSelected});
	this.router.navigate([`/xrm/contractor/assignment-details/${action}/${dataItem.UKey}`]);
}

private onSchedule = (dataItem: IAssignmentDetails) => {
	this.router.navigate([`${navigationUrls.shiftScheduler}/${dataItem.UKey}`]);
};
public actionSet:IRecordButtonGrid[] = [
	{
		StatusId: '138',
		Items: this.gridConfiguration.showViewEditIcon(
			this.onView,
			this.onEdit
		)
	},
	{
		StatusId: '137',
		Items: this.gridConfiguration.showViewEditIcon(
			this.onView,
			this.onEdit
		)
	}
];


private getColumnData() {
	let entityTypes;
	if (this.getRoleGroupId()) {
		entityTypes = 'AssignmentStaffingList';
	} else if (this.contractorId) {
		entityTypes = 'ContractorAssignmentList';
	} else {
		entityTypes = 'AssignmentDetailList';
	}
	this.gridViewService.getColumnOptionValue(this.entityId, entityTypes).
		pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<GridColumnCaption[]>) => {
			if (res.Succeeded && res.Data) {
				this.columnOptions = res.Data.map((colOption: GridColumnCaption) => {
					colOption.fieldName = colOption.ColumnName;
					colOption.columnHeader = colOption.ColumnHeader;
					colOption.visibleByDefault = colOption.SelectedByDefault;
					return colOption;
				});
				this.columnOptions.forEach((colOpt:GridColumnCaption) => {
					if(colOpt.columnHeader === "SectorName"){
						colOpt.columnHeader = this.localizationService.GetLocalizeMessage('SectorName', [{Value: this.SectorLabel, IsLocalizeKey: false}]);
					}
				});
			}
		});
}


private setActionSet(){
	this.actionSet = [
		{
			StatusId: '1',
			Items: this.gridConfiguration.showEditViewScheduleIcon(
				this.onView,
				this.onEdit,
				this.onSchedule
			)
		}
	];
}
private getPageSize() {
	this.gridViewService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscribtion$)).
		subscribe((res: GenericResponseBase<IPageSize>) => {
			if (res.StatusCode == Number(HttpStatusCode.Ok) && res.Data) {
				const Data = res.Data;
				this.pageSize = Data.PageSize;
			}
		});
}
private updateSectorName() {
	this.organizationLevelService.getConfigureClient().pipe(takeUntil(this.destroyAllSubscribtion$))
		.subscribe((res: GenericResponseBase<ClientDetails>) => {
			if (res.Succeeded) {
				this.SectorLabel = res.Data?.OrganizationLabel ?? 'Sector';
			}
			this.getColumnData();
		});
}

public onFilterTriggered(appliedFilters: []) {
	this.appliedAdvFilters = appliedFilters;
}

public onSearchTriggered(searchText: string) {
	this.selectTextsearch = searchText;
}

ngOnDestroy(): void {
	this.destroyAllSubscribtion$.next();
	this.destroyAllSubscribtion$.complete();
}
}
