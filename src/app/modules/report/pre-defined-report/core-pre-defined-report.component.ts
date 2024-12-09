import { Component } from '@angular/core';

@Component({
	selector: 'app-core-pre-defined-report',
	templateUrl: './core-pre-defined-report.component.html',
	styleUrls: ['./core-pre-defined-report.component.css']
})
export class CorePreDefinedReportComponent {
	currentStep = 0;
	public steps = [
		{ label: "Report Selection", route: "/xrm/report/report-library/pre-defined-report" },
		{ label: "Parameter Selection", route: "/xrm/report/report-library/pre-defined-report/build" },
		{ label: "Copy & Modify (optional)", route: "/xrm/report/report-library/pre-defined-report/format-and-save" },
		{ label: "Save (optional)", route: "/xrm/report/report-library/pre-defined-report/list-view" },
		{ label: "View", route: "/xrm/report/report-library/pre-defined-report/list-view" }
	];
}

