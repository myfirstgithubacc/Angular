import { State, Action, StateContext } from '@ngxs/store';

export interface MarkupStateModel {
  gridData: any;
}

@State<MarkupStateModel>({
  name: 'markup',
  defaults: {
    gridData: null
  },
})
export class MarkupState {
  @Action({ type: 'SaveGridData' })
  saveGridData(ctx: StateContext<MarkupStateModel>, action: any) {
    ctx.getState();
    ctx.patchState({
      gridData: action.payload
    });
  }
}
export class SaveGridData {
    static readonly type = 'SaveGridData';
    constructor(public payload: any) {} 
  }