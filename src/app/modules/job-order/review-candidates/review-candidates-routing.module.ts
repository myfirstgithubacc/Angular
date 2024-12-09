import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreReviewCandidatesComponent } from './core-review-candidates.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { ReviewComponent } from './review-view/review.component';
import { ListComponent } from './list/list.component';


const routes: Routes = [
	{
		path: '',
		component: CoreReviewCandidatesComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Review Candidates',
				data: { title: 'Review Candidates', breadcrumb: { skip: true }, entityId: XrmEntities.LICandidate },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: ReviewComponent,
				title: 'Review Candidates',
				data: { title: 'Review Candidates', breadcrumb: 'View', entityId: XrmEntities.LICandidate, isViewModeActive: true },
				canActivate: [RouteGuard]
			},
			{
				path: 'review/:id',
				component: ReviewComponent,
				title: 'Review Candidates',
				data: { title: 'Review Candidates', breadcrumb: 'Review', entityId: XrmEntities.LICandidate, isViewModeActive: false},
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ReviewCandidatesRoutingModule { }
