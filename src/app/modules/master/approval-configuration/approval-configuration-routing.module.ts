import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreApprovalConfigurationComponent } from './core-approval-configuration.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';


const routes: Routes = [
	{
		path: '',
		component: CoreApprovalConfigurationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'ApprovalConfiguration',
				data: { title: 'ApprovalConfiguration', breadcrumb: 'View', entityId: XrmEntities.ApprovalConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'ApprovalConfiguration',
				data: { title: 'ApprovalConfiguration', breadcrumb: 'View', entityId: XrmEntities.ApprovalConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'ApprovalConfiguration',
				data: { title: 'ApprovalConfiguration', breadcrumb: 'Add', entityId: XrmEntities.ApprovalConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'ApprovalConfiguration',
				data: { title: 'ApprovalConfiguration', breadcrumb: 'Edit', entityId: XrmEntities.ApprovalConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'ApprovalConfiguration',
				data: { title: 'ApprovalConfiguration', breadcrumb: { skip: true }, entityId: XrmEntities.ApprovalConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'list/:id',
				component: ListComponent,
				title: 'ApprovalConfiguration',
				data: { title: 'ApprovalConfiguration', breadcrumb: '', entityId: XrmEntities.ApprovalConfiguration },
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
export class ApprovalConfigurationRoutingModule { }
