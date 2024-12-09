export class AdvFilterStateModel {
	advFilterModels!: AdvFilterModel[];
}

export class AdvFilterModel {
	entityId: any;
	entityType: any;
	menuId: any;
	dropdownApiAddress: any;
	advFilterData: any[];
	advFilterAppliedData: any;
	advFilterList: any[];
	dropdownData: any[];
	serverSidePagingObj: any;
	isApiGateway: boolean;
};
