import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report-routing.module';
import { CoreReportComponent } from './core-report.component';
import { SharedModule } from '@xrm-shared/shared.module';
// import { FilterModule } from "@progress/kendo-angular-filter";
import { ReportListComponent } from './list/list.component';
import { ManageFolderComponent } from "./common/manage-folder/manage-folder.component";
import { ReportPanelBarComponent } from "./list/panel-bar/panel-bar.component";
@NgModule({
	declarations: [CoreReportComponent],
	imports: [
		CommonModule,
		ReportRoutingModule,
		SharedModule,
		ReportPanelBarComponent
	]
})
export class ReportModule { }
