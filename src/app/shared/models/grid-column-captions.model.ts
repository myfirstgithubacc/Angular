import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

type NullableString = null | string;
type UndefinedString = null | string;
type NullableNumber = null | number;
type NullableDynamicParam = null | DynamicParam[];

export interface GridColumnCaption {
    XrmGridPersistentMasterId: number;
    ColumnName: string;
    ColumnHeader: string;
    SelectedByDefault: boolean;
    IsReadOnly: boolean;
    DefaultColumnSequence: number;
    Dir: UndefinedString;
    ValueType: string;
    EntityType: NullableString;
    MapFromProperty: NullableString;
    IsLocalizedKey: boolean ;
    ColumnWidth: NullableNumber;
    DecimalPlaces: number;
    Viewable: boolean;
    MaskingAllowed: boolean;
    TypeOfMasking: NullableString;
    MaskingCount: NullableNumber;
    ControlType: NullableString;
    IsValueCommaSeparated: boolean;
    GroupName: NullableString;
    MenuId: NullableNumber;
    DynamicParam: NullableDynamicParam;
    fieldName: string;
    columnHeader: string;
    visibleByDefault: boolean;
}

