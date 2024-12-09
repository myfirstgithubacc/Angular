import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorePreferenceComponent } from './core-preference.component';

const routes: Routes = [
	{
		path: '',
		component: CorePreferenceComponent,
		children: [
			{
				path: '',
				pathMatch: 'full'
			},
			{
				path: 'preference',
				component: CorePreferenceComponent,
				data: { title: 'Preference', breadcrumb: 'Preference' },
				title: 'Preference'
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PreferenceRoutingModule { }
