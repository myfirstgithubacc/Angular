
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { TimeEntryDetailGrid } from "@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid";
import { ITimeEntryDetailFormModel } from "@xrm-core/models/acrotrac/time-entry/add-edit/time-entry-grid-details";
import { IDropdown } from "@xrm-shared/models/common.model";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";
import { EntrySource, UnitType } from "src/app/modules/acrotrac/common/enum-constants/enum-constants";
import { timeSheetStatusIds } from "src/app/modules/acrotrac/expense/expense/enum-constants/enum-constants";
type dropdownStringNullable = IDropdown | string | null;
export interface IAddEditTimeFormModel {
	'WeekendingDate': FormControl<dropdownStringNullable>;
	'StatusId': FormControl<number>;
	'AssignmentId': FormControl<number | null>;
	"EntrySourceId": FormControl<number>;
	"UnitTypeId": FormControl<number>;
	'ContractorComments': FormControl<string | null>;
	'ReviewerComment': FormControl<[{
		'ReviewedOnDate': string;
		'ApproverLabel': string;
		'ApproverComments': string;
	}] | null>;
	"TimeEntryDetails": FormArray<FormGroup<ITimeEntryDetailFormModel>>;
}

export interface AddEditTime {
	'WeekendingDate': dropdownStringNullable;
	'StatusId': number;
	'AssignmentId': number | null;
	"EntrySourceId": number;
	"UnitTypeId": number;
	'ContractorComments': string | null;
	'ReviewerComment': [{
		'ReviewedOnDate': string;
		'ApproverLabel': string;
		'ApproverComments': string;
	}] | null;
	"TimeEntryDetails": TimeEntryDetailGrid[];
	"timeInOutDetails":[];
}

export function getAddEditTimeEntryFormModel(customValidations: CustomValidators) {
	return new FormGroup<IAddEditTimeFormModel>({
		'WeekendingDate': new FormControl<dropdownStringNullable>(null, customValidations.requiredValidationsWithMessage('PleaseSelectData', 'WeekendingDate')),
		'StatusId': new FormControl<number>(timeSheetStatusIds.Submitted, {nonNullable: true}),
		'AssignmentId': new FormControl<number | null>(magicNumber.zero),
		"EntrySourceId": new FormControl<number>(EntrySource.Web, {nonNullable: true}),
		"UnitTypeId": new FormControl<number>(UnitType.Hour, {nonNullable: true}),
		'ContractorComments': new FormControl<string | null>(null),
		'ReviewerComment': new FormControl<[{
			'ReviewedOnDate': string;
			'ApproverLabel': string;
			'ApproverComments': string;
		}] | null>(null),
		"TimeEntryDetails": new FormArray<FormGroup<ITimeEntryDetailFormModel>>([])
	});
}
