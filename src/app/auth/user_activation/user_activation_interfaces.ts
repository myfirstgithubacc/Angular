import { ValidationError } from "@xrm-shared/models/common.model";
import { StepLabels } from "./user_activation_enums.enum";

export interface SecurityQuestion {
    QuestionId: number;
    Question: string;
    QuestionLocalizedKey: string;
    Answer: string;
    Text: string;
    Value: number;
}

export interface UserData {
    UserName: string;
    UserNo: number;
    CultureCode: string;
    Disabled: boolean;
}

export interface Step {
    label: StepLabels;
}

export interface QuestionAnswer{
    secQuestionId:SecurityQuestion|undefined,
    answer:string
}

export interface CustomResponse{
    Data?: [] | null;
    ValidationMessages?:ValidationError[],
    StatusCode: number;
    Succeeded: boolean;
    Message: string;
}

export interface ActivateUserPayload {
    userId: string;
    newPassword: string | null;
    confirmPassword: string | null;
    userSecQuestionsAddDtos:[];
}

export interface StringCount {
    [key: string]: number;
  }

export interface VerifyUserPayload {
    Email: string;
    LastName: string;
    IsUserName: boolean;
    UKey: string;
}

export interface ValidatePasswordPayload {
    userId: string;
    newPassword: string | null;
}
