import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkerClassificationComponent } from './core-worker-classification.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: WorkerClassificationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'WorkerClassification',
				data: { title: 'WorkerClassification', breadcrumb: { skip: true }, entityId: XrmEntities.WorkerClassification},
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'WorkerClassification',
				data: { title: 'WorkerClassification', breadcrumb: 'Add', entityId: XrmEntities.WorkerClassification},
				canActivate: [RouteGuard]

			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'WorkerClassification',
				data: { title: 'WorkerClassification', breadcrumb: 'Edit', entityId: XrmEntities.WorkerClassification},
				canActivate: [RouteGuard]

			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Worker Classification',
				data: { title: 'WorkerClassification', breadcrumb: 'View', entityId: XrmEntities.WorkerClassification},
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class WorkerClassificationRoutingModule { }
