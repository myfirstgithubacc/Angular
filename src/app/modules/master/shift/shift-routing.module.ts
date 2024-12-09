import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CoreShiftComponent } from './core-shift.component';
import { ListComponent } from './list/list.component';
import { NgModule } from '@angular/core';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreShiftComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'Shift',
				data: { title: 'Shift', breadcrumb: 'Add', entityId: XrmEntities.Shift },
				canActivate: [RouteGuard]
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Shift',
				data: { title: 'Shift', breadcrumb: { skip: true }, entityId: XrmEntities.Shift },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Shift',
				data: { title: 'Shift', breadcrumb: 'View', entityId: XrmEntities.Shift },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'Shift',
				data: { title: 'Shift', breadcrumb: 'Edit', entityId: XrmEntities.Shift },
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
export class ShiftRoutingModule { }
