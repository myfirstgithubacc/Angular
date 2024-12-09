import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CoreInterviewComponent } from './core-interview.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
const entityId = XrmEntities.InterviewRequest,
	routes: Routes = [
		{
			path: '',
			component: CoreInterviewComponent,
			children: [
				{
					path: '',
					pathMatch: 'full',
					redirectTo: 'list'
				},
				{
					path: 'list',
					component: ListComponent,
					title: 'Interview Request',
					data: { title: 'Interview Request', breadcrumb: { skip: true }, entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'add/:uKey',
					component: AddEditComponent,
					title: 'Interview Request',
					data: { title: 'Interview Request', breadcrumb: 'Add', entityId: entityId }				},
				{
					path: 'edit/:uKey',
					component: AddEditComponent,
					title: 'Interview Request',
					data: { title: 'Interview Request', breadcrumb: 'Edit', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'view/:uKey',
					component: ViewComponent,
					title: 'Interview Request',
					data: { title: 'Interview Request', breadcrumb: 'View', entityId: entityId },
					canActivate: [RouteGuard]
				}
			]
		}
	];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InterviewRoutingModule { }
