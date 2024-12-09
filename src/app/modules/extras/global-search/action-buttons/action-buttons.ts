/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
import { Injectable } from "@angular/core";
import { Permission } from "@xrm-shared/enums/permission.enum";

export const gridSetting = {
	pagingPositionTop: 'top',
	pagingPositionBottom: 'bottom',
	pagingPositionboth: 'both',
	eyeIcon: 'eye',
	editIcon: 'edit-3'
};

@Injectable({ providedIn: 'root' })
export class ActionButtons {

	public LiRequestActionItems(onView: any, onEdit: any, onBroadcast: any, onReview:any, onFillRequest:any){
		return [
			{
				Status: "121",
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'broadcast-tower', color: 'red-color', title: 'Broadcast', fn: onBroadcast,
						actionId: [Permission.PROCESS_AND_BROADCAST]
					},
					{ icon: 'file-text', color: 'dark-blue-color', title: 'Fill a Request', fn: onFillRequest, actionId: [Permission.FILL_CANDIDATE] }

		 ]
			},
			{
				Status: "118",
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
						actionId: [
							Permission.CREATE_EDIT__EDIT,
							Permission.CREATE_EDIT_MSP_USER__EDIT,
							Permission.CREATE_EDIT_CLIENT_USER__EDIT
						]
					 }
			 ]
			},
			{
				Status: "115",
				Items: [
					{
						icon: 'eye',
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
			 ]
			},
			{
				Status: "116",
				Items: [
					{
						icon: 'eye',
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
			 ]
			},
			{
				Status: "117",
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'broadcast-tower', color: 'red-color', title: 'Broadcast', fn: onBroadcast,
						actionId: [Permission.PROCESS_AND_BROADCAST]
					}
		 ]
			},
			{
				Status: "112",
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'check-file', color: 'light-blue-color', title: 'Review Request', fn: onReview, actionId: [Permission.REVIEW_APPROVE] }
		 ]
			},
			{
				Status: "113",
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'check-file', color: 'light-blue-color', title: 'Review Request', fn: onReview, actionId: [Permission.REVIEW_APPROVE] }
		 ]
			}
		];
	}

	public CandidateActionItems(onView: any, onEdit: any){
		return [
			{
				Status: false,
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					}
		 ]
			},
			{
				Status: true,
				Items: [
					{
						icon: 'eye',
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: onEdit,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					}
		 ]
			}
		];
	}

	public AssignmentsActionItems(onViewContractor: any, onEditContractor:any, onViewAssignment: any, onEditAssignment: any, onShift:any){
		return [
			{
				Status: '137',
				Items: [
					{
						icon: 'eye',
						title: 'View Worker',
						color: 'dark-blue-color',
						fn: onViewContractor,
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit Worker', fn: onEditContractor,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{
						icon: 'eye',
						title: 'View Assignment',
						color: 'red-color',
						fn: onViewAssignment,
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
					{ icon: 'edit-3', color: 'red-color', title: 'Edit Assignment', fn: onEditAssignment,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'calendar', color: 'light-blue-color', title: 'Shift Calendar', fn: onShift,
						actionId: [
							Permission.CREATE_EDIT__EDIT,
							Permission.CREATE_EDIT_MSP_USER__EDIT,
							Permission.CREATE_EDIT_CLIENT_USER__EDIT
						]
					}
		 ]
			},
			{
				Status: '139',
				Items: [
					{
						icon: 'eye',
						title: 'View Worker',
						color: 'dark-blue-color',
						fn: onViewContractor,
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit Worker', fn: onEditContractor,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{
						icon: 'eye',
						title: 'View Assignment',
						color: 'red-color',
						fn: onViewAssignment,
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
					{ icon: 'edit-3', color: 'red-color', title: 'Edit Assignment', fn: onEditAssignment,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'calendar', color: 'light-blue-color', title: 'Shift Calendar', fn: onShift,
						actionId: [
							Permission.CREATE_EDIT__EDIT,
							Permission.CREATE_EDIT_MSP_USER__EDIT,
							Permission.CREATE_EDIT_CLIENT_USER__EDIT
						]
					}
		 ]
			},
			{
				Status: '138',
				Items: [
					{
						icon: 'eye',
						title: 'View Worker',
						color: 'dark-blue-color',
						fn: onViewContractor,
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit Worker', fn: onEditContractor,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{
						icon: 'eye',
						title: 'View Assignment',
						color: 'red-color',
						fn: onViewAssignment,
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
					{ icon: 'edit-3', color: 'red-color', title: 'Edit Assignment', fn: onEditAssignment,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'calendar', color: 'light-blue-color', title: 'Shift Calendar', fn: onShift,
						actionId: [
							Permission.CREATE_EDIT__EDIT,
							Permission.CREATE_EDIT_MSP_USER__EDIT,
							Permission.CREATE_EDIT_CLIENT_USER__EDIT
						]
					}
		 ]
			},
			{
				Status: '140',
				Items: [
					{
						icon: 'eye',
						title: 'View Worker',
						color: 'dark-blue-color',
						fn: onViewContractor,
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
					{ icon: 'edit-3', color: 'orange-color', title: 'Edit Worker', fn: onEditContractor,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{
						icon: 'eye',
						title: 'View Assignment',
						color: 'red-color',
						fn: onViewAssignment,
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
					{ icon: 'edit-3', color: 'red-color', title: 'Edit Assignment', fn: onEditAssignment,
					 actionId: [
					   	Permission.CREATE_EDIT__EDIT,
					   	Permission.CREATE_EDIT_MSP_USER__EDIT,
					   	Permission.CREATE_EDIT_CLIENT_USER__EDIT
					   ]
					},
					{ icon: 'calendar', color: 'light-blue-color', title: 'Shift Calendar', fn: onShift,
						actionId: [
							Permission.CREATE_EDIT__EDIT,
							Permission.CREATE_EDIT_MSP_USER__EDIT,
							Permission.CREATE_EDIT_CLIENT_USER__EDIT
						]
					}
		 ]
			}
		];
	}
}
