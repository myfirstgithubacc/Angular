import { Injectable } from '@angular/core';
import { ActionToAdd } from './common-header-action.service';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { gridSetting } from './gridSetting';
import { IRequestUkeyData } from 'src/app/modules/job-order/professional/interface/shared-data.interface';

@Injectable({
	providedIn: 'root'
})
export class CommonHeaderActionProffService {

	// shows Action Icons for Professional Request
	public commonActionSetForProff(
		onView: (dataItem: IRequestUkeyData) => void,
		onEdit: (dataItem: IRequestUkeyData) => void,
		actionsToAdd?: ActionToAdd[]
	) {
		const listOfAction = [
			{
				icon: gridSetting.eyeIcon,
				title: 'View',
				color: 'dark-blue-color',
				fn: onView,
				actionId: [
					Permission.CREATE_EDIT__VIEW,
					Permission.CREATE_EDIT_MSP_USER__VIEW,
					Permission.CREATE_EDIT_CLIENT_USER__VIEW,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__VIEW,
					Permission.VIEW_ONLY,
					Permission.VIEW_MSP_USER,
					Permission.VIEW_CLIENT_USER,
					Permission.VIEW_STAFFING_AGENCY_USER
				]
			},
			{
				icon: gridSetting.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
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
}
