import { ToJson } from './responseTypes/to-json.model';
type nullableString = string | undefined | null;
type nullableNumber = number | undefined | null;
type nullableBoolean = boolean;

export class TerminationReason extends ToJson {

	Id: nullableNumber;
	UKey: nullableString;
	TerminationReasonName: nullableString;
	ReasonTypeName: nullableString;
	ProfessionalContractor: nullableBoolean;
	LIContractor: nullableBoolean;
	SOWResources: nullableBoolean | nullableString;
	DoNotReturn: nullableBoolean;
	ManagerSurveyRequested: nullableBoolean;
	BackfillNeeded: nullableBoolean;
	SectorId: nullableNumber;
	SectorName: nullableString;
	Disabled: nullableBoolean;
	CreatedBy: nullableNumber;
	CreatedOn: Date | undefined | null;
	LastModifiedBy: nullableString;
	LastModifiedOn: Date | undefined | null;
	ReasonForChange: nullableString;
	ReasonTypeId: any;
	TerminationReasonCode: any;

	constructor(init?: Partial<TerminationReason>) {
		super();
		Object.assign(this, init);
	}
}

export interface ReasonType {
    Text: string;
    Value: number;
}

