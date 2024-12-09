import { getActionTypeFromInstance } from '@ngxs/store';
import { ClearStore } from '@xrm-core/store/actions/clear-store.action';

export function clearStorePlugin(state: any, action: any, next: any) {
  if (getActionTypeFromInstance(action) === ClearStore.type) {
    return next({}, action);
  }

  return next(state, action);
}
