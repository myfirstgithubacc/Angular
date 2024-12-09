import { FormControl, FormGroup } from "@angular/forms";
import { GenericResponseBase } from "@xrm-core/models/responseTypes/generic-response.interface";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";

export interface DropDownWithTextValue{
  Text?: string;
  Value: number | string;
}

export interface DropDownWithTextValueBoolean{
  Text: string;
  Value: boolean;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface Value {
  [key: string]: string[];
}

export interface FilteredControlData {
  controlType: string;
  value: Value
}

export interface StatusUpdatePayload {
  uKey: string;
  Status: number;
}

export interface ActionSet{
  Status: number | boolean;
  Items: Items[];
}

export interface ButtonSet{
  status: string;
  items: Items[];
}

interface Items{
  icon: string;
  title: string;
	color: string;
	fn: unknown;
	actionId?: number[];
}

export interface StaffingUser {
  Code: string;
  FullName: string;
  NormalizedStatus: string;
  StaffingAgencyId: string | null;
  StaffingAgencyName: string | null;
  Status: number;
  UserName: string;
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

export interface PaginationData {
  PageSize: number;
}

export interface RoleGroupId{
  roleGroupId: number;
  staffingAgency?: StaffingAgency | null;
}

interface StaffingAgency {
  Text: string | undefined | null;
  Value: number | string | undefined | null;
}

export interface ActivateRouteResponse{
  permission: Action[];
}

export interface Action{
  ActionId: number;
  ActionName: string;
  EntityType: string;
  EntityTypeId: number;
}

export interface GroupedAction {
  actionName: string;
  clickedTabName: string;
  rowIds: string[];
}

export interface UserDetailsActiveChange {
  ApplicabilityForMultipleSectors: boolean;
  CreatedBy: number;
  CreatedByUserName: string;
  CreatedOn: string;
  Id: number;
  IsAllSectorAccessible: boolean;
  IsAllSectorAccessibleName: string;
  LastModifiedBy: number | null;
  LastModifiedByUserName: string | null;
  LastModifiedOn: string | null;
  LoginMethod: number;
  LoginMethodName: string;
  NormalizedUserStatus: string;
  OrgLevel1Name: string;
  ReportingLocationName: string;
  RoleGroupId: number;
  RoleName: string;
  RoleNo: number;
  SectorName: string;
  StaffingAgencyId: number | null;
  StaffingAgencyName: string | null;
  UKey: string;
  UserCode: string;
  UserEmail: string;
  UserFullName: string;
  UserName: string;
  UserNo: number;
  UserStatus: number;
}

export interface UserStatusUpdate{
  Message: string;
  StatusCode: number;
  Succeeded: boolean;
}


export interface User {
  Id: number;
  UserId: string;
  UserCode: string;
  RoleName: string;
  RoleNo: number;
  RoleGroupId: number;
  UserNo: number;
  UserName: string;
  UserFirstName: string;
  UserMiddleName: string;
  UserLastName: string;
  UserFullName: string;
  StaffingAgencyId: number | null;
  PhoneNumber: string;
  PhoneNumberExt: string;
  AlternatePhoneNumber1: string | null;
  AlternatePhoneNumberExt1: string | null;
  AlternatePhoneNumber2: string | null;
  AlternatePhoneNumberExt2: string | null;
  UserAddressLine1: string;
  UserAddressLine2: string;
  UserCity: string;
  UserState: string;
  UserStateId: number;
  UserZipCode: string;
  CountryId: number;
  UserCountry: string;
  UserTitle: string;
  UserComments: string;
  UserDataAccessRight: string;
  DataAccessRightName: string;
  IsAllSectorAccessible: boolean;
  IsAllSectorAccessibleName: string;
  IsAllLocationAccessible: boolean;
  LandingPageUrl: string;
  ProfileDmsId: number | null;
  LandingPageName: string;
  UserLanguageId: number;
  UserLanguage: string;
  UserTimezoneId: number;
  UserTimezone: string;
  UserStatus: number;
  NormalizedUserStatus: string;
  UserEmail: string;
  AlternateEmail: string | null;
  LoginMethod: number;
  LoginMethodName: string;
  PasswordExpiryDate: string;
  AcknowledgementAcceptedOnDate: string;
  SystemNotificationAllowed: boolean;
  StaffingAgencyName: string | null;
  NextLevelManagerId: number | null;
  NextLevelManagerName: string | null;
  CreatedByUserName: string;
  LastModifiedByUserName: string;
  SectorName: string | null;
  CreatedBy: number;
  CreatedOn: string;
  LastModifiedBy: number;
  LastModifiedOn: string;
  ApplicabilityForMultipleSectors: boolean;
  DateFormat: string;
  TimeFormat: string;
  SectorAccessList: any | null;
  IsLocked: boolean;
  LockoutEnd: string | null;
  EmailConfirmed: boolean;
  IsSelfRecord: boolean;
  OrgLevel1Name: string | null;
  ReportingLocationName: string | null;
  LocationAccessList: any | null;
  SecurityQuestionList: SecurityQuestion[] | null;
  ClientUserSectorAccesses: ClientUserSectorAccess[];
  ProxyUsers: ProxyUser[];
  UserApprovalConfigurationDetails: UserApprovalConfigurationDetail[];
  UserLocationAccesses: UserLocationAccess[] | null;
  UserOrgLevel1Accesses: UserOrgLevel1Accesses[] | null;
  UserNotificationPreferences: any | null;
  UKey: string;
}

export interface UserApprovalConfigurationDetail {
  EntityId: number;
  XrmEntityId: number;
  UserNo: number;
  SectorId: number;
  ApprovalConfigId: number;
  UserSpecifiedForApprovalLevel: boolean;
  UserPreIdentified: number;
  Disabled: boolean;
}

export interface UserApprovalConfiguration {
  entityId: number;
  xrmEntityId?: number;
  userNo: number;
  sectorId: number;
  approvalConfigId: number;
  userSpecifiedForApprovalLevel: boolean;
  userPreIdendified: number;
  disabled?: boolean;
}

export interface ApproverLabel {
  Id: number;
  ApproverLabel: string;
  IsSelected?: boolean;
}

export interface ApprovalConfig {
  Id: number;
  ApproverConfigName: string;
  ApproverLabels: ApproverLabel[];
}

export interface ApprovalConfigChangeData {
  ApproverLabel: string;
  Id: number;
  IsSelected: boolean;
}

export interface ApprovalConfigChangeEvent {
  event: boolean;
  sectorindex: number;
  data: ApprovalConfigChangeData;
}



export interface UserLocationAccess {
  LocationId: number;
  LocationName: string;
  Disabled: boolean;
  SectorId: number;
  OrgLevelName?: string;
}

export interface UserOrgLevel1Accesses
{
  OrgLevel1Id: number;
  OrgLevelName: string;
  Disabled: true;
  SectorId: number;
  LocationName?: string;
}

export interface Location {
  LocationId: number;
  LocationName: string;
  Disabled: boolean;
  SectorId: number;
}

export interface SecurityQuestion {
  QuestionId: number;
  Question: string;
  QuestionLocalizedKey: string;
  Answer: string;
  Text: string;
  Value: number;
  Disabled?: boolean;
}

export interface ProxyUser {
  Id: number;
  ProxyOwnerNo: number | string;
  ProxyUserNo: number;
  ProxyUserName: string;
  ProxyAuthorizationTypes: string | ProxyAuthorizationType[];
  HasFullAccess?: boolean;
  StartDate: string;
  EndDate: string;
  Disabled: string | boolean;
  Status: string;
  timeFrame: string;
  proxyAuthorizationTypeIds: string | ProxyAuthorizationType[];
  action?: string;
  StatusId: number;
}

export interface ProxyAuthorizationType {
  ProxyAuthorizationTypeId: number;
  IsModified: boolean;
  ProxyAuthorizationType: string;
  Value: number;
  Text: string;
}

export interface AuthorizationType {
  Text: string;
  Value: string;
  TextLocalizedKey: string;
  IsSelected: boolean;
  ProxyAuthorizationType: string;
}


export interface ApprovalConfigs {
  XrmEntityId: number;
  WorkflowName: string;
  SectorId?: number;
  ApprovalConfigs: ApprovalConfig[];
}

export interface ClientUserSectorAccess {
  AppliesToAllLocation: boolean;
  AppliesToAllOrgLevel1: boolean;
  ApprovalConfigWorkFlowsGetDtos: any | null;
  ApprovalRoles: any;
  ClientUserSectorAccessId: number;
  DefaultCostAccountingCodeId: number | null;
  DefaultCostAccountingCodeName: string | null;
  DefaultLocationId: number;
  DefaultLocationName: string;
  DefaultOrgLevel1Id: number;
  DefaultOrglevel1Name: string;
  Disabled: boolean;
  IsDefault: boolean;
  IsRfxSowRequired: boolean;
  NextLevelManagerId: number | null;
  NextLevelManagerName: string | null;
  OrgLevel2Id: number | null;
  OrgLevel2Name: string | null;
  OrgLevel3Id: number | null;
  OrgLevel3Name: string | null;
  OrgLevel4Id: number | null;
  OrgLevel4Name: string | null;
  ReqPSRLiApprovalLimit: number;
  RepresentativeTypeId: number | string | undefined;
  RFxSowApprovalLimit: number;
  SectorId: number;
  SectorName: string;
  StaffingRepresentativeId: number | null;
  StaffingRepresentativeName: string | null;
  UserNo: number;
  isshow: boolean;
  RecordUKey?: string;
}

export interface OrganizationDetail {
  Id: number;
  IsMandatory: boolean;
  IsVisible: boolean;
  LocalizedKey: string;
  OrgName: string;
  OrgType: number;
}

export interface StatusItem {
  title: string;
  titleDynamicParam: any[];
  item: string | undefined;
  itemDynamicParam: any[];
  cssClass: string[];
  isLinkable: boolean;
  link: string;
  linkParams: string;
}

export interface StatusData {
  items: StatusItem[];
}


export interface TabItem {
  isVisible: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  label: string;
  iconLeft: string;
  iconRight: string;
}

export interface SectorAccess {
  text: string;
  value: string;
  textLocalizedKey: string;
  isSelected: boolean;
}


export interface UserStatusChange {
  uKey: string;
  Status: number;
  reasonForChange?: string;
}


export interface ApiResponseUpdate {
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}

export interface UdfData{
  data: IPreparedUdfPayloadData[];
  formGroup: FormGroup
}

export interface Record {
  recordId: number;
  recordUKey: string;
  sectorId: string;
  udfConfigId: number;
  udfDateValue: Date | null;
  udfId: number;
  udfIntegerValue: number | null;
  udfNumericValue: number | null;
  udfTextValue: string | undefined;
  xrmEntityId: number;
}


export interface LocationList {
  Text: string;
  Value: string | number;
  TextLocalizedKey: string | null;
  IsSelected: boolean;
}

export interface AllLocationList {
  Value: number;
  Text: string;
  LocationList: LocationList[];
}

export interface locationSectorGroupingList {
  Index: string | number;
  SectorId: string | number;
  Text: string;
  location: any[];
  Value?: string;
  LocationId?: number;
  IsSelected?: boolean;
}

export interface DialogButton{
  text: string;
  value: number
}

export interface DataItem {
  Text: string;
  Value: string;
  TextLocalizedKey?: string | null;
  IsSelected?: boolean;
  Index?: string | number
}

export interface ApiResponse {
  Data: DataItem[] | boolean;
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}

export interface EventDetails {
  Text: string;
  Value: number;
  TextLocalizedKey?: string | null;
  IsSelected?: boolean;
  Index?: string | number;
}

export interface EventObject {
  event: EventDetails;
  index: number;
  isEvent: boolean;
}

export interface TreeChecked {
  selected: any;
  checkedKey: string[];
}
export interface TreeCheckedRootObject {
  data: TreeChecked;
  index: number;
}

export interface PreferenceUpdateData {
  UserName: string;
  UserTimezone: {
      Text: string;
      Value: string;
  };
  UserLanguageId: {
      Text: string;
      Value: string;
  };
}

export interface UserStaffingAgencyDetails {
  Country: string;
  CountryId: number;
  Language: string;
  LanguageId: number;
  Timezone: string;
  TimezoneId: number;
}

export interface IconDetail {
  iconLeft: string;
  iconRight: string;
  isDisabled: boolean;
  isSelected: boolean;
  isVisible: boolean;
  label: string;
}

export interface tabValue{
  tab: string;
  value: number;
}

export interface OrgLevelConfig {
  controlVisibility: FormControl;
  controlLabel: FormControl;
  controlRequired: FormControl;
  control: FormControl;
  data: any;
}

export type SectorControlData = [
  GenericResponseBase<DataItem[]>,
  GenericResponseBase<DataItem[]>,
  GenericResponseBase<DataItem[]>,
  GenericResponseBase<boolean>,
  GenericResponseBase<DataItem[]>
];

export interface ColumnOption {
  columnHeader: string;
  fieldName: string;
  visibleByDefault: boolean;
}

export interface PreferenceUpdate {
  Id: number;
  UKey: string;
  AuthUserId: string;
  UserCode: string;
  RoleGroupId: number;
  UserNo: number;
  UserName: string | undefined;
  UserFullName: string;
  UserLanguageId: number;
  UserLanguage: string;
  UserTimezoneId: string;
  UserTimezone: string;
  UserStatus: number;
  NormalizedUserStatus: string;
  LoginMethod: number;
  DateFormat: string;
  TimeFormat: string;
  IsSelfRecord: boolean;
  ProfileDmsId: string | null;
  LandingPageUrl: string;
  LandingPageName: string;
  UserNotificationPreferences: string | null;
  ProxyUsers: string | null | ProxyUser[];
  SecurityQuestionList: string | null;
}

export interface CurrentObject{
  onLock : ()=> void;
}
export interface RoleGroupDto {
  roleGroupId: number;
  roleNos: number[];
}

export interface SectorData {
  roleGroupDtos: RoleGroupDto[];
  sectorIds: number[];
}

export interface UserLockStatus {
  userNo: number | undefined;
  locked: boolean;
}


export interface UserPermissions {
  roleGroupIds: number[];
  roleGroupDtos: RoleGroupDto[];
  xrmEntityActionIds: number[];
  sectorIds: number[];
  locationIds: number[];
  orgLevel1Ids: number[];
}
