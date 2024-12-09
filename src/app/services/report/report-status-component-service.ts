import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportStatusService } from './report-status.service';
import { ReportingStatusDto } from '../hubservice/model/report-status-dto';


@Injectable({
	providedIn: 'root'
})

export class ReportStatusComponentService {
	private destroyHubSubscribe$ = new Subject<void>();

	public notifications: ReportingStatusDto[] = [];
	constructor(private reportStatusService: ReportStatusService){}

	public startConnection(userid: string, roleGroupName: string){
		this.reportStatusService.startConnection();
		this.reportStatusService.connectionStatus$
			.pipe(takeUntil(this.destroyHubSubscribe$))
			.subscribe((status) => {
				if(status){
					this.reportStatusService.joinGroup(userid, roleGroupName);
				}
			});

		this.reportStatusService.message$
			.pipe(takeUntil(this.destroyHubSubscribe$))
			.subscribe((notification) => {
				if (notification) {
					console.log('utkarsh', notification);
					this.notifications.push(notification);
				}
			});
	}

	/* public broadcastStatus(method: string, statusBaseDto: ReportingStatusDto){
	   	this.reportStatusService.sendMessage(method, statusBaseDto);
	   } */

	// Call this method to unsubscribe manually from observables
	destroy() {
		this.destroyHubSubscribe$.next();
		this.destroyHubSubscribe$.complete();
	}
}
