import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@xrm-shared/services/common-constants/HttpStatusCode.enum';
import { NavigationPaths } from '../constant/routes-constant';
import { SectorService } from 'src/app/services/masters/sector.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { MinimumClearanceToStartService } from '../services/minimum-clearance-to-start.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { EMPTY, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ICommonComponentData, IMinimumClearanceDetails } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdownOption, INavigationPathMap, ISectorDetailById } from '@xrm-shared/models/common.model';
import { SpecialChars } from '../constant/characters-constant';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { MinimumClearanceToStart } from '@xrm-core/models/minimum-clearance/minimum-clearance-to-start.model';

@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy {

	public addEditMinimumClearanceForm: FormGroup;
	public isEditMode: boolean = false;
	public sectorList: IDropdownOption[] = [];
	public minimumClearanceDetails: IMinimumClearanceDetails;
	public navigationPaths: INavigationPathMap = NavigationPaths;
	public specialCharsNotAllowed: string[] = SpecialChars.CharsNotAllowed;
	public isRfxSowRequired: boolean = false;
	public entityId: XrmEntities = XrmEntities.MinimumClearancetoStart;
	public isAdded: boolean = false;
	public maxChar: number = magicNumber.fifty;
	private unsubscribeAll$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private customValidators: CustomValidators,
		private router: Router,
		private eventLogService: EventLogService,
		private sectorService: SectorService,
		private toasterService: ToasterService,
		private commonService: CommonService,
		private minimumClearanceService: MinimumClearanceToStartService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.initializeFormGroup();
		this.fetchAndProcessClearanceDetails();
		this.getSectorListData();
	}

	private initializeFormGroup(): void {
		this.addEditMinimumClearanceForm = this.formBuilder.group({
			SectorName: [null, this.sectorFieldValidation()],
			ClearanceLevelName: [null, this.clearanceLevelFieldValidation()],
			ProfessionalRequest: [false],
			Candidates: [false],
			RfxSowRequest: [false],
			SowResources: [false],
			Code: [null]
		});
	}

	private sectorFieldValidation(): ValidatorFn {
		return this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'Sector', IsLocalizeKey: true }]);
	}

	private clearanceLevelFieldValidation(): (ValidatorFn | ValidationErrors | null)[] {
		return [
			this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ClearanceLevel', IsLocalizeKey: true }]),
			this.customValidators.MaxLengthValidator(magicNumber.fifty)
		];
	}

	private fetchAndProcessClearanceDetails(): void {
		this.activatedRoute.params.pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((params) =>
				params['uKey']
					? this.processClearanceDetails(params['uKey'])
					: EMPTY)
		).subscribe();
		this.cdr.detectChanges();
	}

	private processClearanceDetails(uKey: string): Observable<GenericResponseBase<ISectorDetailById>> {
		this.isEditMode = true;
		return this.getMinimumClearanceByUkey(uKey).pipe(
			takeUntil(this.unsubscribeAll$),
			switchMap((response) =>
				this.handleClearanceResponse(response)),
			switchMap((sectorId) =>
				this.setRfxControlData(sectorId))
		);
	}

	private getMinimumClearanceByUkey(uKey: string): Observable<GenericResponseBase<IMinimumClearanceDetails>> {
		return this.minimumClearanceService.getMinimumClearanceToStartByUKey(uKey);
	}

	private handleClearanceResponse(response: GenericResponseBase<IMinimumClearanceDetails>): Observable<number> {
		if (!response.Succeeded || !response.Data) {
			return EMPTY;
		}

		this.minimumClearanceDetails = response.Data;
		this.setFormControlData();
		this.minimumClearanceService.sharedDataSubject.next(this.prepareSharedData());

		return of(this.minimumClearanceDetails.SectorId);
	}

	private prepareSharedData(): ICommonComponentData {
		return {
			'Disabled': this.minimumClearanceDetails.Disabled,
			'MinClearanceId': this.minimumClearanceDetails.Id,
			'MinClearanceCode': this.minimumClearanceDetails.Code
		};
	}

	private setRfxControlData(sectorId: number): Observable<GenericResponseBase<ISectorDetailById>> {
		return this.minimumClearanceService.getSectorBasicDetailById(sectorId).pipe(
			takeUntil(this.unsubscribeAll$),
			tap((response) =>
				this.handleSectorResponse(response))
		);
	}

	private handleSectorResponse(response: GenericResponseBase<ISectorDetailById>): void {
		if (!response.Succeeded || !response.Data) return;
		this.isRfxSowRequired = response.Data.IsRfxSowRequired;
		this.cdr.detectChanges();
		if (this.isRfxSowRequired) return;
		this.addEditMinimumClearanceForm.patchValue({
			'RfxSowRequest': false,
			'SowResources': false
		});
	}

	private getSectorListData(): void {
		if (this.isEditMode) return;

		this.sectorService.getSectorDropDownListV2().pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((data: GenericResponseBase<IDropdownOption[]>) => {
				if (!data.Succeeded || !data.Data) return;
				this.sectorList = data.Data;
			});

	}

	private setFormControlData(): void {
		this.addEditMinimumClearanceForm.patchValue(this.minimumClearanceDetails);
		this.addEditMinimumClearanceForm.patchValue({
			SectorName: {
				Text: this.minimumClearanceDetails.SectorName,
				Value: this.minimumClearanceDetails.SectorId
			}
		});
	}

	public onCandidatesChange(): void {
		const proffRequestControl: FormControl = this.addEditMinimumClearanceForm.get('ProfessionalRequest') as FormControl;
		(this.addEditMinimumClearanceForm.controls['Candidates'] as FormControl).setValue(proffRequestControl.value);
	}

	public onSOWResourcesChange(): void {
		const rfxRequestControl: FormControl = this.addEditMinimumClearanceForm.get('RfxSowRequest') as FormControl;
		(this.addEditMinimumClearanceForm.controls['SowResources'] as FormControl).setValue(rfxRequestControl.value);
	}

	public onSectorChange(data: IDropdownOption | undefined): void {
		if (data === undefined) {
			this.isRfxSowRequired = false;
			this.addEditMinimumClearanceForm.controls['RfxSowRequest'].setValue(false);
			return;
		}
		this.setRfxControlData(data.Value).subscribe();
	}

	private saveData(): void {
		const minData: MinimumClearanceToStart = this.addEditMinimumClearanceForm.value;
		minData.SectorId = this.addEditMinimumClearanceForm.controls['SectorName'].value.Value;
		if (this.isEditMode) {
			this.updateMinimumClearance(minData);
			return;
		}
		this.addMinimumClearance(minData);
	}

	private updateMinimumClearance(minData: MinimumClearanceToStart): void {
		this.addEditMinimumClearanceForm.markAllAsTouched();
		minData.ClearanceLevelName = minData.ClearanceLevelName.trim();
		minData.UKey = this.minimumClearanceDetails.UKey;
		this.minimumClearanceService.updateMinimumClearanceToStart(minData)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe({
				next: (data: ApiResponseBase) => {
					this.handleSaveResponse(data);
				}
			});
	}

	private addMinimumClearance(minData: MinimumClearanceToStart): void {
		this.addEditMinimumClearanceForm.markAllAsTouched();
		minData.ClearanceLevelName = minData.ClearanceLevelName.trim();
		this.minimumClearanceService.addMinimumClearanceToStart(minData)
			.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((data: ApiResponseBase) => {
				this.handleSaveResponse(data);
				if (!data.Succeeded) return;
				this.isAdded = true;
				this.router.navigate([this.navigationPaths.list]);
			});
	}

	private handleSaveResponse(data: ApiResponseBase): void {

		if (data.StatusCode === Number(HttpStatusCode.Conflict)) {
			return this.toasterService.showToaster(ToastOptions.Error, 'MinimumClearanceDuplicateValidation');
		}

		if (!data.Succeeded && data.Message)
			return this.toasterService.showToaster(ToastOptions.Error, data.Message);

		this.commonService.resetAdvDropdown(this.entityId);
		this.toasterService.showToaster(ToastOptions.Success, 'MinimumClearanceAddedSuccessfully');
		this.eventLogService.isUpdated.next(true);

	}


	private isAtleastOneSwitchOn(): boolean {
		return Object.keys(this.addEditMinimumClearanceForm.controls)
			.some((ctrl) =>
				this.addEditMinimumClearanceForm.controls[ctrl].value === true);
	}

	public onSubmitForm(): void {
		this.addEditMinimumClearanceForm.markAllAsTouched();
		this.toasterService.resetToaster();
		if (!this.addEditMinimumClearanceForm.valid)
			return;
		if (!this.isAtleastOneSwitchOn()) {
			this.toasterService.showToaster(ToastOptions.Error, 'ApplicableInValidationMessage');
			return;
		}
		this.saveData();
		if (this.isEditMode) {
			this.addEditMinimumClearanceForm.markAsPristine();
		}
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
		if (!this.isAdded) {
			this.toasterService.resetToaster();
		}
	}
}
