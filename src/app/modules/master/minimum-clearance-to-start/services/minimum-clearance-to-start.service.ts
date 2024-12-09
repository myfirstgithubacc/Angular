import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { IClearanceCopyData, ICommonComponentData, IMinimumClearanceDetails } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IRecordStatusChangePayload, ISectorDetailById, TreeObject } from '@xrm-shared/models/common.model';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { MinimumClearanceToStart } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.model';

@Injectable({
	providedIn: 'root'
})
export class MinimumClearanceToStartService extends HttpMethodService {
	constructor(private http: HttpClient) {
		super(http);
	}

	public sharedDataSubject = new Subject<ICommonComponentData>();
	public sharedDataObservable = this.sharedDataSubject.asObservable();

	public getDropdownRecordsBySectorId(id: number): Observable<GenericResponseBase<TreeObject[]>> {
		return this.GetAll<GenericResponseBase<TreeObject[]>>(`/scl/select-sectorid/${id}`);
	}

	public copyToAnotherSector(data: IClearanceCopyData): Observable<ApiResponseBase> {
		return this.Post('/scl/copy', data);
	}

	public getMinimumClearanceToStart(): Observable<GenericResponseBase<IMinimumClearanceDetails>> {
		return this.GetAll<GenericResponseBase<IMinimumClearanceDetails>>('/scl');
	}

	public getMinimumClearanceToStartByUKey(Ukey: string): Observable<GenericResponseBase<IMinimumClearanceDetails>> {
		return this.Get<GenericResponseBase<IMinimumClearanceDetails>>(`/scl-ukey`, Ukey);
	}

	public addMinimumClearanceToStart(data: MinimumClearanceToStart): Observable<ApiResponseBase> {
		return this.Post('/scl/save', data);
	}

	public updateMinimumClearanceToStartStatus(data: IRecordStatusChangePayload[]): Observable<ApiResponseBase> {
		return this.PutBulk('/scl/bulk-status', data);
	}

	public updateMinimumClearanceToStart(data: MinimumClearanceToStart): Observable<ApiResponseBase> {
		return this.Put('/scl-ukey', data);
	}

	public getSectorBasicDetailById(id: number): Observable<GenericResponseBase<ISectorDetailById>> {
		return this.Get<GenericResponseBase<ISectorDetailById>>('/sector/SectorBasicDetailById', id);
	}
}
