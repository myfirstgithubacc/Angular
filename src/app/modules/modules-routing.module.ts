import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModulesComponent } from './modules.component';

const routes: Routes = [
	{
		path: '',
		component: ModulesComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'landing' },

			{
				path: 'landing',
				loadChildren: () =>
					import('./extras/extras.module').then((m) =>
						m.ExtrasModule),
				data: { breadcrumb: { skip: true } }
			},
			{
				path: 'master',
				loadChildren: () =>
					import('./master/master.module').then((m) =>
						m.MasterModule),
				data: { breadcrumb: { label: 'Administration', disable: true } }
			},
			{
				path: 'demo',
				loadChildren: () =>
					import('./temp-controls/temp-controls.module').then((m) =>
						m.TempControlsModule)
			},
			{
				path: 'job-order',
				loadChildren: () =>
					import('./job-order/job-order.module').then((m) =>
						m.JobOrderModule),
				data: { breadcrumb: { label: 'Requisition', disable: true } }
			},
			{
				path: 'time-and-expense',
				loadChildren: () =>
					import('./acrotrac/acrotrac.module').then((m) =>
						m.ActrotracModule),
				data: { breadcrumb: { label: 'Time and Expense', disable: true } }
			},
			{
				path: 'contractor',
				loadChildren: () =>
					import('./contractor/contractor.module').then((m) =>
						m.ContractorModule),
				data: { breadcrumb: { label: 'Contractor', disable: true } }
			},
			{
				path: 'report',
				loadChildren: () =>
					import('./report/report.module').then((m) =>
						m.ReportModule),
				data: { breadcrumb: { label: 'Report', disable: true } }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ModulesRoutingModule { }
