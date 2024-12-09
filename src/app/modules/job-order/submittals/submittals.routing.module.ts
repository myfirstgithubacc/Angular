import { Routes, RouterModule } from '@angular/router';
import { CoreSubmittalsComponent } from './core-submittals.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { NgModule } from '@angular/core';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { InterviewRequestComponent } from './interview-request/interview-request.component';
import { SubmitalViewComponent } from './view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { ProcessComponent } from './process/process.component';
import { MassComparison } from './mass-comparison/mass-comparison.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
	{
		path: '',
		component: CoreSubmittalsComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: { skip: true }, entityId: XrmEntities.Submittal },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'Add', entityId: XrmEntities.Submittal, isViewModeActive: true },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'Edit', entityId: XrmEntities.Submittal, isViewModeActive: true },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: SubmitalViewComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'View', entityId: XrmEntities.Submittal, isViewModeActive: false},
				canActivate: [RouteGuard]
			},
			{
				path: 'interview/:id',
				component: InterviewRequestComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'Interview', entityId: XrmEntities.Submittal, isViewModeActive: false}
			},
			{
				path: 'withdraw/:id',
				component: WithdrawComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'Withdraw', entityId: XrmEntities.Submittal, isViewModeActive: false}
			},
			{
				path: 'process/:id',
				component: ProcessComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'Process', entityId: XrmEntities.Submittal, isViewModeActive: false}
			},
			{
				path: 'mass-comparsion',
        		component: MassComparison,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'MassCompare', entityId: XrmEntities.Submittal, isViewModeActive: false }
			},
			{
				path: 'review/:id',
        		component: ReviewComponent,
				title: 'Submittal',
				data: { title: 'Submittal', breadcrumb: 'Review', entityId: XrmEntities.Submittal, isViewModeActive: false }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SubmittalsRoutingModule {};
