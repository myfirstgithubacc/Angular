export interface ShiftData {
  UKey: string;
  ShiftId: number;
  SectorId: number;
  LocationId: number;
  LocationName: string;
  AdderOrMultiplierValue: number;
  CLPWorkingDays: string;
  ClpWorkingDays: { Text: string; Value: number }[];
  CreatedBy: string | null;
  CreatedOn: string;
  CurrencyCode: string;
  Disabled: boolean;
  EndTime: string;
  Fri: boolean;
  IsLocationSpecific: boolean;
  LastModifiedBy: string | null;
  LastModifiedOn: string | null;
  Mon: boolean;
  ReportingDayType: string;
  Sat: boolean;
  SectorName: string;
  ShiftCode: string;
  ShiftDifferential: string;
  ShiftDifferentialMethodId: number | null;
  ShiftName: string;
  StartTime: string;
  Sun: boolean;
  Thu: boolean;
  Tue: boolean;
  Wed: boolean;
  [key: string]: string | number | boolean | { Text: string; Value: number }[] | null;
}

export interface Sector extends AddDispatchApiData {
  Data: [];
}

export interface SectorDdlData {
  ddlSector: Sector;
  ddlShift : Sector;
}

export interface CopyInfo {
  destinationLocationId: string;
  destinationSectorId: string;
  shiftIds: [];
  sourceSectorId: string;
}
export interface PunchReportDaySettingItem {
  Text: string;
  Value: string;
}
export interface activateDeactivate {
  UKey: string;
  Disabled: boolean;
  ReasonForChange?: string | null;
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
export interface BulkStatusUpdateAction {
actionName: string;
rowIds: string[];
clickedTabName: string;
}
export interface ActivateDeactivate {
UKey: string;
Disabled: boolean;
ReasonForChange?: string | null;
}
export interface CurrencyOnSectorData {
CountryId: number;
CountryName: string;
CurrencyCode: string;
CurrencySymbol: string;
PhoneExtFormat: string;
PhoneFormat: string;
StateLabel: string;
StateLabelLocalizedKey: string;
UKey: string;
ZipFormat: string;
ZipLabel: string;
ZipLabelLocalizedKey: string;
ZipLengthSeries: string;
}
export interface OnSectorChangeDropDown {
IsSelected: boolean;
Text: string;
TextLocalizedKey: string | null;
Value: number;
}
export interface AddDispatchApiData {
Message: string;
StatusCode: number;
Succeeded: boolean;
}
export interface editDispatchApiData extends AddDispatchApiData{
ShiftName:string
}
export interface ClpWorkingDay {
Text: string;
Value: number | string;
}
export interface SectorIdValue {
Value: string;
}
interface BaseShiftData {
sectorId: number;
locationId: number | null;
isLocationSpecific: boolean;
shiftName: string;
reportingDayType: string;
startTime: string | null;
endTime: string | null;
clpWorkingDays: string;
ShiftDifferential: string;
adderOrMultiplierValue: string;
currencycode: string;
ShiftDifferentialMethodId: number;
}
export interface SelectClpWorkingDay {
text: string;
value: string;
}
export interface AddShiftData extends BaseShiftData {
selectClpWorkingDays: { text: string; value: string }[];
}
export interface AddDispatchShiftData extends BaseShiftData {
selectClpWorkingDays: SelectClpWorkingDay[];
}
export interface ShiftDataSaveEditMode {
uKey: string;
sectorId: number;
locationId: number | null;
isLocationSpecific: boolean;
shiftName: string;
reportingDayType: string;
startTime: string | null;
endTime: string | null;
selectClpWorkingDays: { text: string; value: string }[];
clpWorkingDays: string;
ShiftDifferential: string;
adderOrMultiplierValue: string;
reasonForChange: string;
CurrencyCode: string;
}
export type ShiftDataEditDispatch = ShiftDataSaveEditMode;
export interface CopyTreeModel {
controlName: string;
change?: {
    Text: string;
    Value: string;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
}
}
export interface PreventAction {
text: string;
themeColor: string;
value: number;
}
interface ApiResponse {
StatusCode: number;
Succeeded: boolean;
Message: string;
}
interface LocationData {
Text: string;
Value: string;
TextLocalizedKey: string | null;
IsSelected: boolean;
}
interface DdlLocation extends ApiResponse {
Data: LocationData[];
}
interface DdlSectConfigData {
BillRateValidation: number;
BillRateValidationName: string;
CostEstimationType: number;
CostEstimationTypeName: string;
PricingModel: number;
PricingModelName: string;
MarkUpType: number;
MarkUpTypeName: string;
IsRfxSowRequired: boolean;
OtRateType: number;
OtRateTypeName: string;
ShiftdifferentialMethod: number;
IsXrmTimeClockRequired: boolean;
CountryId: number;
}

interface DdlSectConfig extends ApiResponse {
Data: DdlSectConfigData;
}

interface CountryData {
UKey: string;
CountryId: number;
CountryName: string;
StateLabelLocalizedKey: string;
StateLabel: string;
ZipLabelLocalizedKey: string;
ZipLabel: string;
ZipLengthSeries: string;
ZipFormat: string;
PhoneFormat: string;
PhoneExtFormat: string;
CurrencyCode: string;
CurrencySymbol: string;
}

interface DdlCountrybySect extends ApiResponse {
Data: CountryData[];
}

export interface RootObject {
ddlLocation: DdlLocation;
ddlsectconfig: DdlSectConfig;
ddlCountrybysect: DdlCountrybySect;
}
export interface ValidationError {
error: boolean;
message: string;
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
export interface ICommonComponentData {
shiftID: number;
Disabled: boolean;
shiftCode: string;
}
export interface DropdownOptionList {
	Text: string;
	Value: string;
	TextLocalizedKey: string | null;
	IsSelected: boolean;
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

