import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { IBackgroundChecksFormControls } from "./formModel";


export function defaultFormOfOnboardingRequirements(formBuilder: FormBuilder, customvalidators: CustomValidators):
 FormGroup<IBackgroundChecksFormControls> {
	return formBuilder.group<IBackgroundChecksFormControls>({
	  Id: new FormControl(magicNumber.zero),
	  AllowToFillCandidateWithPendingCompliance: new FormControl<boolean>(false),
		AllowAttachPreEmploymentDocToClientEmail: new FormControl<boolean>(false),
		IsActiveClearance: new FormControl<boolean>(false),
		IsDrugResultVisible: new FormControl<boolean>(true),
		IsDrugScreenItemEditable: new FormControl<boolean>(false),
		DefaultDrugResultValue: new FormControl<string>(''),
		IsBackGroundCheckVisible: new FormControl<boolean>(true),
		IsBackGroundItemEditable: new FormControl<boolean>(false),
		DefaultBackGroundCheckValue: new FormControl<string>(''),
		SectorId: new FormControl<number>(magicNumber.zero),
		SectorUkey: new FormControl<number | null>(null),
		StatusCode: new FormControl<number | null>(null),
		ReasonForChange: new FormControl<string | null>(null),
	  SectorBackgrounds: formBuilder.array([
			formBuilder.group({
		  Id: formBuilder.control<number>(magicNumber.zero),
		  ComplianceItemLabel: formBuilder.control<string | null>(null, [customvalidators.requiredValidationsWithMessage('PleaseEnterData', 'ScreenLabelName')]),
		  IsVisibleToClient: formBuilder.control<boolean>(true),
		  IsApplicableForLi: formBuilder.control<boolean>(false),
		  IsApplicableForProfessional: formBuilder.control<boolean>(false),
		  IsApplicableForSow: formBuilder.control<boolean>(false),
		  DisplayOrder: formBuilder.control<number>(magicNumber.zero),
		  ComplianceType: formBuilder.control<string>('B'),
		  ComplianceFieldName: formBuilder.control<string | null>(null),
		  IsMandatorySign: formBuilder.control<boolean>(true),
		  IsShowHide: formBuilder.control<boolean>(true)
			})
	  ])
	});
}


