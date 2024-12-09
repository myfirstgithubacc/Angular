import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreLocationComponent } from './core-location.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreLocationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'Location',
				data: { title: 'Location', breadcrumb: 'Add', entityId: XrmEntities.Location },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:ukey',
				component: AddEditComponent,
				title: 'Location',
				data: { title: 'Location', breadcrumb: 'Edit', entityId: XrmEntities.Location },
				canActivate: [RouteGuard]
			},
			// {
			     //   path: 'add-edit/:ukey/:id',
			     //   component: AddEditComponent,
			     //   title: 'Location',
			     //   data: { title: 'Location', breadcrumb: 'Edit' },
			   // },
			{
				path: 'list',
				component: ListComponent,
				title: 'Location',
				data: { title: 'Location', breadcrumb: { skip: true }, entityId: XrmEntities.Location },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Location',
				data: { title: 'Location', breadcrumb: 'View', entityId: XrmEntities.Location },
				canActivate: [RouteGuard]
			}
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LocationRoutingModule { }
