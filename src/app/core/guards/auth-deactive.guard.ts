import { Observable } from 'rxjs';
import { CanDeactivateFn,
	ActivatedRouteSnapshot,
	RouterStateSnapshot } from '@angular/router';
import { IDeactivateComponent } from 'src/app/shared/services/ideactivate-component';

export const AuthDeactiveGuard: CanDeactivateFn<IDeactivateComponent> = (
	component: IDeactivateComponent,
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
): Observable<boolean> | boolean => {
	return component.canDeactivate()
		? true
	// eslint-disable-next-line no-alert
		: window.confirm('You have unsaved changes. Leave?');
};

