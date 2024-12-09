import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreDocumentConfigurationComponent } from './core-document-configuration.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreDocumentConfigurationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'DocumentUploadConfiguration',
				data: { title: 'DocumentUploadConfiguration', breadcrumb: 'Add', entityId: XrmEntities.DocumentUploadConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'DocumentUploadConfiguration',
				data: { title: 'DocumentUploadConfiguration', breadcrumb: { skip: true }, entityId: XrmEntities.DocumentUploadConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'DocumentUploadConfiguration',
				data: { title: 'DocumentUploadConfiguration', breadcrumb: 'Edit', entityId: XrmEntities.DocumentUploadConfiguration },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'DocumentUploadConfiguration',
				data: { title: 'DocumentUploadConfiguration', breadcrumb: 'View', entityId: XrmEntities.DocumentUploadConfiguration },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DocumentConfigurationRoutingModule { }
