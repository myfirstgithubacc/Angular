export interface IinterviewDetailUkey {
    InterviewId: number;
    UKey: string;
    InterviewCode: string;
    SubmittalCode: string;
    CandidateName: string;
    RecordId: number;
    InterviewAvailability: string;
    StartAvailability: string;
    InterviewRound: number;
    AdditionalInterviewDetails: string;
    Status: string;
    StatusId: number;
    InterviewDetails: InterviewDetail[];
    InterviewComments: InterviewComment[];
    SubmittalUkey: string;
}

export interface InterviewDetail {
    SlotType: string;
    SlotNumber: number;
    InterviewMode: string;
    InterviewDate: string;
    StartTime: string;
    EndTime: string;
    TimeZone: string;
    Availabilty: boolean;
    Confirmed: boolean;
}

export interface InterviewComment {
    Comment: string;
    CommentedBy: string;
    CreatedOn: string;
}

export interface ICommonInterviewCardData {
    CandidateName: string;
    SubmittalCode: string;
    InterviewCode?: string;
    Status?: string;
    Ukey?: string;
  }

export interface IListDataItem {
    InterviewId: number;
    Ukey: string;
    InterviewCode: string;
    SubmittalCode: string;
    CandidateName: string;
    SectorName: string;
    WorkLocationName: string;
    JobCategoryName: string;
    EntityId: number;
    InterviewRound: number;
    InterviewMode: string;
    InterviewDate: string | null;
    Status: string;
    StatusId: number;
    Disabled: boolean;
    IsAllowedToEdit: boolean;
    IsAllowedToConfirm: boolean;
    IsAllowedToAvailable: boolean;
    CreatedBy: string;
    CreatedOn: string;
    LastModifiedBy: string | null;
    ModifiedOn: string | null;
}


export enum CardStatus{
    Name = 'Name',
    SubmittalID = 'Submittal ID',
    InterviewID = 'Interview ID',
    Status = 'Status',
    Alternate = 'Alternate',
    Schedule = 'Schedule'
  }
