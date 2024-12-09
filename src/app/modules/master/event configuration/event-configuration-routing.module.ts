import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { CoreEventConfirgurationComponent } from './core-event-configuration.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';


const routes: Routes = [
	{
		path: '',
		component: CoreEventConfirgurationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'EventConfiguration',
				data: { title: 'EventConfiguration', breadcrumb: 'View', entityId: XrmEntities.EventConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'EventConfiguration',
				data: { title: 'EventConfiguration', breadcrumb: 'View', entityId: XrmEntities.EventConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'EventConfiguration',
				data: { title: 'EventConfiguration', breadcrumb: 'Add', entityId: XrmEntities.EventConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'EventConfiguration',
				data: { title: 'EventConfiguration', breadcrumb: 'Edit', entityId: XrmEntities.EventConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'EventConfiguration',
				data: { title: 'EventConfiguration', breadcrumb: {skip: true}, entityId: XrmEntities.EventConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'list/:id',
				component: ListComponent,
				title: 'EventConfiguration',
				data: { title: 'EventConfiguration', breadcrumb: {skip: true}, entityId: XrmEntities.EventConfiguration },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EventConfigurationRoutingModule { }
