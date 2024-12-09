import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreExpenseEntryComponent } from './core-expense-entry.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { RouteConfigGenerator } from 'src/app/modules/route-config-generator';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { ReviewComponent } from './review/review.component';
import { RouteGuard } from '@xrm-core/guards/route-guard.guard';

const routes: Routes = [

	{
		path: '',
		component: CoreExpenseEntryComponent,
		children: RouteConfigGenerator.getMasterModuleRouteConfig(ListComponent, ViewComponent, AddEditComponent, 'Expense', XrmEntities.Expense, 'Create')
	}

];
routes[0].children?.push({
	path: 'review/:id',
	component: ReviewComponent,
	title: 'Expense',
	data: { title: 'Expense', breadcrumb: 'Review', entityId: 36 },
	canActivate: [RouteGuard]
});

routes[0].children?.push(			{
	path: 'list/:id',
	component: ListComponent,
	title: 'Expense',
	data: { title: 'Expense', breadcrumb: { skip: true }, entityId: 36 },
	canActivate: [RouteGuard]
});
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ExpenseRoutingModule { }
