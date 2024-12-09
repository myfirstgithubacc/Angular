import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreLaborCategoryComponent } from './core-labor-category.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreLaborCategoryComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'LaborCategory',
				data: { title: 'LaborCategory', breadcrumb: 'View', entityId: XrmEntities.LaborCategory },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'LaborCategory',
				data: { title: 'LaborCategory', breadcrumb: 'View', entityId: XrmEntities.LaborCategory },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'LaborCategory',
				data: { title: 'LaborCategory', breadcrumb: 'Add', entityId: XrmEntities.LaborCategory },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'LaborCategory',
				data: { title: 'LaborCategory', breadcrumb: 'Edit', entityId: XrmEntities.LaborCategory },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'LaborCategory',
				data: { title: 'LaborCategory', breadcrumb: { skip: true }, entityId: XrmEntities.LaborCategory},
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
export class LaborCategoryRoutingModule { }
