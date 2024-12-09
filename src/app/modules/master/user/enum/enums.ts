/* eslint-disable no-magic-numbers */
// eslint-disable-next-line no-shadow
export enum UserRole {
  Client = 4,
  StaffingAgency = 3,
  MSP = 2,
  UserDataAccessRightMSPStaffing = 1,
}

// eslint-disable-next-line no-shadow
export enum RoleGroup {
  MSP = '2',
  Client = '4',
  StaffingAgency = '3',
}

// eslint-disable-next-line no-shadow
export enum XrmCredential {
  XrmCredentialId = 1
}

// eslint-disable-next-line no-shadow
export enum UserStatus {
  Active = 1,
  Inactive = 2,
  Lock = 3,
}

// eslint-disable-next-line no-shadow
export enum OrgType{
  OrgType1 = 1,
  OrgType2 = 2,
  OrgType3 = 3,
  OrgType4 = 4,
}

// eslint-disable-next-line no-shadow
export enum UserFormTab {
  UserDetails = 'UserDetails',
  Sector = 'SectorDetails',
  AlternateContactDetails = 'AlternateContactDetails',
  Preferences = 'Preferences',
}

// eslint-disable-next-line no-shadow
export enum UserRoleText {
  Client = 'Client',
  NewClient = 'NewClientUser',
  StaffingAgency = 'Staffing',
  NewStaffingAgency = 'NewStaffingAgencyUser',
  MSP = 'MSP',
  NewMSP = 'NewMSPUser',
}

// eslint-disable-next-line no-shadow
export enum UserDataAccessRight {
  ReportingClpView = '218',
  Org1View = '219',
  LocationView = '222',
}

// eslint-disable-next-line no-shadow
export enum UserConstants {
  SectorText = 'Sector',
  AcroDomain = '@acrocorp.com',
}

// eslint-disable-next-line no-shadow
export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
  All = 'All',
  Cancel = 'Cancel',
  Activate ='Activate'
}

// eslint-disable-next-line no-shadow
export enum ProxyUserStatuses
{
    Active = 312,
    Inactive = 313,
    Cancelled = 314,
    Upcoming = 315,
    CancelledWithCurrentDate = 316
}
