import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({
	selector: 'app-core-create-report',
	templateUrl: './core-create-report.component.html',
	styleUrls: ['./core-create-report.component.css']
})
export class CoreCreateReportComponent implements OnInit {
	reportAddEditForm:FormGroup;
	public currentStep = magicNumber.zero;
	constructor(private fb: FormBuilder, private route:Router){}

	ngOnInit(): void {
	}
	public steps = [
		{ label: "Select Base Data Entity", route: "/xrm/report/report-library/create-report" },
		{ label: "Build", route: "/xrm/report/report-library/create-report/build" },
		{ label: "Format & Save", route: "/xrm/report/report-library/create-report/format-and-save" },
		{ label: "View", route: "/xrm/report/report-library/create-report/list-view" }
	];
	public next(): void {
		this.currentStep += 1;

		
	}
	onStepChange(event: number): void {
		const selectedStep = this.steps[event];
		if (selectedStep.route) {
			this.route.navigate([selectedStep.route]);
		}
	}
}
