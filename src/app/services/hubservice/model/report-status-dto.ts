export class ReportingStatusDto{
	reportId:string;
	status:string;
	reportGeneratedTime:Date;
	id: string;
	title: string;
	message: string;
	createdOn: Date;
	senderId: string;
	recipientId?: string[];
	targetGroups?: string[];
	additionalData?: object;
}
