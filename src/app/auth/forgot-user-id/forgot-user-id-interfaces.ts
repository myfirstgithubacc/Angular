export interface SecurityQuestion {
    QuestionId: number;
    Question: string;
    QuestionLocalizedKey: string;
}
export interface User {
    UserName: string;
    UserNo: number;
    CultureCode: string;
    Disabled: boolean;
}

export interface ForgetUserIdResponse {
    UserName: string;
    Email: string;
}

export interface ForgotUserIdPayload {
    QuestionId: number | null;
    Answer: string;
    UserName: string;
}

export interface VerifyUserCredsPayload {
    Email: string;
    LastName: string;
    IsUserName: boolean;
}

