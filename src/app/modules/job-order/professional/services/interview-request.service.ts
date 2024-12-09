import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
import { ICommonInterviewCardData, IinterviewDetailUkey } from '../interface/interview.interface';

@Injectable({
	providedIn: 'root'
})

export class InterviewRequestService extends HttpMethodService {

	public interviewDataSubject = new Subject<ICommonInterviewCardData>();
	public sharedDataObservable = this.interviewDataSubject.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	public getInterviewDetailsbyUkey(Ukey:string): Observable<GenericResponseBase<IinterviewDetailUkey>>{
		return this.Get<GenericResponseBase<IinterviewDetailUkey>>('/intwreq-ukey', Ukey);
	}

	public getSubmittalDetailsbyUkey(Ukey:string): Observable<GenericResponseBase<any>>{
		return this.Get<GenericResponseBase<any>>('/cnsub-intwreq-ukey', Ukey);
	}
}

