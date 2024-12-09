import { Injectable } from '@angular/core';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { ActionToAdd } from './common-header-action.service';
export const commonHeaderActionIcon = {
	eyeIcon: 'eye'

};

@Injectable({
	providedIn: 'root'
})
export class CommonHeaderActionLIService {

	// shows Action Icons for Light-Industrial
	public commonActionSetForLI(onView: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.eyeIcon,
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

	// shows Action Icons for Review Candiates
	public commonActionSetForReview(onView: any, actionsToAdd?: ActionToAdd[]) {
		const listOfAction = [
			{
				icon: commonHeaderActionIcon.eyeIcon,
				title: 'View',
				color: 'dark-blue-color',
				fn: onView,
				actionId: [
					Permission.PRE_SCREENING,
					Permission.CREATE_EDIT__VIEW,
					Permission.CREATE_EDIT_MSP_USER__VIEW,
					Permission.CREATE_EDIT_CLIENT_USER__VIEW,
					Permission.VIEW_ONLY,
					Permission.VIEW_MSP_USER,
					Permission.VIEW_CLIENT_USER
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
