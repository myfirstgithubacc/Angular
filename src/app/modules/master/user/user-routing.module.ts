import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';

import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreUserComponent } from './core-user.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { PreferenceComponent } from './add-edit/preference/preference.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreUserComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'Users',
				data: { title: 'Users', breadcrumb: 'View', entityId: XrmEntities.Users },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Users',
				data: { title: 'Users', breadcrumb: 'View', entityId: XrmEntities.Users},
				canActivate: [RouteGuard]

			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'Users',
				data: { title: 'Users', breadcrumb: 'Add', entityId: XrmEntities.Users},
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'Users',
				data: { title: 'Users', breadcrumb: 'Edit', entityId: XrmEntities.Users},
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Users',
				data: { title: 'Users', breadcrumb: { skip: true }, entityId: XrmEntities.Users},
				canActivate: [RouteGuard]
			},
			{
				path: 'list/:id',
				component: ListComponent,
				title: 'Users',
				data: { title: 'Users  ', breadcrumb: { skip: true }, entityId: XrmEntities.Users},
				canActivate: [RouteGuard]
			},
			{
				path: 'change-password',
				component: ChangePasswordComponent,
				title: 'ChangePassword',
				data: { title: 'ChangePassword', breadcrumb: 'Change Password'}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserRoutingModule { }
