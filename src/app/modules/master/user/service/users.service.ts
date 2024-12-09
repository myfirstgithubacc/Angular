import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserFormTab, UserRole } from '../enum/enums';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ActionToAdd, commonHeaderActionIcon } from '@xrm-shared/services/common-constants/common-header-action.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ChangePasswordPayload, ChangePasswordResponse, DropdownData, LoggedInUserDetails, ProxyAuthorization, SectorDetailsUpdateClient, UserDetails, UserPreferenceUpdate, alternateContactDetails } from '../model/model';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { PasswordPolicy } from '@xrm-shared/models/common.model';
import { ApiResponseUpdate, ApprovalConfigs, CurrentObject, DataItem, LocationList, OrganizationDetail, PreferenceUpdate, ProxyUser, RoleGroupId, SectorData, User, UserLockStatus, UserOrgLevel1Accesses, UserPermissions, UserStaffingAgencyDetails, UserStatusChange } from '../interface/user';
import { IUserDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';

// Define the type for the tab item
export interface TabItems { tab: string, value: number }


@Injectable({
	providedIn: 'root'
})
export class UsersService extends HttpMethodService {
	public enableLink = new BehaviorSubject(false);
	public roleGroupId: BehaviorSubject<RoleGroupId | null>;
	public openRightPanel = new BehaviorSubject(false);
	public apiCallTabBasis: BehaviorSubject<TabItems[]> = new BehaviorSubject<TabItems[]>([
		{ tab: 'UserDetails', value: 0 },
		{ tab: 'SectorDetails', value: -1 },
		{ tab: 'AlternateContactDetails', value: -1 },
		{ tab: 'Preferences', value: -1 }
	]);

	readonly rightIcon = 'chevron-right';

	public getAPICallObservable() {
		return this.apiCallTabBasis.asObservable();
	}

	public resetAPICall() {
		this.apiCallTabBasis.next([
			{ tab: 'UserDetails', value: 0 },
			{ tab: 'SectorDetails', value: -1 },
			{ tab: 'AlternateContactDetails', value: -1 },
			{ tab: 'Preferences', value: -1 }
		]);
	}

	public onLockObject(currentObject: CurrentObject): ActionToAdd[] {
		return [
			{
				icon: commonHeaderActionIcon.lockIcon,
				title: 'Lock',
				color: 'red-color',
				fn: currentObject.onLock,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT
				]
			}
		];
	}

	public onUnlockObject(currentObject: CurrentObject): ActionToAdd[] {
		return [
			{
				icon: commonHeaderActionIcon.unlockIcon,
				title: 'Unlock',
				color: 'green-color',
				fn: currentObject.onLock,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT
				]
			}
		];
	}

	public getCreateMessage(roleGroupId: number): string {
		switch (roleGroupId) {
			case UserRole.Client:
				return 'ClientUserSavedSuccessfully';
			case UserRole.StaffingAgency:
				return 'StaffingAgencyUserSavedSuccessfully';
			default:
				return 'MSPUserSavedSuccessfully';
		}
	}

	constructor(private http: HttpClient, private localizationService: LocalizationService) {
		super(http);
		this.roleGroupId = new BehaviorSubject<RoleGroupId | null>(null);
	}

	public getRolegroupId(): Observable<RoleGroupId | null>{
		return this.roleGroupId.asObservable();
	}
	public submitUsers(data: UserDetails): Observable<GenericResponseBaseWithValidationMessage<UserDetails>> {

		return this.Post('/user-detail/save', data);
	}
	public getUserDetailsbyUserNumber(id: string): Observable<GenericResponseBase<UserDetails>> {
		return this.GetAll(`/user-detail-uKey/${id}`);
	}

	public getDataAccessRight() {
		return this.GetAll(`/user-detail/select-user-data-access`);
	}


	public getUserListByRoleGroupId(rolegroup: number): Observable<ApiResponse> {
		return this.GetAll(`/user-detail-roleGroupId/${rolegroup}`);
	}

	public getUserByUkey(ukey: string): Observable<GenericResponseBase<User>> {
		return this.GetAll<GenericResponseBase<User>>(`/user-detail-uKey/${ukey}`);
	}

	public getUserPreferenceDetailsByUserId(sectorid: string): Observable<GenericResponseBase<UserDetails>> {
		return this.GetAll(`/user-detail/user-pref-by-userid/${sectorid}`);
	}


	public getNextLevelManagerList(data: number): Observable<GenericResponseBase<DataItem[]>> {
		const postData: SectorData = {
			"roleGroupDtos": [
				{
					"roleGroupId": 4,
					"roleNos": []
				}
			],
			"sectorIds": [Number(data)]
		};
		return this.Post('/user-detail/user-role-grp-entity-action', postData);
	}


	public updateBasicDetailsCommon(data: UserDetails): Observable<GenericResponseBaseWithValidationMessage<string>> {
		return this.PutBulk('/user-edit-basic-detail', data);
	}

	public updateSectorDetailsClient(data: SectorDetailsUpdateClient): Observable<GenericResponseBaseWithValidationMessage<UserDetails>> {
		return this.PutBulk('/user-detail/edit-client-sector-detail', data);
	}

	public activateRoleAndDeactivate(data: UserStatusChange[]): Observable<ApiResponseUpdate> {
		return this.PutBulk('/user-detail/bulk-status', data);
	}

	public checkDublicateUserName(name: string): Observable<GenericResponseBaseWithValidationMessage<boolean>> {
		return this.GetAll(`/user-detail/check-duplicate/${name}`);
	}

	public checkRfxSow(sectorId: number): Observable<GenericResponseBase<boolean>> {
		// Change url to /org1/isrfx-sow-req/{sectorId}
		return this.GetAll(`/org1-isrfx-sow-req/${sectorId}`);
	}


	public getUserListDropdown(isEditMode: boolean) {
		return this.GetAll(isEditMode
			? '/user-detail/select-stf-agn-user-name'
			: '/user-detail/select-stf-agn-user-name/1');
	}
	public updateuserpreference(data: UserPreferenceUpdate): Observable<GenericResponseBase<PreferenceUpdate>> {
		return this.PutBulk(`/user-detail/edit-user-pref`, data);
	}
	public getProxyAuthorizationTypesDropdown(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/user-detail-select-authtype`);
	}

	public getapprovalconfigdata(sectorid: number):Observable<GenericResponseBase<ApprovalConfigs[]>> {
		// eslint-disable-next-line max-len
		return this.GetAll(`/user-detail/appr-config-data-user-creation/${sectorid}`);
	}
	public GetApprovalConfigTreeForClientUserView(userNo: string) {
		return this.GetAll(`/user-detail/apr-confg-tree-clnt-usr-view/${userNo}`);
	}
	public getLoginMethodList(roleGroupId: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/user-detail/select-logmeth-role-grp-id/${roleGroupId}`);
	}

	public getproxyuserdropdownlist(userNo: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/user-detail/users-list-proxy/${userNo}`);
	}

	public getProxyUserListByUserNo(userNo: number): Observable<GenericResponseBase<ProxyUser[]>> {
		return this.GetAll(`/proxy-user/get-all/${userNo}`);
	}

	public saveOrUpdateProxyUser(payload: ProxyAuthorization, isUpdate: boolean): Observable<GenericResponseBaseWithValidationMessage<ProxyUser[]>> {
  	return isUpdate ?
			this.PutBulk(`/proxy-user/edit`, payload)
			: this.Post(`/proxy-user/save`, payload);
	}

	public getAllLocation() {
		return this.GetAll(`/user-detail/sector-loc-tree`);
	}

	public getSectorLocationForView(userNo: number): Observable<GenericResponseBase<UserOrgLevel1Accesses[]>> {
		return this.GetAll(`/user-detail/sector-loc-view/${userNo}`);
	}
	public updateClientAlternateContactDetails(data: alternateContactDetails): Observable<GenericResponseBase<null>> {
		return this.PutBulk(`/user-detail/edit-alt-contact-details`, data);
	}

	public getnotificationpreference() {
		return this.GetAll(`/user-noti-pref/select-auto-noti-opt`);
	}
	public getnotificationpreferenceoptiondropdowndata(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/user-noti-pref/select-noti-pref-opt`);
	}
	public getRoleGroup() {
		return this.GetAll(`/role-select-grp`);
	}
	public getRolebyRoleGroupID(id: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/role-select-grp-id-edit/${id}`);
	}
	public getorg1bySectorid(id: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/org1-select-sector-id/${id}`);
	}
	public getorg2bySectorid(id: string): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/org2-select-sector-id/${id}`);
	}
	public getorg3bySectorid(id: string): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/org3-select-sector-id/${id}`);
	}
	public getorg4bySectorid(id: string): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/org4-select-sector-id/${id}`);
	}
	public getlocationbySectorid(id: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/loc/select-sectorid/${id}`);
	}

	public getTimeZone(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/Timezone/select`);
	}

	public getLanguageList(countryId: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/ctry/select-lan-by/${countryId}`);
	}
	public getCountryList(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/ctry/select`);
	}

	public getchargeDropdown(sectorid: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/cost-code/select-sector-id/${sectorid}`);
	}
	public getStatebyCountryID(id: string): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/State/select-state/${id}`);
	}
	public getSectorOrgLevelConfigs(sectorid: number): Observable<GenericResponseBase<OrganizationDetail[]>> {
		return this.GetAll(`/sector/SectorOrgLevelConfigsBySectorId/${sectorid}`);
	}
	public getStaffingAgencyById(id: string): Observable<GenericResponseBase<UserStaffingAgencyDetails>> {
		return this.GetAll(`/staf-detail-user-id/${id}`);
	}

	public getStaffingAgencyDropdown(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll(`/staf/selectByStatusId-edit/81`);
	}
	public getAllSectorStaffing(staffingId: number): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll<GenericResponseBase<DataItem[]>>(`/user-detail/sector-by-broadcast-allowed/${staffingId}`);
		// /Sector/GetSectorDropdownListByOrgLevelAvailability?orgLevelType=${orgType}`
	}
	public getAllSectorClient(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll<GenericResponseBase<DataItem[]>>(`/sector/select`);
	}
	public getAllSectorMSP(): Observable<GenericResponseBase<DataItem[]>> {
		return this.GetAll<GenericResponseBase<DataItem[]>>(`/user-detail/select-sector-no-dar`);
	}
	public getAllSecurityQuestions(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/SecurityQuestion/GetAll');
	}
	public checkEmailDomain(data: {Email: string}): Observable<GenericResponseBase<boolean>> {
		return this.Post('/user-detail/is-email-valid', data);
	}
	public checkLastNameEmailValidation(data: {Email: string, LastName: string, UserNo: number}){
		return this.Post('/user-detail/email-lastname-duplicate', data);
	}

	public getdateFormatListHardCoded() {
		return [
			{
				Text: 'MM/DD/YYYY', Value: 'M/d/yyyy'
			},
			{
				Text: 'DD/MM/YYYY', Value: 'd/M/yyyy'
			},
			{
				Text: 'DD.MM.YYYY', Value: 'd.M.yyyy'
			}
		];
	}

	public getTabListHardCoded() {
		return [
			{
				isVisible: true,
				isDisabled: false,
				isSelected: true,
				label: UserFormTab.UserDetails,
				iconLeft: 'sub-user',
				iconRight: this.rightIcon
			},
			{
				isVisible: false,
				isDisabled: true,
				isSelected: false,
				label: UserFormTab.Sector,
				iconLeft: 'pie-chart',
				iconRight: this.rightIcon
			},
			{
				isVisible: false,
				isDisabled: true,
				isSelected: false,
				label: UserFormTab.AlternateContactDetails,
				iconLeft: 'address-book',
				iconRight: this.rightIcon
			},
			{
				isVisible: true,
				isDisabled: true,
				isSelected: false,
				label: UserFormTab.Preferences,
				iconLeft: 'adjustments-horizontal',
				iconRight: this.rightIcon
			}
		];
	}

	public getuserCategoryHardCoded(): DropdownData[] {
		return [
			{ Text: "Normal", Value: "1" },
			{ Text: "Staffing Agency Onsite Representative", Value: "2" },
			{ Text: "MSP Onsite Representative", Value: "3" }
		];
	}
	public getaccessLocationRadioGroupListHardCoded() {
		return [
			{
				Text: "All", Value: true
			},
			{
				Text: "Selected", Value: false
			}
		];
	}
	public getaccessSectorRadioGroupListHardCoded() {
		return [
			{
				Text: "All", Value: true
			},
			{
				Text: "Selected", Value: false
			}
		];
	}
	public getUserTypeListHardCoded() {
		return [
			{
				"Text": this.localizationService.GetLocalizeMessage('MSP'),
				"Value": UserRole.MSP
			},
			{
				"Text": this.localizationService.GetLocalizeMessage('StaffingAgency'),
				"Value": UserRole.StaffingAgency
			},
			{
				"Text": this.localizationService.GetLocalizeMessage('Client'),
				"Value": UserRole.Client
			}
		];
	}
	public lockUser(data: UserLockStatus) {
		return this.Post('/acc/user-lock-cont', data);
	}

	public changePassword(data: ChangePasswordPayload):Observable<ChangePasswordResponse> {
		return this.Post('/acc/change-password', data);
	}

	public getPasswordPolicy(): Observable<GenericResponseBase<PasswordPolicy>> {
		return this.GetAll<GenericResponseBase<PasswordPolicy>>('/acc/pwd-pol');
	}
	public getUsersWithFilter(data: UserPermissions): Observable<GenericResponseBase<DropdownItem[]>> {
		return this.Post('/user-detail/user-role-grp-entity-action', data);
	}

	public getLoggedinUser() {
		return this.GetAll<GenericResponseBase<IUserDetails>>('/user-detail/login-user-prmy-details');
	}

	public getLoginUserInfo():Observable<GenericResponseBase<LoggedInUserDetails>> {
		return this.GetAll('/user-detail/log-in-info');
	}
	public resendActivationLink(userId: string) {
		return this.Post(`/acc/send-user-activation-email/${userId}`, userId);
	}

	public getlandingPageList(UserNo: number): Observable<GenericResponseBase<LocationList[]>> {
		return this.GetAll(`/user-landing-pages/${UserNo}`);
	}

}
