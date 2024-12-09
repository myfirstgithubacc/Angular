import { CustomValidators } from "../custom-validators.service";

export class ValidationMethods {
	static fieldSpecificRequiredValidator(errorMessage: string, dynamicParamName: string | null = null, customValidators: CustomValidators) {
		return customValidators.RequiredValidator(errorMessage, [{ Value: dynamicParamName ?? '', IsLocalizeKey: true }]);
	}
}
