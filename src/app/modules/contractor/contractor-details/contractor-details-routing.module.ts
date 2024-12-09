import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreContractorDetailsComponent } from './core-contractor-details.component';
import { ContractorListComponent } from './contractor-list/contractor-list.component';
import { ContractorViewComponent } from './contractor-view/contractor-view.component';
import { ContractorAddEditComponent } from './contractor-add-edit/contractor-add-edit.component';
import { TimeExpenseListComponent } from './time-expense/list/list.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';

const routes: Routes = [
	{
		path: '',
		component: CoreContractorDetailsComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'list'
			},
			{
				path: 'list',
				component: ContractorListComponent,
				title: 'Contractor',
				data: { title: 'ContractorDetails', breadcrumb: {skip: true}, entityId: XrmEntities.Contractor },
				canActivate: [RouteGuard]
			},
			{
				path: 'list/:id',
				component: ContractorListComponent,
				title: 'Contractor',
				data: { title: 'ContractorDetails', breadcrumb: {skip: true}, entityId: XrmEntities.Contractor }
			},

			{
				path: 'view',
				component: ContractorViewComponent,
				title: 'Contractor',
				data: { title: 'ContractorDetails', breadcrumb: 'View', entityId: XrmEntities.Contractor }
			},
			{
				path: 'view/:id',
				component: ContractorViewComponent,
				title: 'Contractor',
				data: { title: 'ContractorDetails', breadcrumb: 'View', entityId: XrmEntities.Contractor }
			},


			{
				path: 'add-edit',
				component: ContractorAddEditComponent,
				title: 'Contractor',
				data: { title: 'ContractorDetails', breadcrumb: 'Edit' }
			},
			{
				path: 'add-edit/:id',
				component: ContractorAddEditComponent,
				title: 'Contractor',
				data: { title: 'ContractorDetails', breadcrumb: 'Edit', entityId: XrmEntities.Contractor }
			},
			{
				path: 'time-expense-list',
				component: TimeExpenseListComponent,
				title: 'Time and Expense Details',
				data: { title: 'TimeandExpenseDetails', breadcrumb: {skip: true} }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ContractorDetailsRoutingModule { }
