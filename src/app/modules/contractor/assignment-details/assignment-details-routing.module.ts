import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreAssignmentDetailsComponent } from './core-assignment-details.component';
import { ViewComponent } from './view/view.component';
import { EditComponent } from './edit/edit.component';
import { CommonAssignmentListComponent } from './list/list.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ShiftSchedulerComponent } from './shift-scheduler/shift-scheduler.component';

const routes: Routes = [
	{
		path: '',
		component: CoreAssignmentDetailsComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: CommonAssignmentListComponent,
				title: 'Assignments',
				data: { title: 'Assignments', breadcrumb: { skip: true }, entityId: XrmEntities.Assingments },
				canActivate: [RouteGuard]

			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Assignment Details',
				data: { title: 'Assignment Details', breadcrumb: 'View', entityId: XrmEntities.Assingments },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: EditComponent,
				title: 'Assignment Details',
				data: { title: 'Assignment Details', breadcrumb: 'Edit', entityId: XrmEntities.Assingments },
				canActivate: [RouteGuard]
			},
			{
				path: 'shift-scheduler/:id',
				component: ShiftSchedulerComponent,
				title: 'ShiftCalendar',
				data: { title: 'ShiftCalendar', breadcrumb: 'ViewShiftCalender', entityId: XrmEntities.Assingments }
				// canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AssignmentDetailsRoutingModule { }
