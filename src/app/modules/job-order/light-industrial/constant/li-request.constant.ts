import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { SectorDetails } from "../interface/li-request.interface";

export const DEFAULT_SECTOR_DETAILS: SectorDetails = {
	TimeUploadAsApprovedHours: false,
	SkipLIRequestProcessByMsp: false,
	AutoBroadcastForLiRequest: false,
	InitialGoLiveDate: '',
	CostAccountingCodeHaveSpecificApprovers: false,
	TenurePolicyApplicable: false,
	TenureLimitType: null,
	RequisitionTenureLimit: 0,
	SectorOrgLevelConfigDtos: [],
	IsDrugResultVisible: false,
	IsDrugScreenItemEditable: false,
	DefaultDrugResultValue: false,
	IsBackGroundCheckVisible: false,
	IsBackGroundItemEditable: false,
	DefaultBackGroundCheckValue: false,
	IsChargeHasEffectiveDate: false,
	IsChargeInReqPsr: false,
	DisplayCanSupplierContactQusInReq: false,
	IsSecurityClearance: false,
	MaskOtFieldsInSystem: false,
	MaskSubmittedMarkUpAndWageRate: false
},
	DEFAULT_SHIFT_DETAILS = {
		StartTime: "00:00:00",
		EndTime: "00:00:00",
		Sun: false,
		Mon: false,
		Tue: false,
		Wed: false,
		Thu: false,
		Fri: false,
		Sat: false,
		ShiftDifferentialMethod: "Other",
		AdderOrMultiplierValue: magicNumber.zero
	};
