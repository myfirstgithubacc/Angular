import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CoreProfessionalComponent } from './core-professional.component';
import { AddEditComponent } from './request/add-edit/add-edit.component';
import { ProffViewComponent } from './request/view/view.component';
import { ListComponent } from './request/list/list.component';
import { PreviewComponent } from './request/add-edit/preview/preview.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { BroadcastComponent } from './request/broadcast/broadcast.component';
import { ReviewComponent } from './request/review/review.component';
import { SubmittalDetailsComponent } from './request/submittal-details/submittal-details.component';
const entityId = XrmEntities.ProfessionalRequest,
	routes: Routes = [
		{
			path: '',
			component: CoreProfessionalComponent,
			children: [
				{
					path: '',
					pathMatch: 'full',
					redirectTo: 'list',
					canActivate: [RouteGuard]
				},
				{
					path: 'add-edit',
					component: AddEditComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: 'Create', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'add-edit/:uKey',
					component: AddEditComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: 'Edit', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'view/:uKey',
					component: ProffViewComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: 'View', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'list',
					component: ListComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: { skip: true }, entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'broadcast/:uKey',
					component: BroadcastComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: 'Broadcast', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'review/:uKey',
					component: ReviewComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: 'Review', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'submittal-details/:uKey',
					component: SubmittalDetailsComponent,
					title: 'ProfessionalRequest',
					data: { title: 'ProfessionalRequest', breadcrumb: 'Submittal', entityId: entityId }
				}
			]
		}
	];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProfessionalRoutingModule { }
