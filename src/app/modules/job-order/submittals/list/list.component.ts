import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { StatusUpdatePayload } from '@xrm-master/request-cancel-close-reason/Interfaces';
import { IBulkStatusUpdateAction, IPageSize, IRecordButton, IRecordButtonGrid, IStatusCardData, ITabOptions } from '@xrm-shared/models/common.model';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { filter, forkJoin, Subject, takeUntil } from 'rxjs';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Keys, NavigationUrls, RequiredStrings, Status, StatusId, SubmittalTabName, ToastMessages, ValidationMessageKeys } from '../services/Constants.enum';
import { ClientDetails, ListPayload, PRDetails, ProcessPayload } from '../services/Interfaces';
import { HttpStatusCode } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { SubmittalsService } from '../services/submittals.service';
import { RoleGroupId } from 'src/app/modules/acrotrac/common/enum-constants/enum-constants';
import { SubmittalActionsetService } from '../services/submittal-actionset.service';
import { ManageGridActionSet } from '@xrm-shared/models/manage-grid-actionset.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { IMassActionButton } from '@xrm-shared/models/mass-action-button.model';
import { ApiResponse } from '@xrm-core/models/event-configuration.model';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
@Component({
	selector: 'app-submittal-shared-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnChanges, OnDestroy {

	@Input() profReqData: PRDetails|null;

	public entityId = XrmEntities.Submittal;
	public selectTextsearch: string = RequiredStrings.EmptyString;
	public apiAddress: string ='reqbroadcast/get-all-submittal';
	public advApiAddress: string ='reqbroadcast/get-ddl';
	public isServerSidePagingEnable: boolean = true;
	public appliedAdvFilters: [] = [];
	public pageSize = magicNumber.ten;
	public bulkStatusData: StatusUpdatePayload[] = [];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public actionSet: IRecordButtonGrid[];
	public columnOptions:GridColumnCaption[];
	public userValue: ListPayload| null;
	public isNewSubmittal:boolean = false;
	private sectorLabel:string;
	public roleGroupId:string;

	public headerForm:FormGroup;
	public psrEntityId:number = XrmEntities.ProfessionalRequest;
	public buttonSet: IRecordButton[] = [];
	public entityType: string = RequiredStrings.EmptyString;
	public statusData:IStatusCardData = {
		items: []
	};
	public isCameFromProfReq: boolean = false;
	public isShowCheckbox: boolean = true;
	public massActionButtonSet: IMassActionButton[];
	private unsubscribe$: Subject<void> = new Subject<void>();

	public tabOptions:ITabOptions;
	private tabOptionForAll = {
		'3': {
			bindingField: Status.Status,
			tabList: [
				{
					tabName: Status.Drafted,
					bindingInfo: [{ columnName: 'SubmittalStatusId', values: [StatusId.Drafted] }],
					selected: false
				},
				{
					tabName: SubmittalTabName.All,
					favourableValue: Status.All,
					selected: true
				}
			]
		},
		'2': {
			bindingField: Status.Status,
			tabList: [
				{
					tabName: SubmittalTabName.PendingProcess,
					bindingInfo: [{ columnName: 'SubmittalStatusId', values: [StatusId.Submitted, StatusId.ViewByMSP, StatusId.Received, StatusId.Declined, StatusId.ReSubmitted] }],
					selected: false
				},
				{
					tabName: SubmittalTabName.PendingOnboarding,
					bindingInfo: [{ columnName: 'SubmittalStatusId', values: [StatusId.Selected] }],
					selected: false
				},
				{
					tabName: SubmittalTabName.All,
					favourableValue: Status.All,
					selected: true
				}
			]
		},
		'4': {
			bindingField: Status.Status,
			tabList: [
				{
					tabName: SubmittalTabName.ActiveCandidates,
					bindingInfo: [{ columnName: 'SubmittalStatusId', values: [StatusId.Forwarded, StatusId.ViewedByManager] }],
					selected: false
				},
				{
					tabName: SubmittalTabName.SelectedCandidates,
					bindingInfo: [{ columnName: 'SubmittalStatusId', values: [StatusId.Shortlisted] }],
					selected: false
				},
				{
					tabName: SubmittalTabName.All,
					favourableValue: Status.All,
					selected: true
				}
			]
		}
	};

	public manageActionSets: ManageGridActionSet[] = [
		{
			ColumnName: 'CutOffDatePassed',
			ColumnValue: true,
			ActionTitles: ['Edit']
		}
	];

	constructor(
    	private router: Router,
    	private toasterServ: ToasterService,
		private gridService: GridViewService,
		private sessionStorage:SessionStorageService,
		private submittalService: SubmittalsService,
		private actionSetService: SubmittalActionsetService,
		private gridConfiguration: GridConfiguration
	) {}

	ngOnInit(): void {
		this.submittalService.ParentData.next(null);
		this.submittalService.StepperData.next(null);
		this.roleGroupId = this.sessionStorage.get('RoleGroupId') ?? RequiredStrings.EmptyString;
		this.actionSetService.isCameFromProfReq = false;
		this.actionSetService.profReqData = null;
		this.tabOptions = this.tabOptionForAll[this.roleGroupId.toString() as Keys];
		this.setEntityType();
		this.manageProfReqData();
		this.getActionSet();
		this.callCombinedData();
		this.setMassActionData();
	};

	ngOnChanges(): void {
		this.setPsrData();
		this.getActionSet();
	}

	private setMassActionData(): void{
		if(this.roleGroupId == RoleGroupId.MSP.toString()){
			this.massActionButtonSet = [
				{
					tabName: SubmittalTabName.PendingProcess,
					button: [
						{
							id: 'mass-compare',
							isActiveType: true,
							title: "MassCompare",
							icon: "user-left-right-arrow",
							color: "dark-blue-color"
						},
						{
							id: 'mass-forward',
							isActiveType: true,
							title: "MassForward",
							icon: "user-forward",
							color: "orange-color"
						}
					]
				}
			];
		}
	}

	private setEntityType(): void{
		if(this.roleGroupId == RoleGroupId.StaffingAgency.toString()){
			this.entityType = 'Staffing';
		}
		else if(this.roleGroupId == RoleGroupId.Client.toString()){
			this.entityType = 'ClientReview';
		}
		else {
			this.entityType = 'MspProcess';
		}
	}

	private callCombinedData(): void{
		forkJoin([
			this.gridService.getColumnOption(this.entityId, this.entityType),
			this.gridService.getPageSizeforGrid(this.entityId),
			this.submittalService.getConfigureClient()
		]).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(([columnOptions, pageSize, clientDetails]) => {
			this.setColumnOptions(columnOptions);
			this.setPageSize(pageSize);
			this.updateSectorName(clientDetails);
		});
	}

	private updateSectorName(res: GenericResponseBase<ClientDetails>): void{
		if (res.Succeeded) {
			this.sectorLabel = res.Data?.OrganizationLabel ?? RequiredStrings.Sector;
			this.actionSetService.sectorLabel = this.sectorLabel;
		}
	}

	private setPsrData(): void {
		if(this.router.url.includes(NavigationUrls.SubmittalDetails) && this.profReqData){
			this.userValue = {requestUkey: this.profReqData.RequestUkey};
			this.enableNewSubmittal(this.profReqData);
			this.isCameFromProfReq = true;
			this.actionSetService.isCameFromProfReq = true;
			this.actionSetService.profReqData = this.profReqData;
		}
	}

	private enableNewSubmittal(psrData: PRDetails): void{
		if(
			(psrData.RequestStatus == Status.Broadcasted.toString() || psrData.RequestStatus == Status.Open.toString())
			&& (this.roleGroupId == RoleGroupId.StaffingAgency.toString())
		)
			this.isNewSubmittal = true;
		else
			this.isNewSubmittal = false;
	}
	private manageProfReqData(): void{
		this.router.events.pipe(
			takeUntil(this.unsubscribe$),
			filter((event): event is NavigationEnd =>
				event instanceof NavigationEnd)
		).subscribe((res: NavigationEnd) => {
			if (res.url.includes(NavigationUrls.List)) {
			 	this.isNewSubmittal = false;
			 	this.userValue = null;
			}
			else if(this.profReqData){
				this.userValue = {requestUkey: this.profReqData.RequestUkey};
				this.enableNewSubmittal(this.profReqData);
				this.isCameFromProfReq = true;
			}
		  });
	}

	private setColumnOptions(res:GenericResponseBase<GridColumnCaption[]>): void {
		if(res.Succeeded && res.Data){
			this.columnOptions = res.Data.map((e: GridColumnCaption) => {
				e.fieldName = e.ColumnName;
				e.columnHeader = e.ColumnHeader;
				e.visibleByDefault = e.SelectedByDefault;
				return e;
			});
		}
	}

	private setPageSize(data:GenericResponseBase<IPageSize>):void {
		if (data.StatusCode == Number(HttpStatusCode.Ok)) {
			const Data = data.Data;
			this.pageSize = Data?.PageSize ?? magicNumber.zero;
		}
	}

	ngOnDestroy(): void {
		this.toasterServ.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	};

	private getActionSet(): void {
		if (this.roleGroupId == RoleGroupId.StaffingAgency.toString()) {
			this.actionSet = this.actionSetService.makeActionSetForStaffing();
		}
		else if(this.roleGroupId == RoleGroupId.Client.toString()){
			this.actionSet = this.actionSetService.makeActionSetForClient();
		}
		else{
			this.actionSet = this.actionSetService.makeActionSetForMsp();
		}
 	};

	public onSearchTriggered(searchText: string): void {
		this.selectTextsearch = searchText;
	};

	public onFilterTriggered(appliedFilters: []): void {
		this.appliedAdvFilters = appliedFilters;
	};


	public newSubmittal(): void {
		if (this.profReqData) {
			const cutOffDate = new Date(this.profReqData.SubmittalCutOffDate),
				currentDate = new Date();
			if(cutOffDate <= currentDate){
				this.toasterServ.showToaster(ToastOptions.Error, ToastMessages.SubmittalsNotAllowedAfterCutoffDate);
				return;
			}
			if(this.profReqData.MySubmittal >= this.profReqData.SubmittalAllowedPerStaffingAgency){
				this.toasterServ.showToaster(ToastOptions.Error, ToastMessages.SubmittalsLimitExceededPerStaffingAgency);
				return;
			}
			if(this.profReqData.TotalSubmittal >= this.profReqData.SubmittalAllowedForThisRequest){
				this.toasterServ.showToaster(ToastOptions.Error, ToastMessages.TotalSubmittalsAlreadyFilled);
				return;
			}
			this.router.navigate(
				[`${NavigationUrls.Add}`],
				{ state: { requestUkey: this.profReqData.RequestUkey, isCameFromProfReq: this.isCameFromProfReq, sectorLabel: this.sectorLabel } }
			);
		}
	};

	public onGroupedAction(data: IBulkStatusUpdateAction): void{
		if(data.actionName === 'mass-compare'){
			if(data.rowIds.length == Number(magicNumber.one)){
				this.toasterServ.showToaster(ToastOptions.Error, ToastMessages.AtleastTwoRecordForMassCompare);
				return;
			}
			else if(data.rowIds.length > Number(magicNumber.four)){
				this.toasterServ.showToaster(ToastOptions.Error, ToastMessages.AtmostRecordForMassCompare, [{ Value: '4', IsLocalizeKey: false}]);
				return;
			}
			this.router.navigate([`${NavigationUrls.MassCompare}`], {state: {SubmittalIds: data.rowIds}});
		}
		else{
			const processPayload: ProcessPayload = { SubmittalIds: data.rowIds.map((item) =>
				Number(item)) },
				isMultipleSubmittals = data.rowIds.length > Number(magicNumber.one);
			this.submittalService.forwardSubmittal(processPayload).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponse) => {
				if(res.Succeeded){
					if(isMultipleSubmittals){
						this.toasterServ.showToaster(ToastOptions.Success, ToastMessages.SelectedSubmittalsForwarded);
					}
					else{
						this.toasterServ.showToaster(ToastOptions.Success, ToastMessages.SelectedSubmittalForwarded);
					}
					this.gridConfiguration.refreshGrid();
				}
				else {
					this.toasterServ.showToaster(ToastOptions.Error, res.Message ?? ValidationMessageKeys.SomeErrorOccured);
				}
			});
		}
	}

	public onTabChange(tabName: string){
		if(tabName === SubmittalTabName.PendingProcess.toString()){
			this.isShowCheckbox = true;
		}
		else{
			this.isShowCheckbox = false;
		}
	}

}
