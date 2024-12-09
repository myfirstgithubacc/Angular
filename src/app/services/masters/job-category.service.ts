import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { JobCategory, RecordStatusChangeResponse, dropdownModel } from '@xrm-core/models/job-category.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';

@Injectable({
	providedIn: 'root'
})

export class JobCategoryService extends HttpMethodService {

	public jobCategoryData = new BehaviorSubject<any>(null);
	jobCategoryObsevable = this.jobCategoryData.asObservable();

	private recordStatusSource = new BehaviorSubject<string>('Active');
	public recordStatus$ = this.recordStatusSource.asObservable();

	setRecordStatus(status: string) {
		this.recordStatusSource.next(status);
	}

	constructor(private http: HttpClient) {
		super(http);
	}

	getJobCategory(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/jcat');
	}

	getJobCategoryById(Ukey: string): Observable<GenericResponseBase<JobCategory>> {
		return this.Get<GenericResponseBase<JobCategory>>(`/jcat-ukey`, Ukey);
	}

	addJobCategory(data: JobCategory): Observable<GenericResponseBase<JobCategory>> {
		return this.Post('/jcat/save', data);
	}

	deleteJobCategory(Ukey: RecordStatusChangeResponse[]): Observable<GenericResponseBase<ActivateDeactivate>> {
		return this.PutBulk('/jcat/bulk-status', Ukey);
	}

	updateJobCategory(data: JobCategory): Observable<GenericResponseBase<JobCategory>> {
		return this.Put('/jcat/edit', data);
	}

	getLaborDrp(id: string): Observable<GenericResponseBase<dropdownModel[]>> {
		return this.Get('/lcat/select-by-sectorid', id);
	}

}
