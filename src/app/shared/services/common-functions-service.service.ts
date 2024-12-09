import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { magicNumber } from './common-constants/magic-number.enum';

		@Injectable({
			providedIn: 'root'
		})
export class CommonFunctionsService {

	private recordStatus = "StatusName";

	private statusCode = "ExpenseEntryCode";

	private entityId= "ExpenseEntryID";

	private statusCardData: StatusCardData = {

		items: [

			{

				title: 'ExpenseEntryCode',

				cssClass: ['basic-title']

			},

			{

				title: 'ContractorName',

				cssClass: ['basic-code']

			},

			{

				title: 'AssignmentID',

				cssClass: ['basic-code'],

				isLinkable: true,

				linkParams: '#assignmentDetails'

			},

			{

				title: 'TotalAmount',

				item: 'DynamicCurrency',

				itemDynamicParam: [

					{ Value: '0.00', IsLocalizeKey: false },

					{ Value: 'USD', IsLocalizeKey: false }

				],

				cssClass: ['basic-code']

			},

			{

				title: 'Disabled',

				cssClass: ['basic-code']

			}

		]

	};

	private dataSource = new BehaviorSubject<StatusCardData>(this.statusCardData);

	currentData = this.dataSource.asObservable();

	private status = new BehaviorSubject<number>(magicNumber.zero);

	statusBar = this.status.asObservable();

	private current = new BehaviorSubject<number>(magicNumber.zero);

	currentStep = this.status.asObservable();

	// Method to update the status bar

	updateStatus(status: number) {

		this.status.next(status);

	}

	updateCurrentStatus(current: number) {

		this.current.next(current);

	}

	// Method to update a particular item

	updateItem(index: number, newItem: any) {

		const currentData = this.dataSource.getValue();

		currentData.items[index] = newItem;

		this.dataSource.next(currentData);

	}

	updatePropertyByIndex(index: number, property: string, value: any) {

		const currentData = this.dataSource.getValue();

		if (index >= magicNumber.zero && index < currentData.items.length) {

			currentData.items[index][property] = value;

			this.dataSource.next(currentData);

		}

	}

	addItemAtIndex(index: number, newItem: StatusCardItem) {

		const currentData = this.dataSource.getValue();

		if (index >= magicNumber.zero && index <= currentData.items.length) {

			currentData.items.splice(index, magicNumber.zero, newItem);

			this.dataSource.next(currentData);

		} else {

			// console.error(`Index ${index} is out of bounds.`);

		}

	}

	// Method to remove an item by index

	removeItem(index: number) {

		const currentData = this.dataSource.getValue();

		if (index >= magicNumber.zero && index < currentData.items.length) {

			currentData.items.splice(index, 1);

			this.dataSource.next(currentData);

		} else {

			// console.error(`Item at index ${index} not found.`);

		}

	}

	removeItems(indices: number[]) {

		const currentData = this.dataSource.getValue(),

			// Sort indices in descending order to avoid index shifting issues while removing items

			sortedIndices = indices.sort((a, b) => b - a);

		sortedIndices.forEach((index) => {

			if (index >= magicNumber.zero && index < currentData.items.length) {

				currentData.items.splice(index, 1);

			} else {

				// console.error(`Item at index ${index} not found.`);

			}

		});

		this.dataSource.next(currentData);

	}

	// Method to update the entire array

	updateAllItems(newItems: any[]) {

		const currentData = this.dataSource.getValue();

		currentData.items = newItems;

		this.dataSource.next(currentData);

	}

	resetStatusCardData() {

		const currentData = this.dataSource.getValue();

		this.dataSource.next(currentData);

	}
}

		interface StatusCardItem {

		title: string;

		cssClass: string[];

		item?: string;

		isLinkable?: boolean;

		linkParams?: string;

		[key: string]: any;

		}

export interface StatusCardData {

		items: StatusCardItem[];

		}
