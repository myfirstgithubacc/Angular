export interface SecurityQuestion {
    QuestionId: number;
    Question: string;
    QuestionLocalizedKey: string;
}

export interface VerifyAnswerPayload {
    questionId: number | null;
    answer: string;
    userName: string;
}
