import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ProfessionalRequestService } from '../../services/professional-request.service';
import { requestDetailsModel } from '../../models/request-details.model';
import { positionDetailsModel } from '../../models/position-details.model';
import { assignmentRequirementModel } from '../../models/assignment-requirement.model';
import { rateDetailsModel } from '../../models/rate-details.model';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { SharedDataService } from '../../services/shared-data.service';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { StepDataModel } from '@xrm-core/models/Sector/sector-rfx-configuration.model';
import { ProfessionalStepperService } from '../../services/professional-stepper.service';
import { LoaderService } from '@xrm-shared/services/loader.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, map, Subject, take, takeUntil } from 'rxjs';
import { mapFormToApiPayload } from '../../models/prof.payload.model';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { StatusID } from '../../constant/request-status';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { AssignmentDetailsComponent } from './assignment-details/assignment-details.component';
import { ApproverOtherDetailsComponent } from './approver-other-details/approver-other-details.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ApprovalConfigurationGatewayService } from 'src/app/services/masters/approval-configuration-gateway.service';
import { BaseTransactionDataModel, EntityRecord } from '@xrm-master/approval-configuration/constant/enum';
import { LightIndustrialUtilsService } from '../../../light-industrial/services/light-industrial-utils.service';
import { candiateDetailsModel } from '../../models/candidate-details.model';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { ShiftDetails } from '../../../light-industrial/interface/li-request.interface';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
// import { FinancialDetailsComponent } from './financial-details/financial-details.component';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrl: './add-edit.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit {
	@ViewChild('assignmentDetails', { static: false }) assignmentDetails: AssignmentDetailsComponent;
	// @ViewChild('financialDetails', { static: false }) financialDetails: FinancialDetailsComponent;
	@ViewChild(ApproverOtherDetailsComponent, { static: false }) approverOtherDetailsComponent: ApproverOtherDetailsComponent;
	public professionalRequestForm: FormGroup;
	public isEditMode: boolean = false;
	public isCopyReq: boolean = false;
	public isDraft: boolean = false;
	public isPreview: boolean = false;
	private timeoutIds: number[] = [];
	public approverLength: boolean = false;
	public btnType = 'add';
	private showAllSectionsSwitchOld: boolean = false;
	public currentStep: number = magicNumber.zero;
	public steps: StepDataModel[] = [];
	private requestedIndex: number;
	public directiveForms: FormGroup;
	private isSuccessToast: boolean = false;
	public resetStep = false;
	public showAllSectionsSwitch: boolean = false;

	public sectorId: number | null = magicNumber.zero;
	public locationId: number | null = magicNumber.zero;
	public reqLibraryId: number = magicNumber.zero;
	public uKey: string = '';
	public statusId: number = magicNumber.zero;
	public entityId: number = XrmEntities.ProfessionalRequest;
	public profRequestDetails: any;
	public destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public targetEndDate: any;
	public shiftId: number;
	public shiftDays: any;
	public positionNeeded: number | null;

	// eslint-disable-next-line max-lines-per-function, max-params
	constructor(
		private customValidators: CustomValidators,
		private formBuilder: FormBuilder,
		private professionalRequestService: ProfessionalRequestService,
		private route: Router,
		private toasterService: ToasterService,
		private sharedDataService: SharedDataService,
		private cdr: ChangeDetectorRef,
		private professionalStepperService: ProfessionalStepperService,
		private loaderService: LoaderService,
		private translate: TranslateService,
		private dialogPopupService: DialogPopupService,
		private activatedRoute: ActivatedRoute,
		private eventlog: EventLogService,
		private approvalConfigWidgetServ: ApprovalConfigurationGatewayService,
		private lightIndustrialUtilsService: LightIndustrialUtilsService,
		private shiftService: ShiftGatewayService

	) {
		this.professionalRequestForm = this.initializeForm();
		this.steps = this.professionalStepperService.getSteps();
		this.localizeStepperLabel();
	}

	ngOnInit(): void {
		this.getProfRequestByUkey();
	}

	private initializeForm(): FormGroup {
		return this.formBuilder.group({
			requestDetails: requestDetailsModel(this.customValidators),
			positionDetails: positionDetailsModel(this.customValidators),
			candidateDetails: candiateDetailsModel(),
			assignmentRequirement: assignmentRequirementModel(this.customValidators),
			rateDetails: rateDetailsModel(this.customValidators),
			requestComments: this.formBuilder.group({
				ClientComments: [null],
				ClientCommentsToStaffingAgency: [null]
			}),
			StatusId: [null],
			UKey: [''],
			dmsFieldRecords: new FormControl([]),
			udfFieldRecords: new FormControl([]),
			approvalDetails: new FormControl([]),
			BenefitAddDto: new FormControl([])
		});
	}

	public stepperEvent(ev: StepperActivateEvent) {
		if (this.showAllSectionsSwitch) {
			this.showAll(false);
		}
		this.requestedIndex = ev.index;
		const sectionDetail = this.professionalRequestForm.get(this.steps[this.currentStep].name ?? '') as FormGroup,
			requestDetails = this.professionalRequestForm.get('requestDetails') as FormGroup,
			positionDetails = this.professionalRequestForm.get('positionDetails') as FormGroup,
			candidateDetails = this.professionalRequestForm.get('candidateDetails') as FormGroup;
		requestDetails.markAllAsTouched();
		positionDetails.markAllAsTouched();
		candidateDetails.markAllAsTouched();
		// if (this.isEditMode) {
		// 	ev.preventDefault();
		// 	this.withoutClickingUpdate(this.steps[this.currentStep].name ?? '', ev.index);
		// } else 
		if (requestDetails.valid && positionDetails.valid && candidateDetails.valid) {
			if (sectionDetail.dirty) {
				if (ev.index !== this.currentStep) {
					this.withoutClickingUpdate(this.steps[this.currentStep].name ?? '', ev.index);
				}
			}
		} else {
			ev.preventDefault();
		}
		this.sectionCheck();
		for (let index: number = magicNumber.zero; index < this.currentStep; index++) {
			this.professionalStepperService.setFormInitStatus(index);
		}
		this.cdr.markForCheck();
	}

	private sectionCheck() {
		this.steps.forEach((ele) => {
			ele['cssClass'] = this.professionalRequestForm.get(ele.name ?? '')?.valid
				? ''
				: 'text-error';
			this.cdr.markForCheck();
		});
		this.cdr.detectChanges();
	}

	private showAll(toggle: boolean) {
		if (toggle) {
			this.showAllSectionsSwitch = true;
			this.professionalStepperService.showAllSectionsSwitch.next(true);
			this.showAllSectionsSwitchOld = true;
			this.resetStep = true;
			if (this.isEditMode) {
				this.btnType = 'edit';
			}
			if (this.isDraft) {
				this.btnType = 'draft';
			}
			const timeout = window.setTimeout(() => {
				this.loaderService.isBusy.next(false);
			}, magicNumber.fiveHundred);

			this.timeoutIds.push(timeout);
			this.professionalStepperService.setInitialDefault();
			this.cdr.markForCheck();
		} else {
			this.resetStep = false;
			this.showAllSectionsSwitch = false;
			this.professionalStepperService.showAllSectionsSwitch.next(false);
			this.showAllSectionsSwitchOld = false;
		}
	}

	private withoutClickingUpdate(currentForm: string, nextIndex: number) {
		this.requestedIndex = nextIndex;
		this.directiveFistFieldFocus();
	}

	private localizeStepperLabel() {
		const observables = this.steps.map((step) =>
			this.translate.stream(step.label ?? '').pipe(
				take(magicNumber.one),
				map((res) =>
					res as string), takeUntil(this.destroyAllSubscriptions$)
			));
		forkJoin(observables).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((localizedLabels) => {
			this.steps.forEach((step, index) => {
				this.steps[index].label = localizedLabels[index];
			});
			this.cdr.markForCheck();
		});
	}

	private directiveFistFieldFocus() {
		this.directiveForms = this.professionalRequestForm.get(this.steps[this.currentStep].name ?? '') as FormGroup;
	}

	public next(sectionName: string, stepMovement: number): void {
		const requestDetails = this.professionalRequestForm.get('requestDetails') as FormGroup,
			positionDetails = this.professionalRequestForm.get('positionDetails') as FormGroup,
			candidateDetails = this.professionalRequestForm.get('candidateDetails') as FormGroup;
		requestDetails.markAllAsTouched();
		positionDetails.markAllAsTouched();
		candidateDetails.markAllAsTouched();
		if (sectionName == 'requestDetails' && requestDetails.valid && positionDetails.valid && candidateDetails.valid) {
			this.requestedIndex = this.currentStep + stepMovement;
			this.currentStep += 1;
			// this.sharedDataService.jobDetailsFormPersist = true;
			this.withoutClickingUpdate(sectionName, this.requestedIndex);
		}
		if (sectionName == 'assignmentRequirement') {
			this.handleAssignmentRequirementStep(sectionName, stepMovement);
		}
		if (sectionName == 'rateDetails') {
			this.handleRateDetailsStep(sectionName, stepMovement);
		}
		if (sectionName == 'requestComments') {
			this.handleRequestCommentsStep(sectionName, stepMovement);
		}
		this.sectionCheck();
	}

	private handleAssignmentRequirementStep(sectionName: string, stepMovement: number) {
		const assignmentRequirement = this.professionalRequestForm.get('assignmentRequirement') as FormGroup;
		assignmentRequirement.markAllAsTouched();
		if (assignmentRequirement.valid) {
			if (!this.assignmentDetails.validateAll()) {
				return;
			}
			this.toasterService.resetToaster();
			this.requestedIndex = this.currentStep + stepMovement;
			this.currentStep += 1;
			// this.sharedDataService.assignmentDetailsFormPersist = true;
			this.withoutClickingUpdate(sectionName, this.requestedIndex);
		}
	}

	private handleRateDetailsStep(sectionName: string, stepMovement: number) {
		const rateDetails = this.professionalRequestForm.get('rateDetails') as FormGroup;
		rateDetails.markAllAsTouched();
		if (rateDetails.valid) {
			// if (!this.financialDetails?.validateAll()) {
			// 	return;
			// }
			this.requestedIndex = this.currentStep + stepMovement;
			this.currentStep += 1;
			// this.sharedDataService.financeDetailsFormPersist = true;
			this.withoutClickingUpdate(sectionName, this.requestedIndex);
		}
	}

	private handleRequestCommentsStep(sectionName: string, stepMovement: number) {
		const requestComments = this.professionalRequestForm.get('requestComments') as FormGroup;
		requestComments.markAllAsTouched();
		if (requestComments.valid) {
			this.requestedIndex = this.currentStep + stepMovement;
			this.currentStep += 1;
			// this.sharedDataService.approverOtherDetailsFormPersist = true;
			this.withoutClickingUpdate(sectionName, this.requestedIndex);
		}
	}

	public prev(): void {
		this.currentStep -= 1;
	}

	public saveAndContinueLater() {
		this.professionalRequestForm.controls['StatusId'].setValue(StatusID.Draft);
		this.professionalRequestForm.controls['UKey'].setValue(this.uKey);
		const requestDetailsForm = this.professionalRequestForm.get('requestDetails') as FormGroup,
			sectorIdControl = requestDetailsForm.get('SectorId');
		if (!sectorIdControl?.value) {
			sectorIdControl?.markAsTouched();
			return;
		}
		const payload = mapFormToApiPayload(this.professionalRequestForm.getRawValue()),
			serviceAPI = this.isEditMode
				? this.professionalRequestService.updateProfRequest(payload)
				: this.professionalRequestService.saveProfRequest(payload);
		serviceAPI.subscribe((res: any) => {
			if (res.Succeeded) {
				this.isSuccessToast = true;
				const requestCode = res.Data.RequestCode;
				this.toasterService.showToaster(ToastOptions.Success, 'ProfRequestDraftedNotification', [{ Value: requestCode, IsLocalizeKey: false }]);
				this.route.navigate([`/xrm/job-order/professional/list`]);
			} else {
				this.toasterService.showToaster(ToastOptions.Error, res.Message);

			}
		});
	}

	public submitForm() {
		this.professionalRequestForm.controls['StatusId'].setValue(StatusID.Submitted);
		this.professionalRequestForm.controls['UKey'].setValue(this.uKey);
		this.professionalRequestForm.markAllAsTouched();
		if (this.professionalRequestForm.valid) {
			if (!this.dmsFormIsValid() || !this.assignmentDetails.validateAll()) {
				return;
			}
			const payload = mapFormToApiPayload(this.professionalRequestForm.getRawValue());
			this.professionalRequestService.saveProfRequest(payload).subscribe((res: any) => {
				if (res.Succeeded) {
					this.isSuccessToast = true;
					const requestCode = res.Data.RequestCode;
					this.toasterService.showToaster(ToastOptions.Success, 'ProfRequestCreatedNotification', [{ Value: requestCode, IsLocalizeKey: false }]);
					this.route.navigate([`/xrm/job-order/professional/list`]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
		}
	}

	public submitFormEdit() {
		this.professionalRequestForm.controls['StatusId'].setValue(StatusID.ReSubmitted);
		this.professionalRequestForm.controls['UKey'].setValue(this.uKey);
		this.professionalRequestForm.markAllAsTouched();
		if (this.professionalRequestForm.valid) {
			if (!this.dmsFormIsValid() || !this.assignmentDetails.validateAll()) {
				return;
			}
			const payload = mapFormToApiPayload(this.professionalRequestForm.getRawValue());
			this.professionalRequestService.updateProfRequest(payload).subscribe((res: any) => {
				if (res.Succeeded) {
					this.isSuccessToast = true;
					const requestCode = res.Data.RequestCode;
					this.toasterService.showToaster(ToastOptions.Success, 'ProfRequestResubmittedNotification', [{ Value: requestCode, IsLocalizeKey: false }]);
					this.route.navigate([`/xrm/job-order/professional/list`]);
				} else {
					this.toasterService.showToaster(ToastOptions.Error, res.Message);
				}
			});
		}
	}

	public onChange(event: boolean) {
		if (event) {
			this.showAllSectionsSwitch = true;
			this.resetStep = true;
		} else {
			this.resetStep = false;
			this.showAllSectionsSwitch = false;
		}
	}

	public previewSubmit() {
		this.professionalRequestForm.markAllAsTouched();
		if (this.professionalRequestForm.valid) {
			if (!this.dmsFormIsValid()) {
				return;
			}
			this.isPreview = true;
			this.professionalRequestForm.controls['StatusId'].setValue(this.isEditMode && this.statusId !== Number(StatusID.Draft)
				? StatusID.ReSubmitted
				: StatusID.Submitted);
			this.professionalRequestForm.controls['UKey'].setValue(this.uKey);
			this.sharedDataService.setFormData(this.professionalRequestForm.getRawValue());
		}
	}


	private dmsFormIsValid(): boolean {
		if (this.approverOtherDetailsComponent.hasDMSLength) {
			const isValid = this.approverOtherDetailsComponent.dmsImplementation.validateDocumentsAndUpload();
			if (this.approverOtherDetailsComponent.dmsImplementation && !isValid) {
				this.approverOtherDetailsComponent.dmsImplementation?.validateDocumentsAndUploadForm();
				return false;
			}
		}
		return true;
	}

	closePreview() {
		this.isPreview = false;
	}

	public onCancel(): void {
		if (this.professionalRequestForm.pristine) {
			this.route.navigate(['/xrm/job-order/professional/list']);
			return;
		}
		this.dialogPopupService.showConfirmation(
			'UnsavedChangesConfirmation',
			PopupDialogButtons.discardYesNo
		);
		this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((button: any) => {
			this.cancelConfirmationPopUp(button);
		});
	}

	private cancelConfirmationPopUp(button: any) {
		if (button == 'close') {
			return;
		} else if (button.value == magicNumber.twentySix) {
			this.route.navigate(['/xrm/job-order/professional/list']);
			this.dialogPopupService.resetDialogButton();
			return;
		} else if (button.value == magicNumber.twentyFive) {
			this.dialogPopupService.resetDialogButton();
		}
	}

	public getSectorChange(sectorId: any) {
		this.sectorId = sectorId;
	}

	public getLocationChange(locationId: any) {
		this.locationId = locationId;
	}

	public getReqLibraryChange(reqLibraryId: any) {
		this.reqLibraryId = reqLibraryId;
	}

	public getTargetEndDateChange(endDate: any) {
		this.targetEndDate = endDate;
	}

	public getShiftChange(shiftId: number) {
		this.shiftId = shiftId;
	}
	public getShiftDaysChange(shiftDays: any) {
		this.shiftDays = shiftDays;
	}
	public getPositionNeededChange(positionNeeded: number | null) {
		this.positionNeeded = positionNeeded;
	}

	public getPrevReqCopy(prevReq: any) {
		if (prevReq == null) {
			this.isCopyReq = false;
			this.profRequestDetails = null;
		} else {
			this.isCopyReq = true;
			this.profRequestDetails = prevReq;
		}
	}

	private getProfRequestByUkey() {
		this.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param) => {
			if (param['uKey']) {
				this.isEditMode = true;
				this.uKey = param['uKey'];
				this.getProfRequestDetails(this.uKey);
			}
		});
	}

	private getProfRequestDetails(uKey: string): void {
		this.professionalRequestService.getReqViewById(uKey, magicNumber.zero).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: any) => {
				if (res.Succeeded) {
					this.profRequestDetails = res.Data;
					const profRequest = res.Data.ProfRequest;
					this.statusId = profRequest.RequestDetail.StatusId;
					this.isDraft = this.statusId == Number(StatusID.Draft);
					this.getApproverDataOnEdit(profRequest.RequestDetail);
					this.eventlog.entityId.next(this.entityId);
					this.eventlog.recordId.next(profRequest.RequestDetail.RequestId);
					this.patchAssignmentSection();
					this.patchRateDetailsSection();
					this.cdr.markForCheck();
				} else if (res.StatusCode == Number(HttpStatusCode.Unauthorized)) {
					this.route.navigate(['unauthorized']);
				}
			});
	}

	private getApproverDataOnEdit(data: any) {
		const obj: EntityRecord = {
			RecordId: data.RequestId,
			EntityId: this.entityId,
			SectorId: data.SectorId,
			orgLevel1Id: data.OrgLevel1Id,
			IsDraft: data.StatusId == Number(StatusID.Draft)
		};
		this.approvalConfigWidgetServ.getApprovalCOnfigForEdit(obj).pipe(takeUntil(this.destroyAllSubscriptions$)).
			subscribe((res: GenericResponseBase<BaseTransactionDataModel[]>) => {
				if (res.Data) {
					this.approverLength = !(this.lightIndustrialUtilsService.isAllValuesZero(res.Data));
				}
			});
	}

	private patchAssignmentSection() {
		const AssignmentRequirement = this.profRequestDetails.ProfRequestAssignment.AssignmentRequirement,
			ShiftRequirement = this.profRequestDetails.ProfRequestAssignment.ShiftRequirement;
		this.professionalRequestForm.controls['assignmentRequirement'].patchValue({
			TargetStartDate: AssignmentRequirement.TargetStartDate,
			TargetEndDate: AssignmentRequirement.TargetEndDate,
			ShiftId: { Text: ShiftRequirement.ShiftName, Value: ShiftRequirement.ShiftId },
			Sun: ShiftRequirement.Sun,
			Mon: ShiftRequirement.Mon,
			Tue: ShiftRequirement.Tue,
			Wed: ShiftRequirement.Wed,
			Thu: ShiftRequirement.Thu,
			Fri: ShiftRequirement.Fri,
			Sat: ShiftRequirement.Sat,
			StartTime: ShiftRequirement.StartTime,
			EndTime: ShiftRequirement.EndTime,
			PositionNeeded: AssignmentRequirement.PositionNeeded,
			IsDrugTestRequired: AssignmentRequirement.IsDrugTestRequired,
			IsBackgrounCheckRequired: AssignmentRequirement.IsBackgrounCheckRequired,
			PositionDescription: AssignmentRequirement.PositionDescription,
			SkillsRequired: AssignmentRequirement.SkillsRequired,
			SkillsPreferred: AssignmentRequirement.SkillsPreferred,
			ExperienceRequired: AssignmentRequirement.ExperienceRequired,
			ExperiencePreferred: AssignmentRequirement.ExperiencePreferred,
			EducationRequired: AssignmentRequirement.EducationRequired,
			EducationPreferred: AssignmentRequirement.EducationPreferred,
			AdditionalInformation: AssignmentRequirement.AdditionalInformation,
			startTimeControlName: ShiftRequirement.StartTime,
			endTimeControlName: ShiftRequirement.EndTime
		});
		this.patchShift(ShiftRequirement);
	}

	private patchShift(ShiftRequirement: any) {
		const shiftDetails = this.processShiftData(ShiftRequirement);
		this.getShiftDetails(ShiftRequirement.ShiftId, shiftDetails);
	}

	private processShiftData(response: any) {
		return {
			ShiftId: response.ShiftId,
			StartTime: response.StartTime,
			EndTime: response.EndTime,
			Sun: response.Sun,
			Mon: response.Mon,
			Tue: response.Tue,
			Wed: response.Wed,
			Thu: response.Thu,
			Fri: response.Fri,
			Sat: response.Sat,
			ShiftDifferentialMethod: "Others",
			AdderOrMultiplierValue: 0
		};
	}

	private getShiftDetails(shiftId: number, shiftDetails: any): void {
		this.shiftService.getshiftDetailsData(shiftId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<ShiftDetails>) => {
				if (data.Succeeded && data.Data) {
					const shiftDetailsResponse = data.Data,
						{ ShiftDifferentialMethod, AdderOrMultiplierValue } = shiftDetailsResponse,
						shiftDetailsValue = { ...shiftDetails, ShiftDifferentialMethod, AdderOrMultiplierValue };
					this.sharedDataService.updateShiftDetails(shiftDetailsValue);
				}
			}
		});
	}

	private patchRateDetailsSection() {
		const rateDetails = this.profRequestDetails.ProfRequestFinancial;
		this.professionalRequestForm.controls['rateDetails'].patchValue({
			BaseWageRate: rateDetails.BaseWageRate,
			RateUnitId: rateDetails.RateUnitId,
			NteBillRate: rateDetails.NteBillRate,
			NewNteBillRate: rateDetails.NewNteBillRate,
			DeltaCost: rateDetails.DeltaCost,
			ReasonForException: rateDetails.ReasonForException,
			HourDistributionRuleId: { Text: rateDetails.HourDistributionRuleName, Value: rateDetails.HourDistributionRuleId },
			EstimatedRegularHoursPerWeek: rateDetails.EstimatedRegularHoursPerWeek,
			IsOtExpected: rateDetails.IsOtExpected,
			OthoursBilledAt: rateDetails.OthoursBilledAt,
			EstimatedOtHoursPerWeek: rateDetails.EstimatedOtHoursPerWeek,
			BudgetedHours: rateDetails.BudgetedHours,
			EstimatedCost: rateDetails.EstimatedCost
		});
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
		this.sharedDataService.resetServiceData();
		if (!this.isSuccessToast && !this.isPreview)
			this.toasterService.resetToaster();
	}

}
