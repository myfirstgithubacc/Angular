
import { ToJson } from '../responseTypes/to-json.model';
import { CostAccountingCodeApproverConfig, CostAccountingCodeApproverConfigWithoutExtras } from './cost-accounting-code-approver-config.model';
import { CostAccountingCodeList } from '../cost-accounting-code.model';
import { DatePipe } from '@angular/common';
import { DropdownModel } from '@xrm-shared/models/common.model';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class CostAccountingCodeSubmit extends ToJson {
	Id: nullableNumber;
	Disabled: boolean;
	Ukey: nullableString;
	IsAssigned:boolean;
	Sector?: DropdownModel;
	SectorId: number;
	SectorName: nullableString;
	CostAccountingName: nullableString;
	CostCode: nullableString;
	Segment1: nullableString;
	Segment2: nullableString;
	Segment3: nullableString;
	Segment4: nullableString;
	Segment5: nullableString;
	EffectiveEndDate: nullableString;
	EffectiveStartDate: nullableString;
	MinEffectiveEndDate: nullableString;
	Description: nullableString;
	CostAccountingCodeApproverConfiguration: CostAccountingCodeApproverConfig[];

	[key: string]: string | number | boolean | DropdownModel | CostAccountingCodeApproverConfig[] | undefined | null | unknown;

	constructor(init?: Partial<CostAccountingCodeSubmit>, private datePipe?: DatePipe) {
		super();

		if(init?.Sector) {
			init.SectorName = init.Sector.Text;
			init.SectorId = parseInt(init.Sector.Value);
		}
		Object.assign(this, init);
	}

	initializePayload(payload: CostAccountingCodeList, gridData: CostAccountingCodeApproverConfig[]): void {
		payload.SectorId = this.SectorId;
		payload.SectorName = this.SectorName;
		payload.Segment1 = this.Segment1;
		payload.Segment2 = this.Segment2;
		payload.Segment3 = this.Segment3;
		payload.Segment4 = this.Segment4;
		payload.Segment5 = this.Segment5;
		payload.Description = this.Description;
		payload.EffectiveStartDate = this.datePipe?.transform(this.EffectiveStartDate, 'MM/dd/YYYY');
		payload.EffectiveEndDate = this.datePipe?.transform(this.EffectiveEndDate, 'MM/dd/YYYY');
		payload.costAccountingCodeApproverConfigurations =
		this.mapCostAccountingCodeApprover(gridData) as CostAccountingCodeApproverConfig[];
	}

	private mapCostAccountingCodeApprover(data: CostAccountingCodeApproverConfig[]): CostAccountingCodeApproverConfigWithoutExtras[] {
		return data.map(({ Disabled, isDelete, ...rest }) =>
			rest);
	}
}
