// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GetApprovalConfiguration {
	static readonly type = '[ApprovalConfiguration] Get';
}
export class SetApprovalConfigurationById {

	static readonly type = '[ApprovalConfiguration] Set';

	constructor(public id: string){}
}

export class DeleteApprovalConfiguration {

	static readonly type = '[ApprovalConfiguration] Delete';

	constructor(public id: string, public status: boolean){}
}

export class AddApprovalConfiguration {

	static readonly type = '[ApprovalConfiguration] Add';

	constructor(public payload: any){}

}

export class UpdateApprovalConfiguration {

	static readonly type = '[ApprovalConfiguration] Update';

	constructor(public payload: any){}

}

export class UpdateApprovalConfigurationStatus {
	static readonly type = '[ApprovalConfiguration] UpdateStatus';

	constructor(public payload: any) { }
}

