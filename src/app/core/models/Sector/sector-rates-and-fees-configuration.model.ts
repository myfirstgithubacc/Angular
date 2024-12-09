import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IRateAndFeesConfigFM } from '@xrm-master/sector/add-edit/rates-and-fees-configurations/utils/helper';
import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';

type nullableNumber = number | null;
type nullableString = string | null;
export class SectorRatesAndFeesConfiguration extends CommonSection {
	OtRateType: string | null;
	StBillOrStWage: nullableNumber;
	OtRateTypeName: nullableString;
	OtWageMultiplier: nullableNumber;
	DtWageMultiplier: nullableNumber;
	OtBillMultiplier: nullableNumber;
	DtBillMultiplier: nullableNumber;
	RecruitedLiMspFee: nullableNumber;
	PayrolledMspFee: nullableNumber;
	VendorFeeMultiplier: nullableNumber;
	RecruitedAdminFee: nullableNumber;
	PayrolledAdminFee: nullableNumber;
	StandardRecruitedMarkup: nullableNumber;
	MaskOtFieldsInSystem: boolean;

	constructor(init?: Partial<ɵTypedOrUntyped<IRateAndFeesConfigFM, ɵFormGroupRawValue<IRateAndFeesConfigFM>, any>>) {
		super();
		this.OtRateType = init?.OtRateType?.Value ?? '';
		this.OtRateTypeName = init?.OtRateType?.Text ?? '';
		Object.assign(this, init);
	}
}
