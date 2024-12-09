import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportLibraryRoutingModule } from './report-library-routing.module';
import { SharedModule } from '@xrm-shared/shared.module';
// import { FilterModule } from "@progress/kendo-angular-filter";
import { ReportListComponent } from '../list/list.component';
import { ReportPanelBarComponent } from "../list/panel-bar/panel-bar.component";
import { CoreReportLibraryComponent } from './core-report-library.component';
@NgModule({
	declarations: [CoreReportLibraryComponent, ReportListComponent],
	imports: [
		CommonModule,
		ReportLibraryRoutingModule,
		SharedModule,
		ReportPanelBarComponent
	]
})
export class ReportLibraryModule { }
