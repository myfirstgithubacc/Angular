import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { Status } from "../enum/enums";
import { ValidationError } from "@xrm-shared/models/common.model";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";

export class DropdownData{
	Text:string;
	Value:string;
	constructor(){
		this.Text = '';
		this.Value = '';
	}
}

export class UserDetails{
	AcknowledgementAcceptedOnDate:string;
	AlternateEmail:string;
	AlternatePhoneNumber1:string;
	AlternatePhoneNumber2:string;
	AlternatePhoneNumberExt1:string;
	AlternatePhoneNumberExt2:string;
	ApplicabilityForMultipleSectors:string;
	ClientUserSectorAccesses:any;
	CountryId:string;
	CreatedBy:string;
	CreatedByUserName:string;
	CreatedOn:string;
	DateFormat:string;
	DataAccessRightName:string;
	EmailConfirmed:boolean;
	Email: string;
	Id:string;
	IsAllLocationAccessible:boolean;
	IsAllSectorAccessible:boolean;
	IsLocked:boolean;
	IsSelfRecord:boolean;
	LandingPageUrl:string;
	LandingPageName:string;
	LastModifiedBy:string;
	LastModifiedByUserName:string;
	LastModifiedOn:string;
	LocationAccessList:any;
	LoginMethod:number;
	LoginMethodName:string;
	NextLevelManagerId:string;
	NextLevelManagerName:string;
	NormalizedUserStatus:string;
	PasswordExpiryDate:string;
	PhoneNumber:string;
	PhoneNumberExt:string;
	ProxyUsers:any;
	ProfileDmsId: string;
	RoleGroupId:number;
	RoleName:string;
	RoleNo:string;
	SectorAccessList:any;
	SectorName:string;
	SecurityQuestionList:any;
	StaffingAgencyId:string;
	StaffingAgencyName:string;
	SystemNotificationAllowed:string;
	TimeFormat:string;
	UKey:string;
	UserAddressLine1:string;
	UserAddressLine2:string;
	UserApprovalConfigurationDetails:any;
	UserCity:string;
	UserCode:string;
	UserComments:string;
	UserCountry:string;
	UserDataAccessRight:string;
	UserEmail:string;
	UserFirstName:string;
	UserFullName:string;
	UserLanguage:string;
	UserLanguageId:string;
	UserLastName:string;
	UserLocationAccesses:any;
	UserMiddleName:string;
	UserName:string;
	UserNo: number;
	UserId:string;
	UserNotificationPreferences:any;
	UserOrgLevel1Accesses:any;
	UserState:string;
	UserStateId:string;
	UserStatus:number;
	UserTimezone:string;
	UserTimezoneId:string;
	UserTitle:string;
	UserZipCode:string;
}

export class UserPreferenceUpdate extends ToJson{
	UKey: string;
	ProxyUserUpdateDtos?: any;
	UserNotificationPreferenceUpdateDtos?:any;
	UserLanguageId: number;
	UserTimezoneId: number;
	LandingPage: string;
	SystemNotificationAllowed: boolean;
	DateFormat: string;
	UserName: string;
	UserSecQuestionsUpdateDtos?:UserSecQuestionsUpdateDtos[];
	UserNo:number;
}

export class UserSecQuestionsUpdateDtos{
	secQuestionId: number;
	answer: string;
}

export class alternateContactDetails {
	userNo: number;
	addressLine1: string;
	addressLine2: string;
	city: string;
	zipCode: string;
	stateId: number;
	alternatePhoneNumber1: string;
	alternatePhoneNumberExt1: string;
	alternatePhoneNumber2: string;
	alternatePhoneNumberExt2: string;
	alternateEmail?: string;
}
export class BasicDetailsUpdateClient{
	UKey: string;
	UserNo: number;
	UserFirstName: string;
	UserMiddleName: string;
	UserLastName: string;
	PhoneNumber: string;
	PhoneNumberExt: string;
	CountryId: number;
	UserLanguageId: number;
	UserTimezoneId: number;
	RoleNo: number;
	UserDataAccessRight: string;
	Email: string;
	LoginMethod:number;
	constructor(){
		this.UKey = '';
		this.UserNo = 0;
		this.UserFirstName ='';
		this.UserMiddleName ='';
		this.UserLastName ='';
		this.PhoneNumber ='';
		this.PhoneNumberExt='';
		this.CountryId = 0;
		this.UserLanguageId =0;
		this.UserTimezoneId=0;
		this.RoleNo =0;
		this.UserDataAccessRight='';
		this.Email ='';
		this.LoginMethod=0;

	}
}

export class SectorDetailsUpdateClient{
	UKey: string;
	UserNo: number;
	UserDataAccessRight: string;
	ClientUserSectorAccessUpdateDtos:Sector[] | DropdownData[];
	constructor(){
		this.UKey ='';
		this.UserNo=0;
		this.UserDataAccessRight='';
		this.ClientUserSectorAccessUpdateDtos=[];
	}
}
export class Sector {
	sectorId: number;
	defaultLocationId: number;
	defaultOrgLevel1Id: number;
	orgLevel2Id: number;
	orgLevel3Id: number;
	orgLevel4Id: number;
	defaultChargeId: number;
	isDefault: boolean;
	appliesToAllLocation: boolean;
	appliesToAllOrgLevel1: boolean;
	clientUserOrgLevel1AccessList: any;
	clientUserLocationAccessList: any;
	userApprovalConfigurationDetailUpdateDtos: any;
	userApprovalConfigurationDetailAddDtos?: any;
	reqPSRLiApprovalLimit: number;
	rFxSowApprovalLimit: number;
	representativeTypeId: number;
	staffingRepresentativeId: number;
	nextLevelManagerId: number;
	ClientUserSectorAccessId: number;
	udfFieldRecords: IPreparedUdfPayloadData[];
	Text:string;
	Value:string;
}

export interface LoggedInUserDetails {
	UserName: string;
	FullName: string;
	StaffingAgencyId: number | null;
	StaffingAgencyName: string | null;
	Code: string;
	Status: number;
	NormalizedStatus: string;
  }

export interface ChangePasswordResponse{
    Data?: [] | null;
    ValidationMessages?:ValidationError[],
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
}

export interface ChangePasswordPayload {
    uId: string;
    newPassword: string;
    confirmPassword: string;
    oldPassword:string;
}

export interface ProxyAuthorization {
  Id: number;
  ProxyOwnerNo: number;
  ProxyUserNo: number;
  ProxyAuthorizationTypeIds: number[];
  StartDate: string;
  EndDate: string;
  StatusId: number;
}

export interface ProxyGrid{
  Id: number;
  ProxyUserName: string;
  ProxyAuthorizationTypes: string;
  TimeFrame: string;
  Status: string;
  StatusId: number;
}


