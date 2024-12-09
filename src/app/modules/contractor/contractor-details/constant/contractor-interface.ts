import { FormGroup, ValidatorFn } from "@angular/forms";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

// interface for contractor data -- start
interface TenureDetail {
  TenureDetailId: number;
  SectorId: number;
  SectorName: string;
  CLPId: number;
  CLPName: string;
  TenurePolicyApplicable: boolean;
  TenureLimitType: number;
  TenureLimitTypeName: string;
  TenureStartDate: Date;
  TenureLimit: number;
  TenureEndDate: Date;
  TenureCompleted: string;
  AssignmentCount: number;
}

export interface ContractorData {
  Id: number;
  UKey: string;
  Code: string;
  FirstName: string;
  LastName: string;
  MiddleName: string | null;
  FullName: string;
  SSN: string;
  Status: string;
  UserNo: number | null;
  Email: string | null;
  CreatedBy: string;
  CreatedOn: string;
  LastModifiedBy: string;
  LastModifiedOn: string;
  WorkPhoneNo: string | null;
  PhoneNoExtension: string | null;
  ContactPhone: string;
  UserLogInId: string;
  RecentWeekEnding: string;
  CountryId: number;
  RequireLoginforTE: boolean;
  Disabled: boolean;
  Comments: string | null;
  TenureDetails: TenureDetail[];
  UdfFieldRecords: [];
  AddedToDNR: boolean;
  EmailConfirmed: boolean;
  UserId:string;
}

export interface TenureData {
  index: number;
  data: FormGroup;
  control: string;
  formData: FormGroup;
}

interface Control {
  controlType?: string;
  controlId?: string;
  defaultValue?: string | number | null | undefined;
  isEditMode?: boolean;
  isDisable?: boolean;
  format?: string;
  min?: string | number | undefined;
  maxlength?: number | undefined;
  decimals?: string | number | null | undefined;
  placeholder?: string | number | null | undefined;
  requiredMsg?: string | number | null | undefined;
  validators?: ValidatorFn[],
  max?: string | number | null | undefined;
  isSpecialCharacterAllowed?: boolean;
  specialCharactersAllowed?: string | number | null | undefined;
  specialCharactersNotAllowed?: string | number | null | undefined;
  isValuePrimitiveAllowed?: boolean;
  dependabilityVisibility?: string | number | null | undefined;
  onLabel?:string | number | null | undefined;
  offLabel?: string | number | null | undefined;
  minDate?: Date | null | undefined;
  maxDate?: Date | null | undefined;
  minDate1?: Date | null | undefined;
  maxDate1?: Date | null | undefined;
  fromLabel?: string | number | null | undefined;
  toLabel?: string | number | null | undefined;
  label?: string | number | null | undefined;
  isNotTranslated?: boolean;
  isNumeric?: boolean;
  isZipCode?: boolean;
  countryId?: string | number | null | undefined;
  zipLengthSeries?: string | number | null | undefined;
  zipFormat?: string | number | null | undefined;
  isExtension?: boolean;
  isCurrency?: boolean;
  decimalPlaces?: string | number | null | undefined;
  isDisabled?: boolean;
  dependableVisibility?: string | number | null | undefined;
  contryId?: string | number | null | undefined;
  decimal?:string | number | null | undefined;
}

export interface Column {
  colSpan?: string | number | null | undefined;
  columnName: string;
  asterik?: boolean;
  controls: Control[];
	text1?: string;
  tooltipVisible?: boolean;
  childColumn?: string | number | null | undefined;
  columnWidth?: string | number | null | undefined;
  dynamicParam?: DynamicParam[] | undefined;
  tooltipTitile?: string | number | null | undefined;
}

export interface NavigationData {
  url: string | null;
  isAssignDetailsTabSelected: boolean;
}

export interface ContactDetails {
  Code: string;
  ContactPhone: string | null;
  CreatedBy: string;
  CreatedOn: string;
  Disabled: boolean;
  Email: string | null;
  Id: number;
  LastModifiedBy: string;
  LastModifiedOn: string;
  Name: string;
  RequireLoginforTE: boolean | null;
  SSN: string;
  Status: string;
  UKey: string;
}

export interface DuplicateData {
  Data: boolean;
  Message: string;
  StatusCode: number;
  Succeeded: boolean;
}

// interface for contractor data -- end

interface PoBreakdown {
  Id: number;
  PO: string;
  TotalHours: number;
}

export interface PoData {
  OverallTotalHours: number;
  YearTillTotalHours: number;
  HoursBreakdownByPO: PoBreakdown[];
}

export interface LocOfficerData {
  TenureDetailId: number;
  SectorId: number;
  SectorName: string;
  CLPId: number;
  CLPName: string;
  TenurePolicyApplicable: boolean;
  TenureLimitType: number;
  TenureLimitTypeName: string;
  TenureStartDate: Date;
  TenureLimit: number;
  TenureEndDate: Date;
  TenureCompleted: string;
  AssignmentCount: number;
}

export interface AdvanceSearchFilter {
  controlType: string;
  value: Record<string, string[]>;
}

export interface NavigationPathsType {
  addEdit: string;
  view: string;
  list: string;
  apiAddress: string;
  advApiAddress: string;
}

export interface ColumnConfigure {
  isShowfirstColumn?: boolean;
  isShowLastColumn?: boolean;
  changeStatus?: boolean;
  uKey?: boolean | string | number | null | undefined;
  Id?: boolean | string | number | null | undefined;
  firstColumnName?: string | number | null | undefined;
  secondColumnName?: string | number | null | undefined;
  deleteButtonName?: string | number | null | undefined;
  noOfRows?: boolean | string | number | null | undefined;
  itemSr?: boolean | string | number | null | undefined;
  itemLabelName?: boolean | string | number | null | undefined;
  firstColumnColSpan?:boolean | string | number | null | undefined;
  lastColumnColSpan?: boolean | string | number | null | undefined;
  isAddMoreValidation?: boolean | string | number | null | undefined;
  widgetId?: boolean | string | number | null | undefined;
  itemlabelLocalizeParam?:boolean | string | number | null | undefined;
  isVisibleAsterick?: boolean | string | number | null | undefined;
  tooltipVisible?: boolean | string | number | null | undefined;
  asterik?: boolean | string | number | null | undefined;
  isAddMoreEnabled?:boolean | string | number | null | undefined;
  rowNo?: boolean | string | number | null | undefined;
  isAddMoreClicked?: boolean | string | number | null | undefined;
  isShowFirstColumn?: boolean | string | number | null | undefined;
}
export interface LabelTextItem {
  label: string;
  tooltipVisible?: boolean;
  tooltipTitle?: string;
  tooltipTitleLocalizeParam?: boolean | string | number | null | undefined;
  asterik?: boolean | string | number | null | undefined;
}

export interface PopulatedData {
  uKey?: string;
  Id?: number;
  isDisabled?: boolean;
  text1?: any;
}

export interface NumericChangeData {
  index: any,
  data: any,
  control: any,
  formData: any
}
