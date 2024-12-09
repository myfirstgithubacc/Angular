import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { TimeEntryDetailGrid } from "./time-entry-grid";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { AddEditTime } from "src/app/modules/acrotrac/Time/timesheet/add-edit/utils/formModel";
import { DropdownModel, IDropdown } from "@xrm-shared/models/common.model";
import { TotalHours } from "../../time-adjustment/adjustment-interface";

export class TimeEntryAddEdit extends ToJson {
	TimeEntryCode:string;
	Id: number;
	UKey:string;
	StatusId: number;
	WeekendingDate: IDropdown | string | null;
	AssignmentId: string | null | undefined;
	AssignmentName: string;
	ContractorName: string;
	StatusName: string;
	EntrySourceId: number;
	UnitTypeId: number;
	ReviewerComment:[{
		ReviewedOnDate: string;
		ApproverLabel: string;
		ApproverComments: string;
	}];
	ContractorComments:string;
	TimeEntryDetails: any[];
	InOutDetails: TotalHours;
	Screen?:string;
	AssignmentCode?: string;
	EntityId?:number;
	IsPendingApproval: boolean;
	TimeInOutDetails:[];

	constructor(init?: Partial<AddEditTime>) {
		super();
		if (typeof init?.WeekendingDate !== 'string' && init?.WeekendingDate?.Value) {
			init.WeekendingDate = init.WeekendingDate.Value;
		}
		this.nullToZeroCheckEveryDay(init?.TimeEntryDetails);
		Object.assign(this, init);
	}

	nullToZeroCheckEveryDay(weekDays:any[] | undefined) {
		if (weekDays) {
			weekDays.forEach((day) => {
				day.Sunday = day.Sunday || magicNumber.zero;
				day.Monday = day.Monday || magicNumber.zero;
				day.Tuesday = day.Tuesday || magicNumber.zero;
				day.Wednesday = day.Wednesday || magicNumber.zero;
				day.Thursday = day.Thursday || magicNumber.zero;
				day.Friday = day.Friday || magicNumber.zero;
				day.PreFriday = day.PreFriday || magicNumber.zero;
				day.Saturday = day.Saturday || magicNumber.zero;
			});
		}
	}

	hourTypeIdNull(TimeEntryDetails: TimeEntryDetailGrid[], manualOtDt:boolean, recordId:number) {
		TimeEntryDetails.forEach((item) => {
			item['TimeEntryId'] = recordId;
			if (!manualOtDt)
				item.HoursTypeId = null;
		});
	}

}


export class TimeAdjustmentAddEdit extends ToJson {
	TimeEntryCode:string;
	Id: number;
	UKey:string;
	StatusId: number;
	WeekendingDate: DropdownModel | string | null | undefined;
	AssignmentId: string | null | undefined;
	AssignmentName: string;
	ContractorName:string;
	StatusName:string;
	EntrySourceId: number;
	UnitTypeId: number;
	ReviewerComment:string;
	ContractorComment:string;
	ContractorComments: string;
	TimeAdjustmentDetails: TimeEntryDetailGrid[];

	constructor(init?: Partial<TimeEntryAddEdit>) {
		super();
		if (typeof init?.WeekendingDate !== 'string' && init?.WeekendingDate?.Value) {
			init.WeekendingDate = init.WeekendingDate.Value;
		}
		this.nullToZeroCheckEveryDay(init?.TimeEntryDetails);
		Object.assign(this, init);
	}

	nullToZeroCheckEveryDay(weekDays:TimeEntryDetailGrid[] | undefined) {
		if (weekDays) {
			weekDays.forEach((day) => {
				day.Sunday = day.Sunday || magicNumber.zero;
				day.Monday = day.Monday || magicNumber.zero;
				day.Tuesday = day.Tuesday || magicNumber.zero;
				day.Wednesday = day.Wednesday || magicNumber.zero;
				day.Thursday = day.Thursday || magicNumber.zero;
				day.Friday = day.Friday || magicNumber.zero;
				day.PreFriday = day.PreFriday || magicNumber.zero;
				day.Saturday = day.Saturday || magicNumber.zero;
			});
		}
	}

	hourTypeIdNull(TimeEntryDetails: TimeEntryDetailGrid[], manualOtDt:boolean, recordId:number) {
		TimeEntryDetails.forEach((item) => {
			item['TimeOrAdjustmentEntryId'] = recordId;
			if (!manualOtDt)
				item.HoursTypeId = null;
		});
	}

}
