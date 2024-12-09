
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Injectable, OnDestroy } from '@angular/core';
import { GlobalSearchService } from '@xrm-shared/services/global-search.service';
import { EntityAction, EntityRoute } from '@xrm-shared/models/menu-interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';

@Injectable({
	providedIn: 'root'
})
export class RouteGuard implements OnDestroy {

	private unsubscribe$ = new Subject<void>();

	constructor(
    	private authGuardService: AuthGuardService,
    	private menuService: MenuService,
    	private router: Router,
		private globalSearchService: GlobalSearchService,
		private sessionSrv: SessionStorageService
	) {}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		return new Promise((resolve) => {
			if(this.menuService.accessRouteListSubject.value.length === Number(magicNumber.zero)){
				this.menuService.getRoutes().pipe(takeUntil(this.unsubscribe$)).subscribe((res: EntityRoute[]) => {
					this.menuService.accessRouteListSubject.next(res);
				});
			}

			if (this.authGuardService.isLoggedInUser() && this.hasRouteAccess(state)) {
				const entityId = this.menuService.accessRouteListSubject.value?.find((r: EntityRoute) =>
						state.url.includes(r.Route))?.EntityId,
					sessionEntityActions = JSON.parse(this.sessionSrv.get('permission') ?? '[]');
				let sessionEntityIds = [];

				if(sessionEntityActions.length > magicNumber.zero){
					sessionEntityIds = sessionEntityActions.map((item:EntityRoute) =>
						item.EntityId);
				}

				if(sessionEntityIds.includes(entityId)){
					this.menuService.authorizedActions.next(sessionEntityActions);
					route.params = { ...route.params, 'permission': sessionEntityActions.find(((item: EntityAction) =>
						item.EntityId == entityId)).EntityActions};
					resolve(true);
				}
				else if(entityId || entityId === magicNumber.zero){
					this.callApi(entityId, route, resolve);
				}
				else
					resolve(true);
			}
			else {
				this.router.navigate(['unauthorized']);
				resolve(false);
			}
		});

	}

	private hasRouteAccess(state: RouterStateSnapshot): boolean{
		return this.menuService.accessRouteListSubject.value.some((r: EntityRoute) =>
			state.url.includes(r.Route));
	}

	private callApi(entityId: number, route: ActivatedRouteSnapshot, resolve: (value: boolean) => void):void {
		if(entityId === Number(magicNumber.zero)){
			this.globalSearchService.getActionList().pipe(takeUntil(this.unsubscribe$)).subscribe((response: GenericResponseBase<EntityAction[]>) => {
				if(response.Succeeded && response.Data){
					this.menuService.authorizedActions.next(response.Data);
					route.params = { ...route.params, 'permission': response.Data[magicNumber.zero]?.EntityActions };
					resolve(true);
				}
			});
		}
		else{
			this.menuService.getActionList(entityId).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<EntityAction>) => {
				if(res.Succeeded && res.Data){
					this.menuService.authorizedActions.next([res.Data]);
					route.params = { ...route.params, 'permission': res.Data.EntityActions };
					this.sessionSrv.set('permission', JSON.stringify(this.menuService.authorizedActions.value));
					resolve(true);
				}
			});
		}

	}

}
