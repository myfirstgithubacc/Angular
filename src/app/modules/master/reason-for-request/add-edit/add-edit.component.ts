import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { ReasonForRequest } from '@xrm-core/models/reason-for-request/reason-for-request.model';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ReasonForRequestService } from '../services/reason-for-request.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { CommonService } from '@xrm-shared/services/common.service';
import { EMPTY, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { ICommonComponentData, IReasonForRequestData } from '@xrm-core/models/reason-for-request/reason-for-request.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdownOption, INavigationPathMap, ISectorDetailById } from '@xrm-shared/models/common.model';
import { SpecialChars } from '../constant/characters-constant';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {

	public addEditReasonForRequestForm: FormGroup;
	public isEditMode: boolean = false;
	public sectorList: IDropdownOption[] = [];
	public reasonForRequestDetails: IReasonForRequestData;
	public navigationPaths: INavigationPathMap = NavigationPaths;
	public specialCharsNotAllowed: string[] = SpecialChars.CharsNotAllowed;
	public Rfxswitchconfig: boolean = false;
	public entityId: XrmEntities = XrmEntities.ReasonForRequest;

	public isAdded: boolean = false;
	public maxChar: number = magicNumber.twoHundred;
	private unsubscribeAll$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private route: Router,
		private customValidators: CustomValidators,
		private activatedRoute: ActivatedRoute,
		private eventLogService: EventLogService,
		public sectorService: SectorService,
		public reasonForRequestService: ReasonForRequestService,
		private toasterService: ToasterService,
		private commonService: CommonService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.initializeFormGroup();
		this.handleRouteParams();
	}

	private initializeFormGroup(): void {
		this.addEditReasonForRequestForm = this.formBuilder.group({
			SectorName: [null, this.sectorFieldValidation()],
			ReasonForRequest: [null, this.reasonForRequestFieldValidation()],
			ProfessionalRequest: [false],
			LiRequest: [false],
			RfxSowRequest: [false]
		});
	}
	private sectorFieldValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }]);
	}


	private reasonForRequestFieldValidation(): (ValidatorFn | ValidationErrors | null)[] {
		return [
			this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ReasonForRequest', IsLocalizeKey: true }]),
			this.customValidators.MaxLengthValidator(magicNumber.twoHundred)
		];
	}

	private handleRouteParams(): void {
		this.activatedRoute.params.pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((param) => {
				if (!param['ukey']) return this.getSectorListData();
				return this.getReasonForRequestByUkey(param['ukey']);
			})
		).subscribe();
	}

	private getSectorListData(): Observable<void> {
		return this.sectorService.getSectorDropDownListV2().pipe(
			takeUntil(this.unsubscribeAll$),
			map((data: GenericResponseBase<IDropdownOption[]>) => {
				if (!data.Succeeded || !data.Data) return;
				this.sectorList = data.Data;
			})
		);
	}

	private getReasonForRequestByUkey(ukey: string): Observable<void> {
		this.isEditMode = true;
		return this.reasonForRequestService.getReasonForRequestByUkey(ukey).pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((res: GenericResponseBase<IReasonForRequestData>) => {
				if (!res.Succeeded || !res.Data) return EMPTY;
				this.reasonForRequestDetails = res.Data;
				this.reasonForRequestService.sharedDataSubject.next(this.prepareSharedData());
				this.setFormControlData();
				return this.setRfxControlData(this.reasonForRequestDetails.SectorId).pipe(map(() => {
					this.cdr.detectChanges();
				}));
			})
		);
	}

	private prepareSharedData(): ICommonComponentData {
		return {
			'Disabled': this.reasonForRequestDetails.Disabled,
			'ReasonForRequestId': this.reasonForRequestDetails.Id,
			'ReasonForRequestCode': this.reasonForRequestDetails.Code
		};
	}

	private setRfxControlData(sectorId: number): Observable<void> {
		return this.reasonForRequestService.getRfxDataFromSector(sectorId).pipe(
			takeUntil(this.unsubscribeAll$),
			map((data: GenericResponseBase<ISectorDetailById>) => {
				if (!data.Succeeded || !data.Data) return;
				this.Rfxswitchconfig = data.Data.IsRfxSowRequired;
				this.cdr.detectChanges();
				if (this.Rfxswitchconfig) return;
				(this.addEditReasonForRequestForm.controls['RfxSowRequest'] as FormControl).setValue(false);
			})
		);
	}

	private setFormControlData(): void {
		this.addEditReasonForRequestForm.patchValue(this.reasonForRequestDetails);
		this.addEditReasonForRequestForm.patchValue({
			SectorName: {
				Text: this.reasonForRequestDetails.SectorName,
				Value: this.reasonForRequestDetails.Id
			}
		});
	}

	public onChangeSectorDropdown(val: IDropdownOption | undefined): void {
		if (val === undefined) {
			this.Rfxswitchconfig = false;
			this.addEditReasonForRequestForm.controls['RfxSowRequest'].setValue(false);
			return;
		}
		this.setRfxControlData(val.Value).subscribe();
	}

	public onSubmitForm(): void {
		this.addEditReasonForRequestForm.markAllAsTouched();
		this.toasterService.resetToaster();
		if (!this.addEditReasonForRequestForm.valid)
			return;
		if (!this.isAtleastOneSwitchIsOn()) {
			this.toasterService.showToaster(ToastOptions.Error, 'ApplicableInValidationMessage');
			return;
		}
		this.saveData();
		if (this.isEditMode) {
			this.addEditReasonForRequestForm.markAsPristine();
		}
	}

	private isAtleastOneSwitchIsOn(): boolean {
		return Object.keys(this.addEditReasonForRequestForm.controls)
			.some((x) =>
				this.addEditReasonForRequestForm.controls[x].value === true);
	}

	private saveData(): void {
		const reasonForRequestData: ReasonForRequest = this.prepareReasonForRequestData();
		if (this.isEditMode) {
			this.updateReasonForRequest(reasonForRequestData);
			return;
		}
		this.addReasonForRequest(reasonForRequestData);
	}

	private prepareReasonForRequestData(): ReasonForRequest {
		const reasonForRequestData: ReasonForRequest = this.addEditReasonForRequestForm.value;
		reasonForRequestData.SectorId = Number(this.addEditReasonForRequestForm.controls['SectorName'].value.Value);
		reasonForRequestData.ReasonForRequest = reasonForRequestData.ReasonForRequest.trim();
		return reasonForRequestData;
	}

	private updateReasonForRequest(reasonForRequestData: ReasonForRequest): void {
		this.addEditReasonForRequestForm.markAllAsTouched();
		reasonForRequestData.UKey = this.reasonForRequestDetails.UKey;
		this.reasonForRequestService.updateReasonForRequest(reasonForRequestData)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((data: ApiResponseBase) => {
				this.handleSaveResponse(data);
			});

		if (!reasonForRequestData.RfxSowRequest || this.Rfxswitchconfig) return;
		reasonForRequestData.RfxSowRequest = false;
	}

	private addReasonForRequest(reasonForRequestData: ReasonForRequest): void {
		this.addEditReasonForRequestForm.markAllAsTouched();
		this.reasonForRequestService.addReasonForRequest(reasonForRequestData)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((data: ApiResponseBase) => {
				this.handleSaveResponse(data);
				if (!data.Succeeded) return;
				this.isAdded = true;
				this.route.navigate([this.navigationPaths.list]);
			});
	}

	private handleSaveResponse(data: ApiResponseBase): void {
		this.toasterService.resetToaster();
		if (data.StatusCode === Number(HttpStatusCode.Conflict))
			return this.toasterService.showToaster(ToastOptions.Error, 'ReasonForRequestDuplicateValidation');

		if (!data.Succeeded && data.Message)
			return this.toasterService.showToaster(ToastOptions.Error, data.Message);

		this.commonService.resetAdvDropdown(this.entityId);
		this.toasterService.showToaster(ToastOptions.Success, 'ReasonForRequestAddedSuccessully');
		this.eventLogService.isUpdated.next(true);
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		if (!this.isAdded) {
			this.toasterService.resetToaster();
		}
	}
}
