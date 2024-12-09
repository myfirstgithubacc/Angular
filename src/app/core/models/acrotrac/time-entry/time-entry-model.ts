import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { TimeEntryDetailGrid } from "./add-edit/time-entry-grid";
type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
type nullableDate = Date | undefined | null;

export class TimeSheetList extends ToJson{
	Id: nullableNumber;
	UKey: nullableString;
	TimeEntryCode: nullableString;
	SectorName: nullableString;
	ContractorName: nullableString;
	AssignmentId: nullableString;
	ContractorId: nullableString;
	ApproverAuthority: nullableString;
	RecordType: nullableString;
	StHours: nullableNumber;
	OtHours: nullableNumber;
	DtHours: nullableNumber;
	TotalHours: nullableNumber;
	StatusName: nullableString;
	Status: nullableString;
	ContractorWorkLocation: nullableString;
	CreatedBy: nullableString;
	CreatedDate: nullableDate;
	LastModifiedBy: nullableString;
	LastModifiedDate: nullableDate;
	StatusId: nullableNumber;
	WeekendingDate: nullableDate;
	TimeEntryDetails:TimeEntryDetailGrid[];
	UnitTypeId: nullableNumber;
	UnitTypeName: nullableString;
	ContractorComments: nullableString;
	ReviewerComment: nullableString;
	constructor(init?: Partial<TimeSheetList>){
		super();
		Object.assign(this, init);
	}
}
