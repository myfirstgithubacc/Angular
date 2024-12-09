import { Injectable } from '@angular/core';
import { NotificationBaseDto } from 'src/app/services/hubservice/model/notification-base-dto';
import { SignalrBaseService } from '../hubservice/signalr-base.service';
import { ReportingStatusDto } from '../hubservice/model/report-status-dto';

@Injectable({
	providedIn: 'root'
})

export class ReportStatusService extends SignalrBaseService<ReportingStatusDto>{

	constructor() {
		super('reportUserHub', 'Report');
	}
	protected registerHandlers() {
		this.hubConnection.on('onReceiveReportStatus', (message: ReportingStatusDto) => {
			this.onMessageReceived(message);
		});

	}
	/* public sendNotification(method: string, message: NotificationBaseDto) {
	   	this.sendMessage(method, message);
	   } */
}
