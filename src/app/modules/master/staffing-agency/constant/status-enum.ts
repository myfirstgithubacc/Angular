import { AbstractControl, Form, FormGroup } from "@angular/forms";
import { ApiResponseBase } from "@xrm-core/models/responseTypes/api-response-base.model";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";
import { IDropdownItem } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";


export enum Status {
	InActive = magicNumber.eighty,
	Active = magicNumber.eightyOne,
	Probation = magicNumber.eightyTwo,
	Potential = magicNumber.eightyThree,
}

export interface DropdownOptionList {
	Text: string;
	Value: string;
	TextLocalizedKey: string | null;
	IsSelected: boolean;
  isSelected?: boolean;
  };

// dropdown interface for dropdown having text and value only
export interface DropDownWithTextValue {
	Text: string;
	Value: string;
  }

export interface SectorValues {
    Text: string;
    Index: string;
    items: Item[];
    }

export interface laborCategoryValues {
	Text: string;
	Value: number;
	Index: string;
	items: Item[] | undefined;
	selected: boolean;
  length?:number
  }

export type SecValue = Record<number, laborCategoryValues>;

  interface Item {
    Text: string;
    Value: string;
    Index: string;
    selected: boolean;
  }

export interface SAdata {
  City: string;
  Code: string;
  CreatedBy: string;
  CreatedOn: string;
  Id: number;
  LastModifiedBy: string;
  LastModifiedOn: string;
  PrimaryContactName: string;
  StaffingAgencyName: string;
  StaffingAgencyStatus: string;
  StaffingAgencyStatusId: number;
  StaffingAgencyTierLevel: string;
  StaffingAgencyTypeId: number;
  State: string;
  StateId: number;
  UKey: string;
}

// to validate userFields
export interface ValidationParams {
	enabled: boolean;
	value: string;
	control: AbstractControl;
	userId: string;
  }
// this will be removed
export interface ColumnOption {
    XrmGridPersistentMasterId: number;
    ColumnName: string;
    ColumnHeader: string;
    SelectedByDefault: boolean;
    IsReadOnly: boolean;
    DefaultColumnSequence: number;
    Dir: string | null;
    ValueType: string;
    EntityType: string | null;
    MapFromProperty: string | null;
    IsLocalizedKey: boolean;
    ColumnWidth: number | null;
    DecimalPlaces: number | null;
    Viewable: boolean;
    MaskingAllowed: boolean;
    TypeOfMasking: string | null;
    MaskingCount: number | null;
    ControlType: string;
    IsValueCommaSeparated: boolean;
    GroupName: string | null;
    MenuId: number | null;
    DynamicParam: any;
    fieldName: string;
    columnHeader: string;
    visibleByDefault: boolean;
}
export interface ActivateDeactivateData {
    Id?: number;
    UKey?: string;
    Code?: string;
    StaffingAgencyName?: string;
    StaffingAgencyStatus?: string;
    StaffingAgencyStatusId?: number;
    State?: string;
    City?: string;
    StateId?: number;
    StaffingAgencyTierLevel?: string;
    StaffingAgencyTypeId?: number;
    PrimaryContactName?: string;
    CreatedBy?: string;
    CreatedOn?: string;
    LastModifiedBy?: string;
    LastModifiedOn?: string;
    Disabled?: boolean;
    ReasonForChange?: string | null;
}

export class DrpResponse extends ApiResponseBase{
	ddlCountry?:Dropdown;
	ddlCulture?:Dropdown;
	ddlSecClrnc?:Dropdown;
	ddlStaffingType?:Dropdown;
	ddlTimezone?:Dropdown;
	icsowlcat?:Icsowlcat;
	ddlPaymentType?:Dropdown;
	ddlBsnsClsfn?:Dropdown;
}
interface Dropdown {
  Data: DropdownOptionList[];
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}

interface Icsowlcat{
  Data: SectorDetails[];
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}
interface AllDropdownData {
  ddlCountry: DropdownData;
  ddlTimezone: DropdownData;
  ddlStaffingType: DropdownData;
  ddlSecClrnc: DropdownData;
  ddlCulture: DropdownData;
  ddlRoleStaff: DropdownData;
}


export interface Sector{
            Text:string,
							Value: string,
							Index: number,
							selected: boolean
}

export interface DataSec{
  LaborCategories:[]
}

export interface ActivateDeactivate {
    UKey: string;
    Disabled: boolean;
    ReasonForChange: string | null;
    StaffingAgencyStatusId?: number;
}
export interface SectorDetails {
  SectorId: number;
  Text: string;
  isSelected: boolean;
  LaborCategories: DropdownOptionList[] | null;
  NewLaborCategories: DropdownOptionList[];
}

export interface LaborCategoryVal {
  Text: string;
  Value: string;
}

export interface SelectedItem {
  Text: string;
  Value: number;
  Index: string;
  items:Sector[];
  selected: boolean;
}

export interface DropdownData {
  Data: IDropdownItem[];
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}

export interface DrpData {
  ddlCountry: DropdownData;
  ddlTimezone: DropdownData;
  ddlStaffingType: DropdownData;
  ddlSecClrnc: DropdownData;
  ddlCulture: DropdownData;
  ddlRoleStaff: DropdownData;
}

export interface LabCheck {
  selected: SelectedItem[];
  checkedKey: string[];
}

export interface UserDetail {
  AcknowledgementAcceptedOnDate: string;
  AlternateEmail: string | null;
  AlternatePhoneNumber1: string | null;
  AlternatePhoneNumber2: string | null;
  AlternatePhoneNumberExt1: string | null;
  AlternatePhoneNumberExt2: string | null;
  ApplicabilityForMultipleSectors: boolean;
  ClientUserSectorAccesses: [];
  CountryId: number;
  CreatedBy: number;
  CreatedByUserName: string;
  CreatedOn: string;
  DataAccessRightName: string;
  DateFormat: string;
  EmailConfirmed: boolean;
  Id: number;
  IsAllLocationAccessible: boolean;
  IsAllSectorAccessible: boolean;
  IsAllSectorAccessibleName: string;
  IsLocked: boolean;
  IsSelfRecord: boolean;
  LandingPageName: string;
  LandingPageUrl: string;
  LastModifiedBy: string | null;
  LastModifiedByUserName: string;
  LastModifiedOn: string | null;
  LocationAccessList: [] | null;
  LockoutEnd: string | null;
  LoginMethod: number;
  LoginMethodName: string;
  NextLevelManagerId: number | null;
  NextLevelManagerName: string | null;
  NormalizedUserStatus: string;
  OrgLevel1Name: string | null;
  PasswordExpiryDate: string;
  PhoneNumber: string;
  PhoneNumberExt: string;
  ProfileDmsId: string | null;
  ProxyUsers: [] | null;
  ReportingLocationName: string | null;
  RoleGroupId: number;
  RoleName: string;
  RoleNo: number;
  SectorAccessList: [] | null;
  SectorName: string | null;
  SecurityQuestionList: [] | null;
  StaffingAgencyId: number;
  StaffingAgencyName: string;
  SystemNotificationAllowed: boolean;
  TimeFormat: string;
  UKey: string;
  UserAddressLine1: string;
  UserAddressLine2: string;
  UserApprovalConfigurationDetails: [] | null;
  UserCity: string;
  UserCode: string;
  UserComments: string;
  UserCountry: string;
  UserDataAccessRight: any;
  UserEmail: string;
  UserFirstName: string;
  UserFullName: string;
  UserId: string;
  UserLanguage: string;
  UserLanguageId: number;
  UserLastName: string;
  UserLocationAccesses: [] | null;
  UserMiddleName: string;
  UserName: string;
  UserNo: number;
  UserNotificationPreferences: [] | null;
  UserOrgLevel1Accesses: [] | null;
  UserState: string;
  UserStateId: number;
  UserStatus: number;
  UserTimezone: string;
  UserTimezoneId: number;
  UserTitle: string;
  UserZipCode: string;
}


export interface StaffingAgencyData {
  Id: number;
  UKey: string;
  Code: string;
  StaffingAgencyName: string;
  StaffingAgencyStatus: string;
  HomeCountry: string;
  State: string;
  TimeZone: string;
  LanguageName: string;
  StaffingAgencyTierLevel: string;
  GeneralLiabilityApprovalDate?: Date;
  AutoLiabilityApprovalDate?: Date;
  GeneralLiabilityExpirationDate?: Date;
  AutoLiabilityExpirationDate?: Date;
  WorkerCompApprovalDate?: Date;
  WorkerCompExpirationDate?: Date;
  SecurityClearance: string;
  BusinessClassification: string;
  PaymentTypeName: string;
  IsPrimaryUserCreated: boolean;
  PrimaryUserNumber: number;
  PrimaryContactName: string;
  PrimaryUserId: string;
  PrimaryContactRole: string;
  IsAlternateUserCreated: boolean;
  AlternateUserNumber: number;
  AlternateContactName: string;
  AlternateUserId: string;
  AlternateContactRole: string;
  IsAccountingUserCreated: boolean;
  AccountingUserNumber: number;
  AccountingContactName: string;
  AccountingUserId: string;
  AccountingContactRole: string;
  sowLaborCategories: SectorDetails[];
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  PrimaryUkey: string;
  AlternateUkey: string;
  AccountingUkey: string;
  StaffingAgencyStatusId: number;
  CountryId: number;
  StaffingAgencyEin: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  StateId: number;
  ZipCode: string;
  TimeZoneId: number;
  CultureId: number;
  StaffingAgencyTypeId: number;
  HomePageUrl: string;
  SecurityClearanceId: number;
  CageCode: string;
  BusinessClassificationId: number;
  PaymentTypeId: string;
  PreferenceNteRateMultiplier: number;
  PrimaryContactFirstName: string;
  PrimaryContactLastName: string;
  PrimaryContactMiddleName: string;
  PrimaryContactEmail: string;
  PrimaryPhoneExtension: string;
  PrimaryContactPhoneNumber: string;
  AlternateContactFirstName: string;
  AlternateContactLastName: string;
  AlternateContactMiddleName: string;
  AlternateContactEmail: string;
  AlternatePhoneExtension: string;
  AlternateContactPhoneNumber: string;
  AccountingContactFirstName: string;
  AccountingContactLastName: string;
  AccountingContactMiddleName: string;
  AccountingContactEmail: string;
  AccountingPhoneExtension: string;
  AccountingContactPhoneNumber: string;
  IsAllowedForPayroll: boolean;
  IsAllowedForIc: boolean;
  IcMarkup: number;
  SowIcMspFee: number;
  IsAllowedForLi: boolean;
  CanReceiveCandidateFromAts: boolean;
  IsMspAfiiliated: boolean;
  IsAllowedForRfxSow: boolean;
  Comments: string;
  [key: string]: string | number | boolean | Date | SectorDetails[] | string[] | number[] | null | undefined;
}


export interface ClientConfiguration {
  ClientConfigureType: string;
  ClientPaySalesTax: boolean;
  Code: string;
  CountryId: number;
  DefaultCultureId: number;
  DefaultCultureName: string;
  Email: string;
  EmailDomain: string;
  HomeCountry: string;
  Id: number;
  IsAcroTracInOutTime: boolean;
  IsLiClpFilledByDifferentStaffing: boolean;
  IsLimitAvailableWeekendingInTimeCapture: boolean;
  IsPortalImplementation: boolean;
  IsRfxRequired: boolean;
  IsSalesTaxFromExternalSource: boolean;
  IsUidNumeric: boolean;
  Name: string;
  NoOfPreviousWeekending: number;
  OnsiteName: string;
  OrganizationLabel: string;
  ProgramManagerContact: string;
  ProgramManagerEmail: string;
  ProgramManagerName: string;
  SkipHoursValidationOnTimeUpload: boolean;
  SowVariance: number;
  SupportContactNumber: string;
  SupportEmail: string;
  SystemGeneratedEmail: string;
  TimeZone: string;
  TimezoneId: number;
  UidLabelLocalizedKey: string;
  UidLength: number;
  Ukey: string;
  Url: string;
  WeekEndingDay: string;
  WeekEndingDayId: number;
}

export interface CommonComponentData {
  StaffingAgencyId: number;
  StaffingAgencyCode: string;
  Status: string
}

export interface IUdfData {
  data: IPreparedUdfPayloadData[];
  formGroup: FormGroup
}

export interface LaborCategoryDrop {
  Text: string;
  Value: string;
  TextLocalizedKey: null | string;
  IsSelected: boolean;
}
export type LaborCategoryData = laborCategoryValues | number[];

export interface StatusCard{
   key: string,
    value: string,
    cssClass?: string[]
}


