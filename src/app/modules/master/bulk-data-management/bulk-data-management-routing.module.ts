import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { CoreBackendUploadComponent } from './core-bulk-data-management.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';

const routes: Routes = [
	{
		path: '',
		component: CoreBackendUploadComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'BulkDataManagement',
				data: { title: 'BulkDataManagement', breadcrumb: 'Upload', entityId: XrmEntities.ListBulkDataManagement},
				canActivate:	[RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'BulkDataManagement',
				data: { title: 'BulkDataManagement', breadcrumb: {skip: true}, entityId: XrmEntities.ListBulkDataManagement },
				canActivate:	[RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class BackendUploadRoutingModule {}
