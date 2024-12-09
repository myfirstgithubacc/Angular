import { CanDeactivateGuard } from "@xrm-core/guards/can-deactivate.guard";
import { RouteGuard } from "@xrm-core/guards/route-guard.guard";

export class RouteConfigGenerator {

	// eslint-disable-next-line max-params
	static getMasterModuleRouteConfig(
		listComponent: any, viewComponent: any, addEditComponent: any,
		title: string = '', entityId: any, addBreadcrumb?: string
	): any {
		return [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: listComponent,
				title: title,
				data: { title: title, breadcrumb: { skip: true }, entityId: entityId },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: viewComponent,
				title: title,
				data: { title: title, breadcrumb: 'View', entityId: entityId },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: addEditComponent,
				title: title,
				data: { title: title, breadcrumb: addBreadcrumb ?? 'Add', entityId: entityId },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit/:id',
				component: addEditComponent,
				title: title,
				data: { title: title, breadcrumb: 'Edit', entityId: entityId },
				canActivate: [RouteGuard]
			}
		];
	}

	static getMasterModuleRouteConfigWithCanDeactivate(
		listComponent: any, viewComponent: any, addEditComponent: any,
		name: string = '', title: string = '', entityId: any
	): any {
		return [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: listComponent,
				title: title,
				data: { title: title, breadcrumb: { skip: true }, entityId: entityId },
				canActivate: [RouteGuard]
			},
			{
				path: 'view/:id',
				component: viewComponent,
				title: title,
				data: { title: title, breadcrumb: 'View', entityId: entityId },
				canActivate: [RouteGuard]
			},
			{
				path: 'add-edit',
				component: addEditComponent,
				title: title,
				data: { title: title, breadcrumb: 'Add', name: name, entityId: entityId },
				canActivate: [RouteGuard],
				canDeactivate: [CanDeactivateGuard]
			},
			{
				path: 'add-edit/:id',
				component: addEditComponent,
				title: title,
				data: { title: title, breadcrumb: 'Edit', entityId: entityId },
				canActivate: [RouteGuard]
			}
		];
	}
}

