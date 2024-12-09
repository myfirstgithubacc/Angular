import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreEmailTemplateComponent } from './core-email-template.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';


const routes: Routes = [

	{
		path: '',
		component: CoreEmailTemplateComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'EmailConfiguration',
				data: { title: 'EmailConfiguration', breadcrumb: 'View', entityId: XrmEntities.EmailTemplate },
				canActivate:	[RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'EmailConfiguration',
				data: { title: 'EmailConfiguration', breadcrumb: 'View', entityId: XrmEntities.EmailTemplate },
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'EmailConfiguration',
				data: { title: 'EmailConfiguration', breadcrumb: 'Add', entityId: XrmEntities.EmailTemplate },
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'EmailConfiguration',
				data: { title: 'EmailConfiguration', breadcrumb: 'Edit', entityId: XrmEntities.EmailTemplate },
				canActivate:	[RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'EmailConfiguration',
				data: { title: 'EmailConfiguration', breadcrumb: {skip: true}, entityId: XrmEntities.EmailTemplate},
				canActivate:	[RouteGuard]
			}
		]
	}

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EmailTemplateRoutingModule { }
