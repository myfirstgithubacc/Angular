import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddComponent {
  public setChargeApproverForm : FormGroup;
  public sectorDropDownList :Array<string> = [
   "Brownwood",
   "Skyline",
   "BDNET",
   "Pristine",
   "Honeywell"
  ];

  public charge :Array<string> = [
    "362008~HV001",
    "Cost_1~Cost_1",
    "NewCost~NewCost",
    "Target1~Target2"
   ];
   public shift :Array<string> = [
    "Day",
    "Night"
   ];

   public primaryApprover :Array<string> = [
    "Campion,campion",
"Leonard,Walker",
"Harward,Rose B",
"Sandifier,John",

   ];
   public alternateApprover :Array<string> = [
    "Campion,campion",
    "Leonard,Walker",
    "Harward,Rose B",
    "Sandifier,John",
   ];


  constructor(private formBuiler : FormBuilder) { 
    this.setChargeApproverForm = this.formBuiler.group({

    })
  }



}
