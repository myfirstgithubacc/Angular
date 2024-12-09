import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectBaseDataComponent } from './select-base-data/select-base-data.component';
import { BuildComponent } from './build/build.component';
import { FormatAndSaveComponent } from './format-and-save/format-and-save.component';
import { ListViewComponent } from './list-view/list-view.component';
import { CoreCreateReportComponent } from './core-create-report.component';
import { ParameterSelectionComponent } from '../pre-defined-report/parameter-selection/parameter-selection.component';
import { skip } from 'rxjs';

const routes: Routes = [

	{
		path: '', component: CoreCreateReportComponent, children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'base-data'
			},
			{ data: { breadcrumb: 'Create', title: 'Custom Report', isCustomReport: true }, path: 'base-data', component: SelectBaseDataComponent },
			{ data: { breadcrumb: 'Create', title: 'Custom Report', isCustomReport: true }, path: 'build', component: BuildComponent },
			{ data: { breadcrumb: 'Edit', title: 'Custom Report', isCustomReport: true }, path: 'build/:id', component: BuildComponent },
			{ data: { breadcrumb: 'Create', title: 'Custom Report', isCustomReport: true }, path: 'format-and-save', component: FormatAndSaveComponent },
			{ data: { breadcrumb: 'Edit', title: 'Custom Report', isCustomReport: true }, path: 'format-and-save/:id', component: FormatAndSaveComponent },
			{ data: { breadcrumb: 'Run', title: 'Custom Report', isCustomReport: true }, path: 'list-view', component: ListViewComponent },
			{ data: { breadcrumb: 'Recent Runs', title: 'Custom Report', isCustomReport: true }, path: 'list-view/:id', component: ListViewComponent },
			{ data: { breadcrumb: 'Filter', title: 'Custom Report', isCustomReport: true }, path: 'parameter-selection/:id', component: ParameterSelectionComponent }
		]
	}

];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CreateReportRoutingModule { }
