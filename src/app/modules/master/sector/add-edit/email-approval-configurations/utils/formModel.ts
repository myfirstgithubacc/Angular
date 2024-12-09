import { FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";

export interface IEmailApprovalConfigFM extends ICommonSectionFM {
	IsQuickLinkToApprovalEmails: FormControl<boolean>;
}

export function getEmailApprovalConfigFormModel() {
	return new FormGroup<IEmailApprovalConfigFM>({
		...getCommonSectionFormModel(),
		'IsQuickLinkToApprovalEmails': new FormControl<boolean>(false, {nonNullable: true})
	});
}

