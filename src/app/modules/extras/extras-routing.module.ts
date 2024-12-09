import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreExtraComponent } from './core-extra.component';

const routes: Routes = [
	{
		path: '', component: CoreExtraComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'home' },
			{
				path: 'home',
				loadChildren: () =>
					import('./landing-page/landing-page.module').then((m) =>
						m.LandingPageModule),
				data: { breadcrumb: { skip: true } },
				title: 'Home'
			},
			{
				path: 'dashboard',
				loadChildren: () =>
					import('./dashboard/dashboard.module').then((m) =>
						m.DashboardModule),
				data: { breadcrumb: { skip: true } },
				title: 'Dashboard'
			},
			{
				path: 'messages',
				data: { breadcrumb: 'Messages', title: 'Messages' },
				loadChildren: () =>
					import('./messages/message.module').then((m) =>
						m.MessageModule),
				title: 'Messages'
			},
			{
				path: 'global-search',
				data: { breadcrumb: 'Global Search', title: 'Global Search' },
				loadChildren: () =>
					import('./global-search/global-search.module').then((m) =>
						m.GlobalSearchModule),
				title: 'Messages'
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ExtrasRoutingModule { }
