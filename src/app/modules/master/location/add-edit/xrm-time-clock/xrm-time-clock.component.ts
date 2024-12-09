import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LocationService } from '@xrm-master/location/services/location.service';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { Observable, Subject, merge, takeUntil } from 'rxjs';

@Component({
	selector: 'app-xrm-time-clock',
	templateUrl: './xrm-time-clock.component.html',
	styleUrls: ['./xrm-time-clock.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class XrmTimeClockComponent implements OnInit, OnDestroy {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get the form is in edit mode or add mode
	@Input() isEditMode: boolean;

	// get is the whole form submitted
	@Input() isSubmitted: boolean;

	@Input() timeClockDropdown: any;

	// basic details child form
	public xrmTimeClockForm: FormGroup;

	// get all dropdown value trigger from parent component
	@Input() public dropdownListDataBySectorId: any;

	// get location whole data
	@Input() public locationDetails: any;

	// get sector whole data
	@Input() public sectorDetails: any;

	@Input() public reloadData: boolean = false;

	private clpJobRotation$: Observable<boolean>;
	public clpJobRotationAllowedValue: boolean = false;
	private unsubscribe$ = new Subject<void>();

	// vaidation
	private minimumHoursDeducted: any;
	private lunchDeductionInMinutes: any;
	private autoLunchDeductionList: AbstractControl[];

	private prevAutoLunchDeduct: any = {};
	private currAutoLunchDeduct: any = {};
	public isEffectiveDate: boolean = false;
	private effectiveDate: string | null = null;

	// eslint-disable-next-line max-params
	constructor(
		private customValidators: CustomValidators,
		private localizationService: LocalizationService,
		private datePipe: DatePipe,
		private locationService: LocationService
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['dropdownListDataBySectorId']) {
			const data = changes['dropdownListDataBySectorId'].currentValue;
			this.getDropdownListDataBySectorId(data);
		}
		if (changes['sectorDetails']) {
			const data = changes['sectorDetails'].currentValue;
			this.getSectorDetailsById(data);
		}
		if (changes['locationDetails']) {
			const data = changes['locationDetails'].currentValue;
			this.getLocationDetailsById(data);
		}
	}

	// get all dropdown value trigger from parent component
	private getDropdownListDataBySectorId(data: any) {
		this.dropdownListDataBySectorId = data;
	}

	// get sector by id value trigger from parent component
	private getSectorDetailsById(data: any) {
		this.sectorDetails = data;
		if (data) {
			this.patchBasicDetails(data);
		}
	}

	// get location by id value trigger from parent component
	private getLocationDetailsById(data: any) {
		this.locationDetails = data;
		if (this.isEditMode)
			this.effectiveDate = data.EffectiveDateForLunchConfig;
		if (data) {
			this.patchBasicDetails(data);
		}
	}

	ngOnInit(): void {
		// get location details formgroup from parent form and bind that in child form
		this.xrmTimeClockForm = this.childFormGroup.get('xrmTimeClock') as FormGroup;
		this.clpJobRotation$ = this.locationService.clpJobRotationObs;
		this.clpJobRotation$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: boolean) => {
			this.onClpJobRotationAllowedChange(data);
		});

	}

	private patchBasicDetails(data: any) {
		const alternateTimeClockConfigControl = this.xrmTimeClockForm.controls['alternateTimeClockConfigurations'];

		if (!this.isEditMode) {
			// if user has turn switch on then patch whole data of sector
			if (alternateTimeClockConfigControl.value && (this.sectorDetails?.XrmTimeClock?.IsXrmTimeClockRequired ||
				this.locationDetails?.EnableXRMTimeClock)) {
				this.onAlternateTimeClockConfigurationsChange(true);
			}

		}
		else {
			alternateTimeClockConfigControl.patchValue(this.locationDetails?.AltTimeClockConfigurations ?? false);
			if (alternateTimeClockConfigControl.value && (this.sectorDetails?.XrmTimeClock?.IsXrmTimeClockRequired ||
				this.locationDetails?.AltTimeClockConfigurations)) {
				this.onAlternateTimeClockConfigurationsChange(true);
			}
		}
	}

	// xrm time clock section
	public onAlternateTimeClockConfigurationsChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchAlternateTimeClockConfigurations();
		} else {
			this.xrmTimeClockForm.controls['enableXRMTimeClock'].setValue(false);
			this.onEnableXRMTimeClockChange(false);
		}
	}

	// patch Alternate Time Clock Configurations on basis of sector and location data
	private patchAlternateTimeClockConfigurations() {
		setTimeout(() => {
			if (this.isEditMode) {
				this.xrmTimeClockForm.patchValue({
					enableXRMTimeClock: this.locationDetails?.EnableXRMTimeClock || false
				});
			} else {
				this.xrmTimeClockForm.patchValue({
					enableXRMTimeClock: this.sectorDetails?.XrmTimeClock?.IsXrmTimeClockRequired || false
				});
			}
		}, magicNumber.hundred);
		if (this.sectorDetails?.XrmTimeClock?.IsXrmTimeClockRequired || this.locationDetails?.EnableXRMTimeClock) {
			this.onEnableXRMTimeClockChange(true);
		}
	}

	public onEnableXRMTimeClockChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.clockBufferValidation(true);
			this.xrmUseEmployeeIDTimeClockID(true);
			this.patchEnableXRMTimeClock();
		}
		else {
			this.xrmTimeClockForm.controls['dailyPunchApprovalNeeded'].setValue(false);
			this.xrmTimeClockForm.controls['allowManagerAdjustPunchInOut'].setValue(false);
			this.xrmTimeClockForm.controls['accrueHoursFromActualPunchIn'].setValue(false);
			this.xrmTimeClockForm.controls['isAllowManualCharge'].setValue(false);
			this.xrmTimeClockForm.controls['isAllowManualShift'].setValue(false);
			this.xrmTimeClockForm.controls['isAllowManualJobCategory'].setValue(false);
			this.xrmTimeClockForm.controls['xrmUseEmployeeIDTimeClockID'].setValue(null);
			this.xrmTimeClockForm.controls['clockBufferToSetReportingDate'].setValue(null);
			this.xrmTimeClockForm.controls['ClockBufferForShiftStart'].setValue(null);
			this.xrmTimeClockForm.controls['autoLunchDeductionAllowed'].setValue(false);
			this.xrmTimeClockForm.controls['effectiveDateForLunchConfiguration'].setValue(null);
			this.xrmTimeClockForm.controls['punchRoundingNeeded'].setValue(false);
			this.xrmUseEmployeeIDTimeClockID(false);
			this.onPunchRoundingNeededChange(false);
			this.clockBufferValidation(false);
			this.onAutoLunchDeductionAllowedChange(false);
		}
	}

	private xrmUseEmployeeIDTimeClockID(getBooleanValue: boolean) {
		const ctrl1 = this.xrmTimeClockForm.controls['xrmUseEmployeeIDTimeClockID'];
		if (getBooleanValue) {
			ctrl1.addValidators(this.customValidators.RequiredValidator(`PleaseselectoneoptionforEmployeeIDorTimeClockID`));
			ctrl1.updateValueAndValidity({ onlySelf: true });
			if (ctrl1.value === null) {
				ctrl1.markAsUntouched();
			}
		} else {
			ctrl1.setValue(null);
			ctrl1.clearValidators();
			ctrl1.updateValueAndValidity({ onlySelf: true });
		}
	}

	private clockBufferValidation(getBooleanValue: boolean) {
		const ctrl1 = this.xrmTimeClockForm.controls['clockBufferToSetReportingDate'],
			ctrl2 = this.xrmTimeClockForm.controls['ClockBufferForShiftStart'],
			controlList: AbstractControl[] = [ctrl1, ctrl2];
		if (getBooleanValue) {
			ctrl1.addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ClockBufferForReportingDate', IsLocalizeKey: true }]));
			ctrl2.addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ClockBufferForShiftStart', IsLocalizeKey: true }]));
			if (ctrl1.value === null && ctrl2.value === null) {
				ctrl1.markAsUntouched();
				ctrl2.markAsUntouched();
			}
		} else {
			this.customValidators.RemoveCascadeRequiredValidator(controlList);
			ctrl1.setValue(null);
			ctrl2.setValue(null);
		}
	}

	private clockBufferForReportingDate: any;
	private clockBufferForShiftStart: any;
	private patchEnableXRMTimeClock() {
		this.setClockBufferDates();
		this.patchXrmTimeClockForm();
		this.handleAutoLunchDeduction();
		this.handlePunchRounding();
	}

	private setClockBufferDates() {
		const clockBufferForReportingDate = this.isEditMode
				? this.getClockBufferDate(this.locationDetails.ClockBufferToSetReportingDate)
				: this.getClockBufferDate(this.sectorDetails.XrmTimeClock.ClockBufferForReportingDate),

			clockBufferForShiftStart = this.isEditMode
				? this.getClockBufferDate(this.locationDetails.ClockBufferForEarlyShiftStart)
				: this.getClockBufferDate(this.sectorDetails.XrmTimeClock.ClockBufferForShiftStart);

		this.clockBufferForReportingDate = clockBufferForReportingDate;
		this.clockBufferForShiftStart = clockBufferForShiftStart;
	}

	private getClockBufferDate(dateString: string): Date | null {
		return dateString
			? new Date(`4/5/2023 ${dateString}`)
			: null;
	}

	private patchXrmTimeClockForm() {
		setTimeout(() => {
			this.xrmTimeClockForm.patchValue({
				dailyPunchApprovalNeeded: this.getDailyPunchApprovalNeeded(),
				xrmUseEmployeeIDTimeClockID: this.getXrmUseEmployeeIDTimeClockID(),
				accrueHoursFromActualPunchIn: this.getAccrueHoursFromActualPunchIn(),
				allowManagerAdjustPunchInOut: this.getAllowManagerAdjustPunchInOut(),
				clockBufferToSetReportingDate: this.clockBufferForReportingDate,
				ClockBufferForShiftStart: this.clockBufferForShiftStart,
				isAllowManualCharge: this.getIsAllowManualCharge(),
				isAllowManualJobCategory: this.getIsAllowManualJobCategory(),
				isAllowManualShift: this.getIsAllowManualShift(),
				autoLunchDeductionAllowed: this.getAutoLunchDeductionAllowed(),
				punchRoundingNeeded: this.getPunchRoundingNeeded()
			});
		}, magicNumber.hundred);
	}

	private getDailyPunchApprovalNeeded(): boolean {
		return this.isEditMode
			? this.locationDetails?.DailyPunchApprovalNeeded ?? false
			: this.sectorDetails?.XrmTimeClock?.IsDailyPunchApprovalNeeded ?? false;
	}

	private getXrmUseEmployeeIDTimeClockID(): string {
		return this.isEditMode
			? this.locationDetails?.XrmEmpIDTimeClockID?.toString() || '43'
			: this.sectorDetails?.XrmTimeClock?.XrmUseEmployeeIdTimeClockId?.toString() || '43';
	}

	private getAccrueHoursFromActualPunchIn(): boolean {
		return this.isEditMode
			? this.locationDetails?.AccrueHoursFromActualPunchIn || false
			: this.sectorDetails?.XrmTimeClock?.AccrueHoursFromActualPunchIn || false;
	}

	private getAllowManagerAdjustPunchInOut(): boolean {
		return this.isEditMode
			? this.locationDetails?.AllowManagerAdjustPunchInOut ?? false
			: this.sectorDetails?.XrmTimeClock?.IsAllowManagerAdjustPunchInOut ?? false;
	}

	private getIsAllowManualCharge(): boolean {
		return this.isEditMode
			? this.locationDetails?.IsAllowManualCharge ?? false
			: this.sectorDetails?.XrmTimeClock?.IsAllowManualCharge ?? false;
	}

	private getIsAllowManualJobCategory(): boolean {
		return this.isEditMode
			? this.locationDetails?.IsAllowManualJobCategory ?? false
			: this.sectorDetails?.XrmTimeClock?.IsAllowManualJobCategory ?? false;
	}

	private getIsAllowManualShift(): boolean {
		return this.isEditMode
			? this.locationDetails?.IsAllowManualShift ?? false
			: this.sectorDetails?.XrmTimeClock?.IsAllowManualShift ?? false;
	}

	private getAutoLunchDeductionAllowed(): boolean {
		return this.isEditMode
			? this.locationDetails?.AutoLunchDeductionAllowed ?? false
			: this.sectorDetails?.XrmTimeClock?.IsAutoLunchDeduction ?? false;
	}

	private getPunchRoundingNeeded(): boolean {
		return this.isEditMode
			? this.locationDetails?.PunchRoundingNeeded ?? false
			: this.sectorDetails?.XrmTimeClock?.IsPunchRoundingNeeded ?? false;
	}

	private handleAutoLunchDeduction() {
		if (this.getAutoLunchDeductionAllowed()) {
			this.onAutoLunchDeductionAllowedChange(true);
		}
	}

	private handlePunchRounding() {
		if (this.getPunchRoundingNeeded()) {
			this.onPunchRoundingNeededChange(true);
		}
	}

	public onAutoLunchDeductionAllowedChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.validate();
			if (this.xrmTimeClockForm.controls['minimumHourWorkedBeforeLunchDeduction'].value === null && this.xrmTimeClockForm.controls['lunchTimeDeducted'].value === null) {
				this.xrmTimeClockForm.controls['minimumHourWorkedBeforeLunchDeduction'].markAsUntouched();
				this.xrmTimeClockForm.controls['lunchTimeDeducted'].markAsUntouched();
			}
			this.patchAutoLunchDeductionAllowed();
		} else {
			const ctrl1 = this.xrmTimeClockForm.controls['lunchTimeDeducted'],
				ctrl2 = this.xrmTimeClockForm.controls['minimumHourWorkedBeforeLunchDeduction'];
			ctrl1.setValue(null);
			ctrl2.setValue(null);
			const controlList: AbstractControl[] = [ctrl1, ctrl2];
			this.customValidators.RemoveCascadeRequiredValidator(controlList);
			if (this.autoLunchDeductionList !== undefined) {
				this.customValidators.RemoveCascadeRequiredValidator(this.autoLunchDeductionList);
			}

		}
	}

	// patch Auto Lunch Deduction data based on sector and location data
	private patchAutoLunchDeductionAllowed() {
		setTimeout(() => {
			this.xrmTimeClockForm.patchValue({
				lunchTimeDeducted: this.getLunchTimeDeducted(),
				minimumHourWorkedBeforeLunchDeduction: this.getMinimumHourWorkedBeforeLunchDeduction(),
				effectiveDateForLunchConfiguration: this.getEffectiveDateForLunchConfiguration()
			});
		}, magicNumber.hundred);
	}

	private getLunchTimeDeducted(): string | null {
		return this.isEditMode
			? this.locationDetails?.LunchTimeDeducted ?? null
			: this.sectorDetails?.XrmTimeClock?.LunchTimeDeducted ?? null;
	}

	private getMinimumHourWorkedBeforeLunchDeduction(): number | null {
		return this.isEditMode
			? this.locationDetails?.MinHourWrkBeforeLunchDeduction ?? null
			: this.sectorDetails?.XrmTimeClock?.MinimumHourWorkedBeforeLunchDeduction ?? null;
	}

	private getEffectiveDateForLunchConfiguration(): Date | null {
		const dateString = this.isEditMode
			? this.locationDetails?.EffectiveDateForLunchConfig
			: this.sectorDetails?.XrmTimeClock?.EffectiveDateForLunchConfiguration;

		return dateString
			? new Date(dateString)
			: null;
	}


	public onPunchRoundingNeededChange(getBooleanValue: boolean) {
		// get all controls of four fields
		const ctrl1 = this.xrmTimeClockForm.controls['punchInTimeIncrementRounding'],
			ctrl2 = this.xrmTimeClockForm.controls['punchOutTimeIncrementRounding'],
			ctrl3 = this.xrmTimeClockForm.controls['punchInTimeRounding'],
			ctrl4 = this.xrmTimeClockForm.controls['punchOutTimeRounding'],
			controlList: AbstractControl[] = [ctrl1, ctrl2, ctrl3, ctrl4];

		if (getBooleanValue) {
			this.xrmTimeClockForm.controls['accrueHoursFromActualPunchIn'].setValue(false);
			this.patchPunchRoundingNeeded();
			ctrl1.addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PunchInTimeIncrementRounding', IsLocalizeKey: true }]));
			ctrl2.addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PunchOutTimeIncrementRounding', IsLocalizeKey: true }]));
			ctrl3.addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PunchInTimeRounding', IsLocalizeKey: true }]));
			ctrl4.addValidators(this.customValidators.RequiredValidator('PleaseSelectData', [{ Value: 'PunchOutTimeRounding', IsLocalizeKey: true }]));
			if (ctrl1.value === null && ctrl2.value === null && ctrl3.value === null && ctrl4.value === null) {
				ctrl1.markAsUntouched();
				ctrl2.markAsUntouched();
				ctrl3.markAsUntouched();
				ctrl4.markAsUntouched();
			}
		} else {
			this.customValidators.RemoveCascadeRequiredValidator(controlList);
			ctrl1.setValue(null);
			ctrl2.setValue(null);
			ctrl3.setValue(null);
			ctrl4.setValue(null);
		}
	}

	private patchPunchRoundingNeeded() {
		setTimeout(() => {
			this.xrmTimeClockForm.patchValue({
				punchInTimeRounding: this.getPunchInTimeRounding(),
				punchOutTimeRounding: this.getPunchOutTimeRounding(),
				punchInTimeIncrementRounding: this.getPunchInTimeIncrementRounding(),
				punchOutTimeIncrementRounding: this.getPunchOutTimeIncrementRounding()
			});
		}, magicNumber.hundred);
	}

	private getPunchInTimeRounding() {
		if (this.isEditMode) {
			return this.locationService.patchValueAsObject(this.locationDetails?.PunchInTimeRoundingId);
		}
		if (this.sectorDetails?.XrmTimeClock?.PunchInTimeRounding) {
			return this.returnTextForValue(this.sectorDetails?.XrmTimeClock?.PunchInTimeRounding);
		}
		return this.getDefaultPunchInTimeRounding();
	}

	private getPunchOutTimeRounding() {
		if (this.isEditMode) {
			return this.locationService.patchValueAsObject(this.locationDetails?.PunchOutTimeRoundingId);
		}
		if (this.sectorDetails?.XrmTimeClock?.PunchOutTimeRounding) {
			return this.returnTextForValue(this.sectorDetails?.XrmTimeClock?.PunchOutTimeRounding);
		}
		return this.getDefaultPunchOutTimeRounding();
	}

	private getPunchInTimeIncrementRounding() {
		if (this.isEditMode) {
			return this.locationService.patchValueAsObject(this.locationDetails?.PunchInTimeIncrRoundingId);
		}
		if (this.sectorDetails?.XrmTimeClock?.PunchInTimeIncrementRounding !== null) {
			return this.reternTextForNumber(this.sectorDetails.XrmTimeClock.PunchInTimeIncrementRounding);
		}
		return this.getDefaultPunchInTimeIncrementRounding();
	}

	private getPunchOutTimeIncrementRounding() {
		if (this.isEditMode) {
			return this.locationService.patchValueAsObject(this.locationDetails?.PunchOutTimeIncrRoundingId);
		}
		if (this.sectorDetails?.XrmTimeClock?.PunchOutTimeIncrementRounding !== null) {
			return this.reternTextForNumber(this.sectorDetails.XrmTimeClock.PunchOutTimeIncrementRounding);
		}
		return this.getDefaultPunchOutTimeIncrementRounding();
	}

	private getDefaultPunchInTimeRounding() {
		return this.timeClockDropdown?.selectPunchTimeRounding?.Data.find((x: any) =>
			x.Value == (magicNumber.forty).toString());
	}

	private getDefaultPunchOutTimeRounding() {
		return this.timeClockDropdown?.selectPunchTimeRounding?.Data.find((x: any) =>
			x.Value == (magicNumber.forty).toString());
	}

	private getDefaultPunchInTimeIncrementRounding() {
		return this.timeClockDropdown?.selectpunchtimeinc?.Data.find((x: any) =>
			x.Value == (magicNumber.sixtyThree).toString());
	}

	private getDefaultPunchOutTimeIncrementRounding() {
		return this.timeClockDropdown?.selectpunchtimeinc?.Data.find((x: any) =>
			x.Value == (magicNumber.sixtyThree).toString());
	}

	private reternTextForNumber(number: any) {
		const Value = number.toString();
		return this.timeClockDropdown?.selectpunchtimeinc?.Data.find((x: any) =>
			x.Value == Value);
	}
	private returnTextForValue(value: string) {
		const Value = value.toString();
		return this.timeClockDropdown?.selectPunchTimeRounding?.Data.find((x: any) =>
			(x.Value) == Value);

	}

	public onAccrueHoursFromActualPunchInChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.xrmTimeClockForm.controls['punchRoundingNeeded'].setValue(false);
			this.onPunchRoundingNeededChange(false);
		}
	}

	private validate() {
		this.minimumHoursDeducted = this.xrmTimeClockForm.controls['minimumHourWorkedBeforeLunchDeduction'];
		this.lunchDeductionInMinutes = this.xrmTimeClockForm.controls['lunchTimeDeducted'];
		this.autoLunchDeductionList = [this.minimumHoursDeducted, this.lunchDeductionInMinutes];

		this.currAutoLunchDeduct.Switch = this.prevAutoLunchDeduct.Switch = this.xrmTimeClockForm.controls['autoLunchDeductionAllowed'].value;
		this.prevAutoLunchDeduct.Lunch = this.lunchDeductionInMinutes.value;
		this.prevAutoLunchDeduct.Minimum = this.minimumHoursDeducted.value;

		this.minimumHoursDeducted.addValidators([
			this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'MinimumHourWorkedBeforeLunchDeduction', IsLocalizeKey: true }]),
			this.lunchTimeToBeDeducted()
		]);

		this.lunchDeductionInMinutes.addValidators([
			this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'LunchTimeDeducted', IsLocalizeKey: true }]),
			this.lunchTimeToBeDeducted(true)
		]);
		this.isEffectiveDate = true;
		merge(
			this.lunchDeductionInMinutes.valueChanges,
			this.minimumHoursDeducted.valueChanges
		).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.currAutoLunchDeduct.Minimum = this.minimumHoursDeducted.value;
			this.currAutoLunchDeduct.Lunch = this.lunchDeductionInMinutes.value;
			this.compareAutoLunchDeductionValues();
			if (this.reloadData && this.isEditMode){
				this.clearEffectiveDateValidation();
			}
			if (this.xrmTimeClockForm.controls['autoLunchDeductionAllowed'].value) {
				if (this.isEditMode && (this.minimumHoursDeducted.dirty || this.lunchDeductionInMinutes.dirty)) {
					this.effectiveDateValidation();
				}
			}
		});
	}

	private lunchTimeToBeDeducted(LunchDeducted: boolean = false): ValidatorFn {
		return (control: AbstractControl | undefined) => {
			const MinimumHourWorkedBeforeLunchDeduction: any = control?.parent?.get('minimumHourWorkedBeforeLunchDeduction'),
				LunchTimeDeducted: any = control?.parent?.get('lunchTimeDeducted');

			if (MinimumHourWorkedBeforeLunchDeduction !== null && LunchTimeDeducted !== null) {
				if (MinimumHourWorkedBeforeLunchDeduction.value === magicNumber.zero && !LunchDeducted) {
					MinimumHourWorkedBeforeLunchDeduction.setErrors({ error: true, message: 'MinimumHoursWorkedCannotBeZero' });
					return { error: true, message: 'MinimumHoursWorkedCannotBeZero' };
				} else if (LunchTimeDeducted.value === magicNumber.zero && LunchDeducted) {
					return this.lunchDeductionErrorMessage(LunchDeducted, 'LunchTimeDeductedCannotBeZero');
				} else if ((MinimumHourWorkedBeforeLunchDeduction.value * magicNumber.sixty) < LunchTimeDeducted.value) {
					LunchTimeDeducted.setErrors({ error: true, message: 'LunchTimeCannotBeGreaterThanMinimumHours' });
					return this.lunchDeductionErrorMessage(LunchDeducted, 'LunchTimeCannotBeGreaterThanMinimumHours');
				} else {
					if (!LunchDeducted) {
						LunchTimeDeducted.setErrors(null);
						LunchTimeDeducted.updateValueAndValidity();
					}
					return null;
				}
			}
			return null;
		};
	}

	private lunchDeductionErrorMessage(LunchDeducted: boolean, message: string) {
		if (!LunchDeducted) {
			const control = this.xrmTimeClockForm.get('lunchTimeDeducted');
			control?.setErrors({ error: true, message: message });
			control?.markAsTouched();
		}
		return { error: true, message: message };
	}

	public effectiveDateValidation() {
		const effectiveDateControl = this.xrmTimeClockForm.controls['effectiveDateForLunchConfiguration'];
		effectiveDateControl.addValidators(this.dateValidator());
		effectiveDateControl.markAsTouched();
		effectiveDateControl.updateValueAndValidity();
	}

	private clearEffectiveDateValidation(): void {
		const effectiveDateControl = this.xrmTimeClockForm.controls['effectiveDateForLunchConfiguration'];
		effectiveDateControl.clearValidators();
		effectiveDateControl.markAsUntouched();
		effectiveDateControl.updateValueAndValidity();
	}

	// couston validator for effective Date For Lunch Configuration
	private dateValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			let errorMessage: string = '';
			const effectiveDateControl = this.xrmTimeClockForm.controls['effectiveDateForLunchConfiguration'],
				dateForMessage = this.datePipe.transform(this.effectiveDate, this.localizationService.GetDateFormat()),
				currentData = new Date(effectiveDateControl.value);
			if (dateForMessage)
				errorMessage = this.localizationService.GetLocalizeMessage('EffectiveDateLunchDeductionGreater', [{ Value: dateForMessage, IsLocalizeKey: true }]);
			if (control.value == null)
				return {
					error: true,
					message: 'ReqFieldValidationMessage'
				};
			if (this.effectiveDate !== null && new Date(this.effectiveDate) >= currentData) {
				return { error: true, message: errorMessage };
			}
			return null;
		};
	}

	private compareAutoLunchDeductionValues() {
		if (this.currAutoLunchDeduct.Switch === this.prevAutoLunchDeduct.Switch &&
			this.currAutoLunchDeduct.Minimum === this.prevAutoLunchDeduct.Minimum &&
			this.currAutoLunchDeduct.Lunch === this.prevAutoLunchDeduct.Lunch) { /* empty */ }
	}
	// end validation

	// clp job rotation allow based on condion enable disable field in this section
	private onClpJobRotationAllowedChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchClpJobRotationAllowed();
			this.clpJobRotationAllowedValue = false;
		} else {
			this.xrmTimeClockForm.controls['isAllowManualShift'].setValue(false);
			this.xrmTimeClockForm.controls['isAllowManualJobCategory'].setValue(false);
			this.clpJobRotationAllowedValue = true;
		}
	}

	// patch Clp Job Rotation values based on sector and location
	private patchClpJobRotationAllowed() {
		setTimeout(() => {
			this.xrmTimeClockForm.patchValue({
				isAllowManualShift: (this.isEditMode
					? (this.locationDetails?.IsAllowManualShift ?? false)
					: (this.sectorDetails?.XrmTimeClock?.IsAllowManualShift ?? false)),
				isAllowManualJobCategory: (this.isEditMode
					? (this.locationDetails?.IsAllowManualJobCategory ?? false)
					: (this.sectorDetails?.XrmTimeClock?.IsAllowManualJobCategory ?? false))
			});
		}, magicNumber.hundred);
	}

	// handle one time setting switch
	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
