/* eslint-disable no-shadow */
/* eslint-disable no-magic-numbers */

import { Location } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { ITabOption } from "@xrm-shared/models/tab-option.model";

export const enum statusIds {
	Draft = 165,
	Declined = 166,
	Submitted = 167,
	ReSubmitted = 168,
	PartiallyApproved = 169,
	Approved = 170,
	Posted = 171,
	PartiallyInvoiced = 173,
	Invoiced = 172,
	PartiallyPaid = 175,
	Paid = 174,
	TimeSheetApprove = 198,
	TimeSheetdecline = 194
}

export const enum timeSheetStatusIds {
	Draft = 193,
	Declined = 194,
	Submitted = 195,
	ReSubmitted = 196,
	PartiallyApproved = 197,
	Approved = 198,
	Posted = 199,
	Invoiced = 200,
	PartiallyInvoiced = 201,
	Paid = 202,
	PartiallyPaid = 203
}

export const enum NatureOfExpenses {
	AmountOnly = 258,
	HoursAndAmount = 259,
	Mileage = 260
}


export const TIMEANDEXPENTRYSELECTION = 'EntrySelection';

@Injectable({
	providedIn: 'root'
})
export class TabManager {
	private loca: Location;
	public static readonly tabOptions: ITabOption = {
		bindingField: 'Status',
		tabList: [
			{
				tabName: 'Draft',
				favourableValue: 'Draft',
				selected: true
			},
			{
				tabName: 'Declined',
				favourableValue: "Declined",
				selected: false
			},
			{
				tabName: 'PendingforReview',
				favourableValue: "ReviewPending",
				selected: false
			},
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: false
			}
		]
	};

	public static readonly actionSets = [
		{ Status: 'Draft' },
		{ Status: 'Declined' },
		{ Status: 'ReviewPending' },
		{ Status: 'Other' }
	];


	constructor() {
		this.loca = inject(Location);
	}

	selectTab() {
		const tabName = 'Draft';
		// eslint-disable-next-line one-var
		const updatedTabOptions: ITabOption = {
			...TabManager.tabOptions,
			tabList: TabManager.tabOptions.tabList.map((tab) => {
				return {
					...tab,
					selected: tab.tabName === tabName
				};
			})
		};
		return updatedTabOptions;
	}

	getTabName() {
		const state = this.loca.getState() as { defaultSelectedTab?: string },
			defaultSelectedTab = state.defaultSelectedTab ?? 'Draft';
		return defaultSelectedTab;
	}

}
