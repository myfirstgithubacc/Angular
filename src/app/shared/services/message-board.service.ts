import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpMethodService } from './http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Configuration, MessageBoard } from 'src/app/modules/extras/landing-page/constants/message-board.model';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MessageBoardService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	getMessages(id: number): Observable<GenericResponseBase<MessageBoard[]>>{
		return this.Get<GenericResponseBase<MessageBoard[]>>('/msgbrd', id);
	}

	getLoginMessages(): Observable<GenericResponseBase<MessageBoard[]>>{
		return this.GetAll<GenericResponseBase<MessageBoard[]>>('/msgbrd-lgn/loginmsgbrd');
	}

	getTransitionTime(): Observable<GenericResponseBase<Configuration[]>>{
		return this.GetAll<GenericResponseBase<Configuration[]>>('/system-config');
	}

}
