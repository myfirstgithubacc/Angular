import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';

import { PreDefinedReportRoutingModule } from './pre-defined-report-routing.module';
import { CorePreDefinedReportComponent } from './core-pre-defined-report.component';
import { ParameterSelectionComponent } from './parameter-selection/parameter-selection.component';
import { FilterModule } from "@progress/kendo-angular-filter";
import { CategoriesService } from '../create-report/list-view/paging.service';


@NgModule({
	declarations: [
		CorePreDefinedReportComponent,
		ParameterSelectionComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		PreDefinedReportRoutingModule,
		FilterModule
	],
	providers: [CategoriesService]
})
export class PreDefinedReportModule { }
