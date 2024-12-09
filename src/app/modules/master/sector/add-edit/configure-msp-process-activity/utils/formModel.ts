import { FormControl, FormGroup } from "@angular/forms";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";

export interface IConfigMSPProcessActivityFM extends ICommonSectionFM{
    IsSkipProcessReqByMsp: FormControl<boolean>,
    IsSkipProcessSubByMsp: FormControl<boolean>,
    HideNteRatefromCopyReqLib: FormControl<boolean>,
    IsSkipLIRequestProcessByMsp: FormControl<boolean>,
    IsAutoBroadcastForLiRequest: FormControl<boolean>,
}

export function getConfigMSPProcessActivityFormModel() {
	return new FormGroup<IConfigMSPProcessActivityFM>({
		...getCommonSectionFormModel(),
		'IsSkipProcessReqByMsp': new FormControl<boolean>(false, {nonNullable: true}),
		'IsSkipProcessSubByMsp': new FormControl<boolean>(false, {nonNullable: true}),
		'HideNteRatefromCopyReqLib': new FormControl<boolean>(false, {nonNullable: true}),
		'IsSkipLIRequestProcessByMsp': new FormControl<boolean>(false, {nonNullable: true}),
		'IsAutoBroadcastForLiRequest': new FormControl<boolean>(false, {nonNullable: true})
	});
}
