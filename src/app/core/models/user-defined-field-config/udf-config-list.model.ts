export interface IUserDefinedFieldData {
    UKey: string;
    Id: number;
    Name: string;
    Code: string;
    LabelText: string;
    HelpText: string;
    UserDefinedFieldTypeName: string;
    UserDefinedFieldTypeId: string;
    Numeric: boolean;
    MinLength: number;
    MaxLength: number;
    MinDate: string | null;
    MaxDate: string | null;
    PredefinedListId: string | null;
    DefaultValue: string;
    XrmEntityName: string;
    ViewOnly: string;
    Mandatory: string;
    StoreAsEncrypted: boolean;
    CascadeModification: boolean;
    DisplayOrder: number | null;
    AppliesToAllSectors: boolean;
    LabelLocalizedKey: string;
    HelpTextLocalizedKey: string;
    Disabled: boolean;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string | null;
    LastModifiedOn: string | null;
    Sectors: string;
    VisibleTos: string;
    EditingAllowedBys: string;
}

