import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { DialogServices } from 'src/app/shared/services/dialogue.service';
import { StateService } from 'src/app/services/masters/state.service';
import { controltype } from '@xrm-shared/services/common-constants/controltypes';
import { ContractorService } from 'src/app/services/masters/contractor.service ';
import { CommonHeaderActionService } from '@xrm-shared/services/common-constants/common-header-action.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';

@Component({selector: 'app-time-expense-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeExpenseListComponent implements OnInit, OnDestroy {

	selectedRadio: number = 1;
	public isEditMode: boolean = false;
	time: any[] =[];
	expense: any[] =[];

	buttonSet: ({ status: string; items: { icon: string; title: string; color: string; }[]; } | { status: string; items: void; })[];
	moduleName = "Contractor";

	constructor(
private fb: FormBuilder,
    private route: Router,
    public sector: SectorService,
    private _Router: Router,
    public State: StateService,
    public commonHeaderIcon: CommonHeaderActionService,
    private toasterServc: ToasterService,
    public ContractorService: ContractorService
	) {
		/*   this.time = ContractorService.getTime();
        this.expense =ContractorService.getExpense(); */

	}

	ngOnInit(): void {


		try {
			if (this.route.url == '/xrm/master/contractor/add-edit') {
				this.isEditMode = true;
			} else {
				this.isEditMode = false;
			}
		}
		catch (e) {
			console.log(e);
		}
		this.getButtonSet();

	}

	getButtonSet(){
		this.buttonSet = [
			{
				status: 'Active', items: this.commonHeaderIcon.commonActionSetOnEditActive(this.moduleName)
			},
			{ status: 'Inactive', items: this.commonHeaderIcon.commonActionSetOnDeactive(this.moduleName) }
		];
	}

	ngOnDestroy(): void {
		this.toasterServc.resetToaster();
	}

	onRadioChange(option: number) {
		this.selectedRadio = option;
	}

	OnSearch(data: any) {
	}
	OnFilter(data: any) {
		console.log("filtered data", data);
	}

	columnOptionstime = [
		{
			fieldName: 'weekendingdate',
			columnHeader: 'WeekendingDate',
			visibleByDefault: true
		},
		{
			fieldName: 'sector',
			columnHeader: 'Sector',
			visibleByDefault: true
		},
		{
			fieldName: 'location',
			columnHeader: 'WorkLocation',
			visibleByDefault: true
		},
		{
			fieldName: 'assignmentid',
			columnHeader: 'AssignmentID',
			visibleByDefault: false
		},
		{
			fieldName: 'status',
			columnHeader: 'Status',
			visibleByDefault: true
		},
		{
			fieldName: 'st',
			columnHeader: 'TotalST',
			visibleByDefault: true
		},
		{
			fieldName: 'ot',
			columnHeader: 'TotalOT',
			visibleByDefault: true
		},
		{
			fieldName: 'dt',
			columnHeader: 'TotalDT',
			visibleByDefault: true
		},
		{
			fieldName: 'totalhours',
			columnHeader: 'TotalHours',
			visibleByDefault: true
		}
	];
	columnOptionsexpense = [
		{
			fieldName: 'weekendingdate',
			columnHeader: 'WeekendingDate',
			visibleByDefault: true
		},
		{
			fieldName: 'sector',
			columnHeader: 'Sector',
			visibleByDefault: true
		},
		{
			fieldName: 'location',
			columnHeader: 'WorkLocation',
			visibleByDefault: true
		},
		{
			fieldName: 'assignmentid',
			columnHeader: 'AssignmentID',
			visibleByDefault: false
		},
		{
			fieldName: 'status',
			columnHeader: 'Status',
			visibleByDefault: true
		},
		{
			fieldName: 'expenseAmount',
			columnHeader: 'ExpenseAmount',
			visibleByDefault: true
		},
		{
			fieldName: 'currency',
			columnHeader: 'Currency',
			visibleByDefault: true
		}
	];

	tabOptionstimeexpense = {
		bindingField: 'status',
		tabList: [
			{
				tabName: 'PendingForApproval',
				favourableValue: "Pending for Approval",
				selected: true
			},
			{
				tabName: 'Declined',
				favourableValue: "Declined"
			},
			{
				tabName: 'All',
				favourableValue: 'All',
				selected: false
			}
		]
	};

	onView = (dataItem: any) => {
		// eslint-disable-next-line no-underscore-dangle
		this._Router.navigate([`/xrm/contractor/contractor-new/time-expense-view`]);
	};
	onEdit = (dataItem: any) => {
		// eslint-disable-next-line no-underscore-dangle
		this._Router.navigate([`/xrm/contractor/contractor-new/time-expense-edit`]);
	};

	actionSet = [
		{
			Status: true, Items: [
				{ icon: 'eye', color: 'dark-blue-color', title: 'View', fn: this.onView },
				{ icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit }

			]
		}
	];


	selectedTab(data: any) {
	}

	timeadvanceSearchFields = [
		{
			control: controltype.multiselect,
			controlName: 'eventName',
			label: 'Weekending Date'
		},
		{
			control: controltype.multiselect,
			controlName: 'eventId',
			label: 'Sector '
		},

		{
			control: controltype.multiselect,
			controlName: 'reason',
			label: 'Work Location'
		},
		{
			control: controltype.multiselect,
			controlName: 'status',
			label: 'Status'
		},
		{
			control: controltype.multiselect,
			controlName: 'st',
			label: 'Total ST'
		},
		{
			control: controltype.multiselect,
			controlName: 'ot',
			label: 'Total OT'
		},
		{
			control: controltype.multiselect,
			controlName: 'dt',
			label: 'Total DT'
		},
		{
			control: controltype.multiselect,
			controlName: 'hour',
			label: 'Total Hour'
		},
		{
			control: controltype.multiselect,
			controlName: 'createdByList',
			label: 'Created by'
		},
		{
			control: controltype.daterange,
			controlName: 'createdOn',
			label: 'Created On',
			class: 'dateRange'
		},
		{
			control: controltype.multiselect,

			controlName: 'createdByList',
			label: 'Modified By'
		},
		{
			control: controltype.daterange,
			controlName: 'modifiedOn',
			label: 'Modified On',
			class: 'dateRange'
		}

	];

	expenseadvanceSearchFields = [
		{
			control: controltype.multiselect,
			controlName: 'weekendingdate',
			label: 'Weekending Date '
		},
		{
			control: controltype.multiselect,
			controlName: 'sector',
			label: 'Sector '
		},

		{
			control: controltype.multiselect,
			controlName: 'location',
			label: 'Work Location'
		},
		{
			control: controltype.multiselect,
			controlName: 'status',
			label: 'Status'
		},
		{
			control: controltype.multiselect,
			controlName: 'expenseamount',
			label: 'Expense Amount'
		},
		{
			control: controltype.multiselect,
			controlName: 'currency',
			label: 'Currency'
		},
		{
			control: controltype.multiselect,
			controlName: 'createdByList',
			label: 'Created by'
		},
		{
			control: controltype.daterange,
			controlName: 'createdOn',
			label: 'Created On',
			class: 'dateRange'
		},
		{
			control: controltype.multiselect,

			controlName: 'createdByList',
			label: 'Modified By'
		},
		{
			control: controltype.daterange,
			controlName: 'modifiedOn',
			label: 'Modified On',
			class: 'dateRange'
		}

	];

	showButton1(){
	}
	showButton2(){
	}

}
