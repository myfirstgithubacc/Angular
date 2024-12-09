import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable } from "rxjs";
import { ClearGridTab, GridTabGet, GridTabSet } from "../actions/grid-tab.action";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";


export class GridTabStateModel {
	gridtablist!: any[];

}

@State<GridTabStateModel>({
	name: 'gridtab_name',
	defaults: {
		gridtablist: []

	}
})
@Injectable()
export class GridTabNameState {

    @Selector()
	static GetTabName(state: GridTabStateModel) {
		return state.gridtablist;
	}

    @Action(GridTabSet)
    GridTabSet(ctx: StateContext<GridTabStateModel>, { payload }: GridTabSet): Observable<GridTabStateModel> | any {
    	try {
    		const state = ctx.getState(),
    			index = state.gridtablist.findIndex((a) =>
    				a.key == payload.key);
    		if (index > Number(magicNumber.minusOne)) {
    			const a = state.gridtablist[index] = payload;
    			ctx.setState({
    				gridtablist: [a]
    			});
    		}
    		else {
    			ctx.setState({
    				gridtablist: [payload, ...state.gridtablist]
    			});
    		}

    	} catch (err) { /* empty */ }
    }


    @Action(GridTabGet)
    GridTabGet({ getState, setState }: StateContext<GridTabStateModel>) {
    	const state = getState();
    	setState({
    		gridtablist: [state]
    	});
    }

    @Action(ClearGridTab)
    ClearGridTab({ getState, patchState }:StateContext<GridTabStateModel>) {
    	const state = getState();
    	patchState({
    		...state,
    		gridtablist: []
    	});
    }
}

