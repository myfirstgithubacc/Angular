import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
type nullableNumber = number | undefined | null;
export class SectorAssignmentExtensionAndOtherConfiguration extends CommonSection{
	AllowProcessExtensionAdjustment: boolean;
	ExtRateIncreaseAllowed: boolean;
	AllowSelectionPayRateFillLiRequest: boolean;
	ChangeRateWithoutEffectiveDate: boolean;
	IsTrainingRequired: boolean;
	OffBoardInterval: nullableNumber;
	OffBoardIntervalLi: nullableNumber;
	AllowMspAdjustSupplierMarkupInPsr: boolean;

	constructor(init?: Partial<SectorAssignmentExtensionAndOtherConfiguration>) {
		super();
		Object.assign(this, init);
	}
}
