import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpMethodService } from './http-method.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';

@Injectable({
	providedIn: 'root'
})
export class BenefitAdderService extends HttpMethodService {

	constructor(private http: HttpClient) {
		super(http);
	}

	public getReqLibraryBenefitAdder(id: number) {
		return this.GetAll<GenericResponseBase<IBenefitData[]>>(`/rlib/select-benefit-adder/${id}`);
	}
	public getBenefitAdderByEntity(entityId: number, recordId: number) {
		return this.GetAll<GenericResponseBase<IBenefitData[]>>(`/benifit-adder-details/${entityId}/${recordId}`);
	}

}
