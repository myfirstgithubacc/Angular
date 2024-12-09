
import { UdfData } from '@xrm-master/requisition-library/constant/rate-enum';
import { ToJson } from '../models/responseTypes/to-json.model';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';

export class LaborCategory extends ToJson {
	UKey: string;
	SectorId?: number;
	SectorName: string;
	LaborCategoryName: string;
	LaborCategoryCode?: string;
	MaxProfilesPerStaffing: number;
	MspStaffingSpecialistId: number;
	MaxProfileTotal: number;
	PayrollMarkUp: number;
	IsExpressLaborCategory: boolean;
	CandidateHiredBy: string;
	IsPreScreeningRequired: boolean;
	IsAlternatePricingModel: boolean;
	PricingModel: string;
	MarkUpFlag: string;
	OtRateType: string | undefined;
	CostEstimationType: string;
	BillRateModel: string;
	MaxProfilesPerRequest?:number;
	Active: boolean;
	LastModifiedBy?: string;
	LastModifiedOn: Date;
	MspProgramManagerId: number;
	Disabled: boolean;
	BillRateValidation: string;
	ReasonForChange: string;
	UdfFieldRecords: IPreparedUdfPayloadData[];
	LaborCatType: number;

	constructor(init?: Partial<LaborCategory>) {
		super();
		Object.assign(this, init);
	}
}
