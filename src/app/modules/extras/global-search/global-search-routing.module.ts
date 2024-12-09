import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalListComponent } from './list/list.component';
import { CoreGlobalSearchComponent } from './core-global-search.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';

const Request = [
		{
			path: 'job-order',
			loadChildren: () =>
				import('src/app/modules/job-order/job-order.module').then((m) =>
					m.JobOrderModule),
			data: { breadcrumb: {skip: true} }
		}
	],
	Assignments = [
		{
			path: 'contractor',
			loadChildren: () =>
				import('src/app/modules/contractor/contractor.module').then((m) =>
					m.ContractorModule),
			data: { breadcrumb: {skip: true} }
		}
	],
	Candidate = [
		{
			path: 'job-order',
			loadChildren: () =>
				import('src/app/modules/job-order/job-order.module').then((m) =>
					m.JobOrderModule),
			data: { breadcrumb: {skip: true} }
		}
	],

	routes: Routes = [
		{
			path: '',
			component: CoreGlobalSearchComponent,
			children: [
				{
					path: '',
					pathMatch: 'full',
					redirectTo: 'list'
				},
				{
					path: 'list',
					component: GlobalListComponent,
					title: 'Global Search',
					data: { title: 'Global Search', breadcrumb: {skip: true} },
					canActivate: [RouteGuard]
				},
				...Request,
				...Assignments,
				...Candidate
			]
		}
	];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class GlobalSearchRoutingModule { }
