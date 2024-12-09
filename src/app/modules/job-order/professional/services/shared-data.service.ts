import { Injectable } from '@angular/core';
import { ILoadMoreColumnOptions } from '@xrm-shared/models/load-more.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { BehaviorSubject } from 'rxjs';
import { IAssignmentRequirement, IRootObject } from '../interface/preview.interface';
import { ShiftDetails } from '../../light-industrial/interface/li-request.interface';
import { IFieldOnChange } from '../interface/shared-data.interface';

@Injectable({
	providedIn: 'root'
})
export class SharedDataService {
	private formData: IRootObject;
	private estimationCost: number = magicNumber.zero;
	private assignmentData: IAssignmentRequirement;
	private shiftDetailsSubject = new BehaviorSubject<ShiftDetails | null>(null);
	public shiftDetails$ = this.shiftDetailsSubject.asObservable();
	private estimatedCostSource = new BehaviorSubject<number>(magicNumber.zero);
	estimatedCost$ = this.estimatedCostSource.asObservable();
	private billRateSource = new BehaviorSubject<number>(magicNumber.zero);
	public billRate$ = this.billRateSource.asObservable();
  
	private idsSource = new BehaviorSubject<{
		sectorId: number,
		locationId: number,
		laborCategoryId: number,
		jobCategoryId: number,
		reqLibraryId: number,
		orgLevel1Id: number,
		orgLevel2Id: number,
		orgLevel3Id: number,
		orgLevel4Id: number,
		primaryManager: number
		reasonForRequestId: number
	}>({
		sectorId: Number(magicNumber.zero),
		locationId: Number(magicNumber.zero),
		laborCategoryId: Number(magicNumber.zero),
		jobCategoryId: Number(magicNumber.zero),
		reqLibraryId: Number(magicNumber.zero),
		orgLevel1Id: Number(magicNumber.zero),
		orgLevel2Id: Number(magicNumber.zero),
		orgLevel3Id: Number(magicNumber.zero),
		orgLevel4Id: Number(magicNumber.zero),
		primaryManager: Number(magicNumber.zero),
		reasonForRequestId: Number(magicNumber.zero)
	});
	public currentIds$ = this.idsSource.asObservable();
	private updateFieldDetails = new BehaviorSubject<{
		sectorDetails: null,
		locationDetails: null,
		reqLibraryDetails: null,
		laborCategoryDetails: null,
		jobCategoryDetails: null
	}>({
		sectorDetails: null,
		locationDetails: null,
		reqLibraryDetails: null,
		laborCategoryDetails: null,
		jobCategoryDetails: null
	});

	public jobDetailsFormPersist: boolean = false;
	public assignmentDetailsFormPersist: boolean = false;
	public financeDetailsFormPersist: boolean = false;
	public approverOtherDetailsFormPersist: boolean = false;
	public nonEditableField: boolean = false;
	public isEntityBenefitAdderPatched: boolean = false;
	public currentFieldDetails$ = this.updateFieldDetails.asObservable();

	public fieldOnChange: IFieldOnChange = {
		location: {
			isShiftReset: false,
			isHDRReset: false,
			isBillRateReset: false
		},
		reqManager: {
			isApproverReset: false
		},
		org1: {
			isApproverReset: false
		},
		labourCategory: {
			billRate: false,
			estimatedCost: false
		},
		jobCategory: {
			description: false,
			isWageReset: false,
			isBillReset: false
		},
		shift: {
			isBillRateReset: false,
			estimatedCost: false
		}
	};

	public updateIds(ids: {
		sectorId: number,
		locationId: number,
		laborCategoryId: number,
		jobCategoryId: number,
		reqLibraryId: number,
		orgLevel1Id: number,
		orgLevel2Id: number,
		orgLevel3Id: number,
		orgLevel4Id: number,
		primaryManager: number
		reasonForRequestId: number
	}) {
		this.idsSource.next(ids);
	}

	public updateFieldDetailsData(data: any) {
		this.updateFieldDetails.next(data);
	}

	public setFormData(data: IRootObject) {
		this.formData = data;
	}

	public getFormData() {
		return this.formData;
	}

	public updateEstimatedCost(cost: number): void {
		this.estimatedCostSource.next(cost);
	}

	public setBillRate(rate: number) {
		this.billRateSource.next(rate);
	  }

	public updateShiftDetails(shiftDetails: ShiftDetails) {
		this.shiftDetailsSubject.next(shiftDetails);
	}

	public loadMoreColumnOptions: ILoadMoreColumnOptions[] = [
		{ columnHeader: 'IsPreIdentifiedRequest', fieldName: 'IsPreIdentifiedRequest' },
		{ columnHeader: 'Sector', fieldName: 'SectorName' },
		{ columnHeader: 'ContractorsWorkLocation', fieldName: 'WorkLocationName' },
		{ columnHeader: 'LaborCategory', fieldName: 'LaborCategoryName' },
		{ columnHeader: 'JobCategory', fieldName: 'JobCategoryName' },
		{ columnHeader: 'Bill Rate (NTE or Target) (USD)', fieldName: 'NteBillRate' },
		{ columnHeader: 'PositionDescription', fieldName: 'PositionDescription' },
		{ columnHeader: 'Skills Required', fieldName: 'SkillsRequired' },
		{ columnHeader: 'Education Required', fieldName: 'EducationRequired' },
		{ columnHeader: 'Experience Required', fieldName: 'ExperienceRequired' }
	];

	public setDefaultStartDate(): Date {
		const zero = Number(magicNumber.zero),
			currentDate = new Date();
		currentDate.setHours(zero, zero, zero, zero);
		return currentDate;
	}

	public resetServiceData(): void {
		this.nonEditableField = false;
		this.isEntityBenefitAdderPatched = false;
		this.jobDetailsFormPersist = false;
		this.assignmentDetailsFormPersist = false;
		this.financeDetailsFormPersist = false;
		this.approverOtherDetailsFormPersist = false;
		this.estimatedCostSource.next(magicNumber.zero);
		this.idsSource.next({
			sectorId: magicNumber.zero,
			locationId: magicNumber.zero,
			laborCategoryId: magicNumber.zero,
			jobCategoryId: magicNumber.zero,
			reqLibraryId: magicNumber.zero,
			orgLevel1Id: magicNumber.zero,
			orgLevel2Id: magicNumber.zero,
			orgLevel3Id: magicNumber.zero,
			orgLevel4Id: magicNumber.zero,
			primaryManager: magicNumber.zero,
			reasonForRequestId: magicNumber.zero
		});
		this.updateFieldDetails.next({
			sectorDetails: null,
			locationDetails: null,
			reqLibraryDetails: null,
			laborCategoryDetails: null,
			jobCategoryDetails: null
		});
		this.shiftDetailsSubject.next(null);
	}

}

