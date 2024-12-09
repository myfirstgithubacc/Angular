import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreContractorComponent } from './core-contractor.component';


const routes: Routes = [
	{
		path: '',
		component: CoreContractorComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'assignment-details' },
			{
				path: 'assignment-details',
				data: { breadcrumb: 'AssignmentDetails', title: 'AssignmentDetails' },
				loadChildren: () =>
					import('./assignment-details/assignment-details.module').then((m: any) =>
						m.AssignmentDetailsModule)
			},
			{
				path: 'contractor-details',
				data: { breadcrumb: 'ContractorDetails', title: 'ContractorDetails' },
				loadChildren: () =>
					import('./contractor-details/contractor-details.module').then((m: any) =>
						m.ContractorDetailsModule)
			},
			{
				path: 'event-details',
				data: { breadcrumb: 'Event', title: 'Event' },
				loadChildren: () =>
					import('./event/events.module').then((m: any) =>
						m.EventsModule)
			},
			{
				path: 'revision',
				data: { breadcrumb: 'Revision', title: 'Revision' },
				loadChildren: () =>
					import('./revision/revision.module').then((m: any) =>
						m.RevisionModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ContractorRoutingModule { }
