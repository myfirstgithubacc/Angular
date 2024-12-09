import { Permission } from "@xrm-shared/enums/permission.enum";

type Nullable<T> = T | null | undefined;
export interface RetireeOptData {
    Code: string;
    CreatedBy: string;
    CreatedOn: string;
    Disabled: boolean;
    Id: number;
    LastModifiedBy: string;
    LastModifiedOn: string;
    RetireeOptionName: string;
    SectorId: number;
    SectorName: string;
    UKey: string;
  }
export interface activateDeactivate {
    UKey: string;
    Disabled: boolean;
    ReasonForChange?: string;
}
export interface saveEditMode {
    RetireeOptionName: string;
    SectorId: number;
    UKey: string;
  }
export type SaveEditModeApiResponse = RetireeOptData;
export type SaveAddModeApiResponse = RetireeOptData;
export type OnViewDataItem = RetireeOptData;
export interface DetailItem {
  key: string;
  value: number | string | boolean;
  cssClass?: string[];
  title?: string;
  titleDynamicParam?: [];
  item?: number | string | boolean;
  itemDynamicParam?: [];
  isLinkable?: boolean;
  link?: string;
  linkParams?: string;
}

export interface StatusData {
  items: DetailItem[];
}

export interface IRetireeOption {
    UKey: Nullable<string>;
    Id: Nullable<number>;
    Code: Nullable<string>;
    SectorId: Nullable<number>;
    SectorName: Nullable<string>;
    Disabled: Nullable<boolean>;
    CreatedOn: Nullable<Date>;
    CreatedBy: Nullable<number>;
    LastModifiedOn: Nullable<Date>;
    LastModifiedBy: string;
    CandidateDeclineReason: Nullable<string>;
    RetireeOptionName: Nullable<string>;
    ReasonForChange: Nullable<string>;
}
export interface ActivateDeactivateData {
  Id: number;
  UKey: string;
  Code: string;
  StaffingAgencyName: string;
  StaffingAgencyStatus: string;
  StaffingAgencyStatusId: number;
  State: string;
  City: string;
  StateId: number;
  StaffingAgencyTierLevel: string;
  StaffingAgencyTypeId: number;
  PrimaryContactName: string;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  Disabled:boolean;
}
export interface ActivateDeactivate {
  UKey: string | null | undefined;
  Disabled: boolean;
  ReasonForChange: string | null;
}

export class ActivateDeactivateObj {
	UKey: string | null | undefined;
	Disabled: boolean;
	ReasonForChange: string | null;
}
export interface ICommonRetireeData {
  retireeID: number;
  Disabled: boolean;
  retireeCode: string;
}
export interface NavPathsType {
  addEdit: string;
  view: string;
  list: string;
  apiAddress?: string;
  advApiAddress?: string;
}
export const dropdown = {
	Active: 'Active',
	Inactive: 'Inactive',
	NTE: 'NTE',
	NTEValue: '16',
	Target: 'Target',
	TargetValue: '17',
	MSP: 'MSP',
	HiringManager: 'HiringManager',
	HiringManagerValue: 'Hiring Manager',
	BillRateBased: 'BillRateBased',
	BillRateBasedValue: '7',
	MarkupBased: 'MarkupBased',
	MarkupBasedValue: '8',
	StaffingAgencyStandardMarkUpPercentage: 'StaffingAgencyStandardMarkUpPercentage',
	StaffingAgencyStandardMarkUpPercentageValue: '22',
	RateCard: 'RateCard',
	RateCardValue: '23',
	PeriodofPerformance: 'PeriodofPerformance',
	PeriodofPerformanceValue: '14',
	BudgetedHours: 'BudgetedHours',
	BudgetedHoursValue: '15',
	OTRateType: 'OTRateType',
	Activate: 'Activate',
	Deactivate: 'Deactivate',
	Disabled: 'Disabled',
	All: 'All',
	WageBasedOt: '3',
	BillRateBasedOt: '4',
	BillRateWageBasedOt: '5',
	STWageBasedOTMarkup: '6',
	Professional: 85,
	LightIndustrial: '84',
	Icsow: '86',
	BillRateBasedPro: 'Bill Rate Based (Professional only)',
	Probation: 'Probation',
	Potential: 'Potential',
	Status: 'StaffingAgencyStatusId',
	ProfessionalRate: 'Professional'

};
export interface AdvanceSearchFilter {
  controlType: string;
  value: Record<string, string[]>;
}
interface ActionItem {
	icon: string;
	title: string;
	color: string;

	actionId: Permission[];
  }
export interface ActionSetItem {
	Status: number | boolean;
	Items: ActionItem[];
  }
  interface TabOption {
    tabName: string;
    favourableValue: number | string | boolean;
    selected?: boolean;
    }
export interface TabOptions {
    bindingField: string;
    tabList: TabOption[];
    }
