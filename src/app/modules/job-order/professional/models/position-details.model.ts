import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';

export function positionDetailsModel(customValidators: CustomValidators) {
	return new FormGroup({
		PositionTitle: new FormControl<string | null>(null),
		LaborCategoryId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'LaborCategory', IsLocalizeKey: true }])),
		JobCategoryId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'JobCategory', IsLocalizeKey: true }])),
		ReqLibraryId: new FormControl<string | null>(null),
		AssignmentTypeId: new FormControl<string | null>(null),
		SecurityClearanceId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'SecurityClearance', IsLocalizeKey: true }])),
		MinimumClearanceToStartId: new FormControl<string | null>(null)
	});
}
