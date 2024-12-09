import { FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { ShiftDifferentialMethods } from "@xrm-shared/services/common-constants/static-data.enum";

export interface IShiftConfigFM extends ICommonSectionFM {
	ShiftdifferentialMethod: FormControl<string>;
	ShiftdifferentialMethodName: FormControl<string>;
	ShiftTimeMandatoryForProfessional: FormControl<boolean>;
	ShiftTimeMandatoryForLi: FormControl<boolean>;
}

export function getShiftConfigFormModel() {
	return new FormGroup<IShiftConfigFM>({
		...getCommonSectionFormModel(),
		'ShiftdifferentialMethod': new FormControl<string>(ShiftDifferentialMethods.Multiplier.toString(), {nonNullable: true}),
		'ShiftdifferentialMethodName': new FormControl<string>('Multiplier', {nonNullable: true}),
		'ShiftTimeMandatoryForProfessional': new FormControl<boolean>(false, {nonNullable: true}),
		'ShiftTimeMandatoryForLi': new FormControl<boolean>(false, {nonNullable: true})
	});
}
