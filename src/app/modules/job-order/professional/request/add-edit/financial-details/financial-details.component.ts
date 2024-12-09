import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IEstimationPayload, IHdrDetail, ISharedDataIds } from '../../../interface/shared-data.interface';
import { LocationService } from '@xrm-master/location/services/location.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { filter, first, forkJoin, map, Observable, of, Subject, Subscription, switchMap, take, takeUntil, tap, timer } from 'rxjs';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { BenefitAddUpdateDto, IDialogButton, LocationDetails, ShiftDetails } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { ProfessionalRequestService } from '../../../services/professional-request.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { ContractorDetailsService } from 'src/app/modules/job-order/light-industrial/services/contractor-details.service';
import { HourDistributionRuleService } from 'src/app/services/masters/hour-distribution-rule.service';
import { flattenObject, replaceNestedValueObjects } from '../../../constant/helper-functions';
import { LightIndustrialService } from 'src/app/modules/job-order/light-industrial/services/light-industrial.service';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { CultureFormat } from '@xrm-shared/services/Localization/culture-format.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { DEFAULT_SHIFT_DETAILS } from 'src/app/modules/job-order/light-industrial/constant/li-request.constant';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { IBenefitData } from '@xrm-shared/common-components/benefit-adder/benefit-adder.interface';
import { DatePickerService } from '@xrm-shared/widgets/form-controls/kendo-datepicker/datepicker.service';

@Component({
	selector: 'app-financial-details',
	templateUrl: './financial-details.component.html',
	styleUrl: './financial-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancialDetailsComponent implements OnInit {
	@Input() childFormGroup: FormGroup;
	public rateDetailsFrom: FormGroup;
	@Input() isEditMode: boolean = false;
	@Input() isCopyReq: boolean = false;
	@Input() isDraft: boolean = false;
	@Input() public profRequestDetails: any;
	@Input() public sectorId: any = magicNumber.zero;
	@Input() public locationId: any = magicNumber.zero;
	@Input() public reqLibraryId: number = magicNumber.zero;
	@Input() shiftId: number = magicNumber.zero;
	@Input() shiftDays: any;
	@Input() targetEndDate: any;
	@Input() positionNeeded: number | null;
	@Input() public destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	private requestDetails: any;
	public overTimeHoursList: DropdownItem[] = [];
	public billRateValidationList: DropdownItem[] = [];
	private originalEstimatedCost: number = magicNumber.zero;
	private wageRate: number = magicNumber.zero;
	private billRate: number = magicNumber.zero;
	private estRegHoursPerWeek: number = magicNumber.zero;
	public hdrList: DropdownItem[] = [];
	public isOTHousBilledAtShow: boolean = true;
	public entityId: number = XrmEntities.ProfessionalRequest;
	public isDisableEstimatedOtHoursPerWeek: boolean = false;
	public steps = [
		{ label: "Job Details", icon: "check", id: 'JobDetails' },
		{ label: "Assignment Details", icon: "check", id: 'AssignmentDetails' },
		{ label: "Financial Details", icon: "check", id: 'FinancialDetails' },
		{ label: "Approver & Other Details", icon: "check", id: 'ApproverOtherDetails' }
	];

	private sectorDetails: any;
	private locationDetails: LocationDetails | null;
	public reqLibraryDetails: any;
	private jobCategoryDetails: any;
	private laborCategoryDetails: any;
	public isEstimatedOtHoursPerWeekShow: boolean = false;
	public isBudgetHourShow: boolean = false;
	public isRateExceptionAllowed = false;
	public isNteBillRateChange: boolean = false;
	public isWageRateAdjustmentShow: boolean = false;
	public isWageRateAdjustmentAllow: boolean = false;
	private shiftDetails: ShiftDetails;
	private currencyVal: string;
	private regularStHoursPerWeekBasedHDR: number | null;
	private dialogButtonSubNTEBillChange: Subscription = new Subscription();
	private benefitAdderTotalAmount: number = magicNumber.zero;
	public isEntityBenefitAdderPatched: boolean = false;
	private benefitAdderCompletionSubject = new Subject<number>();

	// eslint-disable-next-line max-params
	constructor(
		private locationService: LocationService,
		private localizationService: LocalizationService,
		private contractorDetailsService: ContractorDetailsService,
		private sharedDataService: SharedDataService,
		private professionalRequestService: ProfessionalRequestService,
		private cdr: ChangeDetectorRef,
		private customValidators: CustomValidators,
		private dialogPopupService: DialogPopupService,
		private hourDistributionRuleService: HourDistributionRuleService,
		private lightIndustrialService: LightIndustrialService,
		private toasterService: ToasterService,
		private datePickerService: DatePickerService
	) {
		this.getCultureType();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.handleSectorChange(changes);
		this.handleLocationChange(changes);
		this.handleReqLibraryChange(changes);
		this.handleTargetEndDateChange(changes);
		this.handleShiftChange(changes);
		this.handleShiftDaysChange(changes);
		this.handlePositionNeededChange(changes);
		this.handleCopyRequest(changes);
	}

	ngOnInit(): void {
		this.rateDetailsFrom = this.childFormGroup.get('rateDetails') as FormGroup;
		this.getStaticTypesDropdowns();
		this.getShiftData();
		this.getFieldsIds();
		this.getFieldsDetails();
		this.persistFormValue();
	}

	private getFieldsIds() {
		this.sharedDataService.currentIds$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((ids: ISharedDataIds) => {
			this.sectorId = ids.sectorId;
			this.locationId = ids.locationId;
			this.reqLibraryId = ids.reqLibraryId;
		});
	}

	private getFieldsDetails() {
		this.sharedDataService.currentFieldDetails$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((fieldDetails) => {
			this.sectorDetails = fieldDetails.sectorDetails;
			this.locationDetails = fieldDetails.locationDetails;
			this.reqLibraryDetails = fieldDetails.reqLibraryDetails;
			this.jobCategoryDetails = fieldDetails.jobCategoryDetails;
			this.laborCategoryDetails = fieldDetails.laborCategoryDetails;
		});
		this.wageRate = this.reqLibraryDetails?.WageRate ?? magicNumber.zero;
	}

	private persistFormValue() {
		if (this.sharedDataService.financeDetailsFormPersist) {
			this.persistFormData();
		} else if (this.isEditMode || this.isDraft || this.isCopyReq) {
			this.getProfRequestDetails();
		} else {
			this.setFieldsConfigurations();
		}
	}

	private persistFormData() {
		const previousFormData = this.getFlattenedFormData();
		this.handleHdrFielsChange();
		if (this.sharedDataService.fieldOnChange.jobCategory.isWageReset) {
			this.resetReqLibraryDataAndRelatedFields();
			this.updateReqLibraryDetailsBasedData();
		} else if (this.sharedDataService.fieldOnChange.shift.isBillRateReset) {
			this.getWageRateAdjustmentConfig();
			this.getOtHoursBilledAtField();
			this.setEstimatedRegularHoursPerWeek();
			this.calcNteAndEstCostWithBenefitCompletion();
		} else if (this.sharedDataService.fieldOnChange.shift.estimatedCost) {
			this.getWageRateAdjustmentConfig();
			this.getOtHoursBilledAtField();
			this.setEstimatedRegularHoursPerWeek();
			this.getEstimatedCost();
		} else {
			this.getWageRateAdjustmentConfig();
			this.getNteBillRateField(previousFormData);
			this.patchOriginalEstimatedCost();
			this.getEstimatedRegularHoursPerWeek();
			this.getOtHoursBilledAtField();
			this.getEstimatedCost();
			this.isEntityBenefitAdderPatched = this.sharedDataService.isEntityBenefitAdderPatched;
		}
		this.getOTHoursAllowedField();
	}
	private getFlattenedFormData() {
		return flattenObject(replaceNestedValueObjects(this.childFormGroup.getRawValue()));
	}

	public hdrOnChange(event: DropdownItem) {
		this.getHdrDetails(Number(event.Value));
	}

	private getHdrDetails(id: number) {
		this.hourDistributionRuleService.getHdrById(id).pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe((res: GenericResponseBase<IHdrDetail>) => {
				if (!res.Succeeded || !res.Data) {
					return;
				}
				const estimatedHoursControl = this.rateDetailsFrom.get('EstimatedRegularHoursPerWeek'),
					estimatedHoursValue = this.rateDetailsFrom.get('EstimatedRegularHoursPerWeek')?.value,
					regularStHoursPerWeek = res.Data.RegularStHoursPerWeek;
				this.regularStHoursPerWeekBasedHDR = regularStHoursPerWeek;
				if (regularStHoursPerWeek != null && regularStHoursPerWeek > Number(magicNumber.zero) && estimatedHoursControl) {
					if (estimatedHoursValue > regularStHoursPerWeek) {
						estimatedHoursControl.setValue(regularStHoursPerWeek, { emitEvent: false });
						this.estRegHoursPerWeek = regularStHoursPerWeek;
						this.calEstCostwithDefaultValue().pipe(first()).subscribe();
					}
					this.enableDisableEstimatedOtHoursPerWeek(estimatedHoursValue);
					estimatedHoursControl.setValidators([this.exceedHoursValidator(regularStHoursPerWeek)]);
				} else {
					estimatedHoursControl?.clearValidators();
				}
				estimatedHoursControl?.updateValueAndValidity();
			});
	}

	private exceedHoursValidator(regularStHoursPerWeek: number | null): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (regularStHoursPerWeek == null || regularStHoursPerWeek === Number(magicNumber.zero)) {
				return null;
			}
			if (control.value != null && control.value > regularStHoursPerWeek) {
				return {
					error: true,
					message: 'EstimatedRegularHoursWeekValidation',
					dynamicParam: [{ Value: regularStHoursPerWeek, IsLocalizeKey: false }]
				};
			}
			return null;
		};
	}

	public onBaseWageRateBlur(event: any): void {
		const newBaseWageRate = this.rateDetailsFrom.controls['BaseWageRate'].value;
		if (newBaseWageRate == this.wageRate) return;
		this.wageRate = newBaseWageRate;
		this.nteBillRateCalc(newBaseWageRate).pipe(switchMap(() =>
			this.calEstCostwithDefaultValue())).subscribe();
	}

	public onEstRegHoursPerWeek(event: any) {
		this.estRegHoursPerWeek = this.rateDetailsFrom.controls['EstimatedRegularHoursPerWeek'].value;
		this.enableDisableEstimatedOtHoursPerWeek(this.estRegHoursPerWeek);
		this.calculateEstimatedCost();
	};

	private enableDisableEstimatedOtHoursPerWeek(estRegHoursPerWeek: number) {
		const isOtExpected = this.rateDetailsFrom.controls['IsOtExpected'].value,
			control = this.rateDetailsFrom.controls['EstimatedOtHoursPerWeek'];
		if (isOtExpected && this.regularStHoursPerWeekBasedHDR) {
			if (estRegHoursPerWeek < this.regularStHoursPerWeekBasedHDR) {
				control.setValue(magicNumber.zero);
				this.isDisableEstimatedOtHoursPerWeek = true;
			} else {
				this.isDisableEstimatedOtHoursPerWeek = false;
			}
		}

	}

	public onEstOtHoursPerWeek(event: any) {
		this.calculateEstimatedCost();
	};

	private getNteBillRateField(requestDetails: any) {
		this.billRate = requestDetails?.NewNteBillRate;
		this.patchFieldBasedOnNteBillRate(requestDetails);
		this.isNteBillRateEditable();
	}

	private handleHdrFielsChange() {
		if (this.sharedDataService.fieldOnChange.location.isHDRReset) {
			this.resetHdrDistributionData();
			this.getHdrList(this.locationId);
		} else {
			this.patchPreviousHdr(this.rateDetailsFrom.controls['HourDistributionRuleId'].value?.Value);
		}
	}

	private patchPreviousHdr(hdrId: number): void {
		const afterHdrSelectCallback = () => {
			const previousHdr = this.hdrList.find((hdr: DropdownItem) =>
				Number(hdr.Value) == hdrId);
			if (previousHdr) {
				this.rateDetailsFrom.patchValue({
					HourDistributionRuleId: {
						Text: previousHdr.Text,
						Value: (previousHdr.Value).toString()
					}
				});
				this.getHdrDetails(hdrId);
			} else {
				this.patchSingleDDItemHdr();
			}
		};
		this.getHdrList(this.locationId, afterHdrSelectCallback);
	}

	private getEstimatedRegularHoursPerWeek() {
		this.estRegHoursPerWeek = this.rateDetailsFrom.controls['EstimatedRegularHoursPerWeek'].value;
		this.enableDisableEstimatedOtHoursPerWeek(this.estRegHoursPerWeek);
	}

	private getOtHoursBilledAtField() {
		this.isOtHoursBilledAtShow();
	}

	private getOTHoursAllowedField() {
		const isOTHoursAllowed = this.rateDetailsFrom.controls['IsOtExpected'].value;
		if (isOTHoursAllowed) {
			this.showEstimatedOtHoursPerWeek();
		} else {
			this.hideEstimatedOtHoursPerWeek();
		}
	}

	private getEstimatedCost() {
		this.waitForBenefitAdderCompletion().subscribe(() =>
			this.calculateEstimatedCost());
	}

	private getProfRequestDetails() {
		if (this.profRequestDetails) {
			this.requestDetails = flattenObject(this.profRequestDetails);
			this.patchProfRequestDetails(this.requestDetails);
			this.cdr.markForCheck();
		}
	}

	private patchProfRequestDetails(requestDetails: any): void {
		if (this.isCopyReq || this.isDraft) {
			this.setRateBasedOnConfig();
			this.patchPreviousHdr(requestDetails.HourDistributionRuleId);
			this.isNteBillRateEditable();
			this.patchOtHoursBilledAtField(requestDetails);
			this.patchOtExpectedFields(requestDetails);
			this.setEstimatedRegularHoursPerWeek();
			this.calcNteAndEstCostWithBenefitCompletion();
		} else {
			this.patchBaseWageRate(requestDetails);
			this.patchHdr(requestDetails);
			this.patchNteBillRateFields(requestDetails);
			this.patchOtHoursBilledAtField(requestDetails);
			this.patchOtExpectedFields(requestDetails);
			this.patchEstimatedCost(requestDetails.EstimatedCost);
			this.patchOriginalEstimatedCost();
			this.patchEstimatedRegularHoursPerWeek(requestDetails);
		}
	}

	private patchBaseWageRate(requestDetails: any) {
		this.rateDetailsFrom.patchValue({
			'BaseWageRate': requestDetails?.BaseWageRate,
			'RateUnitId': this.reqLibraryDetails?.RateUnitCode
		});
		this.getWageRateAdjustmentConfig();
	}

	private patchHdr(requestDetails: any) {
		const locationId = requestDetails.WorkLocationId,
			hdrId = requestDetails.HourDistributionRuleId,
			afterHdrSelectCallback = () => {
				const hdr = this.hdrList.find((ele: DropdownItem) =>
					Number(ele.Value) == hdrId);
				if (hdr) {
					this.rateDetailsFrom.patchValue({
						HourDistributionRuleId: {
							Text: hdr.Text,
							Value: (hdr.Value).toString()
						}
					});
					this.getHdrDetails(hdrId);
				}
			};
		this.getHdrListWithHdrId(locationId, hdrId, afterHdrSelectCallback);
	}

	private getHdrListWithHdrId(locationId: number, hdrId: number, callback: () => void): void {
		const reqIds = {
			locId: locationId,
			hourDistributionRuleId: hdrId
		};
		this.lightIndustrialService.getHDRDropdownEdit(reqIds).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.hdrList = data.Data ?? [];
				} else {
					this.hdrList = [];
				}
				callback();
			}
		});
	}

	private patchNteBillRateFields(requestDetails: any): void {
		this.rateDetailsFrom.patchValue({
			'NteBillRate': requestDetails?.NteBillRate,
			'NewNteBillRate': requestDetails?.NewNteBillRate
		});
		this.billRate = requestDetails?.NewNteBillRate;
		this.patchFieldBasedOnNteBillRate(requestDetails);
		this.isNteBillRateEditable();
	}

	private patchFieldBasedOnNteBillRate(requestDetails: any) {
		const nteBillRate = this.rateDetailsFrom.controls['NteBillRate'].value,
			NewNteBillRate = this.rateDetailsFrom.controls['NewNteBillRate'].value,
			control = this.rateDetailsFrom.controls['ReasonForException'];
		if (nteBillRate !== NewNteBillRate) {
			this.showReasonForException(control);
			this.rateDetailsFrom.patchValue({
				'ReasonForException': requestDetails?.ReasonForException,
				'DeltaCost': requestDetails?.DeltaCost
			});
		}
	}

	private patchEstimatedRegularHoursPerWeek(requestDetails: any) {
		this.rateDetailsFrom.patchValue({
			'EstimatedRegularHoursPerWeek': requestDetails.EstimatedRegularHoursPerWeek
		});
		this.estRegHoursPerWeek = requestDetails.EstimatedRegularHoursPerWeek;
		this.enableDisableEstimatedOtHoursPerWeek(this.estRegHoursPerWeek);
	}

	private patchOtHoursBilledAtField(requestDetails: any) {
		this.isOtHoursBilledAtShow();
		this.rateDetailsFrom.patchValue({
			'OthoursBilledAt': requestDetails.OthoursBilledAt
				? String(requestDetails.OthoursBilledAt)
				: String(this.jobCategoryDetails.OTHoursBilledAtId)
		});
	}

	private patchOtExpectedFields(requestDetails: any): void {
		this.rateDetailsFrom.patchValue({
			'IsOtExpected': requestDetails.IsOtExpected
		});
		this.patchFieldBasedOnIsOtExpected(requestDetails);
	}

	private patchFieldBasedOnIsOtExpected(requestDetails: any) {
		if (requestDetails.IsOtExpected) {
			this.showEstimatedOtHoursPerWeek();
			this.rateDetailsFrom.patchValue({
				'EstimatedOtHoursPerWeek': requestDetails?.EstimatedOtHoursPerWeek
			});
		}
	}

	private patchEstimatedCost(estimatedCost: number) {
		this.rateDetailsFrom.patchValue({
			'EstimatedCost': estimatedCost
		});
	}

	private patchOriginalEstimatedCost() {
		const estimatedCost = this.rateDetailsFrom.controls['EstimatedCost'].value,
			deltaCost = this.rateDetailsFrom.controls['DeltaCost'].value;
		this.originalEstimatedCost = estimatedCost - deltaCost;
	}

	private setFieldsConfigurations() {
		this.setRateBasedOnConfig();
		this.getHdrList(this.locationId);
		this.isNteBillRateEditable();
		this.setOtHoursBilledAt();
		this.setEstimatedRegularHoursPerWeek();
		this.calcNteAndEstCostWithBenefitCompletion();
	}

	private calcNteAndEstCostWithBenefitCompletion() {
		forkJoin([
			this.nteBillRateCalc(),
			this.waitForBenefitAdderCompletion()
		]).pipe(
			switchMap(() =>
				this.calEstCostwithDefaultValue()),
			takeUntil(this.destroyAllSubscriptions$)
		).subscribe();
	}

	private waitForBenefitAdderCompletion(): Observable<number> {
		return this.benefitAdderCompletionSubject.asObservable().pipe(take(magicNumber.one));
	}

	private setEstimatedRegularHoursPerWeek() {
		this.estRegHoursPerWeek = this.calculateEstimatedRegularHoursWeek(this.shiftDetails);
		this.rateDetailsFrom.patchValue({
			'EstimatedRegularHoursPerWeek': this.estRegHoursPerWeek
		});
		this.enableDisableEstimatedOtHoursPerWeek(this.estRegHoursPerWeek);
	}

	private getShiftData() {
		this.sharedDataService.shiftDetails$.pipe(
			takeUntil(this.destroyAllSubscriptions$),
			filter((data: ShiftDetails | null): data is ShiftDetails =>
				data !== null)
		).subscribe((data: ShiftDetails) => { this.shiftDetails = data; });
	}

	private calculateEstimatedRegularHoursWeek(data: ShiftDetails): number {
		const startInMinutes = this.convertTimeToMinutes(data.StartTime),
			endInMinutes = this.convertTimeToMinutes(data.EndTime),
			dailyWorkMinutes = this.calculateDailyWorkMinutes(startInMinutes, endInMinutes),
			numberOfWorkingDays = this.calculateWorkingDays(data);
		let dailyWorkHours = this.convertMinutesToHours(dailyWorkMinutes);
		dailyWorkHours -= magicNumber.zeroDecimalFive;
		return dailyWorkHours * numberOfWorkingDays;
	}

	private convertTimeToMinutes(time: string): number {
		const [hour, minute] = time.split(':').map((part) =>
			parseInt(part, magicNumber.ten));
		return hour * magicNumber.sixty + minute;
	}

	private calculateDailyWorkMinutes(startInMinutes: number, endInMinutes: number): number {
		let workMinutes: number;
		if (startInMinutes === endInMinutes) {
			workMinutes = magicNumber.twentyFour * magicNumber.sixty;
		}
		else if (endInMinutes > startInMinutes) {
			workMinutes = endInMinutes - startInMinutes;
		}
		else {
			workMinutes = (magicNumber.twentyFour * magicNumber.sixty) - startInMinutes + endInMinutes;
		}
		return workMinutes;
	}

	private convertMinutesToHours(minutes: number): number {
		return minutes / magicNumber.sixty;
	}

	private calculateWorkingDays(data: ShiftDetails): number {
		const workingDays: (keyof ShiftDetails)[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		return workingDays.reduce((total, day) =>
			total + (data[day]
				? magicNumber.one
				: magicNumber.zero), magicNumber.zero);
	}

	private getStaticTypesDropdowns() {
		forkJoin({
			overtimeHours: this.professionalRequestService.getStaticTypesDropdownWithId('OvertimeHoursBilledAt').pipe(takeUntil(this.destroyAllSubscriptions$)),
			billRateValidation: this.professionalRequestService.getStaticTypesDropdownWithId('BillRateValidation').pipe(takeUntil(this.destroyAllSubscriptions$))
		}).subscribe((results: { overtimeHours: GenericResponseBase<DropdownItem[]>, billRateValidation: GenericResponseBase<DropdownItem[]> }) => {
			if (results.overtimeHours.Succeeded && results.overtimeHours.Data) {
				this.overTimeHoursList = results.overtimeHours.Data;
			}
			if (results.billRateValidation.Succeeded && results.billRateValidation.Data) {
				this.billRateValidationList = results.billRateValidation.Data;
			}
			this.cdr.markForCheck();
		});
	}

	private getHdrList(locationId: number, optionalCallback?: () => void): void {
		this.locationService.getHdrData(locationId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.hdrList = data.Data ?? [];
				} else {
					this.hdrList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemHdr();
				}

			}
		});
	}

	private patchSingleDDItemHdr(): void {
		if (this.hdrList.length === Number(magicNumber.one)) {
			this.rateDetailsFrom.patchValue({
				HourDistributionRuleId: {
					Text: this.hdrList[magicNumber.zero].Text,
					Value: this.hdrList[magicNumber.zero].Value
				}
			});
			this.hdrOnChange(this.hdrList[magicNumber.zero]);
		}
	}

	private setRateBasedOnConfig() {
		this.rateDetailsFrom.patchValue({
			'BaseWageRate': this.reqLibraryDetails?.WageRate,
			'RateUnitId': this.reqLibraryDetails?.RateUnitCode
		});
		this.getWageRateAdjustmentConfig();
	}

	private getWageRateAdjustmentConfig() {
		if (this.jobCategoryDetails.IsWageRateAdjustment) {
			this.isWageRateAdjustmentShow = true;
			this.isWageRateAdjustmentAllow = false;
			this.baseWageRateValidation(this.reqLibraryDetails?.BillRate);
		} else if (!this.jobCategoryDetails.IsWageRateAdjustment && this.reqLibraryDetails.WageRate !== null) {
			this.isWageRateAdjustmentShow = true;
			this.isWageRateAdjustmentAllow = true;
		} else {
			this.isWageRateAdjustmentShow = false;
			this.isWageRateAdjustmentAllow = true;
		}
	}
	private baseWageRateValidation(BillRate: number) {
		this.rateDetailsFrom.get('BaseWageRate')?.setValidators([this.baseWageMaxLengthValidator(BillRate)]);
	}

	private baseWageMaxLengthValidator(billRate: number | null): ValidatorFn {
		const msg = `Base Wage rate field should not exceed the NTE (Not-to-Exceed)/Target Rate specified in the Requisition Library (${billRate}), and it should be greater than 0.`;
		return (control: AbstractControl): ValidationErrors | null => {
			if (billRate == null || billRate === Number(magicNumber.zero)) {
				return null;
			}
			if (control.value != null && (control.value <= Number(magicNumber.zero) || control.value > billRate)) {
				return {
					error: true,
					message: msg
				};
			}
			return null;
		};
	}

	private isNteBillRateEditable() {
		this.isRateExceptionAllowed = !this.sectorDetails.IsRateExceptionAllowed;
	}

	private setOtHoursBilledAt() {
		this.isOtHoursBilledAtShow();
		this.rateDetailsFrom.patchValue({
			'OthoursBilledAt': String(this.jobCategoryDetails.OTHoursBilledAtId)
		});
	}

	private isOtHoursBilledAtShow() {
		this.isOTHousBilledAtShow = !this.sectorDetails.MaskOtFieldsInSystem;
	}

	public otBilledAtChange(event: number) {
		this.calculateEstimatedCost();
	}

	public onOTHoursAllowedChange(isOTHoursAllowed: boolean) {
		this.calculateEstimatedCost();
		if (isOTHoursAllowed) {
			this.showEstimatedOtHoursPerWeek();
			this.enableDisableEstimatedOtHoursPerWeekOnOTHoursChage();
		} else {
			this.hideEstimatedOtHoursPerWeek();
		}
	}
	private enableDisableEstimatedOtHoursPerWeekOnOTHoursChage() {
		const isOtExpected = this.rateDetailsFrom.controls['IsOtExpected'].value,
			control = this.rateDetailsFrom.controls['EstimatedOtHoursPerWeek'],
			estRegHoursPerWeek = this.rateDetailsFrom.controls['EstimatedRegularHoursPerWeek'].value;
		if (isOtExpected && this.regularStHoursPerWeekBasedHDR) {
			if (estRegHoursPerWeek < this.regularStHoursPerWeekBasedHDR) {
				control.setValue(magicNumber.zero);
				this.isDisableEstimatedOtHoursPerWeek = true;
			} else {
				this.isDisableEstimatedOtHoursPerWeek = false;
			}
		}
	}

	private hideEstimatedOtHoursPerWeek(): void {
		this.rateDetailsFrom.controls['EstimatedOtHoursPerWeek'].reset();
		this.isEstimatedOtHoursPerWeekShow = false;
	}

	private showEstimatedOtHoursPerWeek(): void {
		this.isEstimatedOtHoursPerWeekShow = true;
		this.cdr.markForCheck();
	}

	public onNteBillRateChange(): void {
		const newNteBillRate = this.rateDetailsFrom.controls['NewNteBillRate'].value,
			nteBillRate = this.rateDetailsFrom.controls['NteBillRate'].value;
		if (newNteBillRate !== this.billRate) {
			this.dialogPopupService.showConfirmation(
				'RateExceptionAgreement',
				PopupDialogButtons.agreeYesNo
			);
			this.cdr.markForCheck();
			this.dialogButtonSubNTEBillChange.unsubscribe();
			this.dialogButtonSubNTEBillChange = this.dialogPopupService.dialogButtonObs.pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((button: IDialogButton | string | null) => {
					if (button === null)
						return;
					this.nteBillRateConfirmationPopUp(button, newNteBillRate);
				});
		}
	}

	private async nteBillRateConfirmationPopUp(button: IDialogButton | string, newBillRate: number) {
		if (typeof button === 'string' && button === 'close') {
			this.rateDetailsFrom.controls['NewNteBillRate'].setValue(this.billRate);
			this.dialogPopupService.resetDialogButton();
		} else if (typeof button === 'object' && button.value == Number(magicNumber.twentyEight)) {
			this.billRate = newBillRate;
			await this.calculateEstimatedCost();
			this.checkRateExceptionToShowHide();
			this.dialogPopupService.resetDialogButton();
			return;
		} else if (typeof button === 'object' && button.value == Number(magicNumber.twentySeven)) {
			this.rateDetailsFrom.controls['NewNteBillRate'].setValue(this.billRate);
			this.checkRateExceptionToShowHide();
			this.dialogPopupService.resetDialogButton();
		} else {
			this.dialogPopupService.resetDialogButton();
		}
	}

	private checkRateExceptionToShowHide() {
		const deltaCost = this.rateDetailsFrom.controls['DeltaCost'].value,
			reasonForExceptionCtrl = this.rateDetailsFrom.controls['ReasonForException'];
		if (deltaCost == magicNumber.zero || deltaCost == null) {
			this.hideReasonForException(reasonForExceptionCtrl);
		} else {
			this.showReasonForException(reasonForExceptionCtrl);
		}
		this.cdr.markForCheck();
	}

	private hideReasonForException(control: AbstractControl): void {
		this.isNteBillRateChange = false;
		control.reset();
		control.clearValidators();
		control.updateValueAndValidity();
	}

	private showReasonForException(control: AbstractControl): void {
		this.isNteBillRateChange = true;
		control.setValidators(this.customValidators.RequiredValidator('PleaseEnterData', [{ Value: 'ReasonForException', IsLocalizeKey: true }]));
		control.updateValueAndValidity();
	}

	private nteBillRateCalc(newBaseWageRate: number = magicNumber.zero): Observable<GenericResponseBase<number>> {
		const data = {
			"AllowWageRateAdjustment": this.jobCategoryDetails.IsWageRateAdjustment,
			"BaseBillRate": this.reqLibraryDetails.BillRate,
			"BaseWageRate": this.reqLibraryDetails.WageRate ?? magicNumber.zero,
			"NewBaseWageRate": newBaseWageRate > Number(magicNumber.zero)
				? newBaseWageRate
				: this.reqLibraryDetails.WageRate ?? magicNumber.zero,
			"ShiftDiffrentialMethod": this.shiftDetails.ShiftDifferentialMethod,
			"ShiftDiffrentialValue": this.shiftDetails.AdderOrMultiplierValue,
			"StandardRecruitedMarkup": this.sectorDetails.StandardRecruitedMarkup
		};
		return this.professionalRequestService.calcBillRate(data).pipe(
			takeUntil(this.destroyAllSubscriptions$),
			tap((res: GenericResponseBase<number>) => {
				if (res.Succeeded && res.Data) {
					this.billRate = res.Data;
					this.rateDetailsFrom.patchValue({
						'NteBillRate': this.billRate,
						'NewNteBillRate': this.billRate
					});
				}
			})
		);
	}


	private getEstimationPayload(): IEstimationPayload {
		this.datePickerService.addDatePickerField("StartDate");
		this.datePickerService.addDatePickerField("EndDate");
		const assignmentData = (this.childFormGroup.get('assignmentRequirement') as FormGroup).getRawValue();
		return {
			"StartDate": assignmentData.TargetStartDate,
			"EndDate": assignmentData.TargetEndDate,
			"BenefitAdderTotalAmount": this.benefitAdderTotalAmount,
			"ActualShiftWageRate": this.contractorDetailsService.calculateActualShiftWageRate(this.wageRate, this.shiftDetails.AdderOrMultiplierValue, this.shiftDetails.ShiftDifferentialMethod),
			"ShiftWeekDaysParamDto": {
				"WeekDays": [assignmentData.Sun, assignmentData.Mon, assignmentData.Tue, assignmentData.Wed, assignmentData.Thu, assignmentData.Fri, assignmentData.Sat],
				"ShiftDifferentialMethod": this.shiftDetails.ShiftDifferentialMethod,
				"AdderOrMultiplierValue": this.shiftDetails.AdderOrMultiplierValue,
				"startTime": assignmentData.StartTime,
				"endTime": assignmentData.EndTime
			},
			"BillRate": this.billRate,
			"WageRate": this.wageRate,
			"Positions": assignmentData.PositionNeeded,
			"EstimatedRegularHours": this.estRegHoursPerWeek,
			"EstimatedOTHours": this.rateDetailsFrom.controls['IsOtExpected'].value
				? this.rateDetailsFrom.controls['EstimatedOtHoursPerWeek'].value
				: magicNumber.zero,
			"OTMultiplier": this.sectorDetails.OtBillMultiplier,
			"RateUnit": this.reqLibraryDetails.RateUnitCode,
			"OtRateType": this.laborCategoryDetails.OtDtRateType,
			"OtHoursBilledAt": this.rateDetailsFrom.controls['OthoursBilledAt'].value
				? Number(this.rateDetailsFrom.controls['OthoursBilledAt'].value)
				: magicNumber.zero,
			"CalculationType": this.laborCategoryDetails.CostEstimationTypeId,
			"OtHoursAllowed": this.rateDetailsFrom.controls['IsOtExpected'].value
		};
	}

	private calEstCostwithDefaultValue(): Observable<GenericResponseBase<number>> {
		const payload = this.getEstimationPayload();
		return this.professionalRequestService.calcEstimationCost(payload).pipe(
			takeUntil(this.destroyAllSubscriptions$),
			tap((res: GenericResponseBase<number>) => {
				if (!res.Succeeded || (res.Data !== magicNumber.zero && !res.Data)) {
					return;
				}
				this.originalEstimatedCost = res.Data;
				this.rateDetailsFrom.patchValue({
					'EstimatedCost': res.Data
				});
				this.setDeltaCost(magicNumber.zero);
				this.checkRateExceptionToShowHide();
			})
		);
	}

	private calculateEstimatedCost(): Promise<number> {
		return new Promise((resolve) => {
			const payload = this.getEstimationPayload();
			this.professionalRequestService.calcEstimationCost(payload)
				.pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((res: GenericResponseBase<number>) => {
					if (!res.Succeeded || (res.Data !== magicNumber.zero && !res.Data)) {
						resolve(magicNumber.zero);
						return;
					}
					const estimatedCost = res.Data,
						newNteBillRate = this.rateDetailsFrom.controls['NewNteBillRate'].value,
						nteBillRate = this.rateDetailsFrom.controls['NteBillRate'].value;
					this.rateDetailsFrom.patchValue({
						'EstimatedCost': estimatedCost
					});
					this.sharedDataService.updateEstimatedCost(estimatedCost);
					if (newNteBillRate === nteBillRate) {
						this.setDeltaCost(magicNumber.zero);
						resolve(estimatedCost);
						return;
					}
					if (this.originalEstimatedCost > Number(magicNumber.zero)) {
						this.calculateAndSetDeltaCost(estimatedCost);
					}
					resolve(estimatedCost);
				});
		});
	}

	private setDeltaCost(value: number): void {
		this.rateDetailsFrom.patchValue({
			'DeltaCost': value
		});
		this.sharedDataService.setBillRate(this.billRate);
		this.cdr.detectChanges();
	}

	private calculateAndSetDeltaCost(estimatedCost: number): void {
		const deltaCost = estimatedCost - this.originalEstimatedCost;
		this.setDeltaCost(deltaCost);
	}

	private getCultureType() {
		const countryId = this.localizationService.GetCulture(CultureFormat.CountryId);
		this.currencyVal = this.localizationService.GetCulture(CultureFormat.CurrencyCode, countryId);
	}

	public getNteBillRateLabel(): string {
		if (!this.laborCategoryDetails || !this.laborCategoryDetails.BillRateValidationId) {
			return this.localizationService.GetLocalizeMessage('NteTargetRate');
		}
		const { BillRateValidationId } = this.laborCategoryDetails,
			billRateValidation = this.billRateValidationList.find((x: DropdownItem) =>
				x.Value == BillRateValidationId);
		if (!billRateValidation) {
			return this.localizationService.GetLocalizeMessage('NteTargetRate');
		}
		return this.localizationService.GetLocalizeMessage('BillRateCurr', [{ Value: billRateValidation.Text, IsLocalizeKey: true }]);
	}

	public getBaseWageRateLabel() {
		let unitType = this.reqLibraryDetails?.RateUnitName ?? '';
		unitType = unitType !== ''
			? unitType
			: 'Hour';
		const dynamicParam: DynamicParam[] = [
			{ Value: this.currencyVal, IsLocalizeKey: false },
			{ Value: unitType, IsLocalizeKey: true }
		];
		return this.localizationService.GetLocalizeMessage('ActualPayRate', dynamicParam);
	}

	private handleSectorChange(changes: SimpleChanges) {
		if (changes['sectorId'] && !changes['sectorId'].firstChange) {
			const newSectorId = changes['sectorId'].currentValue,
				sectorDetails$ = newSectorId
					? this.sharedDataService.currentFieldDetails$.pipe(
						takeUntil(this.destroyAllSubscriptions$),
						filter((fieldDetails: any) =>
							Boolean(fieldDetails.sectorDetails)),
						map((fieldDetails: any) =>
							({
								sectorDetails: fieldDetails.sectorDetails
							})),
						take(magicNumber.one)
					)
					: of({ sectorDetails: null, locationDetails: null, reqLibraryDetails: null });

			sectorDetails$.subscribe((fieldDetails: any) => {
				this.sectorDetails = fieldDetails.sectorDetails;
				this.onSectorChange(newSectorId);
			});
		}
	}

	private onSectorChange(val: string | null): void {
		if (!val) {
			this.resetOtherFieldsListOnSectorDeSelect();
			return;
		}
		const newSectorId = parseInt(val);
		this.resetOtherFieldsListOnSectorDeSelect();
		this.getOtherFieldsListOnSectorSelect(newSectorId);
	}

	private resetOtherFieldsListOnSectorDeSelect(): void {
		this.isOTHousBilledAtShow = true;
		this.isRateExceptionAllowed = false;
		this.toasterService.resetToaster();
	}

	private getOtherFieldsListOnSectorSelect(sectorId: number) {
		this.isNteBillRateEditable();
	}

	private handleLocationChange(changes: SimpleChanges) {
		if (changes['locationId'] && !changes['locationId'].firstChange) {
			const newLocationId = changes['locationId'].currentValue;
			this.onLocationChange(newLocationId);
		}
	}

	private onLocationChange(val: string | null): void {
		if (!val) {
			this.resetLocationDataAndRelatedFields();
			return;
		}
		this.resetLocationDataAndRelatedFields();
		this.updateLocationDetailsBasedData();
	}

	private resetLocationDataAndRelatedFields(): void {
		this.resetHdrDistributionData();
		this.resetShiftData();
	}

	private resetHdrDistributionData(): void {
		this.hdrList = [];
		this.rateDetailsFrom.controls['HourDistributionRuleId'].reset();
	}

	private resetShiftData(): void {
		this.shiftDetails = DEFAULT_SHIFT_DETAILS;
	}

	private updateLocationDetailsBasedData(): void {
		this.getHdrList(this.locationId);
	}

	private handleReqLibraryChange(changes: SimpleChanges) {
		if (changes['reqLibraryId'] && !changes['reqLibraryId'].firstChange) {
			const newReqLibraryId = changes['reqLibraryId'].currentValue,
				reqLibraryDetails$ = newReqLibraryId
					? this.sharedDataService.currentFieldDetails$.pipe(
						takeUntil(this.destroyAllSubscriptions$),
						filter((fieldDetails: any) =>
							Boolean(fieldDetails.reqLibraryDetails)),
						map((fieldDetails: any) =>
							({
								reqLibraryDetails: fieldDetails.reqLibraryDetails,
								jobCategoryDetails: fieldDetails.jobCategoryDetails,
								laborCategoryDetails: fieldDetails.laborCategoryDetails
							})),
						take(magicNumber.one)
					)
					: of({ jobCategoryDetails: null, laborCategoryDetails: null, reqLibraryDetails: null });

			reqLibraryDetails$.subscribe((fieldDetails: any) => {
				this.reqLibraryDetails = fieldDetails.reqLibraryDetails;
				this.jobCategoryDetails = fieldDetails.jobCategoryDetails;
				this.laborCategoryDetails = fieldDetails.laborCategoryDetails;
				this.onReqLibraryChange(newReqLibraryId);
			});
		}
	}

	private onReqLibraryChange(val: string | null): void {
		if (!val) {
			this.resetReqLibraryDataAndRelatedFields();
			return;
		}
		this.resetReqLibraryDataAndRelatedFields();
		this.updateReqLibraryDetailsBasedData();
	}

	private resetReqLibraryDataAndRelatedFields() {
		this.wageRate = magicNumber.zero;
		this.isWageRateAdjustmentShow = false;
		this.isWageRateAdjustmentAllow = false;
		this.benefitAdderCompletionSubject = new Subject<number>();
	}

	private updateReqLibraryDetailsBasedData() {
		this.wageRate = this.reqLibraryDetails?.WageRate ?? magicNumber.zero;
		this.setRateBasedOnConfig();
		this.setOtHoursBilledAt();
		this.isEntityBenefitAdderPatched = true;
		if (this.shiftDetails !== null) {
			this.setEstimatedRegularHoursPerWeek();
			this.calcNteAndEstCostWithBenefitCompletion();
		}
	}

	private handleTargetEndDateChange(changes: SimpleChanges) {
		if (changes['targetEndDate'] && !changes['targetEndDate'].firstChange) {
			const targetEndDate = changes['targetEndDate'].currentValue;
			this.onTargetEndDateChange(targetEndDate);
		}
	}

	private onTargetEndDateChange(val: string | null): void {
		if (!val) {
			return;
		}
		this.calculateEstimatedCost();
	}

	private handleShiftChange(changes: SimpleChanges): void {
		if (changes['shiftId'] && !changes['shiftId'].firstChange) {
			const newShiftId = changes['shiftId'].currentValue;

			if (newShiftId) {
				this.sharedDataService.shiftDetails$
					.pipe(takeUntil(this.destroyAllSubscriptions$), take(magicNumber.one))
					.subscribe((shiftDetails) => {
						this.onShiftChange(newShiftId);
					});
			} else {
				this.onShiftChange(null);
			}
		}
	}

	private onShiftChange(val: string | null): void {
		if (!val) {
			this.resetShiftData();
			return;
		}
		this.setEstimatedRegularHoursPerWeek();
		this.nteBillRateCalc().pipe(switchMap(() =>
			this.calEstCostwithDefaultValue())).subscribe();
	}

	private handleShiftDaysChange(changes: SimpleChanges) {
		if (changes['shiftDays'] && !changes['shiftDays'].firstChange) {
			this.setEstimatedRegularHoursPerWeek();
			this.calculateEstimatedCost();
		}
	}

	private handlePositionNeededChange(changes: SimpleChanges) {
		if (changes['positionNeeded'] && !changes['positionNeeded'].firstChange) {
			const positionNeeded = changes['positionNeeded'].currentValue;
			this.onPositionNeededChange(positionNeeded);
		}
	}

	private onPositionNeededChange(positionNeeded: any) {
		this.nteBillRateCalc().pipe(switchMap(() =>
			this.calEstCostwithDefaultValue())).subscribe();
	}

	private handleCopyRequest(changes: SimpleChanges) {
		this.getProfRequestDetails();
	}

	public validateAll() {
		return this.estimationCostIsNonZero();
	}

	private estimationCostIsNonZero(): boolean {
		const estimatedCost = this.rateDetailsFrom.get('EstimatedCost')?.value;
		if (estimatedCost == Number(magicNumber.zero)) {
			this.toasterService.showToaster(ToastOptions.Error, 'EstimationCostZeroValidation');
			return false;
		}
		return true;
	}

	public getBenefitAdderData(data: IBenefitData[]) {
		const benefitAdderUpdateDto: BenefitAddUpdateDto[] = data.map((item: IBenefitData) =>
			({
				ReqLibraryBenefitAdderId: item.ReqLibraryBenefitAdderId,
				Value: item.Value
			}));
		this.benefitAdderTotalAmount = data.reduce((total, item) =>
			total + item.Value, magicNumber.zero);
		this.childFormGroup.controls['BenefitAddDto'].setValue(benefitAdderUpdateDto);
		this.benefitAdderCompletionSubject.next(this.benefitAdderTotalAmount);
		this.benefitAdderCompletionSubject.complete();
	}

	ngOnDestroy() {
		this.sharedDataService.financeDetailsFormPersist = true;
		this.sharedDataService.fieldOnChange.location.isHDRReset = false;
		this.sharedDataService.fieldOnChange.jobCategory.isWageReset = false;
		this.sharedDataService.fieldOnChange.shift.estimatedCost = false;
		this.sharedDataService.fieldOnChange.shift.isBillRateReset = false;
		this.sharedDataService.isEntityBenefitAdderPatched = this.isEntityBenefitAdderPatched;
		this.dialogButtonSubNTEBillChange.unsubscribe();
	}

}
