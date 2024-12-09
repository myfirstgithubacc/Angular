import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreStaffingAgencyComponent } from './core-staffing-agency.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreStaffingAgencyComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'StaffingAgency',
				data: { title: 'StaffingAgency', breadcrumb: 'View', entityId: XrmEntities.StaffingAgency },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'StaffingAgency',
				data: { title: 'StaffingAgency', breadcrumb: 'View', entityId: XrmEntities.StaffingAgency },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'StaffingAgency',
				data: { title: 'StaffingAgency', breadcrumb: 'Add', entityId: XrmEntities.StaffingAgency },
				canActivate: [RouteGuard]
			},

			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'StaffingAgency',
				data: { title: 'StaffingAgency', breadcrumb: 'Edit', entityId: XrmEntities.StaffingAgency },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'StaffingAgency',
				data: { title: 'StaffingAgency', breadcrumb: { skip: true }, entityId: XrmEntities.StaffingAgency },
				canActivate: [RouteGuard]
			},
			{
				path: 'list/:id',
				component: ListComponent,
				title: 'StaffingAgency',
				data: { title: 'StaffingAgency', breadcrumb: '', entityId: XrmEntities.StaffingAgency },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StaffingAgencyRoutingModule { }
