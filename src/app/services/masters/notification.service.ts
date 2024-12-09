import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { EmailList } from '@xrm-core/models/recent-alert.model';
@Injectable({
	providedIn: 'root'
})

export class NotificationService extends HttpMethodService{

	public recentNotification = new BehaviorSubject<boolean>(false);

	public recentNotificationObs =
		this.recentNotification.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	getFiveRecentEmails() : Observable<GenericResponseBase<EmailList[]>>{
		return this.GetAll<GenericResponseBase<EmailList[]>>("/emailnot-fiverec/getfiverecent");
	}

	fetchEmailNotificationByUkey(EmailUkey: string): Observable<GenericResponseBase<EmailList>> {
		return this.Get<GenericResponseBase<EmailList>>('/emailnot-ukey', EmailUkey);
	}

}
