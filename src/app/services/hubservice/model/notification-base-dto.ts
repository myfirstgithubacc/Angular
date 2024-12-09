import { NotificationTypes } from "../hubenums/notification-type.enum";

export interface NotificationBaseDto {
    //  Unique identifier for the notification
    id: string;

    // Title of the notification
    title: string;

    // Message content of the notification
    message: string;

    // Type of the notification, e.g., Info, Warning, Error
    notificationType: NotificationTypes;

    // Date and time the notification was created
    createdAt: Date;

    // The ID of the user or system who sent the notification
    senderId: string;

    // The ID of the recipient (optional if it's a broadcast)
    recipientId?: string[];

    // List of roles the notification is meant for (Client/MSP/Supplier/Worker)
    targetGroups?: string[];

    // Any additional data or metadata
    additionalData?: object;
  }
