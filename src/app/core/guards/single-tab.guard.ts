import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ManageTabsService } from "@xrm-shared/services/manage-tabs.service";

export const SingleTabGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const manageTabSrv = inject(ManageTabsService);

  if (!manageTabSrv.isCTabExists()) {
    router.navigate(['/multitabaccess']);
    return false;
  }

  if (manageTabSrv.isDuplicateTab()) {
    router.navigate(['/multitabaccess']);
    return false;
  }

  return true;
};
