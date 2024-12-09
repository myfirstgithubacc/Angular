import { Injectable } from '@angular/core';
import { NavigationUrls, StatusId } from './Constants.enum';
import { Action, IActionItem, PRDetails, SubmittalGetAll } from './Interfaces';
import { gridSetting } from '@xrm-shared/services/common-constants/gridSetting';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class SubmittalActionsetService {

	public isCameFromProfReq: boolean = false;
	public sectorLabel: string = 'Sector';
	public profReqData: PRDetails|null;

	constructor(private router: Router) { }

	public makeActionSetForMsp(): IActionItem[] {
		const actionSet: IActionItem[] = [
			{
				Status: StatusId.Withdrawn,
				Items: [this.getViewActionSet()]
			},
			{
				Status: StatusId.Submitted,
				Items: [
					this.getViewActionSet(),
					this.getProcessActionSet()
				]
			},
			{
				Status: StatusId.Forwarded,
				Items: [
					this.getViewActionSet(),
					this.getProcessActionSet()
				]
			},
			{
				Status: StatusId.Received,
				Items: [
					this.getViewActionSet(),
					this.getProcessActionSet()
				]
			},
			{
				Status: StatusId.Declined,
				Items: [
					this.getViewActionSet(),
					this.getProcessActionSet()
				]
			},
			{
				Status: StatusId.ViewByMSP,
				Items: [
					this.getViewActionSet(),
					this.getProcessActionSet()
				]
			}
		];
		return actionSet.concat(this.getRemainingActionMsp());
	}

	private getRemainingActionMsp(): IActionItem[] {
		return [
			{
				Status: Number(StatusId.ReSubmitted),
				Items: [
					this.getViewActionSet(),
					this.getProcessActionSet()
				]
			}
		];
	}

	public makeActionSetForClient(): IActionItem[] {
		const actionSet: IActionItem[] = [
			{
				Status: StatusId.Withdrawn,
				Items: [this.getViewActionSet()]
			},
			{
				Status: StatusId.Submitted,
				Items: [this.getViewActionSet()]
			},
			{
				Status: StatusId.Forwarded,
				Items: [
					this.getViewActionSet(),
					this.getReviewActionSet()
				]
			},
			{
				Status: StatusId.Received,
				Items: [this.getViewActionSet()]
			},
			{
				Status: StatusId.Declined,
				Items: [this.getViewActionSet()]
			},
			{
				Status: Number(StatusId.ReSubmitted),
				Items: [this.getViewActionSet()]
			}
		];
		return actionSet;
	}

	public makeActionSetForStaffing(): IActionItem[] {
		const actionSet: IActionItem[] = [
			{
				Status: StatusId.Submitted,
				Items: [
					this.getViewActionSet(),
					this.getWithdrawActionSet()
				]
			},
			{
				Status: StatusId.Forwarded,
				Items: [
					this.getViewActionSet(),
					this.getWithdrawActionSet()
				]
			},
			{
				Status: StatusId.Received,
				Items: [
					this.getViewActionSet(),
					this.getWithdrawActionSet()
				]
			},
			{
				Status: StatusId.Declined,
				Items: [
					this.getViewActionSet(),
					this.getWithdrawActionSet()
				]
			},
			{
				Status: StatusId.ViewByMSP,
				Items: [
					this.getViewActionSet(),
					this.getWithdrawActionSet()
				]
			}
		];
		return actionSet.concat(this.getRemainingActionSet());
	}

	private getRemainingActionSet(): IActionItem[]{
		return [
			{
				Status: Number(StatusId.Drafted),
				Items: [
					this.getViewActionSet(),
					this.getEditActionSet()
				]
			},
			{
				Status: Number(StatusId.Withdrawn),
				Items: [
					this.getViewActionSet(),
					this.getEditActionSet()
				]
			},
			{
				Status: Number(StatusId.ReSubmitted),
				Items: [
					this.getViewActionSet(),
					this.getWithdrawActionSet()
				]
			}
		];
	}

	private getEditActionSet(): Action {
		return {
			icon: gridSetting.editIcon,
			title: 'Edit',
			color: 'orange-color',
			fn: this.onEdit,
			actionId: [Permission.CREATE_EDIT__EDIT]
		};
	};

	private getWithdrawActionSet(): Action {
		return {
			icon: gridSetting.withdraw,
			title: 'Withdraw',
			color: 'red-color',
			fn: this.onWithdraw,
			actionId: [Permission.WITHDRAW]
		};
	};

	private getViewActionSet(): Action {
		return {
			icon: gridSetting.eyeIcon,
			title: 'View',
			color: 'dark-blue-color',
			fn: this.onView,
			actionId: [
				Permission.CREATE_EDIT__VIEW,
				Permission.VIEW_ONLY
			]
		};
	};

	private getProcessActionSet(): Action {
		return {
			icon: gridSetting.process,
			title: 'Process',
			color: 'orange-color',
			fn: this.onProcess,
			actionId: [
				Permission.FORWARD,
				Permission.WITHDRAW,
				Permission.Decline,
				Permission.Receive
			]
		};
	};

	private getReviewActionSet(): Action {
		return {
			icon: gridSetting.checkFile,
			title: 'Review',
			color: 'light-blue-color',
			fn: this.onReview,
			actionId: [Permission.CREATE_EDIT__VIEW]
		};
	};

	private onView = (dataItem: SubmittalGetAll): void => {
		this.router.navigate(
			[`${NavigationUrls.View}${dataItem.SubmittalUkey}`],
			{ state: { sectorLabel: this.sectorLabel, isCameFromProfReq: this.isCameFromProfReq, requestUkey: this.profReqData?.RequestUkey } }
		);
	};

	private onProcess = (dataItem: SubmittalGetAll): void => {
		this.router.navigate(
			[`${NavigationUrls.Process}/${dataItem.SubmittalUkey}`],
			{ state: { sectorLabel: this.sectorLabel, isCameFromProfReq: this.isCameFromProfReq, requestUkey: this.profReqData?.RequestUkey } }
		);
	};

	private onWithdraw = (dataItem: SubmittalGetAll): void => {
		this.router.navigate(
			[`${NavigationUrls.Withdraw}${dataItem.SubmittalUkey}`],
			{
				state: {
					isCameFromProfReq: this.isCameFromProfReq,
					requestUkey: this.profReqData?.RequestUkey
				}
			}
		);
	};

	private onReview = (dataItem: SubmittalGetAll): void => {
		this.router.navigate(
			[`${NavigationUrls.Review}${dataItem.SubmittalUkey}`],
			{ state: { isCameFromProfReq: this.isCameFromProfReq, requestUkey: this.profReqData?.RequestUkey } }
		);
	};


	private onEdit = (dataItem: SubmittalGetAll): void => {
		this.router.navigate(
			[`${NavigationUrls.Edit}${dataItem.SubmittalUkey}`],
			{ state: { sectorLabel: this.sectorLabel, isCameFromProfReq: this.isCameFromProfReq, requestUkey: this.profReqData?.RequestUkey } }
		);
	};

}
