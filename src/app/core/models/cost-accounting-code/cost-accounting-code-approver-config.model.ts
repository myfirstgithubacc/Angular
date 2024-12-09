type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export interface CostAccountingCodeApproverConfig {
	CostAccountingCodeApproverId: nullableNumber;
	ShiftId: nullableNumber;
	ShiftName: nullableString;
	ApproverId: nullableNumber;
	ApproverName: nullableString;
	AltApproverId: nullableNumber;
	AltApproverName: nullableString;
	Disabled: boolean;
	isDelete: nullableString;
}

export type CostAccountingCodeApproverConfigWithoutExtras = Omit<CostAccountingCodeApproverConfig, 'Disabled' | 'isDelete'>;
