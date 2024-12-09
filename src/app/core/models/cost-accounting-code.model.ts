import { CostAccountingCodeApproverConfig } from './cost-accounting-code/cost-accounting-code-approver-config.model';
import { ToJson } from './responseTypes/to-json.model';

type nullableString = string | undefined | null;
export class CostAccountingCodeList extends ToJson {

	Id: number | undefined | null;
	UKey: nullableString;
	CostAccountingName: nullableString;
	CostCode: nullableString;
	SectorName: nullableString;
	SectorId: number | undefined | null;
	CostCenter: nullableString;
	Segment1: nullableString;
	Segment2: nullableString;
	Segment3: nullableString;
	Segment4: nullableString;
	Segment5: nullableString;
	EffectiveStartDate: nullableString;
	EffectiveEndDate: nullableString;
	Description: nullableString;
	CreatedBy: nullableString;
	CreatedOn: Date | undefined | null;
	LastModifiedBy: nullableString;
	LastModifiedOn: Date | undefined | null;
	Disabled: boolean | undefined | null;
	Status: nullableString;
	reasonForChange: nullableString;
	costAccountingCodeUKey: nullableString;
	costAccountingCodeApproverConfigurations: CostAccountingCodeApproverConfig[];
	constructor(init?: Partial<CostAccountingCodeList>) {
		super();
		Object.assign(this, init);
	}
}

