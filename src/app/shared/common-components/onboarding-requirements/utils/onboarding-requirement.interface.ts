export interface IOnboardingPayloadData {
    pendingResult: boolean;
    drugScreenId: number;
    drugScreenResultId: number;
    drugResultDate: string | null;
    backgroundCheckId: number;
    backgroundResultDate: string | null;
    complianceOnboardingItemDto: ComplianceOnboardingItemDto[];
}

export interface ComplianceOnboardingItemDto {
    sectorComplianceItemId: number;
    complianceCheckValue: boolean;
    isVisibleToClient: boolean;
}

