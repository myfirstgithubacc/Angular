import { AbstractControl, FormArray } from "@angular/forms";
import { WeekDayRule } from "./hour-distribution-rule-WeekDayRule.model";

export interface CustomData {
  formData?: AbstractControl<any, any>[];
  data: {
    value: WeekDayRule;
  };
  index: number;
}

export interface ListViewDataValidation {
  WeekDayRule: FormArray | undefined;
  Week2Rule: FormArray | undefined;
  AdditionalRuleDay: FormArray | undefined;
  SpecialRuleDay: FormArray | undefined;
  [key: string]: FormArray | undefined;
}
