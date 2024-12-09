export interface ICommonDeclineData {
    DeclineReasonID: number;
    Disabled: boolean;
    DeclineReasonCode: string;
  }

export interface CanDecRsnData {
	CandidateDeclineReason: string;
	Code: string;
	CreatedBy: string | null;
	CreatedOn: string;
	Disabled: boolean;
	Id: number;
	LastModifiedBy: string | null;
	LastModifiedOn: string | null;
	LiRequest: boolean;
	ProfessionalRequest: boolean;
	RfxSowRequest: boolean;
	SectorId: number;
	candidateTypeId: number | string;
	SectorName: string;
	UKey: string;
  }

export interface RFXSectorDetails {
    SectorName: string;
    IsRfxSowRequired: boolean;
    DefaultPoForRecruitment: string;
    PoTypeId: number;
    BroadCastInterval: number;
}
