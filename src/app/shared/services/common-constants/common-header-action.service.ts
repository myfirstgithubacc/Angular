import { Injectable } from '@angular/core';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ShowApiResponseMessage } from '../common-methods/show-api-message';
import { HttpStatusCode } from './HttpStatusCode.enum';
import { ActivateDeactivate } from '@xrm-shared/models/activate-deactivate.model';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
export const commonHeaderActionIcon = {
	editIcon: 'edit-3',
	activateIcon: 'check',
	deactivateIcon: 'x',
	lockIcon: 'lock',
	unlockIcon: 'unlock'

};

@Injectable({
	providedIn: 'root'
})
export class CommonHeaderActionService {


	// shows copy action icon
	public commonActionSetOnActive(onEdit: any, onActiveChange: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			},
			{
				icon: commonHeaderActionIcon.deactivateIcon,
				title: 'Deactivate',
				color: 'red-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE,
					Permission.MANAGE_COUNTRY_DEACTIVATE
				]
			}
		];
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}
	public commonActionSetOnDeactive(onActiveChange: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.activateIcon,
				title: 'Activate',
				color: 'green-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__ACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__ACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__ACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE,
					Permission.MANAGE_COUNTRY_ACTIVATE
				]
			}
		];
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}

	public commonActionSetOnDeactiveView(
		onEdit: any,
		onActiveChange: any,
		actionsToAdd?: ActionToAdd[]
	) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			},
			{
				icon: commonHeaderActionIcon.activateIcon,
				title: 'Activate',
				color: 'green-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__ACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__ACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__ACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE,
					Permission.MANAGE_COUNTRY_ACTIVATE
				]
			}
		];
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}


	public commonActionSetOfEditIconToShowView(
		onEdit: any,
		actionsToAdd?: ActionToAdd[],
		addActionId?: any
	) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			}
		];
		if(addActionId)
		{
			listOfAction[0].actionId.push(addActionId);
		}
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}

	public commonActionSetOnEditActive(onActiveChange: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.deactivateIcon,
				title: 'Deactivate',
				color: 'red-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			}
		];
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}

	public commonActionSetOnEditDraft(onActiveChange: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT
				]
			}
		];
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}
	public commonActionSetOnActiveEdit(onActiveChange: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.deactivateIcon,
				title: 'Deactivate',
				color: 'red-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE,
					Permission.MANAGE_COUNTRY_DEACTIVATE
				]
			}
		];
		if (actionsToAdd) {
			listOfAction.push(...actionsToAdd);
			return listOfAction;
		}
		else {
			return listOfAction;
		}
	}

	public holdData = new BehaviorSubject<any>(null);
	getData = this.holdData.asObservable();

	// shows two action icons those are view and activate
	public ActivateDeactivateRestMealBreakConfiguration(dataItem: ActivateDeactivate[]) {
		/* this.restMealBreakService.updateRestMealBreakConfigurationStatus(dataItem).pipe(takeUntil(this.destroyAllSubscribtion$))
		   	.subscribe((response: any) => {
		   		if (response.Succeeded) {
		   if (dataItem[0].Disabled) {
		   	this.recordStatus = 'Inactive';
		   	this.statusCardData.items[1] = { item: this.recordStatus, cssClass: ['red-color'], title: 'Disabled' };
		   	this.statusForm.controls['status'].setValue({
		   		Text: this.recordStatus,
		   		Value: this.recordStatus
		   	});
		   	this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenDeactivatedSuccessfully',
				 this.restMealBreakConfigurationLabelTextParams);
		   } else {
		   	this.recordStatus = 'Active';
		   	this.statusCardData.items[1] = { item: this.recordStatus, cssClass: ['green-color'], title: 'Disabled' };
		   	this.statusForm.controls['status'].setValue({
		   		Text: this.recordStatus,
		   		Value: this.recordStatus
		   	});
		   	this.toasterService.showToaster(ToastOptions.Success, 'EntityHasBeenActivatedSuccessfully',
				 this.restMealBreakConfigurationLabelTextParams);
		   }
		   this.cdr.detectChanges();
		   	}
		   	else if ('ValidationMessages' in response && response.ValidationMessages.length) {
		   		ShowApiResponseMessage.showMessage(response, this.toasterService, this.localizationService);
		   	}
		   	else if (response.StatusCode == HttpStatusCode.Conflict) {
		   		this.toasterService.displayToaster(ToastOptions.Error, 'EnitityAlreadyExists');
		   	}
		   	else {
		   		this.toasterService.displayToaster(ToastOptions.Error, response.Message);
		   	}
		   }); */
	}
}

export interface ActionToAdd {
	icon: string;
	color:string;
	title: string;
	fn: any;
	actionId: any
}
