import { INumberDropdown } from "@xrm-shared/models/common.model";

interface IParentInfo {
    ParentId: number;
    ParentName: string;
    IsMultipleSelectionAllowed: boolean;
}

export interface IBaseRowData {
    Id: number;
    Sr: number;
    RowNo: number;
    ControlName: string;
    ControlType: string;
    DefaultValue: [];
    Data: INumberDropdown[];
    Span: number;
    IsDisable: boolean;
    ColumnName: string;
    EntityLevel: number;
    LinkedScreenId: number;
    MultipleSelectionAllowedAtSameLevel: boolean;
}

export interface IRowData extends IBaseRowData {
    LinkedParent: IParentInfo[];
    MultipleParentAllowed: boolean;
}
