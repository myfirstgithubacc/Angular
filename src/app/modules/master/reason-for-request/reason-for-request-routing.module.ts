import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreReasonForRequestComponent } from './core-reason-for-request.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreReasonForRequestComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'ReasonForRequest',
				data: { title: 'ReasonForRequest', breadcrumb: 'Add', entityId: XrmEntities.ReasonForRequest },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'ReasonForRequest',
				data: { title: 'ReasonForRequest', breadcrumb: { skip: true }, entityId: XrmEntities.ReasonForRequest },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:ukey',
				component: AddEditComponent,
				title: 'ReasonForRequest',
				data: { title: 'ReasonForRequest', breadcrumb: 'Edit', entityId: XrmEntities.ReasonForRequest },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:ukey',
				component: ViewComponent,
				title: 'ReasonForRequest',
				data: { title: 'ReasonForRequest', breadcrumb: 'View', entityId: XrmEntities.ReasonForRequest },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReasonForRequestRoutingModule { }
