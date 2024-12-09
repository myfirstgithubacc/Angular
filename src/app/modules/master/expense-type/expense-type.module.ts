import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseTypeRoutingModule } from './expense-type-routing.module';
import { CoreExpenseTypeComponent } from './core-expense-type.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { SharedModule } from "../../../shared/shared.module";
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';


@NgModule({
	declarations: [
		CoreExpenseTypeComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent
	],
	imports: [
		CommonModule,
		ExpenseTypeRoutingModule,
		SharedModule
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ExpenseTypeModule { }
