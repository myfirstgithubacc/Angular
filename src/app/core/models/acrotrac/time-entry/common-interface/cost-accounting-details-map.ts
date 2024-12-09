
interface CostAccountingDetails {
    CostAccountingCodeId: number;
    HasChargeEffectiveDate: boolean;
    EffectiveStartDate: string | null;
    EffectiveEndDate: string | null;
}

export type CostAccountingDetailsMap = Record<number, CostAccountingDetails>;
