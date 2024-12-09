export interface CopyTreeModel {
    controlName: string;
    change: {
        Text: string;
        Value: string;
        TextLocalizedKey: string | null;
        IsSelected: boolean;
    }
}
