import { FormGroup } from "@angular/forms";
import { IAssignmentExtAndOtherConfigFM } from "./formModel";
import { SectorAssignmentExtensionAndOtherConfiguration } from "@xrm-core/models/Sector/sector-assignment-extension-and-other-configuration.model";

export function patchAssignmentExtAndOtherConfig(
	assignmentExtAndOtherConfigData: SectorAssignmentExtensionAndOtherConfiguration,
	 formGroup: FormGroup<IAssignmentExtAndOtherConfigFM>
){
	formGroup.patchValue(assignmentExtAndOtherConfigData);
}
