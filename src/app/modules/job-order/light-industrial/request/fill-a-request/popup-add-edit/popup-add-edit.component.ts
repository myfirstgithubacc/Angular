import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { LightIndustrialService } from '../../../services/light-industrial.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CandidatePoolService } from 'src/app/services/masters/candidate-pool.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { LightIndustrialPopupService } from '../../../services/light-industrial-popup.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import {
	CandidateInterface, IAssignmentRatePayload, IOnboardingData, ISectorDetailForReqConfig, IStaffingMarkupPayload, IUIDConfig,
	IWageRateDetails, IWageRatePayload, PopupData, WageRateOptionInterface
} from '../../../models/fill-a-request.model';
import { AdditionalWorkFlows } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';
import { OnboardingRequirementsComponent } from '@xrm-shared/common-components/onboarding-requirements/onboarding-requirements.component';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { IUdfData } from '../../../interface/li-request.interface';
import { IOnboardingPayloadData } from '@xrm-shared/common-components/onboarding-requirements/utils/onboarding-requirement.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { CandidatePoolAddEdit } from '@xrm-core/models/candidate-pool/add-edit/candidate-pool-add-edit.model';
import { ICandidateData } from 'src/app/modules/job-order/review-candidates/interface/review-candidate.interface';

@Component({
	selector: 'app-popup-add-edit',
	templateUrl: './popup-add-edit.component.html',
	styleUrls: ['./popup-add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class PopupAddEditComponent implements OnInit, OnDestroy {
	@ViewChild('dms', { static: false }) dmsImplementation: DmsImplementationComponent;
	@ViewChild('onboarding', { static: false }) onboardingRequirements: OnboardingRequirementsComponent;
	public isEditMode: boolean = false;
	public isNewCandidate: boolean = false;
	public isExistingCandidate: boolean = false;
	public candidateForm: FormGroup;
	public isMarkupVisible: boolean = true;
	public allowSelectionPayRate: boolean = false;
	public radioValueWageRate: WageRateOptionInterface[] = [];
	public assignmentRate: number = magicNumber.zero;
	public baseWageRate: number = magicNumber.zero;
	public isScheduleStartDateReadable: boolean = false;
	private liRequestDetails: PopupData;
	public maxSubmittedMarkup: number = magicNumber.zero;
	// candidate pool details in case of existing candidate
	public candidatePoolDetails: any;
	// candidate details in case of filled candidate
	public candidateDetails: any;
	public entityIdBenefitAdder: number = XrmEntities.LightIndustrialRequest;
	public benefitAdderListArray: IBenefitData[] = [];
	public requestId: number = magicNumber.zero;
	public reqLibraryId: number = magicNumber.zero;
	// use in onboarding for existing and for edit change to "LICandidate"
	public entityIdOnboarding: number = XrmEntities.CandidatePool;
	public actionTypeIdEdit: number = ActionType.Edit;
	public widgetChangeDetected: boolean = false;
	public showDocumentUploadscard: boolean = true;
	public isPendingResultSection: boolean = true;
	public isDrugScreen: boolean = false;
	public isBackgroundCheck: boolean = false;
	public parentInfosDrugScreen: any;
	public parentInfosBackgroundCheck: any;
	public locationId: number = magicNumber.zero;
	private onboardingData: IOnboardingPayloadData[] = [];

	public countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
	public localizeCurrency: DynamicParam[] = [
		{
			Value: this.localizationService.GetCulture(CultureFormat.CurrencyCode, this.countryId),
			IsLocalizeKey: false
		}
	];

	public recordUKey: string = '';
	public entityIdCandidate = XrmEntities.LICandidate;
	public candidateUkey: string = '';
	public actionTypeId: number = ActionType.Add;
	// public uploadStageId: number = DocumentUploadStage.On_Boarding;
	public uploadStageId: number = magicNumber.zero;
	public recordId: number = magicNumber.zero;
	public sectorId: number = magicNumber.zero;
	public udfData: IPreparedUdfPayloadData[] = [];
	public hasUdfData: boolean;
	public hasDmsData: boolean;

	public uIdConfig: IUIDConfig;
	public uIdConfigLabelName: string = "UID";
	public uIdConfigTooltip: string = "";
	public uIdMaxCharecters: number = magicNumber.fifteen;
	// pass this for additional data set as object for multiple workflow, record and isParentWorkflow
	public additionalWorkFlows: AdditionalWorkFlows[] = [];
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private lightIndustrialService: LightIndustrialService,
		private formBuilder: FormBuilder,
		private loaderService: LoaderService,
		private activatedRoute: ActivatedRoute,
		public udfCommonMethods: UdfCommonMethods,
		private candidatePoolService: CandidatePoolService,
		private lightIndustrialPopupService: LightIndustrialPopupService,
		private toasterService: ToasterService,
		private customValidators: CustomValidators,
		public localizationService: LocalizationService,
		private cdr: ChangeDetectorRef
	) {
		this.initializeCandidateForm();
	}

	ngOnInit(): void {
		this.loaderService.isBusy.next(true);
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			// here recordUKey is the candidate ukey which is sent in case of edit filled candidate and select existing candidate
			this.recordUKey = param['uKey'];
			this.liRequestDetails = param['liRequestData'];
			this.patchFormData(this.liRequestDetails);
			this.getSectorConfig();
			if (this.recordUKey) {
				if (this.liRequestDetails.uKey) {
					// filled tentative candidate- here liRequestDetails.uKey is the candidate ukey which will get in case of filled candidate
					this.getCandidateById(this.liRequestDetails.uKey);
					this.actionTypeId = ActionType.Edit;

					// for edit tentative candidate entity id will be 28 as li candidate
					this.entityIdOnboarding = XrmEntities.LICandidate;
					this.isEditMode = true;
				} else {
					// existing candidate - here liRequestDetails.uKey = null in case of select existing candidate as the candidate not filled yet
					this.isExistingCandidate = true;
					this.actionTypeId = ActionType.Edit;
					this.getCandidatePoolById(param['uKey']);
					this.getMarkupValue();
					this.getSectorUIdConfig();
				}
			} else {
				// create new candidate
				this.isNewCandidate = true;
				this.getMarkupValue();
				this.getSectorUIdConfig();
				this.addValidationOnNewCandidate();
				// patch schedule start date if start date no later than is not null
				if (!this.liRequestDetails.startDateNoLaterThan) {
					this.candidateForm.patchValue({
						scheduleStartDate: new Date(this.liRequestDetails.targetStartDate)
					});
				}
				this.isScheduleStartDateReadable = this.checkScheduleStartDateReadable(this.liRequestDetails.startDateNoLaterThan);
			}
		});
	}

	// initialize candidate form
	private initializeCandidateForm() {
		this.candidateForm = this.formBuilder.group({
			firstName: [null],
			middleName: [null],
			lastName: [null],
			uId: [null],
			baseWageRate: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'WageRate', IsLocalizeKey: true }])]],
			submittedMarkup: [null, [this.customValidators.RequiredValidator('SubmittedMarkupcannotblank')]],
			scheduleStartDate: [null, [this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'ScheduleStartDate', IsLocalizeKey: true }])]],
			vendorSTBillRate: [magicNumber.zero]
		});
	}

	private createWageRateRadioGroup(baseWageRate: number, assignmentRate: number) {
		this.radioValueWageRate = [
			{ Text: `${baseWageRate} (From Request)`, Value: baseWageRate },
			{ Text: `${assignmentRate} (From recent Assignment)`, Value: assignmentRate }
		];
	}

	private patchFormData(liRequestDetails: PopupData) {
		this.candidateForm.patchValue({
			baseWageRate: liRequestDetails.baseWageRate
		});
		this.sectorId = liRequestDetails.sectorId;
		this.requestId = liRequestDetails.requestId;
		this.reqLibraryId = liRequestDetails.reqLibraryId;
		this.isDrugScreen = liRequestDetails.isDrugScreenSection;
		this.isBackgroundCheck = liRequestDetails.isBackgroundCheckSection;
		this.locationId = liRequestDetails.locationId;
		this.baseWageRate = liRequestDetails.baseWageRate;
		this.udfCommonMethods.manageParentsInfo(XrmEntities.Sector, this.sectorId);
		this.udfCommonMethods.manageParentsInfo(XrmEntities.LightIndustrialRequest, this.requestId);
	}

	private checkScheduleStartDateReadable(startDateNoLaterThan: Date | null): boolean {
		if (startDateNoLaterThan) {
			return false;
		}
		return true;
	}

	//  start date no later add custom validators for date
	public onScheduleStartDateChange() {
		const ctrl1 = this.candidateForm.controls['scheduleStartDate'];
		ctrl1.addValidators(this.scheduleStartDateValidator(this.liRequestDetails));
		ctrl1.updateValueAndValidity();
	}

	private scheduleStartDateValidator(compareWithDates: any): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (compareWithDates == null) return null;
			const scheduleStartDate = Date.parse(control.value),
				startDateNoLaterThan = Date.parse(compareWithDates.startDateNoLaterThan),
				targetStartDate = Date.parse(compareWithDates.targetStartDate),
				targetEndDate = Date.parse(compareWithDates.targetEndDate),
				endDate = Date.parse(compareWithDates.endDate);

			if (scheduleStartDate > startDateNoLaterThan) {
				return {
					error: true,
					message: this.localizationService.GetLocalizeMessage('ScheduledStartDateGreaterThanValidation', [{ Value: this.localizationService.TransformDate(compareWithDates.startDateNoLaterThan), IsLocalizeKey: false }])
				};
			}
			if (scheduleStartDate < targetStartDate) {
				return {
					error: true,
					message: 'ScheduledStartDateLessThanValidation'
				};
			}
			if (scheduleStartDate > targetEndDate) {
				return {
					error: true,
					message: 'ScheduleDateTargetEndDateValidation'
				};
			}
			if (scheduleStartDate > endDate) {
				return {
					error: true,
					message: 'ScheduledStartDateTenureValidation'
				};
			}
			return null;
		};
	}

	/**
	 * @description This method is used only in case when popup is opened for filled candidate then we are getting candidate details
	*/
	// #region in case of filled candidate
	private getCandidateById(candidateUkey: string) {
		this.lightIndustrialService.getCandidateByUkey(candidateUkey).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<ICandidateData>) => {
				this.candidateDetails = data.Data;
				this.recordId = this.candidateDetails.CandidateId;
				this.patchCandidateDetails(this.candidateDetails);
				this.actionTypeId = ActionType.Edit;
				this.candidateUkey = this.candidateDetails.UKey;
				this.cdr.markForCheck();
			});
	}

	private patchCandidateDetails(candidateDetails: ICandidateData) {
		this.candidateForm.patchValue({
			firstName: candidateDetails.FirstName,
			middleName: candidateDetails.MiddleName,
			lastName: candidateDetails.LastName,
			uId: candidateDetails.UId,
			submittedMarkup: candidateDetails.SubmittedMarkup,
			vendorSTBillRate: candidateDetails.VendorStRate,
			scheduleStartDate: new Date(this.liRequestDetails.targetStartDate)
		});
		this.isScheduleStartDateReadable = this.checkScheduleStartDateReadable(this.liRequestDetails.startDateNoLaterThan);
		const data: IStaffingMarkupPayload = {
			"laborCategoryId": this.liRequestDetails.laborCategoryId,
			"locationId": this.liRequestDetails.locationId
		};
		this.lightIndustrialService.getStaffingMarkup(data).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<number>) => {
				if (res.Succeeded && res.Data) {
					this.maxSubmittedMarkup = res.Data;
					this.setSubmittedMarkupValidators();
				}
			});
	}

	/**
	 * @description This method is used only in case when popup is opened for existing candidate then we are getting candidate pool details
	 * @param recordId will be the candidate pool id which is used to get candidate pool details of dms
	 * @method patchParentInfosDrugScreen is used to send drugscreen and drugresultdate to onboarding component
	 * @method patchParentInfosBackgroundCheck is used to send backgroundcheck and backgroundresultdate to onboarding component
	*/
	private getCandidatePoolById(uKey: string) {
		this.candidatePoolService.getAllCandidatePoolByUkey(uKey).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((data: GenericResponseBase<CandidatePoolAddEdit>) => {
				if (data.Succeeded) {
					this.candidatePoolDetails = data.Data;
					this.recordId = Number(magicNumber.zero);
					this.patchCandidatePoolDetails(this.candidatePoolDetails);
					this.getRecentAssigmentRates();
					this.patchParentInfosDrugScreen(this.candidatePoolDetails);
					this.patchParentInfosBackgroundCheck(this.candidatePoolDetails);
					this.udfCommonMethods.manageParentsInfo(XrmEntities.CandidatePool, this.recordId);
					// send addition work flow id and entity id to dms
					this.sendAdditionalWorkFlows();
				}
			});
	}

	private patchCandidatePoolDetails(candidatePoolDetails: CandidatePoolAddEdit) {
		this.candidateForm.patchValue({
			firstName: candidatePoolDetails.CandidateFirstName,
			middleName: candidatePoolDetails.CandidateMiddleInitial,
			lastName: candidatePoolDetails.CandidateLastName,
			uId: this.removeSpaces(candidatePoolDetails.UId)
		});

		// patch schedule start date if start date no later than is not null
		if (!this.liRequestDetails.startDateNoLaterThan) {
			this.candidateForm.patchValue({
				scheduleStartDate: new Date(this.liRequestDetails.targetStartDate)
			});
		}
		this.isScheduleStartDateReadable = this.checkScheduleStartDateReadable(this.liRequestDetails.startDateNoLaterThan);
	}

	private removeSpaces(str: string): string {
		return str.split(' ').join('');
	}

	private patchParentInfosDrugScreen(candidatePoolDetails: CandidatePoolAddEdit) {
		let drugScreenResultId: number | null;
		if (candidatePoolDetails.DrugScreenId === Number(magicNumber.oneNintyNine) ||
			candidatePoolDetails.DrugScreenId === Number(magicNumber.twoHundred)) {
			drugScreenResultId = candidatePoolDetails.DrugScreenId;
		} else {
			// Check for completed case: if drugscreen id is 216, take 198 (positive with exception)
			drugScreenResultId = candidatePoolDetails.DrugScreenResultId === Number(magicNumber.eightySeven)
				// 87 is the positive id, if it is positive then we are taking 198 which is positive with exception
				? Number(magicNumber.oneNintyEight)
				: candidatePoolDetails.DrugScreenResultId;
		}
		this.parentInfosDrugScreen = {
			drugScreenId: candidatePoolDetails.DrugScreenId,
			drugScreenResultId: drugScreenResultId,
			drugResultDate: candidatePoolDetails.DrugResultDate
		};
		this.cdr.markForCheck();
	}

	// only in case when popup is opened for existing pool candidate
	private patchParentInfosBackgroundCheck(candidatePoolDetails: CandidatePoolAddEdit) {
		this.parentInfosBackgroundCheck = {
			backgroundCheckScreen: candidatePoolDetails.BackgroundCheckId,
			backgroundResultDate: candidatePoolDetails.BackgroundResultDate
		};
	}

	private sendAdditionalWorkFlows() {
		this.additionalWorkFlows = [
			{
				"workFlowId": Number(XrmEntities.CandidatePool),
				"recordId": Number(this.candidatePoolDetails.Id),
				"isParentWorkflow": false,
				"IsDraft": false
			}
		];
	}

	private getMarkupValue() {
		const data: IStaffingMarkupPayload = {
			"laborCategoryId": this.liRequestDetails.laborCategoryId,
			"locationId": this.liRequestDetails.locationId
		};
		this.lightIndustrialService.getStaffingMarkup(data).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<number>) => {
				if (res.Succeeded && res.Data !== null && res.Data !== undefined) {
					this.candidateForm.get('submittedMarkup')?.setValue(res.Data);
					this.maxSubmittedMarkup = res.Data;
					this.setSubmittedMarkupValidators();
					this.getRateValue(this.maxSubmittedMarkup);
				} else {
					this.maxSubmittedMarkup = magicNumber.zero;
					this.candidateForm.get('submittedMarkup')?.setValue(magicNumber.zero);
					this.candidateForm.get('vendorSTBillRate')?.setValue(magicNumber.zero);
					this.setSubmittedMarkupValidators();
				}
			});
	}

	private setSubmittedMarkupValidators() {
		const ctrl1 = this.candidateForm.controls['submittedMarkup'],
			maxMarkup = (this.maxSubmittedMarkup.toFixed(magicNumber.two)).toString();
		ctrl1.addValidators(this.customValidators.RangeValidator(magicNumber.zero, this.maxSubmittedMarkup, 'SubmittedMarkupValidation', [{ Value: maxMarkup, IsLocalizeKey: false }]));
		ctrl1.updateValueAndValidity({ onlySelf: true });
	}

	private getSectorConfig() {
		this.lightIndustrialService.getSectorDetailForReqConfic(this.sectorId)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<ISectorDetailForReqConfig>) => {
				if (res.Succeeded && res.Data) {
					this.isMarkupVisible = res.Data.MaskSubmittedMarkUpAndWageRate;
					this.allowSelectionPayRate = res.Data.AllowSelectionPayRateFillLiRequest;
					this.cdr.markForCheck();
				}
			});
	}

	private getRecentAssigmentRates() {
		const data: IAssignmentRatePayload = {
			"sectorId": this.sectorId,
			"firstName": this.candidatePoolDetails?.CandidateFirstName,
			"lastName": this.candidatePoolDetails?.CandidateLastName,
			"uId": this.candidatePoolDetails?.UId
		};
		this.lightIndustrialService.getAssigmentRate(data)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<number>) => {
				if (res.Succeeded && res.Data) {
					this.assignmentRate = res.Data;
					this.cdr.markForCheck();
					this.createWageRateRadioGroup(this.baseWageRate, this.assignmentRate);
				}
			});
	}

	public getRateValue(percent: number | null) {
		if (percent == null) {
			this.candidateForm.get('vendorSTBillRate')?.setValue(magicNumber.zero);
			return;
		}
		const data: IWageRatePayload = {
			"requestId": this.liRequestDetails.requestId,
			"positionId": this.liRequestDetails.positionId,
			"baseWageRate": this.liRequestDetails.baseWageRate,
			"submittedMarkup": Number(percent)
		};
		this.lightIndustrialService.getRateValue(data)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<IWageRateDetails>) => {
				if (res.Succeeded && res.Data) {
					const vendorSTBillRate = (res.Data.StaffingAgencyStBillRate).toFixed(Number(magicNumber.two));
					this.candidateForm.get('vendorSTBillRate')?.setValue(vendorSTBillRate);
					this.cdr.markForCheck();
				} else {
					this.candidateForm.get('vendorSTBillRate')?.setValue(magicNumber.zero);
				}
			});
	}

	private getSectorUIdConfig() {
		this.lightIndustrialService.getSectorUIDConfig(this.sectorId)
			.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<IUIDConfig>) => {
				if (res.Succeeded && res.Data) {
					this.uIdConfig = res.Data;
					this.uIdConfigLabelName = this.uIdConfig.LabelName || "UID";
					this.uIdConfigTooltip = this.uIdConfig.ToolTip;
					this.uIdMaxCharecters = this.uIdConfig.MaxLength;
					this.uIdValidationBasedOnSectorUIdConfig(this.uIdConfig);
					this.cdr.markForCheck();
				}
			});
	}

	private uIdValidationBasedOnSectorUIdConfig(uIdConfig: IUIDConfig) {
		const ctrl1 = this.candidateForm.controls['uId'] as AbstractControl;
		ctrl1.addValidators([
			this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: this.uIdConfigLabelName, IsLocalizeKey: false }]),
			this.customValidators.MinLengthValidator(
				uIdConfig.MaxLength,
				uIdConfig.IsNumeric
					? 'UID_NumericValidation'
					: 'UID_AlphaNumericValidation',
				[{ Value: this.uIdMaxCharecters.toString(), IsLocalizeKey: false }]
			)
		]);
	}

	public sanitizeUIDInputBasedOnConfig(event: KeyboardEvent): void {
		if (this.uIdMaxCharecters === Number(magicNumber.zero)) return;
		const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'],
			regex = this.uIdConfig.IsNumeric
				? /\D/g
				: /\s/g;
		if (controlKeys.includes(event.key) || !isNaN(Number(event.key)) || event.key === ' ') return;
		let currentValue: string = this.candidateForm.controls['uId'].value;
		currentValue = currentValue.replace(regex, '');
		this.candidateForm.controls['uId'].setValue(currentValue);
	}

	private addValidationOnNewCandidate() {
		const ctrl1 = this.candidateForm.controls['firstName'],
			ctrl2 = this.candidateForm.controls['lastName'];
		ctrl1.addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'FirstName', IsLocalizeKey: true }]));
		ctrl2.addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'LastName', IsLocalizeKey: true }]));
		ctrl1.updateValueAndValidity();
		ctrl2.updateValueAndValidity();
	}

	public submitCandidateForm() {
		this.candidateForm.markAllAsTouched();
		if (!this.candidateForm.valid) {
			return;
		}
		const bgItemToastValidationMsg = 'BackgroundChecksRequiredValidationMessage';
		if (this.onboardingRequirements && !this.onboardingRequirements.validateBackgroundCheckItemsRequired(bgItemToastValidationMsg)) {
			return;
		}
		if (this.dmsImplementation && !this.dmsImplementation.validateDocumentsAndUpload()) {
			return;
		}
		const data: CandidateInterface | null = this.createPayload();
		if (!data) {
			return;
		}
		const submitServiceCall = (this.recordUKey && this.liRequestDetails.uKey)
			? this.lightIndustrialService.candidateSubmitTentative(data)
			: this.lightIndustrialService.candidateSubmit(data);
		submitServiceCall.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((res: GenericResponseBase<null>) => {
			if (res.Succeeded) {
				this.loaderService.isBusy.next(false);
				this.candidateForm.reset();
				if (this.recordUKey && this.liRequestDetails.uKey) {
					// edit existing candidate
					this.lightIndustrialPopupService.closeDialogAddEdit(true);
					this.widgetChangeDetected = false;
				} else {
					// new candidate & existing pool candidate
					this.lightIndustrialPopupService.closeDialogAddEdit(false);
				}
				this.toasterService.showToaster(ToastOptions.Success, "CandidateSavedSeccessfullMessage");
			} else {
				this.loaderService.isBusy.next(false);
				this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
		});
	}

	private createPayload(): CandidateInterface | null {
		let data: CandidateInterface | null = null;
		if (this.recordUKey) {
			if (this.liRequestDetails.uKey) {
				// filled candidate
				data = this.createPayloadFilledCandidate();
			} else {
				// existing pool candidate
				data = this.createPayloadExistingPoolCandidate();
			}
		} else {
			// new candidate
			data = this.createPayloadNewCandidate();
		}
		return data;
	}

	private createPayloadFilledCandidate(): CandidateInterface {
		return {
			"requestUkey": this.liRequestDetails.requestUKey,
			"candidateUkey": this.candidateDetails.UKey,
			"candidatePoolId": this.candidateDetails.CandidatePoolId,
			"firstName": this.candidateDetails.FirstName,
			"middleName": this.candidateDetails.MiddleName,
			"lastName": this.candidateDetails.LastName,
			"uId": this.candidateDetails.UId,
			"submittedMarkup": this.candidateForm.get('submittedMarkup')?.value,
			"positionId": this.liRequestDetails.positionId,
			"baseWageRate": this.allowSelectionPayRate && this.assignmentRate > Number(magicNumber.zero)
				? this.candidateForm.get("baseWageRate")?.value
				: this.liRequestDetails.baseWageRate,
			"dmsFieldRecords": this.showDocumentUploadscard
				? this.dmsImplementation.prepareAndEmitFormData()
				: [],
			"udfFieldRecords": this.udfData,
			"complianceDetails": this.onboardingData,
			"scheduleStartDate": this.localizationService.TransformDate(this.candidateForm.get('scheduleStartDate')?.value)
		};
	}

	private createPayloadExistingPoolCandidate(): CandidateInterface {
		return {
			"requestUkey": this.liRequestDetails.requestUKey,
			"candidatePoolId": this.candidatePoolDetails.Id,
			"firstName": this.candidatePoolDetails.CandidateFirstName,
			"middleName": this.candidatePoolDetails.CandidateMiddleInitial,
			"lastName": this.candidatePoolDetails.CandidateLastName,
			"uId": this.candidateForm.get('uId')?.value,
			"submittedMarkup": this.candidateForm.get('submittedMarkup')?.value,
			"positionId": this.liRequestDetails.positionId,
			"baseWageRate": this.allowSelectionPayRate && this.assignmentRate > Number(magicNumber.zero)
				? this.candidateForm.get("baseWageRate")?.value
				: this.liRequestDetails.baseWageRate,
			"dmsFieldRecords": this.showDocumentUploadscard
				? this.dmsImplementation.prepareAndEmitFormData()
				: [],
			"udfFieldRecords": this.udfData,
			"benefitAddRecords": this.benefitAdderListArray,
			"complianceDetails": this.onboardingData,
			"scheduleStartDate": this.localizationService.TransformDate(this.candidateForm.get('scheduleStartDate')?.value)
		};
	}

	private createPayloadNewCandidate(): CandidateInterface {
		return {
			"requestUkey": this.liRequestDetails.requestUKey,
			"firstName": this.candidateForm.get('firstName')?.value,
			"middleName": this.candidateForm.get('middleName')?.value,
			"lastName": this.candidateForm.get('lastName')?.value,
			"uId": this.candidateForm.get('uId')?.value,
			"submittedMarkup": this.candidateForm.get('submittedMarkup')?.value,
			"positionId": this.liRequestDetails.positionId,
			"baseWageRate": this.candidateForm.get("baseWageRate")?.value,
			"dmsFieldRecords": this.showDocumentUploadscard
				? this.dmsImplementation.prepareAndEmitFormData()
				: [],
			"udfFieldRecords": this.udfData,
			"benefitAddRecords": this.benefitAdderListArray,
			"complianceDetails": this.onboardingData,
			"scheduleStartDate": this.localizationService.TransformDate(this.candidateForm.get('scheduleStartDate')?.value)
		};
	}

	public getBenefitAdderData(data: IBenefitData[]) {
		this.benefitAdderListArray = data;
	}

	public getOnboardingData(data: IOnboardingData) {
		this.onboardingData = data.data;
		this.candidateForm.addControl('onboarding', data.formGroup);
	}

	public getUdfData(data: IUdfData) {
		this.udfData = data.data;
		this.candidateForm.addControl('udf', data.formGroup);
	}

	public getUdfLength(isUdfLength: boolean) {
		this.hasUdfData = isUdfLength;
	}

	public onGridChange() {
		this.widgetChangeDetected = true;
	}

	public getDmsLength(isDmsLength: boolean) {
		this.hasDmsData = isDmsLength;
	}

	public onCancel() {
		this.lightIndustrialPopupService.backDialogAddEdit();
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}
