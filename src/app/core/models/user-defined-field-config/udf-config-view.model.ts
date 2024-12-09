import { IAppliesToSectorList, IBaseScreen, IDropDownList, IDropdown, IPredefined } from "./udf-config-common.model";

export interface IFieldType {
    UdfConfigId: number;
    StandardFieldName: string;
    Code: string;
    LabelText: string;
    FieldTypeName: string;
    BaseScreenName: string;
    LabelLocalizedKey: string;
    HelpTextLocalizedKey: string;
    IsNumeric: boolean;
    MinLength: number | null;
    MaxLength: number | null;
    DefaultValue: string;
    PredefinedListId: number | null;
    MinDate: string | null;
    MaxDate: string | null;
    IsMandatory: boolean;
    IsViewOnly: boolean;
    IsStoreAsEncrypeted: boolean;
    IsAppliesToAllSector: boolean;
    Disabled: boolean;
    TooltipText: string;
    AppliesToAllSectorList: IAppliesToSectorList[];
    VisibleToList: IDropDownList[];
    EditingAllowedByList: IDropDownList[];
    PredefinedList: IPredefined[] | null;
    VisibleIsNumeric: boolean;
    VisibleIsDate: boolean;
    VisiblePredefinedPickList: boolean;
    VisibleMinOption: boolean;
    VisibleMaxOption: boolean;
    VisibleDefaultValue: boolean;
  }
export interface IListViewRow {
    ControlName: string;
    ControlType: string;
    DefaultValue: string | boolean | IDropdown[];
    Data?: [];
    Span: number;
    IsReadOnly: boolean;
    OffLabel?: string;
    OnLabel?: string;
    IsDisable?: boolean;
  }

export interface IUdfData {
    UdfConfigId: number;
    BaseScreenTypeId: number;
    FieldTypeId: number;
    ActionTypeId: number;
    FieldType: IFieldType;
    BaseScreen: IBaseScreen;
    FieldTypeToSet: null;
    BaseScreenToSet: null;
}
export interface IRequestBody {
  udfConfigId: number;
  udfConfigUkey: string;
  fieldTypeId: number;
  actionTypeId: number;
  baseScreenId: number;
}
