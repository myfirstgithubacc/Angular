import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NotifierService } from '@xrm-shared/services/notifier.service';
import { BehaviorSubject, Observable, Subject, forkJoin, lastValueFrom, map, of, takeUntil} from 'rxjs';
import { HttpMethodService } from './http-method.service';
import { EntityAction, EntityRoute, ExceptionField, MenuItem } from '@xrm-shared/models/menu-interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Injectable({
	providedIn: 'root'
})
export class MenuService extends HttpMethodService implements OnDestroy {
	public authorizedActions = new BehaviorSubject<EntityAction[]>([]);
	public accessRouteListSubject = new BehaviorSubject<EntityRoute[]>([]);
	public accessMenuListSubject = new BehaviorSubject<MenuItem[]>([]);
	private exceptionFieldList: ExceptionField[] = [];
	public isCameFromLogin:boolean = false;

	private unsubscribe$ = new Subject<void>();

	constructor(private sessionStorage: SessionStorageService, private http: HttpClient, private notifierService:NotifierService) {
		super(http);
	}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public clearRoutes():void{
		this.exceptionFieldList=[];
		this.authorizedActions.next([]);
		this.accessRouteListSubject.next([]);
		this.accessMenuListSubject.next([]);
		this.sessionStorage.remove('routes');
		this.sessionStorage.remove('menu');
		this.sessionStorage.remove('exceptionField');

	}

	public fetchAllAccessData(){
		forkJoin([this.getRoutes(), this.getMenuList(), this.getExceptionFieldList()])
			.pipe(takeUntil(this.unsubscribe$)).subscribe(([routes, menu, exceptionfield]) => {
				this.accessRouteListSubject.next(routes);
				this.accessMenuListSubject.next(menu);
				this.exceptionFieldList = exceptionfield;
			});
	}
	private getMenu():Observable<GenericResponseBase<MenuItem[]>> {
		return this.GetAll<GenericResponseBase<MenuItem[]>>('/auth/menu');
	}

	public getAuthorizedActionsList(): Observable<EntityAction[]> {
		if(this.authorizedActions.value.length == Number(magicNumber.zero))
		{
			const obj = this.sessionStorage.get('permission');
			let permission: EntityAction[] = [];
			if (obj)
				permission = JSON.parse(obj) ?? [];
			if (permission.length > Number(magicNumber.zero)) {
				return of(permission);
			}
		}
		return this.authorizedActions.asObservable();
	}

	public getRoutes(): Observable<EntityRoute[]> {
		const obj = this.sessionStorage.get('routes');
		let routes: EntityRoute[] = [];
		if (obj)
			routes = JSON.parse(obj) ?? [];
		if (routes.length > Number(magicNumber.zero)) {
			return of(routes);
		} else {
			return this.getRoutesData().pipe(map((res:GenericResponseBase<EntityRoute[]>) => {
				if(res.Succeeded && res.Data){
					routes = res.Data;
				}
				routes.push({EntityId: magicNumber.zero, Route: '/xrm/landing/home'});
				sessionStorage.setItem('routes', JSON.stringify(routes));
				return routes;
			}), takeUntil(this.unsubscribe$));
		}
	}

	public getMenuList(): Observable<MenuItem[]> {
		const obj = this.sessionStorage.get('menu');
		let menu: MenuItem[] = [];
		if (obj)
			menu = JSON.parse(obj) ?? [];
		if (menu.length > Number(magicNumber.zero)) {
			return of(menu);
		} else {
			return this.getMenu().pipe(map((res: GenericResponseBase<MenuItem[]>) => {
				if(res.Succeeded && res.Data){
					menu = res.Data;
				}
				sessionStorage.setItem('menu', JSON.stringify(menu));
				return menu;
			}), takeUntil(this.unsubscribe$));
		}
	}

	private getExceptionFieldList(): Observable<ExceptionField[]> {
		const obj = this.sessionStorage.get('exceptionField');
		if (obj)
			this.exceptionFieldList = JSON.parse(obj) ?? [];
		if (this.exceptionFieldList.length > Number(magicNumber.zero)) {
			return of(this.exceptionFieldList);
		} else {
			return this.getFieldLevelException().pipe(map((res: GenericResponseBase<ExceptionField[]>) => {
				if(res.Succeeded && res.Data){
					this.exceptionFieldList = res.Data;
				}
				sessionStorage.setItem('exceptionField', JSON.stringify(this.exceptionFieldList));
				return this.exceptionFieldList;
			}), takeUntil(this.unsubscribe$));
		}
	}

	private getRoutesData(): Observable<GenericResponseBase<EntityRoute[]>>{
		return this.GetAll<GenericResponseBase<EntityRoute[]>>('/auth/routes');
	}

	private getFieldLevelException(): Observable<GenericResponseBase<ExceptionField[]>>{
		return this.GetAll<GenericResponseBase<ExceptionField[]>>('/auth-exc-fld-list');
	}

	public getActionList(id: number):Observable<GenericResponseBase<EntityAction>>{
	 return this.GetAll<GenericResponseBase<EntityAction>>(`/auth/entity-acts/${id}`);
	}

	public fetchAndAppendEntityPermissions(shouldAppend: boolean = false, entityId?: number):void{
		if(!this.authorizedActions.value?.find((data: EntityAction) =>
			data.EntityId == entityId)){
			if(entityId || entityId == magicNumber.zero){
				this.getActionList(entityId).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<EntityAction>) => {
					if(shouldAppend)
					{
						if(res.Succeeded && res.Data){
							this.authorizedActions.next([...this.authorizedActions.value, res?.Data]);
							this.sessionStorage.set('permission', JSON.stringify(this.authorizedActions.value));
						}
					}
					this.authorizedActions.next([...this.authorizedActions.value]);
				});
			}
		}
	}

	public getExceptionField(entityId: number, fieldName: string, entityType?: string):ExceptionField|undefined{
		if(this.exceptionFieldList.length == Number(magicNumber.zero))
			this.getExceptionFieldList();
		if(entityType=='')
			return this.exceptionFieldList.find((data: ExceptionField) =>
				data.XrmEntityId==entityId && data.FieldName==fieldName);
		else
			return this.exceptionFieldList.find((data: ExceptionField) =>
				data.XrmEntityId==entityId && data.FieldName==fieldName && data.RoleGroupId == parseInt(entityType!));
	}

}
