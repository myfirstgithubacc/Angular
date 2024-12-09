export class GridTabSet {
	static readonly type = '[GridTab] Set';
	constructor(public payload: any){}
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GridTabGet {
	static readonly type = '[GridTab] Get';
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ClearGridTab {
	static readonly type = '[ClearGridTab] ClearGridTab';
}
