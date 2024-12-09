

import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface IValue {
  [key:string]:any;
}
export interface IValueComponent extends Omit<FinalBenefitData, 'value'> {
  value: string | number;
  isCurrency?: boolean;
  isPhone?: boolean;
  isExtension?: boolean;
  phoneMask?: string;
  phoneExtMask?: string;
  extValue?: string | number;
  tooltipTitleLocalizeParam?: any;
  getFormatedNumber?: () => string;
  dynamicParam?: DynamicParam[];
}
export interface FinalBenefitData {
  text: string,
  value: string
}
