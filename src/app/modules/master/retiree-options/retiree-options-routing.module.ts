import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreRetireeOptionsComponent } from './core-retiree-options.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';


const routes: Routes = [
	{
		path: '',
		component: CoreRetireeOptionsComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'RetireeOption',
				data: { title: 'RetireeOption', breadcrumb: 'View', entityId: XrmEntities.RetireeOption },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'RetireeOption',
				data: { title: 'RetireeOption', breadcrumb: 'Add', entityId: XrmEntities.RetireeOption },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'RetireeOption',
				data: { title: 'RetireeOption', breadcrumb: 'Edit', entityId: XrmEntities.RetireeOption },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'RetireeOption',
				data: { title: 'RetireeOption', breadcrumb: { skip: true }, entityId: XrmEntities.RetireeOption },
				canActivate: [RouteGuard]
			}
		]
	}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: []
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RetireeOptionsRoutingModule { }
