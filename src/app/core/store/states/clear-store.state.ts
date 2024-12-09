import { State, StateContext, Action } from '@ngxs/store';
import { ClearStore } from '../actions/clear-store.action';

@State<string[]>({
	name: 'ClearStore'
})
export class ClearStoreState {
    
}
