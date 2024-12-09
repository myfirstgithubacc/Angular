import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';

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
		title: 'CostAccountingCode',
		data: { title: 'CostAccountingCode', breadcrumb: { skip: true }, entityId: XrmEntities.CostAccountingCode },
		canActivate: [RouteGuard]
	},
	{
		path: 'add-edit',
		loadComponent: () =>
			import('./add-edit/add-edit.component').then((m) =>
				 m.AddEditComponent),
		title: 'CostAccountingCode',
		data: { title: 'CostAccountingCode', breadcrumb: 'Add', entityId: XrmEntities.CostAccountingCode },
		canActivate: [RouteGuard]
	},
	{
		path: 'add-edit/:id',
		loadComponent: () =>
			import('./core-cost-accounting-code.component').then((m) =>
				 m.CoreCostAccountingCodeComponent),
		children: [
			{ path: '', loadComponent: () =>
				import('./add-edit/add-edit.component').then((m) =>
					m.AddEditComponent)
			}
		],
		title: 'CostAccountingCode',
		data: { title: 'CostAccountingCode', breadcrumb: 'Edit', entityId: XrmEntities.CostAccountingCode },
		canActivate: [RouteGuard]
	},
	{
		path: 'view/:id',
		loadComponent: () =>
			import('./core-cost-accounting-code.component').then((m) =>
				 m.CoreCostAccountingCodeComponent),
		children: [
			{ path: '', loadComponent: () =>
				import('./view/view.component').then((m) =>
					m.ViewComponent)
			}
		],
		title: 'CostAccountingCode',
		data: { title: 'CostAccountingCode', breadcrumb: 'View', entityId: XrmEntities.CostAccountingCode },
		canActivate: [RouteGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class CostAccountingCodeRoutingModule { }
