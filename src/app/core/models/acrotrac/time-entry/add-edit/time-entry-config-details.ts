import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";
import { DropdownModel } from "@xrm-shared/models/common.model";

export interface TimeEntryConfigDetails extends ToJson {
	AssignmentId: number;
	WeekendingDate: string;
};

export interface DropdownChangeEvent {
  selectedWeekending: DropdownModel;
  path: string;
}

