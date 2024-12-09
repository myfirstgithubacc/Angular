export interface TreeView {
    treeData: {
        text: string;
        items: {
            text: string;
            value?: string;
            textlocalizedkey?: string | null;
            isselected: boolean;
        }[];
    }[];
    label: string;
    tooltipVisible: boolean;
    textField: string;
    tooltipTitle: string;
    isRequired: boolean;
    treeViewType: string;
}
