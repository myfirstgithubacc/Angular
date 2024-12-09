import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';
import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { IXrmTimeClockDetailsFM } from '@xrm-master/sector/add-edit/xrm-time-clock/utils/helper';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
export class SectorXrmTimeClock extends CommonSection {
	EffectiveDateForLunchConfiguration: nullableString;
	IsXrmTimeClockRequired: boolean;
	IsDailyPunchApprovalNeeded: boolean;
	IsAutoLunchDeduction: boolean;
	IsAllowManagerAdjustPunchInOut: boolean;
	MinimumHourWorkedBeforeLunchDeduction: nullableNumber;
	LunchTimeDeducted: nullableNumber;
	IsPunchRoundingNeeded: boolean;
	AccrueHoursFromActualPunchIn: boolean;
	PunchInTimeRounding: nullableString;
	PunchInTimeRoundingName: nullableString;
	PunchOutTimeRounding: nullableString;
	PunchOutTimeRoundingName: nullableString;
	PunchInTimeIncrementRounding: nullableNumber;
	PunchInTimeIncrementRoundingName: nullableString;
	PunchOutTimeIncrementRounding: nullableNumber;
	PunchOutTimeIncrementRoundingName: nullableString;
	XrmUseEmployeeIdTimeClockId: nullableString;
	XrmUseEmployeeTimeClockName: nullableString;
	ClockBufferForReportingDate: nullableString;
	ClockBufferForShiftStart: nullableString;
	IsAllowManualCharge: boolean;
	IsAllowManualShift: boolean;
	IsAllowManualJobCategory: boolean;

	constructor(init?: Partial<ɵTypedOrUntyped<IXrmTimeClockDetailsFM, ɵFormGroupRawValue<IXrmTimeClockDetailsFM>, any>>) {
		super();

		if(init?.IsXrmTimeClockRequired && init.PunchInTimeRounding){
			this.PunchInTimeRounding = init.PunchInTimeRounding.Value;
			this.PunchInTimeRoundingName = init.PunchInTimeRounding.Text;

			this.PunchOutTimeRounding = init.PunchOutTimeRounding?.Value;
			this.PunchOutTimeRoundingName = init.PunchOutTimeRounding?.Text;

			this.PunchInTimeIncrementRounding = Number(init.PunchInTimeIncrementRounding?.Value);
			this.PunchInTimeIncrementRoundingName = init.PunchInTimeIncrementRounding?.Text;

			this.PunchOutTimeIncrementRounding = Number(init.PunchOutTimeIncrementRounding?.Value);
			this.PunchOutTimeIncrementRoundingName = init.PunchOutTimeIncrementRounding?.Text;
		}
		Object.assign(this, init);
	}
}
