import { Injectable } from '@angular/core';
import { ApiResponse } from 'src/app/core/models/responseTypes/api-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { CandidatePoolAddEdit } from '@xrm-core/models/candidate-pool/add-edit/candidate-pool-add-edit.model';
import { CandidatePoolPreferableLocation } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-location.model';
import { CandidatePoolPreferableAssignmentType } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-assign.model';
import { CandidatePoolPreferableSector } from '@xrm-core/models/candidate-pool/candidate-pool-preferable-sector.model';
import { DropdownModel, IDropdownItem } from '@xrm-shared/models/common.model';

@Injectable({
	providedIn: 'root'
})
export class CandidatePoolService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public holdData = new BehaviorSubject<{ 'Disabled': boolean, 'Code': string, 'Id': number } | null>(null);
	getData = this.holdData.asObservable();

	getCandidatePool(): Observable<ApiResponse> {
		return this.GetAll<ApiResponse>('/cand-pool');
	}

	getAllCandidatePoolByUkey(UKey: string): Observable<GenericResponseBase<CandidatePoolAddEdit>> {
		return this.Get<GenericResponseBase<CandidatePoolAddEdit>>('/cand-pool-ukey', UKey);
	}

	updateStatus(data: ActivateDeactivate[]): Observable<GenericResponseBase<ActivateDeactivate>> {
		return this.PutBulk('/cand-pool/bulk-status', data);
	}

	getDrugScreenResultData(TypeName: string): Observable<GenericResponseBase<IDropdownItem[]>> {
		return this.Get<GenericResponseBase<IDropdownItem[]>>('/StaticType/StaticTypesDropdownWithId', TypeName);
	}

	getPreferredAssignmentType(TypeName: string): Observable<GenericResponseBase<IDropdownItem[]>> {
		return this.Get<GenericResponseBase<IDropdownItem[]>>('/StaticType/StaticTypesDropdownWithId', TypeName);
	}

	getExistingSectorsWithLocationDropdownList(): Observable<{ddlSector:GenericResponseBase<DropdownModel[]>,
		ddlSectorLocation:GenericResponseBase<CandidatePoolPreferableLocation[]>}> {
		return this.GetAll('/cand-pool/select-aggr');
	}

	addCandidatePool(data: CandidatePoolAddEdit): Observable<GenericResponseBase<CandidatePoolAddEdit>> {
		data = this.removeInvalidEntries(data);
		return this.Post('/cand-pool/save', data);
	}

	public updateCandidatePool(data: CandidatePoolAddEdit): Observable<GenericResponseBase<CandidatePoolAddEdit>> {
		data = this.removeInvalidEntries(data);
		return this.Put('/cand-pool/edit', data);
	}

	private removeInvalidEntries(data: CandidatePoolAddEdit): CandidatePoolAddEdit {
		data.PreferredAssignmentTypes = data.PreferredAssignmentTypes.filter((row: CandidatePoolPreferableAssignmentType) =>
			row.AssignmentTypeId !== Number(magicNumber.zero));
		data.PreferredLocations = data.PreferredLocations.filter((row: CandidatePoolPreferableLocation) =>
			row.LocationId !== Number(magicNumber.zero));
		data.PreferredSectors = data.PreferredSectors.filter((row: CandidatePoolPreferableSector) =>
			row.SectorId !== Number(magicNumber.zero));
		return data;
	}

	getDropDownDataOfShift(sectorId: number) {
		return this.GetAll<ApiResponse>(`/sft/sfts-by-sectid/${sectorId}`);
	}

}
