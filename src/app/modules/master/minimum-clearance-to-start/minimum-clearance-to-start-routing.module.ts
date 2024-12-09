import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreMinimumClearanceToStartComponent } from './core-minimum-clearance-to-start.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreMinimumClearanceToStartComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'MinimumClearancetoStart',
				data: { title: 'MinimumClearancetoStart', breadcrumb: 'Add', entityId: XrmEntities.MinimumClearancetoStart },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:uKey',
				component: AddEditComponent,
				title: 'MinimumClearancetoStart',
				data: { title: 'MinimumClearancetoStart', breadcrumb: 'Edit', entityId: XrmEntities.MinimumClearancetoStart },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'MinimumClearancetoStart',
				data: { title: 'MinimumClearancetoStart', breadcrumb: { skip: true }, entityId: XrmEntities.MinimumClearancetoStart },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:uKey',
				component: ViewComponent,
				title: 'MinimumClearancetoStart',
				data: { title: 'MinimumClearancetoStart', breadcrumb: 'View', entityId: XrmEntities.MinimumClearancetoStart },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MinimumClearanceToStartRoutingModule { }
