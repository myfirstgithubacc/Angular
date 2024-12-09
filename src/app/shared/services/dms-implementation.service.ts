
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpMethodService } from './http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AdditionalWorkFlows, DocumentControlConfig, FileUploadDetails, IDocumentControlConfigPayload, IUploadedDocumentGridList } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';

@Injectable({
	providedIn: 'root'
})

export class DmsImplementationService extends HttpMethodService {
	private dmsDataSubject = new BehaviorSubject<DocumentControlConfig[]>([]);
	dmsData$ = this.dmsDataSubject.asObservable();
	private uploadedRecordsSource = new BehaviorSubject<IUploadedDocumentGridList[]>([]);
	uploadedRecords$ = this.uploadedRecordsSource.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	public loadDataToGenerateControls(data: IDocumentControlConfigPayload): Observable<GenericResponseBase<DocumentControlConfig[]>> {
		return this.GetAll((`/dms/DmsControlsConfig/${data.workFlowId}/${data.sectorId}/${data.uploadStageId}`));
	}

	public getAllUploadedDmsRecord(data: AdditionalWorkFlows[]): Observable<GenericResponseBase<IUploadedDocumentGridList[]>> {
		return this.Post(`/dms/save-DmsRecord`, data);
	}

	public downloadFile(filePath: string, fileExtension: string) {
		const response = this.http.post(`${this.baseUrl}/dms/DmsRecord`, {FileName: `${filePath}.${fileExtension}`}, { responseType: 'blob', withCredentials: true });
		return response;
	}

	public uploadDocument(data: FormData): Observable<GenericResponseBase<FileUploadDetails>> {
		return this.Post(`/dms/document`, data);
	}

	public updateDmsData(data: DocumentControlConfig[]) {
		this.dmsDataSubject.next(data);
	}

	public getDmsData(): DocumentControlConfig[] {
		return this.dmsDataSubject.getValue();
	}

	public updateUploadedRecords(records: IUploadedDocumentGridList[]): void {
		this.uploadedRecordsSource.next(records);
	}
}
