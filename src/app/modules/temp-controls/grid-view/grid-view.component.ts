import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { PopupDialogButtons } from '@xrm-shared/services/common-constants/popup-buttons';
import { DialogPopupService } from '@xrm-shared/services/dialog-popup.service';
import { GridViewService } from '../../../shared/services/grid-view.service';

@Component({selector: 'app-grid-view',
	templateUrl: './grid-view.component.html',
	styleUrls: ['./grid-view.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridViewComponent implements OnInit {
	pageSize: any;
	isLoading: boolean = false;
	entityId : XrmEntities | null = null;
	data = [
		{ "id": 1, "name": "anvi" },
		{ "id": 2, "name": "anviss" }
	];
	public massActionButtonSet = [
		{
			tabName: "Staffing",
			button: [
				{
					id: 1,
					isActiveType: true,
					title: "Activate",
					icon: "check check-activate"
				},
				{
					id: 2,
					isActiveType: false,
					title: "Deactivate",
					icon: "x check-deactivate"
				}

			]
		},
		{
			tabName: "MSP",
			button: [
				{
					id: 1,
					isActiveType: true,
					title: "Activate",
					icon: "check check-activate"
				},
				{
					id: 2,
					isActiveType: false,
					title: "Deactivate",
					icon: "x check-deactivate"
				}

			]
		}
	];

	popoverBody = `<app-list></app-list>`;
	popoverbodyLocalizeParam = 'LaborCategory';
	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private __dialogService: DialogPopupService,
    private gridService: GridViewService

	) {

		this.treeDropdown = this.fb.group({
			Dropdown: [null],
			TreeValue: [null]
		});
		this.formGroup = this.fb.group({
			treeDropdown: this.treeDropdown
		});

	}
	treeDropdown: FormGroup;
	formGroup: FormGroup;

	// eslint-disable-next-line max-lines-per-function
	ngOnInit() {
		this.columnOptions = [
			{
				fieldName: 'UKey',
				columnHeader: 'UKey',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'Sector',
				columnHeader: 'Sector',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'SectorCode',
				columnHeader: 'SectorCode',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'City',
				columnHeader: 'City',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'LabourCategory',
				columnHeader: 'LabourCategory',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'Disabled',
				columnHeader: 'Disabled',
				visibleByDefault: true,
				ValueType: 'bool'
			},
			{
				fieldName: 'Status',
				columnHeader: 'Status',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'CreatedByName',
				columnHeader: 'CreatedByName',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'CreatedOn',
				columnHeader: 'CreatedOn',
				visibleByDefault: true,
				ValueType: 'date'
			},
			{
				fieldName: 'LastModifiedByName',
				columnHeader: 'LastModifiedByName',
				visibleByDefault: true,
				ValueType: null
			},
			{
				fieldName: 'LastModifiedOn',
				columnHeader: 'LastModifiedOn',
				visibleByDefault: true,
				ValueType: 'date'
			},
			{
				fieldName: 'Salary',
				columnHeader: 'Salary',
				visibleByDefault: true,
				ValueType: 'phone'
			}
		];
		// this.getPageSizeData()
		this.getColumnData();
	}

	showThis() {
		console.log(this.formGroup);
	}

	groupedActionHandler(event: any) {
		console.log(event);
	}
	onView = (dataItem: any) => {
		alert(`View Clicked...${dataItem}`);
	};
	onEdit = (dataItem: any) => {
		alert("Edit Cliked...");
	};
	onActivate = (dataItem: any, action: string) => {
		console.log("dataItem", dataItem);
	};
	onDeactivate = (dataItem: any, action: string) => {
		console.log("dataItem", dataItem);
	};
	other = (dataItem: any) => {
		alert("Other Clicked...");
	};
	onTabSelected(event: any) {
		console.log(" tab name ", event);
	}


	ok = () => {
		alert("okay");
	};

	columnOptions: any[] = [];
	actionSet = [
		{
			Status: 'I',
			Items: [
				{
					icon: 'eye',
					color: 'dark-blue-color',
					title: 'View',
					fn: this.onView
				},
				{
					icon: 'check',
					color: 'green-color',
					title: 'Activate',
					fn: this.onActivate
				},
				{
					icon: 'eye',
					color: 'dark-blue-color',
					title: 'View',
					fn: this.onView
				},
				{
					icon: 'check',
					color: 'green-color',
					title: 'Activate',
					fn: this.onActivate
				}
			]
		},
		{
			Status: 'A',
			Items: [
				{
					icon: 'eye',
					color: 'dark-blue-color',
					title: 'View',
					fn: this.onView
				},
				{
					icon: 'edit-3',
					color: 'orange-color',
					title: 'Edit',
					fn: this.onEdit
				},
				{
					icon: 'x',
					color: 'red-color',
					title: 'Deactivate - A',
					iconcolor: 'light-blue-color',
					fn: this.ok
				},
				{
					icon: 'eye',
					color: 'dark-blue-color',
					title: 'View',
					fn: this.onView
				},
				{
					icon: 'edit-3',
					color: 'orange-color',
					title: 'Edit',
					fn: this.onEdit
				},
				{
					icon: 'x',
					color: 'red-color',
					title: 'Deactivate - A',
					iconcolor: 'light-blue-color',
					fn: this.ok
				}

			]
		},
		{
			Status: 'D',
			Items: [
				{ icon: 'eye', color: 'dark-blue-color', title: 'View', fn: this.onView },
				{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit }

			]
		},
		{
			Status: 'DF',
			Items: [
				{ icon: 'eye', color: 'dark-blue-color', title: 'View', fn: this.onView },
				{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit }
			]
		}
	];


	tabOptions = {
		bindingField: 'Status',
		tabList: [
			{
				tabName: 'Active-1',
				favourableValue: "A",
				tooltipText: 'Akash',
				selected: true
			},
			{
				tabName: 'Inactive',
				favourableValue: "I"
			},
			{
				tabName: 'Staffing',
				favourableValue: "A",
				selected: true
			},
			{
				tabName: 'MSP',
				favourableValue: "A",
				selected: true
			},
			{
				tabName: 'Draft',
				favourableValue: 'D'
			},
			{
				tabName: 'All',
				favourableValue: 'All'
			}

		]
	};
	customNoRecordsMessage = 'No records available at the moment.';
	public gridData = [];

	GroupedAction(event: any) {
		alert(JSON.stringify(event));
		if (event.actionName == "activate") {
			this.__dialogService.showConfirmation(
				'Do you want to activate this selected record',
				PopupDialogButtons.Activate
			);
		}
		else if (event.actionName == "deactivate") {
			this.__dialogService.showConfirmation(
				'Do you want to deactivate this selected record',
				PopupDialogButtons.Activate
			);
		}
		else if (event.actionName == "Lock Staffing") {
			this.__dialogService.showConfirmation(
				'Do you want to lock this selected Staffing record',
				PopupDialogButtons.Activate
			);
		}
		else if (event.actionName == "Unlock Staffing") {
			this.__dialogService.showConfirmation(
				'Do you want to unlock this selected Staffing record',
				PopupDialogButtons.Activate
			);
		}
		else if (event.actionName == "Lock MSP") {
			this.__dialogService.showConfirmation(
				'Do you want to lock this selected MSP record',
				PopupDialogButtons.Activate
			);
		}
		else if (event.actionName == "Unlock MSP") {
			this.__dialogService.showConfirmation(
				'Do you want to unlock this selected MSP record',
				PopupDialogButtons.Activate
			);
		}

	}

	treeValues = [
		{
			text: "All",
			items: [
				{
					text: "One",
					value: "1"
				},
				{
					text: "Two",
					value: "2"
				},
				{
					text: "Three",
					value: "3"
				}
			]
		}
	];

	drpList = [
		{ Text: "Presort", Value: "1" },
		{ Text: "Honeywells", Value: "2" },
		{ Text: "PBA", Value: "3" },
		{ Text: "BlueMoon", Value: "4" }
	];

	getColumnData() {
	}

	getPageSizeData() {
		this.gridService.getPageSizeforGrid(1).subscribe((res: any) => {
			if (res.StatusCode == 200) {
				const Data = res.Data;
				this.pageSize = Data.PageSize;
			}
		});
	}
}
