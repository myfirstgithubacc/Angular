import { Position } from "@progress/kendo-angular-notification";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface ITabOption {
  bindingField: string,
  tabList: ITab[]
}

export interface ITab {
  tabName: string,
  selected?: boolean
  favourableValue: string | number | boolean,
  isTooltipVisible?: boolean,
  tooltipText?: string,
  tooltipPosition?: Position,
  isHtmlContent?: boolean,
  tooltipLocalizedParam?: DynamicParam[]
}
