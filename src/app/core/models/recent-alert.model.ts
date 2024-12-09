import { AttachmentsData } from "@xrm-master/email-template/constants/models";

export interface EmailList extends AttachmentsData{
    Body: string;
    Cc: string;
    EmailLogId: number;
    EmailLogUkey: string;
    From: string;
    IsRead: boolean;
    ReceivedOn: Date;
    Subject: string;
    To: string;
    emailAttachments: null | AttachmentsData[];
  }


