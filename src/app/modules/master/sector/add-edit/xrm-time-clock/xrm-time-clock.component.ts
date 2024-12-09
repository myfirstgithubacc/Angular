
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subject, merge, take, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { SectorAllDropdowns } from '@xrm-core/models/Sector/sector-all-dropdowns.model';
import { SectorState } from 'src/app/core/store/states/sector.state';
import { Store } from '@ngxs/store';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { SectorService } from 'src/app/services/masters/sector.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { SectorXrmTimeClock } from '@xrm-core/models/Sector/sector-xrm-time-clock.model';
import { ITimeAndExpenseConfigFM } from '../time-and-expense-configurations/utils/helper';
import { IXrmTimeClockDetailsFM, patchXrmTimeClockDetails } from './utils/helper';
import { DropdownModel } from '@xrm-shared/models/common.model';

@Component({
	selector: 'app-xrm-time-clock',
	templateUrl: './xrm-time-clock.component.html',
	styleUrls: ['./xrm-time-clock.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class XrmTimeClockComponent implements OnInit, OnChanges, OnDestroy {
	@Input() childFormGroup: FormGroup;
	@Input() formStatus: boolean;
	@Input() isDraft: boolean = false;
	@Input() reload: number = magicNumber.zero;
	@Input() ShowAll: boolean = false;

	public isEditMode: boolean;
	public xrmTimeClockDetailsForm: FormGroup<IXrmTimeClockDetailsFM>;
	public isSwitchPunchRoundingNeeded: boolean = false;
	public isSwitchLunchDeduction: boolean = false;
	public isSwitchXRMTimeClock: boolean = false;
	public punchTimeIncRoundings: DropdownModel | undefined | null;
	public xrmUseEmployeeTimeClock: DropdownModel | undefined | null;
	public punchTimeRoundings: DropdownModel | undefined | null;
	public isEnableXRMTimeClock: boolean = false;
	public isEffectiveDate: boolean = false;
	public timeAndExpenseConfigForm: FormGroup<ITimeAndExpenseConfigFM>;
	public magicNumbers = magicNumber;
	public disableControls: boolean = false;

	private minimumHoursDeducted: FormControl<number | null>;
	private lunchDeductionInMinutes: FormControl<number | null>;
	private effectiveDateControl: FormControl<Date|null>;
	private effectiveDate: Date | null = null;
	private prevAutoLunchDeduct: {Switch:boolean, Lunch:number, Minimum:number} = {
		Switch: false,
		Lunch: Number(magicNumber.zero),
		Minimum: Number(magicNumber.zero)
	};
	private currAutoLunchDeduct: {Switch:boolean, Lunch:number, Minimum:number} = {
		Switch: false,
		Lunch: Number(magicNumber.zero),
		Minimum: Number(magicNumber.zero)
	};
	private destroyAllSubscribtion$ = new Subject<void>();
	private EffectiveLunchDateValidationMsg = this.localizationService.GetLocalizeMessage('PleaseSelectData', [{ Value: 'EffectiveDateForLunchConfiguration', IsLocalizeKey: true }]);

	// eslint-disable-next-line max-params
	constructor(
		private localizationService: LocalizationService,
		private store: Store,
		private datePipe: DatePipe,
		private el: ElementRef,
		private toasterService: ToasterService,
		private sectorService: SectorService,
		private cdr: ChangeDetectorRef
	) {	}

	ngOnChanges() {
		this.isEditMode = this.formStatus;

		if (this.reload) {
			this.setInitialData();
		}
	}

	private setInitialData() {
		this.switchXRMTimeClock(this.xrmTimeClockDetailsForm.controls.IsXrmTimeClockRequired.value ?? false);
	}

	ngOnInit(): void {
		if (!this.ShowAll)
			this.sectorService.makeScreenScrollOnUpdate(this.el);

		this.InitializeTimeClock();

		if (this.isEditMode) {
			this.EditMode();
		} else {
			this.AddMode();
		}

		// Auto Lunch Deduction Validation
		this.AutoLunchDeductionValidation();
	}

	InitializeTimeClock() {
		this.xrmTimeClockDetailsForm = this.childFormGroup.get('XrmTimeClock') as FormGroup<IXrmTimeClockDetailsFM>;
		this.timeAndExpenseConfigForm = this.childFormGroup.get('TimeAndExpenseConfiguration') as FormGroup<ITimeAndExpenseConfigFM>;

		this.effectiveDateControl = this.xrmTimeClockDetailsForm.controls.EffectiveDateForLunchConfiguration as FormControl<Date|null>;

		this.minimumHoursDeducted = this.xrmTimeClockDetailsForm.controls.MinimumHourWorkedBeforeLunchDeduction as FormControl<number | null>;
		this.lunchDeductionInMinutes = this.xrmTimeClockDetailsForm.controls.LunchTimeDeducted as FormControl<number | null>;

		this.store.select(SectorState.getSectorAllDropdowns).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({PunchTimeIncrementRoundings, XrmUseEmployeeTimeClocks, PunchTimeRoundings}: SectorAllDropdowns) => {
				this.punchTimeIncRoundings = PunchTimeIncrementRoundings;
				this.xrmUseEmployeeTimeClock = XrmUseEmployeeTimeClocks;
				this.punchTimeRoundings = PunchTimeRoundings;
			});
	}

	private AddMode() {
		this.setInitialData();
	}

	private EditMode() {
		this.store.select(SectorState.sectorByUKey).pipe(take(magicNumber.one), takeUntil(this.destroyAllSubscribtion$)).
			subscribe(({XrmTimeClock}) => {
				this.UpdateBasicValidity(XrmTimeClock);

				// Effective Date...
				const effectiveDateForLunch = XrmTimeClock.EffectiveDateForLunchConfiguration;

				this.effectiveDate = effectiveDateForLunch !== null && effectiveDateForLunch !== undefined
					? new Date(effectiveDateForLunch)
					: null;
				// Enable XRM Time Clock...
				this.disableControlsOnEdit();
				this.switchXRMTimeClock(XrmTimeClock.IsXrmTimeClockRequired);

				this.cdr.markForCheck();
			});
	}

	private disableControlsOnEdit = () =>
		this.disableControls = true;

	private UpdateBasicValidity(XrmTimeClock: SectorXrmTimeClock) {
		patchXrmTimeClockDetails(XrmTimeClock, this.xrmTimeClockDetailsForm);

		this.xrmTimeClockDetailsForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
		this.currAutoLunchDeduct.Switch = this.prevAutoLunchDeduct.Switch = this.xrmTimeClockDetailsForm.controls.IsAutoLunchDeduction.value;
		this.prevAutoLunchDeduct.Lunch = Number(this.lunchDeductionInMinutes.value);
		this.prevAutoLunchDeduct.Minimum = Number(this.minimumHoursDeducted.value);
	}

	private AutoLunchDeductionValidation() {
		merge(this.lunchDeductionInMinutes.valueChanges, this.minimumHoursDeducted.valueChanges)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(() => {
				this.currAutoLunchDeduct.Minimum = Number(this.minimumHoursDeducted.value);
				this.currAutoLunchDeduct.Lunch = Number(this.lunchDeductionInMinutes.value);
				this.compareAutoLunchDeductionValues();
				if (this.xrmTimeClockDetailsForm.controls.IsAutoLunchDeduction.value) {
					this.IsAutoLunchDeductionTrue();
				}
				this.cdr.markForCheck();
			});
	}

	private IsAutoLunchDeductionTrue() {
		if (this.minimumHoursDeducted.dirty || this.lunchDeductionInMinutes.dirty) {
			this.showEffectiveDateWithValidation();
		}
	}

	private switchPunchRoundingNeeded(toggle: boolean) {
		if (toggle) {
			this.isSwitchPunchRoundingNeeded = true;
			this.xrmTimeClockDetailsForm.controls.AccrueHoursFromActualPunchIn.setValue(false);
		}
		else {
			this.isSwitchPunchRoundingNeeded = false;
		}
	}

	OnChangeSwitchPunchRoundingNeeded(toggle: boolean) {
		this.switchPunchRoundingNeeded(toggle);
		if(!toggle) {
			this.toasterService.showToaster(ToastOptions.Information, 'PunchRoundingNeededReset');
		}
	}

	OnChangeSwitchLunchDeduction(toggle: boolean) {
		this.switchLunchDeduction(toggle);
		if(toggle)
			this.showEffectiveDateWithValidation();
	}

	private switchLunchDeduction(toggle: boolean) {
		this.prevAutoLunchDeduct.Switch = toggle;
		this.isSwitchLunchDeduction = toggle;
	}

	private showEffectiveDateWithValidation() {
		if (this.isEditMode && !this.isDraft) {
			this.isEffectiveDate = true;
			this.effectiveDateValidation();
		}
	}

	switchXRMTimeClock(toggle: boolean) {
		if (toggle) {
			this.isSwitchXRMTimeClock = true;
			this.switchLunchDeduction(this.xrmTimeClockDetailsForm.controls.IsAutoLunchDeduction.value);
			this.switchPunchRoundingNeeded(this.xrmTimeClockDetailsForm.controls.IsPunchRoundingNeeded.value);
		} else {
			this.isSwitchXRMTimeClock = false;
		}
		this.xrmTimeClockDetailsForm.updateValueAndValidity();
	}

	switchAccrueHoursFromActualPunchIn() {
		this.xrmTimeClockDetailsForm.controls.IsPunchRoundingNeeded.setValue(false);
		this.isSwitchPunchRoundingNeeded = false;
	}

	private effectiveDateValidation() {
		this.effectiveDateControl.addValidators(this.DateValidator());
		this.effectiveDateControl.updateValueAndValidity({ onlySelf: true });
		this.effectiveDateControl.markAsTouched();
	}

	private DateValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			let errorMessage: string = '';
			const dateForMessage: string | null = this.datePipe.transform(this.effectiveDate, this.localizationService.GetDateFormat()),
				currentData: Date = new Date(this.effectiveDateControl.value ?? '');
			if (dateForMessage)
				errorMessage = this.localizationService.GetLocalizeMessage('EffectiveDateLunchDeductionGreater', [{ Value: dateForMessage, IsLocalizeKey: false }]);
			if (control.value == null)
				return {
					error: true,
					message: this.EffectiveLunchDateValidationMsg
				};
			if (this.effectiveDate !== null && this.effectiveDate >= currentData) {
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

	ngOnDestroy(): void {
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
		this.sectorService.clearTimeout();
	}
}
