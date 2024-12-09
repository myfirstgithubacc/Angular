import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { CoreMessageComponent } from './core-message.component';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreMessageComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'view',
				component: ViewComponent,
				title: 'Messages',
				data: { title: 'Messages', breadcrumb: 'View', entityId: XrmEntities.RecentAlerts}
			},
			{
				path: 'view/:id',
				component: ViewComponent,
				title: 'Messages',
				data: { title: 'Messages', breadcrumb: 'View', entityId: XrmEntities.RecentAlerts}
			},
			{
				path: 'list',
				component: ListComponent,
				title: 'Messages',
				data: { title: 'Messages', breadcrumb: { skip: true }, entityId: XrmEntities.RecentAlerts}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MessageRoutingModule { }
