import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { TimeAndExpenseStatusBarComponent } from './time-and-expense-status-bar/time-and-expense-status-bar.component';
import { OtherApproversLineItemsComponent } from './other-approvers-line-items/other-approvers-line-items.component';
import { TimeInOutComponent } from './time-in-out/time-in-out.component';
@NgModule({
	declarations: [FilterSidebarComponent, TimeAndExpenseStatusBarComponent, OtherApproversLineItemsComponent, TimeInOutComponent],
	imports: [CommonModule, SharedModule],
	exports: [FilterSidebarComponent, TimeAndExpenseStatusBarComponent, OtherApproversLineItemsComponent, TimeInOutComponent]
})
export class AcrotracCommonModule { }
