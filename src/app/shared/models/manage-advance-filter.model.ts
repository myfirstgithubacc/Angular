export interface SelectedAdvanceFilter {
    columnHeader: string;
    controlType: ControlType| string;
    dynamicParam: string;
    value: any;
  }
  
  export enum ControlType {
    Multiselect = 'multiselect',
    Input = 'input',
    DropdownList = 'dropdownlist',
    TimePicker = 'timepicker',
    DatePicker = 'datepicker',
    TimeRange = 'timerange',
    IntegerRange = 'integerrange',
    DateRange = 'daterange'
  }

  export type LocalizationObject = {
    [key: string]: string;
};