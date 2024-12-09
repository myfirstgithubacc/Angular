/* eslint-disable max-lines-per-function */
import { Injectable } from "@angular/core";
import { Permission } from "@xrm-shared/enums/permission.enum";
import { ActivateDeactivate } from "@xrm-shared/models/activate-deactivate.model";
import { BehaviorSubject } from "rxjs";

export const gridSetting = {
	pagingPositionTop: 'top',
	pagingPositionBottom: 'bottom',
	pagingPositionboth: 'both',

	// icons used to show in action column of grid
	eyeIcon: 'eye',
	editIcon: 'edit-3',
	activateIcon: 'check',
	deactivateIcon: 'x',
	copyIcon: 'copy',
	download: 'download',
	upload: 'upload',
	history: 'arrow-circle',
	checkFile: 'check-file',
	calendar: 'calendar',
	clock: 'clock',
	withdraw: 'withdraw',
	process: 'process',
	clockPlusMinus: 'clock-plus-minus',
	submittal: 'file-text',
	settingCheck: 'setting-check',
	fileEye: 'file-eye',
	execute: 'setting-check4',
	delete: 'trash-2'
};

@Injectable({ providedIn: 'root' })
export class GridConfiguration {

	private isGridReferesh = new BehaviorSubject<boolean>(false);
	isGridRefereshObj = this.isGridReferesh.asObservable();

	// shows all three action icons those are view, edit and deactivate
	// eslint-disable-next-line max-lines-per-function
	public showAllActionIcon(onView: any, onEdit: any, onActiveChange: any) {
		return [
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
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			},
			{
				icon: gridSetting.deactivateIcon,
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
	}

	public showInactiveActionIcon(onView: any, onEdit: any, onActiveChange: any) {
		return [
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
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			},
			{
				icon: gridSetting.activateIcon,
				color: 'green-color',
				title: 'Activate',
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
	}

	// shows two action icons those are view and activate
	public showViewActivateActionIcon(onView: any, onEdit: any, onActiveChange: any) {
		return [
			{
				icon: gridSetting.eyeIcon,
				title: 'View',
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
				icon: gridSetting.activateIcon,
				title: 'Activate',
				color: 'green-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__ACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__ACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__ACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE
				]
			}
		];
	}

	// shows two action icons those are view and edit
	public showViewEditIcon(onView: any, onEdit: any, editToolTipText: string = 'Edit') {
		return [
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
				title: editToolTipText,
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
	}

	// shows two action icons those are view and Review
	public showViewReviewIcon(onView: any, onEdit: any, editToolTipText: string = 'Edit') {
		return [
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
				icon: gridSetting.checkFile,
				title: 'Review',
				color: 'light-blue-color',
				fn: onEdit,
				actionId: [
					Permission.REVIEW_ONLY,
					Permission.REVIEW_APPROVE,
					Permission.REVIEW_DECLINE
				]
			}
		];
	}

	// shows two action icons those are view and Adjustment Review
	public showViewAdjustIcon(onView: any, onAdjust: any) {
		return [
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
				icon: gridSetting.clockPlusMinus,
				title: 'Adjust Timesheet',
				color: 'green-color',
				fn: onAdjust,
				actionId: [
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT__CREATE
				]
			}
		];
	}

	public showDownloadUploadHistoryIcon(onDownload: any, onUplaod: any, onHistory: any = '') {
		return [
			{
				icon: gridSetting.download,
				title: 'DownloadTemplate',
				color: 'dark-blue-color',
				fn: onDownload,
				actionId: [Permission.Download]
			},
			{
				icon: gridSetting.upload,
				title: 'UploadTemplate',
				color: 'orange-color',
				fn: onUplaod,
				actionId: [Permission.Download]
			},
			{
				icon: gridSetting.history,
				title: 'UploadHistory',
				color: 'green-color',
				fn: onHistory,
				actionId: [Permission.Download]
			}
		];
	}

	public showProcessedDownloadIcon(onSuccessDownload: any, onFailedDownload: any) {
		return [
			{
				icon: gridSetting.download,
				title: 'DownloadSuccessRecords',
				color: 'green-color',
				fn: onSuccessDownload,
				actionId: [Permission.Download]
			},
			{
				icon: gridSetting.download,
				title: 'DownloadFailedRecords',
				color: 'red-color',
				fn: onFailedDownload,
				actionId: [Permission.Download]
			}
		];
	}

	public showFailedDownloadIcon(onFailedDownload: any) {
		return [
			{
				icon: gridSetting.download,
				title: 'DownloadFailedRecords',
				color: 'red-color',
				fn: onFailedDownload,
				actionId: [Permission.Download]
			}
		];
	}

	public showSuccessDownloadIcon(onSuccessDownload: any, color:boolean = false) {
		return [
			{
				icon: gridSetting.download,
				title: color
					?'View'
					:'DownloadSuccessRecords',
				color: color
					?'dark-blue-color'
					:'green-color',
				fn: onSuccessDownload,
				actionId: [Permission.Download]
			}
		];
	}

	public showCrossIcon(onCancel: any) {
		return [
			{
				icon: gridSetting.deactivateIcon,
				title: 'Cancel',
				color: 'red-color',
				fn: onCancel,
				actionId: [Permission.Download]
			}
		];
	}

	public showViewIcon(onView: any) {
		return [
			{
				icon: gridSetting.eyeIcon,
				title: 'View',
				color: 'dark-blue-color',
				fn: onView,
				actionId: [Permission.Download]
			}
		];
	}

	public showViewAndDeactiveActionIcon(onView: any, onActiveChange: any) {
		return [
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
				icon: gridSetting.deactivateIcon,
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
	}

	public showViewAndActivateActionIcon(onView: any, onActiveChange: any) {
		return [
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
				icon: gridSetting.activateIcon,
				title: 'Activate',
				color: 'green-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__ACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__ACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__ACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE
				]
			}
		];
	}
	// shows copy action icon
	public showCopyButtonIcon(griHeaderType: any) {
		return [
			{
				icon: gridSetting.copyIcon,
				type: griHeaderType.copy
			}
		];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, max-params, max-lines-per-function
	public showDeactiveIconWithExecute(onView: any, onEdit: any, onActiveChange: any, onExecuted:any) {
		return [
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
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			},
			{
				icon: gridSetting.deactivateIcon,
				title: 'Deactivate',
				color: 'red-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			},
			{
				icon: gridSetting.execute,
				title: 'Execute',
				color: 'green-color',
				fn: onExecuted,
				actionId: [Permission.AUTO_PROCESS_EXECUTE]
			}
		];
	}

	// eslint-disable-next-line max-params
	public showActiveIconWithExecute(onView: any, onEdit: any, onActiveChange: any) {
		return [
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
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT,
					Permission.Edit
				]
			},
			{
				icon: gridSetting.activateIcon,
				title: 'Activate',
				color: 'green-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__ACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__ACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__ACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE
				]
			}
		];
	}

	public showEditDeactive( onEdit: any, onActiveChange: any, isDeleted: boolean=false) {
		return [
			{
				icon: gridSetting.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			},
			{
				icon: gridSetting.deactivateIcon,
				title: isDeleted
					?'Delete'
					:'Deactivate',
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
	}
	public showEditActive( onEdit: any, onActiveChange: any) {
		return [
			{
				icon: gridSetting.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			},
			{
				icon: gridSetting.activateIcon,
				title: 'Activate',
				color: 'green-color',
				fn: onActiveChange,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			}
		];
	}

	public showDeleteIcon( onDelete:any) {
		return [
			{
				icon: gridSetting.delete,
				title: 'Delete',
				color: 'red-color',
				fn: onDelete,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			}
		];
	}

	public showEditViewScheduleIcon(onView: any, onEdit: any, onSchedule: any) {
		return [
			{
				icon: gridSetting.eyeIcon,
				title: 'View',
				color: 'dark-blue-color',
				fn: onView,
				actionId: [
					Permission.Edit,
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
					Permission.Edit,
					Permission.CREATE_EDIT__EDIT,
					Permission.CREATE_EDIT_MSP_USER__EDIT,
					Permission.CREATE_EDIT_CLIENT_USER__EDIT,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__EDIT
				]
			},
			{
				icon: gridSetting.calendar,
				title: 'ShiftCalendar',
				color: 'light-blue-color',
				fn: onSchedule,
				actionId: [Permission.VIEW_SHIFT_SCHEDULE]
			}
		];
	}

	showEditOnly(onEdit:any){
		return [
			{
				icon: gridSetting.editIcon,
				title: 'Edit',
				color: 'orange-color',
				fn: onEdit,
				actionId: [
					Permission.CREATE_EDIT__DEACTIVATE,
					Permission.CREATE_EDIT_MSP_USER__DEACTIVATE,
					Permission.CREATE_EDIT_CLIENT_USER__DEACTIVATE,
					Permission.CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE
				]
			}
		];
	}
	// reset grid data
	public refreshGrid(isRefresh = true) {
		this.isGridReferesh.next(isRefresh);
	}

	makeStatusPayload<T>(rowIds: string[], action: boolean): ActivateDeactivate[] {
		let payload: ActivateDeactivate[] = [];
		payload = [
			...new Set(rowIds.map((item) =>
				({
					UKey: item,
					Disabled: action,
					ReasonForChange: ''
				})))
		];

		return payload;
	}
}
