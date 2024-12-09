import { HttpStatusCode } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionToAdd } from '@xrm-shared/services/common-constants/common-header-action.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { AssingmentDetailsService } from '../../assignment-details/service/assingmentDetails.service';
import { gridSetting } from '@xrm-shared/services/common-constants/gridSetting';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AssignmentRevision, NavigationEx, PageSizeResponse, gridActionSet } from '@xrm-master/role/Generictype.model';
import { NavigationPaths } from '../service/route';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-revision-list',
	templateUrl: './revision-list.component.html',
	styleUrls: ['./revision-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevisionListComponent implements OnInit, OnDestroy {
    @Input() assignmentID: number|null = null;
    public isServerSidePagingEnable:boolean=true;
    public entityId:number= XrmEntities.AssignmentRevision;
    public columnOptions:GridColumnCaption[]=[];
    public selectTextsearch:string='';
    public appliedAdvFilters:[]=[];
    public actionSet:gridActionSet[] = [];
    private actionsToAdd: ActionToAdd[]= [];
    public navigationExtras: NavigationEx;
    public manageActionSets: ManageGridActionSet[] = [
    	{
    		ColumnName: 'IsOwnedRecord',
    		ColumnValue: false,
    		ActionTitles: ['Withdraw']
    	},
    	{
    		ColumnName: 'IsApprover',
    		ColumnValue: false,
    		ActionTitles: ['Review']
    	},
    	{
    		ColumnName: 'CanProcess',
    		ColumnValue: false,
    		ActionTitles: ['Process']
    	}
    ];

    public tabOptions: unknown = Number(this.getRoleGroupId()) == Number(magicNumber.four)
    	? {
    	bindingField: 'IsApprover',
    	tabList: [
    		{
    			tabName: 'PendingMyApprovals',
    			favourableValue: true,
    			selected: true
    		},
    		{
    			tabName: 'All',
    			favourableValue: 'All',
    			selected: false
    		}
    	]
    	}:
    	{
    		bindingField: 'CanProcess',
    		tabList: [
    			{
    				tabName: 'PendingForMspProcess',
    				favourableValue: true,
    				selected: true
    			},
    			{
    				tabName: 'All',
    				favourableValue: 'All',
    				selected: false
    			}
    		]
    	};

    public pageSize=magicNumber.zero;
    private unsubscribe$ = new Subject<void>();

    // eslint-disable-next-line max-params
    constructor(
    private SStorage: SessionStorageService,
    private gridViewService: GridViewService,
    private router: Router,
    private assignmentService: AssingmentDetailsService,
	private cd:ChangeDetectorRef
    ) { }


    ngOnInit() {
    	this.getExtraActionSet();
    	this.updateActionSet();
    	this.initializeGridSettings();
    	if (this.assignmentID !== null) {
    		this.tabOptions = {};
    	}
    	this.navigationExtras = {
    		queryParams: {
    			assignmentID: this.assignmentID
    		}
    	};

    }

    private initializeGridSettings() {
    	const entityType = this.assignmentID === null
    		? 'RevisionMenuList'
    		: 'AssignmentRevisionList';
    	forkJoin({
    		columnData: this.gridViewService.getColumnOptionValue(this.entityId, entityType).pipe(takeUntil(this.unsubscribe$)),
    		pageSizeData: this.gridViewService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.unsubscribe$))
    	}).subscribe({
    		next: ({ columnData, pageSizeData }) => {
    			this.getColumnData(columnData);
    			this.getPageSize(pageSizeData);
    			this.cd.markForCheck();
    		},
    		error: (err) => {
    		}
    	});
    }

    private getColumnData(data: GenericResponseBase<GridColumnCaption[]>) {
    	if (data.Succeeded && data.Data) {
    		this.columnOptions = data.Data.map((e: GridColumnCaption) => {
    			e.fieldName = e.ColumnName;
    			e.columnHeader = e.ColumnHeader;
    			e.visibleByDefault = e.SelectedByDefault;
    			return e;
    		});
    	}
    }

    private getPageSize(data: PageSizeResponse) {
    	if (data.StatusCode === Number(HttpStatusCode.Ok)) {
    		const Data = data.Data;
    		this.pageSize = Data?.PageSize;
    	}
    }

    private getRoleGroupId():string|null{
    	const roleGroupId: string|null = this.SStorage.get('roleGroupId');
    	return roleGroupId;
    }

    private onView = (dataItem: AssignmentRevision) => {
    	if(this.assignmentID === null)
    	  this.router.navigate([`${NavigationPaths.view}/${dataItem.UKey}`]);
    	else
    		this.assignmentService.setRevisionPageIndex(magicNumber.two, this.assignmentID, dataItem.UKey, false);
    };

    private onReview = (dataItem: AssignmentRevision) => {
    	if(this.assignmentID === null)
    		this.router.navigate([`${NavigationPaths.review}/${dataItem.UKey}`]);
    	else
    		this.assignmentService.setRevisionPageIndex(magicNumber.three, this.assignmentID, dataItem.UKey, false);
    };


    private onWidthdraw = (dataItem: AssignmentRevision) => {
    	if(this.assignmentID === null)
    		this.router.navigate([`${NavigationPaths.withdraw}/${dataItem.UKey}`]);
    	else
    		this.assignmentService.setRevisionPageIndex(magicNumber.four, this.assignmentID, dataItem.UKey, false);
    };

    private onProcess = (dataItem: AssignmentRevision) => {
    	if(this.assignmentID === null)
    		this.router.navigate([`${NavigationPaths.process}/${dataItem.UKey}`]);
    	else
    		this.assignmentService.setRevisionPageIndex(magicNumber.five, this.assignmentID, dataItem.UKey, false);
    };


    private getViewActionSet() {
    	return {
    		icon: gridSetting.eyeIcon,
    		title: 'View',
    		color: 'dark-blue-color',
    		fn: this.onView,
    		actionId: [
    			Permission.MSP_PROCESS,
    			Permission.MSP_DECLINE,
    			Permission.REVIEW_APPROVE,
    			Permission.REVIEW_DECLINE,
    			Permission.VIEW_ONLY
    		]
    	};
    }

    private getWithdrawActionSet() {
    	return {
    		icon: gridSetting.withdraw,
    		title: 'Withdraw',
    		color: 'red-color',
    		fn: this.onWidthdraw,
    		actionId: [Permission.WITHDRAW]
    	};
    }

    private getProcessActionSet() {
    	return {
    		icon: gridSetting.process,
    		title: 'Process',
    		color: 'orange-color',
    		fn: this.onProcess,
    		actionId: [
    			Permission.MSP_PROCESS,
    			Permission.MSP_DECLINE
    		]
    	};
    }

    public getExtraActionSet() {
    	this.actionsToAdd = [
    		this.getWithdrawActionSet(),
    		this.getProcessActionSet()
    	];
    }


    private getReviewActionSet() {
    	return {
    		icon: gridSetting.checkFile,
    		title: 'Review',
    		color: 'light-blue-color',
    		fn: this.onReview,
    		actionId: [
    			Permission.REVIEW_APPROVE,
    			Permission.REVIEW_DECLINE
    		]
    	};
    }


    private updateActionSet() {
    	this.actionSet = [
    		{
    			Status: 188,
    			Items: [
    				this.getViewActionSet(),
    				this.getReviewActionSet(),
    				this.getWithdrawActionSet()
    			]
    		},
    		{
    			Status: 190,
    			Items: [this.getViewActionSet()]
    		},
    		{
    			Status: 204,
    			Items: [this.getViewActionSet()]
    		},
    		{
    			Status: 205,
    			Items: [this.getViewActionSet()]
    		},
    		{
    			Status: 206,
    			Items: [this.getViewActionSet()]
    		},
    		{
    			Status: 207,
    			Items: [
    				this.getViewActionSet(),
    				this.getProcessActionSet(),
    				this.getWithdrawActionSet()
    			]
    		},
    		{
    			Status: 208,
    			Items: [
    				this.getViewActionSet(),
    				this.getProcessActionSet(),
    				this.getWithdrawActionSet()
    			]
    		}
    	];
    }

    public onSearchTriggered(searchText: string){
    	this.selectTextsearch = searchText;
    }

    public onFilterTriggered(appliedFilters: []){
    	this.appliedAdvFilters = appliedFilters;
    }

    ngOnDestroy(): void {
    	this.unsubscribe$.next();
    	this.unsubscribe$.complete();

    }


}

