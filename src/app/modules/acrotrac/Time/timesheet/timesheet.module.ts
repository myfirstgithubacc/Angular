import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@xrm-shared/shared.module';
import { TimesheetRoutingModule } from './timesheet-routing.module';
import { CoreTimesheetComponent } from './core-timesheet.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ViewComponent } from './view/view.component';
import { TimeConversionGuideComponent } from './time-conversion-guide/time-conversion-guide.component';
import { AcrotracCommonModule } from '../../common/acrotracCommon.module';
import { ExpendedTimesheetDetailsComponent } from './expended-timesheet-details/expended-timesheet-details.component';
import { AdjustmentManualComponent } from './adjustment-manual/adjustment-manual.component';
import { TimesheetReviewComponent } from './timesheet-review/timesheet-review.component';
import { AdjustmentReviewComponent } from './adjustment-review/adjustment-review.component';
import { WeekendingDropdownComponent } from './weekending-dropdown/weekending-dropdown/weekending-dropdown.component';
import { ExpandedTimeadjustmentComponent } from './expanded-timeadjustment/expanded-timeadjustment.component';
import { InOutViewComponent } from './in-out-view/in-out-view.component';

@NgModule({
	declarations: [
		CoreTimesheetComponent,
		ListComponent,
		AddEditComponent,
		ViewComponent,
		TimeConversionGuideComponent,
		ExpendedTimesheetDetailsComponent,
		AdjustmentManualComponent,
		TimesheetReviewComponent,
		AdjustmentReviewComponent,
  	WeekendingDropdownComponent,
		ExpandedTimeadjustmentComponent,
		InOutViewComponent
	],
	imports: [
		CommonModule,
		TimesheetRoutingModule,
		AcrotracCommonModule,
		SharedModule
	],
	exports: [
		TimeConversionGuideComponent,
		ExpendedTimesheetDetailsComponent,
		InOutViewComponent
	]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TimesheetModule { }
