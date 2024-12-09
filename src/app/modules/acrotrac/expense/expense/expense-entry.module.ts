import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { ExpenseRoutingModule } from './expense-entry-routing.module';
import { CoreExpenseEntryComponent } from './core-expense-entry.component';
import { ViewComponent } from './view/view.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ExpenseDetailsComponent } from '../../common/expense-details/expense-details.component';
import { ViewReviewComponent } from '../../common/view-review/view-review.component';
import { ReviewComponent } from './review/review.component';
import { AcrotracCommonModule } from '../../common/acrotracCommon.module';


@NgModule({
	declarations: [
		CoreExpenseEntryComponent,
		AddEditComponent,
		ListComponent,
		ViewComponent,
		ExpenseDetailsComponent,
		ViewReviewComponent,
		ReviewComponent
	],
	imports: [
		CommonModule,
		ExpenseRoutingModule,
		SharedModule,
		AcrotracCommonModule
	]
})
export class ExpenseEntryModule { }
