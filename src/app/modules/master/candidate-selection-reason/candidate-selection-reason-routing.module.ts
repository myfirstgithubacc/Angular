import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { CoreCandidateSelectionReasonComponent } from './core-candidate-selection-reason.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreCandidateSelectionReasonComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'CandidateSelectionReason',
				data: { title: 'CandidateSelectionReason', breadcrumb: { skip: true }, entityId: XrmEntities.CandidateSelectionReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: AddEditComponent,
				title: 'CandidateSelectionReason',
				data: { title: 'CandidateSelectionReason', breadcrumb: 'Add', entityId: XrmEntities.CandidateSelectionReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:ukey',
				component: ViewComponent,
				title: 'CandidateSelectionReason',
				data: { title: 'CandidateSelectionReason', breadcrumb: 'View', entityId: XrmEntities.CandidateSelectionReason },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:ukey',
				component: AddEditComponent,
				title: 'CandidateSelectionReason',
				data: { title: 'CandidateSelectionReason', breadcrumb: 'Edit', entityId: XrmEntities.CandidateSelectionReason },
				canActivate: [RouteGuard]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CandidateSelectionReasonRoutingModule { }
