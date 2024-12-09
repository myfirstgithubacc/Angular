
import { Injectable } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { assignmentCostAccountingCode, assignmentDetailsUpdate } from "../model/assignment.model";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { DatePipe } from "@angular/common";
import { DialogPopupService } from "@xrm-shared/services/dialog-popup.service";
import { BehaviorSubject } from "rxjs";
import { PopupDialogButtons } from "@xrm-shared/services/common-constants/popup-buttons";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";
import { DetailItem, IAssignmentDetails, WorkAttributes } from "../interfaces/interface";
import { RoleGroup } from "@xrm-master/user/enum/enums";
import { LocalizationService } from "@xrm-shared/services/Localization/localization.service";
import { CultureFormat } from "@xrm-shared/services/Localization/culture-format.enum";

@Injectable({providedIn: 'root'})

export class AssignmentDetailsDataService {
	public isRevision = new BehaviorSubject<boolean>(false);
	public isRateRevision = new BehaviorSubject<boolean>(false);
	private revisedDefaultDate = new Date();

	// eslint-disable-next-line max-params
	constructor(
		private fb:FormBuilder, private customValidators: CustomValidators, private datePipe: DatePipe,
		private dialogPopupService: DialogPopupService, private localizationService: LocalizationService
	){

	}

	formatDate(form: any, control: any): any {
		const dateString: any = form.get(control)?.value?.Text;
		let parsedDate;
		if(dateString?.includes('.')){
			const [day, month, year] = dateString.split('.');
			parsedDate = new Date(Number(year), Number(month) - magicNumber.one, Number(day));
		}else if (dateString?.includes('/')){
			const [day, month, year] = dateString.split('/');
			parsedDate = new Date(Number(year), Number(month) - magicNumber.one, Number(day));
		}else{
			parsedDate = new Date(dateString);
		}

		if (!isNaN(parsedDate.getTime())) {
			return this.datePipe.transform(parsedDate, 'yyyy-MM-ddTHH:mm:ss');
		}

	}

	transformDateString(dateString: any): any{
		let parsedDate;
		if(dateString?.includes('.')){
			const [day, month, year] = dateString.split('.');
			parsedDate = new Date(Number(year), Number(month) - magicNumber.one, Number(day));
		}else if (dateString?.includes('/')){
			const [day, month, year] = dateString.split('/');
			parsedDate = new Date(Number(year), Number(month) - magicNumber.one, Number(day));
		}else{
			parsedDate = new Date(dateString);
		}

		if (!isNaN(parsedDate.getTime())) {
			return this.datePipe.transform(parsedDate, 'MM/dd/YYYY');
		}
	}

	convertMdyyyyToYYYYMMDD(dateString: string): string | null {
		const date = new Date(dateString);
		return this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	convertToDateObject(dateString: string, format: 'd/M/yyyy' |'M/d/yyyy' | 'd.M.yyyy'): Date | null {

		const normalizedDate = dateString.replace(/[.]/g, '/'),
		 parts = normalizedDate.split('/');
		let day: number= 0,
			month: number=0,
			year: number=0;
		if (parts.length === 3) {
			if (format === 'M/d/yyyy') {
				month = parseInt(parts[0], 10) - 1;
				day = parseInt(parts[1], 10);
			} else if (format === 'd/M/yyyy' || format === 'd.M.yyyy') {
				day = parseInt(parts[0], 10);
				month = parseInt(parts[1], 10) - 1;
			}
			year = parseInt(parts[2], 10);
		} else {
			return null;
		}
		// eslint-disable-next-line one-var
		const date = new Date(year, month, day);
		return isNaN(date.getTime()) ?
			null :
			date;
	}

	dateConversion(date: Date | string | undefined | null): string | null {
		const dateFormat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		if (!date) return null;

		// eslint-disable-next-line no-nested-ternary, one-var
		const dateObj = date instanceof Date
			? date
			: date === ""
				? null
				: this.convertToDateObject(date as string, dateFormat);
		return dateObj
			? this.datePipe.transform(dateObj, 'yyyy-MM-dd')
			: null;
	}

	CustomTransform(dateString: string){
		const datePipe = new DatePipe(CultureFormat[CultureFormat.ClientCultureCode]),
		 dateObject = datePipe.transform(dateString, CultureFormat[CultureFormat.DateFormat]);
		return dateObject;
	}

	// eslint-disable-next-line max-lines-per-function, max-statements
	prepareDataForAssignmentUpdate(form:FormGroup, assignmentDetails: IAssignmentDetails){
		const data = new assignmentDetailsUpdate();
		data.hourDistributionRuleEffectiveDate = this.dateConversion(form.get('hourDistributionEffectiveDate')?.value?.Text);
		data.mealBreakConfigurationEffectiveDate = this.dateConversion(form.get('restBreakEffectiveDate')?.value?.Text);
		data.assignmentId =Number(assignmentDetails?.Id);
		data.statusId = assignmentDetails.StatusId;
		data.hireCodeId = assignmentDetails?.HireCodeId;
		data.securityClearanceId = assignmentDetails.SecurityClearanceId;
		data.otRateTypeId = form.get('OTRateTypeId')?.value;
		data.orgLevel1Id = form.get('orgLevel1')?.value?.Value;
		data.orgLevel2Id = form.get('orgLevel2')?.value?.Value;
		data.orgLevel3Id = form.get('orgLevel3')?.value?.Value;
		data.orgLevel4Id = form.get('orgLevel4')?.value?.Value;
		data.workLocationId = form.get('WorkLocationId')?.value?.Value;
		data.laborCategoryId = form.get('LaborCategoryId')?.value?.Value;
		data.jobCategoryId = form.get('JobCategoryId')?.value?.Value;
		data.positionTitle = form.get('positionTittle')?.value;
		data.securityClearanceId = form.get('securityClerance')?.value?.Value;
		data.assignmentStartDate = this.dateConversion(form.get('AssignmentStartDate')?.value);
		data.assignmentEndDate = this.dateConversion(form.get('AssignmentEndDate')?.value);
		data.shiftId = form.get('ShiftId')?.value?.Value;
		data.requestingManagerId = form.get('requestingManager')?.value?.Value;
		data.primaryManagerId = form.get('primaryManager')?.value?.Value;
		data.alternateManagerId = form.get('alternateManager')?.value?.Value??null;
		data.poOwnerId = form.get('poOwner')?.value?.Value?? null;
		data.NewPONumber = form.get('NewPONumber')?.value;
		data.positionDescription = form.get('jobDuties')?.value;
		data.DnrOptions = form.get('dnrOptions')?.value == null
			? null :
			form.get('dnrOptions')?.value;
		data.assignmentRate = {
			assignmentRateId: assignmentDetails?.AssignmentRates?.Id,
			rateEffectiveDateFrom: form.get('revisedRatedate')?.value ?
				this.dateConversion(form.get('revisedRatedate')?.value) :
				assignmentDetails.AssignmentRates?.RateEffectiveDateFrom.toString(),
			mspFee: null,
			staffingAgencyMarkup: form.get('StaffingAgencyMarkup')?.value,
			baseWageRate: form.get('BaseWageRate')?.value,
			actualStWageRate: form.get('ActualSTWageRate')?.value,
			otWageRate: form.get('OTWageRate')?.value,
			dtWageRate: form.get('DTWageRate')?.value,
			stBillRate: form.get('STBillRate')?.value,
			otBillRate: form.get('OTBillRate')?.value,
			dtBillRate: form.get('DTBillRate')?.value,
			dtMultiplier: form.get('dTMultiper')?.value,
			otMultiplier: form.get('oTMultiper')?.value,
			staffingAgencySTBillRate: form.get('StaffingAgencySTBillRate')?.value,
			staffingAgencyOTBillRate: form.get('StaffingAgencyOTBillRate')?.value,
			staffingAgencyDTBillRate: form.get('StaffingAgencyDTBillRate')?.value,
			comments: ""
		};
		data.allowContractorToEnterTime = form.get('isTimeEntryAllowed')?.value;
		data.estimatedRegularQuantityPerWeek = form.get('estimatedRegularHoursPerWeek')?.value;
		data.hourDistributionRuleId = form.get('hourDistribution')?.value?.Value;
		data.mealBreakConfigurationId = form.get('restMealBreak')?.value?.Value;

		data.comments = form.get('comment')?.value;
		data.assignmentCostAccountingCodes = assignmentDetails.AssignmentCostAccountingCodes;
		data.assignmentCostAccountingCodes.map((element: assignmentCostAccountingCode) => {
			element.EffectiveFrom = this.dateConversion(element.EffectiveFrom);
			element.EffectiveTo = this.dateConversion(element.EffectiveTo);
		});
		// data.udfFieldRecords = assignmentDetails.udfData;
		data.udfFieldRecords = [];
		data.dmsFieldRecords = [];
		data.complianceDetail = assignmentDetails.complianceDetail;
		data.primaryManagerId = assignmentDetails.IsMultipleTimeApprovalNeeded
			? null
			: data.primaryManagerId;
		data.alternateManagerId = assignmentDetails.IsMultipleTimeApprovalNeeded
			? null
			: data.alternateManagerId;
		data.assignmentShiftDetail = assignmentDetails.shiftDataById;
		data.isDNRRequested = form.get('AddedToDNR')?.value;
		data.modifyPOApprovedAmountBasedOnRevisedRates = form.get('ModifyPObasedOnRevisedRates')?.value?? false;
		data.poAdjust = form.get('ModifyPObasedOnRevisedRates')?.value?? false;
		data.revisedRatedate = this.dateConversion(form.get('revisedRatedate')?.value);
		data.terminationReasonId = form.get('TerminateReasonId')?.value?.Value;
		data.terminatedAssignment = form.get('TerminateAssignment')?.value;
		data.revisedFundByEndDateChange = form.get('revisedFundByEndDateChange')?.value;
		data.revisedFundByRateChange = form.get('revisedFundByRateChange')?.value;
		data.revisedPOFunds = form.get('poFundAmount')?.value?? form.get('NewPOFundAmount')?.value;
		data.modifyPObasedOnNewEndDate = form.get('ModifyPOEndDate')?.value?? false;
		data.backfillRequired = form.get('BackFillRequested')?.value;
		data.notifyToStaffingAgency = form.get('NotifyToStaffingAgency')?.value;
		data.poAdjustmentType = form.get('poAdjustmentType')?.value;
		data.OTEligibility = form.get('otallowed')?.value;
		data.NewPOEffectiveFromDate = this.dateConversion(form.get('PoEffectiveFromDate')?.value?.Text);
		data.startDateforBackfillPosition = form.get('BackFillStartDate')?.value
			? (this.dateConversion(form.get('BackFillStartDate')?.value))
			: null;
		data.endDateforBackfillPosition = form.get('BackFillEndDate')?.value
			? (this.dateConversion(form.get('BackFillEndDate')?.value))
			: null;
		return data;
	}
	assignmentFormMapper(assignmentDetails:IAssignmentDetails){
		return {
			orgLevel1: {Text: assignmentDetails?.OrgLevel1Name??"", Value: assignmentDetails?.OrgLevel1Id?.toString()},
			orgLevel2: {Text: assignmentDetails?.OrgLevel2Name??"", Value: assignmentDetails?.OrgLevel2Id?.toString()},
			orgLevel3: {Text: assignmentDetails?.OrgLevel3Name??"", Value: assignmentDetails?.OrgLevel3Id?.toString()},
			orgLevel4: {Text: assignmentDetails?.OrgLevel4Name??"", Value: assignmentDetails?.OrgLevel4Id?.toString()},
			WorkLocationId: {Text: assignmentDetails?.WorkLocationName??"", Value: assignmentDetails?.WorkLocationId?.toString()},
			// eslint-disable-next-line max-len
			hireCode: {Text: assignmentDetails?.HireCodeName, Value: assignmentDetails?.HireCodeId?.toString()},
			LaborCategoryId: {Text: assignmentDetails.LaborCategoryName??"", Value: assignmentDetails.LaborCategoryId?.toString()},
			JobCategoryId: {Text: assignmentDetails.JobCategoryName??"", Value: assignmentDetails.JobCategoryId?.toString()},
			positionTittle: assignmentDetails.PositionTitle??'',
			securityClerance: {Text: assignmentDetails?.SecurityClearanceName??"", Value: assignmentDetails?.SecurityClearanceId?.toString()},
			AssignmentStartDate: new Date(assignmentDetails?.AssignmentStartDate),
			AssignmentEndDate: new Date(assignmentDetails?.AssignmentEndDate),
			otallowed: assignmentDetails?.OTEligibility,
			ShiftId: { Text: assignmentDetails?.AssignmentShiftDetails[0]?.ShiftName ?? "", Value: assignmentDetails?.AssignmentShiftDetails[0]?.ShiftId?.toString()},
			jobDuties: assignmentDetails?.PositionDescription??"",
			requestingManager: {Text: assignmentDetails?.RequestingManagerName??"", Value: assignmentDetails.RequestingManagerId?.toString()??""},
			primaryManager:
				{Text: assignmentDetails.IsMultipleTimeApprovalNeeded?
					"Multiple":
					assignmentDetails?.PrimaryManagerName, Value: assignmentDetails.IsMultipleTimeApprovalNeeded?
					"Multiple":
					assignmentDetails.PrimaryManagerId?.toString()},
			alternateManager: {Text: assignmentDetails.IsMultipleTimeApprovalNeeded ?
				"Multiple" :
				assignmentDetails?.AlternateManagerName, Value: assignmentDetails.IsMultipleTimeApprovalNeeded ?
				"Multiple" :
				assignmentDetails.AlternateManagerId?.toString()
			},
			poOwner: {Text: assignmentDetails?.POOwnerName??null, Value: assignmentDetails?.POOwnerId?.toString()},
			BaseWageRate: assignmentDetails?.AssignmentRates?.BaseWageRate,
			ActualSTWageRate: assignmentDetails?.AssignmentRates?.ActualSTWageRate,
			StaffingAgencyMarkup: assignmentDetails?.AssignmentRates?.StaffingAgencyMarkup,
			OTWageRate: assignmentDetails?.AssignmentRates?.OTWageRate,
			DTWageRate: assignmentDetails?.AssignmentRates?.DTWageRate,
			STBillRate: assignmentDetails?.AssignmentRates?.STBillRate,
			OTBillRate: assignmentDetails?.AssignmentRates?.OTBillRate,
			DTBillRate: assignmentDetails?.AssignmentRates?.DTBillRate,
			StaffingAgencySTBillRate: assignmentDetails?.AssignmentRates?.StaffingAgencySTBillRate,
			StaffingAgencyOTBillRate: assignmentDetails?.AssignmentRates?.StaffingAgencyOTBillRate,
			StaffingAgencyDTBillRate: assignmentDetails?.AssignmentRates?.StaffingAgencyDTBillRate,
			OTRateTypeId: assignmentDetails?.OTRateTypeId?.toString(),
			oTMultiper: assignmentDetails?.AssignmentRates?.OTMultiplier,
			dTMultiper: assignmentDetails?.AssignmentRates?.DTMultiplier,
			isTimeEntryAllowed: assignmentDetails?.AllowContractorToEnterTime,
			estimatedRegularHoursPerWeek: assignmentDetails?.EstimatedRegularQuantityPerWeek??''
		};
	}
	// eslint-disable-next-line max-lines-per-function
	editAssignmentFormControl(){
		return this.fb.group({
			orgLevel1: [],
			orgLevel2: [],
			orgLevel3: [],
			orgLevel4: [],
			WorkLocationId: [null, [this.customValidators.RequiredValidator('PleaseSelectContractorsWorkLocation')]],
			hireCode: [],
			LaborCategoryId: [null, [this.customValidators.RequiredValidator('PleaseSelectLabor')]],
			JobCategoryId: [null, [this.customValidators.RequiredValidator('PleaseSelectJobCategory')]],
			positionTittle: [null],
			securityClerance: [null],
			AssignmentStartDate: [null, this.customValidators.RequiredValidator('PleaseEnterStartDate')],
			AssignmentEndDate: [null, this.customValidators.RequiredValidator('PleaseEnterEndDate')],
			ShiftId: [null, this.customValidators.RequiredValidator('SelectShift')],
			startTimeControlName: [],
			endTimeControlName: [],
			ModifyPOEndDate: [],
			TerminateAssignment: [],
			TerminateReasonId: [null],
			radioDNR: [true],
			BackFillRequested: [false],
			BackFillStartDate: [null],
			BackFillEndDate: [null],
			NotifyToStaffingAgency: [null],
			selectedStaffingAgency: [],
			jobDuties: [],
			requestingManager: [null, this.customValidators.RequiredValidator('PleaseSelectRequestingManager')],
			primaryManager: [null, this.customValidators.RequiredValidator('PleaseSelectPrimaryManager')],
			alternateManager: [null],
			poOwner: [null, this.customValidators.RequiredValidator('Please select PO Owner.')],
			adjustPoNumber: [false],
			poAdjustmentType: [magicNumber.twoHundredEightyOne],
			NewPONumber: [],
			PoEffectiveFromDate: [],
			poEffectiveToDate: [],
			poFundAmount: [null],
			NewPOFundAmount: [null],
			revisedPOFunds: [],
			BaseWageRate: [null, [this.customValidators.RequiredValidator('PleaseEnterBaseWageRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'BaseWageRateRangeValidation')]],
			ActualSTWageRate: [null, [this.customValidators.RequiredValidator('PleaseEnterActualSTWageRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'ActualSTWageRateRangeValidation')]],
			OTWageRate: [null, [this.customValidators.RequiredValidator('PleaseEnterOtWageRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'OTWageRateRangeValidation')]],
			DTWageRate: [null, [this.customValidators.RequiredValidator('PleaseEnterDtWageRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'DTWageRateRangeValidation')]],
			StaffingAgencyMarkup: [null, [this.customValidators.RequiredValidator('PleaseEnterSubmitMarkUp'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.oneThousand, 'SubmittedMarkupRangeValidation ')]],
			OTRateTypeId: [null, [this.customValidators.RequiredValidator('PleaseSelectOtHourBilledAt')]],
			STBillRate: [null, [this.customValidators.RequiredValidator('PleaseEnterStBillRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'STBillRateRangeValidation')]],
			OTBillRate: [null, [this.customValidators.RequiredValidator('PleaseEnterOtBillRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'OTBillRateRangeValidation')]],
			DTBillRate: [null, [this.customValidators.RequiredValidator('PleaseEnterDtBillRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'DTBillRateRangeValidation')]],
			StaffingAgencySTBillRate: [null, [this.customValidators.RequiredValidator('PleaseEnterVendorSTRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'StaffingAgencySTRateRangeValidation')]],
			StaffingAgencyOTBillRate: [null, [this.customValidators.RequiredValidator('PleaseEnterVendorOTRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'StaffingAgencyOTRateRangeValidation')]],
			StaffingAgencyDTBillRate: [null, [this.customValidators.RequiredValidator('PleaseEnterVendorDTRate'), this.customValidators.RangeValidator(magicNumber.zero, magicNumber.tenThousand, 'StaffingAgencyDTRateRangeValidation')]],
			ModifyPObasedOnRevisedRates: [null],
			modifyPOApprovedAmountBasedOnNewEndsDate: [],
			revisedRatedate: [],
			oTMultiper: [null],
			dTMultiper: [null],
			isTimeEntryAllowed: [],
			estimatedRegularHoursPerWeek: [null, this.customValidators.RequiredValidator('PleaseEnterEstimatedRegularHoursPerWeek')],
			otallowed: [false],
			hourDistribution: [null, this.customValidators.RequiredValidator('PleaseSelectHourDistributionRule')],
			hourDistributionEffectiveDate: [null, this.customValidators.RequiredValidator('PleaseSelectHourDistributionRuleEffectiveDate')],
			restMealBreak: [null, this.customValidators.RequiredValidator('PleaseSelectRestMealBreak')],
			restBreakEffectiveDate: [null, this.customValidators.RequiredValidator('PleaseSelectRestBreakEffectiveDate')],
			costAccountingCode: this.fb.group({}),
			documentType: [null],
			revisionApprover1: [],
			revisionApprover2: [],
			comment: [],
			staffing: [magicNumber.twoHundredEightyTwo],
			AddedToDNR: [false],
			revisedFundByEndDateChange: [magicNumber.zero],
			revisedFundByRateChange: [magicNumber.zero],
			dnrOptions: [magicNumber.twoHundredSeventyEight],
			IsDrugScreenRequired: [],
			IsBackgroundChecksRequired: []
		});
	}
	public isReadOnly(controlName: string, roleGroupId:string|number|null|undefined): boolean {
		const staffingEditable = [
				'orgLevel1', 'orgLevel2', 'orgLevel3', 'orgLevel4', 'workLocation', 'laborCategory',
				'jobCategory', 'positionTittle', 'securityClerance', 'startDate', 'endDate', 'jobDuties',
				'BaseWageRate', 'ActualSTWageRate', 'OTWageRate', 'DTWageRate', 'StaffingAgencyMarkup',
				'OTRateTypeId', 'StaffingAgencySTBillRate', 'StaffingAgencyOTBillRate', 'StaffingAgencyDTBillRate',
				'shift', 'restMealBreak', 'estimatedRegularHoursPerWeek', 'OTRateTypeId', 'otallowed'
			],

		 clientEditable = [
				'orgLevel1', 'orgLevel2', 'orgLevel3', 'orgLevel4', 'workLocation', 'laborCategory',
				'jobCategory', 'positionTittle', 'securityClerance', 'startDate', 'jobDuties',
				'requestingManager', 'primaryManager', 'alternateManager'
			];

		let editableFields: string[] = [];
		if (roleGroupId === Number(RoleGroup.StaffingAgency)) {
			editableFields = staffingEditable;
		} else if (roleGroupId === Number(RoleGroup.Client)) {
			editableFields = clientEditable;
		}

		return editableFields.includes(controlName);
	}


	public isFieldVisible(controlName: string, roleGroupId: any): boolean {
		const staffingEditable: string[] = [
			'modifyPO', 'requestingManager', 'primaryManager', 'alternateManager', 'stBillRate',
			'otBillRate', 'dtBillRate', 'isTimeEntryAllowed', 'HireCode', 'poOwner',
			'EffectiveDateForCurrentRate', 'hourDistribution', 'hourDistributionEffectiveDate',
			'restBreakEffectiveDate', 'auditLog', 'costAccountingAddNew', 'PODetails', 'MoreDetails'
		],

		 clientEditable: string[] = [
				'poOwner', 'RateUnit', 'vendorSTRate', 'vendorOTRate', 'vendorDTRate',
				'isTimeEntryAllowed', 'hourDistribution', 'hourDistributionEffectiveDate',
				'restMealBreak', 'restBreakEffectiveDate', 'HireCode', 'WagesYearTillDate',
				'backgroundcheck', 'estimatedRegularHoursPerWeek', 'TimeAndExpenseConfigurations',
				'costAccountingAddNew'
			];

		let editableFields: string[] = [];

		if (roleGroupId === Number(RoleGroup.StaffingAgency)) {
			editableFields = staffingEditable;
		} else if (roleGroupId === Number(RoleGroup.Client)) {
			editableFields = clientEditable;
		} else {
			return true;
		}

		return !editableFields.includes(controlName);
	}

	// eslint-disable-next-line max-params
	setRevisionFieldsFlag(revisionFieldList:any, revisionKey:string, currentValue:any, previousValue:any, impactedRevisionFields:any){
		const index = revisionFieldList.findIndex((x:any) =>
			x.Text === revisionKey);
		if(index > magicNumber.minusOne){
			if(currentValue !== previousValue){
				revisionFieldList[index].IsRevisionCreated = true;
				impactedRevisionFields.map((x:any) => {
					const index1 = revisionFieldList.findIndex((y:any) =>
						y.Text === x);
					if(index1 > magicNumber.minusOne){
						revisionFieldList[index1].IsRevisionCreated = true;
					}

				});

			}
		}
	}
	showRevisionFieldsValidation(revisionFieldList:any, key:string){
		return revisionFieldList.some((x:any) =>
			x.Text === key && x.IsRevisionCreated);
	}

	public isControlRevision: WorkAttributes = {
		WorkLocationId: false,
		LaborCategoryId: false,
		JobCategoryId: false,
		AssignmentStartDate: false,
		AssignmentEndDate: false,
		ShiftId: false,
		ModifyPOEndDate: false,
		BaseWageRate: false,
		ActualSTWageRate: false,
		OTWageRate: false,
		DTWageRate: false,
		StaffingAgencyMarkup: false,
		OTRateTypeId: false,
		STBillRate: false,
		OTBillRate: false,
		StaffingAgencySTBillRate: false,
		StaffingAgencyOTBillRate: false,
		StaffingAgencyDTBillRate: false,
		ModifyPObasedOnRevisedRates: false,
		TerminateAssignment: false,
		AddedToDNR: false,
		BackFillRequested: false,
		BackFillStartDate: false,
		BackFillEndDate: false,
		NotifyToStaffingAgency: false,
		DTBillRate: false,
		NewPOFundAmount: false,
		NewPONumber: false,
		PoEffectiveFromDate: false,
		TerminateReasonId: false,
		restMealBreak: false,
		poFundAmount: '',
		shiftWorkingDays: false
	};

	public getRevisionFieldsUpdate(control:string) {
		this.dialogPopupService.showConfirmation('DoYouWantTheSystemToReCalculate', PopupDialogButtons.YesNoDelete);
	}

	// eslint-disable-next-line max-params
	DateStringValidator(
		minLength: number,
		maxLength: number,
		validationMessage?: string,
		dynamicParam: DynamicParam[] = []
	): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (control.value == null) return null;
			const val = control.value,
				controlVal = new Date(val).getTime();

			if (controlVal < minLength) {
				return {
					error: true,
					message: validationMessage ?? 'RangeValidationMessage',
					dynamicParam: dynamicParam
				};
			}

			if (controlVal > maxLength) {
				return {
					error: true,
					message: validationMessage ?? 'RangeValidationMessage',
					dynamicParam: dynamicParam
				};
			}

			return null;
		};
	}


	StatusHeader(assignmentDetails:IAssignmentDetails):DetailItem[]{
		return [
			{
				title: 'Worker Name',
				titleDynamicParam: [],
				item: assignmentDetails?.ContractorName,
				itemDynamicParam: [],
				cssClass: ['basic-title'],
				isLinkable: false,
				link: ''
			},
			{
				title: 'Assignment ID',
				titleDynamicParam: [],
				item: assignmentDetails.AssignmentCode,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			},
			{
				title: 'Job Category',
				titleDynamicParam: [],
				item: assignmentDetails.JobCategoryName,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			}, {
				title: 'Staffing Agency',
				titleDynamicParam: [],
				item: assignmentDetails.StaffingAgencyName,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			}, {
				title: 'Assignment Status',
				titleDynamicParam: [],
				item: assignmentDetails.StatusName,
				itemDynamicParam: [],
				cssClass: [''],
				isLinkable: false,
				link: ''
			}
		];
	}


}


