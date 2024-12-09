/* eslint-disable line-comment-position */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidatorFn } from "@angular/forms";
import { IDayInfo } from "@xrm-shared/Utilities/dayinfo.interface";
export interface ActionItemParams {
  index: number; // Assuming index is of type number
  data: any; // Replace 'any' with the specific type if known
  formData: any; // Replace 'any' with the specific type if known
  action: string; // Assuming action is of type string
}

export interface OutputParams {
  index: number;
  control: number | string;
  data: any; // adjust 'any' to the specific type of 'data' if possible
  formData: any; // adjust 'any' to the specific type of 'formData' if possible
}

export interface RemovedRow {
  index: number;
  formArray: any; // Adjust 'any' to the specific type of 'formArray' if possible
}
export interface addMoreColumn {
  colSpan: number;
  columnName: string;
  controlType: string;
  controlId: string;
  validators?: any;
  decimals?: any;
  format?: any;
  isDisable?: any;
  isReadOnly?: any;
  placeholder?: any;
  onLabel?: any;
  controls?: any;
  offLabel?: any;
  maxlength?: any;
  isEditMode?: any;
  requiredMsg: string;
  defaultValue?: any;
}

export interface columnConfig {
  isShowfirstColumn: boolean;
  isShowLastColumn: boolean;
  firstColumnName: string;
  secondColumnName: string;
  deleteButtonName: string;
  noOfRows: number;
  itemLabelName: string;
  changeStatus?: boolean;
  firstColumnColSpan?: any;
  lastColumnColSpan?: any;
}


interface Control {
  controlType?: string | any;
  controlId?: string | any;
  defaultValue?: string | number | null | undefined | any;
  isEditMode?: boolean| any;
  isDisable?: boolean | any;
  format?: any;
  min?: any;
  maxlength?: any;
  decimals?: any;
  placeholder?: any;
  requiredMsg?: any;
  validators?: ValidatorFn[],
  max?: any;
  isSpecialCharacterAllowed?: boolean | any;
  specialCharactersAllowed?: any;
  specialCharactersNotAllowed?: any;
  isValuePrimitiveAllowed?: boolean | any;
  dependabilityVisibility?: any;
  onLabel?: any;
  offLabel?: any;
  minDate?: Date | any;
  maxDate?: Date | any;
  minDate1?: Date | any;
  maxDate1?: Date | any;
  fromLabel?: any;
  toLabel?: string | any;
  label?: string | any;
  isNotTranslated?: any;
  isNumeric?: boolean | any;
  isZipCode?: boolean | any;
  countryId?: any;
  zipLengthSeries?: any;
  zipFormat?: any;
  isExtension?: boolean | any;
  isCurrency?: boolean | any;
  decimalPlaces?: any;
  isDisabled?: boolean | any;
  dependableVisibility?: any;
  contryId?: any;
  decimal?: any;
}

export interface Column {
  colSpan?: any;
  columnName: string;
  asterik?: boolean;
  controls: Control[];
  text1?: string;
  tooltipVisible?: any;
  childColumn?: any;
  columnWidth?: any;
  dynamicParam?: any;
  tooltipTitile?: any;
}

export interface ColumnConfigure {
  isShowfirstColumn?: boolean;
  isShowLastColumn?: boolean;
  changeStatus?: boolean;
  uKey?: any;
  Id?: any;
  firstColumnName?: any;
  secondColumnName?: any;
  deleteButtonName?: any;
  noOfRows?: any;
  itemSr?: any;
  itemLabelName?: any;
  firstColumnColSpan?: any;
  lastColumnColSpan?: any;
  isAddMoreValidation?: any;
  widgetId?: any; // Optional property
  itemlabelLocalizeParam?: any;
  isVisibleAsterick?: any;
  tooltipVisible?: any;
  asterik?: any;
  isAddMoreEnabled?: any
  rowNo?: any;
  isAddMoreClicked?: boolean | any;
  isShowFirstColumn?: boolean | any;
}
export interface LabelTextItem {
  label: string;
  tooltipVisible?: boolean;
  tooltipTitle?: string;
  tooltipTitleLocalizeParam?: any;
  asterik?: any;
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
export interface JSONData {
  control: string,
  controlName: string,
  label: string
}

export interface SelectedTime {
	startTime: string;
	endTime: string;
	cancel?: boolean;
}

export interface WeekDayPicker {time: SelectedTime, day: IDayInfo[]}
