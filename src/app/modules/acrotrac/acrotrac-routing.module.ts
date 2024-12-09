import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreActrotracComponent } from './core-acrotrac.component';

const routes: Routes = [
	{
		path: '',
		component: CoreActrotracComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'expense' },
			{
				path: 'expense',
				data: { breadcrumb: 'Expense', title: 'ExpenseEntry' },
				loadChildren: () =>
					import('./expense/expense/expense-entry.module').then((m) =>
						m.ExpenseEntryModule)
			},
			{
				path: 'timesheet',
				data: { breadcrumb: 'Timesheet', title: 'Timesheet' },
				loadChildren: () =>
					import('./Time/timesheet/timesheet.module').then((m) =>
						m.TimesheetModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ActrotracRoutingModule { }
