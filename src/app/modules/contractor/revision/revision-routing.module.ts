import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RevisionListComponent } from './revision-list/revision-list.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RevisionViewComponent } from './revision-view/revision-view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { RevisionComponent } from './revision.component';
import { RevisionReviewComponent } from './revision-review/revision-review.component';
import { RevisionWithdrawComponent } from './revision-withdraw/revision-withdraw.component';
import { RevisionProcessComponent } from './revision-process/revision-process.component';

const routes: Routes = [
	{
		path: '',
		component: RevisionComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'list' },
			{
				path: 'list',
				component: RevisionListComponent,
				title: 'Revision',
				data: { title: 'Revision', breadcrumb: {skip: true}, entityId: XrmEntities.AssignmentRevision },
			  canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: RevisionViewComponent,
				title: 'Revision',
				data: { title: 'Revision', breadcrumb: 'View', entityId: XrmEntities.AssignmentRevision },
				canActivate: [RouteGuard]
			},
			{
				path: 'review/:id',
				component: RevisionReviewComponent,
				title: 'Revision',
				data: { title: 'Revision', breadcrumb: 'Review', entityId: XrmEntities.AssignmentRevision },
				canActivate: [RouteGuard]
			},
			{
				path: 'withdraw/:id',
				component: RevisionWithdrawComponent,
				title: 'Revision',
				data: { title: 'Revision', breadcrumb: 'Withdraw', entityId: XrmEntities.AssignmentRevision },
				canActivate: [RouteGuard]
			},
			{
				path: 'process/:id',
				component: RevisionProcessComponent,
				title: 'Revision',
				data: { title: 'Revision', breadcrumb: 'Process', entityId: XrmEntities.AssignmentRevision },
				canActivate: [RouteGuard]
			}
		]
	}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RevisionRoutingModule { }


