import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface DateRangeParams {
    firstDate: string;
    secondDate: string;
    validationMessage: string;
    dynamicParam?: DynamicParam[];
}

export interface WeekendingDateValidationParams {
    selectedDateIncurred: Date;
    firstDate: string;
    secondDate: string;
    validationMessage: string;
    dynamicParam?: DynamicParam[];
}

