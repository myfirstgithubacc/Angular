export interface AssignmentDetailsData {
		AssignmentId: number;
		AssignmentCode: string;
		AssignmentStartDate: string;
		AssignmentEndDate: string;
		JobCategoryName: string;
		StaffingAgencyName: string;
		PONo: string;
		InvoiceNo: string;
		ShiftName: string;
		SectorId: string;
		SectorName: string;
		WorkLocationId: string;
		WorkLocationName: string;
		ContractorId: string;
		ContractorName: string;
		MileageRate: number;
		AllowExpenseEntry: boolean;
		CurrencyCode: string;
		POIncurredAmount: number;
		DisplayStaffingAgency: boolean;
    	SeparateTandEPoAmount: boolean;
    	OrgLevel1Name: string;
    	OtEligibility: boolean;
    	HDRRule: string;
		LaborCategoryName: string;
		IsManualOtDt: boolean;
		AssignmentTnECostAccCode:{
		CAccountingCode: AccountingCode[];
	}[];
}

interface AccountingCode {
	CAccountingCode: string;
}
