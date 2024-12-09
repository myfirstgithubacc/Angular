import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable } from "rxjs";
import { SmartSearchGet, SmartSearchSet } from "../actions/smart-search.action";


export class SmartSearchStateModel {
	smart_search: any = {};

}

@State<SmartSearchStateModel>({
	name: 'smart_search',
	defaults: {
		smart_search: {},

	}
})
@Injectable()
export class SmartSearchState {

    @Selector()
	static get_SmartSearch(state: SmartSearchStateModel) {
		return state.smart_search;
	}

   @Action(SmartSearchSet)
    SmartSearchSet(ctx: StateContext<SmartSearchStateModel>, { payload }: SmartSearchSet): Observable<SmartSearchStateModel> | any {
    	try {
    		const state = ctx.getState();
    		state.smart_search = payload;

    		ctx.setState({
    			smart_search: state.smart_search,
    		});

    	} catch (err) {
    		console.log("err ", err);

    	}
    }


    @Action(SmartSearchGet)
   SmartSearchGet({ getState, setState }: StateContext<SmartSearchStateModel>) {
   	const state = getState();
   	setState({
   		smart_search: [state]
   	});
   }
}

