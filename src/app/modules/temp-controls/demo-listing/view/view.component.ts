import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';

import { NotificationComponentService } from 'src/app/services/hubservice/notification-component-service';
import { NotificationBaseDto } from 'src/app/services/hubservice/model/notification-base-dto';
import { NotificationTypes } from 'src/app/services/hubservice/hubenums/notification-type.enum';
import { NotificationMethods } from 'src/app/services/hubservice/hubenums/notification-method.enum';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss']
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy{

	constructor(private notificationComponentService: NotificationComponentService) { }

	ngOnInit(){
		this.notificationComponentService.startConnection('Rishi', 'MSP');
	}

	notifyMessage(groupName: string, message: string) {
		const notificationBaseDto: NotificationBaseDto = {
			id: '1',
			message: 'Request #101 has been created.',
			title: 'Request Creation',
			notificationType: NotificationTypes.Info,
			createdAt: new Date(),
			senderId: 'Rishi',
			recipientId: ['UserId'],
			targetGroups: ['MSP']
		};

		this.notificationComponentService.broadcastMessage(NotificationMethods.SendToAllInGroup, notificationBaseDto);
	}

	ngOnDestroy() {
		// Call destroy when the component is destroyed to clean up the subscription
		this.notificationComponentService.destroy();
	  }
}
