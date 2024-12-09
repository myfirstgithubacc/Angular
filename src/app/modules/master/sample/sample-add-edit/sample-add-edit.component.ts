import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({selector: 'app-sample-add-edit',
	templateUrl: './sample-add-edit.component.html',
	styleUrls: ['./sample-add-edit.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleAddEditComponent{
	AddEditSampleForm:FormGroup;
	SectorList:any=[{text: "sector 1", value: '1'}, {text: "sector 2", value: '1'}];
	Gender:any=[{text: "Male", value: '1'}, {text: "Female", value: '2'}];
	constructor(private fb:FormBuilder) {
		this.AddEditSampleForm = fb.group({
			sectorName: [null],
			textbox: [null],
			numericbox: [null],
			radiobtn: [null],
			textarea: [null],
			switch: [null],
			Date: [null],
			time: [null],
			checkbox: [null],
			multiselect: [null]
		});
	}

	
	onChange(val:any){

	}

}
