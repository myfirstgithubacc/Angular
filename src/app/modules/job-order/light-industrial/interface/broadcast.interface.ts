export interface IBroadcastDetails {
  UKey: string;
  RequestId: number;
  BroadcastRound: number;
  Comments: string;
  OverrideConfiguredDelayedNotification: boolean;
  RequestBroadcastDetailsGetAll: RequestBroadcastDetails[];
  BroadcastComments: IBroadcastComments[];
  RequestBroadcastReasonId?: number;
  SubmittalCutOffDate: string | null;
  LastBroadcastDate: string;
}

export interface RequestBroadcastDetails {
  StaffingAgencyId: number;
  StaffingAgencyTier: number;
  StaffingAgencyName: string;
}

export interface IBroadcastComments {
  BroadcastedOnDate: string;
  BroadcastedBy: string;
  Comments: string;
}

export interface IOriginalDataSetItem {
  text: string;
  Index: string;
  items: ChildDataItem[];
}

export interface ChildDataItem {
  Index: string;
  text: string;
  staffingAgencyId: number;
  isSelected: boolean;
  staffingAgencyTier: number;
}

export interface IStaffingAgencyItem {
  StaffingAgencyId: number;
  StaffingAgencyTier: number;
  StaffingAgencyName: string;
}


export interface IStaffingAgencyListPayload {
  sectorId: number;
  locationId: number;
  laborCategoryId: number;
  isSelected: boolean | null;
  xrmEntityId: number;
  securityClearanceId?: number;
}

interface StaffingAgency {
  StaffingAgencyId: number;
  StaffingAgencyName: string;
  IsSelected: boolean;
}

export interface ITieredStaffingAgenciesList {
  Preferred: StaffingAgency[];
  Tier2: StaffingAgency[];
  Tier3?: StaffingAgency[];
}

export interface IRequestBroadcastDetails {
  staffingAgencyId: number;
}

export interface ICheckedKeys {
  checkedKey: string[]
}

export interface ISelectedStaffingAgency {
  checkedKey: string[];
  selected: string[];
}

export interface IStaffingAgencies {
  StaffingAgencyName: string;
  StaffingAgencyId: number;
  IsSelected: boolean;
  StaffingAgencyTier: number
}
