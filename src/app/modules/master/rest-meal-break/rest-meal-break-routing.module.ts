import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { CanDeactivateGuard } from '@xrm-core/guards/can-deactivate.guard';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'list'
	},
	{
		path: 'list',
		loadComponent: () =>
			import('./list/list.component').then((m) =>
				 m.ListComponent),
		title: 'RestOrMealBreakConfiguration',
		data: { title: 'RestOrMealBreakConfiguration', breadcrumb: { skip: true }, entityId: XrmEntities.RestOrMealBreakConfiguration },
		canActivate: [RouteGuard]
	},
	{
		path: 'add-edit',
		loadComponent: () =>
			import('./add-edit/add-edit.component').then((m) =>
				 m.AddEditComponent),
		title: 'RestOrMealBreakConfiguration',
		data: { title: 'RestOrMealBreakConfiguration', breadcrumb: 'Add', entityId: XrmEntities.RestOrMealBreakConfiguration },
		canActivate: [RouteGuard],
		canDeactivate: [CanDeactivateGuard]
	},
	{
		path: 'add-edit/:id',
		loadComponent: () =>
			import('./core-rest-meal-break.component').then((m) =>
				 m.CoreRestMealBreakComponent),
		children: [
			{ path: '', loadComponent: () =>
				import('./add-edit/add-edit.component').then((m) =>
					m.AddEditComponent)
			}
		],
		title: 'RestOrMealBreakConfiguration',
		data: { title: 'RestOrMealBreakConfiguration', breadcrumb: 'Edit', entityId: XrmEntities.RestOrMealBreakConfiguration },
		canActivate: [RouteGuard]
	},
	{
		path: 'view/:id',
		loadComponent: () =>
			import('./core-rest-meal-break.component').then((m) =>
				 m.CoreRestMealBreakComponent),
		children: [
			{ path: '', loadComponent: () =>
				import('./view/view.component').then((m) =>
					m.ViewComponent)
			}
		],
		title: 'RestOrMealBreakConfiguration',
		data: { title: 'RestOrMealBreakConfiguration', breadcrumb: 'View', entityId: XrmEntities.RestOrMealBreakConfiguration },
		canActivate: [RouteGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class RestMealBreakRoutingModule { }
