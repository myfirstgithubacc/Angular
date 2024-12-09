import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { CoreReportLibraryComponent } from './core-report-library.component';
import { ReportListComponent } from '../list/list.component';

const routes: Routes = [
	{
		path: '',
		component: CoreReportLibraryComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ReportListComponent,
				title: 'Report',
				data: { title: 'Report Library', breadcrumb: { skip: true }, entityId: XrmEntities.Report }, canActivate: [RouteGuard]
			},
			{
				path: 'custom-report',
				loadChildren: () =>
					import('../create-report/create-report.module').then((t) =>
						t.CreateReportModule),
				data: { title: 'Custom Report', breadcrumb: 'Custom Report'}
			},
			{
				path: "pre-defined-report",
				loadChildren: () =>
					import('../pre-defined-report/pre-defined-report.module').then((t) =>
						t.PreDefinedReportModule),
				data: { title: 'Pre Defined Report', breadcrumb: 'Predefined Report' }
			  }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReportLibraryRoutingModule { }
