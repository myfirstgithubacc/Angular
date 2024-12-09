export interface Entity {
    EntityTypeId: number;
    EntityType: string;
    ActionId: number;
    ActionName: string;
}

export interface EntityAction {
    EntityId: number;
    EntityActions: Entity[];
}

export interface EntityRoute {
    EntityId: number;
    Route: string;
}

export interface MenuItem {
    ItemId: number;
    ItemName: string;
    Icon: string;
    ParentId: number;
    DisplayOrder: number;
    EntityId: number;
    Route: string;
    Children: MenuItem[];
}

export interface ExceptionField {
    RoleGroupId: number;
    XrmEntityId: number;
    XrmEntityName: string;
    EntityType: string | null;
    Section: string;
    FieldName: string;
    Viewable: boolean;
    ModificationAllowed: boolean;
    MaskingAllowed: boolean;
    TypeOfMasking: string;
    MaskingCount: number;
}
export interface TabItem {
    label: string;
    isVisible: boolean;
    isSelected?: boolean;
    iconLeft:string;
    iconRight: string;
    isDisabled:boolean;
  }
