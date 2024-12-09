import { FormControl } from '@angular/forms';
import { IDropdown } from '@xrm-shared/models/common.model';

export interface ITimeEntryDetailFormModel {
  Id: FormControl<number>;
  CostAccountingCodeId: FormControl<IDropdown | string>;
  CostAccountingCodeName: FormControl<string>;
  ShiftId: FormControl<IDropdown | string>;
  ShiftName: FormControl<string>;
  JobTitle: FormControl<string>;
  StatusId: FormControl<number>;
  HoursTypeId: FormControl<IDropdown | string | null>;
  HoursTypeName: FormControl<string>;
  Sunday: FormControl<number>;
  Monday: FormControl<number>;
  Tuesday: FormControl<number>;
  Wednesday: FormControl<number>;
  Thursday: FormControl<number>;
  Friday: FormControl<number>;
  PreFriday: FormControl<number>;
  Saturday: FormControl<number>;
  TotalHour: FormControl<number>;
  SundayDisable: FormControl<boolean>;
  MondayDisable: FormControl<boolean>;
  TuesdayDisable: FormControl<boolean>;
  WednesdayDisable: FormControl<boolean>;
  ThursdayDisable: FormControl<boolean>;
  FridayDisable: FormControl<boolean>;
  PreFridayDisable: FormControl<boolean>;
  SaturdayDisable: FormControl<boolean>;
  InlineViewDisabled: FormControl<boolean>;
}
