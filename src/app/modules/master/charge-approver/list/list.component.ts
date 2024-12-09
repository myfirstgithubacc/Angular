import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { controltype } from '@xrm-shared/services/common-constants/controltypes';

@Component({selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  constructor(
    private _router : Router
  ) { }


    //function to redirect user
    onView=(dataItem: any)=>{
      this._router.navigate([
        `/xrm/master/charge-approver/view/`
      ]);
    };

    onEdit=(dataItem: any)=>{
      this._router.navigate([
        `/xrm/master/charge-approver/add/`
      ]);
    };
    

  tabOptions = {
    bindingField: 'Disabled',
    tabList: [
      {
        tabName: 'Active',
        favourableValue: false,
        selected: true,
        
      },
      {
        tabName: 'Inactive',
        favourableValue: true,
      },
      {
        tabName: 'All',
        favourableValue: 'All',
      }
    ],
  };

  actionSet = [
    {
     Status : false,Items:[
      { icon: 'eye', color: 'dark-blue-color', title: 'View', fn:this.onView},
      { icon: 'edit-3', color: 'orange-color', title: 'Edit', fn: this.onEdit},
      { icon: 'trash-2',color: 'red-color', title: 'Delete',fn: ()=>{},},
     ]},
      { Status : true,Items:[ { icon: 'eye', color: 'dark-blue-color', title: 'View', fn: this.onView},
      {icon: 'edit-3', color: 'orange-color',title: 'Edit', fn:  this.onEdit },] },
      ];
      columnOptions = [
        {
          fieldName: 'SectorName',
          columnHeader: 'Sector',
          visibleByDefault: true,
        },
        {
          fieldName: 'Charge',
          columnHeader: 'Charge #',
          visibleByDefault: true,
        },
        {
          fieldName: 'Shift',
          columnHeader: 'Shift',
          visibleByDefault: true,
        },
        {
          fieldName: 'PrimaryApprover',
          columnHeader: 'Primary Approver',
          visibleByDefault: true,
        },
        {
          fieldName: 'AlternateApprover',
          columnHeader: 'Alternate Approver',
          visibleByDefault: true,
        }, 
      ];

  list = [
    {
      Disabled : false,
      SectorName : 'Pristine',
      Charge : '36008~HV001',
      Shift : 'Nights',
      PrimaryApprover : 'Emerson,Francisco',
      AlternateApprover : 'Emerson,Francisco'
    },
    {
      Disabled :  false,
      SectorName : 'Snacks - Jackson TN (1078)',
      Charge : '304000337~6255100000',
      Shift : '1ST IHSS',
      PrimaryApprover : 'Thomas,Jackie',
      AlternateApprover : 'Hall,Gregory'
    },
    {
      Disabled :  false,
      SectorName : 'Brownwood',
      Charge : 'Cost_1~22',
      Shift : 'Night',
      PrimaryApprover : 'Hall,Gregory',
      AlternateApprover : 'Emerson,Francisco'
    },
    {
      Disabled :  true,
      SectorName : 'Brownwood',
      Charge : 'Cost_1~22',
      Shift : 'Night',
      PrimaryApprover : 'Required',
      AlternateApprover : ''
    },
    {
      Disabled :  true,
      SectorName : 'Brownwood',
      Charge : 'Cost_1~22',
      Shift : 'Night',
      PrimaryApprover : 'Required',
      AlternateApprover : ''
    },
    {
      Disabled :  true,
      SectorName : 'Brownwood',
      Charge : 'Cost_1~22',
      Shift : 'Night',
      PrimaryApprover : 'Required',
      AlternateApprover : ''
    }
  ];
  advanceSearchFields = [
    {
      control: controltype.multiselect,
      list:['Brownwood','Pristine','Snack-Jackson TN'],
      controlName: 'SectorName',
      label: 'Sector',
      selected: []
    },
    {
      control: controltype.multiselect,
      list:['36008~HV001','304000337~6255100000','Cost_1~22'],
      controlName: 'charge',
      label: 'Charge #',
      selected: []
    },
    {
      control: controltype.multiselect,
      list:['Day','Night'],
      controlName: 'shift',
      label: 'Shift',
      selected: []
    },
    {
      control: controltype.multiselect,
      list:[],
      controlName: 'primaryapprover',
      label: 'Primary Approver',
      selected: []
    },
    {
      control: controltype.multiselect,
      list:[],
      controlName: 'altenateapprover',
      label: 'Alternate Approver',
      selected: []
    },
  ];


}

