import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
export class SectorShiftConfiguration extends CommonSection{
	ShiftdifferentialMethod: string;
	ShiftdifferentialMethodName: string;
	ShiftTimeMandatoryForProfessional: boolean;
	ShiftTimeMandatoryForLi: boolean;

	constructor(init?: Partial<SectorShiftConfiguration>) {
		super();
		Object.assign(this, init);
	}
}
