import { FormGroup } from "@angular/forms";
import { SectorEmailApprovalConfiguration } from "@xrm-core/models/Sector/sector-email-approval-configuration.model";
import { IEmailApprovalConfigFM } from "./formModel";

export function patchEmailApprovalConfig(emailApprovalConfigData: SectorEmailApprovalConfiguration, formGroup: FormGroup<IEmailApprovalConfigFM>) {
	formGroup.patchValue(emailApprovalConfigData);
}
