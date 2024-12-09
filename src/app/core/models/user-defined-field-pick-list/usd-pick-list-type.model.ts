interface IActionItemList {
    icon: string;
    color: string;
    title: string;
    fn: (dataItem: IUdfPickListData) => void;
}

export interface IStatusItemList {
    Status: boolean | string;
    Items: IActionItemList[];
}

export interface IUdfPickListItem {
    Id: number;
    UKey: string;
    UdfPickListTypeId?: number;
    Name: string;
    Disabled: boolean;
    Status: boolean;
}

export interface IUdfPickListData {
    UKey: string;
    Id: number;
    Name: string;
    Disabled: boolean;
    Status: string;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string;
    LastModifiedOn: string;
    UdfPickListGetDtoWithTypes: IUdfPickListItem[];
}

export interface IColumnOption {
    fieldName: string;
    columnHeader: string;
    visibleByDefault: boolean;
}

export interface IPickListItem {
    Sr: number;
    Id: number;
    UKey?: string;
    Name: string;
    Disabled: boolean;
    Status: string;
}

export interface IStatusChangePayload {
    uKey?: string;
    disabled?: boolean
}

export interface IUdfPickListUpdateDto {
    udfItemId?: number;
    name: string;
    status: boolean;
}

export interface IPickListAddEditPayload {
    name: string;
    udfPickListUpdateDtos?: IUdfPickListUpdateDto[];
    userDefinedPickListDtos?: IUdfPickListUpdateDto[];
    UKey?: string
}

export interface IActionItem {
    icon: string;
    color: string;
    title: string;
    fn: (dataItem: IPickListItem) => void;
}

export interface IStatusItem {
    Status: boolean | string;
    Items: IActionItem[];
}

export interface IRouteParams {
    id?: string
}
