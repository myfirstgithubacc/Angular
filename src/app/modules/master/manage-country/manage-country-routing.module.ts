import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreManageCountryComponent } from './core-manage-country.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { ViewComponent } from './view/view.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreManageCountryComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'ManageCountry',
				data: { title: 'ManageCountry', breadcrumb: {skip: true}, entityId: XrmEntities.ManageCountry },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'ManageCountry',
				data: { title: 'ManageCountry', breadcrumb: 'Edit', entityId: XrmEntities.ManageCountry },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'ManageCountry',
				data: { title: 'ManageCountry', breadcrumb: 'View', entityId: XrmEntities.ManageCountry },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ManageCountryRoutingModule { }
