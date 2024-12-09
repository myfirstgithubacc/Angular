import { IList } from "@xrm-shared/Utilities/list.interface";

type NullableString = string | null;
type NullableNumber = number | null;
type OptionalNullableNumber = number | undefined | null;
type OptionalNullableString = string | undefined | null;

export interface IPredefinedListItem {
    Id?: number;
    Name?: string;
    Value?: number;
    Text?: string;
}

export interface IUdfConfig {
    UdfConfigId: number;
    StandardFieldName: string;
    FieldLableText: string;
    FieldHelpText: string;
    FieldLabelLocalizedKey: string;
    FieldHelpTextLocalizedKey: string;
    FieldTypeId: number;
    FieldType: string;
    IsNumeric: boolean;
    MinLength: number;
    MaxLength: number;
    MinDate: NullableString;
    MaxDate: NullableString;
    DefaultValue: NullableString;
    StoreDataEncrypted: boolean;
    IsReadOnly: boolean;
    IsMandatory: boolean;
    IsVisible: boolean;
    IsDeleted: boolean;
    UdfId: number;
    UdfTextValue: NullableString;
    UdfIntegerValue: NullableNumber;
    UdfNumericValue: NullableNumber;
    UdfDateValue: NullableString;
    PredefinedListId: NullableNumber;
    IsEditable: boolean;
    ParentId: number;
    PredefinedList?: IList[];
    PredefinedListItems: IPredefinedListItem[];
}
export interface IPreparedUdfPayloadData {
    udfId: number;
    xrmEntityId: OptionalNullableNumber;
    sectorId: OptionalNullableNumber;
    recordId: OptionalNullableNumber;
    recordUKey: OptionalNullableString;
    udfConfigId: number;
    udfIntegerValue: NullableNumber;
    udfNumericValue: NullableNumber;
    udfTextValue: NullableString;
    udfDateValue: NullableString;
    udfFieldTypeId: number
}

export interface IUdfConfigPayloadData {
    entityId: OptionalNullableNumber;
    sectorId: OptionalNullableNumber;
    recordId: OptionalNullableNumber;
    recordUKey: OptionalNullableString;
    IsShowNewUdfConfigs: boolean;
    IsDraft: boolean;
    editMode: number;
    parentsInfos: IParentsInfos[];
}

export interface IParentsInfos {
    parentXrmEntityId: number
    parentRecordId: number;
}

export interface IPreparedDataParams {
    item: IUdfConfig;
    integerData: number | null;
    decimalData: number | null;
    textVal: string | null;
    dateVal: string | null;
}

