import { ɵFormGroupRawValue, ɵTypedOrUntyped } from '@angular/forms';
import { ITimeAndExpenseConfigFM } from '@xrm-master/sector/add-edit/time-and-expense-configurations/utils/helper';
import { CommonSection } from '@xrm-master/sector/common/CommonSectionModel';

type nullableString = string | undefined | null;
export class SectorTimeAndExpenseConfiguration extends CommonSection {
	IsClpJobRotationAllowed: boolean;
	IsAllowedClpToAddCharge: boolean;
	TimeUploadAsApprovedHours: boolean;
	IsAutoApprovedAdjustment: boolean;
	IsAllTimeAdjustmentApprovalRequired: boolean;
	AllowTimeUploadWithStOtDt: boolean;
	ValidateApprovedAmountWithTimeRecords: boolean;
	AllowStaffingAgencyInTandEApproval: boolean;
	IsPoSentToPm: boolean;
	IsPoSentToPoOwner: boolean;
	PoType: string;
	PoTypeName: string;
	DefaultPoForRecruitment: nullableString;
	DefaultPoForPayroll: nullableString;
	NoConsecutiveWeekMissingEntry: nullableString;
	NoConsecutiveWeekMissingEntryName: nullableString;
	DefaultPoDepletionForNewLocations: nullableString;

	constructor(init?: Partial<ɵTypedOrUntyped<ITimeAndExpenseConfigFM, ɵFormGroupRawValue<ITimeAndExpenseConfigFM>, any>>) {
		super();

		this.NoConsecutiveWeekMissingEntry = init?.NoConsecutiveWeekMissingEntry?.Value;
		this.NoConsecutiveWeekMissingEntryName = init?.NoConsecutiveWeekMissingEntry?.Text;
		Object.assign(this, init);
	}
}
