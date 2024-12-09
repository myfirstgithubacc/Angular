import { Injectable } from '@angular/core';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';

@Injectable({
	providedIn: 'root'
})
export class SharedMethodsService {

	constructor(
		private localizationService: LocalizationService,
		private dialogPopupService: DialogPopupService
	) { }

	public assignOrgTypeData(org: any) {
		const orgTypeData = {
			OrgName: org
				? this.localizationService.GetLocalizeMessage(org.LocalizedKey)
				: '',
			IsVisible: org
				? org.IsVisible
				: false,
			IsMandatory: org
				? org.IsMandatory
				: false
		};
		return orgTypeData;
	}

	public getRevisionFieldsUpdate() {
		this.dialogPopupService.showConfirmation(`
			The library rates for this job category have changed. Do you wish to apply the new rates to this request ?
 `, PopupDialogButtons.YesNoDelete);
	}
}
