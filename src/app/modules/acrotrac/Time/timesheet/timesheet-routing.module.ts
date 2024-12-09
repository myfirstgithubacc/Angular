import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreTimesheetComponent } from './core-timesheet.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { RouteConfigGenerator } from 'src/app/modules/route-config-generator';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { TimesheetReviewComponent } from './timesheet-review/timesheet-review.component';
import { AdjustmentReviewComponent } from './adjustment-review/adjustment-review.component';
import { AdjustmentManualComponent } from './adjustment-manual/adjustment-manual.component';
const routes: Routes = [

	{
		path: '',
		component: CoreTimesheetComponent,
		children: RouteConfigGenerator.getMasterModuleRouteConfig(ListComponent, ViewComponent, AddEditComponent, 'Timesheet', XrmEntities.Time, 'Create')
	}

];
routes[0].children?.push(
	{
		path: 'list/:id',
		component: ListComponent,
		title: 'Timesheet',
		data: { title: 'Timesheet', breadcrumb: { skip: true }, entityId: XrmEntities.Time },
		canActivate: [RouteGuard]
	},
	{
		path: 'review/:id',
		component: TimesheetReviewComponent,
		title: 'Timesheet',
		data: { title: 'Timesheet', breadcrumb: 'Review', entityId: XrmEntities.Time },
		canActivate: [RouteGuard]
	},
	{
		path: 'adjust-add-edit/:id',
		component: AdjustmentManualComponent,
		title: 'Time Adjustment',
		data: { title: 'Time Adjustment', breadcrumb: 'Adjustment', entityId: XrmEntities.TimeAdjustment },
		canActivate: [RouteGuard]
	},
	{
		path: 'time-adjustment-view/:id',
		component: AdjustmentReviewComponent,
		title: 'Time Adjustment',
		data: { title: 'Time Adjustment', breadcrumb: 'View', entityId: XrmEntities.TimeAdjustment, isReviewModeActive: false},
		canActivate: [RouteGuard]
	},
	{
		path: 'time-adjustment-review/:id',
		component: AdjustmentReviewComponent,
		title: 'Time Adjustment',
		data: { title: 'Time Adjustment', breadcrumb: 'Adjustment', entityId: XrmEntities.TimeAdjustment, isReviewModeActive: true},
		canActivate: [RouteGuard]
	}

);
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TimesheetRoutingModule { }
