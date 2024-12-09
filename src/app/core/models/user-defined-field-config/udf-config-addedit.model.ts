import { FormArray } from "@angular/forms";
import { IBaseScreen, IDropDownList, IDropdown, ILinkedParent, IPickListTypeItem } from "./udf-config-common.model";

type NullableString = string | null;
type NullableNumber = number | null;

export interface IFieldTypes {
    Value: string;
    Text: string;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
}

export interface IPredefinedList {
    Value: number;
    Text: string;
    Items: IPickListTypeItem[];
}

export interface ISelectedSector {
    id: number | undefined;
    text?: string;
}

export interface IOvertimeHour {
    Text: string;
    Value: boolean;
}

export interface IAppliesToAllSectorList {
    SectorId?: number
    SectorName?: string
    sectorId?: number;
    sectorName?: string;
}

export interface ISectorDropdown {
    Text: string;
    Value: number;
    IsSelected: boolean;
    Index: string;
}

export interface ILinkedScreens {
    id: number,
    linkedEntityId: number,
    appliesTo: boolean,
    multipleParentAllowed: boolean,
    parentXrmEntityDto: { parentXrmEntityId: number }[],
    visibleToListDto: { userGroupId: number }[],
    editingAllowedByListDto: { userGroupId: number }[]
}

export interface ILinkedScreensOnEdit {
    Id: number;
    LinkedScreenId?: number;
    LinkedScreenName?: string;
    AppliesTo?: boolean;
    MultipleParentAllowed?: boolean;
    MultipleSelectionAllowedAtSameLevel?: boolean;
    EntityLevel?: number;
    LinkedParent?: ILinkedParent[];
    VisibleTo?: IDropDownList[];
    EditingAllowedBy?: IDropDownList[];
}

export interface IListViewRows {
    Id?: number;
    Sr?: number;
    RowNo?: number;
    ControlName: string;
    ControlType: 'label' | 'switch' | 'dropdown' | 'multiselect_dropdown';
    DefaultValue: string | boolean | IDropdown | IDropdown[] | null | undefined;
    Span: number;
    IsReadOnly?: boolean;
    IsDisable?: boolean;
    LinkedScreenId?: number;
    ColumnName?: string;
    EntityLevel?: number;
    MultipleSelectionAllowedAtSameLevel?: boolean;
    LinkedScreenName?: string;
    LinkedParent?: ILinkedParent[];
    MultipleParentAllowed?: boolean;
    Data?: IDropdown[];
}

export interface IUdfConfiguration {
    fieldTypeId: number;
    labelText: string;
    isNumeric: boolean;
    minLength: NullableNumber;
    maxLength: NullableNumber;
    defaultValue: number | NullableString;
    predefinedListId: NullableNumber;
    minDate: NullableString;
    maxDate: NullableString;
    isMandatory: boolean;
    isViewOnly: boolean;
    isStoreAsEncrypeted: boolean;
    isAppliesToAllSectors: boolean;
    tooltipText: string;
    visibleToList: { userGroupId: number }[];
    editingAllowedByList: { userGroupId: number }[];
    baseScreenTypeId: string;
    linkedScreens: ILinkedScreens[];
    appliesToAllSectorList?: IAppliesToAllSectorList[];
    UKey?: string;
}

export interface IDefaultUdfData {
    UdfConfigId?: number;
    StandardFieldName?: string;
    Code?: string | null;
    LabelText?: string | null;
    FieldTypeName?: string | null;
    BaseScreenName?: string | null;
    LabelLocalizedKey?: string | null;
    HelpTextLocalizedKey?: string | null;
    IsNumeric?: boolean;
    MinLength?: number;
    MaxLength?: number;
    DefaultValue?: string;
    PredefinedListId?: number | null;
    MinDate?: string | null;
    MaxDate?: string | null;
    IsMandatory?: boolean;
    IsViewOnly?: boolean;
    IsStoreAsEncrypeted?: boolean;
    IsAppliesToAllSector?: boolean;
    Disabled?: boolean;
    TooltipText?: string;
    AppliesToAllSectorList?: null;
    VisibleToList?: null;
    EditingAllowedByList?: null;
    PredefinedList?: null | [];
    VisibleIsNumeric?: boolean;
    VisibleIsDate?: boolean;
    VisiblePredefinedPickList?: boolean;
    VisibleMinOption?: boolean;
    VisibleMaxOption?: boolean;
    VisibleDefaultValue?: boolean;
}

export interface IDefaultUdfDataResponse {
    FieldType: IDefaultUdfData;
}

export interface IFormStructure {
    CellInfo: IListViewRows;
    FormArray: any;
    Value: boolean;
}

export interface IListViewData {
    CellInfo: IListViewRows[];
    formArray: FormArray;
    value: DynamicObject;
}

export type DynamicObject = Record<string, any>;

export interface IListViewRowParams {
    item: IListViewRows;
    isAppliesTo: boolean;
    dataItem: IFormStructure;
    rowNo: number;
}

interface IDataItem {
    Text: string;
    Value: string;
    IsSelected: boolean;
    Index: string;
}

interface IItem {
    dataItem: IDataItem;
    index: string;
}

export interface ITreeNode {
    children: ITreeNode[];
    item: IItem;
    parent: ITreeNode | null;
    checked: boolean;
}

export interface IUdfDataById {
    UdfConfigId: number;
    BaseScreenTypeId: number;
    FieldTypeId: number;
    ActionTypeId: number;
    FieldType: IFieldType;
    BaseScreen: IBaseScreen;
    FieldTypeToSet: null;
    BaseScreenToSet: null;
}
interface IFieldType {
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
    AppliesToAllSectorList: IAppliesToAllSectorList[];
    VisibleToList: IDropDownList[];
    EditingAllowedByList: IDropDownList[];
    PredefinedList: IPredefinedList[] | null;
    VisibleIsNumeric: boolean;
    VisibleIsDate: boolean;
    VisiblePredefinedPickList: boolean;
    VisibleMinOption: boolean;
    VisibleMaxOption: boolean;
    VisibleDefaultValue: boolean;
}

export interface ILinkedScreenResponse {
    BaseScreen: IBaseScreen;
}

export interface IUdfDefaultDataPayload {
    udfConfigId: number;
    fieldTypeId: string;
    actionTypeId: number;
}

export interface IGetBaseScreenPayload {
    udfConfigId: number;
    baseScreenId: string;
    uKey: string;
    actionTypeId: number;
}
