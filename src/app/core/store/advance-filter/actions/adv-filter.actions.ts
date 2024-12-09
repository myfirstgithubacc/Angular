/* eslint-disable max-params */
export class GetAdvFilterData {
	static readonly type = '[GetAdvFilterData] GetAdvFilterData';
	constructor(public entityType: any) { }
}

export class GetAdvAppliedFilterData {
	static readonly type = '[GetAdvAppliedFilterData] GetAdvAppliedFilterData';
	constructor(public entityType: any) { }
}

export class ManageAdvFilter {
	static readonly type = '[ManageAdvFilter] ManageAdvFilter';
	constructor(public entityId: any, public entityType: any, public menuId:any, public isApiGateway:boolean) { }
}

export class ManageAdvFilterDropdownData {
	static readonly type = '[ManageAdvFilterDropdownData] ManageAdvFilterDropdownData';
	constructor(public inputData: any) { }
}

export class ManageAdvAppliedFilterData {
	static readonly type = '[ManageAdvAppliedFilterData] ManageAdvAppliedFilterData';
	// eslint-disable-next-line max-len
	constructor(public entityId: any, public entityType: any, public menuId:any, public isApiGateway:boolean, public data: any, public list: any, public serverSidePagingObj: any) { }
}

export class ManageSearchText {
	static readonly type = '[ManageSearchText] ManageSearchText';
	constructor(public entityId: any, public entityType:any, public menuId:any, public isApiGateway:boolean, public searchText: any) { }
}
export class RemoveAdvAppliedFilterData {
	static readonly type = '[RemoveAdvAppliedFilterData] RemoveAdvAppliedFilterData';
	constructor(public entityId: string, public entityType:string, public menuId:string) {}
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ClearAdvAppliedFilterData {
	static readonly type = '[ClearAdvAppliedFilterData] ClearAdvAppliedFilterData';
}


export class RefreshAdvDropdownData {
	static readonly type = '[RefreshAdvDropdownData] RefreshAdvDropdownData';
	constructor(public entityId: any, public entityType: any, public menuId:any) { }
}
