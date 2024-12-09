import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';

export function assignmentRequirementModel(customValidators: CustomValidators) {
	return new FormGroup({
		TargetStartDate: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'TargetStartDate', IsLocalizeKey: true }])),
		TargetEndDate: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'TargetEndDate', IsLocalizeKey: true }])),
		ShiftId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Shift', IsLocalizeKey: true }])),
		Sun: new FormControl<boolean>(false),
		Mon: new FormControl<boolean>(false),
		Tue: new FormControl<boolean>(false),
		Wed: new FormControl<boolean>(false),
		Thu: new FormControl<boolean>(false),
		Fri: new FormControl<boolean>(false),
		Sat: new FormControl<boolean>(false),
		StartTime: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'StartTime', IsLocalizeKey: true }])),
		EndTime: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'EndTime', IsLocalizeKey: true }])),
		PositionNeeded: new FormControl<number | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'PositionNeeded', IsLocalizeKey: true }])),
		IsDrugTestRequired: new FormControl<boolean>(false),
		IsBackgrounCheckRequired: new FormControl<boolean>(false),
		PositionDescription: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'PositionDescription', IsLocalizeKey: true }])),
		SkillsRequired: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SkillsRequired', IsLocalizeKey: true }])),
		SkillsPreferred: new FormControl<string | null>(null),
		ExperienceRequired: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ExperienceRequired', IsLocalizeKey: true }])),
		ExperiencePreferred: new FormControl<string | null>(null),
		EducationRequired: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'EducationRequired', IsLocalizeKey: true }])),
		EducationPreferred: new FormControl<string | null>(null),
		AdditionalInformation: new FormControl<string | null>(null),
		startTimeControlName: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterStartTime')),
		endTimeControlName: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterEndTime'))
	});
}
