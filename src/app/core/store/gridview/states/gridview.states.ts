import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { ManageGridData } from "../actions/gridview.actions";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GridViewStateModel } from "../models/gridview-state.model";

@State<GridViewStateModel>({
  name: 'WidgetGridView',
  defaults: {
    gridDataModels: []
  },
})

@Injectable()
export class GridViewState {

  @Selector()
  static GetGridData(state: GridViewStateModel, entityId: any) {
    return state.gridDataModels.find(x => x.entityId == entityId);
  }

  @Action(ManageGridData)
  ManageGridData({ getState, patchState }: StateContext<GridViewStateModel>,
     { entityId, gridData }: ManageGridData): Observable<GridViewStateModel> | any {
    const state = getState();
    let result = state.gridDataModels.find(x => x.entityId == entityId);

    if (result == undefined || result == null) {
      patchState({
        gridDataModels: [{ entityId: entityId, gridData: gridData }, ...state.gridDataModels]
      });
      return;
    }

    result.gridData = gridData;
    patchState({
      gridDataModels: [result, ...state.gridDataModels]
    });
  }

}