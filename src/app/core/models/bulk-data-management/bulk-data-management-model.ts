import { ToJson } from "../responseTypes/to-json.model";
type nullableString = string | undefined | null;
type nullableNumber = number | undefined | null;

export class BulkDataMangement extends ToJson{

	Id: nullableNumber;
	TemplateName : nullableString;
	TotalRecords : nullableNumber;
	UploadedRecords : nullableNumber;
	UploadWarning : nullableNumber;
	NumberRecordFailed : nullableNumber;
	TemplateCategory : nullableString;
	UploadedBy : nullableString;
	UploadedOn : Date | undefined | null;
	ProcessedOn : Date | undefined | null;
	Status : nullableString;

	constructor(init?: Partial<BulkDataMangement>) {
		super();
		Object.assign(this, init);
	}
}
