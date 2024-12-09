import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { Observable, Subject } from 'rxjs';
import { markupParam, markupUpdate, StaffingTier, updateSuccessResponse } from '../enum/enum';
import { FormGroup } from '@angular/forms';

@Injectable({
	providedIn: 'root'
})
export class MarkupService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public addForm = new Subject<FormGroup>();
	public isEditMode = new Subject<boolean>();
	public isCopy = new Subject<boolean>();
	public updateSuccess = new Subject<updateSuccessResponse>();


	public getMarkupData(data: markupParam) {
		return this.Post('/staf/paged-markups', data);
	}


	public updateStaffingMarkup(data: markupUpdate): Observable<ApiResponse> {
		return this.Put(`/staf/markup-edit`, data);
	}

	public getDropdownRecordsforMarkup() {
		return this.GetAll<GenericResponseBase<StaffingTier[]>>('/staf/select-staffing-markup');
	}

	public getDefaultOtDtValFromSector(sectorId: number){
		return this.GetAll<ApiResponse>(`/sector/ot-dt/${sectorId}`);
	}

}
