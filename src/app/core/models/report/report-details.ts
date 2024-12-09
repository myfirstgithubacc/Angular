export interface ReportDetails {
    RunReportId: string;
    UKey: string;
    ReportName: string;
    RequestedDate: string;
    StatusId: number;
    Status: string;
    FileName: string;
    FilePath: string;
    FileTypeId: number;
    FileSize: number;
    DmsFieldRecord: {
    Id: number;
    StatusId: number;
    DocumentAddDto: DocumentAddDto;
    };
  }

export interface DocumentAddDto {
    DocumentConfigurationId: number;
    FileName: string;
    FileExtension: string;
    FileNameWithExtension: string;
    EncryptedFileName: string | null;
    FileSize: number;
    ContentType: string | null;
    File: null;
    FileData: null;
    ChunkNumber: number;
    TotalChunks: number;
    DocumentProcessingType: number;
    UKey?: string;
}
export interface dropdownEditor{
  field: number,
  hasForeignKey: boolean,
  list: any,
  isForceFilter: boolean | null,
  isLookupLoaded: boolean,
  fieldType:string
}

