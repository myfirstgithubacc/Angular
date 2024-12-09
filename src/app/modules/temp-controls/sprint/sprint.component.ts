import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { SelectEvent } from "@progress/kendo-angular-layout";
import { CustomValidators } from "@xrm-shared/services/custom-validators.service";

@Component({selector: 'app-sprint',
	templateUrl: './sprint.component.html',
	styleUrls: ['./sprint.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintComponent {
	selectedTime:any;
	public myForm:FormGroup;
	public securityLevel =[
		{ Text: "Small", Value: 1 },
		{ Text: "Medium", Value: 2 },
		{ Text: "Large", Value: 3 }
	  ];
	  public skipOnChanges = false;
	  public ddlValue = [{ Text: 'Resume', Value: '2' }];

	  public daysInfo = [
		{ day: 'Monday', isSelected: false },
		{ day: 'Tuesday', isSelected: true },
		{ day: 'wednesday', isSelected: false },
		{ day: 'Thursday', isSelected: false },
		{ day: 'Friday', isSelected: false }
	];
	public timeRange = {
		labelLocalizeParam1: [],
		labelLocalizeParam2: [],
		label1: 'Start Time',
		label2: 'End Time',
		DefaultInterval: 60,
		AllowAI: false,
		startisRequired: true,
		endisRequired: true,
		starttooltipVisible: true,
		starttooltipTitle: 'string',
		starttooltipPosition: 'string',
		starttooltipTitleLocalizeParam: [],
		startlabelLocalizeParam: [],
		startisHtmlContent: true,
		endtooltipVisible: true,
		endtooltipTitle: 'string',
		endtooltipPosition: 'string',
		endtooltipTitleLocalizeParam: [],
		endlabelLocalizeParam: [],
		endisHtmlContent: true
	};

	constructor(public formBuilder:FormBuilder, public customValidators:CustomValidators) { 

		this.myForm = this.formBuilder.group ({

			dropdown: [null, this.customValidators.RequiredValidator()],
			multiselect: [null, this.customValidators.RequiredValidator()],
			password: [null, this.customValidators.RequiredValidator()],
			ddData: [null, this.customValidators.RequiredValidator()],
			startTimeControlName: [null, [this.customValidators.RequiredValidator()]],
			endTimeControlName: [new Date(), [this.customValidators.RequiredValidator()]]
		});

	}

	updateDayInfo(selectedDays:any) {
		this.daysInfo = selectedDays;
		console.log('Selected Days:', this.daysInfo);
	  }

	updateSelectedTime(selectedTime: string) {
		this.selectedTime = selectedTime;
		console.log('Selected Time:', this.selectedTime);
	}
	getWeekData(e: any){
		console.log(e);
	}
	getStatus(e: any){

		this.skipOnChanges = true;
		console.log("cancel" ,e);
		if(e){
			// this.daysInfo = [
			// 	{ day: 'Monday', isSelected: false },
			// 	{ day: 'Tuesday', isSelected: true },
			// 	{ day: 'wednesday', isSelected: false },
			// 	{ day: 'Thursday', isSelected: false },
			// 	{ day: 'Friday', isSelected: false }
			// ];
		}
	}

}
