export interface FieldList{
	Id: number | string;
	LocalizedKey: string;
	Section?: string | null;
	LocalizedValue?: string;
}

export interface Recipient{
	Ukey?: string | null;
	RecipientTypeName?: string | null;
	UserTypeName?: string | null;
	RecipientTypeId?: number | null;
	UserTypeId?: number | null;
	RoleGroupId?: number | null;
	RoleNo?: number | null;
	RoleGroupName?: string | null;
	TemplateDetailId?: number | null;
	UserName?: string | null;
	UserNo?: number | null;
	CustomUserName?: string | null;
	CustomUserEmail?: string | null;
	nameForView?: string | null;
	To: boolean;
	Cc: boolean;
	Bcc: boolean;
	None: boolean;
}

export interface AttachmentsData{
	Id: number;
	DocumentType: string;
	DocumentManagemenstSystemId: number;
	DocumentConfigurationName: string;
	DocumentConfigurationId?: number | null;
	DocumentName?: string | null;
	DocumentExtension: string | null;
	Ukey: string;
	Disabled: boolean;
	CreatedBy?: string | null;
	CreatedOn?: string | Date | null;
	LastModifiedOn?: string | Date | null;
	LastModifiedBy?: string | null;
	FileName: string;
	FileExtension: string;
}

export interface Dataitem{
	Action: string;
	Category: string;
	CreatedBy: string;
	CreatedOn: Date | string;
	Disabled: boolean;
	EditTemplateforSpecificSector: string;
	LastModifiedBy?: string | null;
	LastModifiedOn?: Date | string | null;
	Priority?: string | null;
	SectorName?: string | null;
	TemplateCode?: string | null;
	TemplateName?: string | null;
	Ukey: string;
	Workflow?: string | null;
}

export interface MasterDTO{
	Id: number;
	Ukey: string;
	Code: string;
	XrmEntityId: number;
	XrmEntityName?: string| null;
	XrmEntityActionId?: number| null;
	MenuCategoryId?: number| null;
	MenuCategoryName?: string| null;
	ActionId: number;
	ActionName: string;
	Disabled: boolean;
	CreatedBy: string | number;
	CreatedOn: string | Date;
	LastModifiedBy?: string | number| null;
	LastModifiedOn?: Date | null;
	TemplateName: string;
	IsReviewLink: boolean;
}

export interface DetailsDTO {
	Id: number;
	Ukey: string;
	TemplateId: number;
	CultureName: string;
	PriorityName: string;
	HeaderFooterId: number;
	SubjectTemplateLocalizedKey: string;
	SubjectTemplate: string;
	BodyTemplateLocalizedKey: string;
	BodyTemplate: string;
	InternalBodyTemplateLocalizedKey?: string| null;
	InternalBodyTemplate?: string| null;
	Disabled: boolean;
	CreatedBy: string | number;
	CreatedOn: string | Date;
	LastModifiedBy?: string | number| null;
	LastModifiedOn?: string | Date| null;
	CultureId: number;
	PriorityId: number;
}

export interface HeaderFooterDTO{
	Id: number;
	Ukey: string;
	Disabled: boolean;
	HeaderTemplate?: string| null;
	FooterTemplate: string;
	FooterSignatureTemplate: string;
}

export interface AttachmentsDTO{
	Id?: number;
	DocumentType?: string;
	DocumentManagemenstSystemId?: number;
	DocumentConfigurationName?: string| null;
	DocumentConfigurationId?: number| null;
	DocumentName?: string;
	DocumentExtension?: string;
	Ukey?: string;
	Disabled?: boolean;
	CreatedBy?: string | number| null;
	CreatedOn?: string | Date| null;
	LastModifiedBy?: string | number| null;
	LastModifiedOn?: Date| null;
	DocumentTitleValue?: string;
	Attachment?: string;
	id?: number;
	statusId?: number;
	FileName?: string;
	FileExtension?: string;
	FileNameWithExtension?: string;
	EncryptedFileName?: string;
}

export interface RecipientDTO{
	[key: string]: Recipient[] | null;
	To: Recipient[];
	Cc: Recipient[];
	Bcc: Recipient[];
	None: Recipient[];
}

export interface EmailTemplate {
	SectorId: number | null;
	SectorName?: string| null;
	TemplateMasterGetAllDto: MasterDTO;
	TemplateDetailGetAllDto: DetailsDTO;
	TemplateAttachmentGetAllDto: AttachmentsDTO[];
	HeaderFooterGetAllDto: HeaderFooterDTO;
	TemplateRecipientGetAllDtos: RecipientDTO;
}

export interface EmailTemplatePayload{
	SectorId: number | null;
	TemplateMasterUpdateDto: {
		Ukey: string;
		TemplateName: string;
	};
	TemplateDetailUpdateDto: {
		CultureId: string;
		PriorityId: string;
		Ukey: string;
		TemplateDetailId: number;
		Subject: string;
		Body: string;
	};
	TemplateRecipientUpdateDtos: Recipient[];
	SystemDocumentAddDto: StaticAttachmentDTO[];
 	DynamicAttachmentAddDto: DynamicAttachmentDTO[];
}

export interface StaticAttachmentDTO{
	DocumentFile?: string;
	DocumentName: string;
	DocumentTitle: string;
	DocumentType: string;
	DocumentSize: string | number;
	DocumentExtension?: string;
	IsDisabled: boolean;
	DocumentManagementSystemId: null | number;
	UKey?: string;
}

export interface DynamicAttachmentDTO{
	TemplateDetailId: number;
	DocumentConfigurationId: number;
	Disabled: boolean;
	UKey?: string;
}
