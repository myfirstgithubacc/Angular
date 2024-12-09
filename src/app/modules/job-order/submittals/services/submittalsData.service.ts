import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { AdditionalData, CalculatedRatesResponse, CreateAddEditApiPayload, ICandidateData, PRDetails, RateDetails, SubmittalDetails, UidConfig } from './Interfaces';
import { ValidationMessageKeys } from './Constants.enum';
import { RequiredStrings } from 'src/app/auth/forgot-password/forgot-password-enums.enum';

@Injectable({
	providedIn: 'root'
})
export class SubmittalsDataService {

	private submittalForm:FormGroup;
	private submittalViewForm: FormGroup;
	private submittalProcessForm: FormGroup;
	private submittalWithdrawForm: FormGroup;
	private resumeForwardForm: FormGroup;

	constructor(
		private fb: FormBuilder,
		private customValidator: CustomValidators,
		private localisationService: LocalizationService
	) { }

	public createSubmittalForm(): FormGroup {
		this.submittalForm = this.fb.group({
			candidateDetails: this.setCandidateForm(),
			rateDetailsMarkup: this.setRateDetailMarkup(),
			rateDetailsBillrate: this.setRateDetailBillRate(),
			positionDescription: this.setPositonDetailsForm(),
			recruiterDetail: this.setRecruiterDetails()
		});
		return this.submittalForm;
	}

	public createSubmittalViewForm(): FormGroup {
		this.submittalViewForm = this.fb.group({
			staffingComment: [null, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam(ValidationMessageKeys.WithdrawcommentbyStaffingAgency, true)))],
			altPhoneControl: [null],
			altPhoneExt: [null],
			canPhoneControl: [null],
			canPhoneExt: [null],
			clientComments: [RequiredStrings.EmptyString]
		});
		return this.submittalViewForm;
	}

	public createSubmittalDeclineForm(): FormGroup {
		this.submittalProcessForm = this.fb.group({
			declineReason: [null, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam(ValidationMessageKeys.DeclineReason, true)))],
			switchDNR: [false],
			radioDNR: [magicNumber.zero],
			declineComment: [null, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam(ValidationMessageKeys.DeclineComment, true)))]
		});
		return this.submittalProcessForm;
	}

	public createResumeForwardForm(): FormGroup {
		this.resumeForwardForm = this.fb.group({
			recipientEmail: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam(ValidationMessageKeys.RecipientEmail, true)))],
			commentsForward: [RequiredStrings.EmptyString]
		});
		return this.resumeForwardForm;
	}

	public createSubmittalWithdrawForm(): FormGroup {
		this.submittalWithdrawForm = this.fb.group({
			withdrawReason: [null, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam(ValidationMessageKeys.WithdrawReason, true)))],
			withdrawComment: [null, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam(ValidationMessageKeys.WithdrawcommentbyStaffingAgency, true)))]
		});
		return this.submittalWithdrawForm;
	}

	public getSubmittalViewForm(): FormGroup{
		return this.submittalViewForm;
	}

	public getEmptyForm(): FormGroup{
		return this.fb.group({});
	}

	private setCandidateForm(): FormGroup {
		return this.fb.group({
			lastName: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('LastName', true)))],
			firstName: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('FirstName', true)))],
			middleName: [RequiredStrings.EmptyString],
			email: [RequiredStrings.EmptyString, [this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('Email', true))), this.customValidator.EmailValidator(ValidationMessageKeys.PleaseEnterAValidEmailAddress)]],
			phoneNumber: [RequiredStrings.EmptyString, [this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('ContactNumber', true))), this.customValidator.FormatValidator(ValidationMessageKeys.PleaseEnterValidContactNumber)]],
			phoneNumberExt: [
				RequiredStrings.EmptyString,
				[this.customValidator.FormatValidator(ValidationMessageKeys.PleaseEnterValidContactNumberExtension)]
			],
			uId: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('UID', true)))],
			workerClassification: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam(ValidationMessageKeys.WorkerClassification, true)))],
			subCategory: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam(ValidationMessageKeys.SubCategoryForWorkerClassification, true)))],
			isPreviouslyWorked: [false],
			workHistoryDetails: [RequiredStrings.EmptyString],
			endDate: [new Date()],
			interviewDate: [RequiredStrings.EmptyString],
			startDate: [RequiredStrings.EmptyString]
		});
	}

	private setRateDetailMarkup(): FormGroup {
		return this.fb.group({
			baseWageRate: [magicNumber.zeroDecimalZero],
			markUp: [magicNumber.zeroDecimalZero],
			otHoursBilledAt: [magicNumber.zero],
			shiftDifferential: [magicNumber.zeroDecimalZero],
			actualWageRate: [magicNumber.zeroDecimalZero],
			markUpNte: [magicNumber.zeroDecimalZero],
			billRate: [magicNumber.zeroDecimalZero],
			reqNte: [magicNumber.zeroDecimalZero]
		});
	}

	private setRateDetailBillRate(): FormGroup {
		return this.fb.group({
			bidRate: [magicNumber.zero],
			otHoursBilledAt: [magicNumber.zero],
			reqNte: [magicNumber.zeroDecimalZero]
		});
	}

	private setPositonDetailsForm(): FormGroup{
		return this.fb.group({
			skillsRequiredValue: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('CandidateRelatedSkills', true)))],
			skillsPreferredValue: [RequiredStrings.EmptyString],
			experienceRequiredValue: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('CandidateRelevantExperience', true)))],
			experiencePreferredValue: [RequiredStrings.EmptyString],
			educationRequiredValue: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('CandidateEducationDetails', true)))],
			educationPreferredValue: [RequiredStrings.EmptyString],
			additionalInfoValue: [RequiredStrings.EmptyString]
		});
	}

	private setRecruiterDetails(): FormGroup {
		return this.fb.group({
			recruiterName: [RequiredStrings.EmptyString, this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam('RecruiterName', true)))],
			recruiterPhoneNumber: [RequiredStrings.EmptyString, [this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('RecruiterPhoneNumber', true))), this.customValidator.FormatValidator(ValidationMessageKeys.PleaseEnterValidContactNumber)]],
			recruiterPhoneNumberExt: [
				RequiredStrings.EmptyString,
				[this.customValidator.FormatValidator(ValidationMessageKeys.PleaseEnterValidContactNumberExtension)]
			],
			recruiterEmail: [RequiredStrings.EmptyString, [this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('RecruiterEmail', true))), this.customValidator.EmailValidator(ValidationMessageKeys.PleaseEnterAValidEmailAddress)]]
		});
	}

	public makeDynamicParam(placeholder:string, IsLocalizeKey:boolean): DynamicParam{
		return {Value: placeholder, IsLocalizeKey: IsLocalizeKey} as DynamicParam;
	}

	private getLocalizedMessage(message:string, placeholder1:DynamicParam|null = null, placeholder2:DynamicParam|null = null ): string{
		let finalMessage:string;
		if(placeholder1 && !placeholder2){
			finalMessage = this.localisationService.GetLocalizeMessage(message, [placeholder1]);
		}
		else if(placeholder1 && placeholder2){
			finalMessage = this.localisationService.GetLocalizeMessage(message, [placeholder1, placeholder2]);
		}
		else{
			finalMessage = this.localisationService.GetLocalizeMessage(message);
		}
		return finalMessage;
	}

	public patchSubmittalForm(submittalData: SubmittalDetails): void{
		this.patchCandidateDetailsForm(submittalData, null, null);
		this.patchPositionDetailsForm(submittalData);
	}

	public patchCandidateDetailsForm(
		submittalData:SubmittalDetails | null,
		iCandidateData: ICandidateData | null,
		uidConfig: UidConfig | null
	): void{
		let candidateData;

		if(submittalData){
			candidateData = {
				firstName: submittalData.FirstName,
				lastName: submittalData.LastName,
				middleName: submittalData.MiddleName,
				email: submittalData.Email,
				phoneNumber: submittalData.PhoneNumber,
				phoneNumberExt: submittalData.PhoneExt,
				uId: submittalData.UId,
				subCategory: submittalData.ScWorkerClassificationName,
				isPreviouslyWorked: submittalData.HasWorkedPreviouslyAtClient,
				workHistoryDetails: submittalData.PreviousExperienceDescription,
				endDate: new Date(submittalData.PreviousAssignmentEndDate),
				interviewDate: submittalData.InterviewAvailability,
				startDate: submittalData.StartAvailability
			};
		}
		else if(iCandidateData){
			candidateData = {
				firstName: iCandidateData.CandidateFirstName,
				lastName: iCandidateData.CandidateLastName,
				middleName: iCandidateData.CandidateMiddleInitial,
				email: iCandidateData.EmailAddress,
				phoneNumber: iCandidateData.ContactNumber,
				phoneNumberExt: iCandidateData.PhoneNumberExt,
				uId: iCandidateData.UId,
				isPreviouslyWorked: false
			};
		}
		this.submittalForm.get('candidateDetails')?.patchValue(candidateData);
	}

	public patchMarkupForm(profReqData:PRDetails|RateDetails): void{
		this.submittalForm.get('rateDetailsMarkup')?.get('baseWageRate')?.setValue(profReqData.BaseWageRate);
		this.submittalForm.get('rateDetailsMarkup')?.get('markUp')?.setValue(profReqData.MarkupPercent);
		this.submittalForm.get('rateDetailsMarkup')?.get('otHoursBilledAt')?.setValue(profReqData.OvertimeHoursBilledAtId);
		this.submittalForm.get('rateDetailsMarkup')?.get('shiftDifferential')?.setValue(profReqData.AdderOrMultiplierValue);
		this.submittalForm.get('rateDetailsMarkup')?.get('billRate')?.setValue(profReqData.BillRate);
		this.submittalForm.get('rateDetailsMarkup')?.get('markUpNte')?.setValue(profReqData.NteMarkupPercent);
	}

	public patchBillRateForm(profReqData:PRDetails|RateDetails): void{
		const billRate = {
			bidRate: profReqData.BillRate,
			otHoursBilledAt: profReqData.OvertimeHoursBilledAtId
		};
		this.submittalForm.get('rateDetailsBillrate')?.patchValue(billRate);
	}

	private patchPositionDetailsForm(submittalData:SubmittalDetails): void{
		const positionDetails = {
			skillsRequiredValue: submittalData.CanSkillsRequired,
			skillsPreferredValue: submittalData.CanSkillsPreferred,
			experienceRequiredValue: submittalData.CanExperienceRequired,
			experiencePreferredValue: submittalData.CanExperiencePreferred,
			educationRequiredValue: submittalData.CanEducationRequired,
			educationPreferredValue: submittalData.CanEducationPreferred,
			additionalInfoValue: submittalData.CanRelevantInformation
		};
		this.submittalForm.get('positionDescription')?.patchValue(positionDetails);
	}

	public patchRecruiterDetails(submittalData: SubmittalDetails): void{
		this.submittalForm.get('recruiterDetail')?.get('recruiterName')?.setValue({Text: submittalData.RecruiterName, Value: submittalData.RecruiterUserNo.toString() });
		this.submittalForm.get('recruiterDetail')?.get('recruiterPhoneNumber')?.setValue(submittalData.RecruiterPhone);
		this.submittalForm.get('recruiterDetail')?.get('recruiterPhoneNumberExt')?.setValue(submittalData.RecruiterPhoneExt);
		this.submittalForm.get('recruiterDetail')?.get('recruiterEmail')?.setValue(submittalData.RecruiterEmail);
	}

	public setValidationsMarkup(): void{
		const markUpForm = this.submittalForm.get('rateDetailsMarkup');
		markUpForm?.get('baseWageRate')?.setValidators([this.rateRangeValidator()]);
		markUpForm?.get('markUp')?.setValidators([this.validationOnMarkUpOrBillRate(true), this.rateRangeValidator()]);
		markUpForm?.get('otHoursBilledAt')?.setValidators(this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam('OTHoursBilledAt', true))));
	}

	private validationOnMarkUpOrBillRate(isRateMarkupBased: boolean): ValidatorFn{
		return isRateMarkupBased
			? (control: AbstractControl): ValidationErrors | null => {
				const markUpNte = this.submittalForm.get('rateDetailsMarkup')?.get('markUpNte')?.value;
				if (control.value > markUpNte) {
					return { error: true, message: this.getLocalizedMessage(
						ValidationMessageKeys.MarkUpCannotExceedMarkUpNTE,
						this.makeDynamicParam(parseFloat(markUpNte).toFixed(magicNumber.three), false)
					)};
				}
				return null;
			}
			: (control: AbstractControl): ValidationErrors | null => {
				const reqNte = this.submittalForm.get('rateDetailsBillrate')?.get('reqNte')?.value;
				if (control.value > reqNte) {
					return { error: true, message: this.getLocalizedMessage(
						ValidationMessageKeys.BidRateCannotBeGreaterThanNTE,
						this.makeDynamicParam(parseFloat(reqNte).toFixed(magicNumber.two), false)
					)};
				}
				return null;
			};
	}

	public setValidationsBillRate(): void{
		const billRateForm = this.submittalForm.get('rateDetailsBillrate');
		billRateForm?.get('bidRate')?.setValidators([this.rateRangeValidator, this.validationOnMarkUpOrBillRate(false)]);
		billRateForm?.get('otHoursBilledAt')?.setValidators(this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseSelectData', this.makeDynamicParam('OTHoursBilledAt', true))));
	}

	public setValidationsCanDetails(isPreviouslyWorked: boolean): void{
		const candidateDetails = this.submittalForm.get('candidateDetails');
		if(isPreviouslyWorked){
			candidateDetails?.get('workHistoryDetails')?.setValidators(this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam(ValidationMessageKeys.PreviousWorkHistoryDetails, true))));
		}
		else{
			candidateDetails?.get('workHistoryDetails')?.clearValidators();
			candidateDetails?.get('workHistoryDetails')?.updateValueAndValidity();
		}
	}

	// eslint-disable-next-line max-lines-per-function
	public prepareUpdateSubmittalPayload(
		submittalData: SubmittalDetails,
		additionalData: AdditionalData,
		calculatedRates: CalculatedRatesResponse
	): CreateAddEditApiPayload{
		const submittalFormData = this.submittalForm.value,
			payload ={
				UKey: submittalData.SubmittalUkey,
				FirstName: submittalFormData.candidateDetails.firstName,
				MiddleName: submittalFormData.candidateDetails.middleName,
				LastName: submittalFormData.candidateDetails.lastName,
				Email: submittalFormData.candidateDetails.email,
				PhoneNumber: submittalFormData.candidateDetails.phoneNumber,
				PhoneExt: submittalFormData.candidateDetails.phoneNumberExt,
				UId: submittalFormData.candidateDetails.uId,
				WorkerClassificationId: submittalFormData.candidateDetails.workerClassification?.Value,
				IsWcSubCategoryRequired: additionalData.isW2Employee,
				WCSubCategory: submittalFormData.candidateDetails.subCategory,
				HasWorkedPreviouslyAtClient: submittalFormData.candidateDetails.isPreviouslyWorked,
				PreviousExperienceDescription: submittalFormData.candidateDetails.workHistoryDetails,
				PreviousAssignmentEndDate: submittalFormData.candidateDetails.endDate,
				InterviewAvailability: submittalFormData.candidateDetails.interviewDate,
				StartAvailability: submittalFormData.candidateDetails.startDate,
				IsRateMarkupBasedVariant: additionalData.isMarkupBasedVariant,
				BaseWageRate: calculatedRates.BaseWageRate,
				ActualStWageRate: calculatedRates.ActualStWageRate,
				SubmittedMarkup: submittalFormData.rateDetailsMarkup.markUp,
				ShiftDifferential: additionalData.shiftDifferentialMethod,
				BidRate: additionalData.isMarkupBasedVariant
					? submittalFormData.rateDetailsMarkup.billRate
					: submittalFormData.rateDetailsBillrate.bidRate,
				OtHoursBilledAtId: additionalData.isMarkupBasedVariant
					? submittalFormData.rateDetailsMarkup.otHoursBilledAt
					: submittalFormData.rateDetailsBillrate.otHoursBilledAt,
				OtWageRate: calculatedRates.OtWageRate,
				DtWageRate: calculatedRates.DtWageRate,
				StBillRate: calculatedRates.StBillRate,
				OtBillRate: calculatedRates.OtBillRate,
				DtBillRate: calculatedRates.DtBillRate,
				StaffingAgencyStBillRate: calculatedRates.StaffingAgencyStBillRate,
				StaffingAgencyOtBillRate: calculatedRates.StaffingAgencyOtBillRate,
				StaffingAgencyDtBillRate: calculatedRates.StaffingAgencyDtBillRate,
				NteRate: submittalFormData.rateDetailsMarkup.reqNte,
				SkillsRequired: submittalFormData.positionDescription.skillsRequiredValue,
				SkillsPreferred: submittalFormData.positionDescription.skillsPreferredValue,
				ExperienceRequired: submittalFormData.positionDescription.experienceRequiredValue,
				ExperiencePreferred: submittalFormData.positionDescription.experiencePreferredValue,
				EducationRequired: submittalFormData.positionDescription.educationRequiredValue,
				EducationPreferred: submittalFormData.positionDescription.educationPreferredValue,
				AdditionalInformation: submittalFormData.positionDescription.additionalInfoValue,
				RecruiterUserNo: parseInt(submittalFormData.recruiterDetail.recruiterName?.Value),
				RecruiterName: submittalFormData.recruiterDetail.recruiterName?.Text,
				RecruiterPhone: submittalFormData.recruiterDetail.recruiterPhoneNumber,
				RecruiterPhoneExt: submittalFormData.recruiterDetail.recruiterPhoneNumberExt,
				RecruiterEmail: submittalFormData.recruiterDetail.recruiterEmail,
				RequestUkey: submittalData.RequestUkey,
				RequestId: additionalData.requestId,
				IsW2Employee: additionalData.isW2Employee,
				IsRetiree: submittalData.IsRetiree,
				RetireeTypeId: submittalData.RetireeTypeId,
				ShiftMultiplyer: calculatedRates.ShiftMultiplier,
				IsResumeAttached: submittalData.IsResumeAttached,
				Status: additionalData.status,
				StatusId: additionalData.statusId,
				JobDescription: additionalData.positionDescription,
				FirstDayReportingInstruction: submittalData.FirstDayReportingInstruction,
				SectorId: additionalData.sectorId,
				DmsFieldRecords: additionalData.documentData,
				UdfFieldRecords: additionalData.udfData,
				BenefitAddDto: additionalData.benefitAddDto,
				RequestStartDate: new Date(additionalData.requestStartDate)
		  	};
		return payload;
	}

	// eslint-disable-next-line max-lines-per-function
	public prepareCreateSubmittalData( additionalData: AdditionalData, calculatedRates: CalculatedRatesResponse): CreateAddEditApiPayload{
		const submittalFormData = this.submittalForm.value,
			payload = {
				FirstName: submittalFormData.candidateDetails.firstName,
				MiddleName: submittalFormData.candidateDetails.middleName,
				LastName: submittalFormData.candidateDetails.lastName,
				Email: submittalFormData.candidateDetails.email,
				PhoneNumber: submittalFormData.candidateDetails.phoneNumber,
				PhoneExt: submittalFormData.candidateDetails.phoneNumberExt,
				UId: submittalFormData.candidateDetails.uId,
				WorkerClassificationId: submittalFormData.candidateDetails.workerClassification?.Value,
				IsWcSubCategoryRequired: additionalData.isW2Employee,
				WCSubCategory: submittalFormData.candidateDetails.subCategory,
				HasWorkedPreviouslyAtClient: submittalFormData.candidateDetails.isPreviouslyWorked,
				PreviousExperienceDescription: submittalFormData.candidateDetails.workHistoryDetails,
				PreviousAssignmentEndDate: submittalFormData.candidateDetails.endDate,
				InterviewAvailability: submittalFormData.candidateDetails.interviewDate,
				StartAvailability: submittalFormData.candidateDetails.startDate,
				IsRateMarkupBasedVariant: additionalData.isMarkupBasedVariant,
				BaseWageRate: submittalFormData.rateDetailsMarkup.baseWageRate,
				ActualStWageRate: calculatedRates.ActualStWageRate,
				SubmittedMarkup: submittalFormData.rateDetailsMarkup.markUp,
				ShiftDifferential: additionalData.shiftDifferentialMethod,
				BidRate: additionalData.isMarkupBasedVariant
					? submittalFormData.rateDetailsMarkup.billRate
					: submittalFormData.rateDetailsBillrate.bidRate,
				OtHoursBilledAtId: additionalData.isMarkupBasedVariant
					? submittalFormData.rateDetailsMarkup.otHoursBilledAt
					:submittalFormData.rateDetailsBillrate.otHoursBilledAt,
				OtWageRate: calculatedRates.OtWageRate,
				DtWageRate: calculatedRates.DtWageRate,
				StBillRate: calculatedRates.StBillRate,
				OtBillRate: calculatedRates.OtBillRate,
				DtBillRate: calculatedRates.DtBillRate,
				StaffingAgencyStBillRate: calculatedRates.StaffingAgencyStBillRate,
				StaffingAgencyOtBillRate: calculatedRates.StaffingAgencyOtBillRate,
				StaffingAgencyDtBillRate: calculatedRates.StaffingAgencyDtBillRate,
				NteRate: submittalFormData.rateDetailsMarkup.reqNte,
				SkillsRequired: submittalFormData.positionDescription.skillsRequiredValue,
				SkillsPreferred: submittalFormData.positionDescription.skillsPreferredValue,
				ExperienceRequired: submittalFormData.positionDescription.experienceRequiredValue,
				ExperiencePreferred: submittalFormData.positionDescription.experiencePreferredValue,
				EducationRequired: submittalFormData.positionDescription.educationRequiredValue,
				EducationPreferred: submittalFormData.positionDescription.educationPreferredValue,
				AdditionalInformation: submittalFormData.positionDescription.additionalInfoValue,
				RecruiterUserNo: parseInt(submittalFormData.recruiterDetail.recruiterName?.Value),
				RecruiterName: submittalFormData.recruiterDetail.recruiterName?.Text,
				RecruiterPhone: submittalFormData.recruiterDetail.recruiterPhoneNumber,
				RecruiterPhoneExt: submittalFormData.recruiterDetail.recruiterPhoneNumberExt,
				RecruiterEmail: submittalFormData.recruiterDetail.recruiterEmail,
				RequestId: additionalData.requestId,
				IsW2Employee: additionalData.isW2Employee,
				IsRetiree: false,
				RetireeTypeId: 0,
				ShiftMultiplyer: calculatedRates.ShiftMultiplier,
				IsResumeAttached: false,
				Status: additionalData.status,
				StatusId: additionalData.statusId,
				JobDescription: additionalData.positionDescription,
				FirstDayReportingInstruction: RequiredStrings.EmptyString,
				SectorId: additionalData.sectorId,
				DmsFieldRecords: additionalData.documentData,
				UdfFieldRecords: additionalData.udfData,
				BenefitAddDto: additionalData.benefitAddDto,
				RequestStartDate: new Date(additionalData.requestStartDate)
		  	};
		return payload;
	}

	public isBillRateValid(): boolean{
		const stBillRate = this.submittalForm.get('rateDetailsMarkup')?.get('billRate')?.value,
			exceedsNTE = stBillRate > this.submittalForm.get('rateDetailsMarkup')?.get('reqNte')?.value;
		if(exceedsNTE){
			return false;
		}
		return true;
	}

	public setValidationOnUid(uidConfig: UidConfig | null): void{
		if(uidConfig){
			this.submittalForm.get('candidateDetails')?.get('uId')?.setValidators([
				this.customValidator.RequiredValidator(this.getLocalizedMessage('PleaseEnterData', this.makeDynamicParam('UID', true))),
				this.rangeValidator(uidConfig.MaxLength)
			]);
			this.submittalForm.get('candidateDetails')?.get('uId')?.updateValueAndValidity();
		}
	}

	private rangeValidator(allowedLength:number): ValidatorFn{
		return (control: AbstractControl): ValidationErrors | null => {
			if(control.value == RequiredStrings.EmptyString || control.value.toString().length == allowedLength){
				return null;
			}
			return {
				error: true,
				message: this.getLocalizedMessage(
					ValidationMessageKeys.PleaseEnterAllowedLengthOfUID,
					this.makeDynamicParam(allowedLength.toString(), false)
				)
			};
		};
	}

	private rateRangeValidator(): ValidatorFn{
		return (control: AbstractControl): ValidationErrors | null => {
			if((control.value != magicNumber.zero && control.value > magicNumber.zeroDecimalZero && control.value < magicNumber.oneThousand) ){
				return null;
			}
			return {error: true, message: ValidationMessageKeys.ValueShouldBeBelowThousand};
		};
	}

}
