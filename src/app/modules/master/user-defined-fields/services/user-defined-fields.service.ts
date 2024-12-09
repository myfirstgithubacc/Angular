import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDefaultUdfDataResponse, IFieldTypes, IGetBaseScreenPayload, ILinkedScreenResponse, IUdfConfiguration, IUdfDefaultDataPayload } from '@xrm-core/models/user-defined-field-config/udf-config-addedit.model';
import { ICommonComponentData } from '@xrm-core/models/user-defined-field-config/udf-config-common.model';
import { IRequestBody, IUdfData } from '@xrm-core/models/user-defined-field-config/udf-config-view.model';
import { IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserDefinedFieldsService extends HttpMethodService {

	public saveUDFConfig = new BehaviorSubject<boolean>(false);
	public sharedDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.sharedDataSubject.asObservable();
	constructor(private http: HttpClient) {
		super(http);
	}

	public GetAllUDFs() {
		return this.GetAll<ApiResponse>("/udfc");
	}

	public UpdateStatus(data: IRecordStatusChangePayload[]): Observable<ApiResponseBase> {
		const response = this.PutBulk(`/udfc/bulk-status`, data);
		return response as Observable<ApiResponseBase>;
	}

	public GetUDFTypeDD() {
		return this.GetAll<GenericResponseBase<IFieldTypes[]>>("/udfplt/select");
	}

	public GetUDFTypeById(data: IUdfDefaultDataPayload): Observable<GenericResponseBase<IDefaultUdfDataResponse>> {
		const response = this.Post('/udfc/field-type-configuration', data);

		return response as Observable<GenericResponseBase<IDefaultUdfDataResponse>>;
	}

	public GetUDFPreloadData(data: IRequestBody): Observable<GenericResponseBase<IUdfData>> {
		return this.Post('/udfc/select-udf', data);
	}

	public SubmitUdfConfiguration(data: IUdfConfiguration) {
		return this.Post('/udfc/save-config', data);
	}

	public updateUdfConfiguration(uKey: string, data: IUdfConfiguration): Observable<ApiResponse> {
		data.UKey = uKey;
		return this.Put(`/udfc-ukey`, data);
	}

	public GetBaseScreensDD() {
		return this.GetAll<GenericResponseBase<IFieldTypes[]>>("/udfc/select-config-by/3");
	}

	public GetBaseScreenConfig(data: IGetBaseScreenPayload): Observable<GenericResponseBase<ILinkedScreenResponse>> {
		return this.Post(`/udfc/linked-screen-configuration`, data);
	}

	public GetConfigRecord(data: number) {
		const response =
            this.Get<GenericResponseBase<boolean>>(`/udfc-record-check`, data);
		return response;
	}

}
