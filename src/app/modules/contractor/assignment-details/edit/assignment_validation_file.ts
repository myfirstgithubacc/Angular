import { AbstractControl } from "@angular/forms";
import { EditComponent } from "./edit.component";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { IControlDates, IValidationMessages } from "../interfaces/editAssignmentInterface";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";
import { ToastOptions } from "@xrm-shared/enums/toast-options.enum";

export function toggleEffectiveDateControl(
	ruleId: number,
	controlValue: number,
	controlField: AbstractControl | null
): boolean {
	const shouldDisable = ruleId === controlValue;
	if (controlField) {
		if(!shouldDisable)
		  controlField.enable();
	}
	return shouldDisable;
}

export function timeAndExpenseEffectiveDateControl(currentObject: EditComponent): void {
	const {
			assignmentDetails: { AssignmentHourDistributionRules, AssignmentMealBreakConfigurations },
			EditAssingmentForm,
			isControlRevision
		} = currentObject,

	  hourDistributionRuleId = AssignmentHourDistributionRules[0]?.HourDistributionRuleId,
		hourDistributionRuleControlValue = Number(EditAssingmentForm.get('hourDistribution')?.value?.Value ?? '0'),
		hourDistributionRuleEffectiveDateControlField = EditAssingmentForm.get('hourDistributionEffectiveDate'),

		restMealRuleId = AssignmentMealBreakConfigurations[0]?.MealBreakConfigurationId,
		restMealBreakRuleControlValue = Number(EditAssingmentForm.get('restMealBreak')?.value?.Value ?? '0'),
		restMealBreakRuleEffectiveDateControlField = EditAssingmentForm.get('restBreakEffectiveDate');

	// Set control revision status
	isControlRevision['hourDistribution'] = hourDistributionRuleId !== hourDistributionRuleControlValue;
	/* To mark Rest Meal Break Rule for Revision */
	isControlRevision['restMealBreak'] = restMealRuleId !== restMealBreakRuleControlValue;

	if (hourDistributionRuleControlValue) {
		toggleEffectiveDateControl(hourDistributionRuleId, hourDistributionRuleControlValue, hourDistributionRuleEffectiveDateControlField);
	}

	if (restMealBreakRuleControlValue) {
		toggleEffectiveDateControl(restMealRuleId, restMealBreakRuleControlValue, restMealBreakRuleEffectiveDateControlField);
	}
}

// Start Date check and add validation
export function validateAndSyncStartDate(
	currentObject: EditComponent,
	e: { date: Date, control: IControlDates, key: IValidationMessages }
): void {
	const assignmentStartDateControl = currentObject.EditAssingmentForm.controls['AssignmentStartDate'];
	if(assignmentStartDateControl.value === null)
		return;
	// eslint-disable-next-line one-var
	const	assignmentStartDate = new Date(currentObject.assignmentDetails.AssignmentStartDate),
		date = new Date(assignmentStartDateControl.value),

		// Validation for Sector InitialGoLiv Date
	 result = currentObject.checkInitialGoLiveStartDateFormat();
	if(result)
		return;

	if (isStartDateInvalid(currentObject, date, assignmentStartDate)) {
		return;
	}

	// eslint-disable-next-line one-var
	assignmentStartDateControl.setValue(date);

	if (e.control.control1 === 'AssignmentStartDate') {
		if (currentObject.EditAssingmentForm.get('BackFillRequested')?.value) {
			const currentDate = new Date(date),
				nextDate = new Date(currentDate);
			nextDate.setDate(currentDate.getDate() + magicNumber.one);
			currentObject.EditAssingmentForm.controls['BackFillStartDate'].setValue(nextDate);
		}
	} else {
		currentObject.isControlRevision.BackFillStartDate = true;
	}
	startDateChange(e, currentObject);
}

/* Validate Start Date when checkEffectiveDateAlignment is false, isRevisionAlready Processed
	    and the Start date is being decreased. */
export function isStartDateInvalid(
	currentObject: EditComponent,
	date: Date,
	assignmentStartDate: Date
): boolean {

	// Todo : Add message validation message in case of IsRevisionProcessed

	if (date < assignmentStartDate &&
    (!currentObject.assignmentDetails.CheckEffectiveDatesAlignment || currentObject.assignmentDetails.IsRevisionProcessed)
	) {
		currentObject.EditAssingmentForm.controls['AssignmentStartDate'].setValue(assignmentStartDate);
		currentObject.toasterService.showToaster(
			ToastOptions.Error,
			currentObject.localizationService.GetLocalizeMessage('AssignmentStartDateValid')
		);
		return true;
	}
	return false;
}

export function startDateChange(
	e: { date: Date, control: IControlDates, key: IValidationMessages},
	currentObject: EditComponent
){
	const startDate = currentObject.EditAssingmentForm.get(e.control.control1),
		endDate = currentObject.EditAssingmentForm.get(e.control.control2),
	 startTime = new Date(startDate?.value).getTime(),
	 endTime = new Date(endDate?.value).getTime(),
	 controlVal = { startTime, endTime };

	if (!startDate || !e.key){
		startDate?.setValidators(currentObject.customValidators.RequiredValidator(e.key.key1));
		startDate?.updateValueAndValidity();
		return;
	}

	if(currentObject.isInitialStartDatePresent) return;

	handleStartDateValidation(
		currentObject,
		controlVal,
		[{ Value: currentObject.localizationService.TransformDate(currentObject.expenseStartDate), IsLocalizeKey: true }],
		e
	);

	currentObject.endDateChanged =
  currentObject.isControlRevision.AssignmentEndDate && currentObject.isTenureValid;

	// eslint-disable-next-line one-var
	const startDateTransformed = currentObject.localizationService.TransformDate(currentObject.EditAssingmentForm.get('AssignmentStartDate')?.value),
	 patchedStartDate = currentObject.localizationService.TransformDate(currentObject.patchedFormValue['AssignmentStartDate']);

	if (e.control.control1 === 'AssignmentStartDate' &&
  startDateTransformed !== patchedStartDate &&
  startTime < endTime
	) {
		currentObject.startDateChanged = true;
		currentObject.isControlRevision[e.control.control1] = true;
	} else {
		currentObject.startDateChanged = false;
		currentObject.isControlRevision[e.control.control1] = false;
	}

	currentObject.validatePoEffectiveFromDate('PoEffectiveFromDate', 'EffectiveFromDate');
	currentObject.addValidationHourDistributionEffectiveDate('hourDistributionEffectiveDate', 'HourDistributionEffectiveDate');
	currentObject.addValidationRestMealEffectiveDate('restBreakEffectiveDate', 'RestMealEffectiveDate');

	currentObject.revisedRateDate(new Date(startDate?.value));
	currentObject.EditAssingmentForm.updateValueAndValidity();
}


// eslint-disable-next-line max-params
export function handleStartDateValidation(
	currentObject: EditComponent,
	controlVal: { startTime: number, endTime: number },
	dynamicParam: DynamicParam[],
	e:{date:Date, control:IControlDates, key:IValidationMessages}
) {
	const { startTime, endTime } = controlVal,
		expenseTime = (currentObject.expenseStartDate as Date)?.getTime(),
		controlField = currentObject.EditAssingmentForm.controls[e.control.control1];
	if (startTime > endTime) {
		currentObject.EditAssingmentForm.controls[e.control.control1].
			setValidators(currentObject.assignmentDetailsDataService.DateStringValidator(startTime, endTime, e.key.key2));
		currentObject.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
		return;
	}
	else if (currentObject.expenseStartDate && startTime > expenseTime) {
		controlField.setValidators(currentObject.assignmentDetailsDataService.
			DateStringValidator(
				startTime, expenseTime,
				currentObject.localizationService.GetLocalizeMessage('StartDateTimeExpenseValidation', dynamicParam)
			));
		controlField.updateValueAndValidity();
		return;
	}
	else {
		currentObject.getHourDistributionEffectiveDate();
	   currentObject.EditAssingmentForm.controls[e.control.control1].clearValidators();
		 currentObject.EditAssingmentForm.controls[e.control.control1].updateValueAndValidity();
	}
	if(currentObject.EditAssingmentForm.controls['AssignmentStartDate'].valid){
		currentObject.getTenureLimit('AssignmentStartDate');
	}
}
