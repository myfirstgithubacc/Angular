import { NotificationType } from '../hubenums/notification-type.enum';

export interface EventNotificationDto {
    // Unique identifier for the event
    id: string;

    // Title or name of the event
    eventTitle: string;

    // Message content for the event notification
    message: string;

    // Type of event (Info, Warning, Error, etc.)
    eventType: NotificationType;

    // The date and time of the event
    eventDate: Date;

    // The ID of the sender
    senderId: string;

    // Optional recipient ID (for targeted notifications)
    recipientId?: string;

    // Additional data related to the event
    metadata?: object;
}
