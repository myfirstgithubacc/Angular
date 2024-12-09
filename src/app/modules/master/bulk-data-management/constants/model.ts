import { dropdownModel } from "@xrm-core/models/job-category.model";
import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export class ListItems{
	Id: number;
	Ukey: string;
	Code: string;
	BulkDataMasterId: number;
	TemplateCategory: string;
	TemplateName: string;
	SectorId: number;
	SectorName: string;
	TotalRecords: number;
	StatusId: number;
	Status: string;
	SuccessCount: number;
	SuccessRecordId: string | number;
	WarningCount: number;
	FailedCount: number;
	FailedRecordId: string;
	UploadedBy: string | number;
	UploadedOn: string | Date;
	ProcessedStartedOn: string | Date | null;
	ProcessedEndedOn: string | Date | null;
}

export class ButtonType{
	 text: string;
	 value: number;
	 themeColor?: string;
	 fillMode?: string;
}

export class DialogContentType{
	type: string;
	labels?: string | { dropdownLabel: string };
	value?: string;
	labelLocalizeParam?: DynamicParam[];
	tooltipVisible?: boolean;
	tooltipTitleParam?: DynamicParam[];
	dropdownData?: dropdownModel[];
	controlName?: string;
	IsTreePresent?: boolean;
	tooltipTitleLocalizeParam?: DynamicParam[];
	notRequired?: boolean;
	validationMessage?: string;
}

export class BulkDataRecord{
	Id: number;
	UKey: string;
	TemplateCategory: string;
	XrmEntityId: number;
	TemplateName: string;
	TemplateDescription: string;
	Disabled: false;
}

export class UploadData{
	str?: string;
}
