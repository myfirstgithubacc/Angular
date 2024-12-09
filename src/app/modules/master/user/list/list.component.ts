/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { HttpStatusCode } from '@angular/common/http';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { UsersService } from '../service/users.service';
import { SmartSearchService } from '@xrm-shared/services/smartsearch.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { UserRole, UserRoleText, UserStatus} from '../enum/enums';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonFunctionService } from '../service/common-function.service';
import { Action, ActionSet, ActivateRouteResponse, DropDownWithTextValue, FilteredControlData, GroupedAction, PaginationData, RoleGroupId, StaffingUser, StatusUpdatePayload, UserDetailsActiveChange, UserStatusUpdate } from '../interface/user';
import { GridColumnCaption } from '@xrm-shared/models/grid-column-captions.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { LoggedInUserDetails } from '../model/model';

@Component({selector: 'app-list-manage-users',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
	public userTypeList:DropDownWithTextValue[] = [];
	public columnOptions:GridColumnCaption[] = [];
	public pageSize: number = magicNumber.zero;
	public userFilteredList: FilteredControlData;
	private bulkStatusData: StatusUpdatePayload[] = [];
	public selectTextsearch: string;
	public entityType: string = 'Client';
	public entityId = XrmEntities.Users;
	public subEntityType:string ='Client';
	public actionSet: ActionSet[] = [];
	private staffingAgencyInfo:LoggedInUserDetails;
	public userTypeForm:FormGroup;
	private userEnum = new Map([
		['MSP Users', 'MSP'],
		['Staffing Agency Users', 'StaffingUser'],
		['Client Users', 'Client']
	]);
	private destroyAllSubscription$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
    private router: Router,
		private gridService: GridViewService,
		public userService: UsersService,
		private localizationService: LocalizationService,
		private smartSearchService: SmartSearchService,
    private toasterService: ToasterService,
    private gridConfiguration: GridConfiguration,
		private fb:FormBuilder,
		private activatedRoute:ActivatedRoute,
		private gridViewService:GridViewService,
    private cf: CommonFunctionService,
		private cd: ChangeDetectorRef
	) {
		this.userTypeForm = this.fb.group({
			userType: []
		});
		this.userTypeList = [];
	}

	ngOnInit(): void {
		this.userService.getRolegroupId().pipe(switchMap((res: RoleGroupId | null) => {
			if (res) {
				this.userTypeForm.get('userType')?.setValue(res.roleGroupId);
		            this.entityType = this.cf.getEntityType(res.roleGroupId);
			}
			return this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscription$), map((params: Params) => {
				const activateRouteResponse: ActivateRouteResponse = {
					permission: params['permission'] || []
				};
				return activateRouteResponse;
			}));
		})).subscribe((res: ActivateRouteResponse) => {
			if (res?.permission.length > Number(magicNumber.zero)) {
				this.prepareUserTypeRadio(res.permission);
			}
		});
		this.setActionSet();
		this.getPageSize();
	}


	private setActionSet(){
		this.actionSet = [
			{
				Status: 1,
				Items: this.gridConfiguration.showAllActionIcon(
					this.onView,
					this.onEdit, this.onActiveChange
				)
			},
			{
				Status: 2,
				Items: this.gridConfiguration.showInactiveActionIcon(
					this.onView,
					this.onEdit,
					this.onActiveChange
				)
			}
		];
	}

	public getButtonName() {
		if (this.userTypeForm.get('userType')?.value == UserRole.Client) {
			return this.localizationService.GetLocalizeMessage(UserRoleText.NewClient);
		}
		else if (this.userTypeForm.get('userType')?.value == UserRole.StaffingAgency) {
			return this.localizationService.GetLocalizeMessage(UserRoleText.NewStaffingAgency);
		}
		else {
			return this.localizationService.GetLocalizeMessage(UserRoleText.NewMSP);
		}
	}

	private prepareUserTypeRadio(permission: Action[]) {
	       const msp = permission.findIndex((x: Action) =>
				x.EntityType == 'MSP'),
			staffing = permission.findIndex((x: Action) =>
				x.EntityType == 'Staffing'),
			client = permission.findIndex((x: Action) =>
				x.EntityType == 'Client');

		if (client > Number(magicNumber.minusOne)) {
			this.getClientUserTypeDetail();
		}

		if (staffing > Number(magicNumber.minusOne)) {
			this.getStaffingUserTypeDetail();
		}

		if (msp > Number(magicNumber.minusOne)) {
			this.getMspUserTypeDetail();
		}
		if(this.userTypeList.length == Number(magicNumber.one)){
			if(this.userTypeList[0]?.Value == Number(UserRole.StaffingAgency)){
				this.userService.getLoginUserInfo().pipe(takeUntil(this.destroyAllSubscription$)).
					subscribe((data:GenericResponseBase<LoggedInUserDetails>) => {
						if(data.Succeeded && data.Data){
							this.staffingAgencyInfo = data.Data;
						}
					});
			}
			this.userTypeList = [];
		}
		this.getRecordUserType();
	}

	private getRecordUserType(){
		const record = this.cf.setEntityType(this.userTypeForm.get('userType')?.value);
		this.entityType = record.entityType;
		this.subEntityType = record.subEntityType;
		this.getColumnData(this.entityType);
	}

	private getStaffingUserTypeDetail(){
		const staffingcheck = this.userTypeList.findIndex((x: DropDownWithTextValue) =>
			x.Value == Number(UserRole.StaffingAgency));
		if (staffingcheck < Number(magicNumber.zero)) {
			this.userTypeList.push({
				"Text": this.localizationService.GetLocalizeMessage('StaffingAgencyUsers'),
				"Value": UserRole.StaffingAgency
			});
			if (this.userTypeList.length == Number(magicNumber.one)) {
				if (this.userTypeForm.get('userType')?.value == null) {
					this.userTypeForm.get('userType')?.setValue(UserRole.StaffingAgency);
				}

			}
		}
	}

	private getClientUserTypeDetail(){
		const clientcheck = this.userTypeList.findIndex((x: DropDownWithTextValue) =>
			x.Value == Number(UserRole.Client));
		if (clientcheck < Number(magicNumber.zero)) {
			this.userTypeList.push({
				"Text": this.localizationService.GetLocalizeMessage('ClientUsers'),
				"Value": UserRole.Client
			});
			if (this.userTypeForm.get('userType')?.value == null) {
				this.userTypeForm.get('userType')?.setValue(UserRole.Client);
			}
		}
	}

	private getMspUserTypeDetail(){
		const mspcheck = this.userTypeList.findIndex((x: DropDownWithTextValue) =>
			x.Value == Number(UserRole.MSP));
		if (mspcheck < Number(magicNumber.zero)) {
			this.userTypeList.push({
				"Text": this.localizationService.GetLocalizeMessage('MSPUsers'),
				"Value": UserRole.MSP
			});
			if (this.userTypeList.length == Number(magicNumber.one)) {
				if (this.userTypeForm.get('userType')?.value == null) {
					this.userTypeForm.get('userType')?.setValue(UserRole.MSP);
				}

			}
		}
	}


	public tabOptions = {
		bindingField: 'UserStatus',
		tabList: [
			{
				tabName: 'Active',
				favourableValue: 1,
				selected: true
			},
			{
				tabName: 'Inactive',
				favourableValue: 2,
				selected: false
			},
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: false
			}
		]
	};

	public massActionButtonSet = [
		{
			tabName: "Staffing Agency Users",
			button: [
				{
					id: 1,
					isActiveType: true,
					title: "Activate",
					icon: "fa-solid fa-circle-check check-activate"
				},
				{
					id: 2,
					isActiveType: false,
					title: "Deactivate",
					icon: "fa-solid fa-circle-xmark check-deactivate"
				}
			]
		}
	];

	private getPageSize() {
		this.gridService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscription$)).
			subscribe((res: GenericResponseBase<PaginationData>):void => {
				if (res.StatusCode == Number(HttpStatusCode.Ok) && res.Data) {
					const Data = res.Data;
					this.pageSize = Data.PageSize;
				}
			});
	}

	public OnFilterTriggered(filteredData: FilteredControlData) {
		this.userFilteredList = filteredData;
	}

	public OnSearchTriggered(searchText: string) {
		this.selectTextsearch = searchText;
	}

	private bulkUpdate() {
		if (this.bulkStatusData.length > Number(magicNumber.zero)) {
			this.userService.activateRoleAndDeactivate(this.bulkStatusData)
				.pipe(takeUntil(this.destroyAllSubscription$))
				.subscribe((res: UserStatusUpdate) => {
					if (res.Succeeded) {
						this.gridConfiguration.refreshGrid();
						const userType = this.userTypeForm.get('userType')?.value,
						 status = this.bulkStatusData[0].Status,

						 isMultiple = this.bulkStatusData.length > Number(magicNumber.one);
						this.toasterService.showToaster(
							ToastOptions.Success,
							this.getSuccessMessage(userType, status, isMultiple)
						);
						this.bulkStatusData = [];
						this.smartSearchService.ApplyAdvanceFilterSmartSearch(this.entityId);
					} else {
						this.toasterService.showToaster(ToastOptions.Error, 'SomethingWentWrong');
					}
				});
		}
	}

	private getSuccessMessage(userType: UserRole, status: UserStatus, isMultiple: boolean): string {
		const baseMessage = isMultiple
				? 'Selected'
				: '',
		 userTypeMessage = this.getUserTypeMessage(userType),
		 actionMessage = status === UserStatus.Active
				? 'ActivatedSuccessfully'
				: 'DeactivatedSuccessfully';
		return `${baseMessage}${userTypeMessage}${actionMessage}`;
	}

	private getUserTypeMessage(userType: UserRole): string {
		switch (userType) {
			case UserRole.Client:
				return 'ClientUserHasBeen';
			case UserRole.MSP:
				return 'MSPUserHasBeen';
			case UserRole.StaffingAgency:
				return 'StaffingAgencyUserHasBeen';
			default:
				return 'UserHasBeen';
		}
	}


	public onClickAddUser(){
		if(this.userTypeList.length == Number(magicNumber.zero)){
			this.userService.roleGroupId.next({roleGroupId: this.userTypeForm.get('userType')?.value, staffingAgency: {Text: this.staffingAgencyInfo?.StaffingAgencyName, Value: this.staffingAgencyInfo?.StaffingAgencyId}});
		}
		else{
			this.userService.roleGroupId.next({roleGroupId: this.userTypeForm.get('userType')?.value, staffingAgency: null});
		}
	}
	public onGroupedAction(data: GroupedAction) {
		this.bulkStatusData = [];
		let status: number;

		if (data.actionName === 'activate') {
			status = UserStatus.Active;
		} else if (data.actionName === 'deactivate') {
			status = UserStatus.Inactive;
		} else {
			status = UserStatus.Lock;
		}
		data?.rowIds.forEach((a: string) =>
			this.bulkStatusData.push({
				uKey: a,
				Status: status
			}));
		this.bulkUpdate();
	}

	public onChangeUserType(userType:number){
		if(userType == Number(UserRole.MSP)){
			this.userTypeForm.get('userType')?.setValue(UserRole.MSP);
			this.entityType = 'MSP';
			this.subEntityType = this.entityType;
		}

		else if(userType == Number(UserRole.StaffingAgency)){
			this.userTypeForm.get('userType')?.setValue(UserRole.StaffingAgency);
			this.entityType = 'StaffingUser';
			this.subEntityType = 'Staffing';
		}

		else if(userType == Number(UserRole.Client)){
			this.userTypeForm.get('userType')?.setValue(UserRole.Client);
			this.entityType = 'Client';
			this.subEntityType = this.entityType;
		}

		this.userService.roleGroupId.next({roleGroupId: this.userTypeForm.get('userType')?.value});
	  this.getColumnData(this.entityType);
		this.setActionSet();
	}


	private onActiveChange = (dataItem: UserDetailsActiveChange, action: string) => {

		if (action == 'Activate') {
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				Status: magicNumber.one
			});
		} else if (action == 'Deactivate'){
			this.bulkStatusData.push({
				uKey: dataItem.UKey,
				Status: magicNumber.two
			});
		}
		this.bulkUpdate();
	};
	private onView = (dataItem: UserDetailsActiveChange) => {
		this.userService.roleGroupId.next({roleGroupId: this.userTypeForm.get('userType')?.value});
		this.router.navigate([`/xrm/master/user/view/${dataItem.UKey}`]);
	};
	private onEdit = (dataItem: UserDetailsActiveChange) => {
		this.userService.roleGroupId.next({roleGroupId: this.userTypeForm.get('userType')?.value});
		this.router.navigate([`/xrm/master/user/add-edit/${dataItem.UKey}`]);
	};

	massActionList = [];


	public selectedTab(data: string) {
		if (this.userEnum.get(data) == 'MSP') {
			this.entityType = 'MSP';
		} else if (this.userEnum.get(data) == 'Client') {
			this.entityType = 'Client';
		} else if (this.userEnum.get(data) == 'StaffingUser') {
			this.entityType = 'StaffingUser';
		}
	}

	private getColumnData(entityType: string | undefined) {
		this.gridViewService.getColumnOptionValue(
			this.entityId,
			entityType
		).pipe(takeUntil(this.destroyAllSubscription$)).subscribe((res: GenericResponseBase<GridColumnCaption[]>):void => {
			if (res.Succeeded && res.Data) {
				this.columnOptions = new Array();
				this.columnOptions = res.Data.map((e: GridColumnCaption) => {
					e.fieldName = e.ColumnName;
					e.columnHeader = e.ColumnHeader;
					e.visibleByDefault = e.SelectedByDefault;
					return e;
				});
			}
			this.cd.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.userService.resetAPICall();
		this.toasterService.resetToaster();
		this.destroyAllSubscription$.next();
		this.destroyAllSubscription$.complete();
	}
}
