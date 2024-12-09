import { Injectable } from '@angular/core';
import { SignalrBaseService } from './signalr-base.service';
import { EventNotificationDto } from './model/event-notification-dto';

@Injectable({
	providedIn: 'root'
})
export class EventNotificationService extends SignalrBaseService<EventNotificationDto> {

	constructor() {
		super('eventNotificationHub', 'Event Notification');
	}

	protected registerHandlers() {
		this.hubConnection.on('notifyEvent', (message: EventNotificationDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('notifyEventError', (message: EventNotificationDto) => {
			this.onMessageReceived(message);
		});
	}

	// Send event notifications to server
	public sendEventNotification(method: string, message: EventNotificationDto) {
		this.sendMessage(method, message);
	}
}
