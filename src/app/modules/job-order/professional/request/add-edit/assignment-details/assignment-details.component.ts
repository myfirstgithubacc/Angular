import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ISharedDataIds } from '../../../interface/shared-data.interface';
import { SharedDataService } from '../../../services/shared-data.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { IShiftListPayload, IShiftListWithIdPayload, LocationDetails, ShiftDetails, TimeRange } from 'src/app/modules/job-order/light-industrial/interface/li-request.interface';
import { ShiftGatewayService } from 'src/app/services/masters/shift-gateway.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { filter, map, of, Subject, take, takeUntil } from 'rxjs';
import { LightIndustrialService } from 'src/app/modules/job-order/light-industrial/services/light-industrial.service';
import { IDayInfo } from '@xrm-shared/Utilities/dayinfo.interface';
import { SharedVariablesService } from 'src/app/modules/job-order/light-industrial/services/shared-variables.service';
import { DropdownItem } from '@xrm-core/models/common/dropdown.model';
import { ContractorDetailsService } from 'src/app/modules/job-order/light-industrial/services/contractor-details.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { TenureLimitTypes } from '@xrm-shared/services/common-constants/static-data.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { flattenObject, replaceNestedValueObjects } from '../../../constant/helper-functions';
import { DEFAULT_SHIFT_DETAILS } from 'src/app/modules/job-order/light-industrial/constant/li-request.constant';

@Component({
	selector: 'app-assignment-details',
	templateUrl: './assignment-details.component.html',
	styleUrl: './assignment-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentDetailsComponent implements OnInit {
	@Input() childFormGroup: FormGroup;
	public assignmentRequirementFrom: FormGroup;
	@Input() isEditMode: boolean = false;
	@Input() isCopyReq: boolean = false;
	@Input() isDraft: boolean = false;
	@Input() sectorId: number | null = magicNumber.zero;
	@Input() locationId: number | null = magicNumber.zero;
	@Input() reqLibraryId: number | null = magicNumber.zero;
	@Input() public profRequestDetails: any;
	@Input() public statusId: number;
	@Input() public destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	private requestDetails: any;
	public shiftList: DropdownItem[] = [];
	public shiftDetails: ShiftDetails;
	private locationDetails: LocationDetails | null;
	private reqLibraryDetails: any;
	public weekDaysArray: boolean[];
	public daysInfo: IDayInfo[] = [];
	public timeRange: TimeRange = this.sharedVariablesService.timeRange;
	private lastSelectedDays: any;
	private sectorDetails: any;
	public isRestrictReqToOnePos: boolean = false;
	public isPosDescNonEditable: boolean = false;
	public isSkillReqNonEditable: boolean = false;
	public isExperReqNonEditable: boolean = false;
	public isEduReqNonEditable: boolean = false;

	public isShowDrugField: boolean;
	public isShowBackgroundField: boolean;
	public isEditableDrugField: boolean;
	public isEditableBackgroundField: boolean;

	@Output() targetEndDateChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() shiftChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() positionNeededChange: EventEmitter<number | null> = new EventEmitter<number | null>();
	@Output() shiftDaysChange: EventEmitter<any> = new EventEmitter<any>();

	// eslint-disable-next-line max-params
	constructor(
		private sharedDataService: SharedDataService,
		private shiftService: ShiftGatewayService,
		private lightIndustrialService: LightIndustrialService,
		private contractorDetailsService: ContractorDetailsService,
		private sharedVariablesService: SharedVariablesService,
		private cdr: ChangeDetectorRef,
		private toasterService: ToasterService,
		public localizationService: LocalizationService
	) { }

	ngOnChanges(changes: SimpleChanges) {
		this.handleSectorChange(changes);
		this.handleLocationChange(changes);
		this.handleReqLibraryChange(changes);
		this.handleCopyRequest();
	}

	ngOnInit() {
		this.assignmentRequirementFrom = this.childFormGroup.get('assignmentRequirement') as FormGroup;
		this.getFieldsIds();
		this.getFieldsDetails();
		this.onBoardingConfig();
		this.persistFormValue();
	}

	private getFieldsIds() {
		this.sharedDataService.currentIds$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((ids: ISharedDataIds) => {
			this.sectorId = ids.sectorId;
			this.locationId = ids.locationId;
		});
	}

	private getFieldsDetails() {
		this.sharedDataService.currentFieldDetails$.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((fieldDetails) => {
			this.sectorDetails = fieldDetails.sectorDetails;
			this.locationDetails = fieldDetails.locationDetails;
			this.reqLibraryDetails = fieldDetails.reqLibraryDetails;
		});
	}

	private async persistFormValue() {
		if (this.sharedDataService.assignmentDetailsFormPersist) {
			this.persistFormData();
		} else if (this.isEditMode || this.isDraft || this.isCopyReq) {
			this.getProfRequestDetails();
		} else {
			await this.handleNewFormData();
		}
	}

	private persistFormData() {
		const previousFormData = this.getFlattenedFormData();
		if (this.sharedDataService.fieldOnChange.location.isShiftReset) {
			this.resetLocationDataAndRelatedFields();
			this.updateLocationDetailsBasedData();
		} else {
			this.patchPreviousShift(previousFormData);
		}

		if (this.sharedDataService.fieldOnChange.jobCategory.description) {
			this.resetReqLibraryDataAndRelatedFields();
			this.updateReqLibraryDetailsBasedData();
		} else {
			this.patchPositionNeededField(previousFormData.PositionNeeded);
			this.positionDescriptionConfig();
			this.skillsRequiredConfig();
			this.experienceRequiredConfig();
			this.educationRequiredConfig();
		}
	}

	private getProfRequestDetails() {
		if (this.profRequestDetails) {
			this.requestDetails = flattenObject(this.profRequestDetails);
			this.patchProfRequestDetails(this.requestDetails);
			this.cdr.markForCheck();
		}
	}

	private handleNewFormData() {
		this.tryGetShiftList();
		this.patchPositionNeededField(null);
		this.setOnboardingData();
		this.setPositionDescription();
		this.setSkillsRequired();
		this.setExperienceRequired();
		this.setEducationRequired();
	}

	private getFlattenedFormData() {
		return flattenObject(replaceNestedValueObjects(this.childFormGroup.getRawValue()));
	}

	private patchProfRequestDetails(requestDetails: any): void {
		if (this.isCopyReq) {
			this.patchPreviousShift(requestDetails);
		} else if (this.isDraft) {
			this.patchPreviousShift(requestDetails);
			this.patchTargetStartDate(requestDetails.TargetStartDate);
			this.patchTargetEndDate(requestDetails.TargetEndDate);
			this.targetEndDateChange.emit(this.assignmentRequirementFrom.get('TargetEndDate')?.value);
		} else {
			this.patchTargetStartDate(requestDetails.TargetStartDate);
			this.patchTargetEndDate(requestDetails.TargetEndDate);
			this.targetEndDateChange.emit(this.assignmentRequirementFrom.get('TargetEndDate')?.value);
			this.patchShift(requestDetails);
		}
		this.patchPositionNeededField(requestDetails.PositionNeeded);
		this.patchOnboardingDataField(requestDetails);
		this.patchPositionDescription(requestDetails.PositionDescription);
		this.patchSkillsRequired(requestDetails.SkillsRequired);
		this.patchExperienceRequired(requestDetails.ExperienceRequired);
		this.patchEducationRequired(requestDetails.EducationRequired);
		this.patchOtherDetails(requestDetails);
	}

	private patchShift(requestDetails: any): void {
		const reqIds = {
				secId: requestDetails.SectorId,
				locId: requestDetails.WorkLocationId,
				shiftId: requestDetails.ShiftId
			},
			afterShiftSelectCallback = () => {
				const shift = this.shiftList.find((sft: DropdownItem) =>
					Number(sft.Value) == reqIds.shiftId);
				if (shift) {
					this.assignmentRequirementFrom.patchValue({
						ShiftId: {
							Text: shift.Text,
							Value: (shift.Value).toString()
						}
					});
					this.shiftDetails = this.processShiftData(requestDetails);
					this.patchWeekdayDaysInfoWidget(this.shiftDetails);
					this.getShiftDetails(reqIds.shiftId);
				}
			};
		this.getShiftListWithShiftId(reqIds, afterShiftSelectCallback);
	}

	private getShiftListWithShiftId(reqPayload: IShiftListWithIdPayload, callback: () => void): void {
		this.lightIndustrialService.getShiftDropdownEdit(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.shiftList = data.Data ?? [];
					callback();
				} else {
					this.shiftList = [];
				}
			}
		});
	}

	private patchPositionNeededField(positionNeeded?: number | null) {
		const restrictReqToOnePosition = this.restrictReqToOnePositionConfig(),
			isPreIdentifiedRequest = (this.childFormGroup.get('requestDetails') as FormGroup).controls['IsPreIdentifiedRequest'].value;
		if (isPreIdentifiedRequest || restrictReqToOnePosition) {
			this.assignmentRequirementFrom.controls['PositionNeeded'].setValue(magicNumber.one);
			this.isRestrictReqToOnePos = true;
			this.positionNeededChange.emit(magicNumber.one);
		} else {
			this.assignmentRequirementFrom.controls['PositionNeeded'].patchValue(positionNeeded);
			this.isRestrictReqToOnePos = false;
			this.positionNeededChange.emit(positionNeeded);
		}
	}

	private patchOnboardingDataField(requestDetails: any) {
		const isAltConfig = this.locationDetails?.IsAltDrugandbackgConfigurations,
			source = isAltConfig
				? this.locationDetails
				: this.sectorDetails;
		if (source.IsDrugResultVisible || source.IsBackGroundCheckVisible) {
			this.assignmentRequirementFrom.patchValue({
				IsDrugTestRequired: requestDetails.IsDrugTestRequired,
				IsBackgrounCheckRequired: requestDetails.IsBackgrounCheckRequired
			});
		}
	}

	private patchPositionDescription(positionDescription: string) {
		this.assignmentRequirementFrom.patchValue({
			'PositionDescription': positionDescription
		});
		this.positionDescriptionConfig();
	}

	private patchSkillsRequired(skillsRequired: string) {
		this.assignmentRequirementFrom.patchValue({
			'SkillsRequired': skillsRequired
		});
		this.skillsRequiredConfig();
	}

	private patchExperienceRequired(experienceRequired: string) {
		this.assignmentRequirementFrom.patchValue({
			'ExperienceRequired': experienceRequired
		});
		this.experienceRequiredConfig();
	}

	private patchEducationRequired(educationRequired: string) {
		this.assignmentRequirementFrom.patchValue({
			'EducationRequired': educationRequired
		});
		this.educationRequiredConfig();
	}

	private patchOtherDetails(requestDetails: any): void {
		const controlsToPatch = ['SkillsPreferred', 'ExperiencePreferred', 'EducationPreferred', 'AdditionalInformation'];
		controlsToPatch.forEach(control => {
			if (requestDetails?.[control]) {
				this.assignmentRequirementFrom.controls[control].patchValue(requestDetails[control]);
			}
		});
	}

	private patchTargetStartDate(targetStartDate: Date | null): void {
		if (targetStartDate) {
			this.assignmentRequirementFrom.controls['TargetStartDate'].patchValue(new Date(targetStartDate));
		}
	}

	private patchTargetEndDate(targetEndDate: Date | null): void {
		if (targetEndDate) {
			this.assignmentRequirementFrom.controls['TargetEndDate'].patchValue(new Date(targetEndDate));
		}
	}

	private patchWeekdayDaysInfoWidget(requestDetails: any): void {
		const date = new Date(),
			startTime = new Date(`${date.toDateString()} ${requestDetails.StartTime}`),
			endTime = new Date(`${date.toDateString()} ${requestDetails.EndTime}`);
		this.assignmentRequirementFrom.controls['startTimeControlName'].patchValue(startTime);
		this.assignmentRequirementFrom.controls['endTimeControlName'].patchValue(endTime);
		this.daysInfo = this.lightIndustrialService.generateDaysInfo(requestDetails);
	}

	private tryGetShiftList() {
		if (this.sectorId !== null)
			this.getShiftList(this.sectorId, this.locationId);
	}

	public onPositionNeededChange(positionNeeded: any) {
		this.positionNeededChange.emit(positionNeeded);
	}

	public onStartDateChange(event: Date) {
		if (this.sectorDetails.TenurePolicyApplicable) {
			const endDate = this.contractorDetailsService.addMonthsOrDays(
				event,
				this.sectorDetails.RequisitionTenureLimit,
				this.sectorDetails.TenureLimitType
			);
			this.assignmentRequirementFrom.controls['TargetEndDate'].setValue(endDate);
			this.targetEndDateChange.emit(endDate);
		}
	}


	public onEndDateChange(event: Date) {
		const endDate = this.assignmentRequirementFrom.controls['TargetEndDate'].value;
		this.targetEndDateChange.emit(endDate);
	}

	private patchPreviousShift(previousReqData: any): void {
		const shiftId = previousReqData.ShiftId,
			afterShiftSelectCallback = () => {
				const previousShift = this.shiftList.find((shift: DropdownItem) =>
					Number(shift.Value) == shiftId);
				if (previousShift) {
					this.assignmentRequirementFrom.patchValue({
						ShiftId: {
							Text: previousShift.Text,
							Value: (previousShift.Value).toString()
						}
					});
					this.shiftDetails = this.processShiftData(previousReqData);
					this.patchWeekdayDaysInfoWidget(this.shiftDetails);
					this.getShiftDetails(shiftId);
				} else {
					this.patchSingleDDItemShift();
				}
			};
		if (this.sectorId)
			this.getShiftList(this.sectorId, this.locationId, afterShiftSelectCallback);
	}

	private processShiftData(response: any) {
		return {
			ShiftId: response.ShiftId,
			StartTime: response.StartTime,
			EndTime: response.EndTime,
			Sun: response.Sun,
			Mon: response.Mon,
			Tue: response.Tue,
			Wed: response.Wed,
			Thu: response.Thu,
			Fri: response.Fri,
			Sat: response.Sat,
			ShiftDifferentialMethod: "Others",
			AdderOrMultiplierValue: 0
		};
	}

	private getShiftList(sectorId: number, locationId: number | null, optionalCallback?: () => void): void {
		const reqPayload: IShiftListPayload = {
			"sectorId": sectorId,
			"locationId": locationId
		};
		this.shiftService.getshiftDropdown(reqPayload).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<DropdownItem[]>) => {
				if (data.Succeeded) {
					this.shiftList = data.Data ?? [];
				} else {
					this.shiftList = [];
				}
				if (optionalCallback) {
					optionalCallback();
				} else {
					this.patchSingleDDItemShift();
				}
			}
		});
	}

	private patchSingleDDItemShift(): void {
		if (this.shiftList.length === Number(magicNumber.one)) {
			this.assignmentRequirementFrom.patchValue({
				ShiftId: {
					Text: this.shiftList[magicNumber.zero]?.Text,
					Value: this.shiftList[magicNumber.zero]?.Value
				}
			});
			this.getShiftDetails(Number(this.shiftList[magicNumber.zero].Value));
		}
	}

	public onShiftChange(val: { Value: string } | null): void {
		this.resetShiftDetails();
		if (!val) {
			this.sharedDataService.fieldOnChange.shift.isBillRateReset = true;
			return;
		}
		const shiftId = parseInt(val.Value);
		this.sharedDataService.fieldOnChange.shift.isBillRateReset = true;
		this.getShiftDetails(shiftId);
	}

	private resetShiftDetails(): void {
		this.shiftDetails = DEFAULT_SHIFT_DETAILS;
		this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
		this.assignmentRequirementFrom.controls['startTimeControlName'].reset();
		this.assignmentRequirementFrom.controls['endTimeControlName'].reset();
		this.shiftChange.emit(this.shiftDetails);
	}

	private getShiftDetails(shiftId: number): void {
		this.shiftService.getshiftDetailsData(shiftId).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe({
			next: (data: GenericResponseBase<ShiftDetails>) => {
				if (data.Succeeded && data.Data) {
					const shiftDetailsResponse = data.Data;
					if (this.shiftDetails?.ShiftId) {
						const { ShiftDifferentialMethod, AdderOrMultiplierValue } = shiftDetailsResponse;
						this.shiftDetails = { ...this.shiftDetails, ShiftDifferentialMethod, AdderOrMultiplierValue };
					} else {
						this.shiftDetails = data.Data;
						const date = new Date(),
							startTime = new Date(`${date.toDateString()} ${this.shiftDetails.StartTime}`),
							endTime = new Date(`${date.toDateString()} ${this.shiftDetails.EndTime}`);
						this.assignmentRequirementFrom.controls['startTimeControlName'].patchValue(startTime);
						this.assignmentRequirementFrom.controls['endTimeControlName'].patchValue(endTime);
						this.daysInfo = this.lightIndustrialService.generateDaysInfo(this.shiftDetails);
					}
					this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
					this.sharedDataService.updateShiftDetails(this.shiftDetails);
					this.shiftChange.emit(this.shiftDetails);
					this.cdr.markForCheck();
				} else {
					this.resetShiftDetails();
				}
				this.setRequestShiftFormData();
			}
		});
	}

	public getWeekData(e: any) {
		this.lastSelectedDays = e.day;
		const data = e,
			startTime = this.formatTime(e.time.startTime),
			endTime = this.formatTime(e.time.endTime);
		data.day.forEach((dayData: IDayInfo) => {
			const dayInfo = this.daysInfo.find((info: IDayInfo) =>
				info.day === dayData.day);
			if (dayInfo) {
				dayInfo.isSelected = dayData.isSelected;
			}
		});
		this.shiftDetails = {
			...this.shiftDetails,
			"StartTime": startTime,
			"EndTime": endTime,
			"Sun": e.day[0].isSelected,
			"Mon": e.day[1].isSelected,
			"Tue": e.day[2].isSelected,
			"Wed": e.day[3].isSelected,
			"Thu": e.day[4].isSelected,
			"Fri": e.day[5].isSelected,
			"Sat": e.day[6].isSelected
		};
		this.weekDaysArray = this.lightIndustrialService.formatWeekData(this.shiftDetails);
		this.setRequestShiftFormData();
		this.sharedDataService.updateShiftDetails(this.shiftDetails);
		this.sharedDataService.fieldOnChange.shift.estimatedCost = true;
		this.shiftDaysChange.emit(this.weekDaysArray);
	}

	public getStatus(daysInfo: IDayInfo[]) {
		if (daysInfo) {
			if (this.isEditMode) {
				const previousFormData = this.getFlattenedFormData();
				this.daysInfo = this.lightIndustrialService.generateDaysInfo(previousFormData);
			} else {
				this.daysInfo = this.lightIndustrialService.generateDaysInfo(this.shiftDetails);
			}
			const date = new Date(),
				startTime = new Date(`${date.toDateString()} ${this.shiftDetails.StartTime}`),
				endTime = new Date(`${date.toDateString()} ${this.shiftDetails.EndTime}`);
			this.assignmentRequirementFrom.controls['startTimeControlName'].patchValue(startTime);
			this.assignmentRequirementFrom.controls['endTimeControlName'].patchValue(endTime);
			this.setRequestShiftFormData();
		}
	}
	private setRequestShiftFormData() {
		this.assignmentRequirementFrom.patchValue({
			"Sun": this.shiftDetails.Sun,
			"Mon": this.shiftDetails.Mon,
			"Tue": this.shiftDetails.Tue,
			"Wed": this.shiftDetails.Wed,
			"Thu": this.shiftDetails.Thu,
			"Fri": this.shiftDetails.Fri,
			"Sat": this.shiftDetails.Sat,
			"StartTime": this.shiftDetails.StartTime,
			"EndTime": this.shiftDetails.EndTime
		});
	}

	private restrictReqToOnePositionConfig() {
		return this.sectorDetails?.RestrictReqToOnePos;
	}

	private onBoardingConfig() {
		if (!this.sectorDetails && !this.locationDetails) {
			return;
		}
		const isAltConfig = this.locationDetails?.IsAltDrugandbackgConfigurations ?? false,
			source = isAltConfig
				? this.locationDetails
				: this.sectorDetails;
		this.isShowDrugField = source.IsDrugResultVisible;
		this.isShowBackgroundField = source.IsBackGroundCheckVisible;
		this.isEditableDrugField = source.IsDrugScreenItemEditable;
		this.isEditableBackgroundField = source.IsBackGroundItemEditable;
	}

	private setOnboardingData(): void {
		const isAltConfig = this.locationDetails?.IsAltDrugandbackgConfigurations,
			source = isAltConfig
				? this.locationDetails
				: this.sectorDetails;
		if (source.IsDrugResultVisible || source.IsBackGroundCheckVisible) {
			this.assignmentRequirementFrom.patchValue({
				IsDrugTestRequired: source.DefaultDrugResultValue,
				IsBackgrounCheckRequired: source.DefaultBackGroundCheckValue
			});
		}
	}

	private setPositionDescription() {
		if (!this.sectorDetails && !this.reqLibraryDetails) {
			return;
		}
		this.assignmentRequirementFrom.patchValue({
			'PositionDescription': this.reqLibraryDetails.PositionDesc
		});
		this.positionDescriptionConfig();
	}

	private positionDescriptionConfig() {
		if (!this.sectorDetails.IsPositionDetailsEditable && (this.reqLibraryDetails.PositionDesc != undefined && this.reqLibraryDetails.PositionDesc != '')) {
			this.isPosDescNonEditable = true;
		}
	}

	private setSkillsRequired() {
		if (!this.sectorDetails && !this.reqLibraryDetails) {
			return;
		}
		this.assignmentRequirementFrom.patchValue({
			'SkillsRequired': this.reqLibraryDetails.SkillRequired
		});
		this.skillsRequiredConfig();
	}
	private skillsRequiredConfig() {
		if (!this.sectorDetails.IsPositionDetailsEditable && (this.reqLibraryDetails.SkillRequired != undefined && this.reqLibraryDetails.SkillRequired != '')) {
			this.isSkillReqNonEditable = true;
		}
	}

	private setExperienceRequired() {
		if (!this.sectorDetails && !this.reqLibraryDetails) {
			return;
		}
		this.assignmentRequirementFrom.patchValue({
			'ExperienceRequired': this.reqLibraryDetails.ExperienceRequired
		});
		this.experienceRequiredConfig();
	}
	private experienceRequiredConfig() {
		if (!this.sectorDetails.IsPositionDetailsEditable && (this.reqLibraryDetails.ExperienceRequired != undefined && this.reqLibraryDetails.ExperienceRequired != '')) {
			this.isExperReqNonEditable = true;
		}
	}

	private setEducationRequired() {
		if (!this.sectorDetails && !this.reqLibraryDetails) {
			return;
		}
		this.assignmentRequirementFrom.patchValue({
			'EducationRequired': this.reqLibraryDetails.EducationRequired
		});
		this.educationRequiredConfig();
	}
	private educationRequiredConfig() {
		if (!this.sectorDetails.IsPositionDetailsEditable && (this.reqLibraryDetails.EducationRequired != undefined && this.reqLibraryDetails.EducationRequired != '')) {
			this.isEduReqNonEditable = true;
		}
	}

	private formatTime(timeValue: string): string {
		const timeDate = new Date(timeValue),
			hours = timeDate.getHours().toString().padStart(2, '0'),
			minutes = timeDate.getMinutes().toString().padStart(2, '0'),
			seconds = timeDate.getSeconds().toString().padStart(2, '0');
		return `${hours}:${minutes}:${seconds}`;
	}

	public validateAll() {
		return this.startDateValidation() &&
			this.startAndEndTimeAreDifferent() &&
			this.validateStartDate() &&
			this.validateTenureLimit() &&
			this.allShiftDaysAreSelected();
	}

	private startDateValidation(): boolean {
		const validationErrors = this.comparisonStartAndInitialDate(this.assignmentRequirementFrom);
		if (validationErrors) {
			this.assignmentRequirementFrom.get('TargetStartDate')?.setErrors(validationErrors);
			return false;
		} else {
			this.assignmentRequirementFrom.get('TargetStartDate')?.setErrors(null);
			return true;
		}
	}

	private comparisonStartAndInitialDate(formGroup: AbstractControl): ValidationErrors | null {
		const startDate = formGroup.get('TargetStartDate')?.value,
			initialGoLiveDate = this.sectorDetails.InitialGoLiveDate;
		if (startDate && initialGoLiveDate && new Date(startDate) < new Date(initialGoLiveDate)) {
			this.toasterService.showToaster(ToastOptions.Error, 'StartDatevalidation', [{ Value: 'StartDate', IsLocalizeKey: true }, { Value: 'InitialGoLiveDate', IsLocalizeKey: true }]);
			return { incorrect: true };
		}
		return null;
	}

	private startAndEndTimeAreDifferent(): boolean {
		const startTime = this.formatTime(this.assignmentRequirementFrom.controls['startTimeControlName'].value),
			endTime = this.formatTime(this.assignmentRequirementFrom.controls['endTimeControlName'].value);

		if (startTime === endTime) {
			this.toasterService.showToaster(ToastOptions.Error, 'ShiftTimeValidation');
			return false;
		}
		return true;
	}

	private allShiftDaysAreSelected(): boolean {
		if (this.daysInfo.every((day: { isSelected: boolean; }) =>
			!day.isSelected)) {
			this.toasterService.showToaster(ToastOptions.Error, 'ShiftDayValidationMsg');
			return false;
		}
		return true;
	}

	private validateStartDate() {
		const startDate = new Date(this.assignmentRequirementFrom.controls['TargetStartDate'].value),
			endTDate = new Date(this.assignmentRequirementFrom.controls['TargetEndDate'].value);
		if (startDate > endTDate) {
			this.toasterService.showToaster(ToastOptions.Error, 'Target Start Date cannot be greater than Target End Date.');
			return false;
		}
		return true;
	}

	private validateTenureLimit() {
		const startDate = new Date(this.assignmentRequirementFrom.controls['TargetStartDate'].value),
			endDate = new Date(this.assignmentRequirementFrom.controls['TargetEndDate'].value),
			maxTargetEndDate = this.contractorDetailsService.addMonthsOrDays(
				startDate,
				this.sectorDetails.RequisitionTenureLimit,
				this.sectorDetails.TenureLimitType
			);
		if (this.sectorDetails.TenurePolicyApplicable && maxTargetEndDate && endDate && new Date(maxTargetEndDate) < new Date(endDate)) {
			this.toasterService.showToaster(ToastOptions.Error, this.getTenureViolationValidationMessage());
			return false;
		}
		return true;
	}

	private getTenureViolationValidationMessage() {
		const requsitionTenure = (this.sectorDetails.RequisitionTenureLimit === undefined ||
			this.sectorDetails.RequisitionTenureLimit === null ||
			this.sectorDetails.RequisitionTenureLimit === magicNumber.zero)
				? magicNumber.zero
				: this.sectorDetails.RequisitionTenureLimit,
			tenureTypeLabel = (this.sectorDetails.TenureLimitType == TenureLimitTypes.Hours)
				? 'Hour'
				: 'Month',
			localizeRequsitionTenure: DynamicParam[] = [
				{ Value: requsitionTenure.toString(), IsLocalizeKey: false },
				{ Value: tenureTypeLabel, IsLocalizeKey: true }
			];
		return this.localizationService.GetLocalizeMessage('TenureViolationValidation', localizeRequsitionTenure);
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
		this.assignmentRequirementFrom.controls['TargetStartDate'].reset();
		this.assignmentRequirementFrom.controls['TargetEndDate'].reset();
		this.assignmentRequirementFrom.controls['PositionNeeded'].reset();
		this.isRestrictReqToOnePos = false;
		this.resetShiftData();
		this.resetPositionDetailsFields();
		this.isShowDrugField = false;
		this.isShowBackgroundField = false;
		this.isEditableDrugField = false;
		this.isEditableBackgroundField = false;
		this.toasterService.resetToaster();
	}

	private getOtherFieldsListOnSectorSelect(sectorId: number) {
		this.onBoardingConfig();
		this.handleNewFormData();
	}

	private resetShiftData(): void {
		this.shiftList = [];
		this.assignmentRequirementFrom.controls['ShiftId'].reset();
		this.resetShiftDetails();
	}

	private handleLocationChange(changes: SimpleChanges) {
		if (changes['locationId'] && !changes['locationId'].firstChange) {
			const newLocationId = changes['locationId'].currentValue,
				locationDetails$ = newLocationId
					? this.sharedDataService.currentFieldDetails$.pipe(
						takeUntil(this.destroyAllSubscriptions$),
						filter((fieldDetails: any) =>
							Boolean(fieldDetails.locationDetails)),
						map((fieldDetails: any) =>
							({
								locationDetails: fieldDetails.locationDetails
							})),
						take(magicNumber.one)
					)
					: of({ sectorDetails: null, locationDetails: null, reqLibraryDetails: null });

			locationDetails$.subscribe((fieldDetails: any) => {
				// this.sectorDetails = fieldDetails.sectorDetails;
				this.locationDetails = fieldDetails.locationDetails;
				// this.reqLibraryDetails = fieldDetails.reqLibraryDetails;
				this.onLocationChange(newLocationId);
			});
		}
	}

	private onLocationChange(val: string | null): void {
		if (!val) {
			this.resetLocationDataAndRelatedFields();
			this.tryGetShiftList();
			return;
		}
		this.resetLocationDataAndRelatedFields();
		this.updateLocationDetailsBasedData();
	}

	private resetLocationDataAndRelatedFields(): void {
		this.resetShiftData();
		this.resetPositionDetailsFields();
	}

	private updateLocationDetailsBasedData(): void {
		this.onBoardingConfig();
		this.tryGetShiftList();
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
								reqLibraryDetails: fieldDetails.reqLibraryDetails
							})),
						take(magicNumber.one)
					)
					: of({ sectorDetails: null, locationDetails: null, reqLibraryDetails: null });

			reqLibraryDetails$.subscribe((fieldDetails: any) => {
				this.reqLibraryDetails = fieldDetails.reqLibraryDetails;
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
		this.resetPositionDetailsFields();
	}

	private resetPositionDetailsFields() {
		this.assignmentRequirementFrom.controls['PositionDescription'].reset();
		this.assignmentRequirementFrom.controls['SkillsRequired'].reset();
		this.assignmentRequirementFrom.controls['ExperienceRequired'].reset();
		this.assignmentRequirementFrom.controls['EducationRequired'].reset();
		this.assignmentRequirementFrom.controls['SkillsPreferred'].reset();
		this.assignmentRequirementFrom.controls['ExperiencePreferred'].reset();
		this.assignmentRequirementFrom.controls['EducationPreferred'].reset();
		this.assignmentRequirementFrom.controls['AdditionalInformation'].reset();
		this.isPosDescNonEditable = false;
		this.isSkillReqNonEditable = false;
		this.isExperReqNonEditable = false;
		this.isEduReqNonEditable = false;
	}

	private updateReqLibraryDetailsBasedData() {
		this.setPositionDescription();
		this.setSkillsRequired();
		this.setExperienceRequired();
		this.setEducationRequired();
	}

	private handleCopyRequest() {
		this.getProfRequestDetails();
	}

	ngOnDestroy() {
		this.sharedDataService.assignmentDetailsFormPersist = true;
		this.sharedDataService.fieldOnChange.jobCategory.description = false;
		this.sharedDataService.fieldOnChange.location.isShiftReset = false;
	}

}
