export interface SubmittalResponse {
  RequestDetail: RequestDetail;
  CandidatesList: Candidate[];
}

export interface SelectedCandidate {
  SubmittalIds: number[];
}

export interface RequestDetail {
  RequestId: number;
  RequestCode: string;
  StBillRate: number;
  InterviewAvailability: string | null;
  StartAvailabililty: string | null;
  WorkHistory: string | null;
  SkillsRequired: string;
  SkillsPrefered: string;
  WorkExperienceRequired: string;
  WorkExperiencePrefered: string;
  EducationRequired: string;
  EducationPrefered: string;
}

export interface Candidate {
  SubmittalId: number;
  SubmittalCode: string;
  CandidateName: string;
  StBillRate: number;
  InterviewAvailability: string;
  StartAvailabililty: string;
  WorkHistory: string;
  SkillsRequired: string;
  SkillsPrefered: string;
  WorkExperienceRequired: string;
  WorkExperiencePrefered: string;
  EducationRequired: string;
  EducationPrefered: string;
  SectorId: number;
  StatusId: number;
  Status: string;
  Documents: Document[];
}

export interface Document {
  Id: number;
  DocumentTitle: string;
  DocumentName: string;
  DocumentFile: string;
  DocumentSize: number;
  UploadedBy: string;
  UploadedOn: string;
  IsDeleteAllowed: boolean;
  FileName: string;
  FileExtension: string;
  EncryptedFileName: string;
  StatusId: number;
  WorkflowId: number;
  IsDraft: boolean;
  RecordId: number;
  DocumentConfigurationId: number;
}

export interface ActionResponse {
  SubmittalAction: number;
  ActionData: DeclineActionData | ForwardActionData | ReceiveActionData;
}

export interface DeclineActionData {
  SubmittalId: number;
  DeclineReasonId: number;
  AddToDnr: boolean;
  DnrOptions: number| null;
  Comment: string;
}

export interface ForwardActionData {
   SubmittalIds: number[];
}

export interface ReceiveActionData {
 SubmittalIds: number[];
}
