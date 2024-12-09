export interface MessageBoard {
    Base64String: string | null;
    CreatedBy: string;
    CreatedOn: string;
    CultureId: number;
    Disabled: boolean;
    DisplayOrder: number;
    DmsId: string | null;
    EffectiveFromDate: string;
    ExpiryDate: string;
    Id: number;
    IsDeleted: boolean;
    IsForNewUsers: boolean;
    LanguageName: string | null;
    LastModifiedBy: string | null;
    LastModifiedOn: string | null;
    MessageAltTextLocalizedKey: string | null;
    MessageBoardContentType: string;
    MessageBoardContentTypeId: number;
    MessageBoardType: string;
    MessageBoardTypeId: number;
    MessageLocalizedKey: string;
    TextContent: string;
    Ukey: string;
}

export interface Configuration {
    ConfigurationType: string;
    ConfigurationValue: string;
    Id: number;
}


