import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';


export function requestDetailsModel(customValidators: CustomValidators) {
	return new FormGroup({
		IsPreIdentifiedRequest:new FormControl<boolean>(false),
		SectorId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }])),
		WorkLocationId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'ContractorsWorkLocation', IsLocalizeKey: true }])),
		RequestingManagerId: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'RequestingPrimaryManagerName', IsLocalizeKey: true }])),
		OrgLevel1Id: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'OrgLevel1', IsLocalizeKey: true }])),
		OrgLevel2Id: new FormControl<string | null>(null),
		OrgLevel3Id: new FormControl<string | null>(null),
		OrgLevel4Id: new FormControl<string | null>(null),
		CostAccountingId: new FormControl<string | null>(null),
		ReasonForRequestId: new FormControl<string | null>(null),
		SubmittalAllowedPerStaffing: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SubmittalsAllowedPerStaffingAgency', IsLocalizeKey: true }])),
		SubmittalAllowedForThisRequest: new FormControl<string | null>(null, customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SubmittalsAllowedForThisRequisition', IsLocalizeKey: true }])),
		IsAllowStaffingToContact: new FormControl<boolean>(false)
	});
}

