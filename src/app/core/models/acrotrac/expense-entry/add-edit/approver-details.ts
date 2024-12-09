export interface ApprovalDetail {
    TransactionId: number;
    TransactionDetailId: number;
    ApprovalConfigId: number;
    ApprovalConfigDetailId: number;
    ApproverTypeId: number;
    ApproverLabel: string;
    ApproverLevel: number;
    SubApproverLevel: number;
    Items: Item[];
}

interface Item {
    Text: string;
    Value: string;
    TextLocalizedKey: string | null;
    IsSelected: boolean;
}
