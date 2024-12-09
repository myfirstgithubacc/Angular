import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreUserDefinedFieldsComponent } from './core-user-defined-fields.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreUserDefinedFieldsComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'User Defined Field',
				data: { title: 'UserDefinedField', breadcrumb: { skip: true }, entityId: XrmEntities.UserDefinedField },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'User Defined Field',
				data: { title: 'UserDefinedField', breadcrumb: 'Add', entityId: XrmEntities.UserDefinedField },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:uKey/:fieldTypeId',
				component: AddEditComponent,
				title: 'User Defined Field',
				data: { title: 'UserDefinedField', breadcrumb: 'Edit', entityId: XrmEntities.UserDefinedField },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:uKey/:fieldTypeId',
				component: ViewComponent,
				title: 'User Defined Field',
				data: { title: 'UserDefinedField', breadcrumb: 'View', entityId: XrmEntities.UserDefinedField },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserDefinedFieldsRoutingModule { }
