export interface StatusItemList {
    Text: string;
    Value: any;
}

export interface CommonButtonSet {
    status: any;
    items: any[];
  }

export interface StatusItem {
    title: any;
    titleDynamicParam?: any;
    cssClass?: any;
    item: any;
    itemDynamicParam?: any;
    isLinkable?: any;
    isStatusEditable?: any;
}
export interface StatusData {
    items: any[];
  }