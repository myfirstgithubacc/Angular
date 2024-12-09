import { ToJson } from './responseTypes/to-json.model';

type nullableNumber = number | undefined | null;
export class RateCalculator extends ToJson {

	"pricingModelId": nullableNumber;

	"otRateTypeId": nullableNumber;

	"mspFeeTypeId": nullableNumber;

	"mspFeePercent": nullableNumber;

	"supplierMSPFee": nullableNumber;

	"submittedMarkup": nullableNumber;

	"acaRate": nullableNumber;

	"isRuleImplemented": nullableNumber;

	"laborCategoryId": nullableNumber;

	"supplierCode": string | undefined | null;

	"isShiftMultiplier": boolean | undefined | null;

	"shiftDifferentialValue": nullableNumber;

	"clpType": nullableNumber;

	"jobType": nullableNumber;

	"otBillMultiplier": nullableNumber;

	"dtBillMultiplier": nullableNumber;

	"otWageMultiplier": nullableNumber;

	"dtWageMultiplier": nullableNumber;

	"stWageRate": nullableNumber;

	"baseWageRate": nullableNumber;

	"stBill": nullableNumber;


	constructor(init?: Partial<RateCalculator>) {
		super();
		Object.assign(this, init);
	}
}

