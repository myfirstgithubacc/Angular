import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpMethodService } from '../../../services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IUdfConfig, IUdfConfigPayloadData } from '../Interface/udf-common.model';


@Injectable({
	providedIn: 'root'
})
export class UdfImplementationService extends HttpMethodService {
	private udfDataSubject = new BehaviorSubject<IUdfConfig[]>([]);
	udfData$ = this.udfDataSubject.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	public loadDataToGenerateControls(data: IUdfConfigPayloadData): Observable<GenericResponseBase<IUdfConfig[]>> {
		const response = this.Post(`/udf/udfcontrols`, data);

		return response as Observable<GenericResponseBase<IUdfConfig[]>>;
	}

	updateUdfData(data: IUdfConfig[]) {
		this.udfDataSubject.next(data);
	}

	getUdfData(): IUdfConfig[] {
		return this.udfDataSubject.getValue();
	}

}
