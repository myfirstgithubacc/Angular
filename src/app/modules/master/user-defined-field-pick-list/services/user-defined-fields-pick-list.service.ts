import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { IPickListAddEditPayload, IRouteParams, IStatusChangePayload, IUdfPickListData } from '@xrm-core/models/user-defined-field-pick-list/usd-pick-list-type.model';
import { dropdown } from '@xrm-master/labor-category/constant/dropdown-constant';
import { AddEditComponent } from '@xrm-master/user-defined-field-pick-list/add-edit/add-edit.component';
import { ListComponent } from '@xrm-master/user-defined-field-pick-list/list/list.component';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { IRecordStatusChangePayload } from '@xrm-shared/models/common.model';
import { HttpMethodService } from '@xrm-shared/services/http-method.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserDefinedFieldsPickListService extends HttpMethodService implements OnDestroy {

	public saveUDFPickListType = new BehaviorSubject<boolean>(false);
	private dialogRefList: DialogRef;
	private dialogRefAddEdit: DialogRef;
	private onDestroyCallback: (() => void) | null = null;
	private unsubscribeAll$: Subject<void> = new Subject<void>();
	private actionId: number[] = [
		Permission.CREATE_EDIT__CREATE,
		Permission.CREATE_EDIT__EDIT,
		Permission.CREATE_EDIT__ACTIVATE,
		Permission.CREATE_EDIT__DEACTIVATE,
		Permission.CREATE_EDIT__UPLOAD,
		Permission.CREATE_EDIT__VIEW
	];

	// eslint-disable-next-line max-params
	constructor(
		private http: HttpClient,
		private kendoDialogService: DialogService,
		private router: Router,
		private toasterService: ToasterService
	) {
		super(http);
		this.router.events.pipe(takeUntil(this.unsubscribeAll$)).subscribe((event) => {
			if (event instanceof NavigationStart) {
				this.dialogRefList.close();
				this.dialogRefAddEdit.close();
			}
		});
	}

	public UpdateBulkStatusUDFPickListItem(data: IStatusChangePayload[]): Observable<ApiResponseBase> {
		return this.PutBulk('/udfpli/bulk-status', data);
	}

	public AddPickListTypeAndItems(data: IPickListAddEditPayload): Observable<GenericResponseBase<IUdfPickListData>> {
		return this.Post(`/udfplt/save`, data);
	}

	public UpdatePickListTypeAndItems(data: IPickListAddEditPayload): Observable<ApiResponseBase> {
		return this.Put(`/udfplt-ukey`, data);
	}

	public UpdateBulkStatusUDFPickListType(data: IRecordStatusChangePayload[]): Observable<ApiResponseBase> {
		return this.PutBulk(`/udfplt/bulk-status`, data);
	}

	public GetUDFPickListByUKey(ukey: string): Observable<GenericResponseBase<IUdfPickListData>> {
		return this.Get<GenericResponseBase<IUdfPickListData>>(`/udfplt-ukey`, ukey);
	}

	public openDialogList(): void {
		this.dialogRefList = this.kendoDialogService.open({
			title: '<span class="k-icon k-font-icon k-i-close" (click)="closeDialog()"></span>',
			content: ListComponent,
			cssClass: 'udfpicklist__dialog-popup'
		});
	}

	public getCommonActionSet<T>(
		editMethod: (dataItem: T) => void,
		statusChangeMethod: (dataItem: T) => void
	) {
		return [
			{
				Status: true,
				Items: [
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: editMethod, actionId: this.actionId},
					{ icon: 'check', color: 'green-color', title: dropdown.Activate, fn: statusChangeMethod, actionId: this.actionId}
				]
			},
			{
				Status: false,
				Items: [
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: editMethod, actionId: this.actionId},
					{ icon: 'x', color: 'red-color', title: dropdown.Deactivate, fn: statusChangeMethod, actionId: this.actionId}
				]
			}
		];
	};

	public backDialogList(): void {
		this.dialogRefList.close();
	}

	public openDialogAddEdit(uKey: string): void {
		this.dialogRefAddEdit = this.kendoDialogService.open({
			title: '<span class="k-icon k-font-icon k-i-close" (click)="closeDialog()"></span>',
			content: AddEditComponent,
			cssClass: 'udfpicklist__dialog-popup-addedit'
		});
		this.toasterService.resetToaster();
		if (uKey === '') return;

		this.dialogRefAddEdit.content.instance.activatedRoute.params
			.pipe(takeUntil(this.unsubscribeAll$)).subscribe((param: IRouteParams | null) => {
				if (param === null) return;
				param.id = uKey;
				this.dialogRefAddEdit.content.instance.loadRecordByUKey(param.id);
				this.dialogRefAddEdit.content.instance.itemTypeUKey = param.id;
			});

	}

	public backDialogAddEdit(): void {
		this.dialogRefAddEdit.close();
	}

	public setOnDestroyCallback(callback: () => void): void {
		this.onDestroyCallback = callback;
	}

	public triggerOnDestroyCallback(): void {
		if (this.onDestroyCallback) {
			this.onDestroyCallback();
		}
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}
}
