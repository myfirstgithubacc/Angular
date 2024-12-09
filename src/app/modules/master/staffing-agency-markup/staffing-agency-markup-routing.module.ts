import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreStaffingAgencyMarkupComponent } from './core-staffing-agency-markup.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreStaffingAgencyMarkupComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'StaffingAgencyMarkup',
				data: { title: 'StaffingAgencyMarkup', breadcrumb: 'View', entityId: XrmEntities.StaffingAgencyMarkup }
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'StaffingAgencyMarkup',
				data: { title: 'StaffingAgencyMarkup', breadcrumb: 'View', entityId: XrmEntities.StaffingAgencyMarkup },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'MarkupConfiguration',
				data: { title: 'MarkupConfiguration', breadcrumb: 'MarkupConfiguration', entityId: XrmEntities.StaffingAgencyMarkup },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'StaffingAgencyMarkup',
				data: { title: 'StaffingAgencyMarkup', breadcrumb: 'Edit', entityId: XrmEntities.StaffingAgencyMarkup },
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
export class StaffingAgencyMarkupRoutingModule { }
