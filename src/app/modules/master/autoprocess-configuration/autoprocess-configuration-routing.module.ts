import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutoprocessConfigurationComponent } from './autoprocess-configuration.component';
import { ViewComponent } from './view/view.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';

const routes: Routes = [
	{
		path: '',
		component: AutoprocessConfigurationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Auto Process Configuration',
				data: { title: 'Auto Process Configuration', breadcrumb: 'View', entityId: XrmEntities.AutoProcess},
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'Auto Process Configuration',
				data: { title: 'Auto Process Configuration', breadcrumb: 'Add', entityId: XrmEntities.AutoProcess},
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'Auto Process Configuration',
				data: { title: 'Auto Process Configuration', breadcrumb: 'Edit', entityId: XrmEntities.AutoProcess},
				canActivate:	[RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Auto Process Configuration',
				data: { title: 'Auto Process Configuration', breadcrumb: { skip: true }, entityId: XrmEntities.AutoProcess},
				canActivate:	[RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AutoprocessConfigurationRoutingModule { }
