import { Injectable } from '@angular/core';
import { SignalrBaseService } from './signalr-base.service';
import { NotificationBaseDto } from 'src/app/services/hubservice/model/notification-base-dto';

@Injectable({
	providedIn: 'root'
})
export class NotificationService extends SignalrBaseService<NotificationBaseDto> {

	constructor() {
		super('notificationUserHub', 'Notification');
	}

	// Register specific handlers for Notification from Server
	protected registerHandlers() {
		this.hubConnection.on('notifyAll', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('notifyAllWithSender', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('notifyAllInGroup', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('notifyAllInGroupWithSender', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('notifyUsers', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('notifyBell', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('refreshSignal', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});

		this.hubConnection.on('revokeAll', (message: NotificationBaseDto) => {
			this.onMessageReceived(message);
		});
	}

	// Send notifications to Server
	public sendNotification(method: string, message: NotificationBaseDto) {
		this.sendMessage(method, message);
	}
}
