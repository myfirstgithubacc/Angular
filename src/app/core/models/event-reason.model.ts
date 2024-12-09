import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { ToJson } from './responseTypes/to-json.model';
type nullableString = string | undefined | null;
type nullableNumber = number | undefined | null;
type nullableDate = Date | undefined | null;

export class EventReason extends ToJson {

	Id: nullableNumber;
	UKey: string;
	EventReasonName: nullableString;
	ReasonType: nullableString | nullableNumber;
	ProfessionalContractor: boolean;
	LIContractor: boolean;
	SectorId: nullableNumber;
	Disabled: boolean;
	CreatedBy: nullableNumber;
	CreatedOn: nullableDate;
	LastModifiedBy: nullableString;
	LastModifiedOn: nullableDate;
	ReasonForChange: nullableString;
	EventReasonCode: nullableString;
	SectorName: nullableString;
	StatusCode: nullableNumber;
	Succeeded: boolean;
	ValidationMessages: nullableString;
	Message: string;

	constructor(init?: Partial<EventReason>) {
		super();
		Object.assign(this, init);
	}
}

export interface CopyInfo{
	Message?: string;
	Succeeded?: boolean;
	destination: number;
	eventReasonIds: number[];
	source: number;
  }

export interface CopyDropdownModel {
    text:string;
    textlocalizedkey: string;
    isselected:boolean;
    value:string;
}

export interface CopyTreeModel {
    controlName: string;
    change: {
        Text: string;
        Value: string;
        TextLocalizedKey: string | null;
        IsSelected: boolean;
    }
}

export interface TreeView {
    treeData: {
        text: string;
        items: {
            text: string;
            value?: string;
            textlocalizedkey?: string | null;
            isselected: boolean;
        }[];
    }[];
    label: string;
    tooltipVisible: boolean;
    textField: string;
    tooltipTitle: string;
    isRequired: boolean;
    treeViewType: string;
}
