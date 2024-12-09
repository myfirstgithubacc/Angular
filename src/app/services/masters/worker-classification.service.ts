import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecordStatusChangeResponse } from '@xrm-core/models/job-category.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { WorkerClassification, WorkerClassificationData } from '@xrm-core/models/worker-classification.model';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class WorkerClassificationService extends HttpMethodService{

	saveWorkerClassification = new BehaviorSubject<boolean>(false);
	saveWorkerClassificationObs = this.saveWorkerClassification.asObservable();

	public workerClassificationData = new BehaviorSubject<any>(null);
	workerClassificationObservable = this.workerClassificationData.asObservable();

	constructor(private http: HttpClient) {
		super(http);
	}

	UpdateBulkStatus(Ukey: RecordStatusChangeResponse[]) : Observable<GenericResponseBase<ActivateDeactivate>>{
		return this.PutBulk('/wrcs/bulk-status', Ukey);
	}

	getAllWorkerClassification() : Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/wrcs');
	}

	getWorkerClassificationById(uKey: string): Observable<GenericResponseBase<WorkerClassification>> {
		return this.Get<GenericResponseBase<WorkerClassification>>('/wrcs/select-by', uKey);
	}

	addWorkerClassification(data: WorkerClassification): Observable<GenericResponseBase<WorkerClassification>> {
		return this.Post('/wrcs/save', data);
	}

	updateWorkerClassification(data: WorkerClassification):Observable<GenericResponseBase<WorkerClassification>>{
		return this.Put('/wrcs/edit', data);
	}
}
