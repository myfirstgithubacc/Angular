import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsListComponent } from './list/list.component';
import { EventsViewComponent } from './view/view.component';
import { EventsAddEditComponent } from './add-edit/add-edit.component';
import { CoreEventsComponent } from './core-events.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
const routes: Routes = [
	{
		path: '',
		component: CoreEventsComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: EventsViewComponent,
				title: 'Event',
				data: { title: 'Event', breadcrumb: 'View', entityId: XrmEntities.ContractorEvent },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: EventsViewComponent,
				title: 'Event',
				data: { title: 'Event', breadcrumb: 'View', entityId: XrmEntities.ContractorEvent },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: EventsAddEditComponent,
				title: 'Event',
				data: { title: 'Event', breadcrumb: 'Add', entityId: XrmEntities.ContractorEvent },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: EventsAddEditComponent,
				title: 'Event',
				data: { title: 'Event', breadcrumb: 'Edit', entityId: XrmEntities.ContractorEvent },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: EventsListComponent,
				title: 'Event',
				data: { title: 'Event', breadcrumb: {skip: true}, entityId: XrmEntities.ContractorEvent },
				canActivate: [RouteGuard]
			},
			{
				path: 'list/:id',
				component: EventsListComponent,
				title: 'Event',
				data: { title: 'Event', breadcrumb: {skip: true}, entityId: XrmEntities.ContractorEvent },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EventsRoutingModule { }
