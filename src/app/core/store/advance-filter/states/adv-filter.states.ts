import { Action, Selector, State, StateContext } from "@ngxs/store";
import { AdvFilterStateModel } from "../models/adv-filter.models";
import { Injectable } from "@angular/core";
import { GridViewService } from "@xrm-shared/services/grid-view.service";
import { ClearAdvAppliedFilterData, RefreshAdvDropdownData, ManageAdvAppliedFilterData,
	ManageAdvFilter, ManageAdvFilterDropdownData,
	RemoveAdvAppliedFilterData} from "../actions/adv-filter.actions";
import { Observable, tap } from "rxjs";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

@State<AdvFilterStateModel>({
	name: 'WidgetAdvFilter',
	defaults: {
		advFilterModels: []
	}
})

@Injectable()
export class AdvFilterState {

	constructor(private gridViewService: GridViewService) {
	}

	@Selector()
	static GetAdvFilterData(state: AdvFilterStateModel) {
		return state.advFilterModels;
	}

	@Action(ManageAdvAppliedFilterData)
	// eslint-disable-next-line max-len
	ManageAdvAppliedFilterData({ getState, patchState }: StateContext<AdvFilterStateModel>, { entityId, entityType, menuId, isApiGateway, data, list, serverSidePagingObj }: ManageAdvAppliedFilterData): Observable<ManageAdvAppliedFilterData> | any {
		const state = getState(),
			storedData = state.advFilterModels,
			index = state.advFilterModels.findIndex((x: any) =>
				x.entityId == entityId && x.entityType == entityType && x.menuId == menuId);

		if (index == Number(magicNumber.minusOne)) {
			storedData.push({
				entityId: entityId,
				entityType: entityType,
				menuId: menuId,
				isApiGateway: isApiGateway,
				advFilterData: [],
				advFilterAppliedData: data,
				advFilterList: list,
				dropdownData: [],
				dropdownApiAddress: null,
				serverSidePagingObj: null
			});
		}
		else {
			storedData[index].entityId = entityId;
			storedData[index].entityType = entityType;
			storedData[index].advFilterAppliedData = data;
			storedData[index].advFilterList = list;
			storedData[index].isApiGateway = isApiGateway;
			storedData[index].serverSidePagingObj = serverSidePagingObj;
		}

		patchState({
			...state,
			advFilterModels: [...storedData]
		});

	}

	@Action(ManageAdvFilter)
	// eslint-disable-next-line max-len
	ManageAdvFilterData({ getState, patchState }: StateContext<AdvFilterStateModel>, { entityId, entityType, menuId, isApiGateway }: ManageAdvFilter): Observable<ManageAdvFilter> | any {
		return this.gridViewService.advanceFilterFieldsGetAll(entityId, entityType, menuId).pipe(tap((res: any) => {
			const state = getState(),
				storedData = state.advFilterModels,
				index = storedData.findIndex((x: any) =>
					x.entityId == entityId && x.entityType == entityType && x.menuId == menuId);

			if (index == Number(magicNumber.minusOne)) {
				storedData.push({
					entityId: entityId,
					entityType: entityType,
					menuId: menuId,
					isApiGateway: isApiGateway,
					advFilterData: res.Data,
					advFilterAppliedData: {},
					advFilterList: [],
					dropdownData: [],
					dropdownApiAddress: null,
					serverSidePagingObj: null
				});
			}
			else {
				storedData[index].advFilterData = res.Data;
				storedData[index].advFilterAppliedData = {};
				storedData[index].dropdownData = [];
				storedData[index].isApiGateway = isApiGateway;
			}

			patchState({ ...state, advFilterModels: [...storedData] });

		}));

	}
	@Action(RemoveAdvAppliedFilterData)
	removeAdvFilterDataByEntityId(
		{ getState, patchState }: StateContext<AdvFilterStateModel>,
		{ entityId, entityType, menuId }: RemoveAdvAppliedFilterData
	) {
		const state = getState();
		if (state.advFilterModels.length > 0) {
		   	for (let i = state.advFilterModels.length - 1; i >= 0; i--) {
		   		const currentEntityType = state.advFilterModels[i].entityType || '',
		   			currentMenuId = state.advFilterModels[i].menuId || '';
		   		if (
		   			state.advFilterModels[i].entityId == entityId &&
		   			currentEntityType == entityType &&
		   			currentMenuId == menuId
		   		) {
		   			state.advFilterModels.splice(i, 1);
		   			break;
		   		}
		   	}
		   }
		patchState({
			advFilterModels: state.advFilterModels
		});
	}
	@Action(ClearAdvAppliedFilterData)
	// eslint-disable-next-line max-len
	clearAdvAppliedFilterData({ getState, patchState }: StateContext<AdvFilterStateModel>): any {
		const state = getState(),
			storedData = state.advFilterModels;
		storedData.forEach((arr, index) => {
			storedData[index].advFilterAppliedData = [];
			storedData[index].advFilterList = [];
		});
		patchState({
			...state,
			advFilterModels: [...storedData]
		});

	}

	@Action(ManageAdvFilterDropdownData)
	// eslint-disable-next-line max-len
	ManageAdvFilterDropdownData({ getState, patchState }: StateContext<AdvFilterStateModel>, { inputData }: ManageAdvFilterDropdownData): Observable<ManageAdvFilterDropdownData> | any {
		// eslint-disable-next-line max-len
		return this.gridViewService.getAdvFilterDropdownData(inputData.apiAddress, inputData.payload, inputData.isApiGateway).pipe((tap((res: any) => {
			const state = getState(),
				storedData = state.advFilterModels,
				index = storedData.findIndex((x: any) =>
					x.entityId == inputData.entityId && x.entityType == inputData.entityType && x.menuId == inputData.menuId);

			if (index == Number(magicNumber.minusOne)) {
				storedData.push({
					entityId: inputData.entityId,
					entityType: inputData.entityType,
					menuId: inputData.menuId,
					isApiGateway: inputData.isApiGateway,
					dropdownApiAddress: inputData.apiAddress,
					advFilterData: [],
					advFilterAppliedData: {},
					advFilterList: [],
					dropdownData: res.Data,
					serverSidePagingObj: null
				});
			}
			else {
				storedData[index].dropdownApiAddress = inputData.apiAddress;
				storedData[index].dropdownData = res.Data;
				storedData[index].isApiGateway = inputData.isApiGateway;
			}
			patchState({ ...state, advFilterModels: [...storedData] });

			// end
		})));
	}

	@Action(RefreshAdvDropdownData)
	// eslint-disable-next-line max-len
	RefreshAdvDropdownData({ getState, patchState }: StateContext<AdvFilterStateModel>, { entityId, entityType, menuId }: RefreshAdvDropdownData): any {
		const state = getState(),
			storedData = state.advFilterModels,
			index = state.advFilterModels.findIndex((x: any) =>
				x.entityId == entityId && x.entityType == entityType && x.menuId == menuId);

		if (index == Number(magicNumber.minusOne))
			return;

		storedData[index].dropdownData = [];
		patchState({ ...state, advFilterModels: [...storedData] });

		if(!storedData[index].dropdownApiAddress)
			return;

		 // eslint-disable-next-line max-len
		 return this.gridViewService.getAdvFilterDropdownData(storedData[index].dropdownApiAddress, null, storedData[index].isApiGateway).pipe((tap((res: any) => {
		   	storedData[index].dropdownData = res.Data;
		   	patchState({ ...state, advFilterModels: [...storedData] });
		   	// end
		   })));
	}

};
