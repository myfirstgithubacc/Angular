import { FormGroup } from "@angular/forms";
import { IConfigMSPProcessActivityFM } from "./formModel";
import { SectorConfigureMspProcessActivity } from "@xrm-core/models/Sector/sector-configure-msp-process-activity.model";

export function patchConfigMSPProcessActivity(
	ConfigMSPProcessData: SectorConfigureMspProcessActivity,
	formGroup: FormGroup<IConfigMSPProcessActivityFM>
){
	formGroup.patchValue(ConfigMSPProcessData);
}
