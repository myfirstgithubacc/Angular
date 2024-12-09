import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreRequisitionLibraryComponent } from './core-requisition-library.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';


const routes: Routes = [
	{
		path: '',
		component: CoreRequisitionLibraryComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'RequisitionLibrary',
				data: { title: 'RequisitionLibrary', breadcrumb: { skip: true }, entityId: XrmEntities.RequisitionLibrary},
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'RequisitionLibrary',
				data: { title: 'RequisitionLibrary', breadcrumb: 'Add', entityId: XrmEntities.RequisitionLibrary },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'RequisitionLibrary',
				data: { title: 'RequisitionLibrary', breadcrumb: 'Edit', entityId: XrmEntities.RequisitionLibrary },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/mode-jc/:id',
				component: AddEditComponent,
				title: 'RequisitionLibrary',
				data: { title: 'RequisitionLibrary', breadcrumb: 'Add', entityId: XrmEntities.RequisitionLibrary },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'RequisitionLibrary',
				data: { title: 'RequisitionLibrary', breadcrumb: 'View', entityId: XrmEntities.RequisitionLibrary },
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
export class RequisitionLibraryRoutingModule { }
