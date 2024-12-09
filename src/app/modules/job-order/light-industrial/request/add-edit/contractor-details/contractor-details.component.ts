import {
	Component, Input, EventEmitter, Output, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges,
	ViewChild, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { ContractorDetailsService } from '../../../services/contractor-details.service';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { combineLatest, startWith, Subject, takeUntil } from 'rxjs';
import { TooltipDirective } from "@progress/kendo-angular-tooltip";
import { TenureLimitTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import {
	IChangeFieldsValues, IDatePlaceholderFormat, IPositionGridData, IPositionGridDataForm, IRequestPositionDetail,
	RequestPositionDetailGetAllDto, ShiftDetails
} from '../../../interface/li-request.interface';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';

@Component({
	selector: 'app-contractor-details',
	templateUrl: './contractor-details.component.html',
	styleUrls: ['./contractor-details.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractorDetailsComponent implements OnInit, OnChanges, OnDestroy {
	// show tooltip
	@ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
	public showTooltip(e: MouseEvent): void {
		const element = e.target as HTMLElement;
		if (
			(element.nodeName === "TD" || element.className === "k-column-title") &&
			element.offsetWidth < element.scrollWidth
		) {
			this.tooltipDir.toggle(element);
		} else {
			this.tooltipDir.hide();
		}
	}
	// end show tooltip

	public form: FormGroup;
	public gridDataArray: FormGroup[] = [];

	@Input() isEditMode: boolean = false;
	@Input() isViewMode: boolean = false;
	@Input() parentData: RequestPositionDetailGetAllDto[] = [];
	@Input() lastTbdSequenceNo: number = magicNumber.zero;
	@Input() startDate: Date | string | null = null;
	@Input() startDateNoLaterThan: Date | string | null = null;
	@Input() tenurePolicyApplicable: boolean = false;
	@Input() requsitionTenure: number = magicNumber.zero;
	@Input() tenureLimitType: number | null = null;
	@Input() wageRate: number | null = magicNumber.zero;
	@Input() shiftDetails: ShiftDetails | null = null;
	@Input() weekDaysArray: boolean[] = [];
	@Input() benefitAdderList: IBenefitData[] = [];
	@Input() isStaffUser: boolean = false;

	@Output() totalContractorsEmitter = new EventEmitter<number>();
	@Output() totalEstimatedCostEmitter = new EventEmitter<number>();
	@Output() onDataPicked = new EventEmitter<IRequestPositionDetail[]>();
	@Output() formData = new EventEmitter<FormGroup>();
	@Output() gridChange = new EventEmitter<void>();

	public dateFormat: string;
	public placeholderFormat: IDatePlaceholderFormat;

	public baseWageRateLabel: string;
	public actualShiftWageRateLabel: string;
	public mspStBillRate: string;
	private parentLastTbdSequenceNo: number;
	public vendorStBillRate: string;

	private wageRate$ = new Subject<number>();
	private shiftDetails$ = new Subject<ShiftDetails | null>();
	private parentData$ = new Subject<RequestPositionDetailGetAllDto[] | null>();
	private benefitAdderList$ = new Subject<IBenefitData[] | null>();
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		public localizationService: LocalizationService,
		private cdr: ChangeDetectorRef,
		private contractorService: ContractorDetailsService,
		private toasterService: ToasterService
	) {
		this.initializeLocalization();
		this.form = this.formBuilder.group({
			gridData: this.formBuilder.array([])
		});

		this.form.get('gridData')!.valueChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(() => {
			this.formData.emit(this.form);
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		const relevantChanges = ['startDate', 'startDateNoLaterThan', 'wageRate', 'shiftDetails', 'weekDaysArray', 'requsitionTenure', 'lastTbdSequenceNo', 'isViewMode', 'benefitAdderList', 'parentData'];

		relevantChanges.forEach((change: string) => {
			if (changes[change]?.currentValue) {
				this.handleChange(change, changes[change].currentValue);
			}
		});
	}

	ngOnInit(): void {
		this.dateFormat = this.localizationService.GetCulture(CultureFormat.DateFormat);
		this.placeholderFormat = this.localizationService.GetCulture(CultureFormat.DatePlaceholder);
		if (!this.isEditMode) {
			this.addDefaultGridRow();
		}
		combineLatest([this.wageRate$, this.shiftDetails$, this.parentData$, this.benefitAdderList$])
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe(([wageRate, shiftDetails, parentData, benefitAdderList]) => {
				if (wageRate && shiftDetails && parentData && benefitAdderList) {
					this.patchFormValuesFromParent(parentData);
				}
			});
	}

	ngDoCheck(): void {
		if ((this.form?.touched && !this.form?.valid)) {
			this.cdr.markForCheck();
		}
	}

	private initializeLocalization(): void {
		const countryId = this.localizationService.GetCulture(CultureFormat.CountryId),
			currency = this.localizationService.GetCulture(CultureFormat.CurrencyCode, countryId),
			localizeCurrency: DynamicParam[] = [{ Value: currency, IsLocalizeKey: false }];
		setTimeout(() => {
			this.baseWageRateLabel = this.localizationService.GetLocalizeMessage('BaseWageRate', localizeCurrency);
			this.actualShiftWageRateLabel = this.localizationService.GetLocalizeMessage('ActualShiftWageRate', localizeCurrency);
			this.mspStBillRate = this.localizationService.GetLocalizeMessage('MSPSTBillRate', localizeCurrency);
			this.vendorStBillRate = this.localizationService.GetLocalizeMessage('StaffingAgencySTBill', localizeCurrency);
		}, magicNumber.hundred);
	}

	private handleChange(propName: string, newValue: IChangeFieldsValues): void {
		switch (propName) {
			case 'startDate':
				this.handleStartDateChange(newValue as Date);
				break;
			case 'startDateNoLaterThan':
				this.handleStartDateNoLaterThanChange(newValue as Date);
				break;
			case 'wageRate':
				this.handleWageRateChange(newValue as number);
				break;
			case 'shiftDetails':
				this.handleShiftDetailsChange(newValue as ShiftDetails);
				break;
			case 'weekDaysArray':
				this.weekDaysArray = newValue as boolean[];
				break;
			case 'requsitionTenure':
				this.handleRequisitionTenureChange(newValue as number);
				break;
			case 'lastTbdSequenceNo':
				this.handleLastTbdSequenceNoChange(newValue as number);
				break;
			case 'isViewMode':
				this.isViewMode = newValue as boolean;
				break;
			case 'benefitAdderList':
				this.handleBenefitAdderListChange(newValue as IBenefitData[]);
				break;
			case 'parentData':
				this.handleParentDataChange(newValue as RequestPositionDetailGetAllDto[]);
				break;
		}
	}

	private handleStartDateChange(newStartDate: Date | string | null): void {
		if (newStartDate) {
			this.startDate = newStartDate;
			if (!this.isEditMode) {
				this.updateStartDateControls(newStartDate as Date);
			}
		}
	}

	private handleStartDateNoLaterThanChange(newStartDateNoLaterThan: Date | string | null): void {
		this.startDateNoLaterThan = newStartDateNoLaterThan;
		this.updateStartDateControlValidity();
	}

	private handleWageRateChange(newWageRate: number): void {
		this.wageRate$.next(newWageRate);
		this.wageRate = newWageRate;
		this.updateBaseWageControls(newWageRate);
	}

	private handleShiftDetailsChange(newShiftDetails: ShiftDetails): void {
		this.shiftDetails$.next(newShiftDetails);
		this.shiftDetails = newShiftDetails;
		this.updateShiftDetails(newShiftDetails);
	}

	private handleRequisitionTenureChange(requsitionTenure: number): void {
		this.requsitionTenure = requsitionTenure;
	}

	private handleLastTbdSequenceNoChange(lastTbdSequenceNo: number): void {
		this.parentLastTbdSequenceNo = lastTbdSequenceNo;
		this.lastTbdSequenceNo = lastTbdSequenceNo;
	}

	private handleBenefitAdderListChange(benefitAdderList: IBenefitData[]): void {
		this.benefitAdderList$.next(benefitAdderList);
		this.benefitAdderList = benefitAdderList;
	}

	private handleParentDataChange(parentData: RequestPositionDetailGetAllDto[]): void {
		this.parentData$.next(parentData);
		if (this.isViewMode) {
			this.patchFormValuesFromParent(this.parentData);
		}
	}

	private patchFormValuesFromParent(parentData: RequestPositionDetailGetAllDto[]): void {
		if (parentData.length) {
			const gridDataArray = parentData.map((item: RequestPositionDetailGetAllDto) => {
					return this.formBuilder.group({
						contractorsControl: [magicNumber.one],
						positionId: [item.PositionId],
						clpId: [item.ClpId],
						candidatePoolId: [item.CandidatePoolCode],
						contractorName: [item.ContractorName],
						stafingAgencyName: [item.StafingAgencyName],
						submittedMarkup: [item.SubmittedMarkup],
						mspStBillRate: [item.MspStBillRate],
						startDateControl: [new Date(item.TargetStartDate), [Validators.required, this.startDateControlValidator()]],
						endDateControl: [new Date(item.TargetEndDate), [Validators.required, this.endDateControlValidator()]],
						baseWage: [item.BaseWageRate],
						actualWage: [item.ActualShiftWageRate],
						netEstimatedCost: [magicNumber.zero],
						shiftMultiplier: [item.ShiftMultiplier],
						StaffingAgencyStBillRate: [item.StaffingAgencyStBillRate]
					});
				}),
				formArray = this.form.get('gridData') as FormArray;
			formArray.clear();
			this.gridDataArray = gridDataArray;
			gridDataArray.forEach((row: FormGroup) => {
				formArray.push(row);
				this.subscribeToChangeInFormControl(row);
				this.updateRowData(row);
			});
			this.lastTbdSequenceNo = this.parentLastTbdSequenceNo;
		}
	}

	private updateStartDateControls(newStartDate: Date | string | null): void {
		if (newStartDate !== null && this.gridDataArray.length > Number(magicNumber.zero)) {
			this.gridDataArray.forEach((row: FormGroup) => {
				const startDateControl = row.get('startDateControl');
				if (startDateControl && !startDateControl.value) {
					startDateControl.setValue(newStartDate as Date);
				}
				this.validateStartDateControlForm(row);
			});
		}
	}

	private updateStartDateControlValidity() {
		const gridDataArray = this.form.get('gridData') as FormArray<FormGroup>;
		gridDataArray.controls.forEach((row: FormGroup) => {
			const startDateControl = row.get('startDateControl');
			if (startDateControl) {
				startDateControl.updateValueAndValidity();
			}
		});
	}

	private updateBaseWageControls(newWageRate: number) {
		if (newWageRate) {
			this.gridDataArray.forEach((row: FormGroup) => {
				this.updateRowData(row);
			});
		}
	}

	private updateShiftDetails(newShiftDetails: ShiftDetails | null) {
		if (newShiftDetails) {
			this.gridDataArray.forEach((row: FormGroup) => {
				this.updateRowData(row);
			});
		}
	}

	private createGridRow(): FormGroup {
		const defaultContractorsControlValue = this.isEditMode
				? magicNumber.one
				: null,
			defaultStartDateControlValue = this.isEditMode
				? new Date()
				: this.startDate;
		return this.formBuilder.group({
			contractorsControl: [
				defaultContractorsControlValue,
				[Validators.required, Validators.min(magicNumber.one), this.contractorsControlValidator()]
			],
			startDateControl: [defaultStartDateControlValue, [Validators.required, this.startDateControlValidator()]],
			endDateControl: [null, [Validators.required, this.endDateControlValidator()]],
			baseWage: [magicNumber.zero],
			actualWage: [magicNumber.zero],
			netEstimatedCost: [magicNumber.zero],
			positionId: [magicNumber.zero],
			clpId: [null],
			contractorName: [null],
			stafingAgencyName: [null],
			submittedMarkup: [null],
			mspStBillRate: [null],
			shiftMultiplier: [null]
		});
	}

	private contractorsControlValidator(): ValidatorFn {
		return (control: AbstractControl): Record<string, boolean | string> | null => {
			const value = control.value;
			if (value === null) {
				return { errors: true, message: 'ContractorEmptyValidation' };
			}
			if (value === Number(magicNumber.zero)) {
				return { errors: true, message: 'ContractorValidation' };
			}
			if (value % Number(magicNumber.one) !== Number(magicNumber.zero) || isNaN(value)) {
				return { invalid: true, message: 'NoOfContractorValidation' };
			}
			return null;
		};
	}

	private startDateControlValidator(): ValidatorFn {
		return (control: AbstractControl): Record<string, boolean | string> | null => {
			const value = control.value;
			if (value === null) {
				return { errors: true, message: 'StartDateEmptyValidation' };
			}
			return null;
		};
	}

	private endDateControlValidator(): ValidatorFn {
		return (control: AbstractControl): Record<string, boolean | string> | null => {
			const endDate = control.value;
			if (endDate === null) {
				return { errors: true, message: 'EndDateemptyValidation' };
			}
			return null;
		};
	}

	private addDefaultGridRow() {
		const newRow = this.createGridRow();
		this.gridDataArray.push(newRow);
		(this.form.get('gridData') as FormArray).push(newRow);
		this.subscribeToChangeInFormControl(newRow);
	}

	public addGridRow() {
		if (this.isGridLimitReached()) {
			this.toasterService.showToaster(ToastOptions.Error, 'ContractorLimitValidation');
			return;
		}
		const lastRow = this.getLastRow(),
			contractorsControl = this.getContractorsControl(lastRow);
		if (this.isContractorControlValid(contractorsControl)) {
			const newRow = this.createAndConfigureNewRow();
			this.addRowToGrid(newRow);
			this.gridChange.emit();

			if (this.isEditMode) {
				this.toasterService.showToaster(ToastOptions.Warning, 'LiRequestContractorEditMessage');
			}
		} else {
			contractorsControl?.markAsTouched();
		}
	}

	private isGridLimitReached(): boolean {
		const limit = Number(magicNumber.nineHundrednintyNine);
		return this.gridDataArray.length >= limit;
	}

	private getLastRow(): AbstractControl | null {
		return this.gridDataArray.at(this.gridDataArray.length - magicNumber.one) ?? null;
	}

	private getContractorsControl(lastRow: AbstractControl | null): AbstractControl | null {
		return lastRow
			? lastRow.get('contractorsControl')
			: null;
	}

	private isContractorControlValid(contractorsControl: AbstractControl | null): boolean {
		return contractorsControl?.value != null && contractorsControl.value > magicNumber.zero;
	}

	private createAndConfigureNewRow(): FormGroup {
		const newRow = this.createGridRow();
		if (this.isEditMode) {
			this.configureNewRowForEditMode(newRow);
		}
		return newRow;
	}

	private configureNewRowForEditMode(newRow: FormGroup): void {
		this.lastTbdSequenceNo++;
		const newSerial = this.lastTbdSequenceNo.toString().padStart(magicNumber.three, '0');
		newRow.get('contractorName')?.setValue(`TBD${newSerial}`);
	}

	private addRowToGrid(newRow: FormGroup): void {
		this.gridDataArray.push(newRow);
		(this.form.get('gridData') as FormArray).push(newRow);
		this.subscribeToChangeInFormControl(newRow);
		this.updateRowData(newRow);
	}

	public deleteGridRow(index: number) {
		if (this.gridDataArray.length > Number(magicNumber.one)) {
			this.gridDataArray.splice(index, Number(magicNumber.one));
			(this.form.get('gridData') as FormArray).removeAt(index);
		}
		this.emitTotalContractors();
		this.emitTotalEstimatedCost();
		this.emitContractorData();
		this.gridChange.emit();
		if (this.isEditMode) {
			this.toasterService.showToaster(ToastOptions.Warning, 'LiRequestContractorEditMessage');
		}
	}

	public onEndDateChange(newEndDate: Date, dataItem: FormGroup) {
		this.calculateNetEstimatedCost(dataItem);
		this.emitTotalEstimatedCost();
		this.emitContractorData();
	}

	private subscribeToChangeInFormControl(row: FormGroup) {
		row.get('contractorsControl')?.valueChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(() =>
			this.updateRowData(row));

		row.get('startDateControl')?.valueChanges.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe(() => {
			if (row.get('endDateControl')?.value) {
				this.updateRowData(row);
			}
		});
	}

	/**
	 * @description This method is called whenever there is a change in any of the form controls in the grid row.
	 * This method performs the following tasks:
	 * 1. Updates the baseWage, actualWage, endDate, and netEstimatedCost controls in the grid row.
	 * 2. Calculates the total number of contractors and the total estimated cost for all the rows in the grid.
	 * 3. Emits the total number of contractors and the total estimated cost to the parent component.
	 * 4. Emits the form data to the parent component.
	 */
	private updateRowData(row: FormGroup) {
		const startDate = row.get('startDateControl')?.value;
		// update endDate get the value from startDate and requsitionTenure (days)
		this.updateEndDate(row, startDate);
		// update baseWage get the value from wageRate
		this.updateBaseWage(row);
		// update actualWage get the value from wageRate and shiftDetails (AdderOrMultiplierValue, ShiftDifferentialMethod)
		this.updateActualWage(row);
		// calculate netEstimatedCost
		this.calculateNetEstimatedCost(row);
		this.emitTotalContractors();
		this.emitTotalEstimatedCost();
		this.emitContractorData();
	}

	/**
	 * @description This method updates the baseWage control in the grid row with the value of the wageRate input property.
	 */
	private updateBaseWage(row: FormGroup) {
		if (this.wageRate != null) {
			const clpId = row.get('clpId')?.value,
				baseWageControl = row.get('baseWage');
			if (baseWageControl && clpId === null) {
				baseWageControl.setValue(this.wageRate);
			}
		}
	}

	/**
	 * 3. actualWage @param actualWageRate ::"Actual Shift Wage Rate
	 *  If Shift Adder : (1st Shift Wage Rate + Shift Adder)
	 *   or
	 *  If Shift Multiplier : (1st Shift Wage Rate * Shift Multiplier)"
	 * @param row -> update actualWage get the value from wageRate and shiftDetails (AdderOrMultiplierValue, ShiftDifferentialMethod)
	 * @description This method updates the actualWage control in the grid row with the value of the actualWageRate.
	 */
	private updateActualWage(row: FormGroup) {
		if (this.wageRate != null && this.shiftDetails) {
			const clpId = row.get('clpId')?.value,
				wageRate = row.get('baseWage')?.value,
				shiftMultiplier = row.get('shiftMultiplier')?.value,
				actualWageControl = row.get('actualWage'),
				// if clpId is null (non filled) then get the value from shift else get the value from ukey-shiftMultiplier
				shiftAdderOrMultiplierValue = clpId === null
					? this.shiftDetails.AdderOrMultiplierValue
					: shiftMultiplier;
			if (actualWageControl) {
				const actualWageRate = this.contractorService.calculateActualShiftWageRate(
					wageRate,
					shiftAdderOrMultiplierValue,
					this.shiftDetails.ShiftDifferentialMethod
				);
				actualWageControl.setValue(actualWageRate);
			}
		}
	}

	private updateEndDate(row: FormGroup, startDate: Date) {
		if (startDate) {
			const endDate = this.contractorService.addMonthsOrDays(startDate, this.requsitionTenure, this.tenureLimitType),
				endDateControl = row.get('endDateControl');
			if (endDateControl && !endDateControl.value) {
				endDateControl.setValue(endDate);
			}
		}
	}

	private calculateNetEstimatedCost(row: FormGroup) {
		const startDate = row.get('startDateControl')?.value,
			endDate = row.get('endDateControl')?.value,
			numberOfDaysWithSpecificWeeks = this.calculateNumberOfDaysWithSpecificWeeks(startDate, endDate),
			totalWorkingHoursOfDay = this.calculateTotalWorkingHoursOfDay(numberOfDaysWithSpecificWeeks),
			netBenefitAdders = this.calculateNetBenefitAdders(totalWorkingHoursOfDay),
			actualWage = row.get('actualWage')?.value,
			contractors = row.get('contractorsControl')?.value;

		/**
		 * 5. extimated cost @param netEstimatedCost :: "Net Estimated Cost
		 *   ((Total Working Hrs * Actual Shift Wage Rate) + Net Benefit Adder)"
		 * calculates the net estimated cost by multiplying the total working hours with the actual wage and adding the net benefit adders.
		 */
		if (totalWorkingHoursOfDay !== null && actualWage !== null && netBenefitAdders !== null) {
			const netEstimatedCostControl = row.get('netEstimatedCost'),
				estimatedCost = this.contractorService.calculateNetEstimatedCost(
					totalWorkingHoursOfDay,
					actualWage,
					netBenefitAdders
				);
			if (netEstimatedCostControl) {
				netEstimatedCostControl.setValue(contractors !== null && contractors > magicNumber.zero
					? contractors * estimatedCost
					: magicNumber.zero);
			}
		}
	}

	/**
	 * 1. working days @param numberOfDaysWithSpecificWeeks
	 * @description This method calculates the total number of working days between the start date and the end date.
	 */
	private calculateNumberOfDaysWithSpecificWeeks(startDate: Date, endDate: Date): number {
		if (startDate && endDate && this.weekDaysArray) {
			return this.contractorService.getNumberOfDaysWithSpecificWeeks(startDate, endDate, this.weekDaysArray);
		}
		return magicNumber.zero;
	}

	/**
	 * 2. total hours @param totalWorkingHoursOfDay
	 * @param totalDaysWithSpecificWeeks
	 * @description This method calculates the total working hours of a day by multiplying
	 *   the total number of days with the total hours between two times.
	 * @returns
	 */
	private calculateTotalWorkingHoursOfDay(totalDaysWithSpecificWeeks: number): number {
		if (this.shiftDetails) {
			const time1 = this.shiftDetails.StartTime,
				time2 = this.shiftDetails.EndTime,
				totalHoursBetweenTwoTimes = this.contractorService.calculateTotalHoursBetweenTimes(time1, time2);
			return this.contractorService.getTotalWorkingHours(totalDaysWithSpecificWeeks, totalHoursBetweenTwoTimes);
		}
		return magicNumber.zero;
	}

	/**
	 * 4. benefit Adder list @param netBenefitAdders
	 * Net Benefit Adder = [(Benefit Add1*Working Hrs) + (Benefit Add2*Working Hrs)]"
	 * @param totalWorkingHoursOfDay
	 * @param this.benefitAdderList
	 * @description This method calculates the net benefit adders by multiplying the total number of hours with an array of benefit adders.
	 * @returns
	 */
	private calculateNetBenefitAdders(totalWorkingHoursOfDay: number): number {
		if (totalWorkingHoursOfDay && this.benefitAdderList.length) {
			return this.contractorService.calculateNetBenefitAdders(totalWorkingHoursOfDay, this.benefitAdderList);
		}
		return magicNumber.zero;
	}

	private emitTotalContractors() {
		if (this.gridDataArray.length) {
			const totalContractors = this.getNumberOfContractorRequested();
			this.totalContractorsEmitter.emit(totalContractors);
		}
	}

	private emitTotalEstimatedCost() {
		if (this.gridDataArray.length) {
			const totalEstimatedCost = this.getTotalEstimatedCost();
			this.totalEstimatedCostEmitter.emit(totalEstimatedCost);
		}
	}

	private getNumberOfContractorRequested() {
		let numberOfContractorRequseted = magicNumber.zero;
		this.gridDataArray.forEach((row: FormGroup) => {
			const contractorsControl = row.get('contractorsControl');
			if (contractorsControl) {
				numberOfContractorRequseted += contractorsControl.value;
			}
		});
		return numberOfContractorRequseted;
	}

	private getTotalEstimatedCost() {
		let totalEstimatedCost = magicNumber.zero;
		this.gridDataArray.forEach((row: FormGroup) => {
			const netEstimatedCostControl = row.get('netEstimatedCost');
			if (netEstimatedCostControl) {
				totalEstimatedCost += netEstimatedCostControl.value;
			}
		});
		return totalEstimatedCost;
	}

	public resetGrid() {
		this.gridDataArray = [];
		(this.form.get('gridData') as FormArray).clear();
		this.addDefaultGridRow();
		this.emitTotalContractors();
		this.emitTotalEstimatedCost();
		this.emitContractorData();
	}

	public onParentFieldChange() {
		this.resetGrid();
		this.cdr.detectChanges();
	}

	public emitContractorData() {
		if (this.form.valid) {
			const formData = this.form.value;
			let manipulatedData: IRequestPositionDetail[] = [];
			if (this.hasGridData(formData)) {
				manipulatedData = this.isEditMode
					? this.manipulateEditModeData(formData.gridData)
					: this.manipulateAddModeData(formData.gridData);
			}
			this.onDataPicked.emit(manipulatedData);
		}
	}

	private hasGridData(formData: IPositionGridDataForm): boolean {
		return formData.gridData.length > Number(magicNumber.zero);
	}

	private manipulateEditModeData(gridData: IPositionGridData[]) {
		return gridData.map((item: IPositionGridData) => {
			return {
				targetStartDate: this.localizationService.TransformDate(item.startDateControl, 'MM/dd/yyyy'),
				targetEndDate: this.localizationService.TransformDate(item.endDateControl, 'MM/dd/yyyy'),
				baseWageRate: item.baseWage,
				actualShiftWageRate: item.actualWage,
				shiftMultiplier: item.clpId
					? item.shiftMultiplier
					: this.shiftDetails?.AdderOrMultiplierValue,
				positionId: item.positionId,
				IsFilled: Boolean(item.clpId)
			};
		});
	}

	private manipulateAddModeData(gridData: IPositionGridData[]) {
		return gridData.map((item: IPositionGridData) => {
			return {
				targetStartDate: this.localizationService.TransformDate(item.startDateControl, 'MM/dd/yyyy'),
				targetEndDate: this.localizationService.TransformDate(item.endDateControl, 'MM/dd/yyyy'),
				baseWageRate: item.baseWage,
				actualShiftWageRate: item.actualWage,
				shiftMultiplier: this.shiftDetails?.AdderOrMultiplierValue,
				noOfContractors: item.contractorsControl
			};
		});
	}

	private markFormGroupAsTouched(formGroup: FormGroup | FormArray) {
		Object.values(formGroup.controls).forEach((control) => {
			if (control instanceof FormControl) {
				control.markAsTouched();
			} else if (control instanceof FormGroup || control instanceof FormArray) {
				this.markFormGroupAsTouched(control);
			}
		});
	}

	private getTenureViolationValidationMessage() {
		const requsitionTenure = (this.requsitionTenure === undefined || this.requsitionTenure === null || this.requsitionTenure === magicNumber.zero)
				? magicNumber.zero
				: this.requsitionTenure,
			tenureTypeLabel = (this.tenureLimitType == TenureLimitTypes.Hours)
				? 'Hour'
				: 'Month',
			localizeRequsitionTenure: DynamicParam[] = [
				{ Value: requsitionTenure.toString(), IsLocalizeKey: false },
				{ Value: tenureTypeLabel, IsLocalizeKey: true }
			];
		return this.localizationService.GetLocalizeMessage('TenureViolationValidation', localizeRequsitionTenure);
	}

	public triggerValidation() {
		const formControls = this.form.get('gridData') as FormArray;
		for (let index = Number(magicNumber.zero); index < formControls.controls.length; index++) {
			const control = formControls.controls[index] as FormGroup;
			if (this.validateContractorsControl(control) || this.validateStartDateControl(control) || this.validateEndDateControl(control)) {
				return { errors: true };
			}
		}
		return { errors: false };
	}

	private validateContractorsControl(control: FormGroup): boolean {
		const contractorsControl = control.get('contractorsControl'),
			value = contractorsControl?.value;
		contractorsControl?.markAsTouched();
		if (value === null || value === Number(magicNumber.zero) || value % Number(magicNumber.one) !== Number(magicNumber.zero) || isNaN(value)) {
			return true;
		}
		return false;
	}

	private validateStartDateControl(control: FormGroup): boolean {
		const startDateControl = control.get('startDateControl'),
			value = startDateControl?.value;
		startDateControl?.markAsTouched();
		if (value === null) {
			this.toasterService.showToaster(ToastOptions.Error, `StartDateEmptyValidation`);
			return true;
		} else if (this.startDate
			&& this.contractorService.parseDateStringToDate(value) < this.contractorService.parseDateStringToDate(this.startDate as string)) {
			this.toasterService.showToaster(ToastOptions.Error, `TargetStartDateValidation`);
			startDateControl?.setErrors({ 'incorrect': true });
			return true;
		}
		else if (value && this.startDateNoLaterThan
			&& this.contractorService.parseDateStringToDate(value) >
			this.contractorService.parseDateStringToDate(this.startDateNoLaterThan as string)) {
			this.toasterService.showToaster(ToastOptions.Error, `TargetStartDateGreaterThanValidation`);
			startDateControl?.setErrors({ 'incorrect': true });
			return true;
		} else {
			startDateControl?.setErrors(null);
		}
		return false;
	}

	private validateEndDateControl(control: FormGroup): boolean {
		const endDateControl = control.get('endDateControl'),
			endDate = endDateControl?.value,
			startDate = control.get('startDateControl')?.value,
			maxTargetEndDate = this.contractorService.addMonthsOrDays(startDate, this.requsitionTenure, this.tenureLimitType);
		endDateControl?.markAsTouched();
		if (endDate === null) {
			this.toasterService.showToaster(ToastOptions.Error, `EndDateemptyValidation`);
			return true;
		} else if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
			this.toasterService.showToaster(ToastOptions.Error, `TargetEnddateValidation`);
			endDateControl?.setErrors({ 'incorrect': true });
			return true;
		} else if (this.tenurePolicyApplicable && maxTargetEndDate && endDate && new Date(maxTargetEndDate) < new Date(endDate)) {
			this.toasterService.showToaster(ToastOptions.Error, this.getTenureViolationValidationMessage());
			endDateControl?.setErrors({ 'incorrect': true });
			return true;
		} else {
			endDateControl?.setErrors(null);
		}
		return false;
	}

	private validateStartDateControlForm(control: FormGroup) {
		const startDateControl = control.get('startDateControl'),
			value = startDateControl?.value;
		if (this.startDate && this.contractorService.parseDateStringToDate(value) <
			this.contractorService.parseDateStringToDate(this.startDate as string)) {
			startDateControl?.setErrors({ 'incorrect': true });
		}
		else if (value && this.startDateNoLaterThan
			&& this.contractorService.parseDateStringToDate(value) >
			this.contractorService.parseDateStringToDate(this.startDateNoLaterThan as string)) {
			startDateControl?.setErrors({ 'incorrect': true });
		} else {
			startDateControl?.setErrors(null);
		}
	}

	ngOnDestroy() {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}
