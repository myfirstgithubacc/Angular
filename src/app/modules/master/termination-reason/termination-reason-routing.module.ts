import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { ViewComponent } from './view/view.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CoreTerminationReasonComponent } from './core-termination-reason.component';

const routes: Routes = [
	{
		path: '',
		component: CoreTerminationReasonComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'TerminationReason',
				data: { title: 'TerminationReason', breadcrumb: 'View', entityId: XrmEntities.TerminationReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'TerminationReason',
				data: { title: 'TerminationReason', breadcrumb: 'View', entityId: XrmEntities.TerminationReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'TerminationReason',
				data: { title: 'TerminationReason', breadcrumb: 'Add', entityId: XrmEntities.TerminationReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'TerminationReason',
				data: { title: 'TerminationReason', breadcrumb: 'Edit', entityId: XrmEntities.TerminationReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'TerminationReason',
				data: { title: 'TerminationReason', breadcrumb: { skip: true }, entityId: XrmEntities.TerminationReason },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TerminationReasonRoutingModule { }
