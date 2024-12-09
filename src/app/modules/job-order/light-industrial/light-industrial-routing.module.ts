import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreLightIndustrialComponent } from './core-light-industrial.component';
import { AddEditComponent } from './request/add-edit/add-edit.component';
import { ListComponent } from './request/list/list.component';
import { LiViewComponent } from './request/view/view.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { ReviewRequestComponent } from './request/review-request/review-request.component';
import { BroadcastComponent } from './request/broadcast/broadcast.component';
import { FillARequestComponent } from './request/fill-a-request/fill-a-request.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const entityId = XrmEntities.LightIndustrialRequest,
	routes: Routes = [
		{
			path: '',
			component: CoreLightIndustrialComponent,
			children: [
				{
					path: '',
					pathMatch: 'full',
					redirectTo: 'list'
				},
				{
					path: 'add-edit',
					component: AddEditComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: 'Create', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'add-edit/:uKey',
					component: AddEditComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: 'Edit', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'view/:uKey',
					component: LiViewComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: 'View', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'list',
					component: ListComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: { skip: true }, entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'list/:param1',
					component: ListComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: { skip: true }, entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'review-request/:uKey',
					component: ReviewRequestComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: 'ReviewRequest', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'broadcast/:uKey',
					component: BroadcastComponent,
					title: 'LightIndustrialRequest',
					data: { title: 'LightIndustrialRequest', breadcrumb: 'Broadcast', entityId: entityId },
					canActivate: [RouteGuard]
				},
				{
					path: 'fill-a-request/:uKey',
					component: FillARequestComponent,
					title: 'FillARequest',
					data: { title: 'FillARequest', breadcrumb: 'FillARequest', entityId: entityId },
					canActivate: [RouteGuard]
				}
			]
		}
	];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LightIndustrialRoutingModule { }
