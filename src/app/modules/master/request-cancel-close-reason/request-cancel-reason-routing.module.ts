import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreRequestCancelReasonComponent } from './core-request-cancel-reason.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreRequestCancelReasonComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'RequestCancelCloseReason',
				data: { title: 'RequestCancelCloseReason', breadcrumb: 'View', entityId: XrmEntities.RequestCancelCloseReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'RequestCancelCloseReason',
				data: { title: 'RequestCancelCloseReason', breadcrumb: 'View', entityId: XrmEntities.RequestCancelCloseReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'RequestCancelCloseReason',
				data: { title: 'RequestCancelCloseReason', breadcrumb: 'Add', entityId: XrmEntities.RequestCancelCloseReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'RequestCancelCloseReason',
				data: { title: 'RequestCancelCloseReason', breadcrumb: 'Edit', entityId: XrmEntities.RequestCancelCloseReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'RequestCancelCloseReason',
				data: { title: 'RequestCancelCloseReason', breadcrumb: { skip: true }, entityId: XrmEntities.RequestCancelCloseReason },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RequestCancelReasonRoutingModule { }
