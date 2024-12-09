import { Injectable } from '@angular/core';
import { NotificationRef, NotificationService } from '@progress/kendo-angular-notification';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterComponent } from '@xrm-shared/widgets/toaster/toaster.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotifierService {
	public statusCode = new BehaviorSubject<any>(null);
	statusCode1 = this.statusCode.asObservable();
	
	constructor(private notificationService: NotificationService) { }

	public success(message: string): void {
		this.notificationService.show({
			content: `${message}`,
			cssClass: "button-notification",
			animation: { type: "slide", duration: 400 },
			position: { horizontal: "center", vertical: "top" },
			type: { style: "success", icon: true },
			hideAfter: 5000
		});
	}

	public error(message: string): void {
	}
	public warning(message: string): void {
		this.notificationService.show({
			content: `${message}`,
			cssClass: "button-notification",
			animation: { type: "slide", duration: 400 },
			position: { horizontal: "center", vertical: "top" },
			type: { style: "warning", icon: true },
			hideAfter: 5000
		});
	}

	public info(message: string): void {
		this.notificationService.show({
			content: `${message}`,
			cssClass: 'button-notification',
			animation: { type: 'slide', duration: 400 },
			position: { horizontal: 'right', vertical: 'top' },
			type: { style: 'info', icon: true },
			hideAfter: 3000
		});
	}

	public newSuccess(toastOption: ToastOptions, text: string) {
		let cssClass = '';
		if (toastOption == ToastOptions.Success)
			cssClass = 'alert__success';
		if (toastOption == ToastOptions.Error)
			cssClass = 'alert__danger';
		if (toastOption == ToastOptions.Warning)
			cssClass = 'alert__warning';
		if (toastOption == ToastOptions.Information)
			cssClass = 'alert__info';

		const notificationRef: NotificationRef = this.notificationService.show({
			content: ToasterComponent,
			position: { horizontal: "center", vertical: "top" },
			closable: true
		});
	}

}
