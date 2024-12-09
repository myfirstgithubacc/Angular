import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreEventReasonComponent } from './core-event-reason.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';

const routes: Routes = [
	{
		path: '',
		component: CoreEventReasonComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'EventReason',
				data: { title: 'EventReason', breadcrumb: 'View', entityId: XrmEntities.EventReason },
				canActivate:	[RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'EventReason',
				data: { title: 'EventReason', breadcrumb: 'View', entityId: XrmEntities.EventReason },
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'EventReason',
				data: { title: 'EventReason', breadcrumb: 'Add', entityId: XrmEntities.EventReason },
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'EventReason',
				data: { title: 'EventReason', breadcrumb: 'Edit', entityId: XrmEntities.EventReason },
				canActivate:	[RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'EventReason',
				data: { title: 'EventReason', breadcrumb: { skip: true }, entityId: XrmEntities.EventReason },
				canActivate:	[RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventReasonRoutingModule { }
