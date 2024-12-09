import { Injectable, OnDestroy } from '@angular/core';
import {
   	ActivatedRouteSnapshot,
   	CanDeactivate,
   	Router,
   	RouterStateSnapshot
} from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { Subscription } from 'rxjs';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { IDeactivateComponent } from 'src/app/shared/services/ideactivate-component';

@Injectable({
   	providedIn: 'root'
   	})

export class CanDeactivateGuard implements CanDeactivate<IDeactivateComponent>, OnDestroy {
	private apiUnsub: Subscription;
	   	// eslint-disable-next-line max-params
	   	constructor(
	   		private authGuardService: AuthGuardService,
	   		private dialogPopupService: DialogPopupService,
	   		private routes: Router
	   	) { }
	   	isClickedYes: boolean = false;
	   	// eslint-disable-next-line max-params
	   	canDeactivate(
	   		component: IDeactivateComponent,
	   		route: ActivatedRouteSnapshot,
	   		state: RouterStateSnapshot,
	   		nextState?: RouterStateSnapshot
	   	) {

		if (this.authGuardService.isUnsavedCopy()) {
	   			const continueExitButton = [
	   				{ text: 'Continue', value: 2, themeColor: 'primary' },
	   				{ text: 'Exit', value: 1, themeColor: '' }
	   			];

 			this.dialogPopupService.showConfirmation(`CopyContentMessage`, continueExitButton, [{ Value: route.data['name'] || route.data['title'] || '', IsLocalizeKey: true }]);

			this.apiUnsub = this.dialogPopupService.dialogButtonObs.subscribe((data) => {
	   				if (data?.value === magicNumber.one) {
	   					if (nextState && nextState.url) {
	   						this.authGuardService.unsaved = false;
	   						this.dialogPopupService.resetDialogButton();
	   						this.routes.navigate([nextState.url]);
	   						return true;
	   					}
	   					return false;
	   				} else {
	   					return false;
	   				}
	   			});
	   			return false;
	   		} else {
	   			return true;
	   		}
	   	}

	ngOnDestroy(): void {
		this.apiUnsub.unsubscribe();
	}
	   }

