export interface UserData{
    UserName:string;
    FullName:string;
}

export interface ResetPasswordPayload {
    uId: string;
    newPassword: string;
    confirmPassword: string;
    token: string;
}
