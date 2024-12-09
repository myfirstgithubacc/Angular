import { Component, Input, OnDestroy, OnInit, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { LocationService } from '@xrm-master/location/services/location.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { Subject, Subscription, forkJoin, takeUntil } from 'rxjs';
import { Day } from '@progress/kendo-date-math';

@Component({
	selector: 'app-time-and-expense-configurations',
	templateUrl: './time-and-expense-configurations.component.html',
	styleUrls: ['./time-and-expense-configurations.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeAndExpenseConfigurationsComponent implements OnInit, OnDestroy {
	// get whole location parant form
	@Input() childFormGroup: FormGroup;

	// get the form is in edit mode or add mode
	@Input() isEditMode: boolean;

	// get is the whole form submitted
	@Input() isSubmitted: boolean;

	@Input() mealBreakDropdown: any;

	// basic details child form
	public timeAndExpenseConfigurationsForm: FormGroup;

	// get all dropdown value trigger from parent component
	@Input() public dropdownListDataBySectorId: any;

	// get location whole data
	@Input() public locationDetails: any;

	// get sector whole data
	@Input() public sectorDetails: any;

	// used to implement validation on 'sendPODepletionNoticeToPrimaryManager' switch
	public formValueChangesSub: Subscription;

	// get the Hour Distribution Rule Dropdown
	public hdrList: any;

	// flag to show and hide week1 datepicker
	public showWeekOne: boolean = false;

	// gets the selected hdr rules
	private selectedHdr: any;

	// used to check if selected hdr has '9/80' predefined schedule
	private hdrValue: any;

	// flag to check if sector is selected and then patch the data from sector
	private sectorSelected: boolean = false;

	// used in disabling the dates other than the ones falling on configured 'Weekending Day' in 'Sector'
	private daysOfWeek: Day[] = [Day.Monday, Day.Tuesday, Day.Wednesday, Day.Thursday, Day.Friday, Day.Saturday, Day.Sunday];
	public disabledDates: Day[];
	private weekendingDayId: any;
	private unsubscribe$ = new Subject<void>();
	public hideCLPJobRotation: boolean = true;

	constructor(
		private customValidators: CustomValidators,
		private locationService: LocationService,
		private cdr: ChangeDetectorRef
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

	private getDropdownListDataBySectorId(data: any) {
		this.dropdownListDataBySectorId = data;
	}

	private getSectorDetailsById(data: any) {
		this.sectorDetails = data;
		if (data) {
			this.disableNonWeekendingDates();
			this.patchBasicDetails(data);
			this.sectorSelected = true;
		}
		else {
			this.sectorSelected = false;
		}
	}

	private getLocationDetailsById(data: any) {
		if (data) {
			this.locationDetails = data;
			this.patchBasicDetails(this.locationDetails);
			this.handleWeekOne();
			this.locationService.getSectorDetailsBySectorId(this.locationDetails.SectorId).pipe(takeUntil(this.unsubscribe$)).subscribe((x: any) => {
				if (x) {
					this.sectorDetails = x.Data;
					this.disableNonWeekendingDates();
				}
			});
		}
	}


	ngOnInit(): void {
		// get only location details formgroup from parent form and bind that in child form
		this.timeAndExpenseConfigurationsForm = this.childFormGroup.get('timeAndExpenseConfigurations') as FormGroup;
		this.checkSwitchSendPODepletionNoticesTo();
		this.getHourDistributionRulesDropdown();
	}

	// To disables all other dates which are not able to select on calender
	private disableNonWeekendingDates() {
		this.weekendingDayId = this.sectorDetails?.BasicDetail?.WeekEndingDayId;
		this.disabledDates = this.daysOfWeek.filter((day: any) =>
			day !== this.weekendingDayId);
	}

	// show field on basis of 9/80 hdr configuration
	public handleWeekOne() {
		this.hdrValue = this.timeAndExpenseConfigurationsForm.controls['hourDistributionRules'].value;
		const hdrScheduleName: string[] = [];

		if (this.hdrValue?.length) {
			const observables = this.hdrValue.map((x: any) =>
				this.locationService.getHourDistributionRuleById(x.Value));

			forkJoin(observables).pipe(takeUntil(this.unsubscribe$)).subscribe((results: any) => {
				results.forEach((data: any) => {
					hdrScheduleName.push(data.Data.PreDefinedWorkScheduleName);
				});

				this.showWeekOne = hdrScheduleName.includes('9/80') && this.hdrValue?.length;
				this.setValidationWeekOne();
				this.cdr.markForCheck();
			});
		} else {
			this.showWeekOne = false;
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].reset();
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].setErrors(null);
		}
	}
	// handling condition based validation on hdr and dependent controls
	private setValidationWeekOne() {
		if (this.showWeekOne) {
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].addValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: '1Week', IsLocalizeKey: true }]));
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].updateValueAndValidity();
		}
		else {
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].reset();
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].setErrors(null);
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].clearValidators();
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].updateValueAndValidity();
		}

	}

	public checkWeekendingDay(e: any) {
		const dayID = new Date(e).getDay();

		if (dayID != this.weekendingDayId) {
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].setErrors({
				error: true,
				message: 'SelectSectorWeekendingDay'
			});
		}
		else {
			this.timeAndExpenseConfigurationsForm.controls['nineEightyWeekOne'].setErrors(null);
		}
	};

	public getHourDistributionRulesDropdown() {
		this.locationService.getHourDistributionAllDropdownList().pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
			this.hdrList = data?.Data;
		});
	}

	// method to patching basic location details on edit
	private patchBasicDetails(data: any) {
		if (this.isEditMode) {
			this.patchEditModeDetails(data);
		} else {
			this.patchNonEditModeDetails();
		}
	}

	private patchEditModeDetails(data: any) {
		this.selectedHdr = data.LocHourDistributionRule.map((item: any) =>
			({
				Text: item.RuleName,
				Value: String(item.HourDistributionRuleId),
				Id: item.Id
			}));

		const locationDetails = this.locationDetails || {};
		this.timeAndExpenseConfigurationsForm.patchValue({
			nineEightyWeekOne: locationDetails.NineEightyWeekOne
				? new Date(locationDetails.NineEightyWeekOne)
				: new Date(),
			allowExpenseEntry: locationDetails.AllowExpenseEntry,
			alternateTimeAndExpenseConfigurations: locationDetails.AlternateTAndEConfigurations ?? false,
			hourDistributionRules: this.selectedHdr || null,
			allowContractorToAddHolidaysHours: locationDetails.AllowToAddHolidayHours ?? false,
			applicableRestMealBreaksConfiguration: locationDetails.RestMealBreakConfig
				? { Value: data['RestMealBreakConfigId']?.toString() }
				: null
		});

		if (this.timeAndExpenseConfigurationsForm.controls['alternateTimeAndExpenseConfigurations'].value &&
			locationDetails.AlternateTAndEConfigurations) {
			this.onAlternateTimeAndExpenseConfigurationsChange(true);
		}
	}

	private patchNonEditModeDetails() {
		if (this.timeAndExpenseConfigurationsForm.controls['alternateTimeAndExpenseConfigurations'].value &&
			this.sectorDetails?.TimeAndExpenseConfiguration?.SectorUkey) {
			this.onAlternateTimeAndExpenseConfigurationsChange(true);
		}
	}

	// alternate time and expense configuration change
	public onAlternateTimeAndExpenseConfigurationsChange(getBooleanValue: boolean) {
		this.setValidationSendPODepletionNotices(getBooleanValue);

		if (getBooleanValue && this.sectorSelected || this.isEditMode) {
			this.patchAlternateTimeAndExpenseConfigurations();
		} else if (!getBooleanValue) {
			this.timeAndExpenseConfigurationsForm.controls['clpJobRotationAllowed'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['allTimeAdjustmentsApprovalRequired'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['allowTimeUploadWithSTOTDT'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['validateApprovedAmountWithTimeRecords'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['displayStaffingAgencyInTandEApproval'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPOOwner'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['timeUploadAsApprovedHours'].setValue(false);
			this.timeAndExpenseConfigurationsForm.controls['autoApproveHoursAdjustmentAllowed'].setValue(false);
		}
	}
	private setValidationSendPODepletionNotices(val: boolean) {
		const ctrl1 = this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'],
			ctrl2 = this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPOOwner'],
			controlList: AbstractControl[] = [ctrl1, ctrl2];
		ctrl1.setValue(false);
		if (val) {
			if (ctrl1.value === false && ctrl2.value === false) {
				ctrl1.addValidators(this.customValidators.RequiredValidator('PoDepletionNoticesSentTo'));
			} else {
				ctrl1.clearValidators();
				ctrl1.updateValueAndValidity();
			}
		} else {
			this.customValidators.RemoveCascadeRequiredValidator(controlList);
		}
		this.timeAndExpenseConfigurationsForm.updateValueAndValidity();

		ctrl1.reset();
	}

	// method for get data from sector and location on condition basis to patch alternate time and expense configurations
	private patchAlternateTimeAndExpenseConfigurations() {
		const patchValue = () => {
			this.timeAndExpenseConfigurationsForm.patchValue(this.getFormPatchValues());
		};

		setTimeout(patchValue, magicNumber.hundred);
		this.applyConditionalChanges();
	}

	private getFormPatchValues() {
		const getConfigurationValue = (editModeValue: any, sectorValue: any) => {
			return this.isEditMode
				? (editModeValue || false)
				: (sectorValue || false);
		};

		return {
			clpJobRotationAllowed: getConfigurationValue(
				this.locationDetails?.IsClpJobRotationAllowed,
				this.sectorDetails?.TimeAndExpenseConfiguration?.IsClpJobRotationAllowed
			),
			allTimeAdjustmentsApprovalRequired: getConfigurationValue(
				this.locationDetails?.IsTimeAdjustApprovalRequired,
				this.sectorDetails?.TimeAndExpenseConfiguration?.IsAllTimeAdjustmentApprovalRequired
			),
			allowTimeUploadWithSTOTDT: getConfigurationValue(
				this.locationDetails?.AllowTimeUploadWithStOtDt,
				this.sectorDetails?.TimeAndExpenseConfiguration?.AllowTimeUploadWithStOtDt
			),
			validateApprovedAmountWithTimeRecords: getConfigurationValue(
				this.locationDetails?.ValidateApprovedAmtTimeRecords,
				this.sectorDetails?.TimeAndExpenseConfiguration?.ValidateApprovedAmountWithTimeRecords
			),
			displayStaffingAgencyInTandEApproval: getConfigurationValue(
				this.locationDetails?.DisplayStaffingInTandEApproval,
				this.sectorDetails?.TimeAndExpenseConfiguration?.AllowStaffingAgencyInTandEApproval
			),
			sendPODepletionNoticeToPrimaryManager: getConfigurationValue(
				this.locationDetails?.SendPODeplNoticeToPrimaryMgr,
				this.sectorDetails?.TimeAndExpenseConfiguration?.IsPoSentToPm
			),
			sendPODepletionNoticeToPOOwner: getConfigurationValue(
				this.locationDetails?.SendPODeplNoticeToPOOwner,
				this.sectorDetails?.TimeAndExpenseConfiguration?.IsPoSentToPoOwner
			),
			timeUploadAsApprovedHours: getConfigurationValue(
				this.locationDetails?.TimeUploadAsApprovedHours,
				this.sectorDetails?.TimeAndExpenseConfiguration?.TimeUploadAsApprovedHours
			)
		};
	}

	private applyConditionalChanges() {
		if (this.sectorDetails?.TimeAndExpenseConfiguration?.TimeUploadAsApprovedHours || this.locationDetails?.TimeUploadAsApprovedHours) {
			this.onTimeUploadAsApprovedHoursChange(true);
		}

		if (this.sectorDetails?.TimeAndExpenseConfiguration?.IsClpJobRotationAllowed || this.locationDetails?.IsClpJobRotationAllowed) {
			const rotationAllowed = this.isEditMode
				? this.locationDetails?.IsClpJobRotationAllowed
				: this.sectorDetails?.TimeAndExpenseConfiguration?.IsClpJobRotationAllowed;
			this.onClpJobRotationAllowedChange(rotationAllowed);
		}
	}


	public onTimeUploadAsApprovedHoursChange(getBooleanValue: boolean) {
		if (getBooleanValue) {
			this.patchTimeUploadAsApprovedHoursChange();
		} else {
			this.timeAndExpenseConfigurationsForm.controls['autoApproveHoursAdjustmentAllowed'].setValue(false);
		}

	}

	private patchTimeUploadAsApprovedHoursChange() {
		setTimeout(() => {
			this.timeAndExpenseConfigurationsForm.patchValue({
				autoApproveHoursAdjustmentAllowed: (this.isEditMode
					? (this.locationDetails?.AutoApproveHrsAdjAllowed
						|| false)
					: (this.sectorDetails?.TimeAndExpenseConfiguration?.IsAutoApprovedAdjustment
						|| false))
			});
		});
	}

	public onClpJobRotationAllowedChange(getBooleanValue: boolean) {
		this.locationService.clpJobRotation.next(getBooleanValue);
	}
	// end time and expense


	public oneTimeSettingForToggleSwitchToMakeDisable(controlFieldName: any) {
		if (this.isEditMode && this.locationDetails?.[controlFieldName]) {
			return true;
		} else {
			return false;
		}
	}

	public oneTimeSettingForToggleSwitchToMakeDisableChild() {
		if (this.isEditMode && this.locationDetails?.AlternateTAndEConfigurations) {
			return true;
		} else {
			return false;
		}
	}

	// TIME & EXPENSE CONFIGURATIONS


	public checkSwitchSendPODepletionNoticesTo() {
		this.formValueChangesSub = this.timeAndExpenseConfigurationsForm.valueChanges
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: any) => {
				if (this.timeAndExpenseConfigurationsForm.controls['alternateTimeAndExpenseConfigurations'].value) {
					const PODepletion = !data.sendPODepletionNoticeToPrimaryManager && !data.sendPODepletionNoticeToPOOwner;
					if (PODepletion) {
						this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].setErrors({
							error: true,
							message: "PoDepletionNoticesSentTo"
						});
					} else {
						this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].setErrors(null);
						this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].clearValidators();
						this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].markAllAsTouched();
					}
				} else {
					this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].setErrors(null);
					this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].clearValidators();
					this.timeAndExpenseConfigurationsForm.controls['sendPODepletionNoticeToPrimaryManager'].markAllAsTouched();
				}
			});
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		if (this.formValueChangesSub) {
			this.formValueChangesSub.unsubscribe();
		}
	}

}
