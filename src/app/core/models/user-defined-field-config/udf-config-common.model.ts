export interface IUpdateStatus {
    uKey: string;
    disabled: boolean;
}

export interface IDropDownList {
    Id: number;
    Name: string;
    Text: string | null;
}

export interface IPickListTypeItem {
    Id: number;
    Name: string;
  }

export interface IDropdown {
    Value: number;
    Text: string;
}

export interface IAppliesToSectorList {
    SectorId: number
    SectorName: string
    Text?: string;
}

export interface IPredefined {
    Id: number;
    Name: string;
    PickListTypeItems: IPickListTypeItem[];
}

export interface IBaseScreen {
    BaseScreenType: number;
    LinkedScreen: ILinkedScreen[];
}

export interface ILinkedParent {
    ParentId: number;
    ParentName: string;
    IsMultipleSelectionAllowed: boolean;
  }

export interface ILinkedScreen {
    Id: number;
    LinkedScreenId: number;
    LinkedScreenName: string;
    AppliesTo: boolean;
    MultipleParentAllowed: boolean;
    MultipleSelectionAllowedAtSameLevel: boolean;
    EntityLevel: number;
    LinkedParent: ILinkedParent[];
    VisibleTo: IDropDownList[];
    EditingAllowedBy: IDropDownList[];
}

export interface ICommonComponentData {
    UdfConfigId: number;
    Disabled: boolean;
    UdfConfigCode: string;
}
