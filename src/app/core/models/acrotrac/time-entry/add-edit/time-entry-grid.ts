import { IDropdown } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export class TimeEntryDetailGrid {
	Id: number;
	CostAccountingCodeId: IDropdown | string;
	CostAccountingCodeName: string;
	ShiftId: IDropdown | string;
	ShiftName: string;
	JobTitle: string;
	StatusId: number;
	HoursTypeId: IDropdown | string| null;
	HoursTypeName: string|null;
	Sunday: number;
	Monday: number;
	Tuesday: number;
	Wednesday: number;
	Thursday: number;
	Friday: number;
	PreFriday: number;
	Saturday: number;
	TotalHour: number | null;
	SundayDisable: boolean;
	MondayDisable: boolean;
	TuesdayDisable: boolean;
	WednesdayDisable: boolean;
	ThursdayDisable: boolean;
	FridayDisable: boolean;
	PreFridayDisable: boolean;
	SaturdayDisable: boolean;
	InlineViewDisabled:boolean;
	// Index signature
	[key: string]: any;

	constructor(init?: Partial<TimeEntryDetailGrid>) {
		this.Id = 0;
		if (typeof init?.CostAccountingCodeId !== 'string' && init?.CostAccountingCodeId?.Value) {
			this.CostAccountingCodeName = init.CostAccountingCodeId.Text;
			init.CostAccountingCodeId = init.CostAccountingCodeId.Value;
		}

		if (typeof init?.ShiftId !== 'string' && init?.ShiftId?.Value) {
			this.ShiftName = init.ShiftId.Text;
			init.ShiftId = init.ShiftId.Value;
		}

		this.JobTitle = init?.JobTitle ?? '';
		this.StatusId = init?.StatusId ?? magicNumber.zero;

		if (typeof init?.HoursTypeId !== 'string' && init?.HoursTypeId?.Value) {
			this.HoursTypeName = init.HoursTypeId.Text;
			init.HoursTypeId = init.HoursTypeId.Value;
		}

		this.Sunday = 0;
		this.Monday = 0;
		this.Tuesday = 0;
		this.Wednesday = 0;
		this.Thursday = 0;
		this.Friday = 0;
		this.Saturday = 0;
		this.TotalHour = 0.00;
		this.MondayDisable = false;

		Object.assign(this, init);
	}
}
