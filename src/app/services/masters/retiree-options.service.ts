import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate, ICommonRetireeData, IRetireeOption, SaveEditModeApiResponse } from '@xrm-master/retiree-options/constant/retiree.enum';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
	providedIn: 'root'
})
export class RetireeoptionsService extends HttpMethodService {
	public saveRetiree = new BehaviorSubject<boolean>(false);
	public _saveRetiree = this.saveRetiree.asObservable();
	public retireeDataSubject = new Subject<ICommonRetireeData>();
	public sharedDataObservable = this.retireeDataSubject.asObservable();

	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(private http: HttpClient) {
		super(http);
	}


	getSectorDropDownList() {
		return this.GetAll<ApiResponse>('/sector/select');
	}
	public getAllRetireeOption(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/rtopn');
	}

	public addRetireeOption(data: IRetireeOption): Observable<GenericResponseBase<SaveEditModeApiResponse>> {
		return this.Post('/rtopn/save', data);
	}

	public getRetireeOptionId(Ukey: string): Observable<ApiResponse> {
		return this.Get<ApiResponse>(`/rtopn-ukey`, Ukey);
	}

	public updateRetireeOption(data: IRetireeOption): Observable<GenericResponseBase<SaveEditModeApiResponse>> {
		return this.Put(`/rtopn/edit`, data);
	}

	public updateRetireeOptionStatus(ukey: ActivateDeactivate[]): Observable<ApiResponse> {
		return this.PutBulk('/rtopn/bulk-status', ukey);
	}


}
