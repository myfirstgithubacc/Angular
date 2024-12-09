import { FormControl, FormGroup } from "@angular/forms";
import { IDropdown } from "@xrm-shared/models/common.model";
import { SectorXrmTimeClock } from "@xrm-core/models/Sector/sector-xrm-time-clock.model";
import { getCommonSectionFormModel, ICommonSectionFM } from "@xrm-master/sector/common/CommonSectionModel";
import { XrmUseEmployeeTimeClocks } from "@xrm-shared/services/common-constants/static-data.enum";
import { IsXrmTimeClockRequiredValidations } from "./Xrm-time-clock-DependentValidations";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

export interface IXrmTimeClockDetailsFM extends ICommonSectionFM {
	IsXrmTimeClockRequired: FormControl<boolean | null>;
	IsDailyPunchApprovalNeeded: FormControl<boolean>;
	IsAutoLunchDeduction: FormControl<boolean>;
	LunchTimeDeducted: FormControl<number | null>;
	MinimumHourWorkedBeforeLunchDeduction: FormControl<number | null>;
	IsAllowManagerAdjustPunchInOut: FormControl<boolean>;
	EffectiveDateForLunchConfiguration: FormControl<Date | null>;
	AccrueHoursFromActualPunchIn: FormControl<boolean>;
	IsAllowManualCharge: FormControl<boolean>;
	IsAllowManualShift: FormControl<boolean>;
	IsAllowManualJobCategory: FormControl<boolean>;
	XrmUseEmployeeIdTimeClockId: FormControl<string>;
	IsPunchRoundingNeeded: FormControl<boolean>;
	PunchInTimeIncrementRounding: FormControl<IDropdown | null>;
	PunchOutTimeIncrementRounding: FormControl<IDropdown | null>;
	PunchInTimeRounding: FormControl<IDropdown | null>;
	PunchOutTimeRounding: FormControl<IDropdown | null>;
	ClockBufferForReportingDate: FormControl<Date | null>;
	ClockBufferForShiftStart: FormControl<Date | null>;
}

export function getXrmTimeClockDetailsFormModel(customValidators: CustomValidators) {
	return new FormGroup<IXrmTimeClockDetailsFM>({
		...getCommonSectionFormModel(),
		'IsXrmTimeClockRequired': new FormControl<boolean | null>(false, IsXrmTimeClockRequiredValidations(customValidators)),
		'IsDailyPunchApprovalNeeded': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAutoLunchDeduction': new FormControl<boolean>(false, { nonNullable: true }),
		'LunchTimeDeducted': new FormControl<number | null>(null),
		'MinimumHourWorkedBeforeLunchDeduction': new FormControl<number | null>(null),
		'IsAllowManagerAdjustPunchInOut': new FormControl<boolean>(false, { nonNullable: true }),
		'EffectiveDateForLunchConfiguration': new FormControl<Date | null>(null),
		'AccrueHoursFromActualPunchIn': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAllowManualCharge': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAllowManualShift': new FormControl<boolean>(false, { nonNullable: true }),
		'IsAllowManualJobCategory': new FormControl<boolean>(false, { nonNullable: true }),
		'XrmUseEmployeeIdTimeClockId': new FormControl<string>(XrmUseEmployeeTimeClocks['Employee Id'].toString(), { nonNullable: true }),
		'IsPunchRoundingNeeded': new FormControl<boolean>(false, { nonNullable: true }),
		'PunchInTimeIncrementRounding': new FormControl<IDropdown | null>(null),
		'PunchOutTimeIncrementRounding': new FormControl<IDropdown | null>(null),
		'PunchInTimeRounding': new FormControl<IDropdown | null>(null),
		'PunchOutTimeRounding': new FormControl<IDropdown | null>(null),
		'ClockBufferForReportingDate': new FormControl<Date | null>(null),
		'ClockBufferForShiftStart': new FormControl<Date | null>(null)
	});
}

export function patchXrmTimeClockDetails(XrmTimeClockDetailsData: SectorXrmTimeClock, formGroup: FormGroup<IXrmTimeClockDetailsFM>) {
	formGroup.patchValue({
		'IsXrmTimeClockRequired': XrmTimeClockDetailsData.IsXrmTimeClockRequired,
		'IsDailyPunchApprovalNeeded': XrmTimeClockDetailsData.IsDailyPunchApprovalNeeded,
		'IsAutoLunchDeduction': XrmTimeClockDetailsData.IsAutoLunchDeduction,
		'LunchTimeDeducted': XrmTimeClockDetailsData.LunchTimeDeducted,
		'MinimumHourWorkedBeforeLunchDeduction': XrmTimeClockDetailsData.MinimumHourWorkedBeforeLunchDeduction,
		'EffectiveDateForLunchConfiguration':
			(XrmTimeClockDetailsData.EffectiveDateForLunchConfiguration === null) ?
				XrmTimeClockDetailsData.EffectiveDateForLunchConfiguration :
				new Date(XrmTimeClockDetailsData.EffectiveDateForLunchConfiguration ?? ''),
		'IsPunchRoundingNeeded': XrmTimeClockDetailsData.IsPunchRoundingNeeded,
		'PunchInTimeIncrementRounding': { 'Text': XrmTimeClockDetailsData.PunchInTimeIncrementRoundingName ?? '', 'Value': XrmTimeClockDetailsData.PunchInTimeIncrementRounding?.toString() ?? ''},
		'PunchOutTimeIncrementRounding': { 'Text': XrmTimeClockDetailsData.PunchOutTimeIncrementRoundingName ?? '', 'Value': XrmTimeClockDetailsData.PunchOutTimeIncrementRounding?.toString() ?? ''},
		'PunchInTimeRounding': { 'Text': XrmTimeClockDetailsData.PunchInTimeRoundingName ?? '', 'Value': XrmTimeClockDetailsData.PunchInTimeRounding?.toString() ?? '' },
		'PunchOutTimeRounding': { 'Text': XrmTimeClockDetailsData.PunchOutTimeRoundingName ?? '', 'Value': XrmTimeClockDetailsData.PunchOutTimeRounding?.toString() ?? '' },
		'IsAllowManagerAdjustPunchInOut': XrmTimeClockDetailsData.IsAllowManagerAdjustPunchInOut,
		'AccrueHoursFromActualPunchIn': XrmTimeClockDetailsData.AccrueHoursFromActualPunchIn,
		'IsAllowManualCharge': XrmTimeClockDetailsData.IsAllowManualCharge,
		'IsAllowManualShift': XrmTimeClockDetailsData.IsAllowManualShift,
		'IsAllowManualJobCategory': XrmTimeClockDetailsData.IsAllowManualJobCategory,
		'XrmUseEmployeeIdTimeClockId': XrmTimeClockDetailsData.XrmUseEmployeeIdTimeClockId?.toString() ?? XrmUseEmployeeTimeClocks['Employee Id'].toString(),
		'ClockBufferForReportingDate': (XrmTimeClockDetailsData.ClockBufferForReportingDate !== null)
			? new Date(`4/5/2023 ${XrmTimeClockDetailsData.ClockBufferForReportingDate}`)
			: XrmTimeClockDetailsData.ClockBufferForReportingDate,
		'ClockBufferForShiftStart': (XrmTimeClockDetailsData.ClockBufferForShiftStart !== null)
			? new Date(`4/5/2023 ${XrmTimeClockDetailsData.ClockBufferForShiftStart}`)
			: XrmTimeClockDetailsData.ClockBufferForShiftStart,
		'SectorId': XrmTimeClockDetailsData.SectorId,
		'SectorUkey': XrmTimeClockDetailsData.SectorUkey,
		'StatusCode': XrmTimeClockDetailsData.StatusCode
	}, { emitEvent: false, onlySelf: true });
}

