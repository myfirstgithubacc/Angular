import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { RequestPositionDetailGetAllDto, RequestShiftDetailGetAllDto, ShiftDetail } from '../interface/li-request.interface';

export class LiRequestDetails {
	AlternateTimeApproverName: string = "";
	CostAccountingCode: string = "";
	CreatedDate: string = "";
	DefaultCostCenterDescription: string = "";
	HourDistributionRuleName: string = "";
	EstimatedCost: number = magicNumber.zero;
	NoOfContractorFilled: number = magicNumber.zero;
	OrgLevel1Id: string = "";
	OrgLevel2Id: string = "";
	OrgLevel3Id: string = "";
	OrgLevel4Id: string = "";
	Orglevel1Name: string = "";
	Orglevel2Name: string = "";
	Orglevel3Name: string = "";
	Orglevel4Name: string = "";
	LaborCategoryId: string = "";
	LaborCategoryName: string = "";
	ManagerComments: string = "";
	ManagerCommentsToStaffingAgency: string = "";
	ReasonForRequestId: string = "";
	ReasonForRequestName: string = "";
	RequestId: string = "";
	RequestCode: string = "";
	LocationAddress: string = "";
	RequestingManagerName: string = "";
	StartDate: string = "";
	StartDateNoLaterThan: string | null = null;
	IsBackgrounCheckRequired: boolean = false;
	IsDrugTestRequired: boolean = false;
	IsManualBroadcast: boolean = false;
	IsManualBroadcastRequired: boolean = false;
	IsMspProcessRequired: boolean = false;
	IsReviewActionRequired: boolean = false;
	JobCategoryId: string = "";
	JobCategoryName: string = "";
	PrimaryTimeApproverName: string = "";
	PositionNeeded: number = magicNumber.zero;
	PositionDescription: string = "";
	RequestShiftDetailGetAllDto: ShiftDetail;
	RequestPositionDetailGetAllDtos: RequestPositionDetailGetAllDto;
	LastTbdSequenceNo: number = magicNumber.zero;
	ManualBroadCast: string = "";
	SectorId: string = "";
	SectorName: string = "";
	StatusId: string = "";
	SubmissionDate: string = "";
	WorkLocationId: string = "";
	WorkLocationName: string = "";

	constructor(data: LiRequestDetails, private localizationService: LocalizationService) {
		Object.assign(this, data);
		this.StartDate = this.localizationService.TransformDate(data.StartDate);
		this.StartDateNoLaterThan = data.StartDateNoLaterThan
			? this.localizationService.TransformDate(data.StartDateNoLaterThan)
			: null;
		this.ManualBroadCast = this.IsManualBroadcast
			? "Yes"
			: "No";
		this.SubmissionDate = this.localizationService.TransformDate(data.CreatedDate);
	}
}
