import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { CoreCandidateDeclineReasonComponent } from './core-candidate-decline-reason.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { ListComponent } from './list/list.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		 component: CoreCandidateDeclineReasonComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'CandidateDeclineReason',
				data: { title: 'CandidateDeclineReason', breadcrumb: { skip: true }, entityId: XrmEntities.CandidateDeclineReason },
				 canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'CandidateDeclineReason',
				data: { title: 'CandidateDeclineReason', breadcrumb: 'Add', entityId: XrmEntities.CandidateDeclineReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'CandidateDeclineReason',
				data: { title: 'CandidateDeclineReason', breadcrumb: 'View', entityId: XrmEntities.CandidateDeclineReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: AddEditComponent,
				title: 'CandidateDeclineReason',
				data: { title: 'CandidateDeclineReason', breadcrumb: 'Edit', entityId: XrmEntities.CandidateDeclineReason },
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
export class CandidateDeclineReasonRoutingModule { }
