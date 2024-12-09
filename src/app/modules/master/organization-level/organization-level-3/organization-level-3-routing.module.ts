import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreOrganizationLevel3Component } from './core-organization-level-3.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';


const routes: Routes = [
	{
		path: '',
		component: CoreOrganizationLevel3Component,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},

			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'Organization Level 3',
				data: { title: 'OrgLevel3', breadcrumb: 'Add', entityId: XrmEntities.OrgLevel3 },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'Organization Level 3',
				data: { title: 'OrgLevel3', breadcrumb: 'Edit', entityId: XrmEntities.OrgLevel3 },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Organization Level 3',
				data: { title: 'OrgLevel3', breadcrumb: 'View', entityId: XrmEntities.OrgLevel3 },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Organization Level 3',
				data: { title: 'OrgLevel3', breadcrumb: {skip: true}, entityId: XrmEntities.OrgLevel3 },
				canActivate: [RouteGuard]

			}

		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationLevel3RoutingModule { }
