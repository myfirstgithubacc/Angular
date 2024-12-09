import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { CreateReportRoutingModule } from './create-report-routing.module';
import { CoreCreateReportComponent } from './core-create-report.component';
import { FilterModule } from "@progress/kendo-angular-filter";
import { CategoriesService } from './list-view/paging.service';


@NgModule({
	declarations: [CoreCreateReportComponent],
	imports: [
		CommonModule,
		CreateReportRoutingModule,
		SharedModule,
		FilterModule
	],
	providers: [CategoriesService],
	exports: []
})
export class CreateReportModule { }
