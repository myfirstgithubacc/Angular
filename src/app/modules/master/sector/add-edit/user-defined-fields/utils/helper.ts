import { FormArray, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";

export interface IUserDefinedFieldsFM extends ICommonSectionFM {
	UdfFieldRecords: FormArray;
}

export function getUserDefinedFieldsFormModel() {
	return new FormGroup<IUserDefinedFieldsFM>({
		...getCommonSectionFormModel(),
		'UdfFieldRecords': new FormArray<any>([])
	});
}
