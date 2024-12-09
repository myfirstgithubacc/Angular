import { FormControl, FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';

export function rateDetailsModel(customValidators: CustomValidators) {
	return new FormGroup({
		BaseWageRate: new FormControl<number | null>(magicNumber.zero),
		RateUnitId: new FormControl<number | null>(magicNumber.zero),
		NteBillRate: new FormControl<number | null>(magicNumber.zero),
		NewNteBillRate: new FormControl<number | null>(magicNumber.zero, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'NteBillRate', IsLocalizeKey: true }])),
		DeltaCost: new FormControl<string | null>(null),
		ReasonForException: new FormControl<string | null>(null),
		HourDistributionRuleId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'HourDistributionRule', IsLocalizeKey: true }])),
		EstimatedRegularHoursPerWeek: new FormControl<number | null>(Number(magicNumber.zero), [
			customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'EstimatedRegularHoursPerWeek', IsLocalizeKey: true }]),
			customValidators.MaxLengthValidator(magicNumber.oneHundredSixtyEight)
		]),
		IsOtExpected: new FormControl<boolean>(false),
		OthoursBilledAt: new FormControl<number | null>(null),
		EstimatedOtHoursPerWeek: new FormControl<string | null>(null),
		BudgetedHours: new FormControl<string | null>(null),
		EstimatedCost: new FormControl<number | null>(magicNumber.zero)
	});
}
