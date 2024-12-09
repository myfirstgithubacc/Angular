import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationPaths } from '../constant/routes-constant';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CandidateSelectionReasonService } from '../services/candidate-selection-reason.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { CandidateSelectionReason } from '@xrm-core/models/candidate-selection-reason/candidate-selection-reason.model';
import { HttpStatusCode } from '@angular/common/http';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorService } from 'src/app/services/masters/sector.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { map, Observable, EMPTY, Subscription, switchMap } from 'rxjs';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdownOption, INavigationPathMap, ISectorDetailById } from '@xrm-shared/models/common.model';
import { ICommonComponentData, ISelectionReasonUkeyData } from '@xrm-core/models/candidate-selection-reason/candidate-selection-reason.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit {

	public addEditCandidateSelectRsnForm: FormGroup;
	public isEditMode: boolean = false;
	public sectorData: IDropdownOption[] = [];
	public entityId: XrmEntities = XrmEntities.CandidateSelectionReason;
	public navigationPaths: INavigationPathMap = NavigationPaths;
	public rfxSowValue: boolean = false;
	public maxCharacterAllowed: number = magicNumber.fifty;
	public activatedRoute$: Subscription;
	public candidateSelectionReasonDetails: ISelectionReasonUkeyData;
	public isAdded: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private route: Router,
		public canSelectRsnService: CandidateSelectionReasonService,
		private customValidators: CustomValidators,
		private toasterService: ToasterService,
		public sectorService: SectorService,
		private activatedRoute: ActivatedRoute,
		private eventLogService: EventLogService,
		private commonService: CommonService,
		private cdr: ChangeDetectorRef,
		private destroyRef: DestroyRef
	) { }

	ngOnInit(): void {
		this.initializeForm();
		this.activatedRouteSubscription();
		this.getSectorData();
		this.destroyRef.onDestroy(() => {
			if (!this.isAdded)
				this.toasterService.resetToaster();
		});
	}

	private initializeForm(): void {
		this.addEditCandidateSelectRsnForm = this.fb.group({
			SectorName: [null, this.sectorFieldValidation()],
			CandidateSelectionReason: [null, this.candidateSelectionFieldValidation()],
			ProfessionalRequest: [false],
			RfxSowRequest: [false],
			LiRequest: [false]
		});
	}
	private candidateSelectionFieldValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'SelectionReason', IsLocalizeKey: true }]);
	}

	private sectorFieldValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }]);
	}

	private activatedRouteSubscription(): void {
		this.activatedRoute.params.pipe(
			takeUntilDestroyed(this.destroyRef),
			switchMap((param) => {
				if (!param['ukey']) return EMPTY;
				return this.getCandidateSelectionReasonByUkey(param['ukey']);
			})
		).subscribe();
	}

	private getCandidateSelectionReasonByUkey(ukey: string): Observable<null> {
		this.isEditMode = true;
		return this.canSelectRsnService.getCanSelectRsnByUkey(ukey).pipe(
			takeUntilDestroyed(this.destroyRef),
			switchMap((res: GenericResponseBase<ISelectionReasonUkeyData>) => {
				if (!res.Succeeded || !res.Data) return EMPTY;
				this.candidateSelectionReasonDetails = res.Data;
				this.setFormControlData();
				this.canSelectRsnService.sharedDataSubject.next(this.prepareSharedData());
				this.cdr.detectChanges();
				return this.getRfxSowData(this.candidateSelectionReasonDetails.SectorId).pipe(map(() =>
					null));
			})
		);
	}
	private prepareSharedData(): ICommonComponentData {
		return {
			'Disabled': this.candidateSelectionReasonDetails.Disabled,
			'CandidateSelectionReasonCode': this.candidateSelectionReasonDetails.Code,
			'CandidateSelectionReasonId': this.candidateSelectionReasonDetails.Id
		};
	}

	private getRfxSowData(sectorId: number): Observable<void> {
		return this.canSelectRsnService.getDataFromSector(sectorId).pipe(
			takeUntilDestroyed(this.destroyRef),
			map((res: GenericResponseBase<ISectorDetailById>) => {
				if (!res.Succeeded || !res.Data) return;
				this.rfxSowValue = res.Data.IsRfxSowRequired;
				this.cdr.detectChanges();
				if (this.rfxSowValue) return;
				this.addEditCandidateSelectRsnForm.controls['RfxSowRequest'].setValue(false);
			})
		);
	}

	private setFormControlData(): void {
		this.addEditCandidateSelectRsnForm.patchValue(this.candidateSelectionReasonDetails);
		this.addEditCandidateSelectRsnForm.patchValue({
			SectorName: {
				Text: this.candidateSelectionReasonDetails.SectorName,
				Value: this.candidateSelectionReasonDetails.Id
			}
		});
	}

	private getSectorData(): void {
		if (this.isEditMode) return;
		this.sectorService.getSectorDropDownListV2().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (res: GenericResponseBase<IDropdownOption[]>) => {
				if (!res.Succeeded || !res.Data) return;
				this.sectorData = res.Data;
			}
		});
	}

	public onSectorChange(val: IDropdownOption | undefined): void {
		if (val === undefined) {
			this.rfxSowValue = false;
			this.addEditCandidateSelectRsnForm.controls['RfxSowRequest'].setValue(false);
			return;
		}
		this.getRfxSowData(val.Value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
	}

	public onSubmitForm(): void {
		this.addEditCandidateSelectRsnForm.markAllAsTouched();
		if (!this.addEditCandidateSelectRsnForm.valid)
			return;
		if (!this.isAtleastOneSwitchIsOn()) {
			this.toasterService.showToaster(ToastOptions.Error, 'ApplicableInValidationMessage');
			return;
		}
		this.saveData();
		if (this.isEditMode) {
			this.addEditCandidateSelectRsnForm.markAsPristine();
		}
	}

	private saveData(): void {
		const candidateSelectionData: CandidateSelectionReason = this.prepareCandidateSelectionData();
		if (this.isEditMode) {
			this.updateCandidateSelectionReason(candidateSelectionData);
			return;
		}
		this.addReasonForRequest(candidateSelectionData);
	}

	private prepareCandidateSelectionData(): CandidateSelectionReason {
		const candidateSelectionData: CandidateSelectionReason = this.addEditCandidateSelectRsnForm.value;

		candidateSelectionData.SectorId = Number(this.addEditCandidateSelectRsnForm.controls['SectorName'].value.Value);
		candidateSelectionData.CandidateSelectionReason = candidateSelectionData.CandidateSelectionReason.trim();
		return candidateSelectionData;
	}

	private updateCandidateSelectionReason(candidateSelectionData: CandidateSelectionReason): void {
		candidateSelectionData.UKey = this.candidateSelectionReasonDetails.UKey;
		this.addEditCandidateSelectRsnForm.markAllAsTouched();
		this.canSelectRsnService.updateCanSelectRsn(candidateSelectionData)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((data: GenericResponseBase<ISelectionReasonUkeyData>) => {
				this.handleSaveResponse(data);
			});
	}

	private addReasonForRequest(candidateSelectionData: CandidateSelectionReason): void {
		this.addEditCandidateSelectRsnForm.markAllAsTouched();
		this.canSelectRsnService.addCanSelectRsn(candidateSelectionData)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((data: GenericResponseBase<ISelectionReasonUkeyData>) => {
				this.handleSaveResponse(data);
				if (!data.Succeeded) return;
				this.isAdded = true;
				this.route.navigate([this.navigationPaths.list]);
			});
	}

	private handleSaveResponse(data: GenericResponseBase<ISelectionReasonUkeyData>): void {
		this.toasterService.resetToaster();
		if (data.StatusCode === Number(HttpStatusCode.Conflict)) {
			return this.toasterService.showToaster(ToastOptions.Error, 'CandidateSelectionReasonDuplicateValidation');
		}

		if (!data.Succeeded && data.Message)
			return this.toasterService.showToaster(ToastOptions.Error, data.Message);

		this.commonService.resetAdvDropdown(this.entityId);
		this.toasterService.showToaster(ToastOptions.Success, 'CandidateSelectionReasonSaveConfirmation');
		this.eventLogService.isUpdated.next(true);
	}

	private isAtleastOneSwitchIsOn(): boolean {
		return Object.keys(this.addEditCandidateSelectRsnForm.controls)
			.some((x) =>
				this.addEditCandidateSelectRsnForm.controls[x].value === true);
	}
}
