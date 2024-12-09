import { Injectable } from '@angular/core';
import { NotificationService } from 'src/app/services/hubservice/notification.service';
import { NotificationBaseDto } from 'src/app/services/hubservice/model/notification-base-dto';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class NotificationComponentService {
	private destroyHubSubscribe$ = new Subject<void>();

	public notifications: NotificationBaseDto[] = [];

	constructor(private notificationService: NotificationService){}

	public startConnection(userid: string, roleGroupName: string){
		this.notificationService.startConnection();

		this.notificationService.connectionStatus$
			.pipe(takeUntil(this.destroyHubSubscribe$))
			.subscribe((status) => {
				if(status){
					this.notificationService.joinGroup(userid, roleGroupName);
				}
			});

		this.notificationService.message$
			.pipe(takeUntil(this.destroyHubSubscribe$))
			.subscribe((notification) => {
				if (notification) {
					this.notifications.push(notification);
				}
			});
	}

	public broadcastMessage(method: string, notificationBaseDto: NotificationBaseDto){
		this.notificationService.sendMessage(method, notificationBaseDto);
	}

	// Call this method to unsubscribe manually from observables
	destroy() {
		this.destroyHubSubscribe$.next();
		this.destroyHubSubscribe$.complete();
	}
}
