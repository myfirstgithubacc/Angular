import { IDropdown } from "@xrm-shared/models/common.model";
import { AssignmentDetailsData } from "../expense-entry/add-edit/assignment-details";

export interface FilterSideBar {
	'AssignmentDetails': AssignmentDetailsData;
	'WeekendingDate': IDropdown;
	'WeekendingList': IDropdown[];
}
