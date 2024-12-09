import { Injectable, OnDestroy } from '@angular/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { ViewComponent } from '../../candidate-pool/view/view.component';
import { ListComponent } from '../../candidate-pool/list/list.component';
import { PopupAddEditComponent } from '../request/fill-a-request/popup-add-edit/popup-add-edit.component';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { ParentEntity } from '../../Constants/ParentEntity.enum';

@Injectable({
	providedIn: 'root'
})
export class LightIndustrialPopupService implements OnDestroy {
	public actionSet: any = [];
	private dialogRefView: DialogRef;
	private dialogRefList: DialogRef;
	private dialogRefAddEdit: DialogRef;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();

	constructor(
		private kendoDialogService: DialogService,
		private gridConfiguration: GridConfiguration,
		private toasterService: ToasterService,
		private router: Router
	) {
		this.router.events.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((event) => {
			if (event instanceof NavigationStart) {
				// Close the dialog when navigation starts
				if(this.dialogRefList){
					this.dialogRefList.close();
				}
				if(this.dialogRefAddEdit){
					this.dialogRefAddEdit.close();
				}
				if(this.dialogRefView){
					this.dialogRefView.close();
				}
			}
		});
	}

	// candidate pool list component as a pop up dialog open
	public openDialogList(liRequestData: any, onCloseCallBack: () => void) {
		const actionItemsTrue = this.gridConfiguration.showViewEditIcon(this.onView.bind(this), this.onAddEdit.bind(this), 'Fill'),
			actionItemsFalse = this.gridConfiguration.showViewEditIcon(this.onView.bind(this), this.onAddEdit.bind(this, liRequestData), 'Fill'),
			actionList: any = [
				{
					Status: true,
					Items: actionItemsTrue
				},
				{
					Status: false,
					Items: actionItemsFalse
				}
			];
		this.dialogRefList = this.kendoDialogService.open({
			title: '<span class="k-icon k-i-close" (click)="closeDialog()"></span>',
			content: ListComponent,
			cssClass: 'fill-requestv2-dialog fill-requestv2-dialog-popup'
		});
		this.dialogRefList.result.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((result) => {
			if (result === 'recallPositionDetails') {
				onCloseCallBack();
			}
		});
		// instance of list component to manage page both as a pop-up and as a component
		this.dialogRefList.content.instance.overrideActions = true;
		this.dialogRefList.content.instance.showTabs = false;
		this.dialogRefList.content.instance.fillButton = true;
		// to show action-set on popuplist
		this.dialogRefList.content.instance.ActionList = actionList;
		// liRequestData is passed to list component to manage the fill a new candidate as a pop-up from list
		this.dialogRefList.content.instance.liRequestData = liRequestData;
		this.dialogRefList.content.instance.parentEntity = ParentEntity.LiRequest;
		// reset error toaster in case of close/cross button click
		this.resetErrorToaster();
	}

	// action for view button in candidate pool list component as a pop up dialog
	private onView(dataItem: any) {
		this.openDialogView(dataItem?.UKey);
	}

	// action for edit button in candidate pool list component as a pop up dialog
	private onAddEdit(liRequestData: any, candidateDataItem: any) {
		this.openDialogAddEdit(candidateDataItem?.UKey, liRequestData);
	}

	// candidate pool view component as a pop up dialog open
	private openDialogView(id: any) {
		this.dialogRefView = this.kendoDialogService.open({
			title: '<span class="k-icon k-font-icon k-i-close" (click)="closeDialog()"></span>',
			content: ViewComponent,
			cssClass: 'fill-requestv2-dialog fill-requestv2-dialog-popup fill-requestv2-dialog-view'
		});
		this.dialogRefView.content.instance.backFromPopup = true;
		this.dialogRefView.content.instance.parentEntity = ParentEntity.LiRequest;
		this.dialogRefView.content.instance.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param: any) => {
			if (param != null || param != '') {
				param.id = id;
				this.dialogRefView.content.instance.getCandidatePoolById(param.id);
			}
		});
	}

	// for candidate add/edit pop-up call
	public openDialogAddEdit(uKey: any, liRequestData: any, onCloseCallBack?: () => void) {
		this.dialogRefAddEdit = this.kendoDialogService.open({
			title: '<span class="k-icon k-font-icon k-i-close" (click)="closeDialog()"></span>',
			content: PopupAddEditComponent,
			cssClass: 'fill-requestv2-dialog fill-requestv2-dialog-popup fill-requestv2-dialog-view'
		});
		this.dialogRefAddEdit.result.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((result) => {
			// in case of edit tentative candidate, close the dialog and refresh the list
			if (result === 'recallPositionDetails') {
				if (onCloseCallBack) {
					onCloseCallBack();
				}
			}
			// reset error toaster in case of close/cross button click
			this.resetErrorToaster();
			this.toasterService.resetToaster();

		});
		this.dialogRefAddEdit.content.instance.activatedRoute.params.pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((param: any) => {
			if (param != null || param != '') {
				param.uKey = uKey;
				param.liRequestData = liRequestData;
			}
		});
	}

	// close list dialog popup
	public closeDialogList(recallPositionDetails?: any) {
		this.dialogRefList.close(recallPositionDetails);
	}

	// close view dialog popup
	public closeDialogView() {
		this.dialogRefView.close();
	}

	// close add edit dialog popup
	public closeDialogAddEdit(isTentaiveCandidate?: any) {
		if (isTentaiveCandidate) {
			// 'recallPositionDetails' parameter to refresh the list in case of edit filled candidate
			this.dialogRefAddEdit.close('recallPositionDetails');
		} else {
			// call list dialog popup close with recallPositionDetails parameter to refresh the list
			this.dialogRefAddEdit.close();
			this.closeDialogList('recallPositionDetails');
		}
	}

	// back/cancel from add edit dialog popup
	public backDialogAddEdit() {
		this.dialogRefAddEdit.close();
	}

	public resetErrorToaster() {
		const lastToaster = this.toasterService.data[this.toasterService.data.length - magicNumber.one];
		if (lastToaster && lastToaster.cssClass === 'alert__danger') {
			// Reset the toaster with the specified toasterId
			this.toasterService.resetToaster(lastToaster.toasterId);
		}
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

}

