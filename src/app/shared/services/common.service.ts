/* eslint-disable indent */

import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { RefreshAdvDropdownData } from '@xrm-core/store/advance-filter/actions/adv-filter.actions';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { FieldAuthorizationParam } from './common-constants/FieldAuthorizationParam';
import { XrmEntities } from './common-constants/XrmEntities.enum';
import { magicNumber } from './common-constants/magic-number.enum';
import { MenuService } from './menu.service';
import { ActionItem, gridActionSet } from '@xrm-master/role/Generictype.model';
@Injectable({
	providedIn: 'root'
})
class AuthCommonService {
	public permission: any;
	private unsubscribe$ = new Subject<void>();
	fieldAuthParam = new FieldAuthorizationParam();

	private fieldAuthParamSubject = new BehaviorSubject<FieldAuthorizationParam>(new FieldAuthorizationParam());

	actionSetSubject = new BehaviorSubject<any[]>([]);

	buttonSetSubject = new BehaviorSubject<any>([]);

	authActionIdList = [
		Permission.CREATE_EDIT__CREATE,
		Permission.CREATE_EDIT_MSP_USER__CREATE,
		Permission.CREATE_EDIT_CLIENT_USER__CREATE,
		Permission.CREATE_EDIT_STAFFING_AGENCY_USER__CREATE
	];

	activateDeactivateActionIds = [
		Permission.CREATE_EDIT__DEACTIVATE,
		Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
		Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
		Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE,
		Permission.CREATE_EDIT__ACTIVATE,
		Permission.CREATE_EDIT_MSP_USER__ACTIVATE,
		Permission.CREATE_EDIT_CLIENT_USER__ACTIVATE,
		Permission.CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE
	];

	constructor(private menuService: MenuService) { }


	getCreateAuthPermission(xrmEntityId: number, subEntityType?: string | undefined): Observable<FieldAuthorizationParam> {
		this.menuService.getAuthorizedActionsList().pipe(takeUntil(this.unsubscribe$))
		.subscribe((res: any) => {
			this.permission = res?.find((obj: any) =>
				obj.EntityId == xrmEntityId);
			this.fieldAuthParam.isViewable = this.authActionIdList.some((actionId: number) =>
				this.doesActionIdExist(actionId, subEntityType));
			this.fieldAuthParamSubject.next(this.fieldAuthParam);
		});
		return this.fieldAuthParamSubject.asObservable();
	}


	public getFieldConfig(xrmEntityId: number, subEntityId: string, fieldName: string): FieldAuthorizationParam | null {
		const fieldConfig = subEntityId == '' ?
			this.menuService.getExceptionField(xrmEntityId, fieldName)
			: this.menuService.getExceptionField(xrmEntityId, fieldName, subEntityId);

		if (fieldConfig != null) {
			this.fieldAuthParam.isViewable = fieldConfig.Viewable;
			this.fieldAuthParam.isModificationAllowed = fieldConfig.ModificationAllowed;
			return this.fieldAuthParam;
		}
		return null;
	}

	// eslint-disable-next-line max-params
	public getGridAuthPermission(
    xrmEntityId: XrmEntities | null,
    actionSet: any,
    subEntityType?: string | null,
    forceMultiSelect: boolean= false): Observable<any> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		const resultObject: any[] = [];
		this.menuService.getAuthorizedActionsList().pipe(takeUntil(this.unsubscribe$))
		.subscribe((res: any) => {
			const copyActionSet: any = Object.assign([], actionSet);
			this.permission = res?.find((obj: any) =>
				obj.EntityId == xrmEntityId);

			copyActionSet.forEach((element: any) => {
				element.Items = element.Items.filter((item: any) =>
					// eslint-disable-next-line max-nested-callbacks
					item?.actionId?.some((actionId: number) =>
						this.doesActionIdExist(actionId, subEntityType)));
			});
      // eslint-disable-next-line one-var
      const isMultiSelect = forceMultiSelect
        ? forceMultiSelect
        : this.hasActivateAndDeactivatePermission(copyActionSet);
      resultObject.push({ actionSet: copyActionSet, isMultiSelect });
			this.actionSetSubject.next(resultObject);
		});
		return this.actionSetSubject.asObservable();
	}

  hasActivateAndDeactivatePermission(copyActionSet: gridActionSet[]): boolean {
    return copyActionSet.some((element) =>
      element?.Items?.some((item) =>
        item.actionId.some((actionId) =>
          this.activateDeactivateActionIds.includes(actionId))));
  }

	getCommonHeaderAuthPermission(xrmEntityId: number, buttonSet: any, subEntityType: string | undefined): Observable<any> {
		this.menuService.getAuthorizedActionsList().pipe(takeUntil(this.unsubscribe$))
		.subscribe((res: any) => {
			const copyButtonSet: any = Object.assign([], buttonSet);
			this.permission = res?.find((obj: any) =>
				obj.EntityId == xrmEntityId);
			copyButtonSet.forEach((element: any) => {
				for (let i = 0; i < element.items.length; i++) {
					const result = element.items[i].actionId?.some((actionId: number) =>
						this.doesActionIdExist(actionId, subEntityType));
					if (!result) {
						element.items.splice(i, magicNumber.one);
						i--;
					}
				}
			});
			this.buttonSetSubject.next(copyButtonSet);
		});
		return this.buttonSetSubject.asObservable();
	}

	doesActionIdExist(actionId: number, subEntityType?: string | null): boolean {
		if (subEntityType)
			return this.permission?.EntityActions?.some((obj: any) =>
				obj.ActionId == actionId && obj.EntityType == subEntityType);
		else
			return this.permission?.EntityActions?.some((obj: any) =>
				obj.ActionId == actionId);
	}


	setAuthConfig(fieldConfig: any, fieldProperties: any, clearValidators: any): boolean {
		if (fieldConfig && fieldProperties.isEditMode) {
			fieldProperties.isRendered = fieldConfig.isViewable;
			if (!fieldProperties.isRendered)
				return false;
			fieldProperties.isEditMode = !fieldConfig.isModificationAllowed;
			if (!fieldConfig.isModificationAllowed)
				clearValidators();
		}
		return true;
	}

	manageAuthentication(fieldProperties: any): any {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		return this.getFieldConfig(
			fieldProperties.xrmEntityId,
			fieldProperties.entityType,
			fieldProperties.fieldName
		);
	}
	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

};

@Injectable({
	providedIn: 'root'
})
class CommonService {

	constructor(private store: Store) {

	}

	public resetAdvDropdown(entityId: any, entityType = null, menuId: any = null) {
		this.store.dispatch(new RefreshAdvDropdownData(entityId, entityType, menuId));
	}


	public notNullAndUndefined<T>(data: T | null | undefined): data is T {
		return data !== null && data !== undefined;
	}

	public downloadFile(response: Blob, fileName: string): void {
		const downloadUrl = window.URL.createObjectURL(response),
			a = document.createElement('a');
		a.href = downloadUrl;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(downloadUrl);
	}

}

export { AuthCommonService, CommonService };

