import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorePreDefinedReportComponent } from './core-pre-defined-report.component';
import { SelectBaseDataComponent } from '../create-report/select-base-data/select-base-data.component';
import { BuildComponent } from '../create-report/build/build.component';
import { FormatAndSaveComponent } from '../create-report/format-and-save/format-and-save.component';
import { ListViewComponent } from '../create-report/list-view/list-view.component';
import { ParameterSelectionComponent } from './parameter-selection/parameter-selection.component';
const routes: Routes = [

	{
		path: '', component: CorePreDefinedReportComponent, children: [
			{ data: { breadcrumb: {skip: true}, title: 'Pre-defined Reports', isCustomReport: false }, path: '', component: SelectBaseDataComponent },
			{ data: { breadcrumb: 'Filter', title: 'Pre-defined Reports', isCustomReport: false }, path: 'parameter-selection', component: ParameterSelectionComponent },
			{ data: { breadcrumb: 'Filter', title: 'Pre-defined Reports', isCustomReport: false }, path: 'parameter-selection/:id', component: ParameterSelectionComponent },
			{ data: { breadcrumb: 'Edit', title: 'Pre-defined Reports', isCustomReport: false }, path: 'build', component: BuildComponent },
			{ data: { breadcrumb: {skip: true}, title: 'Pre-defined Reports', isCustomReport: false }, path: 'copy-and-modify/:id', component: BuildComponent },
			{ data: { breadcrumb: 'Edit', title: 'Pre-defined Reports', isCustomReport: false }, path: 'format-and-save', component: FormatAndSaveComponent },
			{ data: { breadcrumb: 'Run Report', title: 'Pre-defined Reports', isCustomReport: false }, path: 'list-view', component: ListViewComponent }

		]
	}

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PreDefinedReportRoutingModule { }
