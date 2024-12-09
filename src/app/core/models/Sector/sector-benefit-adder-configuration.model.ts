import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { SectorBenefitAdder } from './sector-benefit-adder.model';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IBenefitAdderConfigFM } from '@xrm-master/sector/add-edit/benefit-add-configurations/utils/helper';

export class SectorBenefitAdderConfiguration extends CommonSection{
	IsBenefitAdder: boolean;
	SectorBenefitAdders: SectorBenefitAdder[];

	constructor(init?: Partial<ɵTypedOrUntyped<IBenefitAdderConfigFM, ɵFormGroupRawValue<IBenefitAdderConfigFM>, any>>) {
		super();
		Object.assign(this, init);
	}
}
