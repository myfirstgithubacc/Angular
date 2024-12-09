import { LocalizationService } from "@xrm-shared/services/Localization/localization.service";
import { ICandidateData, ICandidateLiRequestDetailsGetDto, ILiRequestShiftGetAllDto } from "../interface/review-candidate.interface";

export class CandidateResData {
	RequestId: number;
	UKey: string;
	CandidateId: number;
	CandidateCode: string;
	StatusId: number;
	Status: string;
	CandidatePoolCode: string;
	FullName: string;
	StaffingAgencyId: number;
	PhoneNumber: string | null;
	BidRate: number;
	BaseWageRate: number;
	ActualShiftWageRate: number;
	OtWageRate: number;
	DtWageRate: number;
	MspStBillRate: number;
	MspOtBillRate: number;
	MspDtBillRate: number;
	VendorStRate: number;
	VendorOtRate: number;
	VendorDtRate: number;
	NteRate: number;
	CandidateDeclineReasonId: number | null;
	DeclineReason: string;
	Comment: string | null;
	IsAllowedToReview: boolean;
	candidateLiRequestDetailsGetDto: ICandidateLiRequestDetailsGetDto;
	liRequestShiftGetAllDto: ILiRequestShiftGetAllDto;
	CandidatePoolId: number;
	FirstName: string;
	MiddleName: string | null;
	LastName: string;
	UId: string;
	SubmittedMarkup: number;
	ScheduleStartDate: string;
	ReviewerComments:[{
		ReviewedOnDate: string;
		ApproverLabel: string;
		ApproverComments: string;
	}];

	constructor(data: ICandidateData, localizationService: LocalizationService) {
		Object.assign(this, data);
		this.transformDates(localizationService);

	}

	private transformDates(localizationService: LocalizationService): void{
		this.candidateLiRequestDetailsGetDto.StartDate =localizationService.TransformDate(this.candidateLiRequestDetailsGetDto.StartDate);
		this.candidateLiRequestDetailsGetDto.EndDate =localizationService.TransformDate(this.candidateLiRequestDetailsGetDto.EndDate);
	}

}

