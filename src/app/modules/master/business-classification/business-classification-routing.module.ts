import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreBusinessClassificationComponent } from './core-business-classification.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [

	{
		path: '',
		component: CoreBusinessClassificationComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'BusinessClassification',
				data: { title: 'BusinessClassification', breadcrumb: 'View', entityId: XrmEntities.BusinessClassification },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'BusinessClassification',
				data: { title: 'BusinessClassification', breadcrumb: 'Add', entityId: XrmEntities.BusinessClassification }
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'BusinessClassification',
				data: { title: 'BusinessClassification', breadcrumb: 'Edit', entityId: XrmEntities.BusinessClassification },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'BusinessClassification',
				data: { title: 'BusinessClassification', breadcrumb: {skip: true}, entityId: XrmEntities.BusinessClassification},
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
export class BusinessClassificationRoutingModule { }
