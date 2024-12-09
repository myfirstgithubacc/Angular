import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { CoreExpenseTypeComponent } from './core-expense-type.component';
import { RouteConfigGenerator } from '../../route-config-generator';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
const routes: Routes = [
	{
		path: '',
		component: CoreExpenseTypeComponent,
		children: RouteConfigGenerator.getMasterModuleRouteConfig(ListComponent, ViewComponent, AddEditComponent, 'ExpenseType', XrmEntities.ExpenseType)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ExpenseTypeRoutingModule { }
