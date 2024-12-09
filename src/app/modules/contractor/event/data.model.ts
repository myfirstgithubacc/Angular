import { ToJson } from "@xrm-core/models/responseTypes/to-json.model";

export class ContractorEvent extends ToJson{
	"UKey": string;
	"assignmentId": number;
	"eventConfigId": number;
	"eventReasonId": number;
	"incurredDate":string;
	"fromDate": string;
	"toDate": string | null;
	"backfillRequired": boolean;
	"backfillStartDate":string | null;
	"backfillEndDate":string | null;
	"broadcastType": number;
	"staffingAgencyIds": number[];
	"comment": string;
	"Disabled":boolean;
	"isEmailNotificationToBeDelayed":boolean;
	"isEmailNotificationRequired":boolean;
	"eventNotificationToBeSentOn":Date | null;
	"ReasonForChange":string;


	constructor(init?: Partial<ContractorEvent>) {
		super();
		Object.assign(this, init);
	}
}
