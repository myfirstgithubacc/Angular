import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { BulkDataRecord } from '@xrm-master/bulk-data-management/constants/model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class BulkDataManagementService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public backFromUploadHistory : BehaviorSubject<{isBackFromUploadHistory: boolean, uploadHistoryId: BulkDataRecord} | boolean | null>
		= new BehaviorSubject<{isBackFromUploadHistory: boolean, uploadHistoryId: BulkDataRecord} | boolean | null>(null);

	public isBackFromUploadHistory = this.backFromUploadHistory.asObservable();

	public uploaded = new BehaviorSubject<any>(null);

	public isUploaded = this.uploaded.asObservable();

	public isuploadBtn = new BehaviorSubject<any>(false);
	isuploadBtnObs = this.isuploadBtn.asObservable();

	getBulkDataManagement(){
		return this.GetAll<ApiResponse>('/blk-upld-trsn/get-trsn-lst');
	}

	addBulkDataManagement(payload: any){
		return this.Post('/bulk-data-management', payload);
	}

	getTemplateList(){
		return this.GetAll<ApiResponse>('/blk-upld/get-upld-dt-lst');
	}

	downloadTemplate(payload: any){

		return this.http.get(
			`${this.baseUrl}/blk-upld/gnrt-tmplt/${payload.Ukey}/${payload.EntityId}/${payload.SectorId}/${payload.IsWithData}`,
			{ responseType: 'blob', withCredentials: true, observe: 'response' }
		);
	}

	uploadTemplate(payload: any){
		return this.Post('/blk-upld/upd-tmplt', payload);
	}

	public downloadRecords(payload: any) {
		const response = this.http.post(`${this.baseUrl}/docconfig`, {Id: payload}, { responseType: 'blob', withCredentials: true, observe: 'response' });
		return response;
	}

	public cancelTransaction(transactionId : number)
	{
		return this.Post(`/trans/cancel-bulkupload-trans/${transactionId}`, {});
	}
}


