
export enum EventEnteredAndNotify {
  ClientUser ='Client User',
  StaffingAgencyUser = 'Staffing Agency User'
};


export enum EventAndNotifyValue {
  ClientUser = 4,
  StaffingAgencyUser = 3
};

export interface EditEventConfigData {
  ID: number;
  UKey: string;
  EventCode: string;
  SectorName: string;
  BackfillDefaultValue: boolean;
  CreatedBy: string;
  CreatedOn: string;
  DateType: string;
  DateTypeId: number;
  DaysPriorToEventDate: number | null;
  DelayNotificationBeforeEvent: boolean | number | null;
  Disabled: boolean;
  EffectOnDailySchedule: string;
  EffectOnDailyScheduleId: number;
  EventEnteredBy: string;
  EventName: string;
  IsLightIndustrialContractor: boolean;
  IsProfessionalContractor: boolean;
  LastModifiedBy: string;
  LastModifiedOn: string;
  ManagerSurveyToRequested: boolean;
  NotifyTo: string;
  RequiresBackfill: boolean;
  RequiresComment: boolean;
  RequiresEventReason: boolean;
  ValidateEventDateWithTimesheet: boolean;
}

export interface SelectedEventConfig {
  ID: number;
  UKey: string;
  EventId: string;
  SectorName: string;
  EventConfigName: string;
  CreatedBy: string;
  CreatedOn: string;
  Disabled: boolean;
  LastModifiedBy: string;
  LastModifiedOn: string;
}
export type ActivateDeactivateData = SelectedEventConfig;
export interface CopyInfoData {
  destinationSectorId: string;
  eventConfiIds: [];
  sourceSectorId: string;
}
export interface NavPathsType {
  addEdit: string;
  view: string;
  list: string;
  apiAddress?: string;
  advApiAddress?: string;
}
export interface StatusData {
  items: DetailItem[];
}
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
export interface Permission {
  ActionId: number;
  VIEW_ONLY: number;
  }
export interface OnAllActivateDeactivate {
    actionName: string;
    clickedTabName: string;
    rowIds: string[];
   }
export interface activateDeactivate {
    UKey: string;
    Disabled: boolean;
    ReasonForChange?: string | null;
  }
export interface AdvanceSearchFilter {
    controlType: string;
    value: Record<string, string[]>;
  }
export interface CopyTreeModel {
    controlName: string;
    change?: {
        Text: string;
        Value: string;
        TextLocalizedKey: string | null;
        IsSelected: boolean;
    }
 }
export interface Sector {
  Text: string;
  Value: string;
  TextLocalizedKey: string | null;
  IsSelected: boolean;
}
export interface SectorDdlData {
  Data: Sector[];
  StatusCode: number;
  Succeeded: boolean;
  Message: string;
}
export interface PreventAction {
  text: string;
  themeColor: string;
  value: number;
  }
export interface EventEnteredBy {
    Text: string;
    Value: number;
}
export interface ICommonEventConfigrationData {
  EventConfigrationID: number;
  Disabled: boolean;
  EventConfigrationCode: string;
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
  ControlType: string | null;
  IsValueCommaSeparated: boolean;
  GroupName: string | null;
  MenuId: number | null;
  DynamicParam: any;
  fieldName: string;
  columnHeader: string;
  visibleByDefault: boolean;
}
