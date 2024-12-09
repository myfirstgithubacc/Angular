export interface AdditionalWorkFlows {
    workFlowId: number;
    recordId: number;
    isParentWorkflow: boolean;
    IsDraft: boolean
}

export interface IDocumentControlConfigPayload {
    workFlowId: number;
    sectorId: number;
    uploadStageId: number;
}

export interface DocumentControlConfig {
    DocumentConfigId: number;
    DocumentConfigUKey: string;
    DocumentTitle: string;
    MultipleDocumentAllowed: boolean;
    AllowedExtensions: string;
    Resume: boolean;
    Mandatory: boolean;
    MaxDocumentSize: number;
}

export interface DocumentTitleDropdownList {
    DocumentConfigId: number;
    DocumentConfigUKey: string;
    DocumentTitle: string;
    MultipleDocumentAllowed: boolean;
    AllowedExtensions: string;
    Resume: boolean;
    Mandatory: boolean;
    MaxDocumentSize: number;
    Text: string;
    Value: number;
    TagEnabled: boolean;
}

export interface IUploadOrUploadedDocumentGridList {
    documentConfigurationId: number;
    id: number;
    visibleTo: number;
    file: string;
    documentTitle: string;
    documentFile: string;
    documentType: string;
    documentSize: number;
    uploadedOn: string;
    uploadedBy: string;
    documentExtension: string;
    statusId: number;
    fileNameWithExtension: string;
    isDeleteAllowed: boolean;
    encryptedFileName: string;
}

export interface IUploadedDocumentGridList {
    Id: number;
    DocumentTitle: string;
    DocumentFile: string;
    DocumentSize: number;
    DocumentName: string;
    UploadedBy: string;
    UploadedOn: string;
    IsDeleteAllowed: boolean;
    FileName: string;
    FileExtension: string;
    EncryptedFileName: string;
    StatusId: number;
    WorkflowId: number;
    DocumentConfigurationId: number;
}

export interface DMSApiRequestPayload {
    id: number;
    statusId: number;
    documentAddDto: DocumentAddDto;
}
interface DocumentAddDto {
    documentConfigurationId: number;
    fileName: string;
    fileExtension: string;
    fileNameWithExtension: string;
    fileSize: number;
    encryptedFileName: string;
}

export interface SelectFile {
    extension: string;
    name: string;
    rawFile: File;
    size: number;
    state: number;
    uid: string;
}

export interface FileSelectEvent {
    prevented: boolean;
    files: SelectFile[];
}

export interface FileUploadDetails {
    FileName: string;
    FileNameWithExtension: string;
    EncryptedFileName: string;
    EncryptedFileNameWithExtension: string;
    FileExtension: string;
    FileSize: number;
    FilePath: string;
    Message: string;
}

export interface IResponseFileUploadDetails {
    Data: FileUploadDetails;
    Message: string;
    Succeeded: boolean;
    StatusCode: number;
}
