import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface IRadioItem {
  Text: string;
  Value: string | number ;
  tooltipVisible?: boolean;
  tooltipTitle?: string | undefined;
  tooltipTitleLocalizeParam?: DynamicParam[];
  findIndex?: number;
  index? : number;
  // Add other properties as needed
}