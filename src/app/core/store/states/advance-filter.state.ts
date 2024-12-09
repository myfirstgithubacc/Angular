import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable } from "rxjs";
import { AdvanceFilterGet, AdvanceFilterSet } from "../actions/advance-filter.action";


export class AdvanceFilterStateModel {
	advance_filter!: any;
    
}

@State<AdvanceFilterStateModel>({
	name: 'advance_filter',
	defaults: {
		advance_filter: [],
       
	}
})
@Injectable()
export class AdvanceFilterState {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(){}
    @Selector()
	static get_AdvanceFilter(state: AdvanceFilterStateModel) {
		return state.advance_filter
	}
    
   @Action(AdvanceFilterSet)
    AdvanceFilterSet(ctx: StateContext<AdvanceFilterStateModel>, { payload }: AdvanceFilterSet): Observable<AdvanceFilterStateModel> | any {
    	try {
    		const state = ctx.getState();
            
    		let af = state.advance_filter?.filter((a:any)=>a.key == payload.key);
    		if(af?.length > 0 && payload?.type != null){
    			state.advance_filter = [payload,...state.advance_filter];
    		}
    		else{
    			state.advance_filter = [payload];
    		}
            
           
    		ctx.setState({
    			advance_filter: state.advance_filter,                    
    		})
           
    	} catch (err) {
       
    	}
    }


    @Action(AdvanceFilterGet)
   AdvanceFilterGet({ getState, setState }: StateContext<AdvanceFilterStateModel>) {
   	const state = getState();
    
   	setState({
            
   		advance_filter:[state] 
   	})
   }
}

