import { FormGroup } from "@angular/forms";
import { IShiftConfigFM } from "./formModel";
import { SectorShiftConfiguration } from "@xrm-core/models/Sector/sector-shift-configuration.model";

export function patchShiftConfig(shiftConfigData: SectorShiftConfiguration, formGroup: FormGroup<IShiftConfigFM>) {
	formGroup.patchValue(shiftConfigData);
	formGroup.patchValue({
		'ShiftdifferentialMethod': shiftConfigData.ShiftdifferentialMethod.toString()
	});
}
