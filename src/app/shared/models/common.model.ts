import { GenericResponseBase } from "@xrm-core/models/responseTypes/generic-response.interface";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface IDropdownOption {
    Text: string;
    Value: number;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
}

export interface IDropdownItem {
    Text: string;
    Value: string;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
}


export interface IDropdown {
    Text: string;
    Value: string;
}

export interface INumberDropdown {
    Text: string;
    Value: number;
}
export interface DropdownModel extends IDropdown {
    disabled?: false;
    group?: string;
    selected?: boolean;
    items?: DropdownModel[];
}
export interface IRadioGroupModel {
    disabled?: false;
    group?: string;
    selected?: boolean;
    Text: string;
    Value: string;
}

export interface IDropdownModel {
    Text: string,
    Value: string | number,
    IsLocalizedKey?: boolean
}
export interface INavigationPathMap {
    addEdit: string;
    view: string;
    list: string;
}

export interface ISectorDetailById {
    BroadCastInterval: number,
    DefaultPoForRecruitment: string,
    IsRfxSowRequired: boolean,
    PoTypeId: number,
    SectorName: string
}

export interface IRecordButton {
    status: string | boolean
    items: IRecordButtonItem[];
}

export interface IRecordButtonGrid {
    Status: string | boolean | number;
    Items: IRecordButtonItem[];
}

export interface IRecordButtonItem {
    icon: string;
    title: string;
    color: string;
    actionId: number[];
}

export type DynamicObject = Record<string, unknown>;

export interface IStatusCardData {
    items: IStatusCardItem[];
}

export interface IStatusCardItem {
    item: string;
    title: string;
    titleDynamicParam?: [];
    cssClass: string[];
    itemDynamicParam?: DynamicParam[];
    isLinkable?: boolean;
    link?: string;
    linkParams?: string;
}

export interface IDropdownWithExtras extends IDropdown {
    TextLocalizedKey?: string;
    IsSelected?: boolean;
    [key: string]: any;
}

export interface IRadioWithExtras extends IRadioGroupModel {
    TextLocalizedKey?: string;
    IsSelected?: boolean;
    [key: string]: string | boolean | number | undefined;
}

export interface IRecordStatusChangePayload {
    UKey: string;
    Disabled: boolean;
    ReasonForChange?: string;
}

export interface ICopyDialogData {
    type: string;
    labels: {
        dropdownLabel: string;
    };
    labelLocalizeParam: DynamicParam[];
    tooltipVisible: boolean;
    tooltipTitleParam: DynamicParam[];
    tooltipTitle: string;
    dropdownData: IDropdownOption[];
    controlName: string;
    IsTreePresent?: boolean;
    validationMessage: string;
    validationMessageDynamicParam: DynamicParam[];
    tooltipTitleLocalizeParam: DynamicParam[];
}

export interface ITabOption {
    tabName: string;
    favourableValue?: boolean | string | number;
    selected?: boolean;
    bindingInfo?: ITabBindingInfo[];
}

export interface ITabOptions {
    bindingField: string;
    tabList: ITabOption[];
    selectedTabKey?: string;
}

interface ITabBindingInfo {
    columnName: string;
    values: (string | number | boolean)[];
}
export interface ICopyToSourceData {
    controlName: string;
    change: IDropdownOption | undefined;
}

export interface IPermissionInfo {
    EntityTypeId: number;
    EntityType: string;
    ActionId: number;
    ActionName: string;
}

export interface IBulkStatusUpdateAction {
    actionName: string;
    rowIds: string[];
    clickedTabName: string;
}

export interface IPageSize {
    PageSize: number;
}

export interface IExtraAction {
    icon: string;
    type: string;
}

export interface ICopyConfirmationData {
    text: string;
    themeColor: string;
}

export interface ICopySectorDropData {
    Value: number
}

export interface ITreeValue {
    text: string;
    value: number;
    textLocalizedKey: string | null;
    isSelected: boolean;
}

export interface IProcessedCopyItemChange {
    item: GenericResponseBase<TreeObject[]>,
    data: ICopyToSourceData
}

export interface IApproverResponse {
    UKey: string;
    StatusId: number;
    ApproverComment: string;
}

export interface IRouteData {
    title: string;
    breadcrumb: string;
    entityId: number;
    isViewModeActive: boolean;
}

export type TreeObject = Record<string, string | object | boolean>;

export interface PasswordPolicy {
    RequireNonAlphanumeric: boolean;
    RequireUppercase: boolean;
    RequireLowercase: boolean;
    AllowedSpecialCharacters: string;
    RequireDigit: boolean;
    RequiredLength: number;
    MaximumLength: number;
}

export interface ValidationError {
    PropertyName: string;
    ErrorMessage: string;
    ErrorCode: string;
}
export interface ActivateDeactivate {
    UKey: string | null | undefined;
    Disabled: boolean;
    ReasonForChange?: string | null;
}

export type IDynamicObject = Record<string, unknown>;
export interface IPermission {
    ActionId : number,
    ActionName:string,
    EntityType:string
    EntityTypeId:number
  }
