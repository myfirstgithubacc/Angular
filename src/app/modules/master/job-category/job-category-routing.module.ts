import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreJobCategoryComponent } from './core-job-category.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreJobCategoryComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'JobCategory',
				data: { title: 'JobCategory', breadcrumb: 'View', entityId: XrmEntities.JobCategory },
				canDeactivate: [RouteGuard]
			},
			{ path: 'add-edit',
				component: AddEditComponent,
				title: 'JobCategory',
				data: { title: 'JobCategory', breadcrumb: 'Add', entityId: XrmEntities.JobCategory},
				canActivate:	[RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'JobCategory',
				data: { title: 'JobCategory', breadcrumb: { skip: true }, entityId: XrmEntities.JobCategory },
				canActivate:	[RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'JobCategory',
				data: { title: 'JobCategory', breadcrumb: 'Edit', entityId: XrmEntities.JobCategory },
				canActivate:	[RouteGuard]
			},
			{ path: 'view/:id',
				component: ViewComponent,
				title: 'JobCategory',
				data: { title: 'JobCategory', breadcrumb: 'View', entityId: XrmEntities.JobCategory },
				canActivate:	[RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class JobCategoryRoutingModule { }
