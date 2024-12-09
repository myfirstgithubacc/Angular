import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DatePipe } from '@angular/common';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { HttpStatusCode } from '@angular/common/http';
import { NavigationPaths } from '../constant/routes-constant';
import { PunchReportDaySetting, WorkingDays, WorkingDaysValues } from '../constant/workingdays.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { AddDispatchApiData, AddDispatchShiftData, AddShiftData, ClpWorkingDay, CurrencyOnSectorData, DropdownOptionList, editDispatchApiData, NavPathsType, OnSectorChangeDropDown, PunchReportDaySettingItem, RootObject, SectorIdValue, ShiftData, ShiftDataEditDispatch, ShiftDataSaveEditMode, ValidationError } from '../constant/shift-data.model';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IDropdown } from '@xrm-shared/models/common.model';
import { TimeRange } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { SharedVariablesService } from 'src/app/modules/job-order/light-industrial/services/shared-variables.service';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { WeekdayTimePickerComponent } from '@xrm-shared/widgets/form-controls/weekday-time-picker/weekday-time-picker.component';
@Component({
	selector: 'app-add-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddEditComponent implements OnInit, OnDestroy {
	@ViewChild('weekdayPicker') weekdayPicker!: WeekdayTimePickerComponent;
	private ngUnsubscribe$ = new Subject<void>();
	public allowCustom = true;
	public isEditMode: boolean = false;
	private selectedDays: any = {};
	public dataShift: ShiftData;
	public shiftDifferentialMethod: number | null;
	public shiftConfigField: boolean = false;
	public sectorData: DropdownOptionList[] = [];
	public addEditShiftForm: FormGroup;
	public shiftReportingDayType: string;
	public location: DropdownOptionList[] = [];
	public reasonForChange: string;
	public multiplierOrAdder: string | null;
	public enableXrmTimeClock: boolean = false;
	public navigationPaths: NavPathsType = NavigationPaths;
	public ukey: string;
	public statusCardREcord: string;
	public statusError: boolean = true;
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	public recordName: boolean = false;
	public countryVal: number;
	public conflictData: boolean = false;
	public currencycode: string;
	private XRMTimeClockRequired: boolean = false;
	public punchReportDaySetting: PunchReportDaySettingItem[] = [
		{ Text: PunchReportDaySetting.PunchIn, Value: PunchReportDaySetting.In },
		{ Text: PunchReportDaySetting.PunchOut, Value: PunchReportDaySetting.Out }
	];
	public shiftDrp = [
		{Text: 'Adder', Value: magicNumber.twentyFour},
		{Text: 'Multiplier', Value: magicNumber.twentyFive}
	];

	public daysInfo = [
		{ day: 'Sun', isSelected: false },
		{ day: 'Mon', isSelected: false },
		{ day: 'Tue', isSelected: false },
		{ day: 'Wed', isSelected: false },
		{ day: 'Thu', isSelected: false },
		{ day: 'Fri', isSelected: false },
		{ day: 'Sat', isSelected: false }
	  ];

	public WorkingDaysList: { Text: WorkingDays; Value: WorkingDaysValues }[] = [
		{ Text: WorkingDays.Mon, Value: WorkingDaysValues.MonValue },
		{ Text: WorkingDays.Tue, Value: WorkingDaysValues.TueValue },
		{ Text: WorkingDays.Wed, Value: WorkingDaysValues.WedValue },
		{ Text: WorkingDays.Thu, Value: WorkingDaysValues.ThuValue },
		{ Text: WorkingDays.Fri, Value: WorkingDaysValues.FriValue },
		{ Text: WorkingDays.Sat, Value: WorkingDaysValues.SatValue },
		{ Text: WorkingDays.Sun, Value: WorkingDaysValues.SunValue }
	];

	// eslint-disable-next-line max-lines-per-function, max-params
	constructor(
		private fb: FormBuilder,
		private route: Router,
		private customValidators: CustomValidators,
		private shiftServc: ShiftGatewayService,
		private activatedRoute: ActivatedRoute,
		private eventLog: EventLogService,
		private datePipe: DatePipe,
		private sharedVariablesService: SharedVariablesService,
		private router: Router,
		private toasterServc: ToasterService,
		private cd: ChangeDetectorRef
	) {
		this.initializeForm();
	}

	ngOnInit(): void {
		this.getSectorList();
		if (this.route.url == this.navigationPaths.addEdit) {
			this.isEditMode = false;
		} else {
			this.isEditMode = true;
			this.loadData();
		}
	}

	initializeForm() {
		this.addEditShiftForm = this.fb.group({
			sectorId: [
				null,
				[this.customValidators.RequiredValidator('PleaseSelectSector')]
			],
			shiftName: [
				null,
				[
					this.customValidators.RequiredValidator('PleaseEnterShiftName'),
					this.customValidators.MaxLengthValidator(magicNumber.hundred)
				]
			],
			shiftNameEdit: [],
			isLocationSpecific: [],
			locationId: [null],
			ShiftDifferentialMethod: [magicNumber.twentyFour],
			reportingDayType: [
				'Out',
				[this.customValidators.RequiredValidator('PleaseSelectPunchReportingDay ')]
			],
			startTime: [
				null,
				[this.customValidators.RequiredValidator('PleaseEnterStartTime')]
			],
			endTime: [
				null,
				[
					this.customValidators.RequiredValidator('PleaseEnterEndTime'),
					this.validateEndTime() as ValidatorFn
				]
			],
			clpWorkingDays: [null],
			adderOrMultiplierValue: [
				null,
				[this.customValidators.RequiredValidator('PleaseEnterShiftDifferentialValue')]
			]
		});
	}

	private getSectorList() {
		this.shiftServc.getSectorDropDownList().pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.sectorData = res.Data;
				}
			}
		});
	}

	courrencyonSector(data: CurrencyOnSectorData[]) {
		this.currencycode = data[magicNumber.zero].CurrencyCode;
	}
	isLocationSwitch(event: boolean) {
		if (event && this.addEditShiftForm.get('isLocationSpecific')?.value) {
			this.addEditShiftForm.controls['locationId'].addValidators(this.customValidators.RequiredValidator('PleaseSelectLocation'));
			this.addEditShiftForm.controls['locationId'].updateValueAndValidity();
		} else {
			this.addEditShiftForm.controls['locationId'].patchValue(null);
			this.addEditShiftForm.controls['locationId'].clearValidators();
			this.addEditShiftForm.controls['locationId'].markAsUntouched();
		}
		this.addEditShiftForm.controls['locationId'].updateValueAndValidity();
		this.cd.detectChanges();
		if(this.location.length == Number(magicNumber.one)){
			this.addEditShiftForm.controls['locationId'].setValue(this.location[magicNumber.zero].Value);
			this.getLocationValue(this.location[magicNumber.zero]);

			this.cd.detectChanges();
		}

		if(!event){
			this.enableXrmTimeClock = this.XRMTimeClockRequired;
			this.cd.detectChanges();
		}
	}

	// eslint-disable-next-line max-lines-per-function
	onSectorChange(val: OnSectorChangeDropDown | null) {
		this.location = [];
		this.addEditShiftForm.patchValue({ locationId: null });
		this.addEditShiftForm.controls['isLocationSpecific'].setValue(false);
		if (val?.Value) {
			this.shiftServc.getDropdownDataBySectorId(val.Value).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: RootObject) => {
				if (res.ddlLocation.Succeeded) {
					this.location = res.ddlLocation.Data;
					this.addEditShiftForm.controls['locationId'].clearValidators();
					this.addEditShiftForm.controls['locationId'].updateValueAndValidity();
				}
				if (res.ddlsectconfig.Succeeded) {
					const sectorConfig = res.ddlsectconfig.Data,
						xrmTimeClockRequired = sectorConfig.IsXrmTimeClockRequired;
					if(!this.addEditShiftForm.get('isLocationSpecific')?.value){
						this.enableXrmTimeClock = xrmTimeClockRequired;
						this.XRMTimeClockRequired = xrmTimeClockRequired;
					}

					this.shiftDifferentialMethod = sectorConfig.ShiftdifferentialMethod;
					this.addEditShiftForm.patchValue({ShiftDifferentialMethod: sectorConfig.ShiftdifferentialMethod});
					this.countryVal = sectorConfig.CountryId;
					this.courrencyonSector(res.ddlCountrybysect.Data);
					if (this.shiftDifferentialMethod === Number(magicNumber.twentyFive)) {
						this.multiplierOrAdder = 'Multiplier';
						this.shiftConfigField = true;
						this.cd.markForCheck();
						this.addEditShiftForm.patchValue({ adderOrMultiplierValue: magicNumber.one });
						this.addEditShiftForm.controls['adderOrMultiplierValue'].setValidators([
							this.greaterThanZero(),
							this.customValidators.RangeValidator(
								magicNumber.one,
								magicNumber.tipleNineWithFourDecPlaces, 'ShiftDiffValueMultiplier'
							),
							this.customValidators.RequiredValidator('PleaseEnterShiftDifferentialValue')
						] as ValidatorFn[]);
					} else if (this.shiftDifferentialMethod === Number(magicNumber.twentyFour)) {
						this.multiplierOrAdder = 'Adder';
						this.shiftConfigField = true;
						this.addEditShiftForm.patchValue({ adderOrMultiplierValue: magicNumber.zero });
						this.addEditShiftForm.controls['adderOrMultiplierValue'].setValidators([
							this.customValidators.RequiredValidator('PleaseEnterShiftDifferentialValue'),
							this.customValidators.RangeValidator(
								magicNumber.zero,
								magicNumber.tripleNineWithThreeDecPlaces, 'ShiftDiffValueAdder'
							)
						] as ValidatorFn[]);
					} else {
						this.nullOnSectorChange();
					}

					this.addEditShiftForm.controls['adderOrMultiplierValue'].updateValueAndValidity();
				}
				this.cd.detectChanges();
			});
		}
		else {
			this.sectorChangeInitialVal();
		}
		this.cd.detectChanges();
	}

	nullOnSectorChange() {
		this.multiplierOrAdder = null;
		this.shiftConfigField = false;
	}

	sectorChangeInitialVal() {
		this.location = [];
		this.shiftDifferentialMethod = null;
		this.multiplierOrAdder = null;
		this.shiftConfigField = false;
		this.enableXrmTimeClock = false;
		this.addEditShiftForm.controls['isLocationSpecific'].setValue(false);
	}

	greaterThanZero(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (value !== null && value <= magicNumber.zero) {
				return {
					error: true,
					message: 'ValueGreaterThanZeroShift'
				};
			}
			return null;
		};
	}

	shiftDifferentialChange(e: number){
		this.shiftDifferentialMethod = e;
		this.addEditShiftForm.controls['adderOrMultiplierValue'].patchValue(magicNumber.zero);
		this.addEditShiftForm.controls['adderOrMultiplierValue'].markAllAsTouched();
		if(e == Number(magicNumber.twentyFour)){
			this.multiplierOrAdder = 'Adder';
		}
		else{
			this.multiplierOrAdder = 'Multiplier';
		}
	}

	public handleDaySelectionChange(dayInfo: IDayInfo[]) {
		this.selectedDays = dayInfo.reduce<Record<string, boolean>>((acc, curr) => {
			acc[curr.day.toLowerCase()] = curr.isSelected;
			return acc;
		}, {});

		this.addEditShiftForm.markAsDirty();
	}

	private validateDay(): boolean {
		const jobIntervalType = this.selectedDays;

		if (jobIntervalType !== null) {
			this.weekdayPicker.showValidationErrors();
			return this.weekdayPicker.isDaySelectionValid;
		}

		return true;
	}

	public submitForm() {
		this.addEditShiftForm.markAllAsTouched();
		if (this.validateDay() && this.addEditShiftForm.valid) {
			this.save();
		}
	}
	public loadData() {
		this.activatedRoute.params.pipe(
			takeUntil(this.ngUnsubscribe$),
			switchMap((param) => {
				if (param['id']) {
					this.isEditMode = true;
					this.ukey = param["id"];
					return this.shiftServc.getShiftById(param["id"]);
				}
				return of(null);
			})
		).subscribe((res: ApiResponse | null) => {
			if (res?.Succeeded) {
				this.dataShift = res.Data;
				this.getById();
			}
		});
		this.getSectorList();
	}

	public getById() {
		this.isEditMode = true;
		this.shiftServc.shiftDataSubject.next({
			"shiftID": this.dataShift.ShiftId,
			"Disabled": this.dataShift.Disabled,
			"shiftCode": this.dataShift.ShiftCode
		});
		if (this.dataShift) {
			const daysWithShift = this.daysOfWeek().filter((day) =>
				this.dataShift[day.Text.slice(magicNumber.zero, magicNumber.three)] === true);
			this.dataShift.ClpWorkingDays = daysWithShift;
		}
		switch (this.dataShift.ReportingDayType) {
			case 'Out':
				this.shiftReportingDayType = PunchReportDaySetting.PunchOut;
				this.enableXrmTimeClock = true;
				break;
			case 'In':
				this.shiftReportingDayType = PunchReportDaySetting.PunchIn;
				this.enableXrmTimeClock = true;
				break;
			default:
		}
		this.subFunctionShiftId();
		this.patchvalue();
	}

	daysOfWeek() {
		const daysOfWeek = [
			{ Text: WorkingDays.Mon, Value: WorkingDaysValues.MonValue },
			{ Text: WorkingDays.Tue, Value: WorkingDaysValues.TueValue },
			{ Text: WorkingDays.Wed, Value: WorkingDaysValues.WedValue },
			{ Text: WorkingDays.Thu, Value: WorkingDaysValues.ThuValue },
			{ Text: WorkingDays.Fri, Value: WorkingDaysValues.FriValue },
			{ Text: WorkingDays.Sat, Value: WorkingDaysValues.SatValue },
			{ Text: WorkingDays.Sun, Value: WorkingDaysValues.SunValue }
		];
		return daysOfWeek;
	}

	patchvalue() {
		this.patchDays();
		this.addEditShiftForm.patchValue({
			sectorId: { Value: this.dataShift.SectorId.toString() },
			shiftNameEdit: this.dataShift.ShiftName,
			locationId: this.dataShift.LocationName,
			startTime: new Date(`02/24/2015 ${this.dataShift.StartTime}`),
			endTime: new Date(`02/24/2015 ${this.dataShift.EndTime}`),
			clpWorkingDays: this.dataShift.ClpWorkingDays,
			adderOrMultiplierValue: this.dataShift.AdderOrMultiplierValue,
			isLocationSpecific: this.dataShift.IsLocationSpecific,
			shiftName: this.dataShift.ShiftName,
			ShiftDifferentialMethod: this.dataShift.ShiftDifferentialMethodId
		});
	}

	patchDays(){
		const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		 daysData = validDays.map((day) =>
				({
					day,
					isSelected: Boolean(this.dataShift[day])
				}));
		this.daysInfo = daysData;
		this.selectedDays = daysData.reduce((acc: any, ele) => {
			acc[ele.day] = ele.isSelected;
			return acc;
		}, {});
	}

	// eslint-disable-next-line max-lines-per-function
	subFunctionShiftId() {
		this.shiftServc.getSectorById(this.dataShift.SectorId).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res: ApiResponse) => {
				if (res.Succeeded) {
					this.countryVal = res.Data.CountryId;
					this.shiftDifferentialMethod = res.Data.ShiftdifferentialMethod;
					const xrmTimeClockRequired = res.Data.IsXrmTimeClockRequired;
					if (this.dataShift.ShiftDifferential.toLowerCase() === 'multiplier') {
						this.multiplierOrAdder = 'Multiplier';
						this.addEditShiftForm.controls[
							'adderOrMultiplierValue'
						].addValidators([
							this.greaterThanZero(),
							this.customValidators.RequiredValidator('PleaseEnterShiftDifferentialValue'),
							this.customValidators.RangeValidator(
								magicNumber.one,
								magicNumber.tipleNineWithFourDecPlaces, 'ShiftDiffValueMultiplier'
							)
						] as ValidatorFn[]);
						this.addEditShiftForm.controls[
							'adderOrMultiplierValue'
						].updateValueAndValidity();
					} else if (this.dataShift.ShiftDifferential.toLowerCase() === 'adder') {
						this.multiplierOrAdder = 'Adder';
						this.addEditShiftForm.controls[
							'adderOrMultiplierValue'
						].clearValidators();
						this.addEditShiftForm.controls[
							'adderOrMultiplierValue'
						].addValidators([
							this.customValidators.RequiredValidator('PleaseEnterShiftDifferentialValue'),
							this.customValidators.RangeValidator(
								magicNumber.zero,
								magicNumber.tripleNineWithThreeDecPlaces, 'ShiftDiffValueAdder'
							)
						] as ValidatorFn[]);
						this.addEditShiftForm.controls[
							'adderOrMultiplierValue'
						].updateValueAndValidity();
					}
					if (this.dataShift.ShiftDifferential) {
						this.shiftConfigField = true;
					}
				}
				this.cd.markForCheck();
			}
		});
	}

	private save() {
		if (this.isEditMode) {
			this.saveEditMode();
		}
		else {
			this.saveAddMode();
		}
	}

	saveAddMode() {
		const sectorIdValue: SectorIdValue = this.addEditShiftForm.controls['sectorId'].value,
			clpWorkingDaysArray = this.selectedDays,
			result = Object.entries(clpWorkingDaysArray)
				.filter(([key, value]) =>
					value)
				.map(([key]) =>
					key.charAt(magicNumber.zero).toUpperCase() + key.slice(magicNumber.one))
				.join(', ');
		let locationId: number | null,
			addShiftData: AddShiftData;
		if (this.addEditShiftForm.get('isLocationSpecific')?.value) {
			locationId = parseInt(this.addEditShiftForm.controls['locationId'].value?.Value)
				? parseInt(this.addEditShiftForm.controls['locationId'].value?.Value)
				: parseInt(this.location[magicNumber.zero].Value);
		} else {
			locationId = null;
		}
		// eslint-disable-next-line prefer-const
		addShiftData = {
			sectorId: parseInt(sectorIdValue.Value),
			locationId: locationId,
			isLocationSpecific: this.addEditShiftForm.controls['isLocationSpecific'].value || false,
			shiftName: this.addEditShiftForm.controls['shiftName'].value.trim(),
			reportingDayType: this.addEditShiftForm.controls['reportingDayType'].value,
			startTime: this.datePipe.transform(this.addEditShiftForm.controls['startTime'].value, 'hh:mm:ss a'),
			endTime: this.datePipe.transform(this.addEditShiftForm.controls['endTime'].value, 'hh:mm:ss a'),
			ShiftDifferential: this.multiplierOrAdder ?? '',
			adderOrMultiplierValue: this.multiplierOrAdder == 'Multiplier'
				? this.addEditShiftForm.controls['adderOrMultiplierValue'].value.toFixed(magicNumber.four)
				: this.addEditShiftForm.controls['adderOrMultiplierValue'].value.toFixed(magicNumber.three),
			currencycode: this.currencycode,
			clpWorkingDays: result,
			ShiftDifferentialMethodId: this.addEditShiftForm.controls['ShiftDifferentialMethod'].value,
			...this.selectedDays
		};

		this.addDispatch(addShiftData);
	}

	addDispatch(addShiftData: AddDispatchShiftData) {
		this.shiftServc.addShift(addShiftData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<AddDispatchApiData>) => {
				if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.conflictData = true;
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'ShiftAlreadyExists');
				} else if (data.StatusCode == Number(HttpStatusCode.Ok)) {
					this.conflictData = false;
					this.toasterServc.resetToaster();
					this.router.navigate([this.navigationPaths.list]);
					setTimeout(() => {
						this.toasterServc.showToaster(ToastOptions.Success, 'ShiftSaveSuccessfully');
					});
				}
				else if (data.StatusCode == Number(HttpStatusCode.Forbidden)) {
					this.conflictData = true;
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(ToastOptions.Error, 'ShiftStartTimeEndTimeCanNotEqual');
				} else {
					this.conflictData = true;
					this.toasterServc.resetToaster();
					this.toasterServc.showToaster(
						ToastOptions.Error,
						data.Message
					);
				}
			}
		});
	}

	saveEditMode() {
		const clpWorkingDaysArray = this.selectedDays,
			result = Object.entries(clpWorkingDaysArray)
				.filter(([key, value]) =>
					value)
				.map(([key]) =>
					key.charAt(magicNumber.zero).toUpperCase() + key.slice(magicNumber.one))
				.join(', '),
			shiftData: ShiftDataSaveEditMode = {
				uKey: this.dataShift.UKey,
				sectorId: this.dataShift.SectorId,
				locationId: this.dataShift.LocationId,
				isLocationSpecific: this.dataShift.IsLocationSpecific,
				shiftName: this.addEditShiftForm.controls['shiftName'].value.trim(),
				reportingDayType: this.dataShift.ReportingDayType,
				startTime: this.datePipe.transform(
					this.addEditShiftForm.controls['startTime'].value,
					'hh:mm:ss a'
				),
				clpWorkingDays: result,
				endTime: this.datePipe.transform(
					this.addEditShiftForm.controls['endTime'].value,
					'hh:mm:ss a'
				),
				...this.selectedDays,
				ShiftDifferential: this.dataShift.ShiftDifferential,
				adderOrMultiplierValue: this.multiplierOrAdder == 'Multiplier' ?
					this.addEditShiftForm.controls['adderOrMultiplierValue'].value.toFixed(magicNumber.four) :
					this.addEditShiftForm.controls['adderOrMultiplierValue'].value.toFixed(magicNumber.three),
				reasonForChange: this.reasonForChange,
				CurrencyCode: this.dataShift.CurrencyCode
			};

		this.editDispatch(shiftData);
	}

	private validateEndTime(): ValidationErrors | null {
		return (): Record<string, boolean | string> | null => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (this.addEditShiftForm == null) {
				return null;
			}
			const startTime = this.datePipe.transform(
					this.addEditShiftForm.controls['startTime'].value,
					'hh:mm:ss a'
				),
				endTime = this.datePipe.transform(
					this.addEditShiftForm.controls['endTime'].value,
					'hh:mm:ss a'
				);

			if (startTime === endTime && startTime) {
				return { error: true, message: 'ShiftStartTimeEndTimeCanNotEqual' };
			}
			return null;
		};
	}

	editDispatch(shiftData: ShiftDataEditDispatch) {
		this.shiftServc.updateShift(shiftData).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (data: GenericResponseBase<editDispatchApiData>) => {
				this.toasterServc.resetToaster();
				if (data.StatusCode == Number(HttpStatusCode.Ok)) {
					this.toasterServc.showToaster(ToastOptions.Success, 'ShiftSaveSuccessfully');
					this.statusError = false;
					this.addEditShiftForm.markAsPristine();
					this.cd.markForCheck();
					this.recordName = true;
					this.statusCardREcord = data.Data?.ShiftName ?? '';
				} else if (data.StatusCode == Number(HttpStatusCode.Conflict)) {
					this.toasterServc.showToaster(ToastOptions.Error, 'ShiftAlreadyExists');
					this.recordName = false;
				} else if (data.StatusCode == Number(HttpStatusCode.Forbidden)) {
					this.toasterServc.showToaster(ToastOptions.Error, 'ShiftStartTimeEndTimeCanNotEqual');
					this.recordName = false;
				} else {
					this.toasterServc.showToaster(ToastOptions.Error, data.Message);
					this.recordName = false;
					this.statusError = true;
				}
				this.eventLog.isUpdated.next(true);
			}
		});
	}

	public validateStartTime(event: string) {
		if (event) {
			const startTime = this.datePipe.transform(
					this.addEditShiftForm.controls['startTime'].value,
					'hh:mm:ss a'
				),
				endTime = this.datePipe.transform(
					this.addEditShiftForm.controls['endTime'].value,
					'hh:mm:ss a'
				);
			if (this.isStartTimeEqualToEndTime(startTime, endTime)) {
				this.markEndTimeAsTouched();
			} else {
				this.resetEndTimeControls();
			}
		}
	}

	private isStartTimeEqualToEndTime(startTime: string | null, endTime: string | null): boolean {
		return startTime === endTime && startTime !== null;
	}

	private markEndTimeAsTouched(): void {
		this.addEditShiftForm.controls['endTime'].markAsTouched();
		this.addEditShiftForm.controls['endTime'].updateValueAndValidity();
	}

	private resetEndTimeControls(): void {
		this.addEditShiftForm.controls['endTime'].markAsPristine();
		this.addEditShiftForm.controls['endTime'].markAsUntouched();
		this.addEditShiftForm.controls['endTime'].updateValueAndValidity();
	}

	public navigate() {
		this.route.navigate([NavigationPaths.list]);
	}
	public getLocationValue(event:IDropdown){
		this.shiftServc.getLocationBasedTimeClock(Number(event.Value)).subscribe((res:ApiResponse) => {
		  const data = res.Data;
		  if(data.AlternateTimeClockConfigurations){
				if(data.EnableXRMTimeClock){
					this.enableXrmTimeClock = true;
				}
				else{
					this.enableXrmTimeClock = false;
				}
				this.cd.markForCheck();
		  }
			else{
				this.enableXrmTimeClock = this.XRMTimeClockRequired;
				this.cd.detectChanges();
			}
		});
		this.cd.detectChanges();
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		if (this.isEditMode || this.conflictData) {
			this.toasterServc.resetToaster();
		}
		this.conflictData = false;
	}
}

