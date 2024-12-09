import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { UsersService } from '../service/users.service';
import { ActionToAdd, CommonHeaderActionService, commonHeaderActionIcon } from '@xrm-shared/services/common-constants/common-header-action.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { GridViewService } from '@xrm-shared/services/grid-view.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Subject, takeUntil } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { UserDataAccessRight, UserRole, UserStatus } from '../enum/enums';
import { StaffingAgencyGatewayService } from 'src/app/services/masters/staffing-agency-gateway.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { HeaderService } from '@xrm-shared/services/header.service';
import { DropdownData } from '../model/model';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ApiResponseUpdate, ApprovalConfig, ApprovalConfigs, ButtonSet, ClientUserSectorAccess, DropDownWithTextValue, OrganizationDetail, PaginationData, ProxyAuthorizationType, ProxyUser, SectorAccess, SecurityQuestion, StatusData, TabItem, User, UserApprovalConfigurationDetail, UserLocationAccess, UserOrgLevel1Accesses, UserStatusChange } from '../interface/user';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view-user',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	@Input() myInput:string;

	public isAltPhoneExt1:boolean = true;
	public isAltPhoneExt2:boolean = true;
	public isPhoneExt:boolean = true;

	private userId: number;
	private userUkey: string;
	public userType = '';
	public userObject: User;
	public recordId = '';
	public pageSize: number = magicNumber.zero;
	public entityType='';
	private subEntityType: string|undefined;
	public buttonSet: ButtonSet[];
	private isLocked: boolean;
	public profilePic: string;
	private userNo: number;
	public dateFormat:string;
	public entityId = XrmEntities.Users;
	public addEditEventReasonForm: FormGroup;

	private dateFormatList: DropdownData[];

	public tabOptions = {
		bindingField: 'Disabled',
		tabList: [
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: true
			}
		]
	};
	public orgLabelName: string[][] = [];
	public orgLabelNameShow: boolean[] = [false, false, false, false];
	private userTypeList = ['', '', 'MSP', 'StaffingAgency', 'Client'];
	public proxyUserList: ProxyUser[] = [];
	public approvalConfiguration: ApprovalConfigs[] = [];
	public sectorAccessList: SectorAccess[] = [];
	public showCardEventLog:boolean;
	public stateLabel: string = '';
	public zipLabel: string = '';
	public tabList: TabItem[] = this.userService.getTabListHardCoded();

	public splitButtonItems = [
		{
			text: 'Export To Excel',
			icon: 'excel'
		},
		{
			text: 'Export To PDF',
			icon: 'pdf'
		}
	];
	private userCategory: DropDownWithTextValue[] = [
		{ Text: 'Normal', Value: 1 },
		{ Text: 'Staffing Agency Onsite Representative', Value: 2 },
		{ Text: 'MSP Onsite Representative', Value: 3 }
	];

	public columnOptions = [
		{
			fieldName: 'ProxyUserName',
			columnHeader: 'Proxy User',
			visibleByDefault: true
		},
		{
			fieldName: 'ProxyAuthorizationTypes',
			columnHeader: 'Authorized For',
			visibleByDefault: true
		},
		{
			fieldName: 'StartDate',
			columnHeader: 'Effective Date Range',
			visibleByDefault: true
		},
		{
			fieldName: 'Status',
			columnHeader: 'Status',
			visibleByDefault: true
		}
	];
	public locationSectorGroupingList:UserOrgLevel1Accesses[] | null | undefined = [];

	public securityQuestionList:SecurityQuestion[]=[];
	public securityQuestionColumns = [
		{
			fieldName: 'Sequence',
			columnHeader: '#',
			visibleByDefault: true
		},
		{
			fieldName: 'Question',
			columnHeader: 'SecurityQuestion',
			visibleByDefault: true
		},
		{
			fieldName: 'Answer',
			columnHeader: 'Answer',
			visibleByDefault: true
		}
	];

	public userviewform:FormGroup;

	public recordUKey:string;
	public actionTypeId: number = ActionType.View;
	public isRfxRequired:boolean;
	public userDataAccessRight = UserDataAccessRight;
	private destroyAllSubscribtion$ = new Subject<void>();
	public statusData:StatusData = {
		items: []
	};
	private updatedTabList: TabItem[] = [];

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
		public udfCommonMethods: UdfCommonMethods,
    private activatedRoute: ActivatedRoute,
    private eventLog: EventLogService,
    private commonHeaderIcon: CommonHeaderActionService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private localizationService: LocalizationService,
    private userService: UsersService,
    private toasterService: ToasterService,
		private headerService: HeaderService,
    private gridViewService: GridViewService,
		private formbuiler:FormBuilder,
		public Staffingagencyservices : StaffingAgencyGatewayService
	) {

		this.userviewform = this.formbuiler.group({
			phoneControl: [null],
			phoneExt: [null],
			UserZipCode: [null],
			altPhone1: [null],
			altPhoneExt1: [null],
			altPhone2: [null],
			altPhoneExt2: [null]
		});

		this.addEditEventReasonForm = this.fb.group({
			status: [null]
		});

		this.dateFormatList = this.userService.getdateFormatListHardCoded();
	}


	ngOnInit(): void {

		this.tabList.forEach((tab: TabItem) => {
			tab.isDisabled = false;
		});
		this.activatedRoute.paramMap.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((params) => {
			if (!this.myInput) {
				this.userUkey = params.get('id')?? '';
				this.getUserDetails();
			}else{
				this.userUkey = this.myInput;

				this.Staffingagencyservices.openRightPanel.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((dt:boolean) => {
					this.showCardEventLog = dt;
				});
				this.getUserDetails();
			}

		});

		if(!this.showCardEventLog){
			this.getActionSet();
		}
	}

	private getUserProfilePicture(data: number | null){
		if(data){
			this.headerService.getClientProfilePicture(data)
				.subscribe((res: GenericResponseBase<string>) => {
					if(res.Data){
						this.profilePic = res.Data;
					}
				});
		}
		else{
		 this.profilePic = 'assets/images/users/3.jpg';
		}
	}

	ngOnDestroy(): void {
		this.userService.resetAPICall();
		this.toasterService.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
	private onActivate = (actionName: string) => {
		this.updateRecord([
			{
				uKey: this.userObject.UKey,
				Status: this.userObject.UserStatus == Number(magicNumber.two)
					? magicNumber.one
					: magicNumber.two,
				reasonForChange: ''
			}
		]);
	};

	public onEdit = () => {
		this.router.navigate([`/xrm/master/user/add-edit/${this.userObject.UKey}`]);
	};

	public onUnlockObject (): ActionToAdd[]{
		return 	[
			{
				icon: commonHeaderActionIcon.unlockIcon,
				title: 'Unlock',
				color: 'green-color',
				fn: this.onLock,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT
				]
			}
		];
	}

	public onLock=() => {
		this.userService.lockUser({userNo: this.userNo, locked: !this.isLocked})
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: ApiResponseUpdate) => {
				if(res.Succeeded)
				{
					this.isLocked = !this.isLocked;
					const roleGroupId = this.userObject.RoleGroupId,
					 lockStatus = this.isLocked
							? 'Locked'
							: 'Unlocked';
					let message = '';

					switch (roleGroupId) {
						case UserRole.Client:
							message = `ClientUserHasBeen${lockStatus}Successfully`;
							break;
						case UserRole.MSP:
							message = `MSPUserHasBeen${lockStatus}Successfully`;
							break;
						case UserRole.StaffingAgency:
							message = `StaffingAgencyUserHasBeen${lockStatus}Successfully`;
							break;
					}

					this.toasterService.showToaster(ToastOptions.Success, message);
					this.getActionSet();
					this.updateEventLog();
				}
				else{
					this.toasterService.showToaster(ToastOptions.Error, this.localizationService.GetLocalizeMessage(res.Message));
				}
				this.cd.markForCheck();
			});
	};

	private getActionSet(){
		this.buttonSet = [
			{
				status: "Active",
				items: !this.isLocked
					? this.commonHeaderIcon.commonActionSetOnActive(this.onEdit, this.onActivate, this.userService.onLockObject(this))
					: this.commonHeaderIcon.commonActionSetOnActive(this.onEdit, this.onActivate, this.onUnlockObject())
			},

			{
				status: "Inactive",
				items: !this.isLocked
					? this.commonHeaderIcon.commonActionSetOnDeactiveView(this.onEdit, this.onActivate, this.userService.onLockObject(this))
					: this.commonHeaderIcon.commonActionSetOnDeactiveView(this.onEdit, this.onActivate, this.onUnlockObject())
			}
		];
	}

	private updateStateLabel(countryId: number) {
		this.stateLabel = this.localizationService.GetCulture(CultureFormat.StateLabel, countryId);
		this.zipLabel = this.localizationService.GetCulture(CultureFormat.ZipLabel, countryId);
	}


	private getUserDetails() {
		this.userService.getUserByUkey(this.userUkey).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data1) => {
		 if(data1.Succeeded){
				this.assignDataUserType(data1);
				this.getClientUserSectorAccesses();

				this.proxyUserList = this.userObject.ProxyUsers ?? [];
				if (this.proxyUserList.length > Number(magicNumber.zero)) {
					this.getProxyListLogic();
				}
				const matchedItem = this.dateFormatList.find((item: DropdownData) =>
					item.Value === this.userObject.DateFormat);
				if (matchedItem) {
					this.dateFormat = matchedItem.Text;
				}


				this.tabList[1].isVisible = this.userObject.RoleGroupId == Number(magicNumber.four);
				this.tabList[2].isVisible = this.userObject.RoleGroupId == Number(magicNumber.four);
				this.updatedTabList = this.tabList;
				this.tabList = [...this.updatedTabList];
				this.userType = this.userTypeList[this.userObject.RoleGroupId];

				if(this.userObject.RoleGroupId == Number(magicNumber.two)){
					this.subEntityType = 'MSP';
				}else if(this.userObject.RoleGroupId== Number(magicNumber.three)){
					this.subEntityType = 'Staffing';
				}else{
					this.subEntityType = 'Client';
				}
				this.entityType=this.userObject.RoleGroupId.toString();
				this.sectorAccessList = this.userObject.SectorAccessList;

				if(!this.userObject.IsAllLocationAccessible){
					this.getSectorLocationForView();
				}
				this.updateEventLog();
				this.setPhoneNumber();
				this.securityQuestionList = this.userObject.SecurityQuestionList ?? [];
				this.securityQuestionList = this.securityQuestionList.map((question, index) => {
					return {
			  			...question,
			  			Sequence: index + magicNumber.one
					};
		  		});
				this.isLocked = this.userObject.IsLocked;
				this.getActionSet();
				this.cd.detectChanges();
		 	}
		});
		this.getPageSizeForGrid();
		this.cd.detectChanges();
	}

	private getSectorLocationForView(){
		this.userService.getSectorLocationForView(this.userObject.UserNo).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((data: GenericResponseBase<UserOrgLevel1Accesses[]>) => {
				if(data.Succeeded){
					this.locationSectorGroupingList=data.Data;
					this.cd.detectChanges();
				}
			});
	}

	getProxyListLogic(){
		this.proxyUserList.forEach((data:ProxyUser) => {
			data.StartDate = `${this.localizationService.TransformDate(data.StartDate)} - ${ this.localizationService.TransformDate(data.EndDate)}`;
			const result: string[] = [];
			(data.ProxyAuthorizationTypes as ProxyAuthorizationType[])?.every((data11: ProxyAuthorizationType) =>
				result.push(this.localizationService.GetLocalizeMessage(data11.ProxyAuthorizationType)));
			data.ProxyAuthorizationTypes = result.join(', ');
		});
	}

	private getPageSizeForGrid(){
		this.gridViewService.getPageSizeforGrid(this.entityId).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res: GenericResponseBase<PaginationData>) => {
				if (res.Succeeded && res.Data) {
					this.pageSize = res.Data.PageSize;
					this.cd.detectChanges();
				}
			});
	}

	public getDateTransformed(date: string){
		return this.localizationService.TransformDate(date, this.userObject.DateFormat);
	}

	private updateEventLog() {
		this.eventLog.recordId.next(this.userObject.UserNo);
		this.eventLog.entityId.next(XrmEntities.Users);
		this.eventLog.isUpdated.next(true);
	}

	private assignDataUserType(data1: GenericResponseBase<User>){
		if(data1.Data){
			this.userObject = data1.Data;
			this.recordId = this.userObject.UserCode;
			this.userId = this.userObject.Id;
			this.userNo = this.userObject.UserNo;
			this.recordUKey = this.userObject.UKey;
			this.updateStateLabel(this.userObject.CountryId);
			this.getCommonHeaderData();
			this.getApprovalConfiguration();
			this.getUserProfilePicture(data1.Data.ProfileDmsId);
			this.userviewform.get('UserZipCode')?.setValue(this.userObject.UserZipCode);
			this.userObject.ClientUserSectorAccesses.forEach((a: ClientUserSectorAccess) => {
				a.isshow = a.IsDefault;
			});
		}
	}

	private getClientUserSectorAccesses(){
		this.userObject.ClientUserSectorAccesses.map((a: ClientUserSectorAccess) => {
			this.userService.getSectorOrgLevelConfigs(a.SectorId).pipe(takeUntil(this.destroyAllSubscribtion$)).
				subscribe((res: GenericResponseBase<OrganizationDetail[]>) => {
					const array: string[] = ['OrgLevel1', 'OrgLevel2', 'OrgLevel3', 'OrgLevel4'];

					res.Data?.forEach((element: OrganizationDetail, index: number) => {
						array[index] = element.OrgName;
						this.orgLabelNameShow[index]=element.IsVisible;
					});
					this.orgLabelName.push(array);
					this.cd.detectChanges();
				});
			a.ApprovalRoles =
						a.ApprovalRoles == null
							? ''
							: a.ApprovalRoles?.map((v: DropDownWithTextValue) =>
								v.Text).join(', ');
			a.RepresentativeTypeId = this.userCategory.filter((x: DropDownWithTextValue) =>
				(x.Value) == a.RepresentativeTypeId)[0]?.Text;
		});
	}

	private setPhoneNumber(){
		if(!this.userObject.PhoneNumber){
			this.userviewform.controls['phoneControl'].setValue('');
			this.isPhoneExt = false;
		}
		else{
			this.userviewform.controls['phoneControl'].setValue(this.userObject.PhoneNumber);
			if(!(!this.userObject.PhoneNumberExt || this.userObject.PhoneNumberExt == ''))
				this.userviewform.controls['phoneExt'].setValue(this.userObject.PhoneNumberExt);
			else
				this.isPhoneExt = false;

		}

		if(this.userObject.AlternatePhoneNumber1==null){
			this.userviewform.controls['altPhone1'].setValue('');
			this.isAltPhoneExt1 = false;
		}
		else{
			this.userviewform.controls['altPhone1'].setValue(this.userObject.AlternatePhoneNumber1);
			if(!(this.userObject.AlternatePhoneNumberExt1 == null || this.userObject.AlternatePhoneNumberExt1 == ''))
				this.userviewform.controls['altPhoneExt1'].setValue(this.userObject.AlternatePhoneNumberExt1);
			else
				this.isAltPhoneExt1 = false;

		}

		if(this.userObject.AlternatePhoneNumber2==null){
			this.userviewform.controls['altPhone2'].setValue('');
			this.isAltPhoneExt2 = false;
		}
		else{
			this.userviewform.controls['altPhone2'].setValue(this.userObject.AlternatePhoneNumber2);
			if(!(this.userObject.AlternatePhoneNumberExt2 == null || this.userObject.AlternatePhoneNumberExt2 == ''))
				this.userviewform.controls['altPhoneExt2'].setValue(this.userObject.AlternatePhoneNumberExt2);
			else
				this.isAltPhoneExt2 = false;
		}

		this.cd.detectChanges();
	}

	public getApprovalConfiguration() {
		if (this.userObject.RoleGroupId === Number(UserRole.Client)) {
			this.approvalConfiguration = [];
			this.userObject.ClientUserSectorAccesses.forEach((x: ClientUserSectorAccess) => {
				this.userService.getapprovalconfigdata(x.SectorId).
					pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: GenericResponseBase<ApprovalConfigs[]>):void => {
						if (data.Succeeded && data.Data) {
							data.Data.map((workflow: ApprovalConfigs) => {
								workflow.SectorId = x.SectorId;
								this.approvalConfiguration.push(workflow);
							});
						}
					});
			});
		}
	}

	public getSelectedApproval(sectorId:number | undefined, approval:ApprovalConfig):string {
		const isExist = this.userObject.UserApprovalConfigurationDetails.some((a:UserApprovalConfigurationDetail) =>
			a.SectorId == sectorId && a.ApprovalConfigId == approval.Id);
		if(isExist){
			return this.localizationService.GetLocalizeMessage('Yes');
		}
		else{
			return this.localizationService.GetLocalizeMessage('No');
		}

	}


	public tabClick(i: number) {
		this.userObject.ClientUserSectorAccesses.forEach((a: ClientUserSectorAccess) => {
			a.isshow = false;
		});
		this.userObject.ClientUserSectorAccesses[i].isshow = true;
	}

	public getUserStatus() {
		return this.userObject.NormalizedUserStatus == 'Active'
			? 'Active'
			: 'Inactive';
	}

	public navigateBack() {
		this.router.navigate(['/xrm/master/user/list']);
	}

	private updateRecord(data: UserStatusChange[]) {
		this.userService.activateRoleAndDeactivate(data).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((a:ApiResponseUpdate) => {
			if(a.Succeeded){
				if(data[0].Status == Number(UserStatus.Active)){
					this.userObject.UserStatus = UserStatus.Active;
					this.userObject.NormalizedUserStatus = 'Active';
				}
				else if(data[0].Status == Number(UserStatus.Inactive)){
					this.userObject.UserStatus = UserStatus.Inactive;
					this.userObject.NormalizedUserStatus = 'Inactive';
				}
				if(this.userObject.RoleGroupId == Number(UserRole.Client)){
					this.toasterService.showToaster(
						ToastOptions.Success,
						data[0].Status == Number(UserStatus.Inactive) ?
							'ClientUserHasBeenDeactivatedSuccessfully'
							: 'ClientUserHasBeenActivatedSuccessfully'
					);
				}
				if(this.userObject.RoleGroupId == Number(UserRole.MSP)){
					this.toasterService.showToaster(
						ToastOptions.Success,
						data[0].Status == Number(UserStatus.Inactive) ?
							'MSPUserHasBeenDeactivatedSuccessfully'
							:'MSPUserHasBeenActivatedSuccessfully'
					   );
				}
				if(this.userObject.RoleGroupId == Number(UserRole.StaffingAgency)){
					this.toasterService.showToaster(
						ToastOptions.Success,
						data[0].Status == Number(UserStatus.Inactive) ?
					   'StaffingAgencyUserHasBeenDeactivatedSuccessfully'
							:'StaffingAgencyUserHasBeenActivatedSuccessfully'
					);
				};
				this.getCommonHeaderData();
				this.updateEventLog();
			}
			else{
				this.toasterService.showToaster(ToastOptions.Error, 'SomethingWentWrong');
			}
			this.cd.markForCheck();
		});
	}

	public getConfigureClientData(sectorId: number, index: number):(UserOrgLevel1Accesses | UserLocationAccess)[]{
		if (this.userObject.UserDataAccessRight == String(UserDataAccessRight.Org1View)) {
			if (this.userObject.ClientUserSectorAccesses[index]?.AppliesToAllOrgLevel1) {
				return this.getOrgLevelOrLocationObject(true) as UserOrgLevel1Accesses[];
			} else {
				return this.userObject.UserOrgLevel1Accesses?.filter((first: UserOrgLevel1Accesses) =>
					first.SectorId == sectorId) ?? [];
			}
		} else if (this.userObject.ClientUserSectorAccesses[index]?.AppliesToAllLocation) {
			return this.getOrgLevelOrLocationObject() as UserLocationAccess[];
		} else {
			return this.userObject.UserLocationAccesses?.filter((first: UserLocationAccess) =>
				first.SectorId == sectorId) ?? [];
		}
	}

	private	getOrgLevelOrLocationObject(isOrgLevel1: boolean = false) {
		return [
			isOrgLevel1 ?
				{ OrgLevel1Id: 1,
					OrgLevelName: 'All',
					Disabled: false,
					SectorId: 0
				} :
				{
					LocationId: 1,
					LocationName: 'All',
					Disabled: false,
					SectorId: 0
				}
		];
	}


	public selectedTapEvent(tab: TabItem) {
		this.tabList.forEach((x: TabItem) => {
			x.isSelected = false;
		});
		const ind = this.tabList.findIndex((a: TabItem) =>
			a.label == tab.label);
		this.tabList[ind].isSelected = true;
		this.cd.detectChanges();
	}

	showTooltip(data: unknown) { }
	onSplitButtonItemClick(data: unknown) { }
	cellClickHandler(data: unknown) { }
	cellCloseHandler2(data: unknown) { }
	onSplitButtonClick() { }
	cellCloseHandler(data: unknown) { }
	cellClickHandler2(data: unknown) { }


	public getLocalizedMessage(key:string){
		return this.localizationService.GetLocalizeMessage('ConfigurePlaceholder', [{Value: key, IsLocalizeKey: false}]);
	 }
	public getApprovalConfigurationGridData(sectorId: number | undefined) {
		return this.approvalConfiguration.filter((a: ApprovalConfigs) =>
			a.SectorId == sectorId);
	}

	public navigate(){
		if (!this.showCardEventLog){
			this.router.navigate(['/xrm/master/user/list']);
		}
		else{
			this.Staffingagencyservices.openRightPanel.next(false);
		}
	}

	private getCommonHeaderData(){
		this.statusData.items=[
			{
				title: 'UserId',
				titleDynamicParam: [],
				item: this.userObject.UserCode,
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: '',
				linkParams: ''
			},
			{
				title: 'Status',
				titleDynamicParam: [],
				item: this.getUserStatus(),
				itemDynamicParam: [],
				cssClass: [this.getUserStatus().toLowerCase()],
				isLinkable: false,
				link: '',
				linkParams: ''
			}
		];
	}

}
