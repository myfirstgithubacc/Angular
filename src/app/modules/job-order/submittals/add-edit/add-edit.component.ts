import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrentPage, NavigationUrls, RequiredStrings, Status, StatusId, ToastMessages, ValidationMessageKeys } from '../services/Constants.enum';
import { SubmittalsDataService } from '../services/submittalsData.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { SubmittalsService } from '../services/submittals.service';
import { DocumentUploadStage } from '@xrm-shared/enums/document-upload-stage';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { SubmittalCommonResponse, AdditionalData, BenefitAdder, BillRateData, CardVisibilityKeys, MarkUpRateData,
	PRDetails, RateDetails, SubmittalDetails, ICandidateData, CandidateCardData, ParentData} from '../services/Interfaces';
import { forkJoin, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { GenericResponseBase, GenericResponseBaseWithValidationMessage } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { DmsImplementationComponent } from '@xrm-shared/common-components/dms-implementation/dms-implementation.component';
import { DMSApiRequestPayload } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';
import { SubmittalsPopUpService } from '../services/submittals-pop-up.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
@Component({
	selector: 'app-submittal-shared-add-edit',
	templateUrl: './add-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy{
	@ViewChild('dms', { static: false }) dmsImplementation: DmsImplementationComponent;

	public AddEditSubmittalForm: FormGroup;
	public SubmittalFormForDraft: FormGroup;
	public isEditMode: boolean = false;


	// Widgets Data
	public entityId: number = XrmEntities.Submittal;
	public pcEntityId: number = XrmEntities.ProfessionalCandidate;
	public userGroupId: number = magicNumber.zero;
	public sectorId: number = magicNumber.twentyNine;
	public uploadStageId: number = DocumentUploadStage.Candidate_Creation;
	public actionTypeId: number = ActionType.Add;
	public recordId: number = magicNumber.zero;
	public processingId: number = magicNumber.five;
	public udfRecordId:number = magicNumber.zero;
	public udfData:IPreparedUdfPayloadData[] = [];

	public recordUKey:string = RequiredStrings.EmptyString;
	public profReqData: PRDetails;
	public isRateMarkupBasedVariant:boolean = false;
	public submittalData: SubmittalDetails;
	public recruiterNameList: DropdownItem[];
	public requestId:number;
	public workerClassificationList: DropdownItem[];
	private requestUkey: string;
	private sectorLabel:string | null = RequiredStrings.Sector;
	public submittalTypesPrefilledData = [];
	public isShowUdfCard: boolean = false;
	public markUpRateData: MarkUpRateData;
	public billRateData: BillRateData;
	public isDmsCardVisible:boolean;
	public benefitAdderData: BenefitAdder[];
	public uidLength: number;
	private unsubscribe$: Subject<void> = new Subject<void>();
	public pageTitle:string = RequiredStrings.AddSubmittal;
	public isButtonDisabled: boolean = false;
	public isShowDraftButton: boolean = true;
	public isShowDocument: boolean = true;
	public candidateCardData: CandidateCardData;
	public cardsVisiblity = {
		iscandidateDetailsVisible: true,
		israteDetailsMarkupVisible: false,
		israteDetailsBillrateVisible: false,
		ispositionDescriptionVisible: false,
		isrecruiterDetailVisible: false,
		isudfVisible: false
	};

	constructor(
    	private toasterService: ToasterService,
		private router: Router,
		private submittalService: SubmittalsService,
		public udfCommonMethods: UdfCommonMethods,
		private activatedRoute: ActivatedRoute,
		private submittalsDataService: SubmittalsDataService,
		private submittalPopUpService: SubmittalsPopUpService,
		private cdr: ChangeDetectorRef,
		private localisationService: LocalizationService
	){
		this.AddEditSubmittalForm = this.submittalsDataService.createSubmittalForm();
	}

	ngOnInit(): void {
		this.sectorLabel = history.state.sectorLabel;
		const uKey = this.activatedRoute.snapshot.params['id'];
		if(uKey){
			this.recordUKey = uKey;
			this.isEditMode = true;
			this.actionTypeId = ActionType.Edit;
			this.pageTitle = RequiredStrings.EditSubmittal;
			this.getSubmittalByUkey(uKey);
		}
		else{
			this.getRequiredDataonAdd();
			this.getCanDetailsFromPool();
		}
	}

	private getCanDetailsFromPool(){
		this.submittalService.CandidateDetailsFromPool.pipe(takeUntil(this.unsubscribe$)).subscribe((res: ICandidateData | null) => {
			if(res){
				this.submittalsDataService.patchCandidateDetailsForm(null, res, null);
				const candidataCardData: CandidateCardData = {
					IsCanDetailsEditable: false,
					FullName: res.CandidateMiddleInitial
						?`${res.CandidateLastName}, ${res.CandidateFirstName} ${res.CandidateMiddleInitial}`
						:`${res.CandidateLastName}, ${res.CandidateFirstName}`,
					PreviousWorkDetails: res.WorkDetails
				};
				this.candidateCardData = candidataCardData;
				this.AddEditSubmittalForm.markAsDirty();
			}
		});
	}

	private getRequiredDataonAdd(): void{
		this.requestUkey = history.state.requestUkey;
		this.getCombinedData(this.requestUkey).pipe(switchMap(([profReqData, recruiterList]) => {
			this.setProfReqData(profReqData);
			this.setRecruiterList(recruiterList);
			return this.submittalService.getWorkerClassificationList(this.profReqData.SectorId);
		}), takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<DropdownItem[]>) => {
			this.setWorkerClassification(res);
		});
	}

	private getSubmittalByUkey(uKey:string): void{
		this.submittalService.getSubmittalByUkey(uKey).pipe(switchMap((res: GenericResponseBase<SubmittalDetails>) => {
			if(res.Succeeded && res.Data){
				this.submittalData = res.Data;
				this.submittalsDataService.patchSubmittalForm(res.Data);
				this.recordId = this.submittalData.SubmittalId;
				this.recordUKey = this.submittalData.SubmittalUkey;
				this.udfRecordId = this.submittalData.SubmittalId;
				this.udfCommonMethods.manageParentsInfo(XrmEntities.ProfessionalCandidate, this.submittalData.SubmittalId);
				this.benefitAdderData = this.submittalData.BenefitAdders;
				this.isShowDraftButton = this.submittalData.SubmittalStatusId == Number(StatusId.Withdrawn)
					? false
					: true;
				return this.getCombinedData(this.submittalData.RequestUkey).pipe(switchMap(([profReqData, recruiterList]) => {
					this.setProfReqData(profReqData);
					this.setRecruiterList(recruiterList);
					return this.submittalService.getWorkerClassificationList(this.profReqData.SectorId);
				}));
			}
			return of([null, null]).pipe(switchMap(() => {
				return of(null);
			}));
		}), takeUntil(this.unsubscribe$)).subscribe((recruiterList) => {
			this.setWorkerClassification(recruiterList);
		});
	}

	private OnChangeStatusBar(): void {
		this.submittalService.StepperData.next({
			SubmittalStatusId: this.isEditMode
				? this.submittalData.SubmittalStatusId
				: magicNumber.zero,
			CurrentPage: this.router.url.includes(NavigationUrls.Edit)
				? CurrentPage.Edit
				: CurrentPage.Add,
			RecordId: this.isEditMode
				? this.submittalData.SubmittalId
				: magicNumber.zero
		});
	}

	private getCombinedData(requestUkey: string): Observable<[GenericResponseBase<PRDetails>, GenericResponseBase<DropdownItem[]>]> {
		return forkJoin([
		  this.submittalService.getProfReqData(requestUkey),
		  this.submittalService.getRecruiterNameList(requestUkey)
		]);
	  }

	private setProfReqData(profReqData: GenericResponseBase<PRDetails>): void{
		if(profReqData.Succeeded && profReqData.Data){
			this.profReqData = profReqData.Data;
			this.sectorId = this.profReqData.SectorId;
			this.requestId = this.profReqData.RequestId;
			this.updateParentData();
			this.submittalsDataService.setValidationOnUid(this.profReqData.UidConfiguration);
			this.uidLength = this.profReqData.UidConfiguration.MaxLength;
			this.isRateMarkupBasedVariant = this.profReqData.IsMarkupBasedVariant;
			this.OnChangeStatusBar();
			if(!this.isEditMode){
				this.benefitAdderData = this.profReqData.BenefitAdders;
				this.manageRatesOnAdd();
			}
			else{
				this.manageRatesOnUpdate();
			}
		}
	}

	private setWorkerClassification(res: GenericResponseBase<DropdownItem[]>| null): void{
		if(res?.Succeeded && res.Data){
			this.workerClassificationList = res.Data;
			if(this.isEditMode)
				this.AddEditSubmittalForm.get('candidateDetails')?.get('workerClassification')?.setValue({Text: this.submittalData.WorkerClassificationName, Value: this.submittalData.WorkerClassificationId.toString()});
		}
	}

	private manageRatesOnAdd(): void{
		if (this.isRateMarkupBasedVariant) {
			this.markUpRateData = {
				MarkUpNte: this.profReqData.NteMarkupPercent,
				ReqNte: this.profReqData.NewNteBillRate
					? this.profReqData.NewNteBillRate
					: this.profReqData.NteBillRate,
				RequestId: this.profReqData.RequestId,
				StaffingAgencyId: this.profReqData.StaffingAgencyId,
				ShiftDifferentialMethod: this.profReqData.ShiftDifferential,
				CurrencyCode: this.profReqData.CurrencyCode,
				RateUnit: this.profReqData.RateUnit,
				IsTargetBillRate: this.profReqData.IsTargetBillRate,
				BaseWageRate: this.profReqData.BaseWageRate
			};
			this.submittalsDataService.patchMarkupForm(this.profReqData);
			this.submittalsDataService.setValidationsMarkup();
		}
		else {
			this.billRateData = {
				ReqNte: this.profReqData.NewNteBillRate
					? this.profReqData.NewNteBillRate
					: this.profReqData.NteBillRate,
				CurrencyCode: this.profReqData.CurrencyCode,
				RateUnit: this.profReqData.RateUnit,
				IsTargetBillRate: this.profReqData.IsTargetBillRate
			};
			this.submittalsDataService.patchBillRateForm(this.profReqData);
			this.submittalsDataService.setValidationsBillRate();
		}
	}

	private manageRatesOnUpdate(): void{
		const dummyProfReqData: RateDetails = {
			BaseWageRate: this.submittalData.BaseWageRate,
			MarkupPercent: this.submittalData.SubmittedMarkup,
			OvertimeHoursBilledAtId: this.submittalData.OtHoursBilledAtId,
			AdderOrMultiplierValue: this.profReqData.AdderOrMultiplierValue,
			BillRate: this.submittalData.BidRate,
			NteMarkupPercent: this.submittalData.NteMarkupPercent,
			NteBillRate: this.submittalData.NteRate,
			NewNteBillRate: this.submittalData.NteRate
		};
		if (this.isRateMarkupBasedVariant) {
			this.markUpRateData = {
				MarkUpNte: this.submittalData.NteMarkupPercent,
				ReqNte: this.submittalData.NteRate,
				RequestId: this.profReqData.RequestId,
				StaffingAgencyId: this.profReqData.StaffingAgencyId,
				ShiftDifferentialMethod: this.profReqData.ShiftDifferential,
				CurrencyCode: this.profReqData.CurrencyCode,
				RateUnit: this.profReqData.RateUnit,
				IsTargetBillRate: this.profReqData.IsTargetBillRate,
				BaseWageRate: this.profReqData.BaseWageRate
			};
			this.submittalsDataService.patchMarkupForm(dummyProfReqData);
			this.submittalsDataService.setValidationsMarkup();
		}
		else {
			this.billRateData = {
				ReqNte: this.submittalData.NteRate,
				CurrencyCode: this.profReqData.CurrencyCode,
				RateUnit: this.profReqData.RateUnit,
				IsTargetBillRate: this.profReqData.IsTargetBillRate
			};
			this.submittalsDataService.patchBillRateForm(dummyProfReqData);
			this.submittalsDataService.setValidationsBillRate();
		}
	}

	private updateParentData(): void{
		const parentData: ParentData | null = this.isEditMode
			? {
				ProfessionReqId: this.profReqData.RequestCode,
				SectorLabel: this.sectorLabel ?? RequiredStrings.Sector,
				SectorName: this.profReqData.Sector,
				JobCategoryName: this.profReqData.JobCategory,
				Status: this.submittalData.Status,
				IsShowSubData: true,
				SubmittalCode: this.submittalData.SubmittalCode,
				RequestUkey: this.profReqData.RequestUkey
			}
			: null;
		this.submittalService.ParentData.next(parentData);
	}

	private setRecruiterList(recruiterList: GenericResponseBase<DropdownItem[]>): void{
		if(recruiterList.Succeeded && recruiterList.Data){
			this.recruiterNameList = recruiterList.Data;
			if(this.isEditMode){
				this.submittalsDataService.patchRecruiterDetails(this.submittalData);
				this.submittalService.IsChangeRecruiterDetails.next(false);
			}
			else{
				const selectedRecruiter = this.recruiterNameList.find((item:DropdownItem) =>
					item.IsSelected);
				this.AddEditSubmittalForm.get('recruiterDetail')?.get('recruiterName')?.setValue({Text: selectedRecruiter?.Text, Value: selectedRecruiter?.Value });
			}
		}
	}

	public getCandidateDetailForm(): FormGroup {
		return this.AddEditSubmittalForm.get('candidateDetails') as FormGroup;
	}

	public getRateDetailMarkup(): FormGroup {
		return this.AddEditSubmittalForm.get('rateDetailsMarkup') as FormGroup;
	}

	public getRateDetailBillRate(): FormGroup {
		return this.AddEditSubmittalForm.get('rateDetailsBillrate') as FormGroup;
	}

	public getRecruiterDetails(): FormGroup {
		return this.AddEditSubmittalForm.get('recruiterDetail') as FormGroup;
	}

	public getPositionDetailsForm(): FormGroup{
		return this.AddEditSubmittalForm.get('positionDescription') as FormGroup;
	}


	public navigateBack(): void {
		if(history.state.isCameFromProfReq){
			this.router.navigate([`${NavigationUrls.SubmittalDetails}${history.state.requestUkey}`]);
		}
		else{
			this.router.navigate([`${NavigationUrls.List}`]);
		}
	}

	public draftForm(): void{
		const firstName = this.AddEditSubmittalForm.get('candidateDetails')?.get('firstName'),
			lastName = this.AddEditSubmittalForm.get('candidateDetails')?.get('lastName'),
			uId = this.AddEditSubmittalForm.get('candidateDetails')?.get('uId');
		this.SubmittalFormForDraft = this.submittalsDataService.getEmptyForm();
		if(lastName?.invalid || firstName?.invalid){
			this.SubmittalFormForDraft = this.AddEditSubmittalForm;
			this.cardsVisiblity.iscandidateDetailsVisible = true;
			lastName?.markAsTouched();
			firstName?.markAsTouched();
			this.toasterService.showToaster(ToastOptions.Error, ValidationMessageKeys.LastNameRequiredToDraftSubmittal);
			return;
		}
		if(uId?.invalid){
			this.SubmittalFormForDraft = this.AddEditSubmittalForm;
			this.cardsVisiblity.iscandidateDetailsVisible = true;
			uId.markAsTouched();
			if (!uId.errors?.['message'].includes(ValidationMessageKeys.UidValidation)) {
				this.toasterService.showToaster(ToastOptions.Error, ValidationMessageKeys.LastNameRequiredToDraftSubmittal);
			}
			return;
		}
		this.draftOrSaveSubmittal(true);
	};

	public submitForm(): void{
		this.AddEditSubmittalForm.markAllAsTouched();

		if(this.checkIfFormInvalid())
			return;
		if(!this.profReqData.IsTargetBillRate && !this.submittalsDataService.isBillRateValid()){
			if(!this.profReqData.BaseWageRate){
				this.submittalService.IsWageRateChange.next(true);
				this.AddEditSubmittalForm.get('rateDetailsMarkup')?.get('baseWageRate')?.markAsTouched();
				this.cardsVisiblity.israteDetailsMarkupVisible = true;
			}
			else{
				this.submittalService.IsWageRateChange.next(false);
				this.AddEditSubmittalForm.get('rateDetailsMarkup')?.get('markUp')?.markAsTouched();
				this.cardsVisiblity.israteDetailsMarkupVisible = true;
			}
			return;
		}
		if(!this.dmsImplementation?.validateDocumentsAndUploadForm()){
			this.dmsImplementation?.validateDocumentsAndUpload();
			this.isDmsCardVisible = true;
			return;
		}

		if(!this.submittalService.IsEmailValid.value){
			this.toasterService.showToaster(ToastOptions.Error, 'ValidEmailDomainMessageForRecruiter');
			return;
		}
		this.draftOrSaveSubmittal(false);
	}

	private checkIfFormInvalid(): boolean {
		for (const key of Object.keys(this.AddEditSubmittalForm.controls)) {
			if (this.AddEditSubmittalForm.controls[key].invalid) {
				const dynamicKey = `is${key}Visible` as CardVisibilityKeys;
				this.cardsVisiblity[dynamicKey] = true;
				return true;
			}
		}
		return false;
	}

	private draftOrSaveSubmittal(isDraft:boolean): void{
		const documentData: DMSApiRequestPayload[] = this.dmsImplementation.prepareAndEmitFormData(),
			isW2Employee: boolean = this.submittalService.IsW2Employee.value,
			additionalData: AdditionalData = this.prepareAdditionalData(isDraft, documentData, isW2Employee),
			calculatedRates = this.submittalService.CalculatedRates.value;
		if(calculatedRates?.Succeeded && calculatedRates.Data){
			let payload;
			if(this.isEditMode){
				additionalData.isMarkupBasedVariant = this.profReqData.IsMarkupBasedVariant;
				payload = this.submittalsDataService.prepareUpdateSubmittalPayload(this.submittalData, additionalData, calculatedRates.Data);
				this.submittalService.updateSubmittal(payload)
					.pipe(takeUntil(this.unsubscribe$))
					.subscribe((res: GenericResponseBaseWithValidationMessage<SubmittalCommonResponse>) => {
						this.showToastMessage(res, isDraft);
					});
			}
			else{
				payload = this.submittalsDataService.prepareCreateSubmittalData(additionalData, calculatedRates.Data);
				this.submittalService.createSubmittal(payload)
					.pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBaseWithValidationMessage<SubmittalCommonResponse>) => {
						this.showToastMessage(res, isDraft);
					});
			};
		}
		else{
			if(calculatedRates?.ValidationMessages && calculatedRates.ValidationMessages.length > parseInt(magicNumber.zero.toString())){
				this.toasterService.showToaster(ToastOptions.Error, calculatedRates.ValidationMessages[magicNumber.zero].ErrorMessage);
			}
			else{
				this.toasterService.showToaster(ToastOptions.Error, calculatedRates?.Message ?? ValidationMessageKeys.SomeErrorOccured);
			}
			return;
		}
	}

	private prepareAdditionalData(isDraft: boolean, documentData: DMSApiRequestPayload[], isW2Employee: boolean): AdditionalData{
		return {
			requestId: this.requestId,
			status: isDraft
				? Status.Drafted
				: this.getStatusData(),
			statusId: isDraft
				? StatusId.Drafted
				: this.getStatusIdData(),
			sectorId: this.sectorId,
			documentData: documentData,
			udfData: this.udfData,
			isMarkupBasedVariant: this.profReqData.IsMarkupBasedVariant,
			shiftDifferentialMethod: this.profReqData.ShiftDifferential,
			positionDescription: this.profReqData.PositionDescription,
			isW2Employee: isW2Employee,
			requestStartDate: this.profReqData.StartDate,
			benefitAddDto: this.isEditMode
				? this.submittalData.BenefitAdders
				: this.profReqData.BenefitAdders
		};
	}

	private getStatusData(): Status{
		if(this.isEditMode){
			return this.submittalData.SubmittalStatusId == Number(StatusId.Withdrawn)
				? Status.ReSubmitted
				: Status.Submitted;
		}
		else{
			return Status.Submitted;
		}
	}

	private getStatusIdData(): StatusId{
		if(this.isEditMode){
			return this.submittalData.SubmittalStatusId == Number(StatusId.Withdrawn)
				? StatusId.ReSubmitted
				: StatusId.Submitted;
		}
		else{
			return StatusId.Submitted;
		}
	}

	private showToastMessage(
		res: GenericResponseBaseWithValidationMessage<SubmittalCommonResponse>,
		isDraft: boolean = false
	): void{
		const submittalCode: string = res.Data?.SubmittalCode ?? RequiredStrings.EmptyString;
		if(!res.Succeeded){
			if(res.ValidationMessages && res.ValidationMessages.length > parseInt(magicNumber.zero.toString())){
				this.toasterService.showToaster(ToastOptions.Error, res.ValidationMessages[magicNumber.zero].ErrorMessage);
			}
			else{
				this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
			return;
		}
		if(isDraft){
			this.toasterService.showToaster(
				ToastOptions.Success,
				this.localisationService.GetLocalizeMessage(
					ToastMessages.SubmittalHasBeenDraftSuccessfully,
					[this.submittalsDataService.makeDynamicParam(submittalCode, false)]
				)
			);
			this.navigateBack();
			return;
		}
		this.toasterService.showToaster(
			ToastOptions.Success,
			this.localisationService.GetLocalizeMessage(
				ToastMessages.SubmittalHasBeenSavedSuccessfully,
				[this.submittalsDataService.makeDynamicParam(submittalCode, false)]
			)
		);
		this.isButtonDisabled = true;
		this.navigateBack();
	}

	public openPopUp(): void{
		this.submittalPopUpService.openDialogBox();
	}

	public getUdfData(arg: {data: IPreparedUdfPayloadData[], formGroup: FormGroup}):void {
		this.udfData = arg.data;
		this.AddEditSubmittalForm.addControl('udf', arg.formGroup);
	}

	public isUdfHasData(event: boolean): void{
		this.isShowUdfCard = event;
	}

	ngOnDestroy(): void {
		this.submittalService.CandidateDetailsFromPool.next(null);
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onExpandChange(arg: { card: CardVisibilityKeys; isCardVisible: boolean }): void{
		this.cardsVisiblity[arg.card] = arg.isCardVisible;
	}

	public onExpandedCollapseUdf(event:boolean): void{
		this.onExpandChange({card: 'isudfVisible', isCardVisible: event});
	}

	public onExpandedCollapseDms(event:boolean): void{
		this.isDmsCardVisible = event;
	}

	public hasDMSLength(event: boolean): void{
		this.isShowDocument = event;
	}

	public gridChange(): void{
		this.AddEditSubmittalForm.markAsDirty();
		this.cdr.detectChanges();
	}
}
