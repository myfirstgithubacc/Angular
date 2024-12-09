import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export interface GenericResponseBase<T> extends UserProfile {
    Data?: T | null;
    ValidationMessages?: [];
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
    Token?:string;
  }

export interface GenericResponseBaseWithValidationMessage<T> extends UserProfile {
    Data?: T | null;
    ValidationMessages?: ValidationMessage[];
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
    Token?:string;
  }
export class ValidationMessage {
	PropertyName: string;
	ErrorMessage: string;
	ErrorCode: string;
}
  interface UserProfile {
    ClientId?: number;
    ClientUkey?: string;
    UserNo?: number;
    UserUkey?: string;
    UserRoles?: number[];
    UserFullName?: string;
    ClientName?: string;
    CultureCode?: string;
    DateFormat?: string;
    TimeFormat?: string;
    CountryId?: number;
    LanguageId?: number;
    RoleGroupId?: number;
    ClientCultureMappingId?: number;
    RefreshToken?: string;
    TokenGeneratedOn?: string;
    TokenExpiresInMinutes?: number;
    RefreshTokenExpiresInMinutes?: number;
    IsAcknowledge?: boolean;
    ProfileDmsId?: string;
    AcknowledgementKey?: string;
    ClientFolderName?: string;
    LandingPageUrl?: string;
    TimeZoneCode?: string;
    OffSetMinutes?: number;
    UserDisplayName?: string;
}

export function isSuccessfulResponse<T>(response: GenericResponseBase<T>): response is GenericResponseBase<T> & { Data: T } {
	return response.Succeeded && response.Data !== null;
}

export function hasValidationMessages<T>(response: GenericResponseBase<T>): response is GenericResponseBase<T> & { ValidationMessages: string[] } {
	return !response.Succeeded && response.ValidationMessages !== undefined && response.ValidationMessages.length > Number(magicNumber.zero);
}


export function hasData<T>(response: GenericResponseBase<T[]>): response is GenericResponseBase<T> & { Data: T[] } {
	return response.Data !== undefined && response.Data !== null && response.Data.length > Number(magicNumber.zero);
}

