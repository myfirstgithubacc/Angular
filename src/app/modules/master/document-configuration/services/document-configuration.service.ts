import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { Observable, Subject} from 'rxjs';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { ICommonComponentData, IDmsType, IDocumentConfiguration, IDocumentConfigurationResponse, IDocumentWorkflow } from '@xrm-core/models/document-configuration/document-configuration.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
@Injectable({
	providedIn: 'root'
})
export class DocumentConfigurationService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public sharedDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.sharedDataSubject.asObservable();

	public getDocumentConfiguration(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/dms');
	}

	public addDocumentConfiguration(data: IDocumentConfiguration) {
		return this.Post('/dms/Save', data);
	}

	public getDocumentConfigurationById(Ukey: string): Observable<GenericResponseBase<IDocumentConfigurationResponse>> {
		return this.Get<GenericResponseBase<IDocumentConfigurationResponse>>(`/dms-ukey`, Ukey);
	}

	public updateDocumentConfiguration(data: IDocumentConfiguration): Observable<ApiResponse> {
		return this.Put('/dms/edit', data);
	}

	public updateDocumentConfigurationStatus(data: IRecordStatusChangePayload[]): Observable<GenericResponseBase<null>> {
		return this.PutBulk('/dms/bulk-status', data);
	}

	public getDocumentWorkflowAndVisibleTo(): Observable<IDocumentWorkflow> {
		return this.GetAll<IDocumentWorkflow>('/dms/select-aggr-dms');
	}

	public selectDMSTypeAndAllowedExt(): Observable<IDmsType> {
		return this.GetAll<IDmsType>('/dms/get-aggr-dms');
	}
}
