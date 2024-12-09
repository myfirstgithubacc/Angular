import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignmentDetailsRoutingModule } from './assignment-details-routing.module';
import { ViewComponent } from './view/view.component';
import { EditComponent } from './edit/edit.component';
import { SharedModule } from '@xrm-shared/shared.module';
import { PositionDetailsComponent } from './edit/position-details/position-details.component';
import { PODetailsComponent } from './edit/po-details/po-details.component';
import { RateDetailsComponent } from './edit/rate-details/rate-details.component';
import { CostAccountingCodeComponent } from './edit/cost-accounting-code/cost-accounting-code.component';
import { TimeComponent } from './edit/time/time.component';
import { ShiftSchedulerComponent } from './shift-scheduler/shift-scheduler.component';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { LiSharedComponentsModule } from '../../job-order/light-industrial/LiShared-components.module';
import { LiRequestQuickViewComponent } from './edit/li-request-quick-view/li-request-quick-view.component';

@NgModule({
	declarations: [
		ViewComponent,
		EditComponent,
		PositionDetailsComponent,
		PODetailsComponent,
		RateDetailsComponent,
		TimeComponent,
		ShiftSchedulerComponent,
		CostAccountingCodeComponent,
  	LiRequestQuickViewComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		AssignmentDetailsRoutingModule,
		SchedulerModule,
		LiSharedComponentsModule
	]
})
export class AssignmentDetailsModule { }
