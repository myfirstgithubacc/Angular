import { ToastOptions } from "@xrm-shared/enums/toast-options.enum";
import { LocalizationService } from "../Localization/localization.service";
import { magicNumber } from "../common-constants/magic-number.enum";
import { ToasterService } from "../toaster.service";

export class ShowApiResponseMessage {
	static showMessage(res: any, toasterService:ToasterService, localizationService:LocalizationService) {
		let fieldName: string;
		if (res.ValidationMessages[0].PropertyName.includes('.')) {
			fieldName = res.ValidationMessages[0].PropertyName.substring(
				res.ValidationMessages[0].PropertyName.indexOf('.') + magicNumber.one,
				res.ValidationMessages[0].PropertyName.length
			);
			fieldName = localizationService.GetLocalizeMessage(fieldName);
		}
		else {
			fieldName = localizationService.GetLocalizeMessage(res.ValidationMessages[0].PropertyName);
		}
		const fieldMessage = localizationService.GetLocalizeMessage(res.ValidationMessages[0].ErrorMessage);
		toasterService.displayToaster(ToastOptions.Error, `${fieldName}: ${fieldMessage}`);
	}
}
