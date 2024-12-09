
interface StatusItem {
    title: string;
    titleDynamicParam: any[];
    item: string;
    itemDynamicParam: any[];
    cssClass: string[];
    isLinkable: boolean;
    link: string;
    linkParams: string;
}

export interface StatusData {
    items: StatusItem[];
}
