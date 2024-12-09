/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';
import { ConfirmationpopupService } from 'src/app/shared/services/Confirmation-popup.service';
import { DialogServices } from 'src/app/shared/services/dialogue.service';
import { advancesearch } from '@xrm-shared/widgets/advance-search/advance-search/interface/advance-search.modal';


@Component({selector: 'app-sample-list',
	templateUrl: './sample-list.component.html',
	styleUrls: ['./sample-list.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleListComponent implements OnInit {
	actionSet:any;
	actionSetExtrabutton:any;
	FilterForm:FormGroup;
	originalList:any=[];
	selectedTabName:string='';
	selectTextsearch:string='';

	// eslint-disable-next-line max-params
	constructor(
private dialogservice: DialogServices,
    private _LaborCategoryService:LaborCategoryService,
    private _DialogServices:DialogServices, private _ConfirmationpopupService:ConfirmationpopupService,
    private router:Router
	) {
		this.actionSet=[
			{  icon: 'eye', color: 'dark-blue-color', title: 'View', fn: this.onView },
			{  icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit },
			{
				icon: ['x', 'check'],
				title: 'Active',
				fn: this.onActiveChange
			}
		];
		this.actionSetExtrabutton=[{ icon: 'copy',color: 'black-color', title: 'Copy', fn: this.onCopy }];
	}
	onCopy=(action:any) => {
	};

	ngOnInit(): void {

		this.originalList = this.list;
		// eslint-disable-next-line no-underscore-dangle
		this._ConfirmationpopupService.getonconfirm().subscribe((data:any) => {
			if(data){
				this._DialogServices.showSuccess('Done Successfully !!');

			}
		});
		this._LaborCategoryService.getSector().subscribe((data: any) => {
			if (data) {
				const ind = this.JsonData.findIndex((a:any) =>
					a.label == 'Sector');
				this.JsonData[ind].list=data;
			}
		});

	}
	list = [
		{
			"ukey": "fda12502-35e8-419b-a703-088885e7c2a7",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Developer",
			"laborCategoryCode": "DEV23",
			"maxProfilesPerStaffing": 8888,
			"mspStaffingSpecialistId": 0,
			"maxProfileTotal": 11,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "H",
			"isLiLaborCategory": false,
			"isIcsowLaborCategory": false,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": null,
			"billRateModel": null,
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": true,
			"createdBy": 1,
			"createdOn": "2022-11-21T05:26:34.06",
			"lastModifiedBy": null,
			"lastModifiedOn": null
		},
		{
			"ukey": "a075622c-cc95-4bbc-bfd2-2a799d0e7d83",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "Developer1",
			"laborCategoryCode": "DEV1",
			"maxProfilesPerStaffing": 1111,
			"mspStaffingSpecialistId": 0,
			"maxProfileTotal": 1234,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "H",
			"isLiLaborCategory": false,
			"isIcsowLaborCategory": false,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": null,
			"billRateModel": null,
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-21T05:26:13.2866667",
			"lastModifiedBy": null,
			"lastModifiedOn": null
		},
		{
			"ukey": "11921c90-f90e-4c26-9046-0694f3cc9803",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Light",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": true,
			"createdBy": 1,
			"createdOn": "2022-11-16T07:25:47.6866667",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-16T07:25:47.6866667"
		},
		{
			"ukey": "95320aaf-3822-4dac-9825-96ac0bd90125",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Light Industrial",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": true,
			"createdBy": 1,
			"createdOn": "2022-11-16T07:26:06.9933333",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-16T07:26:06.9933333"
		},
		{
			"ukey": "0db2c496-7168-4f4f-b682-910ecd1b5e5b",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "Light Industrial",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": true,
			"createdBy": 1,
			"createdOn": "2022-11-07T13:34:04.496",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-07T08:47:55.7433333"
		},
		{
			"ukey": "2e569aac-020a-4e0a-a0ed-54184ba68b75",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "Light Industrial",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-07T13:34:04.496",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-10T08:10:31.15"
		},
		{
			"ukey": "1c37e210-1a14-40d3-aed9-3142f3962ffc",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Light Industrial 2",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": true,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-28T05:46:01.52",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-28T05:46:01.52"
		},
		{
			"ukey": "fd92b9b9-351e-4797-8cd9-133489076f17",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Light Industrial 2",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": true,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-28T07:04:50.8066667",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-28T07:04:50.8066667"
		},
		{
			"ukey": "1e97af53-f746-4084-8466-fbd2b4cee2c0",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Light Industrial 2",
			"laborCategoryCode": "LC203",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": true,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-12-06T04:49:29.68",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-12-06T04:49:29.68"
		},
		{
			"ukey": "45e1d65f-683b-4181-a99c-55f917982133",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "Painter",
			"laborCategoryCode": "Paint01",
			"maxProfilesPerStaffing": 10,
			"mspStaffingSpecialistId": 2,
			"maxProfileTotal": 30,
			"payrollMarkUp": 40,
			"isExpressLaborCategory": true,
			"candidateHiredby": "M",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": "M",
			"markUpFlag": "R",
			"otRateType": "B",
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-12-11T07:34:39.7466667",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-12-11T07:34:39.7466667"
		},
		{
			"ukey": "389d8e1f-95e3-455f-a56c-399fba1f3115",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "QA",
			"laborCategoryCode": "QA22",
			"maxProfilesPerStaffing": 12,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 12,
			"payrollMarkUp": 17,
			"isExpressLaborCategory": false,
			"candidateHiredby": "H",
			"isLiLaborCategory": false,
			"isIcsowLaborCategory": false,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": null,
			"billRateModel": null,
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": true,
			"createdBy": 1,
			"createdOn": "2022-11-07T13:34:04.496",
			"lastModifiedBy": 1,
			"lastModifiedOn": "2022-12-16T12:46:30.904"
		},
		{
			"ukey": "3dca9db9-4e46-4085-8c81-a3ab7633ea5d",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "string",
			"laborCategoryCode": "string",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 0,
			"maxProfileTotal": 10,
			"payrollMarkUp": 10,
			"isExpressLaborCategory": false,
			"candidateHiredby": "string",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": "c",
			"markUpFlag": "a",
			"otRateType": "b",
			"costEstimationType": "e",
			"billRateModel": "d",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-23T07:06:27.6566667",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-23T07:06:27.6566667"
		},
		{
			"ukey": "06279b40-68e3-4421-ad3e-522fdb0eecea",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "string",
			"laborCategoryCode": "string",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 0,
			"maxProfileTotal": 80,
			"payrollMarkUp": 8,
			"isExpressLaborCategory": false,
			"candidateHiredby": "string",
			"isLiLaborCategory": false,
			"isIcsowLaborCategory": false,
			"isPreScreeningRequired": false,
			"isAlternatePricingModel": false,
			"pricingModel": "e",
			"markUpFlag": "a",
			"otRateType": "b",
			"costEstimationType": "c",
			"billRateModel": "d",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-25T03:40:32.1966667",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-25T03:40:32.1966667"
		},
		{
			"ukey": "17936a0d-91ba-4691-94a8-6a9aa7a5afcc",
			"sectorId": 1,
			"sectorName": "Kellogg",
			"laborCategoryName": "Tester",
			"laborCategoryCode": "TEST3",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-21T05:27:11.63",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-21T05:27:11.63"
		},
		{
			"ukey": "40ab673e-023a-463b-8838-0490edae1a42",
			"sectorId": 2,
			"sectorName": "Honeywell",
			"laborCategoryName": "Tester",
			"laborCategoryCode": "TEST3",
			"maxProfilesPerStaffing": 0,
			"mspStaffingSpecialistId": 1,
			"maxProfileTotal": 10,
			"payrollMarkUp": 4,
			"isExpressLaborCategory": false,
			"candidateHiredby": "",
			"isLiLaborCategory": true,
			"isIcsowLaborCategory": true,
			"isPreScreeningRequired": true,
			"isAlternatePricingModel": true,
			"pricingModel": null,
			"markUpFlag": null,
			"otRateType": null,
			"costEstimationType": "P",
			"billRateModel": "N",
			"maxProfilesPerRequest": null,
			"hasTenurePolicy": false,
			"tenureLimitType": null,
			"clpTenureLimit": null,
			"tenureResetPeriod": 0,
			"tenurePolicy": "\u0000",
			"reqTenureLimit": 0,
			"extTenureLimit": 0,
			"active": false,
			"createdBy": 1,
			"createdOn": "2022-11-21T05:27:22.62",
			"lastModifiedBy": null,
			"lastModifiedOn": "2022-11-21T05:27:22.62"
		}
	];
	columnOptions=[
		{
			fieldName: 'sectorName',
			columnHeader: 'Sector',
			visibleByDefault: false
		},

		{
			fieldName: 'laborCategoryName',
			columnHeader: 'Labor Category',
			visibleByDefault: false
		},

		{
			fieldName: 'laborCategoryCode',
			columnHeader: 'Labor Category Code',
			visibleByDefault: false
		},

		{
			fieldName: 'isExpressLaborCategory',
			columnHeader: 'Express Category',
			visibleByDefault: true
		},

		{
			fieldName: 'isIcsowLaborCategory',
			columnHeader: 'SOW/IC Category',
			visibleByDefault: true
		},

		{
			fieldName: 'isLiLaborCategory',
			columnHeader: 'LI Category',
			visibleByDefault: true
		},

		{
			fieldName: 'isAlternatePricingModel',
			columnHeader: 'Alternate Pricing',
			visibleByDefault: true
		},

		{
			fieldName: 'payrollMarkUp',
			columnHeader: 'Payroll Markup',
			visibleByDefault: true
		},

		{
			fieldName: 'mspStaffingSpecialistId',
			columnHeader: 'MSP Staffing Specialist',
			visibleByDefault: true
		}
	];

	onView(dataItem: any){
	};
	onEdit(dataItem: any){

	};
	onActiveChange = (dataItem: any, action: string) => {


		this._DialogServices.showConfirmation('Are you sure you want to Activate this Labor Category?', 'Yes,Activate', "No, don't Activate");
		if (action == 'Activate') {
			this._DialogServices.showConfirmation('Are you sure you want to Activate this Labor Category?', 'Yes,Activate', "No, don't Activate"); }
		else if(action == 'Deactivate') {
			this._DialogServices.showConfirmation('Are you sure you want to Deactivate this Labor Category?', 'Yes,Deactivate', "No, don't Deactivate");
		}
	};
	tabOptions={
		bindingField: 'active',
		tabList: [
			{
				tabName: 'All',
				favourableValue: '_default_',
				selected: true
			},
			{
				tabName: 'Inactive',
				favourableValue: false
			},
			{
				tabName: 'Active',
				favourableValue: true
			}
		]
	};
	selectedTab(data:any){
		this.selectedTabName = data;
		this.OnSearch('');

	}
	OnSearch(text:string){
		this.selectTextsearch = text;
		let labours: any = [];
		if (this.selectedTabName.toLowerCase() == 'active'.toLowerCase()) {
			labours = this.originalList.filter((b: any) =>
				b.active);
		} else if (this.selectedTabName.toLowerCase() == 'Inactive'.toLowerCase()) {
			labours = this.originalList.filter((b: any) =>
				!b.active);
		} else {
			labours = this.originalList;
		}
		if (text != '' && text != null) {
			const searchData: any = [];
			labours.forEach((a: any) => {
				const val = Object.values(a);
				val.forEach((b: any) => {
					if (typeof b == 'string') {
						if (b.toLowerCase().includes(text.toLowerCase())) {
							searchData.push(a);
						}
					}
				});
			});
			this.list = searchData;
		} else {
			this.list = this.originalList;
		}
	}
	OnFilter(data:any){
		console.log("filtered data", data);
	}


	navigate() {
		this.router.navigate(['xrm/master/sample/add-edit']);
	}

	JsonData:advancesearch[] = [
		{
			control: 'textbox',
			controlName: 'Name',
			label: 'Name'
		},
		{
			control: 'multi_select_dropdown',
			list: [
				{ Text: 'Green', Value: '1' },
				{ Text: 'Yellow', Value: '2' }
			],
			controlName: 'color',
			label: 'Sector'
		},
		{
			control: 'radio',
			list: [
				{ Text: 'Yes', Value: 'Yes' },
				{ Text: 'No', Value: 'No' }
			],
			controlName: 'isAlternatePricingModel',
			label: 'Alternate Pricing'
		}


	];

}
